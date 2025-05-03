"use client";

import { useState } from "react";

import { ChevronDown, LoaderCircle } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { Markdown } from "@/components/markdown";

interface MessageMemoryActionProps {
  toolName: "addResource" | "getInformation";
  isLoading: boolean;
  result?: string;
}

export function MessageMemorizing({
  toolName,
  isLoading,
  result,
}: MessageMemoryActionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
      marginBottom: "0.5rem",
    },
  };

  const resultText =
    result && (typeof result === "string" ? result : JSON.stringify(result, null, 2));

  if (toolName === "addResource") {
    if (isLoading) {
      return (
        <div className="flex flex-row gap-2 items-center text-sm text-muted-foreground">
          <div className="animate-spin">
            <LoaderCircle className="w-4 h-4" />
          </div>
          <div>Adding to memory...</div>
        </div>
      );
    }

    return (
      <div className="flex flex-row gap-2 items-center text-sm text-muted-foreground">
        <div>Added to memory</div>
      </div>
    );
  }

  if (toolName === "getInformation") {
    const title = "Retrieved from memory";
    const loadingTitle = "Retrieving from memory...";

    if (isLoading) {
      return (
        <div className="flex flex-row gap-2 items-center p-2">
          <div className="animate-spin">
            <LoaderCircle className="w-4 h-4" />
          </div>
          <div className="text-sm text-muted-foreground">{loadingTitle}</div>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        <div className="flex flex-row gap-2 items-center">
          <div className="text-sm text-muted-foreground">{title}</div>
          <div
            data-testid={`message-memory-action-toggle-${toolName}`}
            className="cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              data-testid={`message-memory-action-content-${toolName}`}
              key="content"
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={variants}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
              className="pl-4 text-zinc-600 dark:text-zinc-400 border-l flex flex-col gap-4"
            >
              {resultText && <Markdown>{resultText}</Markdown>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}
