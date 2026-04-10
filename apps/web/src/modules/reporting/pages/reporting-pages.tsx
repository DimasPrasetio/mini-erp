import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  Notice,
  PageHeader,
  SectionCard,
  SearchableSelect,
} from "@mini-erp/ui";
import { useMockApp } from "../../../mock/state";
import { ROLE_PERMISSIONS } from "../../../mock/permissions";
import {
  channelTone,
  compactNumber,
  formatCurrency,
  formatDateTime,
  formatRoleLabel,
  safeParseJson,
  statusTone,
} from "../../../utils";

const MODULES_LIST = [
  { key: "dashboard", label: "Dashboard", actions: ["view"] },
  { key: "product", label: "Produk & Item", actions: ["view", "create", "update", "archive"] },
  { key: "order", label: "Penjualan / Order", actions: ["view", "create", "update", "archive"] },
  { key: "stock", label: "Inventori Gudang", actions: ["view", "create", "update"] },
  { key: "reporting", label: "Laporan Bisnis", actions: ["view"] },
  { key: "user", label: "Pengguna & Tim", actions: ["view", "create", "update", "archive"] },
  { key: "tenant_config", label: "Pengaturan", actions: ["view", "manage"] },
  { key: "knowledge", label: "Basis Pengetahuan (AI)", actions: ["view", "create", "update", "archive"] },
  { key: "whatsapp", label: "Asisten WA Gateway", actions: ["view", "manage"] },
  { key: "audit_log", label: "Audit Log", actions: ["view"] },
];

const ACTIONS = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "update", label: "Update" },
  { key: "archive", label: "Archive" },
  { key: "manage", label: "Manage" },
];

export function ReportingPage() {
  const { activeTenant, activeTenantData } = useMockApp();

  if (!activeTenant || !activeTenantData) {
    return null;
  }

  const totalOrders = activeTenantData.orders.length;
  const pendingOrders = activeTenantData.orders.filter((order) => {
    const status = activeTenantData.statusDefinitions.find((entry) => entry.id === order.currentStatusId);
    return status?.statusGroup === "pending";
  });
  const completedOrders = activeTenantData.orders.filter((order) => {
    const status = activeTenantData.statusDefinitions.find((entry) => entry.id === order.currentStatusId);
    return status?.statusGroup === "completed";
  });
  const trackedItems = activeTenantData.items.filter((item) => item.stockTracked).length;
  const criticalItems = activeTenantData.stockBalances.filter((balance) => {
    const item = activeTenantData.items.find((entry) => entry.id === balance.itemId);
    return balance.availableQty <= (item?.minStockQty ?? 0);
  });
  const totalSales = activeTenantData.orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Laporan</span>}
        description="Laporan operasional bisnis."
        title="Laporan Operasional"
      />

      <div className="summary-grid">
        <div className="summary-card summary-card-info">
          <div className="summary-label">Total Order</div>
          <div className="summary-value">{totalOrders}</div>
          <div className="summary-hint">Semua pesanan di bisnis ini</div>
        </div>
        <div className="summary-card summary-card-warning">
          <div className="summary-label">Pending</div>
          <div className="summary-value">{pendingOrders.length}</div>
          <div className="summary-hint">Order butuh tindak lanjut</div>
        </div>
        <div className="summary-card summary-card-success">
          <div className="summary-label">Selesai</div>
          <div className="summary-value">{completedOrders.length}</div>
          <div className="summary-hint">Sudah mencapai status akhir</div>
        </div>
        <div className="summary-card summary-card-danger">
          <div className="summary-label">Stok Kritis</div>
          <div className="summary-value">{criticalItems.length}</div>
          <div className="summary-hint">Item di bawah minimum</div>
        </div>
      </div>

      <div className="grid-2">
        <SectionCard title="Ringkasan Order" description="Pencapaian penjualan.">
          <div className="list-stack">
            <div className="progress-row">
              <span className="strong">Omzet total</span>
              <span className="muted">{formatCurrency(totalSales, activeTenant.currencyCode)}</span>
            </div>
            <div className="progress-row">
              <span className="strong">Order selesai</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(completedOrders.length / Math.max(totalOrders, 1)) * 100}%` }}
                />
              </div>
              <span className="muted">
                {compactNumber(completedOrders.length)} dari {compactNumber(totalOrders)} order
              </span>
            </div>
            <div className="progress-row">
              <span className="strong">Order pending</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(pendingOrders.length / Math.max(totalOrders, 1)) * 100}%` }}
                />
              </div>
              <span className="muted">
                Daftar ini sebaiknya tidak menumpuk lebih lama.
              </span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Ringkasan Stok" description="Rangkuman ketersediaan barang.">
          <div className="list-stack">
            <div className="kv-item">
              <span>Total produk dipantau</span>
              <strong>{trackedItems}</strong>
            </div>
            {criticalItems.length > 0 ? (
              criticalItems.map((balance) => {
                const item = activeTenantData.items.find((entry) => entry.id === balance.itemId);
                return (
                  <div className="kv-item" key={balance.id}>
                    <span>{item?.itemName}</span>
                    <strong>
                      {balance.availableQty} tersedia dari minimum {item?.minStockQty}
                    </strong>
                  </div>
                );
              })
            ) : (
              <Notice tone="success">Tidak ada item yang berada di bawah minimum stok.</Notice>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}