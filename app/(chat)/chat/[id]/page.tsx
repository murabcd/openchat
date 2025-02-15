import { cookies } from "next/headers";

import { Chat } from "@/components/chat";

import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

import { convertToUIMessages } from "@/lib/utils";
import { models } from "@/lib/ai/models";
import { DEFAULT_MODEL_NAME } from "@/lib/ai/models";

export default async function ChatPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id: chatId } = params;

  const messagesFromDb = await fetchQuery(api.chats.getChatMessages, { chatId });

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("model-id")?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id || DEFAULT_MODEL_NAME;

  return (
    <Chat
      id={chatId}
      initialMessages={convertToUIMessages(messagesFromDb)}
      selectedModelId={selectedModelId}
      selectedVisibilityType="private"
      isReadonly={false}
    />
  );
}
