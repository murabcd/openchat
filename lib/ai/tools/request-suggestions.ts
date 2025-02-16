import { DataStreamWriter, streamObject, tool } from "ai";

import { z } from "zod";

import { generateUUID } from "@/lib/utils";

import { myProvider } from "@/lib/ai/models";

import { Doc } from "@/convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

type Suggestion = {
  id: string;
  documentId: string;
  originalText: string;
  suggestedText: string;
  description: string;
  isResolved: boolean;
  userId: Doc<"users">["_id"];
  createdAt: number;
};

interface RequestSuggestionsProps {
  user: Doc<"users">;
  dataStream: DataStreamWriter;
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const requestSuggestions = ({ user, dataStream }: RequestSuggestionsProps) =>
  tool({
    description: "Request suggestions for a document",
    parameters: z.object({
      documentId: z.string().describe("The ID of the document to request edits"),
    }),
    execute: async ({ documentId }) => {
      const document = await convex.query(api.documents.getDocumentById, {
        id: documentId,
      });

      if (!document || !document.content) {
        return {
          error: "Document not found",
        };
      }

      const suggestions: Array<Omit<Suggestion, "userId" | "createdAt">> = [];

      const { elementStream } = streamObject({
        model: myProvider.languageModel("block-model"),
        system:
          "You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.",
        prompt: document.content,
        output: "array",
        schema: z.object({
          originalSentence: z.string().describe("The original sentence"),
          suggestedSentence: z.string().describe("The suggested sentence"),
          description: z.string().describe("The description of the suggestion"),
        }),
      });

      for await (const element of elementStream) {
        const suggestion = {
          originalText: element.originalSentence,
          suggestedText: element.suggestedSentence,
          description: element.description,
          id: generateUUID(),
          documentId: documentId,
          isResolved: false,
        };

        dataStream.writeData({
          type: "suggestion",
          content: suggestion,
        });

        suggestions.push(suggestion);
      }

      if (user) {
        await convex.mutation(api.documents.saveSuggestions, {
          suggestions: suggestions.map((suggestion) => ({
            ...suggestion,
            userId: user._id,
            createdAt: Date.now(),
          })),
        });
      }

      return {
        id: documentId,
        title: document.title,
        kind: document.kind,
        message: "Suggestions have been added to the document",
      };
    },
  });
