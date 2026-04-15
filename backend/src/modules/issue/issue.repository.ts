import { FilterQuery } from "mongoose";
import { GeoFilter } from "../../shared/utils/geo.utils";
import { IssueDocument, IssueModel } from "./issue.model";
import { IssueCategory, IssueStatus, VoteType, IssueStats } from "./issue.types";

export interface CreateIssueRepositoryInput {
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
  duplicate_of?: string;
}

export class IssueRepository {
  async createIssue(input: CreateIssueRepositoryInput): Promise<IssueDocument> {
    return IssueModel.create(input);
  }

  async findNearbyByCategory(
    category: IssueCategory,
    longitude: number,
    latitude: number,
    radiusMeters = 50
  ): Promise<IssueDocument | null> {
    return IssueModel.findOne({
      category,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusMeters
        }
      }
    } as FilterQuery<IssueDocument>).sort({ created_at: -1 });
  }

  async findAll(filter?: GeoFilter): Promise<IssueDocument[]> {
    if (!filter) {
      return IssueModel.find().sort({ created_at: -1 });
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
    } as FilterQuery<IssueDocument>).sort({ created_at: -1 });
  }

  async findById(id: string): Promise<IssueDocument | null> {
    return IssueModel.findById(id);
  }

  async updateStatus(id: string, status: IssueStatus): Promise<IssueDocument | null> {
    return IssueModel.findByIdAndUpdate(id, { status }, { new: true });
  }

  async saveVote(
    issueId: string,
    userId: string,
    type: VoteType
  ): Promise<IssueDocument | null> {
    const issue = await IssueModel.findById(issueId);

    if (!issue) {
      return null;
    }

    const existingVote = issue.votes.find((vote) => vote.userId.toString() === userId);

    if (!existingVote) {
      issue.votes.push({
        userId,
        type
      });
    } else if (existingVote.type === type) {
      issue.votes = issue.votes.filter((vote) => vote.userId.toString() !== userId);
    } else {
      existingVote.type = type;
    }

    await issue.save();
    return issue;
  }

  async getStats(): Promise<IssueStats> {
    const [total, reported, inProgress, resolved] = await Promise.all([
      IssueModel.countDocuments(),
      IssueModel.countDocuments({ status: IssueStatus.REPORTED }),
      IssueModel.countDocuments({ status: IssueStatus.IN_PROGRESS }),
      IssueModel.countDocuments({ status: IssueStatus.RESOLVED })
    ]);

    return {
      total,
      reported,
      inProgress,
      resolved
    };
  }
}

export const issueRepository = new IssueRepository();
