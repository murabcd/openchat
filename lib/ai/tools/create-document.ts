import { generateUUID } from "@/lib/utils";

import { DataStreamWriter, tool } from "ai";

import { z } from "zod";

import { Doc } from "@/convex/_generated/dataModel";

interface CreateDocumentProps {
  user: Doc<"users">;
  dataStream: DataStreamWriter;
}

export const createDocument = ({ user, dataStream }: CreateDocumentProps) =>
  tool({
    description:
      "Create a document for a writing or content creation activities. This tool will call other functions that will generate the contents of the document based on the title and kind.",
    parameters: z.object({
      title: z.string(),
      kind: z.string(),
    }),
    execute: async ({ title, kind }) => {
      const id = generateUUID();

      dataStream.writeData({
        type: "kind",
        content: kind as string,
      });

      dataStream.writeData({
        type: "id",
        content: id as string,
      });

      dataStream.writeData({
        type: "title",
        content: title as string,
      });

      dataStream.writeData({
        type: "clear",
        content: "",
      });

      // const documentHandler = documentHandlersByBlockKind.find(
      //   (documentHandlerByBlockKind) => documentHandlerByBlockKind.kind === kind
      // );

      // if (!documentHandler) {
      //   throw new Error(`No document handler found for kind: ${kind}`);
      // }

      // await documentHandler.onCreateDocument({
      //   id,
      //   title,
      //   dataStream,
      //   userId: user._id,
      // });

      dataStream.writeData({ type: "finish", content: "" });

      return {
        id,
        title,
        kind,
        content: "A document was created and is now visible to the user.",
      };
    },
  });
