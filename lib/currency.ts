const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** Formats whole naira, e.g. 18000 → "₦18,000". */
export function formatNaira(amount: number): string {
  return naira.format(amount).replace(/^NGN\s?/, "₦");
}
