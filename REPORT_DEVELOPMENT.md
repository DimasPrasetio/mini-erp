# Development Report - Mini ERP

## Informasi Dokumen

- Nama File: `REPORT_DEVELOPMENT.md`
- Tujuan: Acuan progress development untuk tim yang melanjutkan pengerjaan
- Terakhir Diupdate: `2026-04-11`
- Total Fase: `6` fase (`0` sampai `5`)

---

## Status Legend

| Status | Keterangan |
|--------|------------|
| Belum Dimulai | Belum ada yang dikerjakan |
| Sedang Dikerjakan | Dalam proses development |
| Selesai | Sudah dikerjakan dan terverifikasi |
| Ditunda | Sengaja ditunda |

---

## Ringkasan Progress

| Fase | Nama | Status | Progress |
|------|------|--------|----------|
| 0 | UI/UX Mockup & Validasi Visual | Selesai | 14/14 |
| 1 | Core Foundation | Belum Dimulai | 0/14 |
| 2 | Operational Web MVP | Belum Dimulai | 0/14 |
| 3 | WhatsApp Owner Assistant MVP | Belum Dimulai | 0/10 |
| 4 | Knowledge & RAG | Belum Dimulai | 0/8 |
| 5 | Hardening & Optimization | Belum Dimulai | 0/10 |

---

## Keputusan Desain yang Sudah Dikunci

1. Arsitektur: monorepo React + NestJS.
2. Model organisasi: **single company + multi-branch**.
3. Operasional web memakai `active_branch_id` pada session.
4. Web tetap primary system.
5. WhatsApp tetap secondary interface owner.
6. Assistant hanya boleh mengakses data melalui internal tools.
7. Stock MVP: single stock location per cabang.
8. Reporting MVP: query langsung.

---

## Fase 0 - UI/UX Mockup & Validasi Visual

Status: Selesai

Catatan utama:

1. Mockup dirancang menggunakan istilah `branch` untuk context switching.
2. Halaman branch selection menggunakan `/select-branch`.
3. Permission-based navigation tetap dipakai.

---

## Fase 1 - Core Foundation

Tujuan: Menyediakan fondasi backend, auth, branch isolation, dan domain inti.

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 1.1 | Setup monorepo backend | Belum Dimulai | NestJS API |
| 1.2 | Shared types & contracts | Belum Dimulai | Package bersama |
| 1.3 | Company & branch model | Belum Dimulai | Company tunggal + branch context |
| 1.4 | DB migration baseline | Belum Dimulai | Schema awal |
| 1.5 | Seed dasar | Belum Dimulai | Role, permission, company, branch |
| 1.6 | Auth module | Belum Dimulai | Login, refresh, logout |
| 1.7 | Role & branch access | Belum Dimulai | Role aktif + akses cabang |
| 1.8 | Product module basic | Belum Dimulai | Item + kategori |
| 1.9 | Order module basic | Belum Dimulai | Order + status history |
| 1.10 | Stock module basic | Belum Dimulai | Single location per cabang |
| 1.11 | User module basic | Belum Dimulai | User, role, branch access |
| 1.12 | Reporting query service basic | Belum Dimulai | Query langsung |
| 1.13 | Audit log basic | Belum Dimulai | Aktivitas penting |
| 1.14 | Verifikasi startup API + DB | Belum Dimulai | Startup aplikasi dan koneksi database |

---

## Fase 2 - Operational Web MVP

Tujuan: Menghubungkan mockup UI dengan backend hingga web dapat dipakai operasional.

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 2.1 | Integrasi auth ke UI | Belum Dimulai | Login + branch selection |
| 2.2 | Integrasi role switch dan branch switch | Belum Dimulai | Session context |
| 2.3 | Integrasi dashboard | Belum Dimulai | Data cabang aktif |
| 2.4 | Integrasi modul produk | Belum Dimulai | List, detail, create, edit |
| 2.5 | Integrasi modul order | Belum Dimulai | List, detail, create, status |
| 2.6 | Integrasi modul stok | Belum Dimulai | Balance, movement, adjustment |
| 2.7 | Integrasi reporting | Belum Dimulai | Summary dasar |
| 2.8 | Integrasi user management | Belum Dimulai | User, role, branch access |
| 2.9 | Integrasi company settings | Belum Dimulai | Config ringan |
| 2.10 | Integrasi order status config | Belum Dimulai | Status + transisi |
| 2.11 | Integrasi knowledge base | Belum Dimulai | Upload + list |
| 2.12 | Integrasi audit log | Belum Dimulai | List log |
| 2.13 | Integrasi customers & suppliers | Belum Dimulai | Dua halaman, satu service |
| 2.14 | Integrasi role management | Belum Dimulai | CRUD role kustom + matrix |

---

## Fase 3 - WhatsApp Owner Assistant MVP

Tujuan: Owner bisa bertanya bisnis via WhatsApp dan mendapat jawaban dari data real sistem.

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 3.1 | Baileys integration | Belum Dimulai | Connect, reconnect, session |
| 3.2 | WA authorization module | Belum Dimulai | Phone ke company mapping |
| 3.3 | Message receive/send pipeline | Belum Dimulai | Inbound ke outbound |
| 3.4 | Assistant module | Belum Dimulai | Routing bot/AI |
| 3.5 | Tool registry | Belum Dimulai | Shared untuk bot dan AI |
| 3.6 | Priority tools | Belum Dimulai | Sales, pending orders, critical stock |
| 3.7 | Remaining tools | Belum Dimulai | Status, performance, product, summary |
| 3.8 | Response behavior | Belum Dimulai | Direct answer, WhatsApp-friendly |
| 3.9 | Conversation logging + audit | Belum Dimulai | assistant_runs, tool executions |
| 3.10 | WA admin page integration | Belum Dimulai | Gateway status, mode assistant |

---

## Fase 4 - Knowledge & RAG

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 4.1 | Upload knowledge document | Belum Dimulai | Metadata + storage |
| 4.2 | Versioning dokumen | Belum Dimulai | Tracking perubahan |
| 4.3 | Chunking pipeline | Belum Dimulai | Normalisasi |
| 4.4 | Embedding generation | Belum Dimulai | Untuk jalur AI |
| 4.5 | Retrieval service | Belum Dimulai | Company-scoped |
| 4.6 | Integrasi knowledge ke assistant | Belum Dimulai | AI/hybrid path |
| 4.7 | Audit knowledge usage | Belum Dimulai | Traceability |
| 4.8 | UAT knowledge query | Belum Dimulai | SOP dan kebijakan |

---

## Fase 5 - Hardening & Optimization

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 5.1 | Rate limiting | Belum Dimulai | Per nomor WA |
| 5.2 | AI quota management | Belum Dimulai | Per perusahaan |
| 5.3 | Retry & resilience | Belum Dimulai | WA reconnect + AI fallback |
| 5.4 | daily_operational_metrics activation | Belum Dimulai | Aggregation job |
| 5.5 | Dashboard caching | Belum Dimulai | Redis cache |
| 5.6 | Assistant observability | Belum Dimulai | Metrics + trace |
| 5.7 | Error alerting | Belum Dimulai | Internal alert |
| 5.8 | Secret hardening | Belum Dimulai | Vault / secret manager |
| 5.9 | Load & integration test | Belum Dimulai | Production readiness |
| 5.10 | Multi-location readiness | Belum Dimulai | Per cabang, post-MVP |

---

## Catatan untuk Tim yang Melanjutkan

1. Gunakan istilah `branch` untuk context scoping operasional.
2. Semua operasi harian harus memakai branch context dari session.
3. Jangan mengaktifkan multi-location stock pada MVP.
4. Assistant WhatsApp harus tetap read-only pada MVP.
5. Jangan menambah multi-company sebelum fondasi single company + multi-branch stabil.
