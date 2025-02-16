import { DataStreamWriter, tool } from "ai";

import { z } from "zod";

import { Doc } from "@/convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

interface UpdateDocumentProps {
  user: Doc<"users">;
  dataStream: DataStreamWriter;
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const updateDocument = ({ user, dataStream }: UpdateDocumentProps) =>
  tool({
    description: "Update a document with the given description.",
    parameters: z.object({
      id: z.string().describe("The ID of the document to update"),
      description: z.string().describe("The description of changes that need to be made"),
    }),
    execute: async ({ id, description }) => {
      const document = await convex.query(api.documents.getDocumentById, { id });

      if (!document) {
        return {
          error: "Document not found",
        };
      }

      dataStream.writeData({
        type: "clear",
        content: document.title,
      });

      // const documentHandler = documentHandlersByBlockKind.find(
      //   (documentHandlerByBlockKind) =>
      //     documentHandlerByBlockKind.kind === document.kind,
      // );

      // if (!documentHandler) {
      //   throw new Error(`No document handler found for kind: ${document.kind}`);
      // }

      // await documentHandler.onUpdateDocument({
      //   document,
      //   description,
      //   dataStream,
      //   userId: user._id,
      // });

      dataStream.writeData({ type: "finish", content: "" });

      return {
        id,
        title: document.title,
        kind: document.kind,
        content: "The document has been updated successfully.",
      };
    },
  });
