import { Router } from "express";
import { authController } from "./auth.controller";

const authRouter = Router();

authRouter.post("/register", (req, res, next) => {
  void authController.register(req, res, next);
});

authRouter.post("/login", (req, res, next) => {
  void authController.login(req, res, next);
});

export { authRouter };
