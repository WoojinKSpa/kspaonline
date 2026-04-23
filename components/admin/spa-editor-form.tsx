import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AMENITY_CATEGORIES, normalizeAmenitySelection } from "@/lib/amenities";
import type { SpaStatus } from "@/lib/admin-spas";

const CATEGORY_OPTIONS = [
  "Gym",
  "Hammam",
  "Korean Spa",
  "Onsen",
  "Resort Spa",
  "Sauna Only",
] as const;

type SpaEditorFormProps = {
  submitLabel: string;
  formAction: (formData: FormData) => void | Promise<void>;
  defaultValues?: {
    name?: string;
    slug?: string;
    city?: string;
    state?: string | null;
    address_line_1?: string | null;
    status?: SpaStatus;
    is_featured?: boolean;
    business_email?: string | null;
    business_website?: string | null;
    business_phone?: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
    tiktok_url?: string | null;
    twitter_url?: string | null;
    youtube_url?: string | null;
    day_pass_offered?: boolean;
    day_pass_price?: string | null;
    listing_categories?: string[];
    summary?: string | null;
    description?: string;
    amenities?: string[];
  };
};

export function SpaEditorForm({
  submitLabel,
  formAction,
  defaultValues,
}: SpaEditorFormProps) {
  const selectedAmenities = new Set(
    normalizeAmenitySelection(defaultValues?.amenities ?? [])
  );
  const selectedCategories = new Set(defaultValues?.listing_categories ?? []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spa profile</CardTitle>
        <CardDescription>
          Create or update a directory listing and choose available amenities
          from the grouped options below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Spa name</Label>
            <Input id="name" name="name" defaultValue={defaultValues?.name} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={defaultValues?.slug} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={defaultValues?.city} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" defaultValue={defaultValues?.state ?? ""} />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="address_line_1">Address</Label>
            <Input
              id="address_line_1"
              name="address_line_1"
              defaultValue={defaultValues?.address_line_1 ?? ""}
              placeholder="123 Main St"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={defaultValues?.status ?? "draft"}
              className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm font-medium">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={defaultValues?.is_featured ?? false}
                className="size-4 rounded border-input"
              />
              Featured spa
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="business_email">Business Email</Label>
            <Input
              id="business_email"
              name="business_email"
              type="email"
              defaultValue={defaultValues?.business_email ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="business_phone">Business Phone</Label>
            <Input
              id="business_phone"
              name="business_phone"
              defaultValue={defaultValues?.business_phone ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="business_website">Business Website</Label>
            <Input
              id="business_website"
              name="business_website"
              type="url"
              defaultValue={defaultValues?.business_website ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="facebook_url">Facebook Link</Label>
            <Input
              id="facebook_url"
              name="facebook_url"
              type="url"
              defaultValue={defaultValues?.facebook_url ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="instagram_url">Instagram Link</Label>
            <Input
              id="instagram_url"
              name="instagram_url"
              type="url"
              defaultValue={defaultValues?.instagram_url ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tiktok_url">TikTok Link</Label>
            <Input
              id="tiktok_url"
              name="tiktok_url"
              type="url"
              defaultValue={defaultValues?.tiktok_url ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="twitter_url">Twitter/X Link</Label>
            <Input
              id="twitter_url"
              name="twitter_url"
              type="url"
              defaultValue={defaultValues?.twitter_url ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="youtube_url">YouTube Link</Label>
            <Input
              id="youtube_url"
              name="youtube_url"
              type="url"
              defaultValue={defaultValues?.youtube_url ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="day_pass_offered">Day Pass Offered?</Label>
            <select
              id="day_pass_offered"
              name="day_pass_offered"
              defaultValue={defaultValues?.day_pass_offered ? "yes" : "no"}
              className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="day_pass_price">Day Pass Price</Label>
            <Input
              id="day_pass_price"
              name="day_pass_price"
              defaultValue={defaultValues?.day_pass_price ?? ""}
              placeholder="$45"
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="listing_categories">Listing Categories</Label>
            <p className="text-sm text-muted-foreground">
              Choose one or more categories for this listing.
            </p>
            <div
              id="listing_categories"
              className="grid gap-3 rounded-3xl border border-border bg-secondary/30 p-4 sm:grid-cols-2"
            >
              {CATEGORY_OPTIONS.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 rounded-2xl bg-background/80 px-3 py-3 text-sm font-medium"
                >
                  <input
                    type="checkbox"
                    name="listing_categories"
                    value={category}
                    defaultChecked={selectedCategories.has(category)}
                    className="size-4 rounded border-input"
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              name="summary"
              rows={3}
              defaultValue={defaultValues?.summary ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={defaultValues?.description}
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="amenities">Amenities</Label>
            <p className="text-sm text-muted-foreground">
              Amenities are grouped for display automatically on the public listing.
            </p>
            <div id="amenities" className="grid gap-4">
              {AMENITY_CATEGORIES.map((category) => (
                <div
                  key={category.title}
                  className="rounded-3xl border border-border bg-secondary/30 p-4"
                >
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-foreground">{category.title}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {category.items.map((amenity) => (
                      <label
                        key={amenity.label}
                        className="flex items-center gap-3 rounded-2xl bg-background/80 px-3 py-3 text-sm font-medium"
                      >
                        <input
                          type="checkbox"
                          name="amenities"
                          value={amenity.label}
                          defaultChecked={selectedAmenities.has(amenity.label)}
                          className="size-4 rounded border-input"
                        />
                        <span className={amenity.italic ? "italic" : undefined}>
                          {amenity.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
