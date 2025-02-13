import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  streamText,
  streamObject,
} from "ai";

import { z } from "zod";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from "@/lib/utils";
import { customModel } from "@/lib/ai";
import { DEFAULT_MODEL_NAME, models } from "@/lib/ai/models";
import { systemPrompt, codePrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { generateTitleFromUserMessage } from "@/lib/ai/utils";

export const maxDuration = 60;

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type AllowedTools =
  | "createDocument"
  | "updateDocument"
  | "requestSuggestions"
  | "getWeather";

const blocksTools: AllowedTools[] = [
  "createDocument",
  "updateDocument",
  "requestSuggestions",
];

const weatherTools: AllowedTools[] = ["getWeather"];

const allTools: AllowedTools[] = [...blocksTools, ...weatherTools];

export async function POST(req: Request) {
  console.log("[CHAT] POST request received");

  try {
    const {
      messages,
      id: chatId,
      modelId = DEFAULT_MODEL_NAME,
    }: {
      messages: Array<Message>;
      id: string;
      modelId?: string;
    } = await req.json();

    console.log("[CHAT] Request parsed:", {
      chatId,
      modelId,
      messageCount: messages.length,
    });

    const model = models.find((model) => model.id === modelId);
    console.log("[CHAT] Model found:", { modelId, found: !!model });

    if (!model) {
      console.log("[CHAT] Model not found error");
      return new Response("Model not found", { status: 404 });
    }

    const token = await convexAuthNextjsToken().catch(() => null);
    console.log("[CHAT] Auth token retrieved:", { hasToken: !!token });

    const user = token
      ? await fetchQuery(api.users.getUser, {}, { token }).catch(() => null)
      : null;
    console.log("[CHAT] User retrieved:", { hasUser: !!user });

    const coreMessages = convertToCoreMessages(messages);
    const userMessage = getMostRecentUserMessage(coreMessages);
    console.log("[CHAT] User message found:", { hasUserMessage: !!userMessage });

    if (!userMessage) {
      console.log("[CHAT] No user message found error");
      return new Response("No user message found", { status: 400 });
    }

    // Save chat if it doesn't exist
    if (user) {
      const chat = await convex.query(api.chats.getChatById, { chatId });

      if (!chat) {
        const title = await generateTitleFromUserMessage({ message: userMessage });
        await convex.mutation(api.chats.createChat, {
          title,
          chatId,
          userId: user._id,
          visibility: "private",
        });
      }
    }

    // Generate ID first
    const userMessageId = generateUUID();

    // Save user message first
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    await convex.mutation(api.chats.saveMessages, {
      messages: [
        {
          id: userMessageId,
          chatId,
          role: "user",
          content:
            typeof userMessage.content === "string"
              ? userMessage.content
              : JSON.stringify(userMessage.content),
          userId: user._id,
        },
      ],
    });

    return createDataStreamResponse({
      execute: async (dataStream) => {
        dataStream.writeData({
          type: "user-message-id",
          content: userMessageId,
        });

        const result = streamText({
          model: customModel(model.apiIdentifier),
          system: systemPrompt,
          messages: coreMessages,
          maxSteps: 5,
          experimental_activeTools: allTools,
          tools: {
            getWeather: {
              description: "Get the current weather at a location",
              parameters: z.object({
                latitude: z.number(),
                longitude: z.number(),
              }),
              execute: async ({ latitude, longitude }) => {
                const response = await fetch(
                  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`
                );
                const weatherData = await response.json();
                return weatherData;
              },
            },
            createDocument: {
              description:
                "Create a document for a writing activity. This tool will call other functions that will generate the contents of the document based on the title and kind.",
              parameters: z.object({
                title: z.string(),
                kind: z.enum(["text", "code"]),
              }),
              execute: async ({ title, kind }) => {
                const id = generateUUID();
                let draftText = "";

                dataStream.writeData({
                  type: "id",
                  content: id,
                });

                dataStream.writeData({
                  type: "title",
                  content: title,
                });

                dataStream.writeData({
                  type: "kind",
                  content: kind,
                });

                dataStream.writeData({
                  type: "clear",
                  content: "",
                });

                if (kind === "text") {
                  const { fullStream } = streamText({
                    model: customModel(model.apiIdentifier),
                    system:
                      "Write about the given topic. Markdown is supported. Use headings wherever appropriate.",
                    prompt: title,
                  });

                  for await (const delta of fullStream) {
                    if (delta.type === "text-delta") {
                      draftText += delta.textDelta;
                      dataStream.writeData({
                        type: "text-delta",
                        content: delta.textDelta,
                      });
                    }
                  }
                } else if (kind === "code") {
                  const { fullStream } = streamObject({
                    model: customModel(model.apiIdentifier),
                    system: codePrompt,
                    prompt: title,
                    schema: z.object({
                      code: z.string(),
                    }),
                  });

                  for await (const delta of fullStream) {
                    if (delta.type === "object") {
                      const { code } = delta.object;
                      if (code) {
                        dataStream.writeData({
                          type: "code-delta",
                          content: code,
                        });
                        draftText = code;
                      }
                    }
                  }
                }

                dataStream.writeData({ type: "finish", content: "" });

                if (user) {
                  await convex.mutation(api.documents.createDocument, {
                    id,
                    title,
                    kind,
                    content: draftText,
                    userId: user._id,
                  });
                }

                return {
                  id,
                  title,
                  kind,
                  content: "A document was created and is now visible to the user.",
                };
              },
            },
            updateDocument: {
              description: "Update a document with the given description.",
              parameters: z.object({
                id: z.string().describe("The ID of the document to update"),
                description: z.string().describe("The description of changes to make"),
              }),
              execute: async ({ id, description }) => {
                if (!user) return { error: "Authentication required" };

                const document = await convex.query(api.documents.getDocumentById, {
                  id,
                });

                if (!document) {
                  return { error: "Document not found" };
                }

                let draftText = "";

                dataStream.writeData({
                  type: "clear",
                  content: document.title,
                });

                if (document.kind === "text") {
                  const { fullStream } = streamText({
                    model: customModel(model.apiIdentifier),
                    system: updateDocumentPrompt(document.content),
                    prompt: description,
                  });

                  for await (const delta of fullStream) {
                    if (delta.type === "text-delta") {
                      draftText += delta.textDelta;
                      dataStream.writeData({
                        type: "text-delta",
                        content: delta.textDelta,
                      });
                    }
                  }
                } else if (document.kind === "code") {
                  const { fullStream } = streamObject({
                    model: customModel(model.apiIdentifier),
                    system: updateDocumentPrompt(document.content),
                    prompt: description,
                    schema: z.object({
                      code: z.string(),
                    }),
                  });

                  for await (const delta of fullStream) {
                    if (delta.type === "object") {
                      const { code } = delta.object;
                      if (code) {
                        dataStream.writeData({
                          type: "code-delta",
                          content: code,
                        });
                        draftText = code;
                      }
                    }
                  }
                }

                dataStream.writeData({ type: "finish", content: "" });

                await convex.mutation(api.documents.updateDocument, {
                  id,
                  content: draftText,
                  userId: user._id,
                });

                return {
                  id,
                  title: document.title,
                  kind: document.kind,
                  content: "Document updated successfully",
                };
              },
            },
            requestSuggestions: {
              description: "Request suggestions for a document",
              parameters: z.object({
                documentId: z
                  .string()
                  .describe("The ID of the document to request edits"),
              }),
              execute: async ({ documentId }) => {
                if (!user) return { error: "Authentication required" };

                const document = await convex.query(api.documents.getDocumentById, {
                  id: documentId,
                });

                if (!document) {
                  return { error: "Document not found" };
                }

                const suggestions = [];

                const { elementStream } = streamObject({
                  model: customModel(model.apiIdentifier),
                  system:
                    "Provide suggestions to improve the writing. Max 5 suggestions.",
                  prompt: document.content,
                  output: "array",
                  schema: z.object({
                    originalSentence: z.string(),
                    suggestedSentence: z.string(),
                    description: z.string(),
                  }),
                });

                for await (const element of elementStream) {
                  const suggestion = {
                    originalText: element.originalSentence,
                    suggestedText: element.suggestedSentence,
                    description: element.description,
                    id: generateUUID(),
                    documentId,
                    isResolved: false,
                  };

                  dataStream.writeData({
                    type: "suggestion",
                    content: suggestion,
                  });

                  suggestions.push(suggestion);
                }

                await convex.mutation(api.documents.saveSuggestions, {
                  suggestions: suggestions.map((suggestion) => ({
                    ...suggestion,
                    userId: user._id,
                    createdAt: Date.now(),
                  })),
                });

                return {
                  id: documentId,
                  title: document.title,
                  kind: document.kind,
                  message: "Suggestions have been added",
                };
              },
            },
          },
          onFinish: async ({ response }) => {
            if (user) {
              try {
                const responseMessagesWithoutIncompleteToolCalls =
                  sanitizeResponseMessages(response.messages);

                await convex.mutation(api.chats.saveMessages, {
                  messages: responseMessagesWithoutIncompleteToolCalls.map((message) => {
                    const messageId = generateUUID();

                    if (message.role === "assistant") {
                      dataStream.writeMessageAnnotation({
                        messageIdFromServer: messageId,
                      });
                    }

                    let content = message.content;
                    if (Array.isArray(content)) {
                      // Extract text from array of message parts
                      content = content
                        .filter((part) => part.type === "text")
                        .map((part) => part.text)
                        .join("");
                    }

                    return {
                      id: messageId,
                      chatId,
                      role: message.role === "tool" ? "assistant" : message.role,
                      content: content,
                      userId: user._id,
                    };
                  }),
                });
              } catch (error) {
                console.error("Failed to save chat messages:", error);
              }
            }
          },
        });

        await result.mergeIntoDataStream(dataStream);
      },
    });
  } catch (error) {
    console.error("An error occurred while processing the request:", error);
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
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
    const chat = await convex.query(api.chats.getChatById, { chatId: id });

    if (!chat || chat.userId !== user._id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await convex.mutation(api.chats.deleteChatById, { id });
    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
