export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCurrency = (value: number): string =>
  currencyFormatter.format(value);

export const pnlColor = (value: number): string => {
  if (value > 0) return "text-pnl-positive";
  if (value < 0) return "text-pnl-negative";
  return "text-blue-500";
};

export const resultColorClass = (result: string): string => {
  const colors: Record<string, string> = {
    Win: "text-pnl-positive",
    Loss: "text-pnl-negative",
    "Break Even": "text-ink-muted",
  };
  return colors[result] ?? "text-ink-muted";
};

export const formatDateTime = (date: string): string =>
  new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const toDatetimeLocal = (isoString: string): string => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};
