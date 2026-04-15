import { FilterQuery } from "mongoose";
import { GeoFilter } from "../../shared/utils/geo.utils";
import { IssueDocument, IssueModel } from "./issue.model";
import { IssueStatus } from "./issue.types";

export interface CreateIssueRepositoryInput {
  title: string;
  description?: string;
  image_url?: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
}

export class IssueRepository {
  async create(input: CreateIssueRepositoryInput): Promise<IssueDocument> {
    return IssueModel.create(input);
  }

  async findAll(filter?: GeoFilter): Promise<IssueDocument[]> {
    if (!filter) {
      return IssueModel.find().sort({ createdAt: -1 });
    }

    return IssueModel.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [filter.longitude, filter.latitude]
          },
          $maxDistance: filter.maxDistanceMeters ?? 5000
        }
      }
    } as FilterQuery<IssueDocument>).sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IssueDocument | null> {
    return IssueModel.findById(id);
  }

  async updateStatus(id: string, status: IssueStatus): Promise<IssueDocument | null> {
    return IssueModel.findByIdAndUpdate(id, { status }, { new: true });
  }
}

export const issueRepository = new IssueRepository();
