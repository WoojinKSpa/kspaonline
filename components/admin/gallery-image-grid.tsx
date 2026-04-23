"use client";

/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
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
  const reorderFormRef = useRef<HTMLFormElement>(null);
  const draggedInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <form action={reorderAction} ref={reorderFormRef} className="hidden">
        <input ref={draggedInputRef} type="hidden" name="dragged_image_id" />
        <input ref={targetInputRef} type="hidden" name="target_image_id" />
      </form>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => setDraggedImageId(image.id)}
            onDragEnd={() => setDraggedImageId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (!draggedImageId || draggedImageId === image.id) {
                return;
              }

              if (draggedInputRef.current && targetInputRef.current && reorderFormRef.current) {
                draggedInputRef.current.value = draggedImageId;
                targetInputRef.current.value = image.id;
                reorderFormRef.current.requestSubmit();
              }
            }}
            className="overflow-hidden rounded-3xl border border-border bg-background p-3 shadow-sm transition hover:border-primary/30"
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
                  <Button type="submit" variant="outline" size="sm" className="h-8 px-3">
                    <Star data-icon="inline-start" />
                    Feature
                  </Button>
                </form>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}
