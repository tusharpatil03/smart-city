import { Router } from "express";
import { aiController } from "./ai.controller";

const aiRouter = Router();

aiRouter.post("/categorize", (req, res, next) => {
  aiController.categorize(req, res, next);
});

export { aiRouter };