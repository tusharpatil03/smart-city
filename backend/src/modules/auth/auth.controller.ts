import { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.registerAuthority(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.loginAuthority(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
