import { Chat } from "@/components/chat";

import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { convertToUIMessages } from "@/lib/utils";

export default async function ChatPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id: chatId } = params;

  const messagesFromDb = await fetchQuery(api.chats.getChatMessages, { chatId });

  return (
    <Chat chatId={chatId} initialMessages={convertToUIMessages(messagesFromDb || [])} />
  );
}
