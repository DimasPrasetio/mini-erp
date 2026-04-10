import { Notice, PageHeader, SectionCard } from "@mini-erp/ui";
import { useMockApp } from "../../../mock/state";
import { compactNumber, formatCurrency } from "../../../utils";

export function ReportingPage() {
  const { activeCompany, activeBranch, activeWorkspaceData } = useMockApp();

  if (!activeCompany || !activeBranch || !activeWorkspaceData) {
    return null;
  }

  const totalOrders = activeWorkspaceData.orders.length;
  const pendingOrders = activeWorkspaceData.orders.filter((order) => {
    const status = activeWorkspaceData.statusDefinitions.find((entry) => entry.id === order.currentStatusId);
    return status?.statusGroup === "pending";
  });
  const completedOrders = activeWorkspaceData.orders.filter((order) => {
    const status = activeWorkspaceData.statusDefinitions.find((entry) => entry.id === order.currentStatusId);
    return status?.statusGroup === "completed";
  });
  const trackedItems = activeWorkspaceData.items.filter((item) => item.stockTracked).length;
  const criticalItems = activeWorkspaceData.stockBalances.filter((balance) => {
    const item = activeWorkspaceData.items.find((entry) => entry.id === balance.itemId);
    return balance.availableQty <= (item?.minStockQty ?? 0);
  });
  const totalSales = activeWorkspaceData.orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Laporan</span>}
        description={`Ringkasan performa ${activeBranch.name}. Filter detail lintas cabang belum dibuka pada fase ini, sesuai rancangan MVP.`}
        title="Laporan Operasional"
      />

      <div className="summary-grid">
        <div className="summary-card summary-card-info">
          <div className="summary-label">Total Order</div>
          <div className="summary-value">{totalOrders}</div>
          <div className="summary-hint">Semua pesanan di cabang aktif</div>
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
          <div className="summary-hint">Item di bawah minimum cabang aktif</div>
        </div>
      </div>

      <div className="grid-2">
        <SectionCard title="Ringkasan Order" description="Pencapaian penjualan pada cabang aktif.">
          <div className="list-stack">
            <div className="progress-row">
              <span className="strong">Omzet total</span>
              <span className="muted">{formatCurrency(totalSales, activeCompany.currencyCode)}</span>
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
              <span className="muted">Daftar ini sebaiknya tidak menumpuk lebih lama.</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Ringkasan Stok" description={`Rangkuman ketersediaan barang di ${activeBranch.defaultStockLocationLabel}.`}>
          <div className="list-stack">
            <div className="kv-item">
              <span>Total produk dipantau</span>
              <strong>{trackedItems}</strong>
            </div>
            {criticalItems.length > 0 ? (
              criticalItems.map((balance) => {
                const item = activeWorkspaceData.items.find((entry) => entry.id === balance.itemId);
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
