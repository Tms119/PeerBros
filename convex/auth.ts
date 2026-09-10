import { mutation, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Helper to hash a password using SHA-256.
 * Convex supports standard Web Crypto APIs in mutations.
 */
async function hashPassword(password: string) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Login mutation.
 * Checks if the email exists and the hashed password matches.
 */
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!admin) {
      return { success: false, message: "Invalid email or password" };
    }

    const hashedPassword = await hashPassword(args.password);

    if (admin.password !== hashedPassword) {
      return { success: false, message: "Invalid email or password" };
    }

    return { success: true };
  },
});

/**
 * One-time setup mutation to initialize the first admin account.
 * You can call this from a script or briefly from the UI.
 */
export const initAdmin = internalMutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message?: string }> => {
    const existing = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return { success: false, message: "Admin already exists" };
    }

    const hashedPassword = await hashPassword(args.password);

    await ctx.db.insert("admins", {
      email: args.email,
      password: hashedPassword,
    });

    return { success: true };
  },
});

/**
 * Action to setup admin and send credentials email.
 */
export const setupAdmin = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message?: string }> => {
    // 1. Initialize admin in DB
    const initResult = (await ctx.runMutation(internal.auth.initAdmin, {
      email: args.email,
      password: args.password,
    })) as { success: boolean; message?: string };

    if (!initResult.success) {
      return { success: false, message: initResult.message };
    }

    // 2. Send email
    await ctx.runAction(internal.email.sendAdminCredentialsEmail, {
      email: args.email,
      password: args.password,
    });

    return { success: true };
  },
});
