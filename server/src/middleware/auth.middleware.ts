import { Response, Request, NextFunction } from "express";
import { supabase } from "../lib/supabase.js";

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

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({
      error: "Unauthorized",
      code: "ERR_UNAUTHORIZED",
      message: "Invalid token",
    });
  }

  (req as any).user = data.user;
  next();
};
