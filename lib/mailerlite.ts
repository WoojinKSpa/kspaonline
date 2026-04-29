// MailerLite transactional email helper
// Docs: https://developers.mailerlite.com/docs/transactional

const MAILERLITE_API_URL = "https://connect.mailerlite.com/api/emails";
const FROM_EMAIL = "hello@kspa.online";
const FROM_NAME = "KSpa Online";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "koreanspa@proton.me";

type EmailPayload = {
  from: { email: string; name: string };
  to: Array<{ email: string; name?: string }>;
  subject: string;
  html: string;
  text: string;
};

async function sendEmail(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    console.warn("MAILERLITE_API_KEY is not set — skipping email send");
    return;
  }

  const res = await fetch(MAILERLITE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`MailerLite error ${res.status}: ${body}`);
  }
}

// ── Advertising lead emails ───────────────────────────────────────────────────

type LeadEmailData = {
  name: string;
  email: string;
  company_name?: string;
  phone?: string;
  website?: string;
  interest?: string;
  message?: string;
};

const INTEREST_LABELS: Record<string, string> = {
  featured_listing:    "Featured Listing",
  sponsored_placement: "Sponsored Directory Placement",
  homepage_placement:  "Homepage Placement",
  banner_ad:           "Banner Ad",
  not_sure:            "Not Sure — Tell Me More",
};

export async function sendAdLeadNotification(lead: LeadEmailData): Promise<void> {
  const interestLabel = lead.interest ? (INTEREST_LABELS[lead.interest] ?? lead.interest) : "Not specified";

  await sendEmail({
    from: { email: FROM_EMAIL, name: FROM_NAME },
    to: [{ email: ADMIN_EMAIL, name: "KSpa Admin" }],
    subject: `New advertising inquiry from ${lead.name}`,
    text: [
      `New advertising inquiry received on KSpa Online.`,
      ``,
      `Name:     ${lead.name}`,
      `Email:    ${lead.email}`,
      `Business: ${lead.company_name ?? "—"}`,
      `Phone:    ${lead.phone ?? "—"}`,
      `Website:  ${lead.website ?? "—"}`,
      `Interest: ${interestLabel}`,
      `Message:  ${lead.message ?? "—"}`,
      ``,
      `Reply directly to ${lead.email} to follow up.`,
      `View all leads: https://kspa.online/admin/advertising-leads`,
    ].join("\n"),
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h2 style="margin-bottom:4px">New advertising inquiry</h2>
        <p style="color:#666;margin-top:0">Received via <a href="https://kspa.online/advertise">kspa.online/advertise</a></p>
        <table style="width:100%;border-collapse:collapse;margin-top:20px">
          <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;width:100px">Name</td><td style="padding:8px 0;border-bottom:1px solid #eee"><strong>${lead.name}</strong></td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Email</td><td style="padding:8px 0;border-bottom:1px solid #eee"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Business</td><td style="padding:8px 0;border-bottom:1px solid #eee">${lead.company_name ?? "—"}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Phone</td><td style="padding:8px 0;border-bottom:1px solid #eee">${lead.phone ?? "—"}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Website</td><td style="padding:8px 0;border-bottom:1px solid #eee">${lead.website ? `<a href="${lead.website}">${lead.website}</a>` : "—"}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Interest</td><td style="padding:8px 0;border-bottom:1px solid #eee">${interestLabel}</td></tr>
          <tr><td style="padding:8px 0;color:#666;vertical-align:top">Message</td><td style="padding:8px 0">${lead.message ?? "—"}</td></tr>
        </table>
        <div style="margin-top:28px">
          <a href="mailto:${lead.email}" style="background:#0e6c5d;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Reply to ${lead.name}</a>
          &nbsp;
          <a href="https://kspa.online/admin/advertising-leads" style="color:#0e6c5d;font-size:14px">View all leads →</a>
        </div>
      </div>
    `,
  });
}

// ── Contact form emails ───────────────────────────────────────────────────────

type ContactEmailData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function sendContactNotification(contact: ContactEmailData): Promise<void> {
  await sendEmail({
    from: { email: FROM_EMAIL, name: FROM_NAME },
    to: [{ email: ADMIN_EMAIL, name: "KSpa Admin" }],
    subject: `Contact form: ${contact.subject}`,
    text: [
      `New contact form submission on KSpa Online.`,
      ``,
      `Name:    ${contact.name}`,
      `Email:   ${contact.email}`,
      `Subject: ${contact.subject}`,
      ``,
      `Message:`,
      contact.message,
      ``,
      `Reply directly to ${contact.email} to respond.`,
    ].join("\n"),
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h2 style="margin-bottom:4px">New contact message</h2>
        <p style="color:#666;margin-top:0">Received via <a href="https://kspa.online/contact">kspa.online/contact</a></p>
        <table style="width:100%;border-collapse:collapse;margin-top:20px">
          <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;width:80px">Name</td><td style="padding:8px 0;border-bottom:1px solid #eee"><strong>${contact.name}</strong></td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Email</td><td style="padding:8px 0;border-bottom:1px solid #eee"><a href="mailto:${contact.email}">${contact.email}</a></td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Subject</td><td style="padding:8px 0;border-bottom:1px solid #eee">${contact.subject}</td></tr>
          <tr><td style="padding:8px 0;color:#666;vertical-align:top">Message</td><td style="padding:8px 0;white-space:pre-wrap">${contact.message}</td></tr>
        </table>
        <div style="margin-top:28px">
          <a href="mailto:${contact.email}" style="background:#0e6c5d;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Reply to ${contact.name}</a>
        </div>
      </div>
    `,
  });
}

export async function sendContactConfirmation(contact: ContactEmailData): Promise<void> {
  await sendEmail({
    from: { email: FROM_EMAIL, name: FROM_NAME },
    to: [{ email: contact.email, name: contact.name }],
    subject: "We got your message — KSpa Online",
    text: [
      `Hi ${contact.name},`,
      ``,
      `Thanks for reaching out! We received your message and will get back to you as soon as possible.`,
      ``,
      `You wrote:`,
      `"${contact.message}"`,
      ``,
      `— The KSpa Online team`,
    ].join("\n"),
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#0e6c5d">We got your message!</h2>
        <p>Hi ${contact.name},</p>
        <p>Thanks for reaching out. We&apos;ll get back to you as soon as possible.</p>
        <blockquote style="border-left:3px solid #0e6c5d;margin:20px 0;padding:12px 16px;background:#f6faf9;color:#444;border-radius:0 8px 8px 0">
          ${contact.message}
        </blockquote>
        <div style="margin-top:28px">
          <a href="https://kspa.online/spas" style="background:#0e6c5d;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Browse Spa Directory</a>
        </div>
        <p style="margin-top:32px;color:#999;font-size:12px">— The KSpa Online team · <a href="https://kspa.online" style="color:#999">kspa.online</a></p>
      </div>
    `,
  });
}

export async function sendAdLeadConfirmation(lead: LeadEmailData): Promise<void> {
  await sendEmail({
    from: { email: FROM_EMAIL, name: FROM_NAME },
    to: [{ email: lead.email, name: lead.name }],
    subject: "We received your inquiry — KSpa Online",
    text: [
      `Hi ${lead.name},`,
      ``,
      `Thanks for reaching out about advertising on KSpa Online.`,
      `We've received your inquiry and will follow up within one business day.`,
      ``,
      `In the meantime, you can browse our spa directory at https://kspa.online/spas`,
      ``,
      `— The KSpa Online team`,
    ].join("\n"),
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#0e6c5d">Thanks for reaching out!</h2>
        <p>Hi ${lead.name},</p>
        <p>We've received your advertising inquiry and will follow up within <strong>one business day</strong>.</p>
        <p style="color:#666">If you have any urgent questions in the meantime, reply directly to this email.</p>
        <div style="margin-top:28px">
          <a href="https://kspa.online/spas" style="background:#0e6c5d;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Browse Spa Directory</a>
        </div>
        <p style="margin-top:32px;color:#999;font-size:12px">— The KSpa Online team · <a href="https://kspa.online" style="color:#999">kspa.online</a></p>
      </div>
    `,
  });
}
