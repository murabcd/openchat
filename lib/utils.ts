import type { CoreAssistantMessage, CoreToolMessage, Message, ToolInvocation } from "ai";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Doc } from "@/convex/_generated/dataModel";

type DBMessage = Doc<"messages">;
type DBDocument = Doc<"documents">;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreToolMessage;
  messages: Array<Message>;
}): Array<Message> {
  return messages.map((message) => {
    if (message.toolInvocations) {
      return {
        ...message,
        toolInvocations: message.toolInvocations.map((toolInvocation) => {
          const toolResult = toolMessage.content.find(
            (tool) => tool.toolCallId === toolInvocation.toolCallId
          );
          if (toolResult) {
            return {
              ...toolInvocation,
              state: "result",
              result: toolResult.result,
            };
          }
          return toolInvocation;
        }),
      };
    }
    return message;
  });
}

export function convertToUIMessages(messages: Array<DBMessage>): Array<Message> {
  return messages.reduce((chatMessages: Array<Message>, message) => {
    if (message.role === "tool") {
      return addToolMessageToChat({
        toolMessage: message as unknown as CoreToolMessage,
        messages: chatMessages,
      });
    }

    let textContent = "";
    let reasoning: string | undefined = undefined;
    const toolInvocations: Array<ToolInvocation> = [];

    if (typeof message.content === "string") {
      textContent = message.content;
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === "text") {
          textContent += content.text;
        } else if (
          content.type === "tool-call" &&
          content.toolCallId &&
          content.toolName &&
          content.args
        ) {
          toolInvocations.push({
            state: "call",
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            args: content.args,
          });
        } else if (content.type === "reasoning") {
          reasoning = content.reasoning;
        }
      }
    }

    chatMessages.push({
      id: message.id,
      role: message.role as Message["role"],
      content: textContent,
      reasoning,
      toolInvocations,
    });

    return chatMessages;
  }, []);
}

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function sanitizeResponseMessages({
  messages,
  reasoning,
}: {
  messages: Array<ResponseMessage>;
  reasoning?: string;
}) {
  const toolResultIds: Array<string> = [];

  // Collect tool result IDs
  for (const message of messages) {
    if (message.role === "tool") {
      for (const content of message.content) {
        if (content.type === "tool-result") {
          toolResultIds.push(content.toolCallId);
        }
      }
    }
  }

  return messages
    .filter(
      (message) =>
        (message.role as string) === "user" || (message.role as string) === "assistant"
    )
    .map((message) => {
      let textContent = "";
      let toolInvocations: Array<ToolInvocation> = [];

      if (typeof message.content === "string") {
        textContent = message.content;
      } else if (Array.isArray(message.content)) {
        for (const content of message.content) {
          if (content.type === "text") {
            textContent += content.text;
          } else if (content.type === "tool-call") {
            toolInvocations.push({
              state: "call",
              toolCallId: content.toolCallId,
              toolName: content.toolName,
              args: content.args,
            });
          }
        }
      }

      return {
        ...message,
        content: textContent,
        toolInvocations: toolInvocations.length > 0 ? toolInvocations : undefined,
        reasoning,
      };
    })
    .filter((message) => message.content.length > 0);
}

export function sanitizeUIMessages(messages: Array<Message>): Array<Message> {
  const messagesBySanitizedToolInvocations = messages.map((message) => {
    if (message.role !== "assistant") return message;
    if (!message.toolInvocations) return message;

    const toolResultIds: Array<string> = [];
    for (const toolInvocation of message.toolInvocations) {
      if (toolInvocation.state === "result") {
        toolResultIds.push(toolInvocation.toolCallId);
      }
    }

    const sanitizedToolInvocations = message.toolInvocations.filter(
      (toolInvocation) =>
        toolInvocation.state === "result" ||
        toolResultIds.includes(toolInvocation.toolCallId)
    );

    return {
      ...message,
      toolInvocations: sanitizedToolInvocations,
    };
  });

  return messagesBySanitizedToolInvocations.filter(
    (message) =>
      message.content.length > 0 ||
      (message.toolInvocations && message.toolInvocations.length > 0)
  );
}

export function getMostRecentUserMessage(messages: Array<Message> | undefined) {
  if (!messages || !Array.isArray(messages)) {
    return undefined;
  }
  const userMessages = messages.filter((message) => message.role === "user");
  return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(documents: Array<DBDocument>, index: number) {
  if (!documents) return Date.now();
  if (index > documents.length) return Date.now();
  return documents[index].createdAt;
}
