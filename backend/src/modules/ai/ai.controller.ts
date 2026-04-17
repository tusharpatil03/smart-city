import { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/middleware/error.middleware";
import { REFERENCE_CATEGORIES, type ReferenceCategory } from "../issue/issue.types";

type CategoryScores = Record<ReferenceCategory, number>;

const KEYWORD_RULES: Array<{ category: ReferenceCategory; keywords: string[] }> = [
  {
    category: "Pothole",
    keywords: ["pothole", "road broken", "road crack", "crater", "road hole", "road collapsed"]
  },
  {
    category: "Garbage",
    keywords: ["garbage", "trash", "waste", "dump", "bin overflow", "litter", "rubbish"]
  },
  {
    category: "Streetlight",
    keywords: [
      "streetlight",
      "street light",
      "light not working",
      "light broken",
      "lamp post",
      "dark street"
    ]
  },
  {
    category: "Flooding",
    keywords: ["flood", "flooding", "water logging", "waterlogged", "drain overflow", "water on road"]
  },
  {
    category: "Graffiti",
    keywords: ["graffiti", "wall paint", "wall writing", "vandalism", "spray paint"]
  },
  {
    category: "Road Damage",
    keywords: ["road damage", "damaged road", "broken road", "uneven road", "road erosion", "bad road"]
  }
];

const buildDefaultScores = (): CategoryScores => ({
  Pothole: 0,
  Garbage: 0,
  Streetlight: 0,
  Flooding: 0,
  Graffiti: 0,
  "Road Damage": 0,
  Other: 0
});

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const categorizeByKeywords = (content: string): ReferenceCategory => {
  const normalized = normalizeText(content);

  if (!normalized) {
    return "Other";
  }

  const scores = buildDefaultScores();

  KEYWORD_RULES.forEach(({ category, keywords }) => {
    keywords.forEach((keyword) => {
      if (normalized.includes(keyword)) {
        // Longer matches are usually stronger signals for intent.
        scores[category] += keyword.split(" ").length;
      }
    });
  });

  if (/(light\s+(is\s+)?(not\s+working|broken|fused|out))/i.test(normalized)) {
    scores.Streetlight += 3;
  }

  if (/(water\s+(is\s+)?(logged|logging)|road\s+flood(ed|ing)?)/i.test(normalized)) {
    scores.Flooding += 3;
  }

  const top = (Object.keys(scores) as ReferenceCategory[])
    .map((category) => ({ category, score: scores[category] }))
    .sort((a, b) => b.score - a.score)[0];

  if (!top || top.score <= 0) {
    return "Other";
  }

  return top.category;
};

export class AiController {
  categorize(req: Request, res: Response, next: NextFunction): void {
    try {
      const { description, title } = req.body as {
        description?: unknown;
        title?: unknown;
      };

      const normalizedDescription = typeof description === "string" ? description.trim() : "";
      const normalizedTitle = typeof title === "string" ? title.trim() : "";

      if (!normalizedDescription && !normalizedTitle) {
        throw new AppError("Title or description is required", 400, "INVALID_INPUT");
      }

      const category = categorizeByKeywords(`${normalizedTitle} ${normalizedDescription}`);

      if (!REFERENCE_CATEGORIES.includes(category)) {
        throw new AppError("Unable to categorize issue text", 500, "CATEGORY_ERROR");
      }

      res.status(200).json({ category });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AiController();