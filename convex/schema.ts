import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  leads: defineTable({
    conversation_id: v.string(), // Links to the anonymous session/chat instance
    service_type: v.optional(v.union(
      v.literal("website"),
      v.literal("ecommerce"),
      v.literal("crm"),
      v.literal("other")
    )),
    scope_notes: v.optional(v.string()), // Open-text summary of requirements
    budget_range: v.optional(v.string()), // E.g., "$5k-$10k"
    timeline: v.optional(v.string()), // E.g., "ASAP", "Next quarter"
    
    // Contact Info
    contact_name: v.optional(v.string()),
    contact_email: v.optional(v.string()),
    contact_phone: v.optional(v.string()),

    // Status Tracking
    qualified: v.boolean(), // True if we have enough info to consider it a lead
    escalate: v.boolean(), // True if they need a human NOW or asked for pricing
    status: v.union(v.literal("open"), v.literal("completed")), // Open while chatting, completed when done
    
    // Raw Chat Data
    full_transcript: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    })),
    
    created_at: v.number(),
  })
    .index("by_conversation_id", ["conversation_id"])
    .index("by_status", ["status"])
    .index("by_created_at", ["created_at"]),

  admins: defineTable({
    email: v.string(),
    password: v.string(), // SHA-256 hashed password
  }).index("by_email", ["email"]),
});
