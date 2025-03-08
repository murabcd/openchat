import { type Message, createDataStreamResponse, smoothStream, streamText } from "ai";

import { myProvider } from "@/lib/ai/models";
import { generateTitleFromUserMessage } from "@/lib/ai/utils";
import { systemPrompt } from "@/lib/ai/prompts";

import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from "@/lib/utils";

import { createDocument } from "@/lib/ai/tools/create-document";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { getWeather } from "@/lib/ai/tools/get-weather";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const maxDuration = 60;

export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedChatModel,
  }: { id: string; messages: Array<Message>; selectedChatModel: string } =
    await request.json();

  const token = await convexAuthNextjsToken().catch(() => null);
  const user = token
    ? await fetchQuery(api.users.getUser, {}, { token }).catch(() => null)
    : null;

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userMessage = getMostRecentUserMessage(messages);
  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  const chat = await fetchQuery(api.chats.getChatById, { chatId: id });
  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await fetchMutation(api.chats.saveChat, {
      title,
      chatId: id,
      userId: user._id,
      visibility: "private",
    });
  }

  await fetchMutation(api.messages.saveMessages, {
    messages: [
      {
        messageId: userMessage.id,
        chatId: id,
        role: userMessage.role as "user" | "assistant",
        content: userMessage.content,
        experimental_attachments: (userMessage as any).experimental_attachments,
      },
    ],
  });

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: myProvider.languageModel(selectedChatModel),
        system: systemPrompt({ selectedChatModel }),
        messages,
        maxSteps: 5,
        experimental_activeTools:
          selectedChatModel === "chat-model-reasoning"
            ? []
            : ["getWeather", "createDocument", "updateDocument", "requestSuggestions"],
        experimental_transform: smoothStream({ chunking: "word" }),
        experimental_generateMessageId: generateUUID,
        experimental_telemetry: {
          isEnabled: true,
          functionId: "stream-text",
        },
        tools: {
          getWeather,
          createDocument: createDocument({ user, dataStream }),
          updateDocument: updateDocument({ user, dataStream }),
          requestSuggestions: requestSuggestions({ user, dataStream }),
        },
        onFinish: async ({ response, reasoning }) => {
          if (user) {
            try {
              const sanitizedResponseMessages = sanitizeResponseMessages({
                messages: response.messages,
                reasoning,
              });

              await fetchMutation(api.messages.saveMessages, {
                messages: sanitizedResponseMessages.map((message) => ({
                  messageId: message.id,
                  chatId: id,
                  role: message.role as "user" | "assistant",
                  content: message.content,
                  experimental_attachments: (message as any).experimental_attachments,
                })),
              });
            } catch (error) {
              console.error("Failed to save chat messages:", error);
            }
          }
        },
      });

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError: () => {
      return "Oops, an error occurred";
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const token = await convexAuthNextjsToken().catch(() => null);
  const user = token
    ? await fetchQuery(api.users.getUser, {}, { token }).catch(() => null)
    : null;

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await fetchQuery(api.chats.getChatById, { chatId: id });
    if (!chat || chat.userId !== user._id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await fetchMutation(api.chats.deleteChatById, { id });
    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
