import { Document, Model, Schema, model } from "mongoose";
import { IssueCategory, ISSUE_CATEGORIES, IssueStatus } from "./issue.types";

export interface IssueDocument extends Document {
  title: string;
  description: string;
  category: IssueCategory;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  images: string[];
  address: string;
  status: IssueStatus;
  assigned_to: string;
  priority_score: number;
  duplicate_of?: Schema.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const issueSchema = new Schema<IssueDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 160
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 2000
    },
    category: {
      type: String,
      required: true,
      enum: ISSUE_CATEGORIES
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (value: number[]): boolean => value.length === 2,
          message: "Location coordinates must contain [longitude, latitude]"
        }
      }
    },
    images: {
      type: [String],
      default: []
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(IssueStatus),
      default: IssueStatus.REPORTED,
      required: true
    },
    assigned_to: {
      type: String,
      required: true,
      trim: true
    },
    priority_score: {
      type: Number,
      default: 0,
      min: 0
    },
    duplicate_of: {
      type: Schema.Types.ObjectId,
      ref: "Issue"
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    },
    versionKey: false
  }
);

issueSchema.index({ location: "2dsphere" });
issueSchema.index({ category: 1, created_at: -1 });

export const IssueModel: Model<IssueDocument> = model<IssueDocument>("Issue", issueSchema);
