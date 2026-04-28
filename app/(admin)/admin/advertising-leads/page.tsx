import { Container } from "@/components/layout/container";
import { PageIntro } from "@/components/layout/page-intro";
import { listAdvertisingLeads } from "@/lib/ad-campaigns";

export const metadata = { title: "Advertising Leads | Admin" };

export default async function AdvertisingLeadsPage() {
  const leads = await listAdvertisingLeads();

  const INTEREST_LABELS: Record<string, string> = {
    featured_listing:    "Featured Listing",
    sponsored_placement: "Sponsored Placement",
    homepage_placement:  "Homepage Placement",
    banner_ad:           "Banner Ad",
    not_sure:            "Not Sure",
  };

  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        eyebrow="Admin · Monetization"
        title="Advertising Leads"
        description="Inbound inquiries from businesses interested in advertising."
      />

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Business</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Interest</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Message</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No leads yet. Once businesses submit the{" "}
                    <a href="/advertise" className="text-primary hover:underline">/advertise</a>{" "}
                    form, they'll appear here.
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{lead.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {lead.email ? (
                      <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                        {lead.email}
                      </a>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p>{lead.company_name ?? "—"}</p>
                    {lead.website && (
                      <a href={lead.website} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                        {lead.website.replace(/^https?:\/\//, "")}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {lead.interest ? (INTEREST_LABELS[lead.interest] ?? lead.interest) : "—"}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-muted-foreground">
                    <p className="line-clamp-2">{lead.message ?? "—"}</p>
                    {lead.phone && (
                      <p className="mt-1 text-xs">{lead.phone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(lead.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
