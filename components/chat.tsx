"use client";

import { useState } from "react";

import type { Attachment, UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";

import { generateUUID } from "@/lib/utils";

import { toast } from "sonner";

import { useBlockSelector } from "@/hooks/use-block";

import { Block } from "@/components/block";
import { ChatHeader } from "@/components/chat-header";
import { Messages } from "@/components/messages";
import { MultiModalInput } from "@/components/multi-modal-input";
import type { VisibilityType } from "@/components/visibility-selector";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

interface ChatProps {
  id: string;
  initialMessages: Array<UIMessage>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  isChatSelected: boolean;
  user: Doc<"users"> | null;
}

export const Chat = ({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
  isChatSelected,
  user,
}: ChatProps) => {
  const votes = useQuery(api.chats.getVotesByChatId, { chatId: id }) || [];

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    status,
    stop,
    append,
    reload,
  } = useChat({
    id,
    body: { id, selectedChatModel: selectedChatModel },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      // Could add Convex mutation here if needed
    },
    onError: () => {
      toast.error("An error occured, please try again");
    },
  });

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isBlockVisible = useBlockSelector((state) => state.isVisible);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
          isChatSelected={isChatSelected}
        />

        <Messages
          chatId={id}
          isLoading={status === "submitted"}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isBlockVisible={isBlockVisible}
          user={user}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultiModalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={status === "submitted"}
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

      <Block
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={status !== "streaming"}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
};
