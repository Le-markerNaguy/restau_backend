import type { Admin } from "../../prisma";
import { User } from "../models/User";
import "express";

declare module "express-serve-static-core" {
  interface Request {
    admin?: any;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
