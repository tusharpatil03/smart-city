import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../shared/config/env";
import { AppError } from "../../shared/middleware/error.middleware";
import { authRepository } from "./auth.repository";
import {
  AuthResponse,
  AuthenticatedAuthority,
  LoginAuthorityInput,
  RegisterAuthorityInput
} from "./auth.types";

const toAuthorityPayload = (user: {
  _id: { toString(): string };
  name: string;
  email: string;
  role: "authority";
}): AuthenticatedAuthority => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role
});

export class AuthService {
  async registerAuthority(input: RegisterAuthorityInput): Promise<{ message: string }> {
    const name = input.name.trim();
    const email = input.email.toLowerCase().trim();
    const password = input.password.trim();

    if (name.length < 2) {
      throw new AppError("name must be at least 2 characters", 400);
    }

    if (!email.includes("@")) {
      throw new AppError("valid email is required", 400);
    }

    if (password.length < 6) {
      throw new AppError("password must be at least 6 characters", 400);
    }

    const existing = await authRepository.findByEmail(email);

    if (existing) {
      throw new AppError("Authority account already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await authRepository.createUser({
      name,
      email,
      password: hashedPassword,
      role: "authority"
    });

    return {
      message: "Authority account created successfully"
    };
  }

  async loginAuthority(input: LoginAuthorityInput): Promise<AuthResponse> {
    const email = input.email.toLowerCase().trim();
    const password = input.password;

    const user = await authRepository.findByEmail(email);

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = jwt.sign({ id: user._id.toString(), role: user.role }, env.jwtSecret, {
      expiresIn: "7d"
    });

    return {
      token,
      user: toAuthorityPayload(user)
    };
  }

  async getAuthorityById(id: string): Promise<AuthenticatedAuthority> {
    const user = await authRepository.findById(id);

    if (!user) {
      throw new AppError("Authority not found", 401);
    }

    return toAuthorityPayload(user);
  }
}

export const authService = new AuthService();
