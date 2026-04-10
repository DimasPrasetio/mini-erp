import type { PermissionCode, RoleCode, SystemRoleCode } from "../types";

export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRoleCode, PermissionCode[]> = {
  superadmin: [
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
    "company_config.view",
    "company_config.manage",
    "branch.view",
    "branch.manage",
    "role.manage",
    "knowledge.view",
    "knowledge.create",
    "knowledge.update",
    "knowledge.archive",
    "whatsapp.view",
    "whatsapp.manage",
    "audit_log.view",
  ],
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
    "company_config.view",
    "company_config.manage",
    "branch.view",
    "branch.manage",
    "role.manage",
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
    "company_config.view",
    "company_config.manage",
    "branch.view",
    "branch.manage",
    "role.manage",
    "knowledge.view",
    "knowledge.create",
    "knowledge.update",
    "knowledge.archive",
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

export const ROLE_PERMISSIONS = DEFAULT_ROLE_PERMISSIONS;

const rolePriority: SystemRoleCode[] = ["superadmin", "owner", "admin", "staff"];

export function getDefaultRole(roles: RoleCode[]): RoleCode {
  return rolePriority.find((role) => roles.includes(role)) ?? roles[0] ?? "staff";
}

export function getRolePermissions(
  role: RoleCode | undefined,
  rolePermissions?: Record<string, PermissionCode[]>,
) {
  if (!role) {
    return [];
  }

  return rolePermissions?.[role] ?? DEFAULT_ROLE_PERMISSIONS[role as SystemRoleCode] ?? [];
}

export function hasPermission(
  role: RoleCode | undefined,
  permission: PermissionCode | undefined,
  rolePermissions?: Record<string, PermissionCode[]>,
) {
  if (!permission) {
    return true;
  }

  return getRolePermissions(role, rolePermissions).includes(permission);
}
