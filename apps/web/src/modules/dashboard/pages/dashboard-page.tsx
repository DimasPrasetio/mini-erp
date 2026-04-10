import { Link, useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Notice,
  PageHeader,
  SectionCard,
  SummaryCard,
} from "@mini-erp/ui";
import { useMockApp } from "../../../mock/state";
import type { StatusDefinition } from "../../../types";
import { compactNumber, formatCurrency, formatDateTime, statusTone } from "../../../utils";

function statusGroupCount(group: string, statusDefinitions: StatusDefinition[], statusId?: string) {
  const status = statusDefinitions.find((entry) => entry.id === statusId);
  return status?.statusGroup === group;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { activeTenant, activeTenantData, can } = useMockApp();

  if (!activeTenant || !activeTenantData) {
    return null;
  }

  const todaysOrders = activeTenantData.orders.filter((order) =>
    order.orderDate.startsWith("2026-04-10"),
  );
  const pendingOrders = activeTenantData.orders.filter((order) =>
    statusGroupCount("pending", activeTenantData.statusDefinitions, order.currentStatusId),
  );
  const activeOrders = activeTenantData.orders.filter((order) =>
    statusGroupCount("active", activeTenantData.statusDefinitions, order.currentStatusId),
  );
  const criticalItems = activeTenantData.stockBalances.filter((balance) => {
    const item = activeTenantData.items.find((entry) => entry.id === balance.itemId);
    return item?.stockTracked && balance.availableQty <= (item.minStockQty ?? 0);
  });
  const todaysSales = todaysOrders.reduce((total, order) => total + order.totalAmount, 0);
  const actionableOrders = [...pendingOrders, ...activeOrders]
    .sort((left, right) => right.orderDate.localeCompare(left.orderDate))
    .slice(0, 4);

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={`${activeTenant.code} · Dashboard`}
        title="Ringkasan Operasional"
        description="Ringkasan performa dan tugas harian bisnis Anda hari ini."
        actions={
          can("order.create") ? (
            <Button className="button-primary" onClick={() => navigate("/orders/create")}>Buat Pesanan Baru</Button>
          ) : undefined
        }
      />

      <div className="summary-grid">
        <SummaryCard
          hint={`Total ${todaysOrders.length} pesanan baru`}
          label="Pesanan Hari Ini"
          onClick={() => navigate("/orders?date_from=today")}
          tone="info"
          value={todaysOrders.length}
        />
        <SummaryCard
          hint={`Perlu tindakan`}
          label="Menunggu Aksi"
          onClick={() => navigate("/orders?status_group=pending")}
          tone="warning"
          value={pendingOrders.length}
        />
        <SummaryCard
          hint={`Dalam proses`}
          label="Aktif / Diproses"
          onClick={() => navigate("/orders?status_group=active")}
          tone="success"
          value={activeOrders.length}
        />
        <SummaryCard
          hint={`Harus segera re-stock`}
          label="Stok Hampir Habis"
          onClick={() => navigate("/stock?critical_only=true")}
          tone="danger"
          value={criticalItems.length}
        />
      </div>

      <div className="metric-strip">
        <div className="metric-box">
          <span className="muted">Penjualan Hari Ini</span>
          <strong>{formatCurrency(todaysSales, activeTenant.currencyCode)}</strong>
          <span className="muted">Total penjualan terkonfirmasi.</span>
        </div>
        <div className="metric-box">
          <span className="muted">Produk Dipantau</span>
          <strong>{activeTenantData.items.filter((item) => item.stockTracked).length}</strong>
          <span className="muted">Stok berjalan dan tercatat sistem.</span>
        </div>
        <div className="metric-box">
          <span className="muted">SOP & Referensi</span>
          <strong>{activeTenantData.knowledgeDocuments.length}</strong>
          <span className="muted">Dokumen bisnis tersimpan.</span>
        </div>
        <div className="metric-box">
          <span className="muted">Koneksi WhatsApp</span>
          <strong>{activeTenantData.whatsappChannelStatus.state}</strong>
          <span className="muted">Status penghubung pesan otomatis.</span>
        </div>
      </div>

      <div className="split-layout">
        <SectionCard
          actions={<Link className="button button-secondary button-sm" to="/orders">Lihat Semua</Link>}
          description="Pesanan yang perlu ditindaklanjuti."
          title="Pesanan Prioritas"
        >
          <div className="list-stack">
            {actionableOrders.map((order) => {
              const status = activeTenantData.statusDefinitions.find(
                (entry) => entry.id === order.currentStatusId,
              );
              const party = activeTenantData.businessParties.find(
                (entry) => entry.id === order.relatedPartyId,
              );
              return (
                <button
                  className="list-item"
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  type="button"
                >
                  <div className="inline-stack" style={{ justifyContent: "space-between" }}>
                    <strong>{order.orderNumber}</strong>
                    <Badge tone={statusTone(status?.statusGroup ?? "pending")}>{status?.label}</Badge>
                  </div>
                  <div className="inline-stack">
                    <span className="muted">{party?.name ?? "Pihak terkait belum dipilih"}</span>
                    <span className="muted">Jatuh tempo {formatDateTime(order.dueDate)}</span>
                  </div>
                  <span className="muted">{order.notes}</span>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <div className="page-shell">
          <SectionCard
            actions={<Link className="button button-secondary button-sm" to="/stock?critical_only=true">Buka Stok</Link>}
            description="Stok produk yang mendekati batas minimum."
            title="Stok Kritis"
          >
            {criticalItems.length > 0 ? (
              <div className="list-stack">
                {criticalItems.map((balance) => {
                  const item = activeTenantData.items.find((entry) => entry.id === balance.itemId);
                  return (
                    <button
                      className="list-item"
                      key={balance.id}
                      onClick={() => navigate(`/stock/${balance.itemId}`)}
                      type="button"
                    >
                      <div className="inline-stack" style={{ justifyContent: "space-between" }}>
                        <strong>{item?.itemName}</strong>
                        <Badge tone="danger">Tersisa {balance.availableQty}</Badge>
                      </div>
                      <span className="muted">
                        Minimum {item?.minStockQty} {item?.uom} · update terakhir {formatDateTime(balance.updatedAt)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <Notice tone="success" title="Tidak ada stok kritis">
                Semua item tracked masih berada di atas batas minimum.
              </Notice>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
