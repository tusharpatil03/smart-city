import { Document, Model, Schema, model } from "mongoose";
import { IssueStatus } from "./issue.types";

export interface IssueDocument extends Document {
  title: string;
  description?: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  image_url?: string;
  status: IssueStatus;
  createdAt: Date;
  updatedAt: Date;
}

const issueSchema = new Schema<IssueDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
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
    image_url: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(IssueStatus),
      default: IssueStatus.OPEN,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

issueSchema.index({ location: "2dsphere" });

export const IssueModel: Model<IssueDocument> = model<IssueDocument>("Issue", issueSchema);
