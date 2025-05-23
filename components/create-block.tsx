import { ComponentType, Dispatch, ReactNode, SetStateAction } from "react";

import { UseChatHelpers } from "ai/react";

import { UIBlock } from "@/components/block";
import { DataStreamDelta } from "@/components/data-stream-handler";

import { Doc } from "@/convex/_generated/dataModel";

type Suggestion = {
  originalText: string;
  suggestedText: string;
  description: string;
  isResolved: boolean;
  userId: Doc<"users">["_id"];
  documentId: string;
  suggestionId: string;
};

export type BlockActionContext<M = unknown> = {
  content: string;
  handleVersionChange: (type: "next" | "prev" | "toggle" | "latest") => void;
  currentVersionIndex: number;
  isCurrentVersion: boolean;
  mode: "edit" | "diff";
  metadata: M;
  setMetadata: Dispatch<SetStateAction<M>>;
};

type BlockAction<M = unknown> = {
  icon: ReactNode;
  label?: string;
  description: string;
  onClick: (context: BlockActionContext<M>) => Promise<void> | void;
  isDisabled?: (context: BlockActionContext<M>) => boolean;
};

export type BlockToolbarContext = {
  appendMessage: UseChatHelpers["append"];
};

export type BlockToolbarItem = {
  description: string;
  icon: ReactNode;
  onClick: (context: BlockToolbarContext) => void;
};

interface BlockContent<M = unknown> {
  title: string;
  content: string;
  mode: "edit" | "diff";
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: "streaming" | "idle";
  suggestions: Array<Suggestion>;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  isInline: boolean;
  getDocumentContentById: (index: number) => string;
  isLoading: boolean;
  metadata: M;
  setMetadata: Dispatch<SetStateAction<M>>;
}

interface InitializeParameters<M = unknown> {
  documentId: string;
  setMetadata: Dispatch<SetStateAction<M>>;
}

type BlockConfig<T extends string, M = unknown> = {
  kind: T;
  description: string;
  content: ComponentType<BlockContent<M>>;
  actions: Array<BlockAction<M>>;
  toolbar: BlockToolbarItem[];
  initialize?: (parameters: InitializeParameters<M>) => void;
  onStreamPart: (args: {
    setMetadata: Dispatch<SetStateAction<M>>;
    setBlock: Dispatch<SetStateAction<UIBlock>>;
    streamPart: DataStreamDelta;
  }) => void;
};

export class Block<T extends string, M = unknown> {
  readonly kind: T;
  readonly description: string;
  readonly content: ComponentType<BlockContent<M>>;
  readonly actions: Array<BlockAction<M>>;
  readonly toolbar: BlockToolbarItem[];
  readonly initialize?: (parameters: InitializeParameters<M>) => void;
  readonly onStreamPart: (args: {
    setMetadata: Dispatch<SetStateAction<M>>;
    setBlock: Dispatch<SetStateAction<UIBlock>>;
    streamPart: DataStreamDelta;
  }) => void;

  constructor(config: BlockConfig<T, M>) {
    this.kind = config.kind;
    this.description = config.description;
    this.content = config.content;
    this.actions = config.actions || [];
    this.toolbar = config.toolbar || [];
    this.initialize = config.initialize || (async () => ({}));
    this.onStreamPart = config.onStreamPart;
  }
}
