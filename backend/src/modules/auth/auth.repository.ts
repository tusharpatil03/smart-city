import { UserDocument, UserModel } from "./auth.model";

export class AuthRepository {
  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase().trim() });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id);
  }

  async createUser(input: {
    name: string;
    email: string;
    password: string;
    role: "authority";
  }): Promise<UserDocument> {
    return UserModel.create({
      ...input,
      email: input.email.toLowerCase().trim()
    });
  }
}

export const authRepository = new AuthRepository();
