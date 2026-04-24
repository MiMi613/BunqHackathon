/*
 * Share / payment-request helpers.
 *
 * The sender's bunq username is a single env var NEXT_PUBLIC_BUNQ_USERNAME
 * (single-user MVP). Each recipient gets a line with amount owed, merchant,
 * and a bunq.me deep link that pre-fills the amount and description.
 * Recipients open bunq manually and pay — no recipient-username lookup.
 */

import type { PersonId, SplitCardData } from "@/lib/types/split";

const BUNQ_USERNAME =
  process.env.NEXT_PUBLIC_BUNQ_USERNAME ?? "your-bunq-username";

/**
 * Total owed by one person, taking shared items into account:
 * an item assigned to N people contributes price/N to each.
 */
export function computePersonTotal(
  card: SplitCardData,
  personId: PersonId,
): number {
  let total = 0;
  for (const item of card.items) {
    if (item.assignedTo.includes(personId)) {
      total += item.price / item.assignedTo.length;
    }
  }
  return total;
}

export function buildBunqMeUrl(amount: number, description: string): string {
  const url = new URL(`https://bunq.me/${BUNQ_USERNAME}`);
  url.searchParams.set("amount", amount.toFixed(2));
  url.searchParams.set("description", description);
  return url.toString();
}

/** Share line for a single person. */
export function buildShareLine(
  card: SplitCardData,
  personId: PersonId,
): string | null {
  const person = card.people.find((p) => p.id === personId);
  if (!person || person.isSelf) return null;
  const total = computePersonTotal(card, personId);
  if (total <= 0) return null;
  const url = buildBunqMeUrl(total, card.merchant);
  return `Hey ${person.name}! You owe €${total.toFixed(2)} for ${card.merchant}. Pay me: ${url}`;
}

/** One combined text for navigator.share, one line per non-self person. */
export function buildShareText(card: SplitCardData): string {
  const lines: string[] = [];
  for (const person of card.people) {
    const line = buildShareLine(card, person.id);
    if (line) lines.push(line);
  }
  return lines.join("\n\n");
}
