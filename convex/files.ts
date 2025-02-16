import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateAttachmentUrl = mutation({
  args: {
    contentType: v.string(),
  },
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getAttachmentUrl = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Failed to get attachment URL");
    return {
      storageId: args.storageId,
      name: args.name,
      type: args.contentType,
      url,
    };
  },
});
