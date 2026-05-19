"use client";

import { useState, type FormEvent } from "react";

type FeedbackType = "bug" | "suggestion" | "strategy" | "other";

interface FeedbackFormProps {
  labels: {
    typeLabel: string;
    typeOptions: Record<FeedbackType, string>;
    subjectLabel: string;
    subjectPlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    counterTemplate: string;
    submit: string;
    submitting: string;
    success: string;
    errors: {
      generic: string;
      rateLimited: string;
      validation: string;
      subjectRequired: string;
      messageRequired: string;
      emailInvalid: string;
    };
    honeypotLabel: string;
  };
}

const TYPES: FeedbackType[] = ["bug", "suggestion", "strategy", "other"];
const MESSAGE_MAX = 5000;
const MESSAGE_AMBER_THRESHOLD = 4500;
const MESSAGE_ROSE_THRESHOLD = 4900;

interface FieldErrors {
  subject?: string;
  message?: string;
  email?: string;
}

export function FeedbackForm({ labels }: FeedbackFormProps) {
  const [type, setType] = useState<FeedbackType>("bug");
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    if (subject.trim().length === 0)
      errs.subject = labels.errors.subjectRequired;
    if (message.trim().length < 10)
      errs.message = labels.errors.messageRequired;
    if (email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = labels.errors.emailInvalid;
    }
    return errs;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/retours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          subject,
          email,
          message,
          website: honeypot,
        }),
      });
      if (res.ok) {
        setStatus("success");
        setSubject("");
        setEmail("");
        setMessage("");
        return;
      }
      let errorKey: string | null = null;
      try {
        const body = (await res.json()) as { error?: string };
        errorKey = body.error ?? null;
      } catch {
        // ignore parse failure
      }
      if (res.status === 429 || errorKey === "rate_limited") {
        setServerError(labels.errors.rateLimited);
      } else if (errorKey === "validation") {
        setServerError(labels.errors.validation);
      } else {
        setServerError(labels.errors.generic);
      }
      setStatus("error");
    } catch {
      setServerError(labels.errors.generic);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.04] p-6 text-sm leading-relaxed">
        <p className="font-semibold text-emerald-200">{labels.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="feedback-type"
          className="text-foreground/90 text-sm font-medium"
        >
          {labels.typeLabel}
        </label>
        <select
          id="feedback-type"
          value={type}
          onChange={(e) => setType(e.target.value as FeedbackType)}
          className="border-border bg-background/60 focus:border-gold/60 focus:ring-gold/30 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {labels.typeOptions[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="feedback-subject"
          className="text-foreground/90 text-sm font-medium"
        >
          {labels.subjectLabel}
        </label>
        <input
          id="feedback-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={labels.subjectPlaceholder}
          maxLength={200}
          required
          aria-invalid={Boolean(fieldErrors.subject)}
          aria-describedby={
            fieldErrors.subject ? "feedback-subject-error" : undefined
          }
          className="border-border bg-background/60 focus:border-gold/60 focus:ring-gold/30 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
        />
        {fieldErrors.subject && (
          <p id="feedback-subject-error" className="text-xs text-rose-300">
            {fieldErrors.subject}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="feedback-email"
          className="text-foreground/90 text-sm font-medium"
        >
          {labels.emailLabel}
        </label>
        <input
          id="feedback-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={labels.emailPlaceholder}
          maxLength={200}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={
            fieldErrors.email ? "feedback-email-error" : undefined
          }
          className="border-border bg-background/60 focus:border-gold/60 focus:ring-gold/30 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
        />
        {fieldErrors.email && (
          <p id="feedback-email-error" className="text-xs text-rose-300">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="feedback-message"
          className="text-foreground/90 text-sm font-medium"
        >
          {labels.messageLabel}
        </label>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={labels.messagePlaceholder}
          rows={7}
          maxLength={MESSAGE_MAX}
          required
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={`feedback-message-counter${fieldErrors.message ? " feedback-message-error" : ""}`}
          className="border-border bg-background/60 focus:border-gold/60 focus:ring-gold/30 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
        />
        <p
          id="feedback-message-counter"
          aria-live="polite"
          className={`text-xs ${
            message.length > MESSAGE_ROSE_THRESHOLD
              ? "text-rose-300"
              : message.length > MESSAGE_AMBER_THRESHOLD
                ? "text-amber-300"
                : "text-muted"
          }`}
        >
          {labels.counterTemplate
            .replace("{count}", String(message.length))
            .replace("{max}", String(MESSAGE_MAX))}
        </p>
        {fieldErrors.message && (
          <p id="feedback-message-error" className="text-xs text-rose-300">
            {fieldErrors.message}
          </p>
        )}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
      >
        <label htmlFor="feedback-website">{labels.honeypotLabel}</label>
        <input
          id="feedback-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {serverError && (
        <p className="rounded-md border border-rose-500/30 bg-rose-500/[0.06] px-3 py-2 text-sm text-rose-200">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-gold text-background hover:bg-gold-soft inline-flex items-center justify-center gap-2 self-start rounded-md px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
