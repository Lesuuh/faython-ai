import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { User } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { config, isSupabaseConfigured } from "../config/index.js";
import { forbidden, unauthorized } from "../lib/errors.js";

export type AuthRequest = Request & { user: User };

type SupabaseClaims = {
  sub: string;
  email?: string;
  user_metadata?: { full_name?: string; name?: string; avatar_url?: string };
};

function verifySupabaseToken(token: string): SupabaseClaims {
  if (!isSupabaseConfigured()) {
    throw unauthorized("Authentication is not configured yet.");
  }
  try {
    const decoded = jwt.verify(token, config.supabase.jwtSecret, {
      algorithms: ["HS256"],
    }) as jwt.JwtPayload;
    if (!decoded.sub) throw new Error("Missing sub");
    return decoded as SupabaseClaims;
  } catch {
    throw unauthorized("Invalid or expired session");
  }
}

// Keep the app's User table in sync with Supabase Auth records.
export async function resolveUser(claims: SupabaseClaims): Promise<User> {
  const id = claims.sub;
  const email = (claims.email || "").toLowerCase();
  const meta = claims.user_metadata || {};
  const name = meta.full_name || meta.name || email.split("@")[0] || "Student";
  const avatarUrl = meta.avatar_url || null;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (existing) {
    if (existing.email !== email || existing.name !== name || existing.avatarUrl !== avatarUrl) {
      return prisma.user.update({
        where: { id },
        data: { email, name, avatarUrl },
      });
    }
    return existing;
  }

  return prisma.user.create({
    data: { id, email, name, avatarUrl, emailVerified: true },
  });
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) throw unauthorized("Missing access token");

    const claims = verifySupabaseToken(token);
    const user = await resolveUser(claims);

    (req as AuthRequest).user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const user = (req as AuthRequest).user;
  if (user.role !== "ADMIN") return next(forbidden("Admin access required"));
  next();
}