/*
 * <Money> — monetary amount with superscript decimals.
 *
 * Design-system signature: €10.⁰⁰, where the cents part is smaller and
 * vertically raised to let the whole-euro figure dominate visually.
 *
 * Implemented in CSS (align-super + text-[0.6em]) rather than with
 * Unicode superscript characters because:
 *  1. height stays consistent across fonts,
 *  2. the digits remain selectable and copyable as normal text,
 *  3. rendering is identical across OSes.
 *
 * Usage:
 *   <Money amount={12.5} />    → €12.⁵⁰
 *   <Money amount={-3.2} />    → −€3.²⁰
 *   <Money amount={0} />       → €0.⁰⁰
 */

import { cn } from "@/lib/utils/cn";

interface MoneyProps {
  amount: number;
  currency?: "EUR";
  className?: string;
}

export function Money({ amount, currency = "EUR", className }: MoneyProps) {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const whole = Math.floor(abs);
  // Math.round avoids float artifacts like 0.1 + 0.2 = 0.30000000000000004.
  const cents = Math.round((abs - whole) * 100).toString().padStart(2, "0");
  const symbol = currency === "EUR" ? "€" : currency;

  return (
    <span className={cn("inline-flex items-baseline tabular-nums", className)}>
      {isNegative && <span>−</span>}
      <span>
        {symbol}
        {whole}
      </span>
      <span className="-ml-[0.05em] align-super text-[0.6em]">.{cents}</span>
    </span>
  );
}
