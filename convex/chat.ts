"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "./systemPrompt";

/**
 * Gemini function declaration for structured lead extraction.
 * Uses Google's native schema format (different from OpenAI's).
 */
const EXTRACT_LEAD_FUNCTION = {
  name: "extract_lead_data",
  description:
    "Extract and track structured lead information gathered from the conversation so far. Call this with every response.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      service_type: {
        type: SchemaType.STRING,
        format: "enum",
        description: "The type of service: website, ecommerce, crm, or other.",
        enum: ["website", "ecommerce", "crm", "other"],
      },
      scope_notes: {
        type: SchemaType.STRING,
        description: "Free-text summary of what the visitor needs.",
      },
      budget_range: {
        type: SchemaType.STRING,
        description: "The visitor's stated budget range, if provided.",
      },
      timeline: {
        type: SchemaType.STRING,
        description: "The visitor's stated timeline, if provided.",
      },
      contact_name: {
        type: SchemaType.STRING,
        description: "The visitor's name, if provided.",
      },
      contact_email: {
        type: SchemaType.STRING,
        description: "The visitor's email address, if provided.",
      },
      contact_phone: {
        type: SchemaType.STRING,
        description: "The visitor's phone number, if provided.",
      },
      escalate: {
        type: SchemaType.BOOLEAN,
        description:
          "Set to true if visitor asked about pricing, needs human help, is frustrated, or the request is too complex.",
      },
      qualified: {
        type: SchemaType.BOOLEAN,
        description:
          "Set to true once you have enough info to pass to the team (service type + scope + contact info).",
      },
      conversation_phase: {
        type: SchemaType.STRING,
        format: "enum",
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
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description:
          "Suggested quick-reply buttons to show. Use for service selection, yes/no, or clear choices.",
      },
    },
    required: ["conversation_phase"],
  },
};

/**
 * Main chat action: receives a user message, calls Gemini with function
 * calling, returns the bot reply + extracted lead fields, and persists
 * everything to the database.
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
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      throw new Error(
        "GEMINI_API_KEY not configured. Set it with: npx convex env set GEMINI_API_KEY=your_key"
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

    // Build chat history for Gemini
    // Gemini uses "user" and "model" roles (not "assistant")
    const history = args.history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ functionDeclarations: [EXTRACT_LEAD_FUNCTION as any] }],
      });

      const chat = model.startChat({ history: history as any });
      const result = await chat.sendMessage(args.message);
      const response = result.response;

      let reply = "";
      let extractedFields: Record<string, any> = {};
      let quickReplies: string[] = [];

      // Process the response parts
      for (const candidate of response.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          // Text content
          if (part.text) {
            reply += part.text;
          }
          // Function call (structured extraction)
          if (part.functionCall && part.functionCall.name === "extract_lead_data") {
            extractedFields = (part.functionCall.args as Record<string, any>) || {};
            quickReplies = (extractedFields.quick_replies as string[]) || [];
          }
        }
      }

      // If Gemini returned ONLY a function call (no text), do a follow-up
      // by sending the function response back to get the conversational reply
      if (!reply.trim() && Object.keys(extractedFields).length > 0) {
        try {
          const followUp = await chat.sendMessage([
            {
              functionResponse: {
                name: "extract_lead_data",
                response: { status: "recorded" },
              },
            },
          ]);
          reply = followUp.response.text() || "";
        } catch (followUpError) {
          console.error("Follow-up call failed:", followUpError);
        }
      }

      // Strip any reasoning traces
      reply = reply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

      // Fallback if still no reply
      if (!reply) {
        reply = "I'll pass this to the team — they'll be in touch soon!";
      }

      // Save bot reply to transcript
      await ctx.runMutation(internal.leads.appendMessage, {
        conversation_id: args.conversation_id,
        role: "assistant",
        content: reply,
      });

      // Update lead fields from extraction (only if we got structured data)
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
      console.error("Gemini API error:", error);

      // Rate limit handling
      if (
        error?.status === 429 ||
        error?.message?.includes("rate") ||
        error?.message?.includes("quota")
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
