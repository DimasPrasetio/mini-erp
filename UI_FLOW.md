# UI Flow Document

## 1. Tujuan Dokumen

Dokumen ini memetakan user journey aplikasi web untuk model:

1. satu perusahaan,
2. banyak cabang,
3. cabang aktif per session,
4. navigasi berbasis role dan permission.

---

## 2. Prinsip Journey

1. satu tujuan per halaman,
2. selalu ada jalan kembali,
3. redirect harus bermakna,
4. entry point utama harus jelas,
5. context cabang tidak boleh ambigu.

---

## 3. Daftar Halaman

| Halaman | URL | Permission |
|---------|-----|------------|
| Login | `/login` | Public |
| Pilih Cabang | `/select-branch` | Authenticated |
| Dashboard | `/dashboard` | `dashboard.view` |
| Order List | `/orders` | `order.view` |
| Order Create | `/orders/create` | `order.create` |
| Order Detail | `/orders/:id` | `order.view` |
| Order Edit | `/orders/:id/edit` | `order.update` |
| Items | `/items` | `product.view` |
| Item Create | `/items/create` | `product.create` |
| Item Detail | `/items/:id` | `product.view` |
| Item Edit | `/items/:id/edit` | `product.update` |
| Item Categories | `/item-categories` | `product.view` |
| Stock Balances | `/stock` | `stock.view` |
| Stock Detail | `/stock/:item_id` | `stock.view` |
| Stock Adjustment | `/stock/adjustments/create` | `stock.create` |
| Stock Movements | `/stock/movements` | `stock.view` |
| Customers | `/customers` | `order.view` |
| Suppliers | `/suppliers` | `order.view` |
| Reporting | `/reporting` | `reporting.view` |
| Users | `/users` | `user.view` |
| Knowledge | `/knowledge` | `knowledge.view` |
| Settings | `/settings` | `company_config.view` |
| Order Status Config | `/settings/order-status` | `company_config.manage` |
| Roles | `/settings/roles` | `role.manage` |
| WhatsApp | `/whatsapp` | `whatsapp.view` |
| Audit Logs | `/audit-logs` | `audit_log.view` |
| 403 | `/403` | - |

---

## 4. Flow Login dan Pilih Cabang

```mermaid
flowchart TD
  A[User buka aplikasi] --> B{Sudah login?}
  B -->|Tidak| C[/login]
  B -->|Ya| D{Session valid?}
  D -->|Tidak| C
  D -->|Ya| E{Punya berapa cabang?}
  C --> F[Submit email/username + password]
  F --> G{Login berhasil?}
  G -->|Tidak| C
  G -->|Ya| E
  E -->|1 cabang| H[Set cabang aktif otomatis]
  E -->|>1 cabang| I[/select-branch]
  I --> J[User pilih cabang]
  J --> K[POST /auth/switch-branch]
  H --> L[/dashboard]
  K --> L
```

Aturan:

1. Jika hanya satu cabang, langsung ke dashboard.
2. Jika lebih dari satu cabang, wajib pilih cabang dulu.
3. Session expired mengarah ke `/login`.

---

## 5. Flow Dashboard

Dashboard selalu mengikuti **cabang aktif**.

```mermaid
flowchart TD
  A[/dashboard] --> B[Kartu order hari ini]
  A --> C[Kartu order pending]
  A --> D[Kartu stok kritis]
  A --> E[Panel order perlu tindak lanjut]
  A --> F[Panel stok kritis]
```

Shortcut:

1. klik order pending -> `/orders?status_group=pending`
2. klik stok kritis -> `/stock?critical_only=true`
3. klik order -> `/orders/:id`

---

## 6. Flow Order

### 6.1 List ke Detail

```mermaid
flowchart TD
  A[/orders] --> B{Aksi}
  B -->|Lihat detail| C[/orders/:id]
  B -->|Buat order| D[/orders/create]
  B -->|Cari/filter| A
```

### 6.2 Create Order

```mermaid
flowchart TD
  A[/orders/create] --> B[Isi form]
  B --> C{Submit berhasil?}
  C -->|Ya| D[/orders/:id]
  C -->|Tidak| A
```

### 6.3 Edit Order

```mermaid
flowchart TD
  A[/orders/:id] --> B[Klik edit]
  B --> C[/orders/:id/edit]
  C --> D{Simpan berhasil?}
  D -->|Ya| A
  D -->|Tidak| C
```

### 6.4 Ubah Status

```mermaid
flowchart TD
  A[/orders/:id] --> B[Klik transisi status]
  B --> C[Dialog konfirmasi]
  C --> D{Berhasil?}
  D -->|Ya| A
  D -->|Tidak| A
```

Aturan:

1. Order dibuat pada cabang aktif.
2. Cabang tidak dipilih di form order.
3. Setelah create/edit sukses, user kembali ke detail order.

---

## 7. Flow Produk

```mermaid
flowchart TD
  A[/items] --> B{Aksi}
  B -->|Detail| C[/items/:id]
  B -->|Tambah| D[/items/create]
  C -->|Edit| E[/items/:id/edit]
```

Aturan:

1. Produk bersifat shared lintas cabang.
2. Halaman produk tidak membutuhkan branch selector tambahan.
3. Detail produk dapat memiliki link ke detail stok item pada cabang aktif.

---

## 8. Flow Kategori

Kategori dikelola dari halaman `/item-categories` dengan pola list + dialog/form inline.

Setelah create/update/archive:

1. tetap di halaman kategori,
2. refresh daftar,
3. tampilkan toast.

---

## 9. Flow Stok

### 9.1 Saldo ke Detail

```mermaid
flowchart TD
  A[/stock] --> B{Aksi}
  B -->|Detail item| C[/stock/:item_id]
  B -->|Adjustment| D[/stock/adjustments/create]
  B -->|Movements| E[/stock/movements]
```

### 9.2 Adjustment

```mermaid
flowchart TD
  A[/stock/adjustments/create] --> B[Isi form]
  B --> C{Submit berhasil?}
  C -->|Ya| D[/stock/:item_id]
  C -->|Tidak| A
```

Aturan:

1. stok selalu mengikuti cabang aktif,
2. tidak ada selector lokasi stok pada MVP,
3. tidak ada field cabang di form adjustment.

---

## 10. Flow Customers dan Suppliers

Pola keduanya identik:

1. list
2. create form
3. edit form
4. archive dari tabel

Redirect setelah create/edit:

1. customer -> `/customers`
2. supplier -> `/suppliers`

---

## 11. Flow Reporting

Reporting default bekerja pada cabang aktif.

```mermaid
flowchart TD
  A[/reporting] --> B[Summary cards]
  A --> C[Section order]
  A --> D[Section stock]
  B --> E[/orders?status_group=pending]
  D --> F[/stock?critical_only=true]
```

---

## 12. Flow Users

```mermaid
flowchart TD
  A[/users] --> B{Aksi}
  B -->|Tambah| C[/users/create]
  B -->|Edit| D[/users/:id/edit]
  B -->|Nonaktifkan| E[Dialog konfirmasi]
```

Aturan:

1. Form user mengelola role dan daftar cabang yang boleh diakses.
2. User management tetap di level perusahaan, bukan per cabang.

---

## 13. Flow Settings

### 13.1 Settings

Halaman `/settings` memuat:

1. profil perusahaan,
2. label bisnis,
3. preferensi reporting,
4. preferensi assistant,
5. link ke pengaturan status order.

### 13.2 Order Status Config

Halaman `/settings/order-status` digunakan untuk:

1. list status,
2. create/update status,
3. atur transisi.

---

## 14. Flow Role Management

Halaman `/settings/roles`:

1. list role sistem,
2. list role kustom,
3. buat role kustom,
4. buka matrix permission,
5. hapus role kustom.

Role management tetap di level perusahaan.

---

## 15. Flow WhatsApp Admin

Halaman `/whatsapp` memuat:

1. status koneksi gateway,
2. mode assistant,
3. daftar nomor owner / authorized party.

---

## 16. Flow Switch Role

```mermaid
flowchart TD
  A[Avatar menu] --> B[Pilih role lain]
  B --> C[POST /auth/switch-role]
  C --> D{Berhasil?}
  D -->|Ya| E[Refresh permission]
  E --> F{Halaman masih accessible?}
  F -->|Ya| G[Tetap di halaman]
  F -->|Tidak| H[/dashboard]
```

---

## 17. Flow Switch Branch

```mermaid
flowchart TD
  A[Navbar branch switcher] --> B[Pilih cabang lain]
  B --> C[POST /auth/switch-branch]
  C --> D{Berhasil?}
  D -->|Ya| E[Reload data halaman sesuai cabang baru]
  E --> F{Halaman masih valid?}
  F -->|Ya| G[Tetap di halaman]
  F -->|Tidak| H[/dashboard]
```

Aturan:

1. switch cabang tidak memerlukan login ulang,
2. branch switcher hanya tampil jika user punya lebih dari satu cabang,
3. seluruh data halaman harus ikut berubah ke cabang baru.

---

## 18. State Halaman Standar

### Loading

- skeleton lebih diutamakan dari spinner full-page

### Empty

- selalu ada arahan tindakan berikutnya

### Error

- pesan harus business-friendly

### Success

- gunakan toast singkat dan redirect sesuai konteks

---

## 19. Acceptance Criteria

Dokumen ini terpenuhi bila:

1. login multi-cabang mengarah ke `/select-branch` bila diperlukan,
2. seluruh modul operasional jelas memakai cabang aktif,
3. semua flow menggunakan `branch` sebagai unit scoping operasional,
4. switch role dan switch branch dapat dilakukan tanpa logout,
5. pola journey tetap konsisten: list -> detail -> form -> kembali.
