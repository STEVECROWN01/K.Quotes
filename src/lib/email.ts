// Email self-BCC via Resend.
// Sends a copy of the generated PDF to the configured address (SELF_BCC_EMAIL)
// for archival. No client email is ever sent — this is for the Keter operator only.
//
// Env vars (see .env.example):
//   RESEND_API_KEY       — Resend.com API key (free tier: 100 emails/day)
//   SELF_BCC_EMAIL       — recipient address (you)
//   RESEND_FROM_EMAIL    — sender address (must be a verified domain on Resend,
//                          or use onboarding@resend.dev for testing)

import { Resend } from "resend";

let client: Resend | null = null;

function getResend(): Resend {
  if (client) return client;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY env var is not set");
  }
  client = new Resend(apiKey);
  return client;
}

export function isEmailConfigured(): boolean {
  return !!(
    process.env.RESEND_API_KEY &&
    process.env.SELF_BCC_EMAIL &&
    process.env.RESEND_FROM_EMAIL
  );
}

export type EmailAttachment = {
  filename: string;
  content: Buffer; // base64-encoded by Resend SDK when sent
  contentType?: string;
};

/**
 * Send a PDF copy to the operator (SELF_BCC_EMAIL).
 * Returns the Resend message id on success, throws on failure.
 *
 * Skips silently if email is not configured (so the form toggle can stay on
 * without crashing in dev without keys).
 */
export async function sendPdfSelfCopy(opts: {
  to?: string; // override recipient (default: SELF_BCC_EMAIL)
  subject: string;
  bodyHtml: string;
  bodyText: string;
  attachment: EmailAttachment;
}): Promise<string | null> {
  if (!isEmailConfigured()) {
    console.warn(
      "[email] Skipping self-BCC: RESEND_API_KEY, SELF_BCC_EMAIL, or RESEND_FROM_EMAIL not set."
    );
    return null;
  }

  const resend = getResend();
  const to = opts.to || process.env.SELF_BCC_EMAIL!;
  const from = process.env.RESEND_FROM_EMAIL!;

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: opts.subject,
    html: opts.bodyHtml,
    text: opts.bodyText,
    attachments: [
      {
        filename: opts.attachment.filename,
        content: opts.attachment.content,
        content_type: opts.attachment.contentType || "application/pdf",
      },
    ],
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }
  return data?.id ?? null;
}
