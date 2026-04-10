# Internal Tool Contract

## 1. Tujuan Dokumen

Dokumen ini mendefinisikan kontrak internal tools yang dipakai owner assistant pada model:

1. satu perusahaan,
2. banyak cabang,
3. tools read-only pada MVP,
4. data real-time diperoleh lewat service layer, bukan akses database langsung oleh assistant.

---

## 2. Prinsip Umum

1. Semua tool bersifat **read-only** pada MVP.
2. Semua tool wajib menerima `company_id`.
3. Tool yang membaca data operasional cabang menerima `branch_id` sebagai **opsional filter**.
4. Bot dan AI tidak mengakses database langsung.
5. Semua eksekusi tool dicatat di `assistant_tool_executions`.

---

## 3. Struktur Kontrak

Setiap tool minimal memiliki:

1. `tool_name`
2. `purpose`
3. `input_schema`
4. `output_schema`
5. `data_source`
6. `company_guard`
7. `branch_filter`
8. `auth_guard`
9. `timeout`
10. `error_policy`

---

## 4. Definisi Tool MVP

### 4.1 GetSalesSummary

- **Purpose:** ringkasan penjualan pada periode tertentu
- **Company guard:** wajib
- **Branch filter:** opsional
- **Timeout:** 5 detik

**Input schema**

| Parameter | Tipe | Wajib | Catatan |
|-----------|------|-------|---------|
| company_id | UUID | Ya | Context perusahaan |
| branch_id | UUID | Tidak | Filter cabang tertentu |
| date_from | date | Tidak | Default hari ini |
| date_to | date | Tidak | Default hari ini |

### 4.2 GetPendingOrders

- **Purpose:** daftar order pending
- **Company guard:** wajib
- **Branch filter:** opsional

**Input schema**

| Parameter | Tipe | Wajib |
|-----------|------|-------|
| company_id | UUID | Ya |
| branch_id | UUID | Tidak |
| limit | integer | Tidak |
| order_kind | string | Tidak |

### 4.3 GetCriticalStock

- **Purpose:** daftar item stok kritis
- **Company guard:** wajib
- **Branch filter:** opsional

**Input schema**

| Parameter | Tipe | Wajib |
|-----------|------|-------|
| company_id | UUID | Ya |
| branch_id | UUID | Tidak |
| threshold_override | number | Tidak |

### 4.4 GetOrderByStatus

- **Purpose:** daftar order berdasarkan status
- **Company guard:** wajib
- **Branch filter:** opsional

**Input schema**

| Parameter | Tipe | Wajib |
|-----------|------|-------|
| company_id | UUID | Ya |
| branch_id | UUID | Tidak |
| status_group | string | Tidak |
| status_code | string | Tidak |
| limit | integer | Tidak |
| date_from | date | Tidak |
| date_to | date | Tidak |

### 4.5 GetTodayPerformance

- **Purpose:** snapshot performa operasional hari ini
- **Company guard:** wajib
- **Branch filter:** opsional

**Input schema**

| Parameter | Tipe | Wajib |
|-----------|------|-------|
| company_id | UUID | Ya |
| branch_id | UUID | Tidak |
| date | date | Tidak |

### 4.6 GetProductInfo

- **Purpose:** detail satu produk
- **Company guard:** wajib
- **Branch filter:** opsional untuk stok per cabang

**Input schema**

| Parameter | Tipe | Wajib |
|-----------|------|-------|
| company_id | UUID | Ya |
| branch_id | UUID | Tidak |
| item_code | string | Tidak |
| item_name | string | Tidak |

### 4.7 GetOperationalSummary

- **Purpose:** ringkasan naratif bisnis
- **Company guard:** wajib
- **Branch filter:** opsional

**Input schema**

| Parameter | Tipe | Wajib |
|-----------|------|-------|
| company_id | UUID | Ya |
| branch_id | UUID | Tidak |
| period | string | Tidak |

### 4.8 GetPolicyAnswerReference

- **Purpose:** mengambil konteks knowledge seperti SOP dan kebijakan
- **Company guard:** wajib
- **Branch filter:** tidak diperlukan

**Input schema**

| Parameter | Tipe | Wajib |
|-----------|------|-------|
| company_id | UUID | Ya |
| query | string | Ya |
| max_chunks | integer | Tidak |

---

## 5. Data Source Ringkas

| Tool | Data Source |
|------|-------------|
| GetSalesSummary | orders, order_items |
| GetPendingOrders | orders, order_status_definitions |
| GetCriticalStock | items, inventory_balances |
| GetOrderByStatus | orders, order_status_definitions |
| GetTodayPerformance | orders, inventory_balances |
| GetProductInfo | items, inventory_balances, item_categories |
| GetOperationalSummary | orders, items, inventory_balances |
| GetPolicyAnswerReference | knowledge_chunks, knowledge_documents |

---

## 6. Aturan Audit Trail

Setiap eksekusi tool dicatat dengan:

1. `assistant_run_id`
2. `tool_name`
3. `status`
4. `input_json` tanpa field sensitif
5. `output_json`
6. `duration_ms`
7. `error_text`

---

## 7. Error Handling

| Situasi | Response Tool | Behavior Assistant |
|---------|---------------|--------------------|
| Berhasil | JSON output normal | Compose jawaban natural |
| Timeout | `{ "error": true, "code": "TIMEOUT" }` | Jawab jujur bahwa data sedang lambat |
| Query gagal | `{ "error": true, "code": "QUERY_FAILED" }` | Jawab bahwa data tidak bisa diakses |
| Data kosong | Total 0 / list kosong | Sampaikan tidak ada data |
| Context tidak valid | Eksekusi ditolak | Assistant menolak permintaan |

---

## 8. Ringkasan

Tool assistant menggunakan dua parameter utama untuk scoping:

1. `company_id` untuk identitas bisnis utama,
2. `branch_id` sebagai filter operasional jika pertanyaan merujuk cabang tertentu,
3. query tetap read-only dan langsung ke service layer domain yang aman.
