import type { Admin } from "../../prisma";
import "express";

declare module "express-serve-static-core" {
  interface Request {
    admin?: any;
  }
}
