"use client";

import type { ChatRequestOptions, Message } from "ai";
import { memo, useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Markdown } from "@/components/markdown";
import { PreviewAttachment } from "@/components/preview-attachment";
import equal from "fast-deep-equal";

const PurePreviewMessage = ({
  chatId,
  message,
  isLoading,
  setMessages,
}: {
  chatId: string;
  message: Message;
  isLoading: boolean;
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  return (
    <div className="w-full mx-auto max-w-3xl px-4 group/message" data-role={message.role}>
      <div
        className={cn(
          "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
          {
            "w-full": mode === "edit",
            "group-data-[role=user]/message:w-fit": mode !== "edit",
          }
        )}
      >
        {message.role === "assistant" && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
            <div className="translate-y-px">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 w-full">
          {message.experimental_attachments && (
            <div className="flex flex-row justify-end gap-2">
              {message.experimental_attachments.map((attachment) => (
                <PreviewAttachment key={attachment.url} attachment={attachment} />
              ))}
            </div>
          )}

          {message.content && mode === "view" && (
            <div className="flex flex-row gap-2 items-start">
              {message.role === "user" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      data-hover-element
                      variant="ghost"
                      className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                      onClick={() => setMode("edit")}
                    >
                      <PencilLine />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit message</TooltipContent>
                </Tooltip>
              )}

              <div
                className={cn("flex flex-col gap-4", {
                  "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
                    message.role === "user",
                })}
              >
                <Markdown>{message.content as string}</Markdown>
              </div>
            </div>
          )}

          {message.content && mode === "edit" && (
            <div className="flex flex-row gap-2 items-start">
              <div className="size-8" />
              <div>Edit mode placeholder</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const PreviewMessage = memo(PurePreviewMessage, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.message.content !== nextProps.message.content) return false;
  if (!equal(prevProps.message.toolInvocations, nextProps.message.toolInvocations))
    return false;

  return true;
});

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <div className="w-full mx-auto max-w-3xl px-4 group/message" data-role={role}>
      <div
        className={cn(
          "flex gap-4 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl rounded-xl"
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
          <div className="translate-y-px">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">Thinking...</div>
        </div>
      </div>
    </div>
  );
};
