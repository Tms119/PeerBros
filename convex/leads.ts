import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new lead record when a conversation starts.
 * Internal — only called from server-side actions.
 */
export const createLead = internalMutation({
  args: {
    conversation_id: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("leads")
      .withIndex("by_conversation_id", (q) => q.eq("conversation_id", args.conversation_id))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("leads", {
      conversation_id: args.conversation_id,
      qualified: false,
      escalate: false,
      status: "open",
      full_transcript: [],
      created_at: Date.now(),
    });
  },
});

/**
 * Update extracted lead fields from the LLM's structured output.
 * Internal — only called from server-side actions.
 */
export const updateLeadFields = internalMutation({
  args: {
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
    qualified: v.optional(v.boolean()),
    escalate: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("open"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db
      .query("leads")
      .withIndex("by_conversation_id", (q) => q.eq("conversation_id", args.conversation_id))
      .first();

    if (!lead) return;

    // Build update object — only set fields that are provided and non-empty
    const updates: Record<string, unknown> = {};

    if (args.service_type) updates.service_type = args.service_type;
    if (args.scope_notes) updates.scope_notes = args.scope_notes;
    if (args.budget_range) updates.budget_range = args.budget_range;
    if (args.timeline) updates.timeline = args.timeline;
    if (args.contact_name) updates.contact_name = args.contact_name;
    if (args.contact_email) updates.contact_email = args.contact_email;
    if (args.contact_phone) updates.contact_phone = args.contact_phone;
    if (args.qualified !== undefined) updates.qualified = args.qualified;
    if (args.escalate !== undefined) updates.escalate = args.escalate;
    if (args.status) updates.status = args.status;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(lead._id, updates);
    }
  },
});

/**
 * Append a message (user or assistant) to the transcript.
 * Internal — only called from server-side actions.
 */
export const appendMessage = internalMutation({
  args: {
    conversation_id: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db
      .query("leads")
      .withIndex("by_conversation_id", (q) => q.eq("conversation_id", args.conversation_id))
      .first();

    if (!lead) return;

    await ctx.db.patch(lead._id, {
      full_transcript: [
        ...lead.full_transcript,
        { role: args.role, content: args.content },
      ],
    });
  },
});

/**
 * Get a lead by conversation ID.
 */
export const getByConversationId = query({
  args: { conversation_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_conversation_id", (q) => q.eq("conversation_id", args.conversation_id))
      .first();
  },
});

/**
 * Get all leads for the admin dashboard, ordered by newest first.
 */
export const getAllLeads = query({
  handler: async (ctx) => {
    return await ctx.db.query("leads").withIndex("by_created_at").order("desc").collect();
  },
});
