/* eslint-disable @next/next/no-img-element */
import type { Route } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, EyeOff, Star, XCircle } from "lucide-react";

import { moderateReviewAction } from "@/app/(admin)/admin/reviews/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ReviewStatus, listAdminReviews } from "@/lib/spa-reviews";
import { cn } from "@/lib/utils";

type AdminReviewsPageProps = {
  searchParams?: Promise<{
    status?: string;
    error?: string;
    success?: string;
  }>;
};

const FILTERS: Array<{ label: string; value: ReviewStatus | "all" }> = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Hidden", value: "hidden" },
  { label: "All", value: "all" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-0.5 text-primary">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={
            star <= rating ? "size-4 fill-current" : "size-4 text-muted-foreground/30"
          }
        />
      ))}
    </div>
  );
}

function ModerationButton({
  reviewId,
  status,
  children,
}: {
  reviewId: string;
  status: ReviewStatus;
  children: ReactNode;
}) {
  return (
    <form action={moderateReviewAction}>
      <input type="hidden" name="review_id" value={reviewId} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" variant="outline" size="sm">
        {children}
      </Button>
    </form>
  );
}

export default async function AdminReviewsPage({
  searchParams,
}: AdminReviewsPageProps) {
  const query = await searchParams;
  const requestedStatus = query?.status;
  const status =
    requestedStatus === "pending" ||
    requestedStatus === "approved" ||
    requestedStatus === "rejected" ||
    requestedStatus === "hidden"
      ? requestedStatus
      : undefined;
  const reviews = await listAdminReviews(status);
  const error = query?.error ? decodeURIComponent(query.error) : null;
  const success = query?.success ? decodeURIComponent(query.success) : null;

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Moderation
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Reviews</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Approve, reject, or hide user-submitted spa reviews.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const href =
            filter.value === "all"
              ? ("/admin/reviews" as Route)
              : (`/admin/reviews?status=${filter.value}` as Route);
          const active =
            filter.value === "all" ? !status : filter.value === status;

          return (
            <Link
              key={filter.value}
              href={href}
              className={cn(
                "rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
                active && "bg-primary text-primary-foreground hover:bg-primary"
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {error ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </p>
      ) : null}

      <div className="grid gap-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">
                      {review.spa_name ?? "Unknown spa"}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {review.user_email ?? "Unknown user"}
                      {review.created_at
                        ? ` · ${new Intl.DateTimeFormat("en", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(new Date(review.created_at))}`
                        : ""}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{review.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <StarRating rating={review.rating} />
                  {review.title ? (
                    <h2 className="mt-3 text-lg font-semibold">{review.title}</h2>
                  ) : null}
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                    {review.body}
                  </p>
                </div>

                {review.photos.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {review.photos.map((photo) => (
                      <a
                        key={photo.id}
                        href={photo.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="overflow-hidden rounded-2xl border border-border"
                      >
                        <img
                          src={photo.image_url}
                          alt="Review photo"
                          className="h-32 w-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <ModerationButton reviewId={review.id} status="approved">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Approve
                  </ModerationButton>
                  <ModerationButton reviewId={review.id} status="rejected">
                    <XCircle className="size-4 text-red-600" />
                    Reject
                  </ModerationButton>
                  <ModerationButton reviewId={review.id} status="hidden">
                    <EyeOff className="size-4" />
                    Hide
                  </ModerationButton>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No reviews found.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
