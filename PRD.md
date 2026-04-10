# Product Requirements Document (PRD)

## 1. Informasi Dokumen

- **Nama Dokumen:** PRD Mini ERP SaaS dengan WhatsApp Owner Assistant (Bot + AI)
- **Nama File:** `PRD.md`
- **Versi:** 2.0
- **Status:** Draft Siap Eksekusi
- **Bahasa:** Indonesia
- **Basis Teknologi:** Monorepo React + NestJS
- **Tipe Produk:** SaaS Mini ERP multi-tenant

---

## 2. Ringkasan Produk

Produk yang akan dibangun adalah **SaaS mini ERP modern** yang dirancang untuk membantu bisnis yang operasionalnya masih berjalan manual agar berpindah ke sistem yang lebih tertata, tanpa membuat proses kerja menjadi terlalu rumit bagi tim operasional maupun owner.

### Dua Jalur Akses

Produk ini menyediakan **dua jalur akses yang saling melengkapi**:

1. **Web Application (Sistem Utama)** — Menyediakan kontrol penuh atas seluruh operasional bisnis. Semua pengguna — termasuk owner — menggunakan web untuk aktivitas inti: pengelolaan produk, order, stok, user, konfigurasi bisnis, monitoring, dan reporting. Web adalah satu-satunya jalur untuk aksi kritikal dan write-heavy operations.

2. **WhatsApp Owner Assistant (Secondary Interface)** — Jalur akses cepat untuk owner saat tidak sempat membuka web. Digunakan untuk insight instan, monitoring ringkas, dan Q&A bisnis. WhatsApp bersifat read-heavy dan **tidak menggantikan fungsi utama web**.

### Dual Mode Experience

| Mode | Jalur | Fungsi Utama |
|------|-------|-------------|
| **Deep Mode** | Web | Analisis mendalam, kontrol penuh, eksplorasi data, konfigurasi, CRUD, reporting detail |
| **Quick Mode** | WhatsApp | Tanya cepat, monitoring ringkas, insight instan, Q&A bisnis |

### Boundary WhatsApp vs Web

| Aspek | Web | WhatsApp |
|-------|-----|----------|
| Orientasi | Write-heavy, kontrol penuh | Read-heavy, insight & monitoring |
| Operasi | CRUD, konfigurasi, reporting detail | Q&A, ringkasan, monitoring cepat |
| Aksi kritikal | ✅ Diperbolehkan | ❌ Tidak diperbolehkan |
| Target user | Semua (owner, admin, staff) | Owner saja |
| Data mutation | ✅ Penuh | ⚠️ Opsional, hanya aksi ringan & aman |

> **Aturan global:** WhatsApp tidak boleh menggantikan fungsi utama web. Aksi kritikal (create/update/delete data master, konfigurasi, dan manajemen user) harus tetap dilakukan di web.

Owner assistant pada sistem ini bukan diposisikan sebagai chatbot publik, melainkan sebagai **asisten pribadi owner** sekaligus **assistant internal perusahaan**. Assistant dapat dijalankan dalam tiga mode: `bot_only`, `ai_only`, dan `hybrid`. Pada mode bot, sistem memakai aturan, intent router, parser, dan algoritma internal tanpa OpenAI. Pada mode AI, sistem memakai OpenAI sebagai reasoning engine. Pada mode hybrid, bot menangani intent rutin dan AI dipakai untuk pertanyaan kompleks, follow-up, dan knowledge/SOP. Semua mode tetap hanya dapat mengakses data melalui sekumpulan tool internal berbentuk API yang aman dan terbatas, bukan langsung ke database. Untuk pengetahuan non-transaksional seperti SOP, kebijakan, panduan, dan definisi operasional, sistem memanfaatkan **RAG** saat mode `ai_only` atau `hybrid` aktif.

Produk ini diarahkan menjadi fondasi SaaS yang **cukup generik untuk banyak jenis bisnis**, tetapi tetap **fleksibel** melalui konfigurasi bisnis dan enhancement tenant-specific jika memang diperlukan.

---

## 3. Latar Belakang Masalah

Banyak bisnis kecil hingga menengah masih menjalankan proses operasional secara manual atau semi-manual. Masalah yang umum terjadi:

1. Data operasional tersebar di chat, catatan manual, spreadsheet, atau ingatan individu.
2. Monitoring owner bergantung pada laporan manual dari staf.
3. Dashboard sistem tradisional sering terasa terlalu kompleks bagi owner yang ingin informasi cepat.
4. ERP konvensional cenderung terlalu besar, mahal, dan sulit diadaptasi untuk bisnis yang belum siap dengan kompleksitas tinggi.
5. Perbedaan flow antar bisnis membuat produk SaaS generik sering terasa terlalu kaku.

Produk ini hadir untuk menjawab celah tersebut: menyediakan sistem operasional berbasis web yang sederhana dan usable untuk seluruh tim termasuk owner, sambil memberi owner jalur tambahan untuk monitoring cepat melalui WhatsApp berbasis AI.

---

## 4. Visi Produk

Menjadi **sistem operasional bisnis berbasis SaaS** yang membantu tim bekerja lebih tertata melalui web sebagai sistem utama, sekaligus memberi owner cara paling praktis untuk memahami kondisi bisnis dan mengambil keputusan melalui percakapan natural di WhatsApp sebagai jalur pendukung.

---

## 5. Tujuan Produk

### 5.1 Tujuan Bisnis

1. Menyediakan fondasi SaaS mini ERP yang bisa dipakai banyak jenis bisnis.
2. Menciptakan diferensiasi produk melalui pengalaman owner berbasis WhatsApp assistant yang dapat berjalan dengan bot internal, AI, atau hybrid sebagai pelengkap web.
3. Memberikan owner kontrol penuh via web dan monitoring cepat via WhatsApp.
4. Membuka peluang upsell melalui konfigurasi tenant dan enhancement spesifik.
5. Menjadikan produk bukan sekadar software pencatatan, tetapi sistem operasional dengan nilai strategis tinggi.

### 5.2 Tujuan Produk

1. Mempermudah seluruh pengguna termasuk owner menjalankan operasional harian melalui web.
2. Memungkinkan owner memonitor dan bertanya tentang bisnis dengan bahasa natural via WhatsApp saat tidak sempat membuka web.
3. Menjaga keamanan akses AI dengan pendekatan tool-based API, bukan direct database access.
4. Menyatukan data transaksi dan knowledge bisnis dalam pengalaman tanya jawab yang relevan.
5. Menjaga codebase tetap rapi dan maintainable melalui pendekatan monorepo.

---

## 6. Non-Goals

Agar produk tetap fokus, hal-hal berikut **bukan** target utama fase awal:

1. Menjadi ERP enterprise yang sangat kompleks dan mencakup seluruh domain bisnis.
2. Mendukung custom flow yang ekstrem untuk semua jenis industri pada fase awal.
3. Memberi AI akses penuh dan langsung ke seluruh database.
4. Menjadikan WhatsApp sebagai kanal operasional utama staf atau pengganti web.
5. Menggantikan seluruh kebutuhan dashboard analitis kompleks untuk level enterprise.
6. Menyediakan automasi AI yang boleh mengambil tindakan kritikal tanpa kontrol dan izin yang jelas.
7. Mendukung multi-warehouse/multi-location stok secara operasional di fase awal (MVP).

---

## 7. Persona Utama

### 7.1 Owner

**Karakteristik:**
- Fokus pada kontrol bisnis dan pengambilan keputusan.
- Ingin jawaban cepat, ringkas, natural, dan relevan.
- Menggunakan web untuk kontrol penuh dan deep analysis.
- Menggunakan WhatsApp untuk monitoring cepat saat tidak sempat membuka web.

**Kebutuhan:**
- **Via Web (Deep Mode):** Melihat dashboard operasional lengkap, analisis data order/stok/penjualan, konfigurasi bisnis, monitoring menyeluruh, dan reporting.
- **Via WhatsApp (Quick Mode):** Mengetahui penjualan hari ini, order pending, stok kritis, performa harian — semuanya tanpa membuka web.
- Mendapat jawaban berbasis konteks bisnis dan SOP melalui WhatsApp.
- Bertanya secara natural tanpa format baku.

### 7.2 Admin Operasional

**Karakteristik:**
- Bertanggung jawab atas data master dan monitoring operasional.
- Mengelola user, produk, stok, dan validasi proses tertentu.

**Kebutuhan:**
- Dashboard operasional berbasis web.
- Kontrol akses sesuai role.
- Pengelolaan data inti yang rapi.
- Monitoring status proses.

### 7.3 Staff / Karyawan Operasional

**Karakteristik:**
- Pengguna harian sistem.
- Fokus pada pekerjaan inti, bukan konfigurasi.

**Kebutuhan:**
- UI yang sederhana.
- Proses cepat untuk input dan update status.
- Data yang relevan dengan tugasnya.
- Minim kompleksitas teknis.

### 7.4 System Administrator / Internal Product Team

**Karakteristik:**
- Mengelola tenant, konfigurasi SaaS, dan pengembangan produk.

**Kebutuhan:**
- Arsitektur maintainable.
- Observability dan logging.
- Isolasi tenant.
- Mekanisme enhancement bertahap.

---

## 8. Problem Statement

Bagaimana membangun mini ERP SaaS yang cukup generik untuk berbagai bisnis, cukup sederhana untuk dipakai operasional sehari-hari oleh seluruh tim termasuk owner, tetapi tetap memiliki nilai tinggi bagi owner dengan menyediakan akses monitoring dan insight bisnis cepat melalui WhatsApp melalui owner assistant yang natural, aman, dan kontekstual sebagai pelengkap kontrol penuh melalui web?

---

## 9. Positioning Produk

Produk diposisikan sebagai:

> **Sistem operasional bisnis berbasis web yang membantu seluruh tim termasuk owner bekerja lebih tertata, dengan assistant internal perusahaan di WhatsApp yang membantu owner memantau bisnis dan mengambil keputusan lebih cepat saat tidak sempat membuka web.**

Bukan diposisikan sebagai:
- ERP besar yang rumit
- Chatbot publik generik
- Aplikasi pencatatan biasa
- WhatsApp sebagai pengganti web

---

## 10. Scope Produk

### 10.1 In Scope

#### A. Web Operasional (Sistem Utama)
1. Manajemen produk
2. Manajemen order
3. Manajemen stok (single location operasional pada MVP)
4. Manajemen user dan role dasar
5. Monitoring dasar dan reporting operasional
6. Konfigurasi bisnis/tenant
7. Dashboard operasional untuk semua role termasuk owner

#### B. WhatsApp Owner Assistant (Secondary Interface)
1. Integrasi WhatsApp gateway menggunakan Baileys
2. Penerimaan pesan owner dalam format natural
3. Assistant router yang menentukan mode `bot_only`, `ai_only`, atau `hybrid`
4. Bot engine internal untuk intent rutin dan deterministik
5. AI orchestration opsional untuk pertanyaan yang lebih fleksibel atau kompleks
6. Pengambilan data melalui internal API tools
7. Integrasi knowledge non-transaksional melalui RAG saat mode AI aktif
8. Batasan: read-heavy only, tidak untuk aksi kritikal

#### C. Platform SaaS
1. Multi-tenant architecture
2. Shared modules dan shared contract
3. Tenant-specific configuration
4. Shared authentication dan authorization
5. Audit log dan observability dasar

### 10.2 Boundary Generic Core untuk Fase Awal

1. Core product ditujukan untuk bisnis yang tetap memiliki pola dasar item, order, status operasional, user, dan monitoring dasar walaupun istilah bisnisnya berbeda.
2. Modul product diposisikan sebagai katalog item operasional, sehingga dapat mewakili barang, jasa, atau item non-stock dalam batas kebutuhan operasional dasar.
3. Modul order diposisikan sebagai entitas transaksi, permintaan, atau pekerjaan operasional yang dikelola melalui status dan histori, bukan hanya penjualan retail.
4. Modul stock hanya berlaku untuk item yang memang dikelola stoknya dan tidak dipaksakan ke seluruh jenis item atau seluruh jenis tenant. **MVP beroperasi dengan single stock location per tenant.**
5. Perbedaan tenant yang masih ditangani core adalah perbedaan label, status flow ringan, field operasional ringan, threshold, dan parameter dasar lain yang masih dapat dikonfigurasi.
6. Logic bisnis yang sangat spesifik industri, menjadi jantung operasional tenant, atau membutuhkan workflow berat tidak masuk ke core product fase awal.

### 10.3 Out of Scope untuk Fase Awal

1. Accounting penuh
2. Payroll
3. HRIS lengkap
4. Workflow approval kompleks multi-level
5. BI dashboard tingkat enterprise
6. Omnichannel commerce yang luas
7. Mobile app native
8. Integrasi perangkat keras khusus
9. Pricing, procurement, komisi, atau orkestrasi operasional yang sangat spesifik per industri dan tidak bisa direpresentasikan dengan core module generik
10. Workflow domain-specific yang memerlukan engine khusus di luar konfigurasi ringan tenant
11. Multi-warehouse / multi-location stok secara operasional (DB tetap future-ready)
12. Write operations atau aksi kritikal melalui WhatsApp

---

## 11. Prinsip Produk

1. **Operational first**: sistem harus benar-benar usable oleh seluruh tim operasional termasuk owner.
2. **Web as primary**: web adalah sistem utama untuk semua pengguna, WhatsApp adalah pelengkap untuk owner.
3. **Owner dual access**: owner dapat deep control melalui web dan quick insight melalui WhatsApp.
4. **AI with boundaries**: AI hanya memakai tools yang aman dan terkontrol, bersifat read-heavy di WhatsApp.
5. **Configurable core**: modul inti generik, behavior dapat dikonfigurasi.
6. **Generic operational abstraction**: core module dimodelkan pada level item, order, status, stok, dan monitoring operasional, bukan pada istilah industri yang terlalu spesifik.
7. **Config before customization**: variasi ringan antar tenant harus diakomodasi melalui konfigurasi sebelum masuk ke enhancement khusus.
8. **Gradual extensibility**: enhancement spesifik tenant dapat dilakukan bertahap.
9. **Monorepo consistency**: type, contract, dan utility dijaga konsisten.
10. **Practical intelligence**: Assistant harus memberi jawaban yang relevan, bukan sekadar terlihat pintar secara umum.

---

## 12. Asumsi Produk

1. Tenant memiliki minimal satu owner yang aktif menggunakan WhatsApp.
2. Owner juga menggunakan web untuk kontrol penuh dan analisis mendalam.
3. Tim operasional bersedia menggunakan aplikasi web untuk proses inti.
4. AI digunakan terutama untuk tanya jawab, monitoring, dan insight (read-heavy), bukan transaksi berisiko tinggi.
5. Data transaksi inti terstruktur dalam sistem internal.
6. Knowledge bisnis seperti SOP, kebijakan, dan panduan dapat diunggah/diindeks ke modul knowledge.
7. Tenant yang ditargetkan masih memiliki pola operasional dasar yang dapat direpresentasikan dengan item, order, status, user, dan reporting dasar.
8. Variasi antar tenant pada fase awal masih dominan pada istilah bisnis, konfigurasi status, atribut ringan, dan aturan operasional dasar; bukan pada workflow berat yang memerlukan modul baru.

---

## 13. User Stories Utama

### 13.1 Owner via Web (Deep Mode)

1. Sebagai owner, saya ingin login ke web dan melihat dashboard operasional agar saya bisa memantau kondisi bisnis secara menyeluruh.
2. Sebagai owner, saya ingin melihat laporan penjualan dan performa bisnis dengan detail dan filter di web.
3. Sebagai owner, saya ingin melihat daftar order, stok, dan data operasional langsung dari web saat butuh analisis mendalam.

### 13.2 Owner via WhatsApp (Quick Mode)

1. Sebagai owner, saya ingin bertanya "penjualan hari ini berapa?" agar saya cepat tahu performa bisnis tanpa membuka web.
2. Sebagai owner, saya ingin bertanya "order yang masih pending apa saja?" agar saya bisa follow up bila perlu.
3. Sebagai owner, saya ingin bertanya "stok yang mulai kritis apa saja?" agar saya bisa antisipasi kekurangan barang.
4. Sebagai owner, saya ingin menanyakan SOP atau kebijakan retur dengan bahasa natural agar tidak perlu membuka dokumen manual.
5. Sebagai owner, saya ingin assistant menjawab seperti asisten internal perusahaan, bukan chatbot umum, baik saat memakai bot maupun AI.

### 13.3 Staff Operasional

1. Sebagai staff, saya ingin mengelola order harian di web dengan alur yang jelas.
2. Sebagai staff, saya ingin update status pesanan dengan cepat agar monitoring selalu akurat.
3. Sebagai staff, saya ingin melihat stok dan perubahan stok agar pekerjaan saya konsisten dengan data.
4. Sebagai staff, saya ingin UI sederhana agar tidak bingung memakai sistem setiap hari.

### 13.4 Admin

1. Sebagai admin, saya ingin mengelola user dan hak akses agar penggunaan sistem lebih tertib.
2. Sebagai admin, saya ingin mengatur konfigurasi bisnis dasar agar sistem sesuai dengan tenant.
3. Sebagai admin, saya ingin melihat laporan dan monitoring operasional untuk pengawasan internal.
4. Sebagai admin, saya ingin mengelola knowledge bisnis agar AI bisa menjawab pertanyaan owner dengan konteks yang benar.

---

## 14. Kebutuhan Fungsional

## 14.1 Modul Authentication & Authorization

### Deskripsi
Mengelola login, session, role, dan izin akses pengguna web serta identitas owner untuk kanal WhatsApp.

### Requirements
1. Sistem harus menyediakan login berbasis email/username dan password untuk pengguna web.
2. Sistem harus mendukung role minimal: owner, admin, staff.
3. Sistem harus mendukung permission berbasis role untuk kontrol modul dan aksi.
4. Sistem harus mendukung session management yang aman.
5. Sistem harus mendukung pemetaan nomor WhatsApp owner yang berwenang terhadap tenant.
6. Sistem harus menolak query WhatsApp dari nomor yang tidak terdaftar sebagai owner/authorized party.
7. Sistem harus mendukung satu user memiliki lebih dari satu role pada satu tenant.
8. Sistem harus mendukung mekanisme switch role aktif tanpa logout. Permission dan menu yang tampil berubah sesuai role yang dipilih.
9. Saat login, role aktif di-set ke role utama berdasarkan prioritas: owner > admin > staff.

### Acceptance Criteria
- Pengguna hanya dapat mengakses menu sesuai role yang sedang aktif (bukan gabungan semua role).
- User dengan multi-role dapat switch role via dropdown avatar tanpa logout.
- Saat switch role, sidebar dan menu langsung berubah sesuai permission role baru.
- Nomor WhatsApp yang tidak terotorisasi tidak dapat memperoleh data tenant.
- Akses owner via WhatsApp terikat ke tenant yang benar.

---

## 14.2 Modul Tenant & Business Configuration

### Deskripsi
Mengelola identitas tenant dan konfigurasi operasional dasar agar core module tetap generik namun fleksibel.

### Requirements
1. Sistem harus mendukung data tenant sebagai entitas utama.
2. Sistem harus menyediakan konfigurasi bisnis dasar per tenant.
3. Sistem harus mendukung definisi label, status, atau parameter tertentu yang dapat disesuaikan tenant.
4. Sistem harus memungkinkan aktivasi/non-aktivasi fitur tertentu per tenant di masa depan.
5. Sistem harus memastikan seluruh data operasional terisolasi per tenant.
6. Sistem harus mendukung konfigurasi istilah bisnis, status dictionary, transisi status ringan, format referensi, dan parameter operasional dasar tanpa fork codebase utama.
7. Sistem tidak boleh mengandalkan konfigurasi untuk mensimulasikan workflow berat yang seharusnya diperlakukan sebagai enhancement khusus.

### Acceptance Criteria
- Tenant A tidak dapat melihat data Tenant B.
- Beberapa perbedaan flow ringan dapat diakomodasi melalui konfigurasi.
- Tenant dapat menyesuaikan istilah dan status operasional dasar tanpa mengubah struktur core module.

---

## 14.3 Modul Product Management

### Deskripsi
Mengelola data produk sebagai katalog item operasional yang digunakan pada aktivitas harian.

### Requirements
1. Admin/staff berizin dapat membuat, mengubah, mengarsipkan, dan melihat produk.
2. Produk minimal memiliki nama, kode/SKU internal, status aktif, tipe item operasional, dan atribut operasional dasar.
3. Sistem harus memungkinkan pembedaan item yang dikelola sebagai stok dan item yang tidak memerlukan pengelolaan stok.
4. Sistem harus mendukung kategori atau grouping produk.
5. Sistem harus mendukung penambahan atribut bisnis yang relevan secara terkontrol.
6. Sistem harus menyediakan pencarian dan filter produk.

### Acceptance Criteria
- Produk dapat dikelola tanpa memengaruhi tenant lain.
- Produk aktif dapat digunakan dalam order, sementara hanya item yang relevan yang terhubung ke stok.

---

## 14.4 Modul Order Management

### Deskripsi
Mengelola order sebagai entitas transaksi, permintaan, atau pekerjaan operasional dari pencatatan hingga perubahan status.

### Requirements
1. Staff/admin dapat membuat order.
2. Order harus memiliki nomor referensi unik per tenant.
3. Order harus dapat merepresentasikan transaksi, permintaan, atau pekerjaan operasional dasar tanpa mengubah struktur core module.
4. Order harus menyimpan item, quantity, status, waktu pencatatan, pembuat, dan nilai transaksi bila memang relevan terhadap konteks bisnis tenant.
5. Sistem harus mendukung pihak terkait order secara fleksibel pada level data dasar sesuai kebutuhan tenant.
6. Sistem harus mendukung perubahan status order sesuai flow tenant.
7. Sistem harus menyediakan histori perubahan status.
8. Sistem harus mendukung pencarian, filter, dan monitoring order.
9. Sistem harus menyediakan grouping status generik seperti pending, active, completed, dan cancelled untuk kebutuhan reporting walaupun label tenant dapat berbeda.

### Acceptance Criteria
- Order dapat dibuat dan dipantau dengan status yang jelas.
- Riwayat status order tercatat.
- Order tetap dapat dipakai untuk beberapa konteks operasional dasar selama masih mengikuti model item, status, user, dan histori yang sama.
- Owner dapat menanyakan status order melalui WhatsApp dan memperoleh jawaban yang relevan.

---

## 14.5 Modul Stock Management

### Deskripsi
Mengelola ketersediaan stok dan mutasi dasar untuk item yang memang dikelola stoknya.

### Scope Stock MVP
- **MVP beroperasi dengan single stock location per tenant secara operasional.**
- Database tetap mendukung multi-location (future-ready) agar tidak perlu migrasi besar di masa depan.
- UI dan business logic pada MVP hanya mengoperasikan satu lokasi default.
- Multi-location operasional adalah scope pengembangan di luar MVP.

### Requirements
1. Sistem harus menyimpan saldo stok per produk atau item yang ditandai sebagai stock-tracked.
2. Sistem tidak boleh memaksa seluruh item memiliki saldo stok bila item tersebut bersifat non-stock.
3. Sistem harus mendukung penyesuaian stok oleh role berizin.
4. Sistem harus mencatat mutasi stok beserta alasan atau sumber perubahan.
5. Sistem harus mendukung batas stok minimum atau indikator stok kritis.
6. Sistem harus menyediakan daftar produk dengan stok rendah.
7. Sistem harus memungkinkan integrasi stok dengan event order sesuai aturan bisnis tenant hanya untuk item yang relevan.
8. Pada MVP, sistem hanya mengoperasikan satu lokasi stok default per tenant.

### Acceptance Criteria
- Saldo stok konsisten dengan mutasi tercatat.
- Item non-stock tidak dipaksa mengikuti flow stok.
- Owner dapat menanyakan stok kritis dan memperoleh daftar relevan.
- MVP berjalan dengan single location, tanpa pilihan lokasi di UI.

---

## 14.6 Modul User Management

### Deskripsi
Mengelola akun pengguna internal tenant.

### Requirements
1. Admin berwenang dapat membuat, mengubah, mengaktifkan/nonaktifkan pengguna.
2. Admin dapat menetapkan role ke pengguna.
3. Sistem harus mencatat audit dasar terkait perubahan user.
4. Sistem harus memastikan pengguna nonaktif tidak bisa login.

### Acceptance Criteria
- User management hanya dapat dilakukan oleh pihak berwenang.
- Role memengaruhi hak akses secara konsisten.

---

## 14.7 Modul Reporting & Monitoring

### Deskripsi
Menyediakan reporting operasional dasar untuk web dan sumber data AI.

### Strategi Reporting Bertahap
- **MVP:** Reporting menggunakan query langsung ke tabel transaksional melalui internal tool API / query service. Tidak perlu membangun job aggregation atau pre-computed metrics pada fase awal.
- **Fase Optimasi (Post-MVP):** Jika volume data meningkat, tabel `daily_operational_metrics` diaktifkan sebagai optimization layer. Pada fase ini, job aggregation (harian) dijalankan untuk mengisi tabel tersebut.

### Requirements
1. Sistem harus menyediakan ringkasan operasional dasar pada web.
2. Sistem harus mendukung laporan minimal untuk order, stok, aktivitas harian, dan indikator operasional universal yang relevan lintas tenant.
3. Sistem harus menyediakan endpoint/service internal yang dapat diakses owner assistant.
4. Sistem harus mendukung agregasi data untuk pertanyaan owner seperti penjualan hari ini, order pending, stok kritis, performa harian, dan ringkasan aktivitas operasional.
5. Sistem harus dapat melakukan agregasi reporting berdasarkan grouping status generik walaupun label status tenant berbeda.
6. Pada MVP, reporting menggunakan query langsung tanpa memerlukan job aggregation.

### Acceptance Criteria
- Data operasional dasar tersedia dalam bentuk yang mudah dibaca.
- Reporting dasar tetap konsisten dipakai lintas tenant meskipun istilah operasional tenant dapat berbeda.
- Tool assistant dapat menggunakan data yang dikembalikan oleh query service internal.

---

## 14.8 Modul WhatsApp Gateway

### Deskripsi
Menghubungkan sistem ke WhatsApp owner menggunakan Baileys.

### Requirements
1. Sistem harus terhubung ke WhatsApp melalui Baileys.
2. Sistem harus dapat menerima dan memproses pesan masuk dari nomor terotorisasi.
3. Sistem harus dapat mengirim balasan kembali ke WhatsApp owner.
4. Sistem harus mencatat log percakapan dasar untuk audit dan troubleshooting.
5. Sistem harus menangani reconnect dan session persistence secara andal.
6. Sistem harus meneruskan pesan owner ke owner assistant sesuai mode yang dikonfigurasi tenant.

### Acceptance Criteria
- Pesan owner dapat diterima, diproses, dan dibalas.
- Hanya nomor terotorisasi yang dapat menggunakan fitur owner assistant.
- Pesan owner diproses sesuai mode assistant yang aktif tanpa membuka jalur akses data yang tidak aman.

---

## 14.9 Modul Owner Assistant Orchestrator

### Deskripsi
Komponen backend NestJS yang menerima pesan owner, menentukan jalur eksekusi `bot_only`, `ai_only`, atau `hybrid`, memilih tool internal yang tepat, lalu merangkai jawaban natural sebagai assistant internal perusahaan.

### Requirements
1. Sistem harus menerima input natural language dari owner.
2. Sistem harus mendukung mode assistant per tenant: `bot_only`, `ai_only`, dan `hybrid`.
3. Assistant router harus dapat menentukan engine yang dipakai untuk setiap pesan berdasarkan mode tenant, tipe intent, dan ketersediaan layanan AI.
4. Bot engine harus dapat menangani intent rutin yang deterministik menggunakan aturan, parser, dan algoritma internal tanpa AI eksternal.
5. Jalur AI harus dapat mengidentifikasi intent utama pertanyaan dan memetakan pertanyaan ke tool internal yang sesuai.
6. Bot maupun AI tidak boleh memiliki direct access ke database.
7. Bot maupun AI hanya boleh menggunakan tool yang sudah didaftarkan dan diizinkan.
8. Jalur AI harus dapat menggabungkan hasil dari lebih dari satu tool jika diperlukan.
9. Jalur AI harus mampu menyusun jawaban natural, ringkas, dan kontekstual.
10. Sistem harus menyediakan guardrail untuk membatasi query di luar cakupan tenant atau role.
11. Sistem harus mampu melakukan fallback dari AI ke bot bila AI bermasalah dan intent masih didukung bot.
12. Sistem harus mampu memberikan fallback response saat data tidak tersedia, mode tidak mendukung intent tertentu, atau pertanyaan ambigu.

### Aturan Perilaku Assistant (Response Behavior)

1. **Default langsung jawab:** Assistant harus langsung memberikan jawaban yang ringkas dan to the point, tanpa bertanya balik kecuali pertanyaan benar-benar tidak bisa dipahami.
2. **Data tidak lengkap:** Assistant menjawab parsial dengan data yang tersedia, lalu menjelaskan keterbatasannya. Contoh: *"Penjualan hari ini Rp 2.5jt (data hingga pukul 14:00, belum termasuk order yang baru masuk)."*
3. **Ambigu tinggi:** Assistant baru meminta klarifikasi jika pertanyaan benar-benar tidak bisa dipahami konteksnya. Jika konteks bisa ditebak, langsung jawab dengan asumsi yang disebutkan.
4. **Hindari tanya balik berlebihan:** Maksimal 1 pertanyaan klarifikasi per interaksi sebelum mencoba menjawab. Owner tidak ingin sesi tanya-jawab yang berlarut-larut.
5. **Format output WhatsApp-friendly:**
   - Pendek dan padat (maksimal 3-5 baris untuk jawaban ringkas)
   - Gunakan emoji secukupnya untuk readability
   - Gunakan bullet/numbering untuk daftar
   - Hindari tabel kompleks yang rusak di WhatsApp
   - Jika data banyak, rangkum lalu tawarkan "mau detail lebih lanjut?"

### Acceptance Criteria
- Pertanyaan owner dapat dijawab melalui jalur bot, AI, atau hybrid menggunakan data sistem melalui tool internal.
- Tidak ada koneksi bot atau AI langsung ke database.
- Jawaban assistant konsisten dengan konteks tenant dan mode yang aktif.
- Assistant menjawab langsung tanpa terlalu banyak tanya balik.
- Output assistant mudah dibaca di WhatsApp.

---

## 14.10 Modul Internal Tool API

### Deskripsi
Sekumpulan API/service internal yang menjadi satu-satunya jalur akses data untuk owner assistant, baik saat dijalankan oleh bot internal maupun AI.

### Requirements
1. Setiap tool harus punya kontrak input-output yang jelas.
2. Tool harus dirancang granular sesuai kebutuhan bisnis.
3. Tool harus tervalidasi terhadap tenant dan authorization context.
4. Tool harus menghasilkan data yang terstruktur dan siap dikonsumsi bot maupun AI.
5. Tool harus dapat diaudit dan dicatat penggunaannya.
6. Pada MVP, tool menggunakan query langsung (tanpa memerlukan pre-computed aggregation).

### Contoh Kandidat Tool
- GetSalesSummary
- GetPendingOrders
- GetCriticalStock
- GetOrderByStatus
- GetTodayPerformance
- GetProductInfo
- GetOperationalSummary
- GetPolicyAnswerReference

### Acceptance Criteria
- Assistant dapat memakai tool secara konsisten.
- Tool tidak membuka celah akses data lintas tenant.

---

## 14.11 Modul Knowledge Base & RAG

### Deskripsi
Mengelola pengetahuan non-transaksional yang dibutuhkan owner assistant untuk menjawab pertanyaan kontekstual.

### Requirements
1. Sistem harus mendukung knowledge source seperti SOP, kebijakan, definisi status, panduan sistem, dan dokumen internal lain.
2. Sistem harus mendukung proses indexing/embedding untuk dokumen knowledge.
3. Sistem harus memungkinkan retrieval konteks yang relevan berdasarkan pertanyaan owner.
4. RAG hanya digunakan untuk knowledge non-transaksional, bukan menggantikan tool transaksi real-time.
5. Sistem harus memungkinkan pemisahan knowledge per tenant.
6. Sistem harus mendukung versi atau update knowledge secara bertahap.

### Acceptance Criteria
- Assistant dapat menjawab pertanyaan kebijakan/SOP dengan konteks yang tepat.
- Knowledge tenant tidak tercampur dengan tenant lain.

---

## 14.12 Modul Audit Log & Observability

### Deskripsi
Mendukung keamanan, troubleshooting, dan evaluasi sistem.

### Requirements
1. Sistem harus mencatat aktivitas penting pengguna web.
2. Sistem harus mencatat penggunaan tool oleh AI.
3. Sistem harus mencatat error dan event integrasi WhatsApp.
4. Sistem harus mendukung monitoring dasar performa service.
5. Sistem harus memungkinkan penelusuran permintaan owner ke jawaban assistant dan tool yang dipakai.

### Acceptance Criteria
- Aktivitas penting dapat diaudit.
- Tim teknis dapat menelusuri masalah integrasi dan owner assistant orchestration.

---

## 15. Kebutuhan Non-Fungsional

### 15.1 Security
1. Multi-tenant data isolation wajib.
2. Bot maupun AI tidak boleh mengakses database secara langsung.
3. Seluruh akses tool harus tervalidasi context tenant dan actor.
4. Secrets, token, dan credential harus dikelola aman.
5. Jalur komunikasi antar service harus mengikuti best practice keamanan.
6. Audit trail harus tersedia untuk aktivitas penting.

### 15.2 Performance
1. Web operasional harus responsif untuk penggunaan harian.
2. Jawaban assistant via WhatsApp harus berada dalam waktu respons yang wajar untuk pengalaman percakapan, baik pada jalur bot maupun AI.
3. Query reporting pada MVP menggunakan query langsung, dioptimalkan dengan index yang tepat.

### 15.3 Scalability
1. Arsitektur harus memungkinkan penambahan tenant tanpa mengubah fondasi utama.
2. Tool API, bot engine, dan AI orchestration harus bisa berkembang seiring penambahan use case.
3. Knowledge/RAG harus dapat diperluas per tenant.

### 15.4 Maintainability
1. Monorepo harus memiliki struktur yang jelas.
2. Shared type, API contract, dan utility harus reusable.
3. Modul backend harus memiliki boundary yang tegas.
4. Penambahan fitur tenant-specific tidak boleh merusak core system.

### 15.5 Reliability
1. Integrasi WhatsApp harus memiliki mekanisme reconnect.
2. Sistem harus mampu memberi fallback dari AI ke bot bila layanan AI eksternal bermasalah dan intent masih didukung bot.
3. Error handling harus user-friendly pada web dan tetap informatif untuk log internal.

### 15.6 Usability
1. UI staf harus sederhana dan tidak terlalu berat.
2. Interaksi owner harus natural dan tidak bergantung command baku.
3. Response assistant harus mudah dipahami dan tidak terlalu teknis.

---

## 16. Arsitektur Produk Tingkat Tinggi

## 16.1 Arsitektur Konseptual

### Frontend
- React-based web app untuk seluruh pengguna termasuk owner, admin, dan staff
- Menangani UI operasional, manajemen data, monitoring, dan reporting

### Backend
- NestJS-based API dan orchestration layer
- Menangani business logic, auth, tenant management, module services, WhatsApp integration, owner assistant router, bot engine, AI orchestration, RAG orchestration, dan internal tool gateway

### Assistant Layer
- Owner assistant router sebagai jalur utama pemrosesan pesan WhatsApp owner
- Bot engine internal untuk intent rutin dan deterministik
- AI orchestration adapter untuk mode `ai_only` dan `hybrid`
- Tidak mengakses database langsung, hanya melalui internal tools + RAG context

### Messaging Layer
- Baileys sebagai WhatsApp gateway
- Menyalurkan pesan owner ke owner assistant dan balasan kembali ke owner
- Bersifat read-heavy, tidak untuk write operations kritikal

### Data Layer
- Database transaksi untuk modul operasional
- Knowledge store / vector retrieval layer untuk dokumen tenant

---

## 16.2 Prinsip Arsitektur Assistant dan AI

1. **Assistant as product abstraction, AI as optional engine**
2. **Bot-first for routine deterministic intents**
3. **LLM as reasoner, not data source**
4. **Tools as controlled data access layer untuk bot maupun AI**
5. **RAG for knowledge, tools for real-time transactional data**
6. **Tenant context injected before any answer is generated**
7. **Default to answer, not to ask** — assistant harus memprioritaskan menjawab langsung daripada bertanya balik

---

## 17. Struktur Modul yang Direkomendasikan

## 17.1 Monorepo High-Level

```text
/apps
  /web
  /api
/packages
  /shared-types
  /shared-contracts
  /shared-utils
  /ui
/docs
```

## 17.2 Backend Domain Modules

- auth
- tenant
- user
- product
- order
- stock
- reporting
- whatsapp
- assistant
- tools
- knowledge-rag
- audit-log
- config

---

## 18. Alur Utama Sistem

## 18.1 Alur Operasional (Web — Deep Mode)

1. User (owner/admin/staff) login ke web.
2. User mengelola data produk/order/stok sesuai peran.
3. Sistem mencatat aktivitas dan memperbarui data operasional.
4. Data tersebut menjadi sumber untuk reporting dan owner assistant tools.

## 18.2 Alur Owner via WhatsApp (Quick Mode)

1. Owner mengirim pertanyaan natural via WhatsApp.
2. WhatsApp gateway menerima pesan.
3. Backend memvalidasi nomor owner dan tenant context.
4. Owner assistant router memahami intent pertanyaan dan menentukan mode eksekusi.
5. Jika intent rutin dan didukung bot, bot engine memilih tool internal yang sesuai.
6. Jika intent kompleks atau knowledge-based, jalur AI dipakai sesuai mode tenant.
7. Tool mengambil data transaksi dari backend service terkait (query langsung pada MVP).
8. Jika perlu konteks knowledge, jalur AI melakukan retrieval ke knowledge base.
9. Assistant menyusun jawaban natural sebagai asisten internal perusahaan.
10. Balasan dikirim kembali ke owner via WhatsApp.
11. Sistem mencatat log pertanyaan, tool usage, mode eksekusi, dan hasil respons.

---

## 19. Detail Perilaku Owner Assistant

### 19.1 Karakter Assistant
Assistant harus diposisikan sebagai:
- asisten pribadi owner
- assistant internal perusahaan
- paham bisnis tenant
- paham istilah internal perusahaan
- paham SOP dan konteks operasional tenant
- komunikatif, ringkas, profesional, tidak generik

### 19.2 Mode Engine Assistant
1. **bot_only**: Semua query owner diproses oleh bot internal. Cocok untuk tenant yang ingin biaya rendah, response cepat, dan use case yang masih rutin.
2. **ai_only**: Semua query owner diproses melalui AI orchestration. Cocok untuk tenant yang ingin fleksibilitas natural language lebih tinggi.
3. **hybrid**: Bot memproses intent rutin yang deterministik, AI dipakai untuk pertanyaan kompleks, knowledge/SOP, follow-up, atau penyusunan jawaban yang membutuhkan reasoning lebih tinggi.

### 19.3 Batasan Assistant
Assistant tidak boleh:
- mengaku sebagai ChatGPT publik
- mengakses database langsung
- menjawab di luar tenant context seolah yakin bila datanya tidak ada
- memberi keputusan final yang seharusnya menjadi kewenangan manusia tanpa penjelasan
- membuka data sensitif yang tidak sesuai hak akses owner/tenant
- melakukan aksi kritikal melalui WhatsApp (create/update/delete data master)

### 19.4 Gaya Jawaban Assistant
Assistant harus:
- menggunakan bahasa yang natural
- menjawab langsung ke inti tanpa basa-basi berlebihan
- menyebutkan konteks periode saat menampilkan data
- memberi struktur jika datanya banyak (bullet/numbering)
- menjelaskan bila ada keterbatasan data
- mampu membedakan pertanyaan data real-time vs pertanyaan knowledge/SOP
- memberikan output yang cocok untuk WhatsApp (pendek, jelas, mudah dibaca)

### 19.5 Aturan Response

| Situasi | Behavior |
|---------|----------|
| Pertanyaan jelas | Langsung jawab, ringkas, to the point |
| Data tidak lengkap | Jawab parsial + jelaskan keterbatasan |
| Ambigu ringan | Jawab dengan asumsi + sebutkan asumsinya |
| Ambigu tinggi | Minta klarifikasi (maksimal 1 pertanyaan) |
| AI tidak tersedia tapi intent didukung bot | Route ke bot dan jawab tanpa menunggu AI |
| Di luar scope | Beritahu bahwa pertanyaan di luar kemampuan + arahkan |
| Tool gagal | Jujur bahwa data sedang tidak bisa diambil + minta coba lagi nanti |

---

## 20. Requirement Integrasi WhatsApp

1. Sistem harus mendukung nomor WhatsApp owner sebagai identitas interaksi.
2. Sistem harus mendukung verifikasi nomor owner terhadap tenant tertentu.
3. Sistem harus menangani koneksi, reconnection, dan kestabilan session Baileys.
4. Sistem harus mencatat status koneksi WhatsApp.
5. Sistem harus mendukung mekanisme pembatasan penggunaan jika koneksi belum valid.
6. Sistem harus mendukung konfigurasi mode assistant per tenant (`bot_only`, `ai_only`, `hybrid`).
7. Sistem harus menyediakan fallback operasional bila WhatsApp gateway sedang terganggu.

---

## 21. Requirement Data & Knowledge Separation

### Data Transaksional
Digunakan untuk:
- penjualan
- order pending
- stok kritis
- performa harian
- data operasional real-time

Akses melalui:
- internal tool APIs (query langsung pada MVP)

### Knowledge Non-Transaksional
Digunakan untuk:
- SOP
- kebijakan retur
- definisi status
- panduan penggunaan sistem
- dokumen bisnis lain

Akses melalui:
- retrieval + RAG (saat mode `ai_only` atau `hybrid` aktif)

### Prinsip Penting
- Jangan gunakan RAG untuk menggantikan angka real-time transaksi.
- Jangan gunakan tool transaksi untuk menjawab pengetahuan dokumen yang panjang bila lebih tepat melalui RAG.

---

## 22. Requirement Multi-Tenant

1. Setiap tenant harus memiliki boundary data yang jelas.
2. Modul harus reusable lintas tenant.
3. Konfigurasi tenant harus dapat memengaruhi behavior tertentu tanpa fork codebase utama.
4. Knowledge base harus terisolasi per tenant.
5. Owner WhatsApp harus dipetakan ke tenant terkait.
6. Tool assistant harus selalu menerima tenant context sebagai parameter wajib.
7. Variasi tenant yang ditangani oleh core pada fase awal harus tetap berada pada level konfigurasi ringan dan tidak mengubah fondasi modul inti.

---

## 23. Requirement UX/UI

### Web Operasional (Deep Mode)
1. UI sederhana dan jelas.
2. Fokus ke kecepatan kerja seluruh pengguna termasuk owner.
3. Navigasi ringkas dengan menu berbasis role.
4. Tabel, filter, status badge, dan form harus efisien digunakan.
5. Owner yang login ke web mendapat dashboard operasional dan akses penuh sesuai permission.
6. Tidak terlalu banyak elemen yang mengganggu alur kerja.

### Owner via WhatsApp (Quick Mode)
1. Tidak memerlukan format command yang kaku.
2. Jawaban assistant harus mudah dibaca di chat (pendek, terstruktur, WhatsApp-friendly).
3. Bila data cukup banyak, assistant harus mampu merangkum lalu menawarkan detail lanjutan secara natural.
4. Gaya interaksi harus terasa seperti assistant internal, bukan bot publik.
5. WhatsApp tidak menggantikan akses web untuk kontrol penuh.

---

## 24. KPI / Success Metrics

### 24.1 KPI Produk
1. Persentase proses operasional inti yang berhasil dipindahkan dari manual ke web.
2. Jumlah tenant aktif yang memakai modul inti harian.
3. Tingkat penggunaan owner assistant via WhatsApp.
4. Persentase pertanyaan owner yang berhasil dijawab dengan benar/berguna.
5. Rata-rata waktu respon assistant untuk pertanyaan owner.
6. Tingkat penggunaan web oleh owner (untuk deep analysis).

### 24.2 KPI Bisnis
1. Peningkatan keteraturan operasional tenant.
2. Penurunan ketergantungan owner pada laporan manual staf.
3. Peningkatan frekuensi monitoring owner terhadap bisnis (web + WhatsApp combined).
4. Tingkat retensi tenant karena value dari dual-access experience.

### 24.3 KPI Teknis
1. Uptime web app.
2. Kestabilan koneksi WhatsApp gateway.
3. Error rate pada assistant routing dan AI orchestration.
4. Akurasi tenant isolation dan authorization.

---

## 25. MVP Definition

## 25.1 Scope MVP

### Web (Deep Mode)
- Authentication
- Role basic
- Product management dasar dengan klasifikasi item stock dan non-stock
- Order management dasar dengan status flow ringan yang dapat dikonfigurasi
- Stock management dasar untuk item yang memang stock-tracked **(single location per tenant)**
- User management dasar
- Reporting dan monitoring dasar berbasis query langsung (tanpa job aggregation)
- Business configuration minimum
- Dashboard operasional untuk semua role termasuk owner

### WhatsApp Owner Assistant (Quick Mode)
- Baileys integration
- Owner verification
- Assistant router dengan mode `bot_only`, `ai_only`, atau `hybrid`
- Bot engine internal untuk intent rutin
- Jalur AI dasar dengan aturan response behavior
- Internal tools prioritas (query langsung, tanpa pre-computed metrics)
- RAG knowledge dasar
- Logging percakapan dasar

## 25.2 Use Case MVP Prioritas

1. Owner menanyakan penjualan hari ini via WhatsApp.
2. Owner menanyakan order pending via WhatsApp.
3. Owner menanyakan stok kritis via WhatsApp.
4. Owner menanyakan performa harian ringkas via WhatsApp.
5. Owner menanyakan SOP/kebijakan dari knowledge base via WhatsApp.
6. Owner melihat dashboard, laporan, dan data operasional via web.
7. Staff mengelola produk, order, dan stok dari web.

---

## 26. Fase Pengembangan yang Direkomendasikan

## Phase 1 - Core Foundation
- setup monorepo
- auth & role
- tenant model
- product/order/stock basic modules (single location)
- shared types/contracts
- audit log basic

## Phase 2 - Operational Web MVP
- dashboard monitoring dasar (termasuk untuk owner)
- user management
- business configuration minimal
- reporting dasar (query langsung)
- stabilisasi alur operasional

## Phase 3 - WhatsApp Owner Assistant MVP
- Baileys integration
- owner phone verification
- owner assistant router + bot engine dasar
- adapter AI awal dengan response behavior rules
- internal tools prioritas (query langsung)
- natural response generation (WhatsApp-friendly)

## Phase 4 - Knowledge & RAG
- document ingestion
- retrieval pipeline
- policy/SOP Q&A
- tenant-separated knowledge

## Phase 5 - SaaS Hardening & Optimization
- observability improvement
- performance optimization (aggregation tables, caching)
- feature toggles per tenant
- extensibility tenant-specific
- security hardening

---

## 27. Risiko Produk dan Mitigasi

### Risiko 1: Assistant memberi jawaban tidak akurat
**Mitigasi:**
- gunakan bot engine untuk intent rutin yang deterministik
- gunakan tool terstruktur untuk data transaksi
- gunakan RAG hanya untuk knowledge
- tampilkan konteks periode
- sediakan fallback bila data tidak cukup
- terapkan aturan "jawab parsial + jelaskan keterbatasan"

### Risiko 2: Kebocoran data lintas tenant
**Mitigasi:**
- enforce tenant context di setiap layer
- validasi ketat pada tools
- audit log
- testing multi-tenant isolation

### Risiko 3: WhatsApp gateway tidak stabil
**Mitigasi:**
- reconnect mechanism
- connection monitoring
- fallback notification untuk admin internal
- fallback ke bot-only path bila AI provider bermasalah tetapi gateway tetap aktif

### Risiko 4: Scope terlalu melebar menjadi ERP besar
**Mitigasi:**
- jaga fokus pada core module
- gunakan configuration-first approach
- tenant enhancement dilakukan bertahap dan terukur

### Risiko 5: Staff kesulitan beradaptasi
**Mitigasi:**
- UI sederhana
- workflow operasional tidak dibuat terlalu rumit
- onboarding dan panduan penggunaan

### Risiko 6: Owner tidak menggunakan web dan terlalu bergantung WhatsApp
**Mitigasi:**
- posisikan web sebagai sistem utama di seluruh komunikasi produk
- WhatsApp hanya menyediakan read-heavy operations
- aksi kritikal tetap diarahkan ke web
- dashboard web dibuat menarik dan useful bagi owner

---

## 28. Dependensi Utama

1. Monorepo tooling yang stabil
2. React frontend foundation
3. NestJS backend foundation
4. Database utama untuk transaksi
5. Baileys untuk WhatsApp gateway
6. OpenAI/ChatGPT API untuk LLM
7. RAG stack / vector retrieval untuk knowledge
8. Mekanisme secret management dan environment configuration

---

## 29. Pertimbangan Testing

### Functional Testing
- auth flow
- role-based access
- product/order/stock CRUD flow
- reporting basic (query langsung)
- WhatsApp receive/send flow
- bot route invocation flow
- AI path invocation flow
- RAG retrieval flow
- assistant response behavior (langsung jawab vs klarifikasi)

### Security Testing
- tenant isolation
- unauthorized WhatsApp access
- role enforcement
- tool boundary testing

### Integration Testing
- web ↔ backend
- WhatsApp ↔ owner assistant router
- bot ↔ tools
- AI ↔ tools
- AI ↔ RAG

### UAT Fokus
- staff dapat menyelesaikan operasional utama dengan lancar
- owner dapat bertanya natural via WhatsApp dan mendapatkan jawaban yang berguna
- owner dapat menggunakan web untuk kontrol penuh dan analisis mendalam
- assistant menjawab langsung tanpa terlalu banyak tanya balik

---

## 30. Open Product Decisions untuk Tahap Desain Teknis

Bagian ini bukan ketidakjelasan pada PRD, tetapi keputusan desain yang perlu diperdalam saat masuk ke technical design:

1. Model data tenant isolation yang dipilih
2. Bentuk konfigurasi bisnis yang paling fleksibel namun tetap sederhana
3. Format katalog tool internal dan cara registrasinya
4. Strategi routing assistant (`bot_only`, `ai_only`, `hybrid`), prompt orchestration, dan response format
5. Strategi knowledge ingestion dan lifecycle update dokumen
6. Rate limit, quota, dan cost control untuk penggunaan AI per tenant
7. Strategi fallback jika OpenAI API atau WhatsApp gateway bermasalah

---

## 31. Definisi Sukses Produk

Produk dianggap berhasil bila:

1. Tim operasional termasuk owner dapat menjalankan proses inti bisnis dari web tanpa bergantung lagi pada proses manual utama.
2. Owner bisa memperoleh informasi bisnis penting melalui WhatsApp dengan pertanyaan natural saat tidak sempat membuka web.
3. Owner menggunakan web untuk kontrol penuh dan analisis mendalam.
4. Assistant terasa seperti asisten internal perusahaan, bukan chatbot umum.
5. Assistant menjawab langsung dan ringkas tanpa terlalu banyak tanya balik.
6. Data transaksi real-time tetap aman karena bot maupun AI hanya mengakses data melalui tools internal.
7. Knowledge bisnis seperti SOP dan kebijakan dapat dijawab dengan konteks yang relevan melalui RAG.
8. Fondasi monorepo cukup rapi untuk dikembangkan dari MVP ke SaaS yang lebih matang.

---

## 32. Kesimpulan

PRD ini mendefinisikan produk sebagai **mini ERP SaaS berbasis monorepo React + NestJS** yang fokus pada dua nilai utama:

1. **Operasional tim yang lebih tertata melalui web sebagai sistem utama**
2. **Monitoring cepat owner melalui WhatsApp melalui owner assistant sebagai secondary interface**

Owner memiliki dual-access: Deep Mode (web) untuk kontrol penuh dan analisis mendalam, serta Quick Mode (WhatsApp) untuk insight instan saat tidak sempat membuka web. Web tetap menjadi jalur utama untuk semua pengguna, sementara WhatsApp melengkapi kebutuhan owner tanpa menggantikan fungsi web.

Fondasi produk dibangun di atas core modules yang universal, tenant configuration yang fleksibel, integrasi WhatsApp menggunakan Baileys, owner assistant yang dapat berjalan sebagai bot internal, AI OpenAI, atau hybrid, tools internal yang aman, serta RAG untuk pengetahuan non-transaksional. Dengan pendekatan ini, produk tetap cukup sederhana untuk diadopsi, cukup kuat untuk memberi nilai strategis, dan cukup fleksibel untuk tumbuh menjadi produk SaaS yang matang.
