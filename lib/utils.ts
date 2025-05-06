import type { Attachment, CoreAssistantMessage, CoreToolMessage, UIMessage } from "ai";
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

export function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
  return messages.map((message) => ({
    id: message.messageId,
    role: message.role as UIMessage["role"],
    parts: message.parts as UIMessage["parts"],
    content: "",
    createdAt: new Date(message._creationTime),
    experimental_attachments: (message.attachments as Array<Attachment>) ?? [],
  }));
}

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function getMostRecentUserMessage(messages: Array<UIMessage>) {
  const userMessages = messages.filter((message) => message.role === "user");
  return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(documents: Array<DBDocument>, index: number) {
  if (!documents) return new Date();
  if (index > documents.length) return new Date();

  return documents[index]._creationTime;
}

export function getTrailingMessageId({
  messages,
}: {
  messages: Array<ResponseMessage>;
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}
