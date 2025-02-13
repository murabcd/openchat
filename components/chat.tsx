"use client";

import { useState } from "react";

import type { Attachment, Message } from "ai";
import { useChat } from "ai/react";

import { ChatHeader } from "./chat-header";
import { Messages } from "@/components/messages";
import { MultiModalInput } from "@/components/multi-modal-input";

interface ChatProps {
  chatId: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
}

export const Chat = ({ chatId, initialMessages, selectedModelId }: ChatProps) => {
  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    isLoading,
    stop,
    append,
  } = useChat({
    id: chatId,
    initialMessages,
    experimental_throttle: 100,
  });

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <ChatHeader chatId={chatId} selectedModelId={selectedModelId} />

      <Messages
        chatId={chatId}
        messages={messages}
        isLoading={isLoading}
        setMessages={setMessages}
      />

      <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <MultiModalInput
          chatId={chatId}
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
      </form>
    </div>
  );
};
