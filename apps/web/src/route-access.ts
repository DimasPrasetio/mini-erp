import { matchPath } from "react-router-dom";
import type { PermissionCode } from "./types";

type RouteAccessRule = {
  pattern: string;
  permission?: PermissionCode;
};

export const ROUTE_ACCESS_RULES: RouteAccessRule[] = [
  { pattern: "/dashboard", permission: "dashboard.view" },
  { pattern: "/orders", permission: "order.view" },
  { pattern: "/orders/create", permission: "order.create" },
  { pattern: "/orders/:orderId", permission: "order.view" },
  { pattern: "/orders/:orderId/edit", permission: "order.update" },
  { pattern: "/items", permission: "product.view" },
  { pattern: "/items/create", permission: "product.create" },
  { pattern: "/items/:itemId", permission: "product.view" },
  { pattern: "/items/:itemId/edit", permission: "product.update" },
  { pattern: "/item-categories", permission: "product.view" },
  { pattern: "/stock", permission: "stock.view" },
  { pattern: "/stock/movements", permission: "stock.view" },
  { pattern: "/stock/adjustments/create", permission: "stock.create" },
  { pattern: "/stock/:itemId", permission: "stock.view" },
  { pattern: "/users", permission: "user.view" },
  { pattern: "/users/create", permission: "user.create" },
  { pattern: "/users/:membershipId/edit", permission: "user.update" },
  { pattern: "/reporting", permission: "reporting.view" },
  { pattern: "/settings", permission: "tenant_config.view" },
  { pattern: "/settings/order-status", permission: "tenant_config.manage" },
  { pattern: "/knowledge", permission: "knowledge.view" },
  { pattern: "/knowledge/upload", permission: "knowledge.create" },
  { pattern: "/whatsapp", permission: "whatsapp.view" },
  { pattern: "/customers", permission: "order.view" },
  { pattern: "/customers/create", permission: "order.create" },
  { pattern: "/customers/:partyId/edit", permission: "order.update" },
  { pattern: "/suppliers", permission: "order.view" },
  { pattern: "/suppliers/create", permission: "order.create" },
  { pattern: "/suppliers/:partyId/edit", permission: "order.update" },
  { pattern: "/audit-logs", permission: "audit_log.view" },
];

export function getRequiredPermission(pathname: string) {
  const matched = ROUTE_ACCESS_RULES.find((rule) =>
    matchPath(
      {
        path: rule.pattern,
        end: true,
      },
      pathname,
    ),
  );

  return matched?.permission;
}
