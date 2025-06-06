"use client";

import { memo, MouseEvent, useCallback, useEffect, useMemo, useRef } from "react";

import { Text, Maximize2, Image, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { useBlock } from "@/hooks/use-block";

import { Editor } from "@/components/text-editor";
import { BlockKind, UIBlock } from "@/components/block";
import { DocumentToolCall, DocumentToolResult } from "@/components/document";
import { CodeEditor } from "@/components/code-editor";
import { SpreadsheetEditor } from "@/components/sheet-editor";
import { ImageEditor } from "@/components/image-editor";
import { InlineDocumentSkeleton } from "@/components/document-skeleton";

import equal from "fast-deep-equal";

import { Doc, Id } from "@/convex/_generated/dataModel";

type Document = Doc<"documents">;

interface ToolResult {
  id: Id<"documents">;
  title: string;
  kind: BlockKind;
}
interface ToolArgs {
  title: string;
  kind: BlockKind;
}

interface DocumentPreviewProps {
  isReadonly: boolean;
  result?: ToolResult;
  args?: ToolArgs;
}

export function DocumentPreview({ isReadonly, result, args }: DocumentPreviewProps) {
  const { block, setBlock } = useBlock();

  const documents = useQuery(
    api.documents.getDocumentById,
    result ? { documentId: result.id } : "skip"
  );

  const isDocumentsFetching = documents === undefined;

  const previewDocument = useMemo(() => documents, [documents]);
  const hitboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boundingBox = hitboxRef.current?.getBoundingClientRect();

    if (block.documentId && boundingBox) {
      setBlock((block) => ({
        ...block,
        boundingBox: {
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      }));
    }
  }, [block.documentId, setBlock]);

  if (block.isVisible) {
    if (result) {
      return (
        <DocumentToolResult
          type="create"
          result={{ id: result.id, title: result.title, kind: result.kind }}
          isReadonly={isReadonly}
        />
      );
    }

    if (args) {
      return (
        <DocumentToolCall
          type="create"
          args={{ title: args.title }}
          isReadonly={isReadonly}
        />
      );
    }
  }

  if (isDocumentsFetching) {
    return <LoadingSkeleton blockKind={result?.kind ?? args?.kind ?? block.kind} />;
  }

  const document: Document | null = previewDocument
    ? previewDocument
    : block.status === "streaming"
      ? {
          _id: block.documentId as Id<"documents">,
          _creationTime: Date.now(),
          documentId: block.documentId,
          title: block.title,
          kind: block.kind,
          content: block.content,
          userId: "noop" as Id<"users">,
        }
      : null;

  if (!document || !result) return <LoadingSkeleton blockKind={block.kind} />;

  return (
    <div className="relative w-full cursor-pointer">
      <HitboxLayer hitboxRef={hitboxRef} result={result} setBlock={setBlock} />
      <DocumentHeader
        title={document.title}
        kind={document.kind}
        isStreaming={block.status === "streaming"}
      />
      <DocumentContent document={document} />
    </div>
  );
}

const LoadingSkeleton = ({ blockKind }: { blockKind: BlockKind }) => (
  <div className="w-full">
    <div className="p-4 border rounded-t-2xl flex flex-row gap-2 items-center justify-between dark:bg-muted h-[57px] dark:border-zinc-700 border-b-0">
      <div className="flex flex-row items-center gap-3">
        <div className="text-muted-foreground">
          <div className="animate-pulse rounded-md size-4 bg-muted-foreground/20" />
        </div>
        <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-24" />
      </div>
      <div>
        <Maximize2 className="w-4 h-4" />
      </div>
    </div>
    {blockKind === "image" ? (
      <div className="overflow-y-scroll border rounded-b-2xl bg-muted border-t-0 dark:border-zinc-700">
        <div className="animate-pulse h-[257px] bg-muted-foreground/20 w-full" />
      </div>
    ) : (
      <div className="overflow-y-scroll border rounded-b-2xl p-8 pt-4 bg-muted border-t-0 dark:border-zinc-700">
        <InlineDocumentSkeleton />
      </div>
    )}
  </div>
);

const PureHitboxLayer = ({
  hitboxRef,
  result,
  setBlock,
}: {
  hitboxRef: React.RefObject<HTMLDivElement | null>;
  result: ToolResult;
  setBlock: (updaterFn: UIBlock | ((currentBlock: UIBlock) => UIBlock)) => void;
}) => {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const boundingBox = event.currentTarget.getBoundingClientRect();

      setBlock((block) =>
        block.status === "streaming"
          ? { ...block, isVisible: true }
          : {
              ...block,
              title: result.title,
              documentId: result.id,
              kind: result.kind,
              isVisible: true,
              boundingBox: {
                left: boundingBox.x,
                top: boundingBox.y,
                width: boundingBox.width,
                height: boundingBox.height,
              },
            }
      );
    },
    [setBlock, result]
  );

  return (
    <div
      className="size-full absolute top-0 left-0 rounded-xl z-10"
      ref={hitboxRef}
      onClick={handleClick}
      role="presentation"
      aria-hidden="true"
    >
      <div className="w-full p-4 flex justify-end items-center">
        <div className="absolute right-[9px] top-[13px] p-2 hover:dark:bg-zinc-700 rounded-md hover:bg-zinc-100">
          <Maximize2 className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

const HitboxLayer = memo(PureHitboxLayer, (prevProps, nextProps) => {
  if (!equal(prevProps.result, nextProps.result)) return false;
  return true;
});

const PureDocumentHeader = ({
  title,
  kind,
  isStreaming,
}: {
  title: string;
  kind: BlockKind;
  isStreaming: boolean;
}) => (
  <div className="p-4 border rounded-t-2xl flex flex-row gap-2 items-start sm:items-center justify-between dark:bg-muted border-b-0 dark:border-zinc-700">
    <div className="flex flex-row items-start sm:items-center gap-3">
      <div className="text-muted-foreground">
        {isStreaming ? (
          <div className="animate-spin">
            <LoaderCircle className="w-4 h-4" />
          </div>
        ) : kind === "image" ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image className="w-4 h-4" />
        ) : (
          <Text className="w-4 h-4" />
        )}
      </div>
      <div className="-translate-y-1 sm:translate-y-0 font-medium">{title}</div>
    </div>
    <div className="w-8" />
  </div>
);

const DocumentHeader = memo(PureDocumentHeader, (prevProps, nextProps) => {
  if (prevProps.title !== nextProps.title) return false;
  if (prevProps.isStreaming !== nextProps.isStreaming) return false;

  return true;
});

const DocumentContent = ({ document }: { document: Document }) => {
  const { block } = useBlock();

  const containerClassName = cn(
    "h-[257px] overflow-y-scroll border rounded-b-2xl dark:bg-muted border-t-0 dark:border-zinc-700",
    {
      "p-4 sm:px-14 sm:py-16": document.kind === "text",
      "p-0": document.kind === "code",
    }
  );

  const commonProps = {
    content: document.content ?? "",
    isCurrentVersion: true,
    currentVersionIndex: 0,
    status: block.status,
    saveContent: () => {},
    suggestions: [],
  };

  return (
    <div className={containerClassName}>
      {document.kind === "text" ? (
        <Editor {...commonProps} onSaveContent={() => {}} />
      ) : document.kind === "code" ? (
        <div className="flex flex-1 relative w-full">
          <div className="absolute inset-0">
            <CodeEditor {...commonProps} onSaveContent={() => {}} />
          </div>
        </div>
      ) : document.kind === "sheet" ? (
        <div className="flex flex-1 relative size-full p-4">
          <div className="absolute inset-0">
            <SpreadsheetEditor {...commonProps} />
          </div>
        </div>
      ) : document.kind === "image" ? (
        <ImageEditor
          title={document.title}
          content={document.content ?? ""}
          isCurrentVersion={true}
          currentVersionIndex={0}
          status={block.status}
          isInline={true}
        />
      ) : null}
    </div>
  );
};
