import { DataStreamWriter } from "ai";

import { codeDocumentHandler } from "@/blocks/code/server";
import { imageDocumentHandler } from "@/blocks/image/server";
import { sheetDocumentHandler } from "@/blocks/sheet/server";
import { textDocumentHandler } from "@/blocks/text/server";

import { BlockKind } from "@/components/block";

import { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

type Document = {
  title: string;
  content: string;
  kind: BlockKind;
  documentId: string;
  userId: Doc<"users">["_id"];
};

export interface SaveDocumentProps {
  id: string;
  title: string;
  kind: BlockKind;
  content: string;
  userId: string;
}

export interface CreateDocumentCallbackProps {
  id: string;
  title: string;
  dataStream: DataStreamWriter;
  user: Doc<"users">["_id"];
}

export interface UpdateDocumentCallbackProps {
  document: Document;
  description: string;
  dataStream: DataStreamWriter;
  user: Doc<"users">["_id"];
}

export interface DocumentHandler<T = BlockKind> {
  kind: T;
  onCreateDocument: (args: CreateDocumentCallbackProps) => Promise<void>;
  onUpdateDocument: (args: UpdateDocumentCallbackProps) => Promise<void>;
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function createDocumentHandler<T extends BlockKind>(config: {
  kind: T;
  onCreateDocument: (params: CreateDocumentCallbackProps) => Promise<string>;
  onUpdateDocument: (params: UpdateDocumentCallbackProps) => Promise<string>;
}): DocumentHandler<T> {
  return {
    kind: config.kind,
    onCreateDocument: async (args: CreateDocumentCallbackProps) => {
      const draftContent = await config.onCreateDocument({
        id: args.id,
        title: args.title,
        dataStream: args.dataStream,
        user: args.user,
      });

      if (args.user) {
        await convex.mutation(api.documents.saveDocument, {
          documentId: args.id,
          title: args.title,
          content: draftContent,
          kind: config.kind,
          userId: args.user,
        });
      }

      return;
    },
    onUpdateDocument: async (args: UpdateDocumentCallbackProps) => {
      const draftContent = await config.onUpdateDocument({
        document: args.document,
        description: args.description,
        dataStream: args.dataStream,
        user: args.user,
      });

      if (args.user) {
        await convex.mutation(api.documents.saveDocument, {
          documentId: args.document.documentId,
          title: args.document.title,
          content: draftContent,
          kind: config.kind,
          userId: args.user,
        });
      }

      return;
    },
  };
}

/*
 * Use this array to define the document handlers for each block kind.
 */
export const documentHandlersByBlockKind: Array<DocumentHandler> = [
  textDocumentHandler,
  codeDocumentHandler,
  imageDocumentHandler,
  sheetDocumentHandler,
];

export const blockKinds = ["text", "code", "image", "sheet"] as const;
