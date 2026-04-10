Sistem yang akan dibangun adalah mini ERP modern berbasis monorepo dengan React untuk frontend dan NestJS untuk backend. Produk ini ditujukan untuk membantu **satu perusahaan** menjalankan operasional secara lebih tertata melalui web sebagai sistem utama, dengan dukungan **banyak cabang** sebagai unit operasional harian.

Fokus utama sistem ini bukan menjadi ERP enterprise yang terlalu luas, tetapi menjadi sistem operasional yang ringan, usable, dan cukup fleksibel untuk dipakai owner, admin, dan staff. Nilai tambah utamanya tetap sama: owner mendapat kontrol penuh melalui web dan monitoring cepat melalui WhatsApp.

## Sistem Utama dan Jalur Akses

Produk ini memiliki dua jalur akses yang saling melengkapi:

1. **Web Application (Primary System)**  
   Sistem utama untuk seluruh pengguna. Semua aktivitas inti seperti pengelolaan produk, order, stok, pengguna, konfigurasi bisnis, monitoring, dan reporting dilakukan di web. Seluruh aksi kritikal dan write-heavy tetap hanya dilakukan di sini.

2. **WhatsApp Owner Assistant (Secondary Interface)**  
   Jalur akses cepat untuk owner saat tidak sempat membuka web. WhatsApp dipakai untuk insight instan, monitoring ringkas, dan tanya jawab bisnis. Kanal ini bersifat read-heavy dan tidak menggantikan fungsi utama web.

## Dual Mode Experience

- **Deep Mode (Web)**  
  Untuk analisis mendalam, kontrol penuh, eksplorasi data, konfigurasi, CRUD, dan reporting.

- **Quick Mode (WhatsApp)**  
  Untuk tanya cepat, monitoring ringkas, dan insight instan.

## Struktur Operasional Perusahaan

Sistem ini dirancang untuk **satu perusahaan dengan banyak cabang**:

1. Perusahaan menjadi identitas bisnis utama pada satu instance aplikasi.
2. Cabang menjadi unit operasional utama untuk order, stok, dan monitoring harian.
3. User dapat memiliki akses ke satu atau lebih cabang.
4. Setelah login, user bekerja di **cabang aktif** pada sesi yang sedang berjalan.
5. Jika user memiliki akses ke banyak cabang, sistem menampilkan alur **pilih cabang** sebelum masuk ke dashboard.

## Operasional Web

Seluruh pengguna termasuk owner menggunakan aplikasi web untuk aktivitas inti seperti:

1. pengelolaan produk dan kategori,
2. pencatatan order dan perubahan status,
3. pengelolaan stok per cabang,
4. monitoring dan reporting operasional,
5. pengelolaan user dan role,
6. konfigurasi bisnis tingkat perusahaan.

Pendekatan domain tetap generik: product, order, stock, user, reporting, dan konfigurasi bisnis. Perbedaan antar cabang diakomodasi melalui **branch context**, bukan melalui percabangan logic yang berat.

## Owner Assistant via WhatsApp

Owner dapat berinteraksi melalui WhatsApp untuk mendapatkan insight bisnis secara cepat dengan pertanyaan natural. WhatsApp hanya dipakai untuk kebutuhan read-heavy seperti monitoring, Q&A, dan insight.

WhatsApp dihubungkan menggunakan Baileys sebagai gateway, lalu pesan owner diproses oleh backend NestJS melalui owner assistant. Di dalamnya terdapat tiga mode engine:

1. **bot**  
   Menggunakan intent router, parser, aturan, dan algoritma internal.
2. **ai**  
   Menggunakan OpenAI sebagai reasoning engine.
3. **hybrid**  
   Bot menangani intent rutin, AI dipakai untuk pertanyaan kompleks atau knowledge-based.

Baik bot maupun AI tidak memiliki akses langsung ke database. Keduanya hanya boleh memakai sekumpulan internal tools yang aman dan tervalidasi.

### Perilaku Assistant

Assistant pada sistem ini harus:

1. langsung menjawab ke inti tanpa bertele-tele,
2. menjawab parsial bila data tidak lengkap,
3. meminta klarifikasi hanya jika benar-benar ambigu,
4. memberi output yang pendek, jelas, dan WhatsApp-friendly,
5. tetap tampil sebagai asisten internal perusahaan, bukan chatbot publik.

## Batasan WhatsApp vs Web

| Aspek | Web | WhatsApp |
|-------|-----|----------|
| Orientasi | Write-heavy, kontrol penuh | Read-heavy, insight & monitoring |
| Operasi | CRUD, konfigurasi, reporting detail | Q&A, ringkasan, monitoring cepat |
| Aksi kritikal | Ya | Tidak |
| Target user | Owner, admin, staff | Owner |
| Data mutation | Penuh | Tidak pada MVP |

## Knowledge Non-Transaksional

Selain data operasional berbasis tools, sistem juga mendukung knowledge non-transaksional seperti SOP, kebijakan, definisi status, dan panduan internal. Untuk kebutuhan ini, jalur AI dapat memakai RAG saat mode `ai` atau `hybrid` aktif.

Data real-time seperti penjualan, order pending, stok kritis, dan performa harian tetap diambil dari internal API yang terstruktur. RAG tidak dipakai untuk menggantikan data transaksi real-time.

## Scope Stok

Untuk MVP, sistem beroperasi dengan **single stock location per cabang** secara operasional. Struktur database tetap dibuat future-ready untuk multi-location agar ekspansi di masa depan tidak memerlukan redesign besar.

## Arsitektur

Sistem dibangun dalam bentuk monorepo agar pengelolaan frontend dan backend lebih rapi dan konsisten.

1. Frontend React menangani antarmuka web untuk owner, admin, dan staff.
2. Backend NestJS menangani business logic, API, autentikasi, branch context, integrasi WhatsApp, owner assistant, bot internal, AI orchestration, dan service layer domain.
3. Shared packages dipakai untuk menjaga konsistensi type dan contract.

## Kesimpulan

Secara keseluruhan, sistem ini adalah mini ERP modern untuk **satu perusahaan multi-cabang**. Web tetap menjadi sistem utama untuk kontrol dan operasional penuh, sementara WhatsApp menjadi jalur pelengkap bagi owner untuk monitoring cepat.

Fondasi React + NestJS dalam monorepo dibangun dengan model `single company + multi-branch`, memudahkan operasional satu perusahaan dengan multiple cabang dan sesuai dengan kebutuhan saat ini.
