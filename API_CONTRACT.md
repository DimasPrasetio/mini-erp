# API Contract

## 1. Tujuan Dokumen

Dokumen ini mendefinisikan kontrak REST API antara React Web App dan NestJS API untuk model:

1. satu perusahaan,
2. banyak cabang,
3. cabang aktif diambil dari session,
4. permission diambil dari role aktif.

Dokumen ini hanya mencakup **web API**. Internal tools assistant dibahas di `INTERNAL_TOOL_CONTRACT.md`.

---

## 2. Konvensi Umum

### 2.1 Base URL

```text
/api/v1
```

### 2.2 Authentication

- Semua endpoint selain `/auth/login` memerlukan access token.
- Token dapat dikirim melalui header Bearer atau secure HTTP-only cookie.

### 2.3 Context Resolution

- `active_role_id` di session menentukan permission.
- `active_branch_id` di session menentukan branch context untuk operasi harian.
- Frontend **tidak** mengirim `branch_id` pada CRUD operasional biasa.

### 2.4 Response Format

**Success**

```json
{
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

**Error**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Pesan error user-friendly",
    "details": []
  }
}
```

### 2.5 Pagination

- `page`: default 1
- `limit`: default 20, max 100

---

## 3. Modul Auth

### 3.1 Login

```text
POST /api/v1/auth/login
```

**Body**

| Field | Tipe | Wajib |
|-------|------|-------|
| username | string | Ya, jika email kosong |
| email | string | Ya, jika username kosong |
| password | string | Ya |

**Response 200**

```json
{
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "user": {
      "id": "uuid",
      "full_name": "Dimas",
      "email": "dimas@example.com",
      "company": {
        "id": "uuid",
        "name": "PT Contoh"
      },
      "branches": [
        { "branch_id": "uuid", "branch_name": "Jakarta", "is_default": true },
        { "branch_id": "uuid", "branch_name": "Bandung", "is_default": false }
      ],
      "active_branch": { "branch_id": "uuid", "branch_name": "Jakarta" },
      "active_role": { "code": "owner", "name": "Owner" },
      "available_roles": [
        { "code": "owner", "name": "Owner" },
        { "code": "admin", "name": "Admin" }
      ],
      "permissions": ["dashboard.view", "order.view", "order.create"]
    },
    "requires_branch_selection": false
  }
}
```

Catatan:

1. Jika user hanya punya satu cabang, `active_branch` di-set otomatis.
2. Jika user punya banyak cabang, `requires_branch_selection = true` dan frontend redirect ke `/select-branch`.

### 3.2 Refresh Token

```text
POST /api/v1/auth/refresh
```

### 3.3 Logout

```text
POST /api/v1/auth/logout
```

### 3.4 Get Current User

```text
GET /api/v1/auth/me
```

Mengembalikan user, company, active branch, active role, available roles, permissions.

### 3.5 Switch Role

```text
POST /api/v1/auth/switch-role
```

**Body**

```json
{ "role_code": "admin" }
```

### 3.6 Switch Branch

```text
POST /api/v1/auth/switch-branch
```

**Body**

```json
{ "branch_id": "uuid" }
```

Backend memvalidasi bahwa branch tersebut ada di daftar akses user.

---

## 4. Modul Branch Context

### 4.1 List Accessible Branches

```text
GET /api/v1/branches/my-access
```

### 4.2 Get Active Branch

```text
GET /api/v1/branches/active
```

### 4.3 Create Branch

```text
POST /api/v1/branches
```

Payload:
```json
{
  "name": "Cabang Baru",
  "address": "Alamat Cabang",
  "phone": "08123456789",
  "status": "active"
}
```

### 4.4 Update Branch

```text
PUT /api/v1/branches/:id
```

Payload (Partial):
```json
{
  "name": "Cabang Baru Updated",
  "address": "Alamat Cabang Baru",
  "status": "inactive"
}
```

---

## 5. Modul Product / Item

**Permission required:** `product.*`

### 5.1 List Items

```text
GET /api/v1/items
```

Query: `search`, `status`, `item_type`, `category_id`, `stock_tracked`, `page`, `limit`

### 5.2 Get Item Detail

```text
GET /api/v1/items/:id
```

### 5.3 Create Item

```text
POST /api/v1/items
```

### 5.4 Update Item

```text
PATCH /api/v1/items/:id
```

### 5.5 Archive Item

```text
PATCH /api/v1/items/:id/archive
```

---

## 6. Modul Item Category

**Permission required:** `product.*`

### 6.1 List Categories

```text
GET /api/v1/item-categories
```

### 6.2 Create Category

```text
POST /api/v1/item-categories
```

### 6.3 Update Category

```text
PATCH /api/v1/item-categories/:id
```

### 6.4 Archive Category

```text
PATCH /api/v1/item-categories/:id/archive
```

---

## 7. Modul Order

**Permission required:** `order.*`

Semua endpoint order bekerja pada **cabang aktif**.

### 7.1 List Orders

```text
GET /api/v1/orders
```

Query: `search`, `status_group`, `status_id`, `order_kind`, `date_from`, `date_to`, `related_party_id`, `page`, `limit`

### 7.2 Get Order Detail

```text
GET /api/v1/orders/:id
```

### 7.3 Create Order

```text
POST /api/v1/orders
```

### 7.4 Update Order

```text
PATCH /api/v1/orders/:id
```

### 7.5 Update Order Status

```text
POST /api/v1/orders/:id/status
```

### 7.6 Archive Order

```text
PATCH /api/v1/orders/:id/archive
```

### 7.7 Get Order Status History

```text
GET /api/v1/orders/:id/status-history
```

---

## 8. Modul Business Parties

**Permission required:** `order.*`

### 8.1 Customers

```text
GET /api/v1/customers
POST /api/v1/customers
PATCH /api/v1/customers/:id
PATCH /api/v1/customers/:id/archive
```

### 8.2 Suppliers

```text
GET /api/v1/suppliers
POST /api/v1/suppliers
PATCH /api/v1/suppliers/:id
PATCH /api/v1/suppliers/:id/archive
```

---

## 9. Modul Stock

**Permission required:** `stock.*`

Semua endpoint stock bekerja pada **cabang aktif** dan lokasi default cabang.

### 9.1 List Inventory Balances

```text
GET /api/v1/stock/balances
```

Query: `search`, `critical_only`, `page`, `limit`

### 9.2 Get Item Stock Detail

```text
GET /api/v1/stock/items/:item_id
```

### 9.3 Create Stock Adjustment

```text
POST /api/v1/stock/adjustments
```

### 9.4 List Stock Movements

```text
GET /api/v1/stock/movements
```

---

## 10. Modul Order Status Configuration

**Permission required:** `company_config.manage`

```text
GET /api/v1/order-status-definitions
POST /api/v1/order-status-definitions
PATCH /api/v1/order-status-definitions/:id
GET /api/v1/order-status-transitions
POST /api/v1/order-status-transitions
```

---

## 11. Modul User Management

**Permission required:** `user.*`

### 11.1 List Users

```text
GET /api/v1/users
```

### 11.2 Create User

```text
POST /api/v1/users
```

Body minimal:

```json
{
  "full_name": "Nama",
  "email": "mail@example.com",
  "username": "nama",
  "password": "secret",
  "role_codes": ["staff"],
  "branch_ids": ["uuid-1", "uuid-2"],
  "display_title": "Supervisor"
}
```

### 11.3 Update User

```text
PATCH /api/v1/users/:user_id
```

### 11.4 Activate/Deactivate User

```text
PATCH /api/v1/users/:user_id/status
```

---

## 12. Modul Reporting

**Permission required:** `reporting.view`

Reporting default berbasis **cabang aktif**.

```text
GET /api/v1/reporting/dashboard
GET /api/v1/reporting/orders
GET /api/v1/reporting/stock
```

---

## 13. Modul Company Configuration

**Permission required:** `company_config.*`

```text
GET /api/v1/company/settings
PATCH /api/v1/company/settings
GET /api/v1/company/features
PATCH /api/v1/company/features/:feature_key
```

---

## 14. Modul Knowledge Base

**Permission required:** `knowledge.*`

```text
GET /api/v1/knowledge/documents
POST /api/v1/knowledge/documents
GET /api/v1/knowledge/documents/:id
PATCH /api/v1/knowledge/documents/:id/archive
```

---

## 15. Modul WhatsApp Admin

**Permission required:** `whatsapp.*`

```text
GET /api/v1/whatsapp/status
GET /api/v1/whatsapp/authorizations
GET /api/v1/whatsapp/assistant-config
PATCH /api/v1/whatsapp/assistant-config
POST /api/v1/whatsapp/authorizations
PATCH /api/v1/whatsapp/authorizations/:id/revoke
```

---

## 16. Modul Audit Log

**Permission required:** `audit_log.view`

```text
GET /api/v1/audit-logs
```

Query: `entity_type`, `action_key`, `actor_type`, `date_from`, `date_to`, `page`, `limit`

---

## 17. Modul Role Management

**Permission required:** `role.manage`

Role kustom berada di level perusahaan, bukan per cabang.

```text
GET /api/v1/roles
POST /api/v1/roles
PATCH /api/v1/roles/:id
DELETE /api/v1/roles/:id
GET /api/v1/roles/:id/permissions
PUT /api/v1/roles/:id/permissions
GET /api/v1/permissions
```

---

## 18. Ringkasan Endpoint

| Modul | Endpoint Utama |
|------|-----------------|
| Auth | `/auth/*` |
| Branch | `/branches/*` |
| Items | `/items`, `/item-categories` |
| Orders | `/orders`, `/customers`, `/suppliers` |
| Stock | `/stock/*` |
| Status Config | `/order-status-definitions`, `/order-status-transitions` |
| Users | `/users` |
| Reporting | `/reporting/*` |
| Company Config | `/company/*` |
| Knowledge | `/knowledge/*` |
| WhatsApp | `/whatsapp/*` |
| Audit Log | `/audit-logs` |
| Roles | `/roles`, `/permissions` |
