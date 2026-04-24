"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useTransition } from "react";
import { GripVertical, Star, X } from "lucide-react";

import type { SpaImage } from "@/lib/spa-images";

import { Button } from "@/components/ui/button";

type GalleryImageGridProps = {
  images: SpaImage[];
  setFeaturedAction: (formData: FormData) => void | Promise<void>;
  reorderAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
};

export function GalleryImageGrid({
  images,
  setFeaturedAction,
  reorderAction,
  deleteAction,
}: GalleryImageGridProps) {
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleReorder(draggedId: string, targetId: string) {
    if (!draggedId || draggedId === targetId) {
      return;
    }

    const formData = new FormData();
    formData.set("dragged_image_id", draggedId);
    formData.set("target_image_id", targetId);

    startTransition(() => {
      void reorderAction(formData);
    });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {images.map((image, index) => (
        <div
          key={image.id}
          draggable={!isPending}
          onDragStart={(event) => {
            setDraggedImageId(image.id);
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", image.id);
          }}
          onDragEnd={() => setDraggedImageId(null)}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
          }}
          onDrop={(event) => {
            event.preventDefault();
            const droppedImageId =
              event.dataTransfer.getData("text/plain") || draggedImageId;

            void handleReorder(droppedImageId, image.id);
            setDraggedImageId(null);
          }}
          className="overflow-hidden rounded-3xl border border-border bg-background p-3 shadow-sm transition hover:border-primary/30"
        >
          <div
            className={
              draggedImageId === image.id
                ? "opacity-60"
                : undefined
            }
          >
            <div className="relative">
              <img
                src={image.public_url}
                alt={index === 0 ? "Featured business photo" : `Business photo ${index + 1}`}
                className="h-32 w-full rounded-2xl object-cover"
              />
              <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-medium text-white">
                <GripVertical className="size-3.5" />
                Drag
              </div>
              <form action={deleteAction} className="absolute right-2 top-2">
                <input type="hidden" name="image_id" value={image.id} />
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  className="size-8 rounded-full bg-black/55 p-0 text-white hover:bg-black/75"
                >
                  <X className="size-4" />
                </Button>
              </form>
            </div>

            <div className="mt-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {index === 0 ? "Featured image" : `Photo ${index + 1}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Drag thumbnails to reorder
                </p>
              </div>
              {index === 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                  <Star className="size-3.5" />
                  Featured
                </span>
              ) : null}
            </div>

            {index > 0 ? (
              <div className="mt-3">
                <form action={setFeaturedAction}>
                  <input type="hidden" name="image_id" value={image.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                    disabled={isPending}
                  >
                    <Star data-icon="inline-start" />
                    Feature
                  </Button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
