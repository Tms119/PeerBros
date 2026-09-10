"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { SYSTEM_PROMPT } from "./systemPrompt";

/**
 * Standard OpenAI-compatible function declaration for structured lead extraction.
 */
const EXTRACT_LEAD_FUNCTION = {
  type: "function",
  function: {
    name: "extract_lead_data",
    description:
      "Extract and track structured lead information gathered from the conversation so far. Call this with every response.",
    parameters: {
      type: "object",
      properties: {
        service_type: {
          type: "string",
          description: "The type of service: website, ecommerce, crm, or other.",
          enum: ["website", "ecommerce", "crm", "other"],
        },
        scope_notes: {
          type: "string",
          description: "Free-text summary of what the visitor needs.",
        },
        budget_range: {
          type: "string",
          description: "The visitor's stated budget range, if provided.",
        },
        timeline: {
          type: "string",
          description: "The visitor's stated timeline, if provided.",
        },
        contact_name: {
          type: "string",
          description: "The visitor's name, if provided.",
        },
        contact_email: {
          type: "string",
          description: "The visitor's email address, if provided.",
        },
        contact_phone: {
          type: "string",
          description: "The visitor's phone number, if provided.",
        },
        escalate: {
          type: "boolean",
          description:
            "Set to true if visitor asked about pricing, needs human help, is frustrated, or the request is too complex.",
        },
        qualified: {
          type: "boolean",
          description:
            "Set to true once you have enough info to pass to the team (service type + scope + contact info).",
        },
        conversation_phase: {
          type: "string",
          description: "The current phase of the conversation.",
          enum: [
            "greeting",
            "discovery",
            "budget",
            "contact",
            "summary",
            "complete",
          ],
        },
        quick_replies: {
          type: "array",
          items: { type: "string" },
          description:
            "Suggested quick-reply buttons to show. Use for service selection, yes/no, or clear choices.",
        },
      },
      required: ["conversation_phase"],
    },
  }
};

/**
 * Main chat action: receives a user message, calls xKiro (OpenAI API format),
 * returns the bot reply + extracted lead fields, and persists to DB.
 */
export const sendMessage = action({
  args: {
    conversation_id: v.string(),
    message: v.string(),
    history: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const xkiroApiKey = process.env.XKIRO_API_KEY;

    if (!xkiroApiKey) {
      throw new Error(
        "XKIRO_API_KEY not configured. Set it with: npx convex env set XKIRO_API_KEY=your_key"
      );
    }

    // Ensure lead record exists
    await ctx.runMutation(internal.leads.createLead, {
      conversation_id: args.conversation_id,
    });

    // Append user message to transcript
    await ctx.runMutation(internal.leads.appendMessage, {
      conversation_id: args.conversation_id,
      role: "user",
      content: args.message,
    });

    // Build chat history for OpenAI format
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...args.history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: args.message }
    ];

    try {
      const fetchResponse = await fetch("https://api.xkiro.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${xkiroApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "minimax/minimax-m3:free",
          messages: messages,
          tools: [EXTRACT_LEAD_FUNCTION],
          tool_choice: "auto"
        })
      });

      if (!fetchResponse.ok) {
        const errBody = await fetchResponse.text();
        throw new Error(`xKiro API error: ${fetchResponse.status} ${errBody}`);
      }

      const result = await fetchResponse.json();
      const messageObj = result.choices?.[0]?.message;

      let reply = messageObj?.content || "";
      let extractedFields: Record<string, any> = {};
      let quickReplies: string[] = [];

      // Process tool calls
      if (messageObj?.tool_calls && messageObj.tool_calls.length > 0) {
        for (const toolCall of messageObj.tool_calls) {
          if (toolCall.function.name === "extract_lead_data") {
            try {
              extractedFields = JSON.parse(toolCall.function.arguments);
              quickReplies = (extractedFields.quick_replies as string[]) || [];
            } catch (e) {
              console.error("Failed to parse tool call arguments", e);
            }
          }
        }
      }

      // If the model ONLY called a function but returned no text, we do a follow-up 
      // by pretending the function ran and asking for a response.
      if (!reply.trim() && Object.keys(extractedFields).length > 0) {
        messages.push(messageObj);
        messages.push({
          role: "tool",
          tool_call_id: messageObj.tool_calls[0].id,
          name: "extract_lead_data",
          content: JSON.stringify({ status: "recorded" })
        } as any);

        const followUpRes = await fetch("https://api.xkiro.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${xkiroApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "minimax/minimax-m3:free",
            messages: messages,
          })
        });

        if (followUpRes.ok) {
          const followUpData = await followUpRes.json();
          reply = followUpData.choices?.[0]?.message?.content || "";
        }
      }

      // Strip any reasoning traces (like <think> tags)
      reply = reply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

      // Fallback if still no reply
      if (!reply) {
        reply = "I will pass this to the team. They will be in touch soon!";
      }

      // Save bot reply to transcript
      await ctx.runMutation(internal.leads.appendMessage, {
        conversation_id: args.conversation_id,
        role: "assistant",
        content: reply,
      });

      // Update lead fields from extraction
      const phase = (extractedFields.conversation_phase as string) || "";
      const isComplete = phase === "complete";
      const shouldEscalate = extractedFields.escalate === true;

      if (Object.keys(extractedFields).length > 0) {
        await ctx.runMutation(internal.leads.updateLeadFields, {
          conversation_id: args.conversation_id,
          ...(extractedFields.service_type && {
            service_type: extractedFields.service_type as
              | "website"
              | "ecommerce"
              | "crm"
              | "other",
          }),
          ...(extractedFields.scope_notes && {
            scope_notes: extractedFields.scope_notes as string,
          }),
          ...(extractedFields.budget_range && {
            budget_range: extractedFields.budget_range as string,
          }),
          ...(extractedFields.timeline && {
            timeline: extractedFields.timeline as string,
          }),
          ...(extractedFields.contact_name && {
            contact_name: extractedFields.contact_name as string,
          }),
          ...(extractedFields.contact_email && {
            contact_email: extractedFields.contact_email as string,
          }),
          ...(extractedFields.contact_phone && {
            contact_phone: extractedFields.contact_phone as string,
          }),
          qualified: extractedFields.qualified === true,
          escalate: shouldEscalate,
          ...(isComplete && { status: "completed" as const }),
        });
      }

      // Send email notification on completion or escalation
      if (isComplete || shouldEscalate) {
        try {
          await ctx.runAction(internal.email.sendLeadNotification, {
            conversation_id: args.conversation_id,
            service_type:
              (extractedFields.service_type as string) || undefined,
            scope_notes:
              (extractedFields.scope_notes as string) || undefined,
            budget_range:
              (extractedFields.budget_range as string) || undefined,
            timeline: (extractedFields.timeline as string) || undefined,
            contact_name:
              (extractedFields.contact_name as string) || undefined,
            contact_email:
              (extractedFields.contact_email as string) || undefined,
            contact_phone:
              (extractedFields.contact_phone as string) || undefined,
            escalate: shouldEscalate,
            qualified: extractedFields.qualified === true,
          });
        } catch (emailError) {
          console.error("Email notification failed (non-blocking):", emailError);
        }
      }

      return {
        reply,
        extracted_fields: extractedFields,
        quick_replies: quickReplies,
      };
    } catch (error: any) {
      console.error("API Error:", error);

      // Trigger fallback mode on API failure or Rate Limit
      if (
        error?.status === 429 ||
        error?.message?.includes("rate") ||
        error?.message?.includes("quota") ||
        error?.message?.includes("xKiro API error")
      ) {
        return {
          reply: "",
          extracted_fields: {},
          quick_replies: [],
          rate_limited: true,
        };
      }

      // Generic error fallback
      return {
        reply: "Hmm, something glitched on my end. Mind trying that again?",
        extracted_fields: {},
        quick_replies: [],
        error: true,
      };
    }
  },
});
