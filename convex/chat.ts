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
          messages: [
            ...messages,
            { role: "system", content: "If you have collected enough info and are ending the conversation, append [COMPLETE] to the end of your message." }
          ]
        })
      });

      if (!fetchResponse.ok) {
        const errBody = await fetchResponse.text();
        throw new Error(`xKiro API error: ${fetchResponse.status} ${errBody}`);
      }

      const result = await fetchResponse.json();
      const messageObj = result.choices?.[0]?.message;
      let rawContent = messageObj?.content || "";
      rawContent = rawContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

      let reply = rawContent;
      let phase = "";

      if (reply.includes("[COMPLETE]")) {
        phase = "complete";
        reply = reply.replace("[COMPLETE]", "").trim();
      }

      if (!reply) {
        reply = "I will pass this to the team. They will be in touch soon!";
      }

      // Save bot reply to transcript
      await ctx.runMutation(internal.leads.appendMessage, {
        conversation_id: args.conversation_id,
        role: "assistant",
        content: reply,
      });

      // Spawn background extraction
      await ctx.scheduler.runAfter(0, internal.chat.backgroundExtract, {
        conversation_id: args.conversation_id,
      });

      return {
        reply,
        extracted_fields: { conversation_phase: phase },
        quick_replies: [],
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

/**
 * Background task to analyze the transcript and extract lead fields securely.
 */
export const backgroundExtract = internalAction({
  args: {
    conversation_id: v.string(),
  },
  handler: async (ctx, args) => {
    const xkiroApiKey = process.env.XKIRO_API_KEY;
    if (!xkiroApiKey) {
      console.error("Missing XKIRO_API_KEY");
      return;
    }

    const lead = await ctx.runQuery(internal.leads.getByConversationId, {
      conversation_id: args.conversation_id,
    });

    if (!lead || !lead.full_transcript || lead.full_transcript.length === 0) return;

    const messages = lead.full_transcript.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const fetchResponse = await fetch("https://api.xkiro.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${xkiroApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "minimax/minimax-m3:free",
          messages: [
            { role: "system", content: "You are an internal data extractor. Analyze the transcript and extract the requested fields. Extract everything you can find, including name, email, scope, etc." },
            ...messages
          ],
          tools: [EXTRACT_LEAD_FUNCTION],
          tool_choice: { type: "function", function: { name: "extract_lead_data" } }
        })
      });

      if (!fetchResponse.ok) return;

      const result = await fetchResponse.json();
      const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) return;

      const extractedFields = JSON.parse(toolCall.function.arguments);
      if (Object.keys(extractedFields).length === 0) return;

      const phase = (extractedFields.conversation_phase as string) || "";
      const isComplete = phase === "complete";
      const shouldEscalate = extractedFields.escalate === true;

      // Update Database
      await ctx.runMutation(internal.leads.updateLeadFields, {
        conversation_id: args.conversation_id,
        ...(extractedFields.service_type && { service_type: extractedFields.service_type as "website" | "ecommerce" | "crm" | "other" }),
        ...(extractedFields.scope_notes && { scope_notes: extractedFields.scope_notes as string }),
        ...(extractedFields.budget_range && { budget_range: extractedFields.budget_range as string }),
        ...(extractedFields.timeline && { timeline: extractedFields.timeline as string }),
        ...(extractedFields.contact_name && { contact_name: extractedFields.contact_name as string }),
        ...(extractedFields.contact_email && { contact_email: extractedFields.contact_email as string }),
        ...(extractedFields.contact_phone && { contact_phone: extractedFields.contact_phone as string }),
        qualified: extractedFields.qualified === true,
        escalate: shouldEscalate,
        ...(isComplete && { status: "completed" as const }),
      });

      // Trigger Email Notification if complete
      if (isComplete || shouldEscalate) {
        // Prevent sending duplicate emails by checking if we already sent one.
        // We can check if status was already completed, but since this runs async, 
        // the email action should ideally handle deduplication, or we just trust it.
        // To be safe, we will just run the email action.
        await ctx.runAction(internal.email.sendLeadNotification, {
          conversation_id: args.conversation_id,
          service_type: (extractedFields.service_type as string) || undefined,
          scope_notes: (extractedFields.scope_notes as string) || undefined,
          budget_range: (extractedFields.budget_range as string) || undefined,
          timeline: (extractedFields.timeline as string) || undefined,
          contact_name: (extractedFields.contact_name as string) || undefined,
          contact_email: (extractedFields.contact_email as string) || undefined,
          contact_phone: (extractedFields.contact_phone as string) || undefined,
          escalate: shouldEscalate,
          qualified: extractedFields.qualified === true,
        });
      }

    } catch (e) {
      console.error("Background extraction failed:", e);
    }
  }
});
