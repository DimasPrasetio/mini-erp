# Product Requirements Document (PRD)

## 1. Informasi Dokumen

- **Nama Dokumen:** PRD Mini ERP Multi-Branch dengan WhatsApp Owner Assistant
- **Nama File:** `PRD.md`
- **Versi:** 3.0
- **Status:** Draft Siap Eksekusi
- **Bahasa:** Indonesia
- **Basis Teknologi:** Monorepo React + NestJS
- **Tipe Produk:** Mini ERP untuk 1 perusahaan dengan banyak cabang

---

## 2. Ringkasan Produk

Produk yang akan dibangun adalah **mini ERP modern** yang membantu satu perusahaan menjalankan operasional secara lebih tertata melalui web sebagai sistem utama, sambil memberi owner akses cepat melalui WhatsApp untuk insight dan monitoring.

### Dua Jalur Akses

1. **Web Application (Primary System)**  
   Digunakan oleh owner, admin, dan staff untuk aktivitas inti: produk, order, stok, pengguna, konfigurasi bisnis, monitoring, dan reporting.

2. **WhatsApp Owner Assistant (Secondary Interface)**  
   Dipakai owner untuk tanya cepat, monitoring ringkas, dan insight instan saat tidak sempat membuka web.

### Dual Mode Experience

| Mode | Jalur | Fungsi Utama |
|------|-------|-------------|
| Deep Mode | Web | CRUD, monitoring, reporting, konfigurasi, analisis |
| Quick Mode | WhatsApp | Q&A, insight cepat, monitoring ringkas |

### Boundary WhatsApp vs Web

| Aspek | Web | WhatsApp |
|-------|-----|----------|
| Orientasi | Write-heavy | Read-heavy |
| Operasi | CRUD, konfigurasi, reporting detail | Q&A, ringkasan, monitoring |
| Aksi kritikal | Ya | Tidak |
| Target user | Owner, admin, staff | Owner |
| Data mutation | Ya | Tidak pada MVP |

---

## 3. Visi Produk

Menjadi sistem operasional bisnis berbasis web yang membantu seluruh tim bekerja lebih tertata, dengan owner assistant di WhatsApp yang membantu owner memahami kondisi bisnis dan mengambil keputusan lebih cepat.

---

## 4. Tujuan Produk

### 4.1 Tujuan Bisnis

1. Menyediakan fondasi mini ERP yang ringan tetapi usable.
2. Menjaga owner tetap dekat dengan operasional lewat web dan WhatsApp.
3. Menata operasional lintas cabang tanpa menambah kompleksitas berlebihan.
4. Menjaga codebase tetap rapi dan maintainable dalam monorepo.

### 4.2 Tujuan Produk

1. Mempermudah operasional harian melalui web.
2. Memungkinkan owner memonitor bisnis dengan cepat lewat WhatsApp.
3. Menjaga akses data AI tetap aman melalui internal tools.
4. Mendukung banyak cabang dengan branch context yang jelas.
5. Menjaga fleksibilitas bisnis melalui konfigurasi ringan di level perusahaan.

---

## 5. Non-Goals

1. Menjadi ERP enterprise yang sangat kompleks.
2. Menjadi workflow engine lintas industri.
3. Memberi AI akses langsung ke database.
4. Menjadikan WhatsApp sebagai kanal operasional utama.
5. Mendukung multi-company pada fase ini.
6. Mendukung multi-location stock per cabang pada MVP.

---

## 6. Struktur Organisasi yang Didukung

Produk ini dirancang untuk:

1. **Satu perusahaan per instance aplikasi**
2. **Banyak cabang**
3. **Satu user dapat mengakses lebih dari satu cabang**
4. **Satu role aktif per sesi**
5. **Satu cabang aktif per sesi web**

Implikasi utamanya:

1. Konfigurasi bisnis inti berada di level perusahaan.
2. Operasional harian seperti order dan stok berjalan di level cabang.
3. Produk, kategori, customer/supplier, dan role dapat dibagi lintas cabang pada perusahaan yang sama.

---

## 7. Persona Utama

### 7.1 Owner

- Menggunakan web untuk kontrol penuh dan analisis.
- Menggunakan WhatsApp untuk monitoring cepat.
- Ingin insight ringkas, langsung, dan kontekstual.

### 7.2 Admin Operasional

- Mengelola data master dan proses harian.
- Memastikan operasional cabang berjalan rapi.

### 7.3 Staff Operasional

- Fokus pada input order, update status, dan stok.
- Membutuhkan UI sederhana dan cepat.

### 7.4 Tim Internal Produk / Operator Teknis

- Menjaga aplikasi, struktur data, dan deployment tetap sehat.

---

## 8. Scope Produk

### 8.1 In Scope

#### A. Web Operasional

1. Authentication dan authorization
2. Branch selection dan branch-scoped operation
3. Product management
4. Order management
5. Stock management dasar
6. User management dasar
7. Reporting operasional dasar
8. Company configuration dasar

#### B. WhatsApp Owner Assistant

1. Integrasi WhatsApp gateway menggunakan Baileys
2. Verifikasi nomor owner
3. Assistant router `bot_only`, `ai_only`, `hybrid`
4. Bot engine untuk intent rutin
5. Internal tools untuk data real-time
6. Knowledge retrieval via RAG

#### C. Platform Foundation

1. Monorepo React + NestJS
2. Shared types dan shared contracts
3. Audit log dasar
4. Logging dan observability dasar

### 8.2 Boundary Core

1. Core tetap berada pada level item, order, status, stock, user, reporting, dan konfigurasi ringan.
2. Cabang diperlakukan sebagai unit operasional, bukan entitas terpisah dengan workflow unik.
3. Perbedaan antar cabang ditangani melalui branch context dan konfigurasi ringan, bukan fork logic besar.

### 8.3 Out of Scope

1. Accounting penuh
2. Payroll
3. Approval flow kompleks
4. Multi-company runtime
5. Multi-location stock per cabang
6. Write operations via WhatsApp

---

## 9. Prinsip Produk

1. Operational first
2. Web as primary
3. WhatsApp as complement
4. AI with boundaries
5. Configurable but bounded
6. Branch-aware by design
7. Monorepo consistency
8. Practical intelligence

---

## 10. User Stories Utama

### 10.1 Owner via Web

1. Sebagai owner, saya ingin melihat dashboard operasional per cabang agar saya bisa memantau kondisi bisnis.
2. Sebagai owner, saya ingin berpindah cabang dengan cepat tanpa login ulang.
3. Sebagai owner, saya ingin melihat laporan order, stok, dan performa cabang dari web.

### 10.2 Owner via WhatsApp

1. Sebagai owner, saya ingin bertanya "penjualan hari ini berapa?" dan mendapat jawaban cepat.
2. Sebagai owner, saya ingin menanyakan order pending atau stok kritis tanpa membuka web.
3. Sebagai owner, saya ingin bertanya SOP atau kebijakan perusahaan dengan bahasa natural.

### 10.3 Staff dan Admin

1. Sebagai staff, saya ingin membuat dan memperbarui order pada cabang aktif.
2. Sebagai admin, saya ingin mengelola produk, stok, user, dan konfigurasi dasar perusahaan.
3. Sebagai admin, saya ingin memastikan user hanya mengakses cabang yang diizinkan.

---

## 11. Kebutuhan Fungsional

### 11.1 Authentication & Authorization

1. Login berbasis email/username dan password.
2. Role minimal: owner, admin, staff.
3. Satu user dapat memiliki lebih dari satu role, tetapi hanya satu yang aktif per sesi.
4. Satu user dapat memiliki akses ke lebih dari satu cabang.
5. Setelah login, sistem menetapkan cabang aktif jika user hanya punya satu cabang; jika lebih dari satu, user harus memilih cabang.
6. Permission yang berlaku hanya dari role aktif.

### 11.2 Company & Branch Context

1. Sistem harus memiliki satu entitas perusahaan utama.
2. Sistem harus mendukung banyak cabang.
3. Semua operasi order, stok, dan reporting harian harus menggunakan cabang aktif.
4. Company settings mengatur label bisnis, preferensi assistant, dan aturan ringan.
5. Branch baru dapat ditambahkan dan dikelola secara mandiri oleh Owner/Admin melalui menu Pengaturan Perusahaan.

### 11.3 Product Management

1. Produk dan kategori dapat dikelola oleh user berizin.
2. Produk diposisikan sebagai item operasional: physical, service, bundle, non_stock.
3. Produk bersifat shared di level perusahaan dan dapat dipakai lintas cabang.

### 11.4 Order Management

1. Order dibuat pada cabang aktif.
2. Order memiliki nomor referensi unik per cabang.
3. Order memiliki status yang tervalidasi terhadap transisi yang diizinkan.
4. Histori status harus disimpan.

### 11.5 Stock Management

1. Stok dikelola per cabang.
2. Pada MVP, setiap cabang memiliki satu lokasi stok default.
3. Item non-stock tidak masuk flow inventory.
4. Sistem mendukung mutasi stok dan critical stock detection.

### 11.6 User Management

1. Sistem mendukung user internal perusahaan.
2. Admin/owner dapat mengelola user, role, dan akses cabang.
3. User nonaktif tidak dapat login.

### 11.7 Reporting

1. Reporting dasar harus tersedia untuk order, stok, dan aktivitas operasional.
2. Reporting MVP menggunakan query langsung.
3. Reporting default berbasis cabang aktif.
4. Ringkasan lintas cabang boleh ditambahkan di phase berikutnya bila diperlukan.

### 11.8 Company Configuration

1. Sistem harus mendukung pengaturan bisnis dasar perusahaan.
2. Sistem harus mendukung definisi status order dan transisi ringan.
3. Feature flags dasar dapat disimpan di level perusahaan.

### 11.9 WhatsApp Owner Assistant

1. Sistem harus memvalidasi nomor owner yang berwenang.
2. Assistant mendukung mode `bot_only`, `ai_only`, dan `hybrid`.
3. Jalur AI dan bot hanya boleh mengakses data melalui internal tools.
4. Assistant harus mampu menjawab dengan konteks perusahaan, dan bila perlu dengan filter cabang.

### 11.10 Knowledge Base & RAG

1. Sistem mendukung dokumen SOP, kebijakan, glossary, dan panduan.
2. Dokumen knowledge dipisahkan dari data transaksi real-time.
3. RAG digunakan untuk knowledge, bukan menggantikan angka operasional real-time.

### 11.11 Audit Log & Observability

1. Aktivitas penting pengguna web harus dicatat.
2. Penggunaan tool oleh assistant harus dapat diaudit.
3. Error integrasi utama harus dapat ditelusuri.

---

## 12. Kebutuhan Non-Fungsional

### 12.1 Security

1. Branch isolation wajib pada data operasional.
2. Bot maupun AI tidak boleh mengakses database langsung.
3. Access tool harus tervalidasi terhadap identity dan scope data yang benar.

### 12.2 Performance

1. Web harus responsif untuk penggunaan harian.
2. Reporting MVP menggunakan query langsung dengan index yang tepat.
3. Jawaban assistant via WhatsApp harus berada pada waktu respons yang wajar.

### 12.3 Maintainability

1. Monorepo harus punya struktur jelas.
2. Shared types dan shared contracts harus reusable.
3. Modul backend harus punya boundary tegas.

### 12.4 Reliability

1. Session management harus aman.
2. Integrasi WhatsApp harus punya mekanisme reconnect.
3. Error handling harus user-friendly.

---

## 13. Arsitektur Produk Tingkat Tinggi

### Frontend

- React web app untuk owner, admin, dan staff

### Backend

- NestJS API sebagai business logic, auth, branch context, domain service, assistant, dan tools

### Assistant Layer

- Router owner assistant
- Bot engine internal
- AI orchestration
- Knowledge retrieval

### Data Layer

- MySQL untuk transaksi dan metadata knowledge
- Object storage untuk file knowledge

---

## 14. MVP Definition

### 14.1 Web

- Authentication
- Role basic
- Branch selection
- Product management dasar
- Order management dasar
- Stock management dasar per cabang
- User management dasar
- Reporting operasional dasar
- Company configuration minimum

### 14.2 WhatsApp

- Baileys integration
- Owner verification
- Assistant router
- Internal tools prioritas
- RAG dasar

---

## 15. Fase Pengembangan yang Direkomendasikan

### Phase 1 - Core Foundation

- setup monorepo
- auth dan branch context
- company model
- product/order/stock basic modules
- shared types/contracts
- audit log basic

### Phase 2 - Operational Web MVP

- dashboard dasar
- user management
- company configuration
- reporting dasar
- integrasi UI ke API

### Phase 3 - WhatsApp Owner Assistant MVP

- Baileys integration
- owner verification
- assistant module
- priority tools
- conversation logging

### Phase 4 - Knowledge & RAG

- document ingestion
- retrieval
- policy/SOP Q&A

### Phase 5 - Hardening & Optimization

- caching
- quota
- resilience
- observability
- multi-location activation bila dibutuhkan

---

## 16. Risiko Produk dan Mitigasi

### Risiko 1: Jawaban assistant tidak akurat

- Gunakan bot untuk intent rutin
- Gunakan tool untuk data real-time
- Gunakan RAG hanya untuk knowledge

### Risiko 2: Data cabang tertukar

- Enforce branch context di setiap layer
- Gunakan session active branch
- Lakukan testing branch isolation

### Risiko 3: Scope membesar terlalu cepat

- Jaga fokus pada core module
- Tahan multi-company dan multi-location dari MVP

---

## 17. Definisi Sukses Produk

Produk dianggap berhasil bila:

1. Tim operasional dapat menjalankan proses inti melalui web.
2. Owner dapat memonitor bisnis dengan cepat via WhatsApp.
3. Operasional cabang dapat dikelola tanpa kebingungan context data.
4. Assistant terasa seperti asisten internal perusahaan.
5. Data transaksi real-time tetap aman karena seluruh akses berjalan melalui tools.

---

## 18. Kesimpulan

PRD ini mendefinisikan produk sebagai mini ERP berbasis monorepo React + NestJS untuk **satu perusahaan multi-cabang**. Web tetap menjadi sistem utama untuk seluruh tim, sedangkan WhatsApp menjadi jalur pelengkap bagi owner untuk insight cepat.

Fondasi data dan context access menggunakan model `single company + multi-branch` sejak awal.
