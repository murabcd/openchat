import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveDocument = mutation({
  args: {
    documentId: v.string(),
    title: v.string(),
    kind: v.union(
      v.literal("text"),
      v.literal("code"),
      v.literal("image"),
      v.literal("sheet")
    ),
    content: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", args);
  },
});

export const getDocumentById = query({
  args: { documentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("documentId"), args.documentId))
      .first();
  },
});

export const updateDocument = mutation({
  args: {
    documentId: v.string(),
    content: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("documentId"), args.documentId))
      .first();
    if (!document) throw new Error("Document not found");
    await ctx.db.patch(document._id, { content: args.content });
    return document._id;
  },
});

export const deleteDocumentsByIdAfterTimestamp = mutation({
  args: {
    documentId: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db
      .query("suggestions")
      .filter((q) =>
        q.and(
          q.eq(q.field("documentId"), args.documentId),
          q.gt(q.field("_creationTime"), args.timestamp)
        )
      )
      .collect()
      .then((suggestions) => suggestions.forEach((s) => ctx.db.delete(s._id)));

    return await ctx.db
      .query("documents")
      .filter((q) =>
        q.and(
          q.eq(q.field("documentId"), args.documentId),
          q.gt(q.field("_creationTime"), args.timestamp)
        )
      )
      .collect()
      .then((docs) => docs.forEach((doc) => ctx.db.delete(doc._id)));
  },
});

export const getDocumentVersions = query({
  args: { documentId: v.string() },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("documentId"), args.documentId))
      .order("desc")
      .collect();

    return documents;
  },
});
