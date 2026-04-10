import { Link, useNavigate } from "react-router-dom";
import { Badge, Button, Notice, PageHeader, SectionCard, SummaryCard } from "@mini-erp/ui";
import { useMockApp } from "../../../mock/state";
import type { StatusDefinition } from "../../../types";
import { formatCurrency, formatDateTime, statusTone } from "../../../utils";

function statusGroupCount(group: string, statusDefinitions: StatusDefinition[], statusId?: string) {
  const status = statusDefinitions.find((entry) => entry.id === statusId);
  return status?.statusGroup === group;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { activeCompany, activeBranch, activeWorkspaceData, can } = useMockApp();

  if (!activeCompany || !activeBranch || !activeWorkspaceData) {
    return null;
  }

  const todaysOrders = activeWorkspaceData.orders.filter((order) =>
    order.orderDate.startsWith("2026-04-10"),
  );
  const pendingOrders = activeWorkspaceData.orders.filter((order) =>
    statusGroupCount("pending", activeWorkspaceData.statusDefinitions, order.currentStatusId),
  );
  const activeOrders = activeWorkspaceData.orders.filter((order) =>
    statusGroupCount("active", activeWorkspaceData.statusDefinitions, order.currentStatusId),
  );
  const criticalItems = activeWorkspaceData.stockBalances.filter((balance) => {
    const item = activeWorkspaceData.items.find((entry) => entry.id === balance.itemId);
    return item?.stockTracked && balance.availableQty <= (item.minStockQty ?? 0);
  });
  const todaysSales = todaysOrders.reduce((total, order) => total + order.totalAmount, 0);
  const actionableOrders = [...pendingOrders, ...activeOrders]
    .sort((left, right) => right.orderDate.localeCompare(left.orderDate))
    .slice(0, 4);

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={`${activeBranch.code} | ${activeCompany.code}`}
        title="Ringkasan Operasional"
        description={`Pantauan harian untuk ${activeBranch.name}. Data produk, knowledge, dan konfigurasi tetap tersinkron lintas perusahaan.`}
        actions={
          can("order.create") ? (
            <Button className="button-primary" onClick={() => navigate("/orders/create")}>
              Buat Pesanan Baru
            </Button>
          ) : undefined
        }
      />

      <div className="summary-grid">
        <SummaryCard
          hint={`Total ${todaysOrders.length} pesanan baru di cabang ini`}
          label="Pesanan Hari Ini"
          onClick={() => navigate("/orders?date_from=today")}
          tone="info"
          value={todaysOrders.length}
        />
        <SummaryCard
          hint="Perlu tindakan segera"
          label="Menunggu Aksi"
          onClick={() => navigate("/orders?status_group=pending")}
          tone="warning"
          value={pendingOrders.length}
        />
        <SummaryCard
          hint="Sedang dikerjakan tim cabang"
          label="Aktif / Diproses"
          onClick={() => navigate("/orders?status_group=active")}
          tone="success"
          value={activeOrders.length}
        />
        <SummaryCard
          hint="Perlu restock ke cabang aktif"
          label="Stok Hampir Habis"
          onClick={() => navigate("/stock?critical_only=true")}
          tone="danger"
          value={criticalItems.length}
        />
      </div>

      <div className="metric-strip">
        <div className="metric-box">
          <span className="muted">Penjualan Hari Ini</span>
          <strong>{formatCurrency(todaysSales, activeCompany.currencyCode)}</strong>
          <span className="muted">Omzet pesanan yang tercatat di cabang aktif.</span>
        </div>
        <div className="metric-box">
          <span className="muted">Produk Dipantau</span>
          <strong>{activeWorkspaceData.items.filter((item) => item.stockTracked).length}</strong>
          <span className="muted">Produk bersama yang stoknya dipantau per cabang.</span>
        </div>
        <div className="metric-box">
          <span className="muted">SOP & Referensi</span>
          <strong>{activeWorkspaceData.knowledgeDocuments.length}</strong>
          <span className="muted">Dokumen perusahaan siap dipakai seluruh tim.</span>
        </div>
        <div className="metric-box">
          <span className="muted">Koneksi WhatsApp</span>
          <strong>{activeWorkspaceData.whatsappChannelStatus.state}</strong>
          <span className="muted">Gateway perusahaan untuk asisten otomatis.</span>
        </div>
      </div>

      <div className="split-layout">
        <SectionCard
          actions={<Link className="button button-secondary button-sm" to="/orders">Lihat Semua</Link>}
          description={`Pesanan ${activeBranch.name} yang perlu ditindaklanjuti.`}
          title="Pesanan Prioritas"
        >
          <div className="list-stack">
            {actionableOrders.map((order) => {
              const status = activeWorkspaceData.statusDefinitions.find(
                (entry) => entry.id === order.currentStatusId,
              );
              const party = activeWorkspaceData.businessParties.find(
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

        <SectionCard
          actions={
            <Link className="button button-secondary button-sm" to="/stock?critical_only=true">
              Buka Stok
            </Link>
          }
          description={`Stok kritis pada ${activeBranch.defaultStockLocationLabel}.`}
          title="Stok Kritis"
        >
          {criticalItems.length > 0 ? (
            <div className="list-stack">
              {criticalItems.map((balance) => {
                const item = activeWorkspaceData.items.find((entry) => entry.id === balance.itemId);
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
                      Minimum {item?.minStockQty} {item?.uom} | update terakhir {formatDateTime(balance.updatedAt)}
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
  );
}
