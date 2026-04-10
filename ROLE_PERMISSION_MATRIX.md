# Role & Permission Matrix

## 1. Tujuan Dokumen

Dokumen ini mendefinisikan matriks role dan permission untuk mini ERP SaaS. Dokumen ini:

1. Selaras dengan PRD.md Bab 14.1 (Auth & Authorization) dan Bab 14.6 (User Management).
2. Selaras dengan DB_SCHEMA.md Bab 6.2 (roles, permissions, role_permissions, membership_roles).
3. Menjadi acuan langsung untuk seed data dan permission guard di backend.

---

## 2. Role Sistem dan Role Kustom

### 2.1 Role Sistem (Bawaan)

Tiga role bawaan yang di-seed oleh sistem (`is_system_role = true`). Role ini **tidak bisa dihapus** dan permission-nya tidak bisa diubah melalui UI role management:

| Code | Label | Deskripsi |
|------|-------|-----------|
| `owner` | Owner | Pemilik bisnis. Akses penuh web (Deep Mode) + WhatsApp AI (Quick Mode). |
| `admin` | Admin | Pengelola operasional. Akses web lengkap kecuali hal yang hanya owner. |
| `staff` | Staff | Pelaksana harian. Akses web terbatas sesuai tugas operasional. |

### 2.2 Role Kustom (Dynamic Role)

Selain tiga role sistem, setiap tenant dapat membuat **role kustom** sesuai struktur operasional bisnis mereka (`is_system_role = false`). Contoh umum:

| Contoh Code | Contoh Label | Keterangan |
|-------------|--------------|------------|
| `kasir` | Kasir | Hanya bisa buat dan update order |
| `gudang` | Staff Gudang | Fokus pada stok dan penerimaan barang |
| `supervisor` | Supervisor | Bisa lihat laporan dan order, tapi tidak bisa ubah konfigurasi |

**Karakteristik role kustom:**
- Dibuat dan dikelola oleh Owner/Admin melalui halaman `/settings/roles`.
- Permission-nya dapat dikonfigurasi secara granular melalui UI matrix permission.
- Bisa di-assign ke user seperti role sistem biasa.
- Bisa dihapus, **kecuali** jika masih ada membership aktif yang menggunakan role tersebut.

### 2.3 Model Switchable Role

> **Catatan:** Role terhubung ke tenant melalui `membership_roles` — bukan global. Assignment dilakukan melalui manajemen user tenant.

> **Model Switchable:** Satu user dapat memiliki lebih dari satu role, tetapi hanya **satu role yang aktif** pada satu waktu. Permission yang berlaku = hanya permission dari role aktif. User dapat switch role melalui dropdown avatar tanpa logout.

---

## 3. Module Keys

Module keys mengacu pada modul backend (SYSTEM_DESIGN.md Bab 8) dan tabel `permissions.module_key`:

| Module Key | Deskripsi |
|------------|-----------|
| `dashboard` | Dashboard operasional |
| `product` | Manajemen produk/item |
| `order` | Manajemen order |
| `stock` | Manajemen stok & inventory |
| `reporting` | Laporan & monitoring |
| `user` | Manajemen pengguna |
| `role` | Manajemen role & permission kustom |
| `tenant_config` | Konfigurasi tenant & bisnis |
| `knowledge` | Knowledge base & RAG |
| `whatsapp` | Konfigurasi WhatsApp gateway |
| `audit_log` | Audit log & observability |

---

## 4. Action Keys

Action keys mengacu pada tabel `permissions.action_key`:

| Action Key | Deskripsi |
|------------|-----------|
| `view` | Melihat data / halaman |
| `create` | Membuat data baru |
| `update` | Mengubah data yang ada |
| `archive` | Mengarsipkan / soft delete |
| `manage` | Akses penuh termasuk konfigurasi (superset dari view+create+update+archive) |

---

## 5. Permission Matrix

### Legenda

| Simbol | Arti |
|--------|------|
| ✅ | Diizinkan |
| ❌ | Tidak diizinkan |
| ⚙️ | Lihat catatan |

### 5.1 Dashboard

| Permission Code | Owner | Admin | Staff |
|----------------|-------|-------|-------|
| `dashboard.view` | ✅ | ✅ | ✅ |

### 5.2 Product / Item

| Permission Code | Owner | Admin | Staff |
|----------------|-------|-------|-------|
| `product.view` | ✅ | ✅ | ✅ |
| `product.create` | ✅ | ✅ | ⚙️ ¹ |
| `product.update` | ✅ | ✅ | ⚙️ ¹ |
| `product.archive` | ✅ | ✅ | ❌ |

### 5.3 Order

| Permission Code | Owner | Admin | Staff |
|----------------|-------|-------|-------|
| `order.view` | ✅ | ✅ | ✅ |
| `order.create` | ✅ | ✅ | ✅ |
| `order.update` | ✅ | ✅ | ✅ |
| `order.archive` | ✅ | ✅ | ❌ |

### 5.4 Stock

| Permission Code | Owner | Admin | Staff |
|----------------|-------|-------|-------|
| `stock.view` | ✅ | ✅ | ✅ |
| `stock.create` | ✅ | ✅ | ⚙️ ² |
| `stock.update` | ✅ | ✅ | ⚙️ ² |

### 5.5 Reporting

| Permission Code | Owner | Admin | Staff |
|----------------|-------|-------|-------|
| `reporting.view` | ✅ | ✅ | ⚙️ ³ |

### 5.6 User Management

| Permission Code | Owner | Admin | Staff |
|----------------|-------|-------|-------|
| `user.view` | ✅ | ✅ | ❌ |
| `user.create` | ✅ | ✅ | ❌ |
| `user.update` | ✅ | ✅ | ❌ |
| `user.archive` | ✅ | ✅ | ❌ |

### 5.7 Role Management

| Permission Code | Owner | Admin | Staff |
|----------------|-------|-------|-------|
| `role.manage` | ✅ | ⚙️ ⁵ | ❌ |

### 5.8 Tenant Configuration

| Permission Code | Owner | Admin | Staff |
|----------------|-------|-------|-------|
| `tenant_config.view` | ✅ | ✅ | ❌ |
| `tenant_config.manage` | ✅ | ⚙️ ⁴ | ❌ |

### 5.9 Knowledge Base

| Permission Code | Owner | Admin | Staff |
|----------------|-------|-------|-------|
| `knowledge.view` | ✅ | ✅ | ❌ |
| `knowledge.create` | ✅ | ✅ | ❌ |
| `knowledge.update` | ✅ | ✅ | ❌ |
| `knowledge.archive` | ✅ | ✅ | ❌ |

### 5.10 WhatsApp Configuration

| Permission Code | Owner | Admin | Staff |
|----------------|-------|-------|-------|
| `whatsapp.view` | ✅ | ✅ | ❌ |
| `whatsapp.manage` | ✅ | ⚙️ ⁴ | ❌ |

### 5.11 Audit Log

| Permission Code | Owner | Admin | Staff |
|----------------|-------|-------|-------|
| `audit_log.view` | ✅ | ✅ | ❌ |

---

## 6. Catatan

1. **Staff product create/update:** Opsional tergantung kebutuhan tenant. Untuk bisnis yang staf-nya perlu menambah item, permission ini diaktifkan. Default MVP: ❌.
2. **Staff stock create/update:** Hanya untuk penyesuaian stok (adjustment). Staf yang bertugas di gudang memerlukan ini. Default MVP: ❌.
3. **Staff reporting view:** Staff hanya melihat reporting yang relevan dengan pekerjaannya. Pada MVP, reporting view bisa dinonaktifkan untuk staff. Default MVP: ❌.
4. **Admin tenant_config/whatsapp manage:** Admin dapat melihat konfigurasi, tetapi aksi tertentu (misal: mengubah WhatsApp owner mapping) mungkin dibatasi hanya untuk owner. Default MVP: ✅ untuk admin.
5. **Admin role.manage:** Secara default, hanya Owner yang bisa membuat dan mengubah role kustom. Admin bisa diizinkan jika tenant membutuhkannya, tetapi harus disetting secara eksplisit. Default MVP: ❌ untuk admin.

---

## 7. WhatsApp Authorization (Non-Web)

Akses owner assistant via WhatsApp tidak menggunakan permission matrix di atas, melainkan menggunakan tabel `whatsapp_authorizations`:

| Aspek | Aturan |
|-------|--------|
| Siapa yang boleh | Nomor yang terdaftar di `whatsapp_authorizations` dengan `status = active` |
| Validasi | Phone number → tenant mapping → `access_level` (owner / authorized_party) |
| Scope akses | Read-only via internal tools (Quick Mode). Tidak ada write operations pada MVP. |
| Permission granularity | Semua tool assistant tersedia untuk owner yang terotorisasi. Tidak ada pembatasan per-tool pada MVP. |

---

## 8. Seed Data Rekomendasi

### 8.1 Roles

```
owner, admin, staff
```

### 8.2 Permissions (MVP Minimum)

```
dashboard.view
product.view, product.create, product.update, product.archive
order.view, order.create, order.update, order.archive
stock.view, stock.create, stock.update
reporting.view
user.view, user.create, user.update, user.archive
role.manage
tenant_config.view, tenant_config.manage
knowledge.view, knowledge.create, knowledge.update, knowledge.archive
whatsapp.view, whatsapp.manage
audit_log.view
```

Total: **22 permissions**

### 8.3 Default Role-Permission Mapping

Implementasi: insert ke `role_permissions` sesuai matrix Bab 5 di atas.

---

## 9. Dynamic Role: UI Matrix Permission

### 9.1 Konsep UI

Halaman `/settings/roles` menampilkan:
1. **Daftar Role** — Role sistem (read-only badge) + role kustom (editable).
2. **Tombol "Buat Role Baru"** — Hanya tampil jika user punya `role.manage`.
3. **Per Role: Tombol "Edit Permission"** — Buka halaman matrix permission.

### 9.2 Halaman Matrix Permission

URL: `/settings/roles/:roleId/permissions`

Layout matrix:

```
Module          | view | create | update | archive | manage
─────────────────────────────────────────────────────────
Dashboard       |  ✅  |   -    |   -    |    -    |   -
Produk          |  ✅  |  [ ]   |  [ ]   |   [ ]   |   -
Order           |  ✅  |  ✅    |  [✅]  |   [ ]   |   -
Stok            |  ✅  |  [ ]   |  [ ]   |    -    |   -
Laporan         | [ ]  |   -    |   -    |    -    |   -
Pengguna        | [ ]  |  [ ]   |  [ ]   |   [ ]   |   -
Role Kustom     |   -  |   -    |   -    |    -    |  [ ]
Pengaturan      | [ ]  |   -    |   -    |    -    |  [ ]
Knowledge Base  | [ ]  |  [ ]   |  [ ]   |   [ ]   |   -
WhatsApp        | [ ]  |   -    |   -    |    -    |  [ ]
Audit Log       | [ ]  |   -    |   -    |    -    |   -
```

- `[ ]` = checkbox yang bisa di-toggle
- `✅` = granted
- `-` = action tidak relevan untuk module tersebut (tidak tampil / disabled)
- Role sistem: semua checkbox **disabled** (read-only view)
- Role kustom: checkbox aktif + tombol "Simpan" di bawah

### 9.3 Aturan UX

1. Jika `dashboard.view` di-uncheck, user tidak bisa login ke sistem secara efektif — tambahkan warning.
2. Perubahan tidak auto-save — user harus klik "Simpan" eksplisit.
3. Setelah simpan, jika ada user yang sedang aktif menggunakan role tersebut, perubahan berlaku pada **sesi berikutnya** (setelah re-login atau switch role).
4. Konfirmasi dialog sebelum simpan: "Perubahan permission role ini akan memengaruhi semua pengguna yang menggunakan role [Nama Role]."

---

## 10. Aturan Implementasi

1. Permission check **wajib di backend** (NestJS guard), bukan hanya di frontend.
2. Permission yang berlaku = **hanya dari `active_role`** pada session, bukan gabungan semua role.
3. Frontend menyembunyikan menu/aksi berdasarkan permission dari role aktif yang diterima saat login atau switch role.
4. Jika URL diakses langsung tanpa izin, tampilkan halaman "Akses Ditolak" yang user-friendly (selaras dengan UI_DESIGN.md Bab 7.4).
5. Satu membership dapat memiliki lebih dari satu role (melalui `membership_roles`), tetapi hanya satu yang aktif.
6. Saat login, role aktif di-set ke role utama berdasarkan prioritas: owner > admin > staff > (kustom, alphabet).
7. User dapat switch role aktif melalui dropdown avatar di navbar tanpa logout.
8. Saat switch role, backend mengupdate `user_sessions.active_role_id` dan mengembalikan permission baru.
9. Frontend langsung refresh sidebar dan menu sesuai permission baru tanpa reload halaman penuh.
10. Role kustom tidak bisa dihapus jika masih ada membership aktif — backend return 409 dengan daftar user yang terdampak.
