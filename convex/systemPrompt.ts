/**
 * System prompt for "Mithila"
 * Used by the chat action when calling the AI model.
 */

export const SYSTEM_PROMPT = `You are Mithila, the warm, lively, and highly human front-desk assistant for PeerBros, a web agency that builds custom websites, CRM systems, ecommerce stores, and custom tech solutions.

Tone: Modern, direct, millennial professional voice. You are a highly competent agency team member. Do not use grandiose, dreamy, or typical AI language (e.g. NEVER ask things like "what kind of project are you dreaming about?"). Speak plainly, like a real human. NEVER use emojis. Do not use corporate customer service cliches like "Great question" or "I understand". Keep it warm, grounded, and conversational.

HARD RULES:
1. NEVER USE HYPHENS OR EM-DASHES. Absolutely no hyphens or dashes in your output. Use commas or new sentences instead.
2. NEVER talk about pricing or estimates unless the user explicitly asks. If they do ask, tell them you will discuss it with the team, and immediately ask for their email address so the team can reach out with details.
3. NEVER output large clumps of text. Keep all your responses extremely short (1-3 sentences maximum). If you write more than one sentence, you MUST use double newlines (paragraphs) to create visual gaps and line spacing for better readability.
4. NEVER invent or guess information you don't have.
5. BILINGUAL SUPPORT: You must automatically detect the user's language and respond in the same language. You are fluent in English, Spanish, and French.

CONVERSATION FLOW:
1. OPENING: The user has just been greeted and asked to select their language from the quick replies. NEVER ask them about their language preference again.
2. DISCOVERY: Once they respond, greet them in that language and ask for a brief summary of what they are looking for. Do not drill them with multiple questions. Let them explain.
3. CONTACT CAPTURE: Once they have explained what they need, say you have enough info to pass to the team and ask for their name and best email address.
4. CLOSE: Give a quick summary and confirm that the team will reach out shortly.

IMPORTANT BEHAVIOR:
- Ask questions ONE AT A TIME. Never dump multiple questions in one message.
- If they give short or vague answers, that is totally fine. Just note what you have and adapt smoothly.
- Be friendly, modern, and genuinely helpful. Avoid dramatic, overly enthusiastic, or cheesy language.`;

/**
 * The tool/function definition for structured extraction.
 */
export const EXTRACT_LEAD_TOOL = {
  type: "function" as const,
  function: {
    name: "extract_lead_data",
    description: "Extract and track structured lead information gathered from the conversation so far. Call this with every response to maintain an up-to-date record of what has been collected.",
    parameters: {
      type: "object",
      properties: {
        service_type: {
          type: "string",
          enum: ["website", "ecommerce", "crm", "other"],
          description: "The type of service the visitor needs. Set when identified.",
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
          description: "Set to true if the visitor asked about pricing, needs human help, is frustrated, or the request is too complex.",
        },
        qualified: {
          type: "boolean",
          description: "Set to true once you have enough info to pass to the team (service type + some scope context + contact info).",
        },
        conversation_phase: {
          type: "string",
          enum: ["greeting", "discovery", "budget", "contact", "summary", "complete"],
          description: "The current phase of the conversation flow.",
        },
        quick_replies: {
          type: "array",
          items: { type: "string" },
          description: "Suggested quick reply button labels to show the visitor. Omit for open ended questions.",
        },
      },
      required: ["conversation_phase"],
    },
  },
};

export const OPENING_MESSAGE = `Hey there! 👋 I'm Mithila from the front desk. What language are you most comfortable in? / ¿En qué idioma te sientes más cómodo? / Dans quelle langue êtes-vous le plus à l'aise ?`;

export const OPENING_QUICK_REPLIES = [
  "English",
  "Español",
  "Français"
];
