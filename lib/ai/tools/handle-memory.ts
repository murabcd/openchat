import { tool } from "ai";

import { z } from "zod";

import { api } from "@/convex/_generated/api";
import { fetchAction } from "convex/nextjs";

export const addResource = (token: string | null) =>
  tool({
    description:
      "Add new content or information to the knowledge base (memory). Use this when the user explicitly tells you to remember something.",
    parameters: z.object({
      content: z.string().describe("The information or content to store"),
    }),
    execute: async ({ content }) => {
      if (!token) return "Authentication token missing, cannot add to memory.";
      try {
        const result = await fetchAction(
          api.memories.createResource,
          { content },
          { token }
        );
        return result;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return `Failed to add information to memory. Error: ${message}`;
      }
    },
  });

export const getInformation = (token: string | null) =>
  tool({
    description:
      "Retrieve relevant knowledge from the knowledge base (memory) to answer user questions or recall information.",
    parameters: z.object({
      question: z
        .string()
        .describe("The question or topic to search for in the knowledge base"),
    }),
    execute: async ({ question }) => {
      if (!token) return "Authentication token missing, cannot access memory.";
      try {
        const result = await fetchAction(
          api.memories.searchResource,
          { query: question },
          { token }
        );
        return result;
      } catch {
        return `Failed to retrieve information from memory.`;
      }
    },
  });
