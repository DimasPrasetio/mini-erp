# Development Report - Mini ERP SaaS

## Informasi Dokumen

- Nama File: `REPORT_DEVELOPMENT.md`
- Tujuan: Acuan progress development untuk tim yang melanjutkan pengerjaan
- Terakhir Diupdate: `2026-04-10`
- Total Fase: `6` fase (`0` sampai `5`)

---

## Status Legend

| Status | Keterangan |
|--------|------------|
| Belum Dimulai | Belum ada yang dikerjakan |
| Sedang Dikerjakan | Dalam proses development |
| Selesai | Sudah dikerjakan dan terverifikasi |
| Ditunda | Sengaja ditunda, bukan bagian prioritas saat ini |

---

## Ringkasan Progress

| Fase | Nama | Status | Progress |
|------|------|--------|----------|
| 0 | UI/UX Mockup & Validasi Visual | Selesai | 14/14 |
| 1 | Core Foundation | Belum Dimulai | 0/13 |
| 2 | Operational Web MVP | Belum Dimulai | 0/14 |
| 3 | WhatsApp Owner Assistant MVP | Belum Dimulai | 0/10 |
| 4 | Knowledge & RAG | Belum Dimulai | 0/8 |
| 5 | SaaS Hardening & Optimization | Belum Dimulai | 0/10 |

---

## Dokumen Acuan

| # | Dokumen | Fungsi |
|---|---------|--------|
| 1 | `DESKRIPSI_PROJECT.md` | Gambaran produk dan positioning |
| 2 | `PRD.md` | Kebutuhan produk dan scope |
| 3 | `SYSTEM_DESIGN.md` | Arsitektur dan boundary teknis |
| 4 | `SYSTEM_FLOW.md` | Alur sistem utama |
| 5 | `DB_SCHEMA.md` | Desain schema database |
| 6 | `API_CONTRACT.md` | Contract web API |
| 7 | `INTERNAL_TOOL_CONTRACT.md` | Contract internal tool assistant |
| 8 | `ROLE_PERMISSION_MATRIX.md` | Matrix role dan permission |
| 9 | `UI_DESIGN.md` | Prinsip desain UI |
| 10 | `UI_FLOW.md` | Journey halaman web |

---

## Keputusan Desain yang Sudah Dikunci

1. Arsitektur: Monorepo React + NestJS.
2. Tenant Isolation: Shared database dengan `tenant_id` di setiap tabel operasional.
3. Owner Dual Access: Web (`Deep Mode`) adalah primary system, WhatsApp (`Quick Mode`) adalah secondary interface.
4. Assistant Security: Bot maupun AI tidak boleh akses database langsung, hanya melalui internal tool API.
5. RAG vs Tools: RAG untuk knowledge non-transaksional, tools untuk data real-time.
6. Stock MVP: Single location per tenant, schema tetap future-ready untuk multi-location.
7. Reporting MVP: Query langsung, aggregation table di fase optimasi.
8. Assistant Behavior: Default langsung jawab, format WhatsApp-friendly.

---

## Fase 0 - UI/UX Mockup & Validasi Visual

Tujuan: Memvalidasi tampilan, struktur halaman, dan arah UX sebelum backend dihubungkan.

Status: Selesai

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 0.1 | Setup monorepo frontend | Selesai | React 19 + Vite + TypeScript, workspace packages |
| 0.2 | Shell layout (AppShell, sidebar, navbar) | Selesai | Sidebar dengan menu group, navbar dengan avatar menu |
| 0.3 | Halaman Auth (login, pilih tenant) | Selesai | Login form + tenant selector |
| 0.4 | Halaman Dashboard | Selesai | Summary cards + panel order & stok kritis |
| 0.5 | Halaman Produk (list, detail, form, kategori) | Selesai | CRUD mockup lengkap |
| 0.6 | Halaman Order (list, detail, form, status) | Selesai | Termasuk flow ubah status order |
| 0.7 | Halaman Stok (balance, detail, movement, adjustment) | Selesai | Single location MVP |
| 0.8 | Halaman Pelanggan & Pemasok (terpisah) | Selesai | `/customers` dan `/suppliers` sebagai halaman terpisah |
| 0.9 | Halaman Pengguna (list, form) | Selesai | Membership CRUD mockup |
| 0.10 | Halaman Laporan | Selesai | Summary dasar |
| 0.11 | Halaman Pengaturan Tenant & Status Order | Selesai | Config form + status/transisi config |
| 0.12 | Halaman Knowledge Base & WhatsApp Admin | Selesai | Knowledge list + WA gateway mockup |
| 0.13 | Halaman Audit Log & Error (403, 404) | Selesai | |
| 0.14 | Permission-based navigation & route guards | Selesai | Sidebar filter + RouteGuard + role switch |

**Catatan Fase 0:**
- Mock data tersedia di `apps/web/src/mock/` untuk simulasi semua flow tanpa backend.
- Permission runtime di-resolve dari `mock/permissions.ts` sesuai ROLE_PERMISSION_MATRIX.md.
- Role switching implementasi sudah sesuai — user bisa switch role dari avatar menu dan sidebar refresh otomatis.
- **Bug yang ditemukan dan sudah diperbaiki:** `route-access.ts` masih referensikan `/business-parties` sementara route aktual sudah `/customers` dan `/suppliers` — sudah dikoreksi.

---

## Fase 1 - Core Foundation

Tujuan: Menyediakan pondasi backend, auth, tenant isolation, dan domain inti.

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 1.1 | Setup monorepo | Belum Dimulai | React + NestJS |
| 1.2 | Auth module | Belum Dimulai | Login, logout, refresh |
| 1.3 | Tenant model | Belum Dimulai | Shared schema + tenant context |
| 1.4 | Role & permission | Belum Dimulai | Owner, admin, staff + dynamic role kustom |
| 1.5 | Product module basic | Belum Dimulai | Item + category |
| 1.6 | Order module basic | Belum Dimulai | Order + order items |
| 1.7 | Stock module basic | Belum Dimulai | Single location MVP |
| 1.8 | Reporting query service basic | Belum Dimulai | Query langsung |
| 1.9 | Audit log basic | Belum Dimulai | Aktivitas penting |
| 1.10 | Shared types/contracts | Belum Dimulai | Monorepo packages |
| 1.11 | DB migration baseline | Belum Dimulai | Schema awal |
| 1.12 | Seed role-permission | Belum Dimulai | Default seed |
| 1.13 | Healthcheck basic | Belum Dimulai | API + DB |

---

## Fase 2 - Operational Web MVP

Tujuan: Menghubungkan mockup dengan backend hingga web operasional dapat dipakai.

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 2.1 | Integrasi auth ke UI | Belum Dimulai | Login + tenant selection |
| 2.2 | Integrasi App Shell | Belum Dimulai | Navigation berbasis permission |
| 2.3 | Integrasi dashboard | Belum Dimulai | Summary dasar |
| 2.4 | Integrasi modul produk | Belum Dimulai | List, detail, create, edit |
| 2.5 | Integrasi modul order | Belum Dimulai | List, detail, create, status |
| 2.6 | Integrasi modul stok | Belum Dimulai | Balance, movement, adjustment |
| 2.7 | Integrasi reporting | Belum Dimulai | Summary dasar |
| 2.8 | Integrasi user management | Belum Dimulai | Membership CRUD |
| 2.9 | Integrasi tenant settings | Belum Dimulai | Config ringan |
| 2.13 | Integrasi pelanggan & pemasok | Belum Dimulai | `/customers` dan `/suppliers` terpisah, backend satu service |
| 2.14 | Integrasi role management (dynamic role) | Belum Dimulai | CRUD role kustom + matrix permission UI di `/settings/roles` |
| 2.10 | Integrasi knowledge base | Belum Dimulai | Upload + list |
| 2.11 | Integrasi audit log | Belum Dimulai | List log |
| 2.12 | UAT web operasional | Belum Dimulai | Owner, admin, staff |

---

## Fase 3 - WhatsApp Owner Assistant MVP

Tujuan: Owner bisa bertanya bisnis via WhatsApp dan mendapat jawaban assistant dari data real sistem.

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 3.1 | Baileys integration | Belum Dimulai | Connect, reconnect, session |
| 3.2 | WA authorization module | Belum Dimulai | Phone ke tenant mapping |
| 3.3 | Message receive/send pipeline | Belum Dimulai | Inbound ke process ke outbound |
| 3.4 | Assistant module | Belum Dimulai | Routing bot/AI + tool selection |
| 3.5 | Tool registry implementation | Belum Dimulai | Shared untuk bot dan AI |
| 3.6 | Priority tools | Belum Dimulai | Sales, pending orders, critical stock |
| 3.7 | Remaining tools | Belum Dimulai | Status, performance, product, summary |
| 3.8 | Response behavior implementation | Belum Dimulai | WhatsApp-friendly, direct answer |
| 3.9 | Conversation logging + assistant run audit | Belum Dimulai | `assistant_runs`, `assistant_tool_executions` |
| 3.10 | WA Admin page integration | Belum Dimulai | Status gateway, mode assistant, otorisasi |

Kriteria selesai: Owner bisa tanya "penjualan hari ini berapa?" via WhatsApp dan mendapat jawaban akurat dari data real dengan mode assistant yang sesuai.

---

## Fase 4 - Knowledge & RAG

Tujuan: Menambahkan knowledge retrieval untuk SOP, kebijakan, dan konteks non-transaksional.

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 4.1 | Upload dokumen knowledge | Belum Dimulai | Metadata + storage |
| 4.2 | Versioning dokumen | Belum Dimulai | Tracking perubahan |
| 4.3 | Chunking pipeline | Belum Dimulai | Normalisasi dokumen |
| 4.4 | Embedding generation | Belum Dimulai | Untuk jalur AI |
| 4.5 | Retrieval service | Belum Dimulai | Tenant-scoped |
| 4.6 | Integrasi knowledge ke assistant | Belum Dimulai | AI/hybrid path |
| 4.7 | Audit knowledge usage | Belum Dimulai | Traceability |
| 4.8 | UAT knowledge query | Belum Dimulai | SOP dan kebijakan |

---

## Fase 5 - SaaS Hardening & Optimization

Tujuan: Produk siap production, aman, scalable, dan optimal.

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 5.1 | Rate limiting | Belum Dimulai | Per WA number + per tenant |
| 5.2 | AI quota management | Belum Dimulai | Per tenant untuk mode AI/hybrid |
| 5.3 | Retry & resilience | Belum Dimulai | WA reconnect + AI fallback |
| 5.4 | daily_operational_metrics activation | Belum Dimulai | Aggregation job |
| 5.5 | Dashboard caching | Belum Dimulai | Redis cache |
| 5.6 | Assistant observability | Belum Dimulai | Metrics + trace |
| 5.7 | Error alerting | Belum Dimulai | Internal alert |
| 5.8 | Secret hardening | Belum Dimulai | Vault / secret manager |
| 5.9 | Load & integration test | Belum Dimulai | Production readiness |
| 5.10 | UAT hardening | Belum Dimulai | End-to-end |

---

## Catatan untuk Tim yang Melanjutkan

1. Baca dokumen acuan sebelum mulai task apa pun.
2. Jangan ubah keputusan desain yang sudah dikunci tanpa review ulang lintas dokumen.
3. Jangan menambah kompleksitas workflow tenant di luar yang sudah ditetapkan.
4. Assistant WhatsApp harus tetap read-heavy pada MVP.
5. Jangan implementasi multi-location stock sebelum fase optimasi.
6. Jangan membuat aggregation job sebelum fase optimasi.
7. Tool assistant MVP harus tetap read-only.
