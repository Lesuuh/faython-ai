import { Response, Request, NextFunction } from "express";
import { jwtVerify, createRemoteJWKSet } from "jose";

const BASE = process.env.NEON_AUTH_BASE_URL;
if (!BASE) throw new Error("NEON_AUTH_BASE_URL is not set");

const ORIGIN = new URL(BASE).origin;
const JWKS = createRemoteJWKSet(new URL(`${BASE}/.well-known/jwks.json`));

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
      code: "ERR_UNAUTHORIZED",
      message: "No token provided",
    });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      algorithms: ["EdDSA"],
      issuer: ORIGIN,
      audience: ORIGIN,
    });

    (req as any).user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
    next();
  } catch (err) {
    console.error("Token check failed:", (err as Error).message);
    return res.status(401).json({
      error: "Unauthorized",
      code: "ERR_UNAUTHORIZED",
      message: "Invalid token",
    });
  }
};