import cors from "cors";
import express from "express";
import morgan from "morgan";
import { authRouter } from "./modules/auth/auth.routes";
import { issueController } from "./modules/issue/issue.controller";
import { issueRouter } from "./modules/issue/issue.routes";
import { errorMiddleware, notFoundMiddleware } from "./shared/middleware/error.middleware";

export const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok"
  });
});

app.get("/api/healthz", (_req, res) => {
  res.status(200).json({
    status: "ok"
  });
});

app.use("/api/auth", authRouter);

app.post("/api/report", (req, res, next) => {
  void issueController.createReport(req, res, next);
});

app.get("/api/reports", (req, res, next) => {
  void issueController.getReports(req, res, next);
});

app.use("/api/issues", issueRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
