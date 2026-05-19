import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FeedbackSchema = z.object({
  type: z.enum(["bug", "suggestion", "strategy", "other"]),
  subject: z.string().trim().min(1).max(200),
  email: z.union([z.string().email().max(200), z.literal("")]).optional(),
  message: z.string().trim().min(10).max(5000),
  // Honeypot: bots fill this; humans leave it empty.
  website: z.string().max(0).optional().default(""),
});

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`feedback:${ip}`, {
    windowMs: 10 * 60 * 1000,
    maxRequests: 5,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const parsed = FeedbackSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation" },
      { status: 400 },
    );
  }

  const { type, subject, email, message, website } = parsed.data;

  // Honeypot tripped — silently 200 so bots don't learn.
  if (website && website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (!env.RESEND_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "email_not_configured" },
      { status: 503 },
    );
  }

  const resend = new Resend(env.RESEND_API_KEY);

  const replyTo = email && email.length > 0 ? email : undefined;
  const emailSubject = `[Retours · ${type}] ${subject}`.slice(0, 200);
  const textBody = [
    `Type: ${type}`,
    `Sujet: ${subject}`,
    `Email: ${replyTo ?? "(non fourni)"}`,
    `IP: ${ip}`,
    "",
    "Message:",
    message,
  ].join("\n");

  try {
    const result = await resend.emails.send({
      from: env.FEEDBACK_FROM_EMAIL,
      to: env.FEEDBACK_TO_EMAIL,
      subject: emailSubject,
      text: textBody,
      ...(replyTo ? { replyTo } : {}),
    });
    if (result.error) {
      return NextResponse.json(
        { ok: false, error: "send_failed" },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "send_failed" },
      { status: 502 },
    );
  }
}
