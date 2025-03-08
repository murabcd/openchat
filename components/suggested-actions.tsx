"use client";

import { memo } from "react";

import { ChatRequestOptions, CreateMessage, Message } from "ai";
import { Code, Lightbulb, ScanText, ThermometerSun } from "lucide-react";

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
      label: "demonstrating Dijkstra's algorithm",
      action: "Write code that demonstrates Djikstra's algorithm",
      icon: <Code className="w-4 h-4 mr-2" />,
    },
    {
      title: "Explain",
      label: "the theory of relativity",
      action: "Explain the theory of relativity in simple terms",
      icon: <Lightbulb className="w-4 h-4 mr-2" />,
    },
    {
      title: "Summarize",
      label: "the plot of Hamlet",
      action: "Summarize the plot of Hamlet briefly",
      icon: <ScanText className="w-4 h-4 mr-2" />,
    },
    {
      title: "Weather",
      label: "in London today",
      action: "What is the current weather in London?",
      icon: <ThermometerSun className="w-4 h-4 mr-2" />,
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
              window.history.replaceState({}, "", `/chat/${chatId}`);

              append({
                role: "user",
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <div className="flex items-center">
              {suggestedAction.icon}
              <span className="font-medium">{suggestedAction.title}</span>
            </div>
            <span className="text-muted-foreground">{suggestedAction.label}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
