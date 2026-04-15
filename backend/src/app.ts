import cors from "cors";
import express from "express";
import morgan from "morgan";
import { issueRouter } from "./modules/issue/issue.routes";
import { errorMiddleware, notFoundMiddleware } from "./shared/middleware/error.middleware";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok"
  });
});

app.use("/issues", issueRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
