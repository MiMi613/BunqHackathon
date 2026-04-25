/*
 * Mocks for development without a live backend / without Claude access.
 *
 * Stored in the RAW backend shape (not yet adapted), so they flow through
 * adaptBackendResponse() just like real responses do. This way we test the
 * adapter for free, and swapping mock↔real is a single-import change.
 */

import type {
  BackendParseReceiptResponse,
  SplitCardData,
} from "@/lib/types/split";
import { adaptBackendResponse } from "./split";

export const MOCK_RAW_RECEIPTS = {
  pizzeria: {
    filename: "mock-pizzeria.jpg",
    media_type: "image/jpeg",
    transcription_prompt: "",
    user_prompt:
      "I had the diavola pizza, Marco had pasta and tiramisu, Lucia had a salad",
    receipt_text:
      "MARIO'S PIZZERIA\n12 Rome Street, Milan\n24/04/2026 20:30\n\nDiavola Pizza 11.00\nStill Water 2.50\nPasta Carbonara 13.00\nTiramisu 6.00\nDraft Beer 5.00\nGreek Salad 9.00\nCover Charge 2.00\n\nTOTAL 48.50",
    info: {
      location: "Mario's Pizzeria",
      time: "24/04/2026 20:30",
      total_price: 48.5,
    },
    people: [
      {
        name: "self",
        food_items: [
          { name: "Diavola Pizza", price: 11.0 },
          { name: "Still Water", price: 2.5 },
        ],
      },
      {
        name: "Marco",
        food_items: [
          { name: "Pasta Carbonara", price: 13.0 },
          { name: "Tiramisu", price: 6.0 },
          { name: "Draft Beer", price: 5.0 },
        ],
      },
      {
        name: "Lucia",
        food_items: [
          { name: "Greek Salad", price: 9.0 },
          { name: "Cover Charge", price: 2.0 },
        ],
      },
    ],
  },

  bar: {
    filename: "mock-bar.jpg",
    media_type: "image/jpeg",
    transcription_prompt: "",
    user_prompt:
      "I had a spritz and a sandwich, Giulia had a cappuccino and a croissant",
    receipt_text:
      "CENTRAL CAFE\n24/04/2026 18:15\n\nAperol Spritz 6.00\nTuna Sandwich 3.50\nCappuccino 1.80\nCroissant 1.50\nSparkling Water 1.70\n\nTOTAL 14.50",
    info: {
      location: "Central Cafe",
      time: "24/04/2026 18:15",
      total_price: 14.5,
    },
    people: [
      {
        name: "self",
        food_items: [
          { name: "Aperol Spritz", price: 6.0 },
          { name: "Tuna Sandwich", price: 3.5 },
        ],
      },
      {
        name: "Giulia",
        food_items: [
          { name: "Cappuccino", price: 1.8 },
          { name: "Croissant", price: 1.5 },
          { name: "Sparkling Water", price: 1.7 },
        ],
      },
    ],
  },

  uber: {
    filename: "mock-uber.jpg",
    media_type: "image/jpeg",
    transcription_prompt: "",
    user_prompt: "Splitting the ride four ways (me, Marco, Lucia, Sara)",
    receipt_text:
      "UBER TRIP RECEIPT\nMilan → Milan Navigli\n24/04/2026 23:45\n\nUber Ride 18.40\n\nTOTAL 18.40",
    info: {
      location: "Uber",
      time: "24/04/2026 23:45",
      total_price: 18.4,
    },
    people: [
      {
        name: "self",
        food_items: [{ name: "Uber Ride", price: 18.4 }],
      },
    ],
  },
} satisfies Record<string, BackendParseReceiptResponse>;

export type MockReceiptKey = keyof typeof MOCK_RAW_RECEIPTS;

export function getMockSplit(key: MockReceiptKey): SplitCardData {
  return adaptBackendResponse(MOCK_RAW_RECEIPTS[key]);
}

/**
 * Same signature as parseReceipt, but returns a mock after a 1.5s delay.
 * Use it while building the loading UI without burning Claude calls;
 * swap to parseReceipt when E2E testing is needed.
 */
export async function parseReceiptMock(
  _image: File,
  userPrompt: string,
): Promise<SplitCardData> {
  await new Promise((r) => setTimeout(r, 1500));
  const lower = userPrompt.toLowerCase();
  if (lower.includes("pizza") || lower.includes("pasta")) return getMockSplit("pizzeria");
  if (
    lower.includes("coffee") ||
    lower.includes("cappuccino") ||
    lower.includes("spritz") ||
    lower.includes("bar")
  )
    return getMockSplit("bar");
  return getMockSplit("uber");
}
