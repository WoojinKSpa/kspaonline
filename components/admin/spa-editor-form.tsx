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
import type { SpaStatus } from "@/lib/admin-spas";

const AMENITY_OPTIONS = [
  "24 hours",
  "Accepts Credit Cards",
  "Childcare",
  "Cold Plunge",
  "Cold Room",
  "Elevator",
  "Gendered Separated",
  "Group Area",
  "Hot Tub",
  "Jade Room",
  "Korean Scrubs",
  "Locker Room",
  "Massage Service",
  "Offers Free Water",
  "Outdoor Seating",
  "Reservations",
  "Restaurant",
  "Sauna",
  "Sleeping Space",
  "Smoking Area",
  "Spa Treatments",
  "Steam Room",
  "Valet Parking",
  "Wheelchair Accessible",
  "Wireless Internet",
] as const;

type SpaEditorFormProps = {
  submitLabel: string;
  formAction: (formData: FormData) => void | Promise<void>;
  defaultValues?: {
    name?: string;
    slug?: string;
    city?: string;
    state?: string | null;
    status?: SpaStatus;
    is_featured?: boolean;
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
  const selectedAmenities = new Set(defaultValues?.amenities ?? []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spa profile</CardTitle>
        <CardDescription>
          Create or update a directory listing and choose available amenities
          from the preset options below.
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
            <p className="text-sm italic text-muted-foreground">
              Please choose category to display available amenities
            </p>
            <div
              id="amenities"
              className="grid gap-3 rounded-3xl border border-border bg-secondary/30 p-4 sm:grid-cols-2"
            >
              {AMENITY_OPTIONS.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-3 rounded-2xl bg-background/80 px-3 py-3 text-sm font-medium"
                >
                  <input
                    type="checkbox"
                    name="amenities"
                    value={amenity}
                    defaultChecked={selectedAmenities.has(amenity)}
                    className="size-4 rounded border-input"
                  />
                  {amenity}
                </label>
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
