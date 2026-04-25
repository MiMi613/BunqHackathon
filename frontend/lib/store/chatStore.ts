"use client";

/*
 * Chat store — Zustand.
 *
 * Holds the ordered list of chat messages. Each message is either a user
 * message (text + image + original File) or an agent message (with status
 * machine: loading → ready | error, and a SplitCardData when ready).
 *
 * The original File is kept on the user message so we can later re-upload
 * it for "refine by prompt" without asking the user to pick the photo again.
 *
 * Per-card mutations (moveItem) operate on the SplitCardData embedded in
 * the matching agent message. Canonical state lives here; the backend is
 * only the source of the initial parse.
 *
 * Backend source:
 *   The import below calls the real FastAPI endpoint so the chat flow
 *   uploads the receipt image + prompt and renders the returned division.
 */

import { create } from "zustand";
import type {
  ItemId,
  PersonId,
  SplitCardData,
  SplitId,
} from "@/lib/types/split";
import { parseReceipt } from "@/lib/api/split";

export interface UserMessage {
  id: string;
  role: "user";
  createdAt: number;
  text: string;
  /** Set when the user edits the message after sending it. */
  editedAt?: number;
  imageDataUrl?: string;
  /** Kept so we can re-upload the same bytes for refine without re-picking. */
  imageFile?: File;
}

export interface AgentMessage {
  id: string;
  role: "agent";
  createdAt: number;
  parentUserMessageId: string;
  status: "loading" | "ready" | "error";
  splitCard?: SplitCardData;
  error?: string;
}

export type ChatMessage = UserMessage | AgentMessage;

interface ChatState {
  messages: ChatMessage[];

  /** Append a user message + a loading agent message, then resolve the agent. */
  send: (args: {
    text: string;
    image: File;
    imageDataUrl: string;
  }) => Promise<void>;

  /** Replace assignedTo for a specific item inside a specific split card. */
  moveItem: (
    splitId: SplitId,
    itemId: ItemId,
    newAssignedTo: PersonId[],
  ) => void;

  /** Update the text of a previously sent user message and stamp editedAt. */
  editUserMessage: (messageId: string, newText: string) => void;

  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],

  send: async ({ text, image, imageDataUrl }) => {
    const userMsgId = crypto.randomUUID();
    const agentMsgId = crypto.randomUUID();
    const now = Date.now();

    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: userMsgId,
          role: "user",
          createdAt: now,
          text,
          imageDataUrl,
          imageFile: image,
        },
        {
          id: agentMsgId,
          role: "agent",
          createdAt: now + 1,
          parentUserMessageId: userMsgId,
          status: "loading",
        },
      ],
    }));

    try {
      const card = await parseReceipt(image, text);
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === agentMsgId && m.role === "agent"
            ? { ...m, status: "ready", splitCard: card }
            : m,
        ),
      }));
    } catch (e) {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === agentMsgId && m.role === "agent"
            ? {
                ...m,
                status: "error",
                error: e instanceof Error ? e.message : "Unknown error",
              }
            : m,
        ),
      }));
      throw (e instanceof Error ? e : new Error("Unknown error"));
    }
  },

  editUserMessage: (messageId, newText) => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId && m.role === "user" && m.text !== trimmed
          ? { ...m, text: trimmed, editedAt: Date.now() }
          : m,
      ),
    }));
  },

  moveItem: (splitId, itemId, newAssignedTo) => {
    set((state) => ({
      messages: state.messages.map((m) => {
        if (m.role !== "agent" || !m.splitCard) return m;
        if (m.splitCard.splitId !== splitId) return m;
        return {
          ...m,
          splitCard: {
            ...m.splitCard,
            items: m.splitCard.items.map((i) =>
              i.id === itemId ? { ...i, assignedTo: newAssignedTo } : i,
            ),
          },
        };
      }),
    }));
  },

  reset: () => set({ messages: [] }),
}));
