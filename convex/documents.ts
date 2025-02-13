import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createDocument = mutation({
  args: {
    id: v.string(),
    title: v.string(),
    kind: v.union(v.literal("text"), v.literal("code")),
    content: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      title: args.title,
      kind: args.kind,
      content: args.content,
      userId: args.userId,
    });
  },
});

export const getDocumentById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const document = await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("_id"), args.id))
      .first();
    return document;
  },
});

export const updateDocument = mutation({
  args: {
    id: v.string(),
    content: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("_id"), args.id))
      .first();

    if (!document) throw new Error("Document not found");

    await ctx.db.patch(document._id, { content: args.content });
    return document._id;
  },
});

export const saveSuggestions = mutation({
  args: {
    suggestions: v.array(
      v.object({
        id: v.string(),
        documentId: v.string(),
        originalText: v.string(),
        suggestedText: v.string(),
        description: v.string(),
        isResolved: v.boolean(),
        userId: v.id("users"),
        createdAt: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await Promise.all(
      args.suggestions.map((suggestion) => ctx.db.insert("suggestions", suggestion))
    );
  },
});
