import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listAllClaimRequests } from "@/lib/spa-claims";
import { approveClaimAction, rejectClaimAction } from "./actions";

async function ClaimsListContent({
  success,
  error,
}: {
  success: string | null;
  error: string | null;
}) {
  const claims = await listAllClaimRequests();

  const pendingClaims = claims.filter((c) => c.status === "pending");
  const approvedClaims = claims.filter((c) => c.status === "approved");
  const rejectedClaims = claims.filter((c) => c.status === "rejected");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container className="py-12">
      <PageIntro
        eyebrow="Management"
        title="Spa Claim Requests"
        description="Review and manage spa ownership claim requests from users."
      />

      {/* Success/Error Messages */}
      {success && (
        <Card className="mt-6 mb-8 bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-green-800">{decodeURIComponent(success)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mt-6 mb-8 bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <span className="text-red-600">✕</span>
              <span className="text-red-800">{decodeURIComponent(error)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Claims */}
      {pendingClaims.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">
            Pending ({pendingClaims.length})
          </h2>
          <div className="space-y-4">
            {pendingClaims.map((claim) => (
              <Card key={claim.id}>
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Spa</p>
                        <p className="font-semibold">{claim.spa_name || "Unknown"}</p>
                        {claim.spa_city && claim.spa_state && (
                          <p className="text-sm text-muted-foreground">
                            {claim.spa_city}, {claim.spa_state}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Requester</p>
                        <p className="font-semibold">{claim.requester_name}</p>
                        <p className="text-sm">{claim.requester_email}</p>
                      </div>

                      {claim.message && (
                        <div>
                          <p className="text-sm text-muted-foreground">Message</p>
                          <p className="text-sm italic text-gray-700">&quot;{claim.message}&quot;</p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-muted-foreground">Submitted</p>
                        <p className="text-sm">{formatDate(claim.created_at)}</p>
                      </div>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <Badge className={`inline-block ${getStatusColor(claim.status)}`}>
                          {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="flex gap-2 flex-col sm:flex-row mt-auto">
                        <form action={approveClaimAction} className="flex-1">
                          <input type="hidden" name="claim_id" value={claim.id} />
                          <input type="hidden" name="spa_id" value={claim.spa_id} />
                          <input
                            type="hidden"
                            name="owner_email"
                            value={claim.requester_email}
                          />
                          <Button
                            type="submit"
                            size="sm"
                            className="w-full rounded-lg bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                        </form>

                        <form action={rejectClaimAction} className="flex-1">
                          <input type="hidden" name="claim_id" value={claim.id} />
                          <Button
                            type="submit"
                            size="sm"
                            variant="outline"
                            className="w-full rounded-lg"
                          >
                            Reject
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Approved Claims */}
      {approvedClaims.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">
            Approved ({approvedClaims.length})
          </h2>
          <div className="space-y-4">
            {approvedClaims.map((claim) => (
              <Card key={claim.id} className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Spa</p>
                      <p className="font-semibold">{claim.spa_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Owner</p>
                      <p className="font-semibold">{claim.requester_name}</p>
                      <p className="text-sm">{claim.requester_email}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-600 text-white">Approved</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Claims */}
      {rejectedClaims.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">
            Rejected ({rejectedClaims.length})
          </h2>
          <div className="space-y-4">
            {rejectedClaims.map((claim) => (
              <Card key={claim.id} className="bg-red-50 border-red-200">
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Spa</p>
                      <p className="font-semibold">{claim.spa_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Requester</p>
                      <p className="font-semibold">{claim.requester_name}</p>
                      <p className="text-sm">{claim.requester_email}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-red-600 text-white">Rejected</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {claims.length === 0 && (
        <Card className="mt-10">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No claim requests yet</p>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export const metadata = {
  title: "Spa Claims | Admin",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ClaimsPage({ searchParams }: Props) {
  const { success, error } = await searchParams;

  const successMessage = typeof success === "string" ? success : null;
  const errorMessage = typeof error === "string" ? error : null;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClaimsListContent success={successMessage} error={errorMessage} />
    </Suspense>
  );
}
