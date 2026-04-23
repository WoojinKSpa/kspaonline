/* eslint-disable @next/next/no-img-element */
import { ArrowDown, ArrowUp, ImagePlus, Images, Star, Trash2 } from "lucide-react";

import { MAX_GALLERY_IMAGE_COUNT, type SpaImage } from "@/lib/spa-images";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type SpaImageManagerProps = {
  logoAction: (formData: FormData) => void | Promise<void>;
  galleryAction: (formData: FormData) => void | Promise<void>;
  setFeaturedAction: (formData: FormData) => void | Promise<void>;
  moveImageAction: (formData: FormData) => void | Promise<void>;
  deleteImageAction: (formData: FormData) => void | Promise<void>;
  images: SpaImage[];
};

export function SpaImageManager({
  logoAction,
  galleryAction,
  setFeaturedAction,
  moveImageAction,
  deleteImageAction,
  images,
}: SpaImageManagerProps) {
  const logo = images.find((image) => image.kind === "logo") ?? null;
  const galleryImages = images.filter((image) => image.kind === "gallery");
  const remainingSlots = Math.max(0, MAX_GALLERY_IMAGE_COUNT - galleryImages.length);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Business logo</CardTitle>
          <CardDescription>
            Upload one logo image for the business. Uploading a new logo replaces the
            current one.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {logo ? (
            <div className="overflow-hidden rounded-3xl border border-border bg-secondary/30 p-3">
              <img
                src={logo.public_url}
                alt="Business logo"
                className="h-40 w-full rounded-2xl object-cover"
              />
              <div className="mt-3 flex justify-end">
                <form action={deleteImageAction}>
                  <input type="hidden" name="image_id" value={logo.id} />
                  <Button type="submit" variant="outline" size="sm">
                    <Trash2 data-icon="inline-start" />
                    Delete logo
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-secondary/20 px-4 py-10 text-center text-sm text-muted-foreground">
              No logo uploaded yet.
            </div>
          )}

          <form action={logoAction} className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="logo">Logo image</Label>
              <input
                id="logo"
                name="logo"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="block w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium"
              />
            </div>
            <Button type="submit">
              <ImagePlus data-icon="inline-start" />
              Upload logo
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business photos</CardTitle>
          <CardDescription>
            Upload up to {MAX_GALLERY_IMAGE_COUNT} photos. Keep the first photo as the
            featured image and reorder the rest from here.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form action={galleryAction} className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="gallery">Gallery images</Label>
              <input
                id="gallery"
                name="gallery"
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="block w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium"
              />
              <p className="text-sm text-muted-foreground">
                {galleryImages.length} of {MAX_GALLERY_IMAGE_COUNT} business photo slots used.
                {remainingSlots > 0
                  ? ` ${remainingSlots} upload slot${remainingSlots === 1 ? "" : "s"} remaining.`
                  : " You have reached the photo limit."}
              </p>
            </div>
            <Button type="submit" disabled={remainingSlots === 0}>
              <Images data-icon="inline-start" />
              Upload business photos
            </Button>
          </form>

          {galleryImages.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {galleryImages.map((image, index) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-3xl border border-border bg-background p-3"
                >
                  <img
                    src={image.public_url}
                    alt={index === 0 ? "Featured business photo" : `Business photo ${index + 1}`}
                    className="h-32 w-full rounded-2xl object-cover"
                  />
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {index === 0 ? "Featured image" : `Photo ${index + 1}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Position {index + 1} of {galleryImages.length}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {index === 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                          <Star className="size-3.5" />
                          Featured
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {index > 0 ? (
                      <form action={setFeaturedAction}>
                        <input type="hidden" name="image_id" value={image.id} />
                        <Button type="submit" variant="outline" size="sm" className="h-8 px-3">
                          <Star data-icon="inline-start" />
                          Feature
                        </Button>
                      </form>
                    ) : null}
                    <form action={moveImageAction}>
                      <input type="hidden" name="image_id" value={image.id} />
                      <input type="hidden" name="direction" value="up" />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        disabled={index === 0}
                        className="h-8 px-3"
                      >
                        <ArrowUp data-icon="inline-start" />
                        Up
                      </Button>
                    </form>
                    <form action={moveImageAction}>
                      <input type="hidden" name="image_id" value={image.id} />
                      <input type="hidden" name="direction" value="down" />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        disabled={index === galleryImages.length - 1}
                        className="h-8 px-3"
                      >
                        <ArrowDown data-icon="inline-start" />
                        Down
                      </Button>
                    </form>
                    <form action={deleteImageAction}>
                      <input type="hidden" name="image_id" value={image.id} />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-destructive hover:bg-destructive/5 hover:text-destructive"
                      >
                        <Trash2 data-icon="inline-start" />
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-secondary/20 px-4 py-10 text-center text-sm text-muted-foreground">
              No business photos uploaded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
