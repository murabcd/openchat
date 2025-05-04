import { embed, embedMany } from "ai";

import { myProvider } from "@/lib/ai/models";

import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  query,
  mutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

function generateChunks(input: string): string[] {
  return input
    .trim()
    .split(/[.!?]+(?=\s+|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function generateEmbedding(value: string): Promise<number[]> {
  const input = value.replaceAll("\n", " ");
  const { embedding } = await embed({
    model: myProvider.textEmbeddingModel("text-embedding-3-small"),
    value: input,
  });
  return embedding;
}

async function generateEmbeddings(
  value: string
): Promise<Array<{ content: string; embedding: number[] }>> {
  const chunks = generateChunks(value);
  if (chunks.length === 0) return [];

  const { embeddings } = await embedMany({
    model: myProvider.textEmbeddingModel("text-embedding-3-small"),
    values: chunks,
  });
  return embeddings.map((vector, i) => ({
    content: chunks[i],
    embedding: vector,
  }));
}

export const add = internalMutation(
  async (
    ctx,
    args: {
      userId: Doc<"users">["_id"];
      resourceId: string;
      chunks: Array<{ content: string; embedding: number[] }>;
    }
  ) => {
    for (const chunk of args.chunks) {
      await ctx.db.insert("memories", {
        userId: args.userId,
        resourceId: args.resourceId,
        content: chunk.content,
        embedding: chunk.embedding,
      });
    }
  }
);

export const createResource = action({
  args: { content: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getUser);
    if (!user) {
      throw new Error("Authenticated user not found in database");
    }
    const userId = user._id;

    const resourceId = crypto.randomUUID();
    let chunkEmbeddings;
    try {
      chunkEmbeddings = await generateEmbeddings(args.content);
    } catch (error: any) {
      throw new Error(
        `Failed to generate embeddings: ${error.message || "Unknown error"}`
      );
    }

    if (chunkEmbeddings.length > 0) {
      try {
        await ctx.runMutation(internal.memories.add, {
          userId: userId,
          resourceId: resourceId,
          chunks: chunkEmbeddings,
        });
        return `Resource ${resourceId} created and embedded in Convex`;
      } catch (error: any) {
        throw new Error(
          `Failed to save embeddings to database: ${error.message || "Unknown error"}`
        );
      }
    } else {
      return `Resource ${resourceId} created, but no content suitable for embedding was found`;
    }
  },
});

export const searchResource = action({
  args: { query: v.string(), k: v.optional(v.number()) },
  handler: async (ctx, args): Promise<string | undefined> => {
    const user = await ctx.runQuery(api.users.getUser);
    if (!user) {
      return "Authenticated user not found in database.";
    }
    const userId = user._id;

    const queryEmbedding = await generateEmbedding(args.query);

    const results = await ctx.vectorSearch("memories", "by_embedding", {
      vector: queryEmbedding,
      limit: args.k ?? 4,
      filter: (q) => q.eq("userId", userId),
    });

    if (results.length === 0) {
      return "No relevant information found in your memory.";
    }

    const topResultId = results[0]._id;
    const topResultContent = await ctx.runQuery(internal.memories.fetchResultContent, {
      id: topResultId,
    });

    return (
      topResultContent ??
      "No relevant information found for the top match in your memory."
    );
  },
});

export const fetchResultContent = internalQuery({
  args: { id: v.id("memories") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const doc = (await ctx.db.get(args.id)) as Doc<"memories"> | null;
    return doc?.content ?? null;
  },
});

export const listMemories = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    return await ctx.db
      .query("memories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const deleteMemory = mutation({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const memory = await ctx.db.get(args.id);
    if (!memory) {
      throw new Error("Memory not found");
    }

    if (memory.userId !== userId) {
      throw new Error("User not authenticated");
    }

    await ctx.db.delete(args.id);
  },
});

export const deleteAllMemories = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const memoriesToDelete = await ctx.db
      .query("memories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const memory of memoriesToDelete) {
      await ctx.db.delete(memory._id);
    }
  },
});
