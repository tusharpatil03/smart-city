import { AppError } from "../../shared/middleware/error.middleware";
import {
  CreateIssueRequestDto,
  CreateReportRequestDto,
  ISSUE_CATEGORIES,
  IssueCategory,
  REFERENCE_CATEGORIES,
  mapReferenceCategoryToIssueCategory
} from "./issue.types";

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return Number(value);
  }

  return Number.NaN;
};

const isValidCategory = (value: unknown): value is IssueCategory => {
  return typeof value === "string" && ISSUE_CATEGORIES.includes(value as IssueCategory);
};

const isValidReferenceCategory = (value: unknown): boolean => {
  return typeof value === "string" && REFERENCE_CATEGORIES.includes(value as (typeof REFERENCE_CATEGORIES)[number]);
};

const isLikelyBase64 = (value: string): boolean => {
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value) || /^[A-Za-z0-9+/=\s]+$/.test(value);
};

export const validateCreateIssueInput = (payload: unknown): CreateIssueRequestDto => {
  if (!payload || typeof payload !== "object") {
    throw new AppError("Invalid request payload", 400, "VALIDATION_ERROR");
  }

  const body = payload as Record<string, unknown>;
  const title = body.title;
  const description = body.description;
  const category = body.category;
  const location = body.location;
  const imagesRaw = body.images;

  if (!isNonEmptyString(title)) {
    throw new AppError("title is required", 400, "VALIDATION_ERROR", {
      field: "title"
    });
  }

  if (!isNonEmptyString(description)) {
    throw new AppError("description is required", 400, "VALIDATION_ERROR", {
      field: "description"
    });
  }

  if (!isValidCategory(category)) {
    throw new AppError(
      `category must be one of ${ISSUE_CATEGORIES.join(", ")}`,
      400,
      "VALIDATION_ERROR",
      { field: "category" }
    );
  }

  if (!location || typeof location !== "object") {
    throw new AppError("location is required", 400, "VALIDATION_ERROR", {
      field: "location"
    });
  }

  const locationObj = location as Record<string, unknown>;
  const lat = toNumber(locationObj.lat);
  const lng = toNumber(locationObj.lng);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new AppError("location.lat must be between -90 and 90", 400, "VALIDATION_ERROR", {
      field: "location.lat"
    });
  }

  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new AppError("location.lng must be between -180 and 180", 400, "VALIDATION_ERROR", {
      field: "location.lng"
    });
  }

  if (imagesRaw !== undefined && !Array.isArray(imagesRaw)) {
    throw new AppError("images must be an array", 400, "VALIDATION_ERROR", {
      field: "images"
    });
  }

  const images: string[] = Array.isArray(imagesRaw)
    ? imagesRaw.map((entry) => {
        if (!isNonEmptyString(entry) || !isLikelyBase64(entry)) {
          throw new AppError(
            "images must contain base64 strings",
            400,
            "VALIDATION_ERROR",
            { field: "images" }
          );
        }

        return entry.trim();
      })
    : [];

  return {
    title: title.trim(),
    description: description.trim(),
    category,
    location: {
      lat,
      lng
    },
    images
  };
};

export const validateCreateReportInput = (payload: unknown): CreateReportRequestDto => {
  if (!payload || typeof payload !== "object") {
    throw new AppError("Invalid request payload", 400, "VALIDATION_ERROR");
  }

  const body = payload as Record<string, unknown>;
  const title = body.title;
  const description = body.description;
  const category = body.category;
  const latitude = toNumber(body.latitude);
  const longitude = toNumber(body.longitude);
  const imageRaw = body.image;

  if (!isNonEmptyString(title)) {
    throw new AppError("title is required", 400, "VALIDATION_ERROR", {
      field: "title"
    });
  }

  if (!isNonEmptyString(description)) {
    throw new AppError("description is required", 400, "VALIDATION_ERROR", {
      field: "description"
    });
  }

  if (!isValidReferenceCategory(category)) {
    throw new AppError(
      `category must be one of ${REFERENCE_CATEGORIES.join(", ")}`,
      400,
      "VALIDATION_ERROR",
      { field: "category" }
    );
  }

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new AppError("latitude must be between -90 and 90", 400, "VALIDATION_ERROR", {
      field: "latitude"
    });
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new AppError("longitude must be between -180 and 180", 400, "VALIDATION_ERROR", {
      field: "longitude"
    });
  }

  const image = imageRaw === null || imageRaw === undefined ? null : imageRaw;

  if (image !== null && (!isNonEmptyString(image) || !isLikelyBase64(image))) {
    throw new AppError("image must be a base64 string or null", 400, "VALIDATION_ERROR", {
      field: "image"
    });
  }

  return {
    title: title.trim(),
    description: description.trim(),
    category: mapReferenceCategoryToIssueCategory(category as (typeof REFERENCE_CATEGORIES)[number]),
    latitude,
    longitude,
    image: image ? image.trim() : null
  };
};
