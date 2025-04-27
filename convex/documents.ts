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
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
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
    const latestVersion = await ctx.db
      .query("documents")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .order("desc")
      .first();

    if (!latestVersion) {
      throw new Error("Cannot update document: No existing version found.");
    }

    const newVersionId = await ctx.db.insert("documents", {
      documentId: args.documentId,
      userId: args.userId,
      title: latestVersion.title,
      kind: latestVersion.kind,
      content: args.content ?? latestVersion.content,
    });

    return newVersionId;
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
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .filter((q) => q.gt(q.field("_creationTime"), args.timestamp))
      .collect()
      .then((suggestions) => suggestions.forEach((s) => ctx.db.delete(s._id)));

    return await ctx.db
      .query("documents")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .filter((q) => q.gt(q.field("_creationTime"), args.timestamp))
      .collect()
      .then((docs) => docs.forEach((doc) => ctx.db.delete(doc._id)));
  },
});

export const getDocumentVersions = query({
  args: { documentId: v.string() },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .order("desc")
      .collect();

    return documents;
  },
});
