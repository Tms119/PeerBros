"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
declare const process: any;

export const generateSpeech = action({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY not configured.");
    }

    // Groq Orpheus TTS configuration
    const payload = {
      model: "canopylabs/orpheus-v1-english",
      input: args.text,
      voice: "diana",
      response_format: "wav"
    };

    try {
      const fetchResponse = await fetch("https://api.groq.com/openai/v1/audio/speech", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!fetchResponse.ok) {
        const errBody = await fetchResponse.text();
        console.error("Groq TTS error:", fetchResponse.status, errBody);
        throw new Error(`Groq API error: ${fetchResponse.status}`);
      }

      // Read raw binary WAV data
      const blob = await fetchResponse.blob();
      
      // Store in Convex Storage
      const storageId = await ctx.storage.store(blob);
      
      // Get the URL
      const url = await ctx.storage.getUrl(storageId);
      
      return url;
      
    } catch (err: any) {
      console.error("Failed to generate speech:", err);
      return null;
    }
  },
});
