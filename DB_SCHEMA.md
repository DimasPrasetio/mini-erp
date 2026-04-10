# Database Schema Design

## 1. Tujuan Dokumen

Dokumen ini mendefinisikan rancangan basis data untuk mini ERP berbasis React + NestJS dengan asumsi:

1. satu perusahaan per instance aplikasi,
2. banyak cabang,
3. web sebagai primary system,
4. WhatsApp owner assistant sebagai secondary interface.

Schema dirancang dengan model `single company + multi-branch`, menggunakan company-scoped untuk data master dan branch-scoped untuk operasional harian.

---

## 2. Prinsip Desain

1. **Company-scoped** untuk data master dan konfigurasi bisnis inti.
2. **Branch-scoped** untuk data operasional harian.
3. MySQL 8 + InnoDB sebagai database utama.
4. UUID disimpan sebagai `binary(16)`.
5. Timestamp memakai `datetime(3)` UTC.
6. JSON hanya untuk konfigurasi ringan dan metadata tambahan.

---

## 3. Konvensi Umum

### 3.1 Kolom Standar

Sebagian besar tabel memakai:

1. `id`
2. `created_at`
3. `updated_at`
4. `archived_at` bila soft archive diperlukan

### 3.2 Scope Data

| Scope | Contoh |
|-------|--------|
| Company-scoped | settings, features, users, products, categories, business parties, status definitions, knowledge |
| Branch-scoped | orders, inventory, stock locations, metrics, sebagian audit |

---

## 4. Kelompok Tabel

## 4.1 Company dan Branch

### 4.1.1 companies

Menyimpan identitas perusahaan utama. Pada satu instance normalnya hanya ada satu row.

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| code | varchar(50) | Unique global |
| name | varchar(255) | Nama perusahaan |
| legal_name | varchar(255) | Opsional |
| timezone | varchar(100) | Default timezone |
| currency_code | varchar(10) | Mis. IDR |
| locale | varchar(20) | Mis. id-ID |
| status | varchar(30) | active, inactive |
| created_at | datetime(3) | Audit |
| updated_at | datetime(3) | Audit |

### 4.1.2 company_settings

Konfigurasi ringan tingkat perusahaan.

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| company_id | binary(16) | PK sekaligus FK |
| business_labels_json | json | Label bisnis |
| operational_rules_json | json | Rule ringan |
| ui_preferences_json | json | Preferensi UI |
| assistant_preferences_json | json | Preferensi assistant |
| reporting_preferences_json | json | Default reporting |
| updated_at | datetime(3) | Audit |

### 4.1.3 company_features

Feature flags tingkat perusahaan.

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| feature_key | varchar(100) | Mis. whatsapp_assistant |
| enabled | boolean | Status |
| config_json | json | Config tambahan |
| created_at | datetime(3) | Audit |
| updated_at | datetime(3) | Audit |

Constraint:

1. `unique(company_id, feature_key)`

### 4.1.4 branches

Cabang operasional perusahaan.

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| code | varchar(50) | Unique per company |
| name | varchar(255) | Nama cabang |
| address_text | text | Opsional |
| phone_e164 | varchar(30) | Opsional |
| status | varchar(30) | active, inactive |
| is_default | boolean | Cabang default opsional |
| created_at | datetime(3) | Audit |
| updated_at | datetime(3) | Audit |

Constraint:

1. `unique(company_id, code)`

### 4.1.5 branch_document_sequences

Generator nomor referensi per cabang.

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| branch_id | binary(16) | FK |
| sequence_key | varchar(50) | order |
| prefix | varchar(30) | Opsional |
| current_value | bigint | Nilai saat ini |
| reset_policy | varchar(30) | none, monthly, yearly |
| format_template | varchar(100) | Template nomor |
| updated_at | datetime(3) | Audit |

Constraint:

1. `unique(branch_id, sequence_key)`

---

## 4.2 User, Role, dan Akses Cabang

### 4.2.1 users

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK ke perusahaan aktif instance |
| full_name | varchar(255) | Nama |
| email | varchar(255) | Unique nullable |
| username | varchar(100) | Unique |
| password_hash | text | Hash password |
| phone_e164 | varchar(30) | Opsional |
| display_title | varchar(100) | Jabatan atau label internal |
| status | varchar(30) | active, inactive, locked |
| last_login_at | datetime(3) | Audit |
| created_at | datetime(3) | Audit |
| updated_at | datetime(3) | Audit |

### 4.2.2 roles

Role sistem dan role kustom di level perusahaan.

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK nullable untuk role sistem global |
| code | varchar(50) | owner, admin, staff, kasir, dst |
| name | varchar(100) | Label role |
| is_system_role | boolean | True untuk role bawaan |
| created_at | datetime(3) | Audit |
| updated_at | datetime(3) | Audit |

Constraint:

1. `unique(company_id, code)` untuk role kustom
2. role sistem boleh punya `company_id = null`

### 4.2.3 permissions

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| module_key | varchar(50) | dashboard, product, order, dst |
| action_key | varchar(50) | view, create, update, archive, manage |
| permission_code | varchar(100) | Unique |

### 4.2.4 role_permissions

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| role_id | binary(16) | FK |
| permission_id | binary(16) | FK |

Constraint:

1. `unique(role_id, permission_id)`

### 4.2.5 user_roles

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| user_id | binary(16) | FK |
| role_id | binary(16) | FK |

Constraint:

1. `unique(user_id, role_id)`

### 4.2.6 user_branch_accesses

Daftar cabang yang dapat diakses oleh satu user.

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| user_id | binary(16) | FK |
| branch_id | binary(16) | FK |
| is_default_branch | boolean | Opsional |
| created_at | datetime(3) | Audit |

Constraint:

1. `unique(user_id, branch_id)`

### 4.2.7 user_sessions

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| user_id | binary(16) | FK |
| company_id | binary(16) | FK |
| active_branch_id | binary(16) | FK nullable bila menunggu pilih cabang |
| active_role_id | binary(16) | FK ke roles |
| refresh_token_hash | text | Hash token |
| user_agent | text | Audit |
| ip_address | varchar(64) | Audit |
| expires_at | datetime(3) | Masa berlaku |
| revoked_at | datetime(3) | Revoked |
| created_at | datetime(3) | Audit |

Catatan:

1. `active_role_id` menentukan permission yang berlaku.
2. `active_branch_id` menentukan branch context yang berlaku.

---

## 4.3 WhatsApp dan Percakapan

### 4.3.1 whatsapp_authorizations

Nomor owner atau pihak berwenang.

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| user_id | binary(16) | FK nullable |
| phone_e164 | varchar(30) | Nomor |
| display_name | varchar(255) | Label |
| access_level | varchar(30) | owner, authorized_party |
| status | varchar(30) | active, revoked |
| is_primary_owner | boolean | Owner utama |
| created_at | datetime(3) | Audit |
| updated_at | datetime(3) | Audit |

### 4.3.2 whatsapp_channels

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| provider | varchar(30) | baileys |
| display_number | varchar(30) | Nomor gateway |
| session_status | varchar(30) | connected, reconnecting, disconnected |
| last_connected_at | datetime(3) | Monitoring |
| last_error_text | text | Error |
| created_at | datetime(3) | Audit |
| updated_at | datetime(3) | Audit |

### 4.3.3 conversation_threads

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| branch_id | binary(16) | FK nullable bila percakapan company-wide |
| channel_id | binary(16) | FK |
| whatsapp_authorization_id | binary(16) | FK nullable |
| external_phone_e164 | varchar(30) | Nomor lawan bicara |
| thread_status | varchar(30) | open, closed |
| last_message_at | datetime(3) | Sorting |
| created_at | datetime(3) | Audit |
| updated_at | datetime(3) | Audit |

### 4.3.4 conversation_messages

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| branch_id | binary(16) | FK nullable |
| thread_id | binary(16) | FK |
| provider_message_id | varchar(255) | Id eksternal |
| direction | varchar(20) | inbound, outbound |
| message_type | varchar(30) | text, system, error |
| message_text | text | Isi pesan |
| raw_payload_json | json | Payload |
| processing_status | varchar(30) | received, processed, failed |
| sent_at | datetime(3) | Waktu provider |
| created_at | datetime(3) | Audit |

---

## 4.4 Master Data Operasional

### 4.4.1 business_parties

Customer, supplier, atau pihak terkait lain di level perusahaan.

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| party_type | varchar(30) | customer, supplier, partner |
| code | varchar(50) | Kode internal |
| name | varchar(255) | Nama |
| phone_e164 | varchar(30) | Opsional |
| email | varchar(255) | Opsional |
| address_text | text | Opsional |
| notes | text | Opsional |
| metadata_json | json | Tambahan |
| created_at | datetime(3) | Audit |
| updated_at | datetime(3) | Audit |
| archived_at | datetime(3) | Soft archive |

### 4.4.2 item_categories

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| parent_category_id | binary(16) | FK nullable |
| code | varchar(50) | Unique per company |
| name | varchar(255) | Nama kategori |
| sort_order | integer | Urutan |
| created_at | datetime(3) | Audit |
| updated_at | datetime(3) | Audit |
| archived_at | datetime(3) | Soft archive |

### 4.4.3 items

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| category_id | binary(16) | FK nullable |
| item_code | varchar(50) | Unique per company |
| item_name | varchar(255) | Nama item |
| item_type | varchar(30) | physical, service, bundle, non_stock |
| status | varchar(30) | active, inactive |
| stock_tracked | boolean | Masuk inventory flow atau tidak |
| uom | varchar(30) | Satuan |
| min_stock_qty | numeric(18,4) | Default minimum, bisa dipakai per cabang |
| standard_price | numeric(18,2) | Harga standar |
| attributes_json | json | Atribut tambahan |
| created_at | datetime(3) | Audit |
| updated_at | datetime(3) | Audit |
| archived_at | datetime(3) | Soft archive |

---

## 4.5 Status Order

### 4.5.1 order_status_definitions

Definisi status order di level perusahaan.

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| code | varchar(50) | Kode stabil |
| label | varchar(100) | Label UI |
| status_group | varchar(20) | pending, active, completed, cancelled |
| applicable_order_kind | varchar(30) | transaction, request, job, all |
| is_initial | boolean | Status awal |
| is_terminal | boolean | Status terminal |
| sort_order | integer | Urutan |
| color_hex | varchar(7) | Badge |
| created_at | datetime(3) | Audit |
| updated_at | datetime(3) | Audit |

### 4.5.2 order_status_transitions

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| from_status_id | binary(16) | FK |
| to_status_id | binary(16) | FK |
| transition_label | varchar(100) | Opsional |
| active | boolean | Aktif atau tidak |
| created_at | datetime(3) | Audit |
| updated_at | datetime(3) | Audit |

---

## 4.6 Order dan Histori Operasional

### 4.6.1 orders

Order berjalan di level cabang.

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| branch_id | binary(16) | FK |
| order_number | varchar(100) | Unique per branch |
| order_kind | varchar(30) | transaction, request, job |
| related_party_id | binary(16) | FK nullable |
| current_status_id | binary(16) | FK |
| assigned_user_id | binary(16) | FK nullable |
| order_date | datetime(3) | Tanggal order |
| due_date | datetime(3) | Opsional |
| subtotal_amount | numeric(18,2) | Opsional |
| discount_amount | numeric(18,2) | Opsional |
| total_amount | numeric(18,2) | Opsional |
| notes | text | Catatan |
| metadata_json | json | Tambahan |
| created_by_user_id | binary(16) | FK |
| created_at | datetime(3) | Audit |
| updated_at | datetime(3) | Audit |
| archived_at | datetime(3) | Soft archive |

### 4.6.2 order_items

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| order_id | binary(16) | FK |
| item_id | binary(16) | FK |
| line_no | integer | Urutan |
| item_name_snapshot | varchar(255) | Snapshot |
| item_code_snapshot | varchar(50) | Snapshot |
| quantity | numeric(18,4) | Qty |
| unit_price | numeric(18,2) | Harga |
| line_total | numeric(18,2) | Total line |
| stock_tracked_snapshot | boolean | Snapshot |
| notes | text | Opsional |
| created_at | datetime(3) | Audit |

### 4.6.3 order_status_history

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| branch_id | binary(16) | FK |
| order_id | binary(16) | FK |
| from_status_id | binary(16) | FK nullable |
| to_status_id | binary(16) | FK |
| changed_by_user_id | binary(16) | FK nullable |
| change_reason | text | Opsional |
| changed_at | datetime(3) | Waktu perubahan |
| metadata_json | json | Tambahan |

---

## 4.7 Stok dan Inventory

### 4.7.1 stock_locations

Pada MVP, setiap cabang memiliki satu lokasi default.

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| branch_id | binary(16) | FK |
| code | varchar(50) | Unique per branch |
| name | varchar(255) | Nama lokasi |
| is_default | boolean | Lokasi default |
| status | varchar(30) | active, inactive |
| created_at | datetime(3) | Audit |
| updated_at | datetime(3) | Audit |

### 4.7.2 inventory_balances

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| branch_id | binary(16) | FK |
| item_id | binary(16) | FK |
| stock_location_id | binary(16) | FK |
| on_hand_qty | numeric(18,4) | Saldo |
| reserved_qty | numeric(18,4) | Default 0 |
| available_qty | numeric(18,4) | on_hand - reserved |
| updated_at | datetime(3) | Audit |

### 4.7.3 inventory_movements

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| branch_id | binary(16) | FK |
| item_id | binary(16) | FK |
| stock_location_id | binary(16) | FK |
| movement_type | varchar(30) | in, out, adjustment |
| quantity | numeric(18,4) | Nilai absolut |
| balance_before | numeric(18,4) | Audit |
| balance_after | numeric(18,4) | Audit |
| reference_type | varchar(30) | order, manual_adjustment, system |
| reference_id | binary(16) | Nullable |
| reason_text | text | Alasan |
| moved_by_user_id | binary(16) | FK nullable |
| moved_at | datetime(3) | Waktu kejadian |
| metadata_json | json | Tambahan |

---

## 4.8 Reporting

### 4.8.1 daily_operational_metrics

Optimization layer per cabang, tidak dipakai pada MVP awal.

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| branch_id | binary(16) | FK |
| metric_date | date | Tanggal agregasi |
| total_orders | integer | Jumlah order |
| pending_orders | integer | Pending |
| active_orders | integer | Active |
| completed_orders | integer | Completed |
| cancelled_orders | integer | Cancelled |
| total_sales_amount | numeric(18,2) | Penjualan |
| critical_stock_item_count | integer | Ringkasan stok kritis |
| generated_at | datetime(3) | Waktu refresh |

---

## 4.9 Assistant dan Tool Audit

### 4.9.1 assistant_runs

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| branch_id | binary(16) | FK nullable |
| authorization_id | binary(16) | FK |
| inbound_message_id | binary(16) | FK |
| intent_type | varchar(50) | sales_summary, policy_qna, dst |
| resolution_mode | varchar(30) | bot, ai, hybrid, fallback |
| llm_model_name | varchar(100) | Nullable |
| status | varchar(30) | running, completed, failed |
| final_response_text | text | Jawaban final |
| failure_reason | text | Opsional |
| started_at | datetime(3) | Mulai |
| completed_at | datetime(3) | Selesai |
| created_at | datetime(3) | Audit |

### 4.9.2 assistant_tool_executions

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| branch_id | binary(16) | FK nullable |
| assistant_run_id | binary(16) | FK |
| sequence_no | integer | Urutan |
| tool_name | varchar(100) | Nama tool |
| status | varchar(30) | success, failed, skipped |
| input_json | json | Input tervalidasi |
| output_json | json | Output |
| duration_ms | integer | Latensi |
| error_text | text | Bila gagal |
| executed_at | datetime(3) | Waktu eksekusi |

---

## 4.10 Knowledge

### 4.10.1 knowledge_documents

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| document_type | varchar(50) | sop, policy, guide |
| title | varchar(255) | Judul |
| status | varchar(30) | draft, active, archived |
| source_uri | text | Lokasi file |
| current_version_no | integer | Pointer versi aktif |
| created_by_user_id | binary(16) | FK |
| created_at | datetime(3) | Audit |
| updated_at | datetime(3) | Audit |
| archived_at | datetime(3) | Soft archive |

### 4.10.2 knowledge_document_versions

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| knowledge_document_id | binary(16) | FK |
| version_no | integer | Nomor versi |
| source_checksum | varchar(128) | Deteksi perubahan |
| raw_text | text | Plain text |
| chunking_status | varchar(30) | pending, processed, failed |
| embedding_status | varchar(30) | pending, processed, failed |
| created_at | datetime(3) | Audit |

### 4.10.3 knowledge_chunks

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| knowledge_document_version_id | binary(16) | FK |
| chunk_index | integer | Urutan |
| content_text | text | Isi chunk |
| embedding_json | json | Embedding |
| token_count | integer | Ukuran chunk |
| metadata_json | json | Heading, page, section |
| created_at | datetime(3) | Audit |

---

## 4.11 Audit dan Observability

### 4.11.1 audit_logs

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| branch_id | binary(16) | FK nullable |
| actor_type | varchar(30) | user, system, assistant, whatsapp |
| actor_id | binary(16) | Nullable |
| action_key | varchar(100) | product.create, order.status_change, dst |
| entity_type | varchar(50) | product, order, stock, knowledge_document |
| entity_id | binary(16) | Nullable |
| before_json | json | Snapshot sebelum |
| after_json | json | Snapshot sesudah |
| metadata_json | json | Tambahan |
| happened_at | datetime(3) | Waktu kejadian |

### 4.11.2 system_event_logs

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | binary(16) | Primary key |
| company_id | binary(16) | FK |
| branch_id | binary(16) | FK nullable |
| module_name | varchar(50) | whatsapp, assistant, reporting, auth |
| severity | varchar(20) | info, warning, error |
| event_key | varchar(100) | whatsapp.reconnect, assistant.timeout |
| message | text | Ringkasan |
| payload_json | json | Tambahan |
| happened_at | datetime(3) | Waktu kejadian |

---

## 5. Aturan Integritas Utama

1. Order hanya boleh mereferensikan data yang valid untuk perusahaan yang sama.
2. User hanya boleh mengakses cabang yang ada di `user_branch_accesses`.
3. Status order harus tervalidasi terhadap definisi dan transisi yang diizinkan.
4. Inventory hanya boleh dibuat untuk item `stock_tracked = true`.
5. Semua query operasional wajib branch-aware.
6. Assistant run dan tool execution harus selalu terhubung ke company context.

---

## 6. Strategi Indexing

Index minimum:

1. semua FK di-index,
2. `orders(branch_id, order_date)`,
3. `orders(branch_id, current_status_id)`,
4. `items(company_id, item_code)`,
5. `inventory_movements(branch_id, item_id, moved_at)`,
6. `conversation_messages(thread_id, created_at)`,
7. `knowledge_chunks(company_id, knowledge_document_version_id, chunk_index)`,
8. `audit_logs(company_id, branch_id, happened_at)`.

---

## 7. Ringkasan Keputusan Schema

Schema ini mengambil posisi tengah:

1. satu perusahaan,
2. banyak cabang,
3. master data inti dibagi lintas cabang,
4. data operasional harian dipisah per cabang,
5. assistant tetap aman karena seluruh jalur audit dan tool execution dapat ditelusuri.
