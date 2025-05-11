import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.string(),
    emailVerificationTime: v.optional(v.number()),
    avatarUrl: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    isMemoryEnabled: v.optional(v.boolean()),
  }).index("email", ["email"]),

  chats: defineTable({
    title: v.string(),
    visibility: v.union(v.literal("private"), v.literal("public")),
    chatId: v.string(),
    userId: v.id("users"),
    isPinned: v.optional(v.boolean()),
  })
    .index("by_userId", ["userId"])
    .index("by_chatId", ["chatId"]),

  messages: defineTable({
    messageId: v.string(),
    chatId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("tool")),
    parts: v.array(v.any()),
    attachments: v.optional(
      v.array(
        v.object({
          url: v.string(),
          name: v.string(),
          contentType: v.string(),
        })
      )
    ),
  })
    .index("by_messageId", ["messageId"])
    .index("by_chatId", ["chatId"]),

  documents: defineTable({
    title: v.string(),
    content: v.string(),
    kind: v.union(
      v.literal("text"),
      v.literal("code"),
      v.literal("image"),
      v.literal("sheet")
    ),
    documentId: v.string(),
    userId: v.id("users"),
    chatId: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_documentId", ["documentId"])
    .index("by_chatId", ["chatId"]),

  suggestions: defineTable({
    originalText: v.string(),
    suggestedText: v.string(),
    description: v.optional(v.string()),
    isResolved: v.boolean(),
    documentId: v.string(),
    suggestionId: v.string(),
    userId: v.id("users"),
  })
    .index("by_documentId", ["documentId"])
    .index("by_userId", ["userId"]),

  votes: defineTable({
    chatId: v.string(),
    messageId: v.string(),
    isUpvoted: v.boolean(),
  })
    .index("by_messageId", ["messageId"])
    .index("by_chatId", ["chatId"]),

  memories: defineTable({
    userId: v.id("users"),
    resourceId: v.string(),
    content: v.string(),
    embedding: v.array(v.float64()),
  })
    .index("by_user", ["userId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["userId"],
    }),

  streams: defineTable({
    streamId: v.string(),
    chatId: v.string(),
  }).index("by_chatId", ["chatId"]),
});
