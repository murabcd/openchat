"use client";

import { useEffect, useState } from "react";

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
  autoResume: boolean;
}

export const Chat = ({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
  isChatSelected,
  user,
  autoResume,
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
    experimental_resume,
  } = useChat({
    id,
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    experimental_prepareRequestBody: (body) => {
      console.log(
        "[Chat.tsx] experimental_prepareRequestBody - input body:",
        JSON.stringify(body)
      );
      console.log(
        "[Chat.tsx] experimental_prepareRequestBody - last message in body:",
        JSON.stringify(body.messages.at(-1))
      );
      return {
        id,
        message: body.messages.at(-1),
        selectedChatModel: selectedChatModel,
        selectedVisibilityType: selectedVisibilityType,
        data: body.requestData,
      };
    },
    onFinish: (data) => {
      // Could add Convex mutation here if needed
      console.log("[Chat.tsx] onFinish - data:", JSON.stringify(data));
    },
    onError: () => {
      toast.error("An error occured, please try again");
    },
  });

  useEffect(() => {
    console.log(
      "[Chat.tsx] Messages or Status updated:",
      JSON.stringify(messages),
      "Status:",
      status
    );
    if (autoResume) {
      experimental_resume();
    }

    // note: this hook has no dependencies since it only needs to run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          status={status}
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
              status={status}
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
        status={status}
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
