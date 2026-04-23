import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type SpaStatus = "draft" | "published" | "archived";

export type AdminSpa = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string | null;
  status: SpaStatus;
  is_featured: boolean;
  summary: string | null;
  description: string | null;
  amenities: string[];
};

type SpaPayload = {
  name: string;
  slug: string;
  city: string;
  status: SpaStatus;
  state?: string | null;
  summary?: string | null;
  description?: string | null;
  is_featured?: boolean;
  amenities?: string[];
};

const REQUIRED_LIST_COLUMNS = ["id", "name", "slug", "city", "status"] as const;
const OPTIONAL_COLUMNS = [
  "state",
  "summary",
  "description",
  "is_featured",
  "amenities",
] as const;

type OptionalColumn = (typeof OPTIONAL_COLUMNS)[number];

function emptyToNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractMissingOptionalColumn(message: string, columns: readonly string[]) {
  return columns.find((column) => message.includes(column)) ?? null;
}

function normalizeAmenities(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function selectManyWithOptionalColumns(requiredColumns: readonly string[]) {
  const supabase = createSupabaseAdminClient();
  let activeOptionalColumns = [...OPTIONAL_COLUMNS];

  while (true) {
    const selectedColumns = [...requiredColumns, ...activeOptionalColumns].join(", ");
    const { data, error } = await supabase
      .from("spas")
      .select(selectedColumns)
      .order("id", { ascending: false });

    if (!error) {
      return { data: data ?? [], missingColumns: OPTIONAL_COLUMNS.filter((column) => !activeOptionalColumns.includes(column)) };
    }

    const missingColumn = extractMissingOptionalColumn(error.message, activeOptionalColumns);

    if (!missingColumn) {
      throw new Error(`Failed to load admin spas: ${error.message}`);
    }

    activeOptionalColumns = activeOptionalColumns.filter((column) => column !== missingColumn);
  }
}

async function selectSingleWithOptionalColumns(id: string) {
  const supabase = createSupabaseAdminClient();
  let activeOptionalColumns = [...OPTIONAL_COLUMNS];

  while (true) {
    const selectedColumns = [...REQUIRED_LIST_COLUMNS, ...activeOptionalColumns].join(", ");
    const { data, error } = await supabase
      .from("spas")
      .select(selectedColumns)
      .eq("id", id)
      .maybeSingle();

    if (!error) {
      return {
        data,
        missingColumns: OPTIONAL_COLUMNS.filter((column) => !activeOptionalColumns.includes(column)),
      };
    }

    const missingColumn = extractMissingOptionalColumn(error.message, activeOptionalColumns);

    if (!missingColumn) {
      throw new Error(`Failed to load spa: ${error.message}`);
    }

    activeOptionalColumns = activeOptionalColumns.filter((column) => column !== missingColumn);
  }
}

function applyMissingColumnDefaults(
  row: Record<string, unknown>,
  missingColumns: OptionalColumn[]
): AdminSpa {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    city: String(row.city ?? ""),
    status: (row.status as SpaStatus | undefined) ?? "draft",
    state: missingColumns.includes("state") ? null : ((row.state as string | null | undefined) ?? null),
    summary: missingColumns.includes("summary")
      ? null
      : ((row.summary as string | null | undefined) ?? null),
    description: missingColumns.includes("description")
      ? null
      : ((row.description as string | null | undefined) ?? null),
    is_featured: missingColumns.includes("is_featured")
      ? false
      : Boolean(row.is_featured),
    amenities: missingColumns.includes("amenities")
      ? []
      : Array.isArray(row.amenities)
        ? row.amenities.map((value) => String(value))
        : [],
  };
}

function toRowRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Unexpected Supabase row shape.");
  }

  return value as Record<string, unknown>;
}

export async function listAdminSpas() {
  const { data, missingColumns } = await selectManyWithOptionalColumns(REQUIRED_LIST_COLUMNS);
  return data.map((row) =>
    applyMissingColumnDefaults(toRowRecord(row), missingColumns)
  );
}

export async function getAdminSpaById(id: string) {
  const { data, missingColumns } = await selectSingleWithOptionalColumns(id);

  if (!data) {
    return null;
  }

  return applyMissingColumnDefaults(toRowRecord(data), missingColumns);
}

function buildSpaPayload(formData: FormData): SpaPayload {
  const rawName = formData.get("name");
  const rawCity = formData.get("city");
  const rawStatus = formData.get("status");

  if (
    typeof rawName !== "string" ||
    typeof rawCity !== "string" ||
    typeof rawStatus !== "string"
  ) {
    throw new Error("Missing required spa fields.");
  }

  const name = rawName.trim();
  const city = rawCity.trim();
  const status = rawStatus as SpaStatus;

  if (!name || !city || !["draft", "published", "archived"].includes(status)) {
    throw new Error("Invalid spa form data.");
  }

  const rawSlug = formData.get("slug");
  const slug =
    typeof rawSlug === "string" && rawSlug.trim().length > 0
      ? toSlug(rawSlug)
      : toSlug(name);

  return {
    name,
    slug,
    city,
    status,
    state: emptyToNull(formData.get("state")),
    summary: emptyToNull(formData.get("summary")),
    description: emptyToNull(formData.get("description")),
    is_featured: formData.get("is_featured") === "on",
    amenities: normalizeAmenities(formData.get("amenities")),
  };
}

async function writeSpaWithFallback(
  mode: "create" | "update",
  payload: SpaPayload,
  id?: string
): Promise<{ id: string }> {
  const supabase = createSupabaseAdminClient();
  const optionalKeys: OptionalColumn[] = [
    "state",
    "summary",
    "description",
    "is_featured",
    "amenities",
  ];

  let activePayload: Record<string, unknown> = { ...payload };

  while (true) {
    const query =
      mode === "create"
        ? supabase.from("spas").insert(activePayload).select("id").single()
        : supabase.from("spas").update(activePayload).eq("id", id).select("id").single();

    const { data, error } = await query;

    if (!error) {
      return { id: String(data.id) };
    }

    const missingKey = extractMissingOptionalColumn(error.message, optionalKeys);

    if (!missingKey || !(missingKey in activePayload)) {
      throw new Error(`Failed to ${mode} spa: ${error.message}`);
    }

    const rest = { ...activePayload };
    delete rest[missingKey];
    activePayload = rest;
  }
}

export async function createAdminSpa(formData: FormData) {
  const payload = buildSpaPayload(formData);
  return writeSpaWithFallback("create", payload);
}

export async function updateAdminSpa(id: string, formData: FormData) {
  const payload = buildSpaPayload(formData);
  return writeSpaWithFallback("update", payload, id);
}
