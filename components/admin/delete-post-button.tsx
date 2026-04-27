"use client";

import { deleteBlogPostAction } from "@/app/(admin)/admin/blog/actions";

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  return (
    <form action={deleteBlogPostAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-sm text-destructive hover:underline"
        onClick={(e) => {
          if (!confirm(`Delete "${title}"?`)) e.preventDefault();
        }}
      >
        Delete
      </button>
    </form>
  );
}
