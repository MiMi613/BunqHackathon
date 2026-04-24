/*
 * Client for POST /api/receipt/parse.
 *
 * The backend expects multipart/form-data with:
 *  - file: UploadFile (image/png|jpeg|webp|gif)
 *  - user_prompt: string describing "who had what"
 *  - transcription_prompt: optional, overrides the default OCR prompt
 *
 * The call can take 5–15s (Claude Vision OCR + LLM parse). The UI must
 * always show a loading state while this is in flight.
 */

import type {
  BackendParseReceiptResponse,
  Person,
  SplitCardData,
  SplitItem,
} from "@/lib/types/split";
import { API_BASE_URL } from "./client";

export async function parseReceipt(
  image: File,
  userPrompt: string,
): Promise<SplitCardData> {
  const form = new FormData();
  form.append("file", image);
  form.append("user_prompt", userPrompt);

  const res = await fetch(`${API_BASE_URL}/api/receipt/parse`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Receipt parse failed (${res.status}): ${body}`);
  }

  const raw = (await res.json()) as BackendParseReceiptResponse;
  return adaptBackendResponse(raw);
}

/**
 * Adapter: turns the backend's nested response into the flat client shape.
 *
 * - Generates client-side ids via crypto.randomUUID() for people and items.
 *   The backend doesn't produce ids: after this step, the canonical state
 *   lives in Zustand on the client.
 * - Detects "self" → isSelf=true, so the UI can render it as "Me".
 * - Flattens people[].food_items[] into a single top-level items[] with
 *   assignedTo = [personId]. The backend currently assigns each item to ONE
 *   person; our client is already set up for shared items (multiple
 *   assignees) when drag&drop starts producing them.
 */
export function adaptBackendResponse(
  raw: BackendParseReceiptResponse,
): SplitCardData {
  const people: Person[] = raw.people.map((p) => ({
    id: crypto.randomUUID(),
    name: p.name,
    isSelf: p.name.trim().toLowerCase() === "self",
  }));

  // Name → id lookup so we can tie each item back to a person.
  // If two backend persons shared a name (unlikely), the later one wins —
  // acceptable for our domain.
  const nameToPersonId = new Map(people.map((p) => [p.name, p.id]));

  const items: SplitItem[] = [];
  for (const backendPerson of raw.people) {
    const personId = nameToPersonId.get(backendPerson.name);
    if (!personId) continue;
    for (const fi of backendPerson.food_items) {
      items.push({
        id: crypto.randomUUID(),
        name: fi.name,
        price: fi.price,
        assignedTo: [personId],
      });
    }
  }

  return {
    splitId: crypto.randomUUID(),
    merchant: raw.info.location,
    time: raw.info.time,
    total: raw.info.total_price,
    currency: "EUR",
    items,
    people,
    receiptText: raw.receipt_text,
  };
}
