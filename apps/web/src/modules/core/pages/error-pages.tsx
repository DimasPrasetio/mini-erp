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

export function ForbiddenPage() {
  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; 403</span>}
        description="Guard frontend menyembunyikan menu tanpa permission, tetapi direct URL access tetap diarahkan ke halaman ini."
        title="Akses Ditolak"
      />
      <Notice tone="danger" title="Anda tidak memiliki akses ke halaman ini.">
        Kembali ke dashboard atau ganti role aktif jika Anda memang memiliki role lain yang relevan.
      </Notice>
      <Link className="button button-primary" to="/dashboard">
        Kembali ke Dashboard
      </Link>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; 404</span>}
        description="State fallback untuk route yang tidak terdefinisi."
        title="Halaman Tidak Ditemukan"
      />
      <Notice tone="warning" title="Halaman ini tidak tersedia.">
        Periksa kembali menu atau kembali ke dashboard untuk melanjutkan alur kerja.
      </Notice>
      <Link className="button button-primary" to="/dashboard">
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
