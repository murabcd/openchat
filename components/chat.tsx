"use client";

import { useState } from "react";
import type { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

import { ChatHeader } from "./chat-header";
import { Messages } from "@/components/messages";
import { MultiModalInput } from "@/components/multi-modal-input";
import type { VisibilityType } from "@/components/visibility-selector";

interface ChatProps {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}

export const Chat = ({
  id,
  initialMessages,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
}: ChatProps) => {
  // Use the Doc type from Convex for votes
  const votes =
    (useQuery(api.chats.getVotesByChatId, { chatId: id }) as
      | Doc<"votes">[]
      | undefined) || [];

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    isLoading,
    stop,
    append,
    reload,
  } = useChat({
    id,
    body: { id, modelId: selectedModelId },
    initialMessages,
    experimental_throttle: 100,
  });

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedModelId}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          messages={messages}
          isLoading={isLoading}
          setMessages={setMessages}
          isReadonly={isReadonly}
          votes={votes}
          reload={reload}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultiModalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
      </div>
    </>
  );
};
