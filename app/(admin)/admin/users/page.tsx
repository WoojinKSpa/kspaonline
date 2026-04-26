import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listAllProfiles } from "@/lib/profiles";
import type { UserRole } from "@/lib/profiles";
import { setUserRoleAction } from "./actions";

const ROLE_COLORS: Record<UserRole, string> = {
  admin:      "bg-purple-100 text-purple-800 border-purple-200",
  owner:      "bg-green-100  text-green-800  border-green-200",
  user:       "bg-gray-100   text-gray-700   border-gray-200",
  advertiser: "bg-blue-100   text-blue-800   border-blue-200",
};

const ALL_ROLES: UserRole[] = ["admin", "owner", "user", "advertiser"];

async function UsersListContent({
  success,
  error,
}: {
  success: string | null;
  error: string | null;
}) {
  const profiles = await listAllProfiles();

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <Container className="py-12">
      <PageIntro
        eyebrow="Management"
        title="Users"
        description="View all registered users and manage their roles."
      />

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

      <div className="mt-8 space-y-3">
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
                {/* User info */}
                <div>
                  <p className="font-medium">{profile.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Joined {formatDate(profile.created_at)}
                  </p>
                </div>

                {/* Current role badge */}
                <div className="flex items-center">
                  <Badge className={ROLE_COLORS[profile.role]}>
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </Badge>
                </div>

                {/* Role change form */}
                <form action={setUserRoleAction} className="flex items-center gap-2">
                  <input type="hidden" name="user_id" value={profile.id} />
                  <select
                    name="role"
                    defaultValue={profile.role}
                    className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="sm" variant="outline" className="rounded-lg">
                    Save
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}

        {profiles.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No users yet.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        {profiles.length} user{profiles.length !== 1 ? "s" : ""} total
      </p>
    </Container>
  );
}

export const metadata = {
  title: "Users | Admin",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function UsersPage({ searchParams }: Props) {
  const { success, error } = await searchParams;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UsersListContent
        success={typeof success === "string" ? success : null}
        error={typeof error === "string" ? error : null}
      />
    </Suspense>
  );
}
