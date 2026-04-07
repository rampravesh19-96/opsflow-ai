const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}
