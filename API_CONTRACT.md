# API Contract

## 1. Tujuan Dokumen

Dokumen ini mendefinisikan kontrak REST API antara React Web App (frontend) dan NestJS API (backend). Dokumen ini:

1. Selaras dengan PRD.md (modul fungsional Bab 14), SYSTEM_DESIGN.md (modul backend Bab 8), dan DB_SCHEMA.md.
2. Hanya mencakup **web API** (Deep Mode). Internal tool contract untuk AI ada di INTERNAL_TOOL_CONTRACT.md.
3. Menjadi acuan untuk `shared-contracts` dan `shared-types` di monorepo.

---

## 2. Konvensi Umum

### 2.1 Base URL

```
/api/v1
```

### 2.2 Authentication

- Semua endpoint (kecuali `/auth/login`) memerlukan access token.
- Token dikirim via `Authorization: Bearer <token>` header atau secure HTTP-only cookie.
- Backend melakukan tenant context resolution dan permission check pada setiap request.

### 2.3 Tenant Context

- Tenant context di-resolve dari access token (user membership).
- Semua query data operasional otomatis tenant-scoped.
- Tidak ada parameter `tenant_id` eksplisit dari frontend (diambil dari auth context).

### 2.4 Response Format

**Success:**

```json
{
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

**Error:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Pesan error user-friendly",
    "details": [ ... ]
  }
}
```

### 2.5 Pagination

- Query parameter: `page` (default: 1), `limit` (default: 20, max: 100).
- Response: `meta.page`, `meta.limit`, `meta.total`.

### 2.6 Soft Delete / Archive

- Arsip menggunakan `PATCH` dengan body `{ "archived": true }`.
- Data terarsip tidak muncul di list default (kecuali filter eksplisit).

---

## 3. Modul Auth

### 3.1 Login

```
POST /api/v1/auth/login
```

**Body:**

| Field | Tipe | Wajib |
|-------|------|-------|
| `username` | string | Ya (atau email) |
| `email` | string | Ya (atau username) |
| `password` | string | Ya |

**Response 200:**

```json
{
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "user": {
      "id": "uuid",
      "full_name": "...",
      "email": "...",
      "tenants": [
        {
          "tenant_id": "uuid",
          "tenant_name": "...",
          "active_role": { "code": "owner", "name": "Owner" },
          "available_roles": [
            { "code": "owner", "name": "Owner" },
            { "code": "admin", "name": "Admin" }
          ],
          "permissions": ["dashboard.view", "order.view", "..."],
          "is_default": true
        }
      ]
    }
  }
}
```

> **Catatan penting:** `permissions` hanya berisi permission dari `active_role`, bukan gabungan semua role. Saat user switch role, permissions berubah sesuai role yang dipilih.

### 3.2 Refresh Token

```
POST /api/v1/auth/refresh
```

**Body:** `{ "refresh_token": "..." }`

**Response 200:** `{ "data": { "access_token": "...", "refresh_token": "..." } }`

### 3.3 Logout

```
POST /api/v1/auth/logout
```

**Response 200:** `{ "data": { "message": "Logout berhasil" } }`

### 3.4 Get Current User

```
GET /api/v1/auth/me
```

**Response 200:** User object + tenant info + active_role + available_roles + permissions (sama dengan login response).

### 3.5 Switch Role

```
POST /api/v1/auth/switch-role
```

**Body:** `{ "role_code": "admin" }`

**Validasi:**
- User harus memiliki role tersebut di tenant aktif (ada di `membership_roles`).
- Jika role tidak dimiliki, return 403.

**Response 200:**

```json
{
  "data": {
    "active_role": { "code": "admin", "name": "Admin" },
    "permissions": ["dashboard.view", "product.view", "product.create", "..."],
    "message": "Role berhasil diganti ke Admin"
  }
}
```

> Backend mengupdate `user_sessions.active_role_id`. Frontend menerima permissions baru dan langsung refresh sidebar tanpa reload halaman penuh.

---

## 4. Modul Product / Item

**Permission required:** `product.*`

### 4.1 List Items

```
GET /api/v1/items
```

**Query Parameters:**

| Param | Tipe | Default | Catatan |
|-------|------|---------|---------|
| `page` | int | 1 | |
| `limit` | int | 20 | |
| `search` | string | - | Cari nama/kode |
| `status` | string | `active` | active, inactive, all |
| `item_type` | string | - | physical, service, bundle, non_stock |
| `category_id` | UUID | - | Filter kategori |
| `stock_tracked` | boolean | - | Filter tracked |

### 4.2 Get Item Detail

```
GET /api/v1/items/:id
```

### 4.3 Create Item

```
POST /api/v1/items
```

**Body:** `{ item_code, item_name, item_type, category_id?, stock_tracked, uom, min_stock_qty?, standard_price?, attributes_json? }`

### 4.4 Update Item

```
PATCH /api/v1/items/:id
```

### 4.5 Archive Item

```
PATCH /api/v1/items/:id/archive
```

---

## 5. Modul Item Category

**Permission required:** `product.*`

### 5.1 List Categories

```
GET /api/v1/item-categories
```

### 5.2 Create Category

```
POST /api/v1/item-categories
```

**Body:** `{ code, name, parent_category_id?, sort_order? }`

### 5.3 Update Category

```
PATCH /api/v1/item-categories/:id
```

### 5.4 Archive Category

```
PATCH /api/v1/item-categories/:id/archive
```

---

## 6. Modul Order

**Permission required:** `order.*`

### 6.1 List Orders

```
GET /api/v1/orders
```

**Query Parameters:**

| Param | Tipe | Default | Catatan |
|-------|------|---------|---------|
| `page` | int | 1 | |
| `limit` | int | 20 | |
| `search` | string | - | Cari nomor order |
| `status_group` | string | - | pending, active, completed, cancelled |
| `status_id` | UUID | - | Status spesifik |
| `order_kind` | string | - | transaction, request, job |
| `date_from` | date | - | |
| `date_to` | date | - | |
| `related_party_id` | UUID | - | |

### 6.2 Get Order Detail

```
GET /api/v1/orders/:id
```

**Response include:** order info + items + status history + related party.

### 6.3 Create Order

```
POST /api/v1/orders
```

**Body:**

```json
{
  "order_kind": "transaction",
  "related_party_id": "uuid | null",
  "order_date": "2026-04-10T08:00:00Z",
  "due_date": "2026-04-12T08:00:00Z | null",
  "notes": "...",
  "items": [
    {
      "item_id": "uuid",
      "quantity": 5,
      "unit_price": 85000,
      "notes": "..."
    }
  ]
}
```

### 6.4 Update Order

```
PATCH /api/v1/orders/:id
```

### 6.5 Update Order Status

```
POST /api/v1/orders/:id/status
```

**Body:** `{ "to_status_id": "uuid", "change_reason": "..." }`

**Validation:** Backend memvalidasi transisi berdasarkan `order_status_transitions`.

### 6.6 Get Order Status History

```
GET /api/v1/orders/:id/status-history
```

---

## 7. Modul Business Party (Pelanggan & Pemasok)

**Arsitektur:** Satu tabel `business_parties` di database dengan field `party_type` (`customer` | `supplier` | `partner`). Di API dan frontend, pelanggan dan pemasok diekspos sebagai **dua route group terpisah** untuk kejelasan UX — namun keduanya dilayani oleh satu `BusinessPartyService` di backend.

**Permission required:** `order.*` (business party erat kaitannya dengan operasional order)

---

### 7A. Pelanggan (`/customers`)

#### 7A.1 List Pelanggan

```
GET /api/v1/customers
```

**Query:** `search`, `page`, `limit`

> Secara internal, backend selalu filter `party_type = 'customer'`. Tidak perlu kirim `party_type` dari frontend.

#### 7A.2 Buat Pelanggan

```
POST /api/v1/customers
```

**Body:** `{ code, name, phone_e164?, email?, address_text?, notes?, metadata_json? }`

> Backend otomatis set `party_type = 'customer'`.

#### 7A.3 Update Pelanggan

```
PATCH /api/v1/customers/:id
```

#### 7A.4 Archive Pelanggan

```
PATCH /api/v1/customers/:id/archive
```

---

### 7B. Pemasok (`/suppliers`)

#### 7B.1 List Pemasok

```
GET /api/v1/suppliers
```

**Query:** `search`, `page`, `limit`

> Backend selalu filter `party_type = 'supplier'`.

#### 7B.2 Buat Pemasok

```
POST /api/v1/suppliers
```

**Body:** `{ code, name, phone_e164?, email?, address_text?, notes?, metadata_json? }`

> Backend otomatis set `party_type = 'supplier'`.

#### 7B.3 Update Pemasok

```
PATCH /api/v1/suppliers/:id
```

#### 7B.4 Archive Pemasok

```
PATCH /api/v1/suppliers/:id/archive
```

---

## 8. Modul Stock

**Permission required:** `stock.*`

> **MVP:** Semua endpoint beroperasi pada lokasi default tenant. Tidak ada parameter `location_id`.

### 8.1 List Inventory Balances

```
GET /api/v1/stock/balances
```

**Query:** `search`, `critical_only` (boolean), `page`, `limit`

### 8.2 Get Item Stock Detail

```
GET /api/v1/stock/items/:item_id
```

**Response:** Balance + recent movements.

### 8.3 Create Stock Adjustment

```
POST /api/v1/stock/adjustments
```

**Body:**

```json
{
  "item_id": "uuid",
  "movement_type": "in | out | adjustment",
  "quantity": 10,
  "reason_text": "Restock dari supplier"
}
```

### 8.4 List Stock Movements

```
GET /api/v1/stock/movements
```

**Query:** `item_id`, `movement_type`, `date_from`, `date_to`, `page`, `limit`

---

## 9. Modul Order Status Configuration

**Permission required:** `tenant_config.manage`

### 9.1 List Status Definitions

```
GET /api/v1/order-status-definitions
```

**Query:** `order_kind`

### 9.2 Create Status Definition

```
POST /api/v1/order-status-definitions
```

### 9.3 Update Status Definition

```
PATCH /api/v1/order-status-definitions/:id
```

### 9.4 List Transitions

```
GET /api/v1/order-status-transitions
```

### 9.5 Create/Update Transition

```
POST /api/v1/order-status-transitions
```

---

## 10. Modul User Management

**Permission required:** `user.*`

### 10.1 List Users (Memberships)

```
GET /api/v1/users
```

### 10.2 Create User

```
POST /api/v1/users
```

**Body:** `{ full_name, email?, username, password, role_codes: ["staff"], display_title? }`

### 10.3 Update User

```
PATCH /api/v1/users/:membership_id
```

### 10.4 Activate/Deactivate User

```
PATCH /api/v1/users/:membership_id/status
```

**Body:** `{ "status": "active | inactive" }`

---

## 11. Modul Reporting

**Permission required:** `reporting.view`

### 11.1 Dashboard Summary

```
GET /api/v1/reporting/dashboard
```

**Response:** Metrik hari ini (total order, pending, active, completed, cancelled, sales, critical stock). Query langsung pada MVP.

### 11.2 Order Summary

```
GET /api/v1/reporting/orders
```

**Query:** `date_from`, `date_to`, `order_kind`

### 11.3 Stock Summary

```
GET /api/v1/reporting/stock
```

**Response:** Total items tracked, critical count, top critical items.

---

## 12. Modul Tenant Configuration

**Permission required:** `tenant_config.*`

### 12.1 Get Tenant Settings

```
GET /api/v1/tenant/settings
```

### 12.2 Update Tenant Settings

```
PATCH /api/v1/tenant/settings
```

**Body:** `{ business_labels_json?, operational_rules_json?, ui_preferences_json?, assistant_preferences_json?, reporting_preferences_json? }`

### 12.3 List Feature Flags

```
GET /api/v1/tenant/features
```

### 12.4 Update Feature Flag

```
PATCH /api/v1/tenant/features/:feature_key
```

---

## 13. Modul Knowledge Base

**Permission required:** `knowledge.*`

### 13.1 List Documents

```
GET /api/v1/knowledge/documents
```

### 13.2 Upload Document

```
POST /api/v1/knowledge/documents
```

**Body (multipart):** `file`, `title`, `document_type` (sop, policy, glossary, guide)

### 13.3 Get Document Detail

```
GET /api/v1/knowledge/documents/:id
```

### 13.4 Archive Document

```
PATCH /api/v1/knowledge/documents/:id/archive
```

---

## 14. Modul WhatsApp Admin

**Permission required:** `whatsapp.*`

### 14.1 Get Channel Status

```
GET /api/v1/whatsapp/status
```

### 14.2 List Authorizations

```
GET /api/v1/whatsapp/authorizations
```

### 14.3 Get Assistant Config

```
GET /api/v1/whatsapp/assistant-config
```

### 14.4 Update Assistant Config

```
PATCH /api/v1/whatsapp/assistant-config
```

**Body:** `{ mode: "bot_only" | "ai_only" | "hybrid", fallback_to_bot_on_ai_error?: boolean }`

### 14.5 Create/Update Authorization

```
POST /api/v1/whatsapp/authorizations
```

### 14.6 Revoke Authorization

```
PATCH /api/v1/whatsapp/authorizations/:id/revoke
```

---

## 15. Modul Audit Log

**Permission required:** `audit_log.view`

### 15.1 List Audit Logs

```
GET /api/v1/audit-logs
```

**Query:** `entity_type`, `action_key`, `actor_type`, `date_from`, `date_to`, `page`, `limit`

---

## 16. Modul Role Management (Dynamic Role)

**Permission required:** `role.manage`

> Modul ini memungkinkan tenant membuat dan mengelola role kustom di luar tiga role bawaan sistem (owner, admin, staff). Role bawaan (`is_system_role = true`) **tidak bisa dihapus** dan permission-nya bersifat read-only melalui endpoint ini.

### 16.1 List Roles

```
GET /api/v1/roles
```

**Response:** Daftar semua role yang aktif untuk tenant ini — termasuk sistem role dan role kustom.

```json
{
  "data": [
    { "id": "uuid", "code": "owner", "name": "Owner", "is_system_role": true },
    { "id": "uuid", "code": "admin", "name": "Admin", "is_system_role": true },
    { "id": "uuid", "code": "staff", "name": "Staff", "is_system_role": true },
    { "id": "uuid", "code": "kasir", "name": "Kasir", "is_system_role": false }
  ]
}
```

### 16.2 Create Role Kustom

```
POST /api/v1/roles
```

**Body:** `{ code, name }`

**Validasi:**
- `code` harus unik per tenant.
- Tidak boleh menggunakan kode sistem yang sudah ada (`owner`, `admin`, `staff`).

**Response 201:** Role yang baru dibuat (tanpa permission — perlu di-set terpisah via `/roles/:id/permissions`).

### 16.3 Update Role Kustom

```
PATCH /api/v1/roles/:id
```

**Body:** `{ name }` (hanya nama yang bisa diubah; code tidak bisa diubah setelah dibuat)

**Validasi:** Tidak boleh mengubah role sistem (`is_system_role = true`). Return 403 jika dicoba.

### 16.4 Delete Role Kustom

```
DELETE /api/v1/roles/:id
```

**Validasi:**
- Tidak boleh menghapus role sistem. Return 403.
- Tidak boleh menghapus role yang masih digunakan oleh membership aktif. Return 409 dengan pesan informatif.

### 16.5 Get Permission Matrix Role

```
GET /api/v1/roles/:id/permissions
```

**Response:** Daftar semua permission yang tersedia + flag `granted` per permission untuk role ini.

```json
{
  "data": {
    "role_id": "uuid",
    "role_name": "Kasir",
    "is_system_role": false,
    "permissions": [
      { "code": "dashboard.view", "granted": true },
      { "code": "order.view", "granted": true },
      { "code": "order.create", "granted": true },
      { "code": "order.update", "granted": false },
      { "code": "order.archive", "granted": false },
      { "code": "product.view", "granted": true }
    ]
  }
}
```

### 16.6 Set Permission Matrix Role

```
PUT /api/v1/roles/:id/permissions
```

**Body:**

```json
{
  "permissions": [
    { "code": "dashboard.view", "granted": true },
    { "code": "order.view", "granted": true },
    { "code": "order.create", "granted": true },
    { "code": "order.update", "granted": false }
  ]
}
```

> Operasi ini bersifat **full replace** — semua permission role diganti sesuai body. Gunakan `GET /roles/:id/permissions` terlebih dahulu untuk mengambil state saat ini sebelum submit perubahan.

**Validasi:** Tidak boleh mengubah permission role sistem. Return 403.

**Response 200:** Permission matrix terbaru (sama dengan response `GET /roles/:id/permissions`).

---

## 17. Ringkasan Endpoint

| Modul | Method | Endpoint | Permission |
|-------|--------|----------|------------|
| Auth | POST | /auth/login | Public |
| Auth | POST | /auth/refresh | Public |
| Auth | POST | /auth/logout | Authenticated |
| Auth | GET | /auth/me | Authenticated |
| Auth | POST | /auth/switch-role | Authenticated |
| Items | GET/POST/PATCH | /items, /items/:id | product.* |
| Categories | GET/POST/PATCH | /item-categories | product.* |
| Orders | GET/POST/PATCH | /orders, /orders/:id | order.* |
| Order Status | POST | /orders/:id/status | order.update |
| Pelanggan | GET/POST/PATCH | /customers, /customers/:id | order.* |
| Pemasok | GET/POST/PATCH | /suppliers, /suppliers/:id | order.* |
| Stock | GET/POST | /stock/* | stock.* |
| Status Config | GET/POST/PATCH | /order-status-definitions | tenant_config.manage |
| Users | GET/POST/PATCH | /users | user.* |
| Roles | GET/POST/PATCH/DELETE | /roles | role.manage |
| Role Permissions | GET/PUT | /roles/:id/permissions | role.manage |
| Reporting | GET | /reporting/* | reporting.view |
| Tenant Config | GET/PATCH | /tenant/* | tenant_config.* |
| Knowledge | GET/POST/PATCH | /knowledge/* | knowledge.* |
| WhatsApp | GET/POST/PATCH | /whatsapp/* | whatsapp.* |
| Audit Log | GET | /audit-logs | audit_log.view |
