import { Resend } from "resend";
import { env } from "../config/env";

const resendClient = env.resendApiKey ? new Resend(env.resendApiKey) : null;

export const resendService = {
  isConfigured(): boolean {
    return resendClient !== null;
  },

  async sendIssueCreatedEmail(email: string, description: string): Promise<void> {
    if (!resendClient) {
      return;
    }

    await resendClient.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Issue Submitted Successfully",
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #111827;">
          <h2 style="margin-bottom: 8px;">Issue Submitted ✅</h2>
          <p style="margin: 0 0 8px;">Your issue has been successfully reported.</p>
          <p style="margin: 0;"><b>Description:</b> ${description}</p>
        </div>
      `
    });
  }
};
