/*
 * Mock bunq contact directory.
 *
 * Until the bunq API is wired up, the contact picker reads from this static
 * list. Handles match the bunq.me convention so the UI looks production-ready
 * even though no network call is made.
 */

export interface BunqContact {
  id: string;
  name: string;
  /** bunq.me handle without the leading @, e.g. "marco.rossi". */
  handle: string;
  /** ISO country code shown as a tiny chip — adds realism, no logic. */
  country?: string;
}

export const MOCK_BUNQ_CONTACTS: BunqContact[] = [
  { id: "bc_marco", name: "Marco Rossi", handle: "marco.rossi", country: "IT" },
  { id: "bc_sofia", name: "Sofia Bianchi", handle: "sofia.b", country: "IT" },
  { id: "bc_luca", name: "Luca Romano", handle: "luca.r", country: "IT" },
  { id: "bc_giulia", name: "Giulia Conti", handle: "giulia.conti", country: "IT" },
  { id: "bc_emma", name: "Emma de Vries", handle: "emma.dv", country: "NL" },
  { id: "bc_jasper", name: "Jasper van Dijk", handle: "jasper.vd", country: "NL" },
  { id: "bc_noah", name: "Noah Janssen", handle: "noah.j", country: "NL" },
  { id: "bc_lena", name: "Lena Müller", handle: "lena.mueller", country: "DE" },
  { id: "bc_finn", name: "Finn Becker", handle: "finn.becker", country: "DE" },
  { id: "bc_alice", name: "Alice Laurent", handle: "alice.l", country: "FR" },
  { id: "bc_thomas", name: "Thomas Moreau", handle: "thomas.m", country: "FR" },
  { id: "bc_chloe", name: "Chloé Dubois", handle: "chloe.d", country: "FR" },
];

/**
 * Heuristic match: rank contacts by how closely their name matches a person's
 * name. Used to surface the most likely contact at the top of the picker.
 * Returns a copy — does not mutate input.
 */
export function rankContactsByName(
  contacts: BunqContact[],
  personName: string,
): BunqContact[] {
  const target = personName.trim().toLowerCase();
  if (!target) return contacts;
  const score = (c: BunqContact): number => {
    const n = c.name.toLowerCase();
    if (n === target) return 0;
    if (n.startsWith(target)) return 1;
    if (n.includes(target)) return 2;
    if (target.split(/\s+/).some((p) => p && n.includes(p))) return 3;
    return 4;
  };
  return [...contacts].sort((a, b) => score(a) - score(b));
}
