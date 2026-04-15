import { Document, Model, Schema, model } from "mongoose";

export type UserRole = "authority";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["authority"],
      default: "authority",
      required: true
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

userSchema.index({ email: 1 }, { unique: true });

export const UserModel: Model<UserDocument> = model<UserDocument>("User", userSchema);
