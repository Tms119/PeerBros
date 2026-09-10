import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  leads: defineTable({
    conversation_id: v.string(),
    service_type: v.optional(v.union(
      v.literal("website"),
      v.literal("ecommerce"),
      v.literal("crm"),
      v.literal("other")
    )),
    scope_notes: v.optional(v.string()),
    budget_range: v.optional(v.string()),
    timeline: v.optional(v.string()),
    contact_name: v.optional(v.string()),
    contact_email: v.optional(v.string()),
    contact_phone: v.optional(v.string()),
    qualified: v.boolean(),
    escalate: v.boolean(),
    status: v.union(v.literal("open"), v.literal("completed")),
    full_transcript: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    })),
    created_at: v.number(),
  }).index("by_conversation_id", ["conversation_id"])
    .index("by_status", ["status"])
    .index("by_created_at", ["created_at"]),
});
