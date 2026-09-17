"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
declare const process: any;

export const generateSpeech = action({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const minimaxApiKey = process.env.MINIMAX_API_KEY;
    const minimaxGroupId = process.env.MINIMAX_GROUP_ID;

    if (!minimaxApiKey || !minimaxGroupId) {
      throw new Error("MINIMAX_API_KEY or MINIMAX_GROUP_ID not configured.");
    }

    // Minimax T2A v2 configuration
    const payload = {
      model: "speech-01-turbo", // fast and realistic model
      text: args.text,
      voice_setting: {
        voice_id: "female-shaonv", // A pleasant female voice
        speed: 1.1,
        vol: 1.0,
        pitch: 0
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: "mp3"
      }
    };

    try {
      const fetchResponse = await fetch(`https://api.minimaxi.chat/v1/t2a_v2?GroupId=${minimaxGroupId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${minimaxApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!fetchResponse.ok) {
        const errBody = await fetchResponse.text();
        console.error("Minimax T2A error:", fetchResponse.status, errBody);
        throw new Error(`Minimax API error: ${fetchResponse.status}`);
      }

      // Minimax returns JSON with the audio data in a hex string, according to some docs, OR it returns raw binary.
      // Wait, let's parse as JSON first in case it returns an error or base64 structure.
      // Let's check the content type to be safe.
      const contentType = fetchResponse.headers.get("content-type") || "";
      
      let blob: Blob;
      
      if (contentType.includes("application/json")) {
        const result = await fetchResponse.json();
        // Sometimes Minimax returns data in result.data.audio (hex string format)
        // If it's an error, handle it
        if (result.base_resp && result.base_resp.status_code !== 0) {
           console.error("API error inside JSON:", result);
           return null;
        }
        if (result.data && result.data.audio) {
          // Convert hex to uint8array
          const hex = result.data.audio;
          const bytes = new Uint8Array(Math.ceil(hex.length / 2));
          for (let i = 0; i < bytes.length; i++) {
              bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
          }
          blob = new Blob([bytes], { type: 'audio/mp3' });
        } else {
          return null; // unexpected format
        }
      } else {
         // It's raw binary
         blob = await fetchResponse.blob();
      }
      
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
