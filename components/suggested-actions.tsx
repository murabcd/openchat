"use client";

import { memo } from "react";

import { ChatRequestOptions, CreateMessage, Message } from "ai";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: "Code",
      label: "Djikstra's algorithm",
      action: "Write code that demonstrates Djikstra's algorithm.",
    },
    {
      title: "Explain",
      label: "Relativity theory",
      action: "Explain the theory of relativity in simple terms.",
    },
    {
      title: "Summarize",
      label: "Hamlet plot",
      action: "Summarize the plot of Hamlet briefly.",
    },
    {
      title: "Weather",
      label: "London today",
      action: "What is the current weather in London?",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 gap-2 w-full">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? "hidden sm:block" : "block"}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              if (chatId) {
                window.history.replaceState({}, "", `/chat/${chatId}`);
              }

              append({
                role: "user",
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">{suggestedAction.label}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
