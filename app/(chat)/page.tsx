import { cookies } from "next/headers";

import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";

import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";

import { getCurrentUser } from "@/lib/auth";

export default async function Page() {
  const id = generateUUID();

  const user = await getCurrentUser();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");

  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedVisibilityType="private"
          isReadonly={false}
          isChatSelected={false}
          user={user}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedChatModel={modelIdFromCookie.value}
        selectedVisibilityType="private"
        isReadonly={false}
        isChatSelected={false}
        user={user}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
