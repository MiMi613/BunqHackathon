/*
 * Types for the Split domain.
 *
 * Two families:
 *  - Backend* → exact shape returned by POST /api/receipt/parse
 *    (mirrors backend/models.py and backend/main.py in this repo).
 *  - Client-side shape (Person, SplitItem, SplitCardData) → produced by
 *    the adapter. Flat, stable ids, ready for drag&drop and Zustand.
 *
 * They are kept separate so the adapter in lib/api/split.ts is the only
 * place that knows both forms. If the backend changes, only the adapter
 * changes.
 */

// ─────────────────────────── BACKEND SHAPE ───────────────────────────

export interface BackendFoodItem {
  name: string;
  price: number; // EUR, float
}

export interface BackendPerson {
  /** Backend prompt convention: "self" = the current user. */
  name: string;
  food_items: BackendFoodItem[];
}

export interface BackendInfo {
  location: string;
  /** Free-form string, not ISO (e.g. "24/04/2026 20:30" or "Tue 20:30"). */
  time: string;
  total_price: number;
}

export interface BackendParseReceiptResponse {
  filename: string;
  media_type: string;
  transcription_prompt: string;
  user_prompt: string;
  receipt_text: string;
  info: BackendInfo;
  people: BackendPerson[];
}

// ─────────────────────────── CLIENT SHAPE ────────────────────────────

export type ItemId = string;
export type PersonId = string;
export type SplitId = string;

export interface Person {
  id: PersonId;
  /** Original name from backend. Rendered as "Me" in UI when isSelf. */
  name: string;
  isSelf: boolean;
}

export interface SplitItem {
  id: ItemId;
  name: string;
  /** EUR, float. */
  price: number;
  /**
   * Person ids this item is assigned to.
   * - 1 entry  = single-person item.
   * - N entries = shared item, price split equally across assignees.
   * - 0 entries = unassigned → blocks the "Send" CTA.
   */
  assignedTo: PersonId[];
}

export interface SplitCardData {
  splitId: SplitId;
  /** Merchant / venue, from BackendInfo.location. */
  merchant: string;
  /** Free-form string from BackendInfo.time. */
  time: string;
  /** Total as printed on the receipt, EUR float. */
  total: number;
  currency: "EUR";
  items: SplitItem[];
  people: Person[];
  /** Raw OCR text, kept for debugging / future features. */
  receiptText: string;
}
