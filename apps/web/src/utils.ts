import type { StatusGroup, ToastTone } from "./types";

export function formatCurrency(amount: number | undefined, currencyCode = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

export function formatDateTime(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDateOnly(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatRoleLabel(role?: string) {
  switch (role) {
    case "superadmin":
      return "Superadmin";
    case "owner":
      return "Owner";
    case "admin":
      return "Admin";
    case "staff":
      return "Staff";
    default:
      return role
        ? role
          .split("_")
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
        : "-";
  }
}

export function statusTone(group: StatusGroup): ToastTone {
  switch (group) {
    case "pending":
      return "warning";
    case "active":
      return "info";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "info";
  }
}

export function channelTone(state: "connected" | "reconnecting" | "disconnected") {
  switch (state) {
    case "connected":
      return "success";
    case "reconnecting":
      return "warning";
    case "disconnected":
      return "danger";
    default:
      return "info";
  }
}

export function safeParseJson<T>(value: string, fallback: T) {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
