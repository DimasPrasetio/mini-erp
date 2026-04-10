import type { PermissionCode, RoleCode } from "../types";

export const ROLE_PERMISSIONS: Record<RoleCode, PermissionCode[]> = {
  owner: [
    "dashboard.view",
    "product.view",
    "product.create",
    "product.update",
    "product.archive",
    "order.view",
    "order.create",
    "order.update",
    "order.archive",
    "stock.view",
    "stock.create",
    "stock.update",
    "reporting.view",
    "user.view",
    "user.create",
    "user.update",
    "user.archive",
    "tenant_config.view",
    "tenant_config.manage",
    "knowledge.view",
    "knowledge.create",
    "knowledge.update",
    "knowledge.archive",
    "whatsapp.view",
    "whatsapp.manage",
    "audit_log.view",
  ],
  admin: [
    "dashboard.view",
    "product.view",
    "product.create",
    "product.update",
    "product.archive",
    "order.view",
    "order.create",
    "order.update",
    "order.archive",
    "stock.view",
    "stock.create",
    "stock.update",
    "reporting.view",
    "user.view",
    "user.create",
    "user.update",
    "user.archive",
    "tenant_config.view",
    "tenant_config.manage",
    "knowledge.view",
    "knowledge.create",
    "knowledge.update",
    "knowledge.archive",
    "whatsapp.view",
    "whatsapp.manage",
    "audit_log.view",
  ],
  staff: [
    "dashboard.view",
    "product.view",
    "order.view",
    "order.create",
    "order.update",
    "stock.view",
  ],
};

const rolePriority: RoleCode[] = ["owner", "admin", "staff"];

export function getDefaultRole(roles: RoleCode[]): RoleCode {
  return rolePriority.find((role) => roles.includes(role)) ?? roles[0] ?? "staff";
}

export function hasPermission(role: RoleCode | undefined, permission?: PermissionCode) {
  if (!permission) {
    return true;
  }

  if (!role) {
    return false;
  }

  return ROLE_PERMISSIONS[role].includes(permission);
}
