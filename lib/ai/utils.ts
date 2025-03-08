"use server";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { Message } from "ai";

import { cookies } from "next/headers";

import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

export async function getSuggestions({ documentId }: { documentId: string }) {
  const suggestions = await fetchQuery(api.suggestions.getSuggestionsByDocumentId, {
    documentId,
  });
  return suggestions ?? [];
}

export async function generateTitleFromUserMessage({ message }: { message: Message }) {
  const { text: title } = await generateText({
    model: openai("gpt-4o-mini"),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}
