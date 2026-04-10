import { useState } from "react";
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AppShell, Badge, Button, ToastViewport } from "@mini-erp/ui";
import { useMockApp } from "./mock/state";
import { getRequiredPermission } from "./route-access";
import { formatRoleLabel } from "./utils";
import { ROLE_PERMISSIONS } from "./mock/permissions";
import type { PermissionCode } from "./types";
import { LoginPage, TenantSelectorPage } from "./modules/auth/pages/auth-pages";
import { DashboardPage } from "./modules/dashboard/pages/dashboard-page";
import { ItemCategoriesPage, ItemDetailPage, ItemFormPage, ItemsListPage } from "./modules/items/pages/items-pages";
import { OrderDetailPage, OrderFormPage, OrdersListPage } from "./modules/sales/pages/orders-pages";
import {
  StockAdjustmentPage,
  StockDetailPage,
  StockListPage,
  StockMovementsPage,
} from "./modules/inventory/pages/stock-pages";
import { AuditLogsPage } from "./modules/audit-log/pages/audit-log-pages";
import { ForbiddenPage, NotFoundPage } from "./modules/core/pages/error-pages";
import { KnowledgePage, KnowledgeUploadPage } from "./modules/knowledge/pages/knowledge-pages";
import { OrderStatusSettingsPage, SettingsPage } from "./modules/tenant/pages/tenant-pages";
import { ReportingPage } from "./modules/reporting/pages/reporting-pages";
import { UserFormPage, UsersListPage } from "./modules/users/pages/users-pages";
import { WhatsappPage } from "./modules/whatsapp/pages/whatsapp-pages";
import { CustomersListPage, CustomerFormPage } from "./modules/business-party/pages/customers-pages";
import { SuppliersListPage, SupplierFormPage } from "./modules/business-party/pages/suppliers-pages";

type MenuItem = {
  label: string;
  to: string;
  permission?: PermissionCode;
  note?: string;
};

const MENU_GROUPS: Array<{ label: string; items: MenuItem[] }> = [
  {
    label: "Utama",
    items: [{ label: "Dashboard", to: "/dashboard", permission: "dashboard.view" }],
  },
  {
    label: "Operasional",
    items: [
      { label: "Order", to: "/orders", permission: "order.view" },
      { label: "Produk", to: "/items", permission: "product.view" },
      { label: "Stok", to: "/stock", permission: "stock.view" },
      { label: "Pelanggan", to: "/customers", permission: "order.view" },
      { label: "Pemasok", to: "/suppliers", permission: "order.view" },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { label: "Laporan", to: "/reporting", permission: "reporting.view" },
      { label: "Audit Log", to: "/audit-logs", permission: "audit_log.view" },
    ],
  },
  {
    label: "Master Data",
    items: [
      { label: "Pengguna", to: "/users", permission: "user.view" },
      { label: "Knowledge Base", to: "/knowledge", permission: "knowledge.view" },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      { label: "Pengaturan", to: "/settings", permission: "tenant_config.view" },
      { label: "Asisten WA", to: "/whatsapp", permission: "whatsapp.view", note: "Quick Mode" },
    ],
  },
];

function RouteGuard({
  children,
  permission,
}: {
  children: React.ReactNode;
  permission?: PermissionCode;
}) {
  const location = useLocation();
  const { isAuthenticated, activeTenant, can } = useMockApp();

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (!activeTenant) {
    return <Navigate replace to="/select-tenant" />;
  }

  if (permission && !can(permission)) {
    return <Navigate replace to="/403" />;
  }

  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, activeTenant } = useMockApp();

  if (isAuthenticated && activeTenant) {
    return <Navigate replace to="/dashboard" />;
  }

  if (isAuthenticated && !activeTenant) {
    return <Navigate replace to="/select-tenant" />;
  }

  return <>{children}</>;
}

function pageTitle(pathname: string) {
  if (pathname.startsWith("/orders")) return "Order";
  if (pathname.startsWith("/items")) return "Produk";
  if (pathname.startsWith("/item-categories")) return "Kategori";
  if (pathname.startsWith("/stock")) return "Stok";
  if (pathname.startsWith("/users")) return "Pengguna";
  if (pathname.startsWith("/reporting")) return "Laporan";
  if (pathname.startsWith("/settings")) return "Pengaturan";
  if (pathname.startsWith("/knowledge")) return "Knowledge Base";
  if (pathname.startsWith("/whatsapp")) return "Asisten WA";
  if (pathname.startsWith("/customers")) return "Pelanggan";
  if (pathname.startsWith("/suppliers")) return "Pemasok";
  if (pathname.startsWith("/audit-logs")) return "Audit Log";
  if (pathname.startsWith("/403")) return "Akses Ditolak";
  return "Dashboard";
}

function AvatarMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeRoleCode, activeTenant, activeUser, availableRoles, logout, switchRole } = useMockApp();
  const [open, setOpen] = useState(false);
  const [showRoles, setShowRoles] = useState(false);

  if (!activeUser || !activeTenant) {
    return null;
  }

  return (
    <div className="avatar-menu-wrap">
      <button
        className="avatar-trigger"
        onClick={() => {
          setOpen((current) => !current);
          setShowRoles(false);
        }}
        type="button"
      >
        <div className="avatar-circle">{activeUser.fullName.slice(0, 2).toUpperCase()}</div>
        <div style={{ textAlign: "left" }}>
          <div className="strong">{activeUser.fullName}</div>
          <div className="muted">{formatRoleLabel(activeRoleCode)}</div>
        </div>
      </button>

      {open ? (
        <div className="avatar-menu">
          <div className="field-stack">
            <strong>{activeUser.fullName}</strong>
            <div className="inline-stack">
              <Badge tone="accent">{formatRoleLabel(activeRoleCode)}</Badge>
              <Badge tone="neutral">{activeTenant.code}</Badge>
            </div>
          </div>

          {availableRoles.length > 1 ? (
            <>
              <div className="menu-divider" />
              <button
                className="menu-item-button"
                onClick={() => setShowRoles((s) => !s)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}
                type="button"
              >
                Ganti Role
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: showRoles ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease"
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showRoles ? (
                <div className="menu-list" style={{ background: "var(--bg-canvas)", padding: "4px 8px", margin: "0 8px", borderRadius: "var(--radius-md)" }}>
                  {availableRoles.map((role) => (
                    <button
                      className={`menu-item-button ${role === activeRoleCode ? "menu-item-active" : ""}`}
                      style={{ padding: "6px 12px", borderRadius: "4px" }}
                      key={role}
                      onClick={() => {
                        const changed = switchRole(role);
                        if (changed) {
                          const requiredPermission = getRequiredPermission(location.pathname);
                          const canStay =
                            !requiredPermission || ROLE_PERMISSIONS[role].includes(requiredPermission);
                          if (!canStay) {
                            navigate("/dashboard");
                          }
                          setOpen(false);
                          setShowRoles(false);
                        }
                      }}
                      type="button"
                    >
                      {formatRoleLabel(role)}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}

          <div className="menu-divider" />
          <div className="menu-list">
            <button className="menu-item-button" onClick={() => setOpen(false)} style={{ width: "100%" }} type="button">
              Profil Saya
            </button>
            <button
              className="menu-item-button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              style={{ width: "100%", color: "var(--color-danger)" }}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ShellLayout() {
  const location = useLocation();
  const { activeTenant, can } = useMockApp();

  const sidebar = (
    <div className="sidebar-panel">
      <div className="brand-block">
        <div className="brand-mark">M</div>
        <div>
          <h1 style={{ fontSize: "1.2rem", color: "white" }}>Mini ERP</h1>
          <p style={{ fontSize: "0.8rem", marginTop: 4, color: "var(--text-muted)" }}>Sistem Operasional</p>
        </div>
      </div>

      {MENU_GROUPS.map((group) => {
        const items = group.items.filter((item) => can(item.permission));
        if (items.length === 0) {
          return null;
        }

        return (
          <div className="nav-group" key={group.label}>
            <div className="nav-group-title">{group.label}</div>
            {items.map((item) => (
              <NavLink
                className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
                key={item.to}
                to={item.to}
              >
                <span>{item.label}</span>
                {item.note ? <span className="nav-link-note" style={{ fontSize: "0.7rem", opacity: 0.7, paddingLeft: 8 }}>{item.note}</span> : null}
              </NavLink>
            ))}
          </div>
        );
      })}

    </div>
  );

  const topbar = (
    <div className="topbar-panel">
      <div className="topbar-title">
        <small>Tenant Aktif</small>
        <strong>{pageTitle(location.pathname)}</strong>
      </div>
      <div className="topbar-actions">
        {activeTenant ? (
          <div className="tenant-chip">
            <span className="muted">Workspace</span>
            <strong>{activeTenant.name}</strong>
          </div>
        ) : null}
        <AvatarMenu />
      </div>
    </div>
  );

  return (
    <AppShell sidebar={sidebar} topbar={topbar}>
      <Outlet />
    </AppShell>
  );
}

function AppRoutes() {
  const { toasts } = useMockApp();

  return (
    <>
      <Routes>
        <Route
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
          path="/login"
        />
        <Route
          element={
            <RouteGuard>
              <TenantSelectorPage />
            </RouteGuard>
          }
          path="/select-tenant"
        />
        <Route element={<ShellLayout />}>
          <Route
            element={
              <RouteGuard permission="dashboard.view">
                <DashboardPage />
              </RouteGuard>
            }
            path="/dashboard"
          />
          <Route
            element={
              <RouteGuard permission="order.view">
                <OrdersListPage />
              </RouteGuard>
            }
            path="/orders"
          />
          <Route
            element={
              <RouteGuard permission="order.create">
                <OrderFormPage />
              </RouteGuard>
            }
            path="/orders/create"
          />
          <Route
            element={
              <RouteGuard permission="order.view">
                <OrderDetailPage />
              </RouteGuard>
            }
            path="/orders/:orderId"
          />
          <Route
            element={
              <RouteGuard permission="order.update">
                <OrderFormPage />
              </RouteGuard>
            }
            path="/orders/:orderId/edit"
          />
          <Route
            element={
              <RouteGuard permission="product.view">
                <ItemsListPage />
              </RouteGuard>
            }
            path="/items"
          />
          <Route
            element={
              <RouteGuard permission="product.create">
                <ItemFormPage />
              </RouteGuard>
            }
            path="/items/create"
          />
          <Route
            element={
              <RouteGuard permission="product.view">
                <ItemDetailPage />
              </RouteGuard>
            }
            path="/items/:itemId"
          />
          <Route
            element={
              <RouteGuard permission="product.update">
                <ItemFormPage />
              </RouteGuard>
            }
            path="/items/:itemId/edit"
          />
          <Route
            element={
              <RouteGuard permission="product.view">
                <ItemCategoriesPage />
              </RouteGuard>
            }
            path="/item-categories"
          />
          <Route
            element={
              <RouteGuard permission="stock.view">
                <StockListPage />
              </RouteGuard>
            }
            path="/stock"
          />
          <Route
            element={
              <RouteGuard permission="stock.view">
                <StockMovementsPage />
              </RouteGuard>
            }
            path="/stock/movements"
          />
          <Route
            element={
              <RouteGuard permission="stock.create">
                <StockAdjustmentPage />
              </RouteGuard>
            }
            path="/stock/adjustments/create"
          />
          <Route
            element={
              <RouteGuard permission="stock.view">
                <StockDetailPage />
              </RouteGuard>
            }
            path="/stock/:itemId"
          />
          <Route
            element={
              <RouteGuard permission="user.view">
                <UsersListPage />
              </RouteGuard>
            }
            path="/users"
          />
          <Route
            element={
              <RouteGuard permission="user.create">
                <UserFormPage />
              </RouteGuard>
            }
            path="/users/create"
          />
          <Route
            element={
              <RouteGuard permission="user.update">
                <UserFormPage />
              </RouteGuard>
            }
            path="/users/:membershipId/edit"
          />
          <Route
            element={
              <RouteGuard permission="reporting.view">
                <ReportingPage />
              </RouteGuard>
            }
            path="/reporting"
          />
          <Route
            element={
              <RouteGuard permission="tenant_config.view">
                <SettingsPage />
              </RouteGuard>
            }
            path="/settings"
          />
          <Route
            element={
              <RouteGuard permission="tenant_config.manage">
                <OrderStatusSettingsPage />
              </RouteGuard>
            }
            path="/settings/order-status"
          />
          <Route
            element={
              <RouteGuard permission="knowledge.view">
                <KnowledgePage />
              </RouteGuard>
            }
            path="/knowledge"
          />
          <Route
            element={
              <RouteGuard permission="knowledge.create">
                <KnowledgeUploadPage />
              </RouteGuard>
            }
            path="/knowledge/upload"
          />
          <Route
            element={
              <RouteGuard permission="whatsapp.view">
                <WhatsappPage />
              </RouteGuard>
            }
            path="/whatsapp"
          />
          <Route
            element={
              <RouteGuard permission="order.view">
                <CustomersListPage />
              </RouteGuard>
            }
            path="/customers"
          />
          <Route
            element={
              <RouteGuard permission="order.create">
                <CustomerFormPage />
              </RouteGuard>
            }
            path="/customers/create"
          />
          <Route
            element={
              <RouteGuard permission="order.update">
                <CustomerFormPage />
              </RouteGuard>
            }
            path="/customers/:partyId/edit"
          />
          <Route
            element={
              <RouteGuard permission="order.view">
                <SuppliersListPage />
              </RouteGuard>
            }
            path="/suppliers"
          />
          <Route
            element={
              <RouteGuard permission="order.create">
                <SupplierFormPage />
              </RouteGuard>
            }
            path="/suppliers/create"
          />
          <Route
            element={
              <RouteGuard permission="order.update">
                <SupplierFormPage />
              </RouteGuard>
            }
            path="/suppliers/:partyId/edit"
          />
          <Route
            element={
              <RouteGuard permission="audit_log.view">
                <AuditLogsPage />
              </RouteGuard>
            }
            path="/audit-logs"
          />
          <Route
            element={
              <RouteGuard>
                <ForbiddenPage />
              </RouteGuard>
            }
            path="/403"
          />
          <Route
            element={
              <RouteGuard>
                <NotFoundPage />
              </RouteGuard>
            }
            path="*"
          />
        </Route>
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
      <ToastViewport toasts={toasts} />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
