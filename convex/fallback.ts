"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Action to handle manual fallback form submissions when the AI is down or rate-limited.
 * Saves the lead data to Convex and fires an email notification.
 */
export const submitFallbackLead = action({
  args: {
    conversation_id: v.string(),
    name: v.string(),
    email: v.string(),
    service_type: v.string(),
    notes: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Ensure the lead document exists for this conversation
      await ctx.runMutation(internal.leads.createLead, {
        conversation_id: args.conversation_id,
      });

      // 2. Update the lead with the manually submitted form data
      const serviceType = ["website", "ecommerce", "crm", "other"].includes(args.service_type) 
        ? (args.service_type as "website" | "ecommerce" | "crm" | "other") 
        : "other";

      await ctx.runMutation(internal.leads.updateLeadFields, {
        conversation_id: args.conversation_id,
        contact_name: args.name,
        contact_email: args.email,
        service_type: serviceType,
        scope_notes: args.notes,
        qualified: true, // Manual form submissions are considered qualified leads
        status: "completed",
        escalate: true, // Escalate so the team knows it requires manual follow-up
      });

      // 3. Trigger the email notification
      await ctx.runAction(internal.email.sendLeadNotification, {
        conversation_id: args.conversation_id,
        contact_name: args.name,
        contact_email: args.email,
        service_type: serviceType,
        scope_notes: args.notes,
        escalate: true,
        qualified: true,
        transcript_summary: "Lead submitted via the manual fallback form (Chatbot was rate-limited or encountered an error).",
      });

      return { success: true };
    } catch (error: any) {
      console.error("Failed to submit fallback lead:", error);
      return { success: false, error: error.message || "Unknown error" };
    }
  },
});
