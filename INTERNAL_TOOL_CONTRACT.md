# Internal Tool Contract

## 1. Tujuan Dokumen

Dokumen ini mendefinisikan kontrak lengkap untuk setiap internal tool yang digunakan owner assistant. Dokumen ini:

1. Selaras dengan PRD.md Bab 14.10 (Internal Tool API) dan Bab 14.9 (Owner Assistant Orchestrator).
2. Selaras dengan SYSTEM_DESIGN.md Bab 8.9 (tools module) dan Bab 10.2 (tool contract strategy).
3. Selaras dengan DB_SCHEMA.md Bab 6.9 (`assistant_tool_executions`) untuk audit trail.
4. Menjadi acuan langsung bagi developer untuk mengimplementasikan setiap tool.

---

## 2. Prinsip Umum

1. Setiap tool **hanya read-only** pada MVP. Tidak ada tool yang melakukan write operations.
2. Setiap tool **wajib menerima `tenant_id`** sebagai parameter. Tidak ada tool yang beroperasi tanpa tenant context.
3. Setiap tool **wajib divalidasi** terhadap `whatsapp_authorizations` sebelum eksekusi.
4. Output tool harus **terstruktur (JSON)** agar siap dikonsumsi bot maupun AI untuk composing jawaban.
5. Tool **tidak boleh mengakses database langsung** — harus melalui domain service layer.
6. Pada MVP, tool menggunakan **query langsung** ke tabel transaksional (tanpa pre-computed metrics).
7. Setiap eksekusi tool **dicatat** di tabel `assistant_tool_executions`.

---

## 3. Format Kontrak

Setiap tool didefinisikan dengan struktur berikut:

| Field | Deskripsi |
|-------|-----------|
| **tool_name** | Nama unik tool (PascalCase) |
| **purpose** | Deskripsi tujuan singkat |
| **input_schema** | Parameter yang diterima |
| **output_schema** | Struktur data yang dikembalikan |
| **data_source** | Tabel/service yang diakses (referensi DB_SCHEMA) |
| **tenant_guard** | Wajib `tenant_id` |
| **auth_guard** | Level akses yang diperlukan |
| **timeout** | Batas waktu eksekusi |
| **error_policy** | Perilaku saat gagal |

---

## 4. Definisi Tool MVP

### 4.1 GetSalesSummary

| Field | Detail |
|-------|--------|
| **tool_name** | `GetSalesSummary` |
| **purpose** | Mengambil ringkasan penjualan untuk periode tertentu |
| **tenant_guard** | Wajib |
| **auth_guard** | owner, authorized_party |
| **timeout** | 5 detik |

**Input Schema:**

| Parameter | Tipe | Wajib | Default | Catatan |
|-----------|------|-------|---------|---------|
| `tenant_id` | UUID | Ya | - | Dari authorization context |
| `date_from` | date | Tidak | Hari ini | Format: YYYY-MM-DD |
| `date_to` | date | Tidak | Hari ini | Format: YYYY-MM-DD |

**Output Schema:**

```json
{
  "period": { "from": "2026-04-10", "to": "2026-04-10" },
  "total_orders": 15,
  "completed_orders": 10,
  "total_sales_amount": 2500000,
  "currency": "IDR",
  "average_order_value": 250000
}
```

**Data Source:** `orders` + `order_items` (WHERE `status_group = 'completed'`, tenant-scoped, query langsung)

**Error Policy:** Jika gagal, kembalikan `{ "error": true, "message": "..." }`. Assistant harus memberi tahu owner bahwa data sedang tidak bisa diambil.

---

### 4.2 GetPendingOrders

| Field | Detail |
|-------|--------|
| **tool_name** | `GetPendingOrders` |
| **purpose** | Mengambil daftar order yang masih pending |
| **tenant_guard** | Wajib |
| **auth_guard** | owner, authorized_party |
| **timeout** | 5 detik |

**Input Schema:**

| Parameter | Tipe | Wajib | Default | Catatan |
|-----------|------|-------|---------|---------|
| `tenant_id` | UUID | Ya | - | |
| `limit` | integer | Tidak | 10 | Maksimal 50 |
| `order_kind` | string | Tidak | null | Filter: transaction, request, job |

**Output Schema:**

```json
{
  "total_pending": 5,
  "orders": [
    {
      "order_number": "ORD-20260410-001",
      "order_kind": "transaction",
      "related_party_name": "Toko ABC",
      "total_amount": 350000,
      "order_date": "2026-04-10T08:30:00Z",
      "current_status_label": "Menunggu Konfirmasi"
    }
  ]
}
```

**Data Source:** `orders` JOIN `order_status_definitions` (WHERE `status_group = 'pending'`, tenant-scoped)

---

### 4.3 GetCriticalStock

| Field | Detail |
|-------|--------|
| **tool_name** | `GetCriticalStock` |
| **purpose** | Mengambil daftar item dengan stok di bawah batas minimum |
| **tenant_guard** | Wajib |
| **auth_guard** | owner, authorized_party |
| **timeout** | 5 detik |

**Input Schema:**

| Parameter | Tipe | Wajib | Default | Catatan |
|-----------|------|-------|---------|---------|
| `tenant_id` | UUID | Ya | - | |
| `threshold_override` | number | Tidak | null | Override batas minimum. Jika null, gunakan `items.min_stock_qty` |

**Output Schema:**

```json
{
  "total_critical": 3,
  "items": [
    {
      "item_code": "SKU-001",
      "item_name": "Kopi Arabica 250g",
      "on_hand_qty": 5,
      "min_stock_qty": 20,
      "uom": "pcs",
      "shortage": 15
    }
  ]
}
```

**Data Source:** `items` JOIN `inventory_balances` (WHERE `stock_tracked = true AND min_stock_qty IS NOT NULL AND on_hand_qty < min_stock_qty`, tenant-scoped, lokasi default MVP)

> Item dengan `stock_tracked = true` tetapi `min_stock_qty = NULL` tidak masuk ke hasil — item tersebut belum memiliki ambang batas minimum yang ditetapkan dan tidak dapat dievaluasi sebagai kritis.

---

### 4.4 GetOrderByStatus

| Field | Detail |
|-------|--------|
| **tool_name** | `GetOrderByStatus` |
| **purpose** | Mengambil order berdasarkan status group atau status spesifik |
| **tenant_guard** | Wajib |
| **auth_guard** | owner, authorized_party |
| **timeout** | 5 detik |

**Input Schema:**

| Parameter | Tipe | Wajib | Default | Catatan |
|-----------|------|-------|---------|---------|
| `tenant_id` | UUID | Ya | - | |
| `status_group` | string | Tidak | null | pending, active, completed, cancelled |
| `status_code` | string | Tidak | null | Kode status spesifik tenant |
| `limit` | integer | Tidak | 10 | Maksimal 50 |
| `date_from` | date | Tidak | null | |
| `date_to` | date | Tidak | null | |

**Output Schema:**

```json
{
  "filter_applied": "status_group: active",
  "total_matched": 8,
  "orders": [
    {
      "order_number": "ORD-20260410-003",
      "order_kind": "transaction",
      "related_party_name": "PT Maju",
      "total_amount": 1200000,
      "order_date": "2026-04-10T09:15:00Z",
      "current_status_label": "Sedang Dikerjakan"
    }
  ]
}
```

**Data Source:** `orders` JOIN `order_status_definitions` (tenant-scoped)

---

### 4.5 GetTodayPerformance

| Field | Detail |
|-------|--------|
| **tool_name** | `GetTodayPerformance` |
| **purpose** | Mengambil ringkasan performa operasional hari ini |
| **tenant_guard** | Wajib |
| **auth_guard** | owner, authorized_party |
| **timeout** | 5 detik |

**Input Schema:**

| Parameter | Tipe | Wajib | Default | Catatan |
|-----------|------|-------|---------|---------|
| `tenant_id` | UUID | Ya | - | |
| `date` | date | Tidak | Hari ini | |

**Output Schema:**

```json
{
  "date": "2026-04-10",
  "total_orders": 20,
  "pending_orders": 5,
  "active_orders": 8,
  "completed_orders": 6,
  "cancelled_orders": 1,
  "total_sales_amount": 3200000,
  "critical_stock_count": 3,
  "currency": "IDR"
}
```

**Data Source:** Agregasi langsung dari `orders` + `order_status_definitions` + `inventory_balances` (tenant-scoped, query real-time pada MVP)

---

### 4.6 GetProductInfo

| Field | Detail |
|-------|--------|
| **tool_name** | `GetProductInfo` |
| **purpose** | Mengambil informasi detail satu produk/item |
| **tenant_guard** | Wajib |
| **auth_guard** | owner, authorized_party |
| **timeout** | 3 detik |

**Input Schema:**

| Parameter | Tipe | Wajib | Default | Catatan |
|-----------|------|-------|---------|---------|
| `tenant_id` | UUID | Ya | - | |
| `item_code` | string | Tidak | null | Kode SKU item |
| `item_name` | string | Tidak | null | Pencarian partial nama item |

> Minimal salah satu dari `item_code` atau `item_name` harus diisi.

**Output Schema:**

```json
{
  "found": true,
  "item": {
    "item_code": "SKU-001",
    "item_name": "Kopi Arabica 250g",
    "item_type": "physical",
    "status": "active",
    "category_name": "Minuman",
    "stock_tracked": true,
    "on_hand_qty": 45,
    "min_stock_qty": 20,
    "standard_price": 85000,
    "uom": "pcs"
  }
}
```

**Data Source:** `items` LEFT JOIN `inventory_balances` LEFT JOIN `item_categories` (tenant-scoped)

---

### 4.7 GetOperationalSummary

| Field | Detail |
|-------|--------|
| **tool_name** | `GetOperationalSummary` |
| **purpose** | Mengambil snapshot ringkasan operasional untuk narasi bisnis |
| **tenant_guard** | Wajib |
| **auth_guard** | owner, authorized_party |
| **timeout** | 5 detik |

**Input Schema:**

| Parameter | Tipe | Wajib | Default | Catatan |
|-----------|------|-------|---------|---------|
| `tenant_id` | UUID | Ya | - | |
| `period` | string | Tidak | `today` | today, yesterday, this_week, this_month |

**Output Schema:**

```json
{
  "period": "today",
  "date_range": { "from": "2026-04-10", "to": "2026-04-10" },
  "orders": {
    "total": 20,
    "by_status_group": {
      "pending": 5,
      "active": 8,
      "completed": 6,
      "cancelled": 1
    }
  },
  "sales": {
    "total_amount": 3200000,
    "completed_amount": 1800000,
    "currency": "IDR"
  },
  "stock": {
    "critical_count": 3,
    "total_tracked_items": 150
  }
}
```

**Data Source:** Agregasi langsung dari `orders` + `order_status_definitions` + `items` + `inventory_balances` (tenant-scoped)

---

### 4.8 GetPolicyAnswerReference

| Field | Detail |
|-------|--------|
| **tool_name** | `GetPolicyAnswerReference` |
| **purpose** | Mengambil konteks knowledge dokumen (SOP, kebijakan) untuk menjawab pertanyaan |
| **tenant_guard** | Wajib |
| **auth_guard** | owner, authorized_party |
| **timeout** | 8 detik |

**Input Schema:**

| Parameter | Tipe | Wajib | Default | Catatan |
|-----------|------|-------|---------|---------|
| `tenant_id` | UUID | Ya | - | |
| `query` | string | Ya | - | Pertanyaan natural language owner tentang kebijakan/SOP |
| `max_chunks` | integer | Tidak | 5 | Jumlah chunk yang dikembalikan |

**Output Schema:**

```json
{
  "query": "kebijakan retur barang",
  "source": "rag",
  "chunks": [
    {
      "document_title": "SOP Retur Barang",
      "document_type": "sop",
      "content": "Retur barang dapat dilakukan dalam 7 hari...",
      "relevance_score": 0.89
    }
  ],
  "total_chunks_found": 2
}
```

**Data Source:** `knowledge_chunks` JOIN `knowledge_document_versions` JOIN `knowledge_documents` (WHERE `knowledge_documents.status = 'active' AND knowledge_document_versions.embedding_status = 'processed'`, tenant-scoped, similarity search via embedding)

> Hanya dokumen dengan status `active` yang diikutsertakan dalam retrieval. Dokumen berstatus `draft` atau `archived` tidak boleh menjadi sumber jawaban AI.

---

## 5. Ringkasan Tool Registry

| # | Tool Name | Kategori | Data Source Utama | MVP Query |
|---|-----------|----------|-------------------|-----------|
| 1 | GetSalesSummary | Penjualan | orders, order_items | Langsung |
| 2 | GetPendingOrders | Order | orders, order_status_definitions | Langsung |
| 3 | GetCriticalStock | Stok | items, inventory_balances | Langsung |
| 4 | GetOrderByStatus | Order | orders, order_status_definitions | Langsung |
| 5 | GetTodayPerformance | Performa | orders, inventory_balances | Langsung |
| 6 | GetProductInfo | Produk | items, inventory_balances, item_categories | Langsung |
| 7 | GetOperationalSummary | Ringkasan | orders, items, inventory_balances | Langsung |
| 8 | GetPolicyAnswerReference | Knowledge | knowledge_chunks, embeddings | RAG |

---

## 6. Audit Trail

Setiap eksekusi tool dicatat di tabel `assistant_tool_executions` (DB_SCHEMA.md Bab 6.9.2) dengan data:

| Field | Isi |
|-------|-----|
| `assistant_run_id` | FK ke assistant run yang memicu tool |
| `sequence_no` | Urutan tool call dalam satu run |
| `tool_name` | Nama tool dari registry |
| `status` | success, failed, skipped |
| `input_json` | Input yang diberikan (tanpa `tenant_id` sebagai security measure) |
| `output_json` | Output terstruktur |
| `duration_ms` | Latensi eksekusi |
| `error_text` | Pesan error jika gagal |

---

## 7. Aturan Error Handling

| Situasi | Response Tool | Behavior Assistant |
|---------|---------------|--------------------|
| Tool berhasil | Return output JSON | Compose jawaban natural |
| Tool timeout | `{ "error": true, "code": "TIMEOUT" }` | "Maaf, data sedang lambat diambil. Coba lagi nanti." |
| Tool gagal query | `{ "error": true, "code": "QUERY_FAILED" }` | "Data sedang tidak bisa diakses. Coba beberapa saat lagi." |
| Data kosong | `{ "total_*": 0, ... }` | Jawab bahwa tidak ada data untuk periode tersebut |
| Tenant tidak valid | Eksekusi ditolak sebelum tool | "Maaf, saya tidak bisa memproses permintaan ini." |
