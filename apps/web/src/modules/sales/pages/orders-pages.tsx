import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  FilterBar,
  Notice,
  PageHeader,
  SectionCard,
  SearchableSelect,
} from "@mini-erp/ui";
import { useMockApp } from "../../../mock/state";
import type { Order } from "../../../types";
import { formatCurrency, formatDateOnly, formatDateTime, statusTone } from "../../../utils";

type DraftLine = {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  notes: string;
};

function toInputDate(value?: string) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 16);
}

export function OrdersListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeTenantData, can } = useMockApp();

  if (!activeTenantData) {
    return null;
  }

  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const statusGroup = searchParams.get("status_group") ?? "";
  const orderKind = searchParams.get("order_kind") ?? "";

  const orders = activeTenantData.orders.filter((order) => {
    const status = activeTenantData.statusDefinitions.find((entry) => entry.id === order.currentStatusId);
    const matchesSearch =
      search.length === 0 || order.orderNumber.toLowerCase().includes(search);
    const matchesStatus = statusGroup.length === 0 || status?.statusGroup === statusGroup;
    const matchesKind = orderKind.length === 0 || order.orderKind === orderKind;

    return matchesSearch && matchesStatus && matchesKind;
  });

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Order</span>}
        description="Kelola seluruh pesanan pelanggan."
        title="Daftar Order"
        actions={can("order.create") ? <Button className="button-primary" onClick={() => navigate("/orders/create")}>Buat Order Baru</Button> : undefined}
      />

      <FilterBar>
        <div className="field">
          <label htmlFor="order-search">Cari nomor order</label>
          <input
            className="input"
            id="order-search"
            onChange={(event) => {
              const next = new URLSearchParams(searchParams);
              if (event.target.value) {
                next.set("search", event.target.value);
              } else {
                next.delete("search");
              }
              setSearchParams(next);
            }}
            placeholder="ORD-2026..."
            value={searchParams.get("search") ?? ""}
          />
        </div>
        <div className="field">
          <label htmlFor="status-group">Group status</label>
          <SearchableSelect
            id="status-group"
            onChange={(val) => {
              const next = new URLSearchParams(searchParams);
              if (val) {
                next.set("status_group", val);
              } else {
                next.delete("status_group");
              }
              setSearchParams(next);
            }}
            value={statusGroup}
            options={[
              { value: "", label: "Semua" },
              { value: "pending", label: "Pending" },
              { value: "active", label: "Aktif" },
              { value: "completed", label: "Selesai" },
              { value: "cancelled", label: "Dibatalkan" },
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="order-kind">Jenis order</label>
          <SearchableSelect
            id="order-kind"
            onChange={(val) => {
              const next = new URLSearchParams(searchParams);
              if (val) {
                next.set("order_kind", val);
              } else {
                next.delete("order_kind");
              }
              setSearchParams(next);
            }}
            value={orderKind}
            options={[
              { value: "", label: "Semua" },
              { value: "transaction", label: "Transaksi" },
              { value: "request", label: "Permintaan" },
              { value: "job", label: "Pekerjaan" },
            ]}
          />
        </div>
      </FilterBar>

      <SectionCard description={`${orders.length} order ditampilkan.`} title="Antrian Order">
        {orders.length > 0 ? (
          <DataTable
            columns={[
              {
                header: "Nomor Order",
                render: (order) => (
                  <div className="field-stack">
                    <strong>{order.orderNumber}</strong>
                    <span className="muted">{formatDateTime(order.orderDate)}</span>
                  </div>
                ),
              },
              {
                header: "Pihak Terkait",
                render: (order) =>
                  activeTenantData.businessParties.find((party) => party.id === order.relatedPartyId)?.name ?? "-",
              },
              {
                header: "Status",
                render: (order) => {
                  const status = activeTenantData.statusDefinitions.find(
                    (entry) => entry.id === order.currentStatusId,
                  );
                  return <Badge tone={statusTone(status?.statusGroup ?? "pending")}>{status?.label}</Badge>;
                },
              },
              {
                header: "PIC",
                render: (order) => <span>{order.assignedMembershipId ? order.assignedMembershipId.replace("membership-", "") : "-"}</span>,
              },
              {
                header: "Total",
                align: "right",
                render: (order) => formatCurrency(order.totalAmount),
              },
              {
                header: "Aksi",
                render: (order) => (
                  <div className="inline-stack">
                    <Button onClick={() => navigate(`/orders/${order.id}`)} variant="secondary">
                      Detail
                    </Button>
                  </div>
                ),
              },
            ]}
            rowKey={(order) => order.id}
            rows={orders}
          />
        ) : (
          <EmptyState
            action={can("order.create") ? <Button onClick={() => navigate("/orders/create")}>Buat Order</Button> : undefined}
            description="Belum ada pesanan untuk filter ini."
            title="Pesanan Kosong"
          />
        )}
      </SectionCard>
    </div>
  );
}

export function OrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { activeTenantData, findMembershipName, updateOrderStatus, can } = useMockApp();
  const [selectedTransition, setSelectedTransition] = useState<{ id: string; label: string }>();

  if (!activeTenantData) {
    return null;
  }

  const order = activeTenantData.orders.find((entry) => entry.id === orderId);
  if (!order) {
    return (
      <Notice tone="danger" title="Order tidak ditemukan">
        Order yang Anda cari tidak tersedia pada tenant aktif.
      </Notice>
    );
  }

  const status = activeTenantData.statusDefinitions.find((entry) => entry.id === order.currentStatusId);
  const party = activeTenantData.businessParties.find((entry) => entry.id === order.relatedPartyId);
  const transitions = activeTenantData.statusTransitions.filter(
    (entry) => entry.fromStatusId === order.currentStatusId && entry.active,
  );

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Order &gt; {order.orderNumber}</span>}
        description={order.notes || "Detail informasi pemesanan."}
        title={order.orderNumber}
        actions={
          <div className="inline-stack">
            <Button onClick={() => navigate(-1)} variant="ghost">
              &larr; Kembali
            </Button>
            {can("order.update") ? (
              <Button onClick={() => navigate(`/orders/${order.id}/edit`)} variant="secondary">
                Edit Order
              </Button>
            ) : null}
            {transitions.map((transition) => (
              <Button
                key={transition.id}
                onClick={() =>
                  setSelectedTransition({
                    id: transition.toStatusId,
                    label: transition.transitionLabel,
                  })
                }
                variant="secondary"
              >
                {transition.transitionLabel}
              </Button>
            ))}
          </div>
        }
      />

      <div className="grid-2">
        <SectionCard title="Informasi Pesanan" description="Detail utama status dan pihak terkait.">
          <div className="kv-grid">
            <div className="kv-item">
              <span>Status</span>
              <strong>{status?.label}</strong>
            </div>
            <div className="kv-item">
              <span>Jenis Order</span>
              <strong style={{ textTransform: "capitalize" }}>
                {
                  {
                    transaction: "Transaksi",
                    request: "Permintaan",
                    job: "Pekerjaan",
                  }[order.orderKind as string] || order.orderKind
                }
              </strong>
            </div>
            <div className="kv-item">
              <span>Pihak Terkait</span>
              <strong>{party?.name ?? "-"}</strong>
            </div>
            <div className="kv-item">
              <span>PIC</span>
              <strong>{findMembershipName(order.assignedMembershipId)}</strong>
            </div>
            <div className="kv-item">
              <span>Tanggal Order</span>
              <strong>{formatDateTime(order.orderDate)}</strong>
            </div>
            <div className="kv-item">
              <span>Jatuh Tempo</span>
              <strong>{formatDateTime(order.dueDate)}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Rincian Tagihan" description="Rekapitulasi total tagihan.">
          <div className="metric-strip">
            <div className="metric-box">
              <span className="muted">Subtotal</span>
              <strong>{formatCurrency(order.subtotalAmount)}</strong>
            </div>
            <div className="metric-box">
              <span className="muted">Diskon</span>
              <strong>{formatCurrency(order.discountAmount)}</strong>
            </div>
            <div className="metric-box">
              <span className="muted">Total</span>
              <strong>{formatCurrency(order.totalAmount)}</strong>
            </div>
            <div className="metric-box">
              <span className="muted">Jumlah Baris</span>
              <strong>{order.items.length}</strong>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Item Order" description="Daftar produk yang termasuk dalam pesanan ini.">
        <DataTable
          columns={[
            {
              header: "Produk",
              render: (line) => {
                const item = activeTenantData.items.find((entry) => entry.id === line.itemId);
                return (
                  <div className="field-stack">
                    <strong>{item?.itemName ?? line.itemId}</strong>
                    <span className="muted">{item?.itemCode}</span>
                  </div>
                );
              },
            },
            {
              header: "Qty",
              render: (line) => line.quantity,
            },
            {
              header: "Harga Satuan",
              align: "right",
              render: (line) => formatCurrency(line.unitPrice),
            },
            {
              header: "Catatan",
              render: (line) => line.notes || "-",
            },
          ]}
          rowKey={(line) => line.id}
          rows={order.items}
        />
      </SectionCard>

      <SectionCard title="Riwayat Status" description="Tinjauan pembaruan status pesanan.">
        <div className="timeline">
          {order.history.map((entry) => {
            const toStatus = activeTenantData.statusDefinitions.find((statusEntry) => statusEntry.id === entry.toStatusId);
            const fromStatus = activeTenantData.statusDefinitions.find((statusEntry) => statusEntry.id === entry.fromStatusId);
            return (
              <div className="timeline-item" key={entry.id}>
                <div className="timeline-dot" />
                <div className="timeline-copy">
                  <div className="inline-stack">
                    <strong>{toStatus?.label}</strong>
                    {fromStatus ? <span className="muted">dari {fromStatus.label}</span> : null}
                  </div>
                  <span className="muted">
                    {formatDateTime(entry.changedAt)} · oleh {findMembershipName(entry.changedByMembershipId)}
                  </span>
                  {entry.changeReason ? <span>{entry.changeReason}</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <ConfirmDialog
        confirmLabel={selectedTransition?.label}
        description="Apakah Anda yakin ingin memperbarui status pesanan ini? Perubahan akan langsung terlihat pada riwayat."
        onCancel={() => setSelectedTransition(undefined)}
        onConfirm={() => {
          if (selectedTransition) {
            updateOrderStatus(order.id, selectedTransition.id, "Transisi dijalankan dari detail order.");
          }
          setSelectedTransition(undefined);
        }}
        open={Boolean(selectedTransition)}
        title="Konfirmasi ubah status"
      />
    </div>
  );
}

export function OrderFormPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { activeTenantData, saveOrder, activeUser } = useMockApp();
  const existing = activeTenantData?.orders.find((entry) => entry.id === orderId);
  const [lines, setLines] = useState<DraftLine[]>(
    existing?.items.map((line) => ({
      ...line,
      notes: line.notes ?? "",
    })) ?? [
      {
        id: crypto.randomUUID(),
        itemId: activeTenantData?.items[0]?.id ?? "",
        quantity: 1,
        unitPrice: activeTenantData?.items[0]?.standardPrice ?? 0,
        notes: "",
      },
    ],
  );

  if (!activeTenantData) {
    return null;
  }

  const total = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={
          <span>
            Dashboard &gt; Order &gt; {existing ? `${existing.orderNumber} &gt; Edit` : "Buat Order"}
          </span>
        }
        description="Rincian pesanan baru."
        title={existing ? "Edit Order" : "Buat Order"}
        actions={
          <Button onClick={() => navigate(-1)} variant="ghost">
            &larr; Kembali
          </Button>
        }
      />

      <form
        className="page-shell"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const savedId = saveOrder({
            id: existing?.id,
            orderNumber: existing?.orderNumber ?? `ORD-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.floor(Math.random() * 900 + 100)}`,
            orderKind: formData.get("orderKind") as Order["orderKind"],
            relatedPartyId: (formData.get("relatedPartyId") as string) || undefined,
            currentStatusId:
              existing?.currentStatusId ??
              activeTenantData.statusDefinitions.find((status) => status.isInitial)?.id ??
              activeTenantData.statusDefinitions[0].id,
            assignedMembershipId: (formData.get("assignedMembershipId") as string) || undefined,
            orderDate: new Date(String(formData.get("orderDate"))).toISOString(),
            dueDate: formData.get("dueDate")
              ? new Date(String(formData.get("dueDate"))).toISOString()
              : undefined,
            notes: String(formData.get("notes") ?? ""),
            createdByMembershipId:
              existing?.createdByMembershipId ??
              activeTenantData.memberships.find((membership) => membership.userId === activeUser?.id)?.id ??
              activeTenantData.memberships[0].id,
            items: lines.map((line) => ({
              id: line.id,
              itemId: line.itemId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              notes: line.notes || undefined,
            })),
          });

          navigate(`/orders/${savedId}`);
        }}
      >
        <SectionCard title="Informasi Pesanan" description="Detail transaksi dasar.">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="orderKind">Jenis order</label>
              <SearchableSelect
                id="orderKind"
                name="orderKind"
                defaultValue={existing?.orderKind ?? "transaction"}
                options={[
                  { value: "transaction", label: "Transaksi" },
                  { value: "request", label: "Permintaan" },
                  { value: "job", label: "Pekerjaan" },
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="relatedPartyId">Pihak terkait</label>
              <SearchableSelect
                id="relatedPartyId"
                name="relatedPartyId"
                defaultValue={existing?.relatedPartyId ?? ""}
                options={[
                  { value: "", label: "Pilih pihak terkait" },
                  ...activeTenantData.businessParties.map((party) => ({ value: party.id, label: party.name })),
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="assignedMembershipId">PIC</label>
              <SearchableSelect
                id="assignedMembershipId"
                name="assignedMembershipId"
                defaultValue={existing?.assignedMembershipId ?? activeTenantData.memberships[0]?.id ?? ""}
                options={[
                  { value: "", label: "Belum ditentukan" },
                  ...activeTenantData.memberships.map((membership) => ({ value: membership.id, label: membership.displayTitle })),
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="orderDate">Tanggal order</label>
              <input className="input" defaultValue={toInputDate(existing?.orderDate) || "2026-04-10T08:00"} id="orderDate" name="orderDate" required type="datetime-local" />
            </div>
            <div className="field">
              <label htmlFor="dueDate">Jatuh tempo</label>
              <input className="input" defaultValue={toInputDate(existing?.dueDate)} id="dueDate" name="dueDate" type="datetime-local" />
            </div>
            <div className="field form-grid-full">
              <label htmlFor="notes">Catatan operasional</label>
              <textarea className="textarea" defaultValue={existing?.notes ?? ""} id="notes" name="notes" placeholder="Tambahkan catatan untuk tim operasional." />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          actions={
            <Button
              onClick={() =>
                setLines((current) => [
                  ...current,
                  {
                    id: crypto.randomUUID(),
                    itemId: activeTenantData.items[0]?.id ?? "",
                    quantity: 1,
                    unitPrice: activeTenantData.items[0]?.standardPrice ?? 0,
                    notes: "",
                  },
                ])
              }
              variant="secondary"
            >
              Tambah Baris
            </Button>
          }
          description="Tambahkan produk ke pesanan."
          title="Item Order"
        >
          <div className="list-stack">
            {lines.map((line, index) => (
              <div className="list-item" key={line.id}>
                <div className="form-grid">
                  <div className="field">
                    <label>Produk</label>
                    <SearchableSelect
                      onChange={(val) => {
                        const item = activeTenantData.items.find((entry) => entry.id === val);
                        setLines((current) =>
                          current.map((entry) =>
                            entry.id === line.id
                              ? {
                                ...entry,
                                itemId: val,
                                unitPrice: item?.standardPrice ?? entry.unitPrice,
                              }
                              : entry,
                          ),
                        );
                      }}
                      value={line.itemId}
                      options={activeTenantData.items.map((item) => ({ value: item.id, label: item.itemName }))}
                    />
                  </div>
                  <div className="field">
                    <label>Qty</label>
                    <input
                      className="input"
                      min="1"
                      onChange={(event) =>
                        setLines((current) =>
                          current.map((entry) =>
                            entry.id === line.id
                              ? {
                                ...entry,
                                quantity: Number(event.target.value),
                              }
                              : entry,
                          ),
                        )
                      }
                      type="number"
                      value={line.quantity}
                    />
                  </div>
                  <div className="field">
                    <label>Harga satuan</label>
                    <input
                      className="input"
                      min="0"
                      onChange={(event) =>
                        setLines((current) =>
                          current.map((entry) =>
                            entry.id === line.id
                              ? {
                                ...entry,
                                unitPrice: Number(event.target.value),
                              }
                              : entry,
                          ),
                        )
                      }
                      type="number"
                      value={line.unitPrice}
                    />
                  </div>
                  <div className="field">
                    <label>Catatan</label>
                    <input
                      className="input"
                      onChange={(event) =>
                        setLines((current) =>
                          current.map((entry) =>
                            entry.id === line.id
                              ? {
                                ...entry,
                                notes: event.target.value,
                              }
                              : entry,
                          ),
                        )
                      }
                      value={line.notes}
                    />
                  </div>
                </div>
                <div className="inline-stack" style={{ justifyContent: "space-between" }}>
                  <span className="muted">Baris {index + 1}</span>
                  {lines.length > 1 ? (
                    <Button
                      onClick={() => setLines((current) => current.filter((entry) => entry.id !== line.id))}
                      variant="ghost"
                    >
                      Hapus baris
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <Notice tone="info" title="Preview total">
            Total sementara {formatCurrency(total)} untuk {lines.length} baris item.
          </Notice>
        </SectionCard>

        <div className="form-actions">
          <Button onClick={() => navigate(existing ? `/orders/${existing.id}` : "/orders")} variant="secondary">
            Batal
          </Button>
          <Button type="submit">{existing ? "Simpan Perubahan" : "Buat Order"}</Button>
        </div>
      </form>
    </div>
  );
}
