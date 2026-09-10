"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";

/**
 * Send email notification via Resend when a lead is completed or escalated.
 */
export const sendLeadNotification = internalAction({
  args: {
    conversation_id: v.string(),
    service_type: v.optional(v.string()),
    scope_notes: v.optional(v.string()),
    budget_range: v.optional(v.string()),
    timeline: v.optional(v.string()),
    contact_name: v.optional(v.string()),
    contact_email: v.optional(v.string()),
    contact_phone: v.optional(v.string()),
    escalate: v.boolean(),
    qualified: v.boolean(),
    transcript_summary: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not set — skipping email notification");
      console.log("Lead notification (would have emailed):", JSON.stringify(args, null, 2));
      return { sent: false, reason: "no_api_key" };
    }

    const isEscalation = args.escalate;
    const subject = isEscalation
      ? `🚨 Escalated Lead — ${args.contact_name || "Unknown"} (${args.service_type || "unspecified"})`
      : `✅ New Lead — ${args.contact_name || "Unknown"} (${args.service_type || "unspecified"})`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0a0a0a; border-radius: 12px; padding: 24px; color: #f3f4f6;">
          <h1 style="color: #c0a080; margin: 0 0 16px 0; font-size: 22px;">
            ${isEscalation ? "🚨 Escalated Lead" : "✅ New Lead Captured"}
          </h1>
          
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 8px 0; color: #9ca3af; width: 140px;">Service Type</td>
              <td style="padding: 8px 0; color: #f3f4f6; font-weight: 500;">${args.service_type || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #9ca3af;">Scope</td>
              <td style="padding: 8px 0; color: #f3f4f6;">${args.scope_notes || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #9ca3af;">Budget</td>
              <td style="padding: 8px 0; color: #f3f4f6;">${args.budget_range || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #9ca3af;">Timeline</td>
              <td style="padding: 8px 0; color: #f3f4f6;">${args.timeline || "Not provided"}</td>
            </tr>
            <tr style="border-top: 1px solid #333;">
              <td style="padding: 12px 0 8px; color: #9ca3af;">Name</td>
              <td style="padding: 12px 0 8px; color: #f3f4f6; font-weight: 500;">${args.contact_name || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #9ca3af;">Email</td>
              <td style="padding: 8px 0; color: #c0a080;">${args.contact_email || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #9ca3af;">Phone</td>
              <td style="padding: 8px 0; color: #f3f4f6;">${args.contact_phone || "—"}</td>
            </tr>
          </table>

          ${args.transcript_summary ? `
          <div style="margin-top: 16px; padding: 12px; background: #1a1a1a; border-radius: 8px; border: 1px solid #333;">
            <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Conversation Summary</p>
            <p style="color: #f3f4f6; margin: 0; line-height: 1.5;">${args.transcript_summary}</p>
          </div>
          ` : ""}

          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #333;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Conversation ID: ${args.conversation_id}<br>
              Status: ${args.qualified ? "Qualified" : "Unqualified"} · ${isEscalation ? "Escalated" : "Normal"}
            </p>
          </div>
        </div>
      </div>
    `;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "PeerBros Bot <onboarding@resend.dev>",
          to: ["sayem@peerbros.tech"],
          subject,
          html: htmlBody,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Resend API error:", response.status, errorText);
        return { sent: false, reason: "api_error", error: errorText };
      }

      const result = await response.json();
      console.log("Email sent successfully:", result);
      return { sent: true, id: result.id };
    } catch (error) {
      console.error("Failed to send email:", error);
      return { sent: false, reason: "exception", error: String(error) };
    }
  },
});
