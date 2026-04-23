import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SpaEditorFormProps = {
  submitLabel: string;
  defaultValues?: {
    name?: string;
    slug?: string;
    city?: string;
    neighborhood?: string;
    description?: string;
  };
};

export function SpaEditorForm({
  submitLabel,
  defaultValues,
}: SpaEditorFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spa profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Spa name</Label>
            <Input id="name" defaultValue={defaultValues?.name} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" defaultValue={defaultValues?.slug} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" defaultValue={defaultValues?.city} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="neighborhood">Neighborhood</Label>
            <Input
              id="neighborhood"
              defaultValue={defaultValues?.neighborhood}
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={6}
              defaultValue={defaultValues?.description}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="button">{submitLabel}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

