import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { CoreMessage } from "ai";

export async function generateTitleFromUserMessage({
  message,
}: {
  message: CoreMessage;
}): Promise<string> {
  const content =
    typeof message.content === "string"
      ? message.content
      : Array.isArray(message.content)
        ? message.content.map((part) => ("text" in part ? part.text : "")).join(" ")
        : "";

  const { text: generatedTitle } = await generateText({
    model: openai("gpt-4o-mini"),
    system: `
      - Generate a short title based on the first message a user begins a conversation with
      - Ensure it is not more than 20 characters long
      - The title should be a summary of the user's message
      - Only capitalize the first word
      - Do not use quotes or colons
    `,
    messages: [{ role: "user", content }],
  });

  return generatedTitle;
}
