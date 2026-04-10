# UI Design Document

## 1. Tujuan Dokumen

Dokumen ini menjelaskan rancangan UI untuk aplikasi web mini ERP SaaS agar implementasi frontend:

1. selaras dengan DESKRIPSI_PROJECT.md, PRD.md, SYSTEM_DESIGN.md, dan DB_SCHEMA.md,
2. mudah digunakan oleh admin dan staff operasional,
3. tidak redundant secara layout, navigasi, maupun aksi,
4. tidak terasa developer-centric saat dipakai user bisnis,
5. tetap siap untuk permission-based navigation dan multi-tenant SaaS.

Dokumen ini berfokus pada web operasional sebagai sistem utama untuk semua pengguna, termasuk owner. Owner assistant via WhatsApp adalah secondary interface yang menyediakan quick insight — lihat PRD dan SYSTEM_DESIGN untuk detail. Web tetap menjadi primary system.

### Dual Mode UX

UI web mendukung konsep **Dual Mode Experience**:

- **Deep Mode (Web):** Analisis mendalam, kontrol penuh, eksplorasi data, konfigurasi, CRUD, reporting detail. Digunakan oleh semua pengguna: owner, admin, staff.
- **Quick Mode (WhatsApp):** Tanya cepat, monitoring ringkas, insight instan. Hanya untuk owner. Didesain di luar scope dokumen ini (lihat PRD).

Web harus memberikan pengalaman lengkap dan memuaskan bagi owner. Owner **tidak boleh merasa harus berpindah ke WhatsApp** untuk mendapatkan informasi yang seharusnya tersedia di web.

---

## 2. Ringkasan Analisis Dokumen Sumber

### 2.1 Implikasi dari DESKRIPSI_PROJECT.md

1. Web dipakai terutama oleh staff dan admin untuk pekerjaan operasional harian.
2. Sistem harus terasa sederhana, tidak seperti ERP enterprise yang berat.
3. Owner bukan target utama dashboard kompleks, sehingga UI web tidak boleh dibebani elemen analitik berlebihan.
4. UI perlu mendukung banyak jenis bisnis, sehingga istilah yang tampil harus dapat mengikuti konfigurasi tenant.

### 2.2 Implikasi dari PRD.md

1. Role minimal adalah owner, admin, dan staff.
2. Pengguna hanya boleh melihat menu dan aksi sesuai role dan permission.
3. Staff membutuhkan UI yang sederhana, cepat, dan relevan dengan tugasnya.
4. Admin membutuhkan dashboard operasional, pengelolaan data inti, user, dan konfigurasi dasar.
5. Reporting web bersifat operasional dasar, bukan BI dashboard enterprise.
6. Error handling harus user-friendly.
7. Web harus responsif untuk penggunaan harian.

### 2.3 Implikasi dari SYSTEM_DESIGN.md

1. React Web App adalah antarmuka operasional untuk admin dan staff.
2. Permission-aware navigation merupakan requirement eksplisit.
3. Web harus berbagi domain model yang sama dengan backend, tetapi UI tidak boleh memantulkan kompleksitas teknis backend secara mentah.
4. Tenant context dan permission check final tetap terjadi di backend, namun UI harus menyajikan pengalaman navigasi yang sesuai izin akses.

---

## 3. Prinsip UI

1. Operational first: layar harus membantu user menyelesaikan pekerjaan, bukan mengagumi dashboard.
2. Simple by default: tampilan awal harus ringkas, fokus, dan tidak menampilkan terlalu banyak elemen sekaligus.
3. Role-aware: menu, shortcut, CTA, dan halaman mengikuti role dan permission.
4. Consistent shell: sidebar, navbar, konten utama, header halaman, filter bar, dan action area harus punya pola tetap.
5. No redundancy: satu informasi utama cukup muncul di satu tempat yang paling logis.
6. No developer-centric language: hindari istilah seperti entity, payload, UUID, raw status code, sync failed exception, atau internal module name.
7. Business-readable: gunakan istilah yang bisa dipahami admin dan staff non-teknis.
8. Fast scanning: informasi penting harus mudah dipindai dalam 3 sampai 5 detik.
9. Progressive disclosure: detail lanjutan ditampilkan hanya saat diperlukan.
10. Mobile-tolerant: walau penggunaan utama desktop, UI tetap harus usable di tablet dan mobile horizontal/vertikal.

---

## 4. Target Pengguna Web

### 4.1 Owner

Owner adalah pengguna web dengan akses penuh sesuai role-nya. Web adalah jalur utama owner untuk kontrol mendalam dan analisis bisnis (Deep Mode). WhatsApp melengkapi pengalaman owner sebagai quick insight saat tidak sempat buka web.

Fokus UI owner:

1. melihat dashboard operasional yang informatif,
2. melihat laporan dan analisis data bisnis,
3. memantau order, stok, dan kondisi operasional,
4. melakukan konfigurasi dan kontrol bisnis sesuai kebutuhan,
5. mendapatkan pengalaman web yang lengkap dan memuaskan tanpa perlu beralih ke WhatsApp.

### 4.2 Admin

Admin adalah pengguna web dengan cakupan paling luas.

Fokus UI admin:

1. monitoring operasional,
2. pengelolaan master data,
3. pengelolaan user dan role,
4. konfigurasi tenant dasar,
5. knowledge management.

### 4.3 Staff

Staff adalah pengguna harian dengan kebutuhan task-oriented.

Fokus UI staff:

1. melihat pekerjaan yang harus dikerjakan,
2. membuat dan memperbarui order,
3. melihat stok dan perubahannya,
4. menggunakan UI yang cepat dan minim keputusan yang tidak relevan.

---

## 5. Struktur Layout Global

Rancangan web menggunakan app shell tetap dengan tiga area utama:

1. Sidebar di kiri untuk navigasi utama.
2. Navbar di atas untuk konteks halaman dan akses profil.
3. Content area di kanan untuk isi modul.

Struktur dasar:

```text
+--------------------------------------------------------------+
| Navbar                                            Avatar  v |
+-------------+------------------------------------------------+
| Sidebar     | Header Halaman                                 |
| - Menu      | Filter / Summary / Actions                     |
| - Menu      |------------------------------------------------|
| - Menu      | Content Area                                   |
| - Menu      | Table / Cards / Form / Detail                  |
|             |                                                |
+-------------+------------------------------------------------+
```

### 5.1 Sidebar

Sidebar adalah sumber navigasi utama. Sidebar tidak boleh berisi aksi mikro, shortcut acak, atau menu ganda dengan tujuan sama.

Aturan sidebar:

1. Selalu tampil konsisten di desktop.
2. Dapat collapse ke mode icon-only bila dibutuhkan.
3. Pada tablet/mobile, berubah menjadi drawer.
4. Urutan menu mengikuti prioritas kerja, bukan urutan tabel database.
5. Menu yang tidak memiliki izin akses tidak ditampilkan.
6. Menu aktif harus memiliki highlight yang jelas.
7. Gunakan label bisnis yang mudah dimengerti.

Struktur kelompok menu yang direkomendasikan:

1. Dashboard
2. Operasional
3. Master Data
4. Monitoring & Reporting
5. Pengaturan

### 5.2 Navbar

Navbar bersifat tipis, bersih, dan tidak penuh fitur.

Isi navbar:

1. Judul halaman atau breadcrumb singkat di sisi kiri.
2. Opsional quick context seperti nama tenant atau cabang aktif bila nanti dibutuhkan.
3. Avatar user di sisi kanan.
4. Saat avatar diklik, tampil dropdown sederhana.

Isi dropdown avatar minimal:

1. nama user,
2. role aktif (tampilkan badge: "Owner", "Admin", atau "Staff"),
3. **Ganti Role** — tampil hanya jika user memiliki lebih dari 1 role. Menampilkan daftar role lain yang bisa dipilih. Saat diklik, sidebar dan menu langsung berubah sesuai role baru tanpa reload halaman penuh,
4. menu Profil Saya bila nanti dibutuhkan,
5. menu Logout.

Contoh tampilan dropdown avatar:

```text
+---------------------------+
| Dimas Prasetio            |
| Role: Owner         [v]   |
|   > Switch ke Admin       |
|   > Switch ke Staff       |
|---------------------------|
| Profil Saya               |
| Logout                    |
+---------------------------+
```

Aturan role switcher:

1. Jika user hanya punya 1 role, bagian "Ganti Role" tidak ditampilkan.
2. Role aktif ditandai dengan badge atau highlight.
3. Saat switch, frontend memanggil `POST /api/v1/auth/switch-role` lalu refresh sidebar dengan permission baru.
4. Tidak perlu logout dan login ulang.

Catatan penting:

1. Logout tidak perlu muncul sebagai tombol terpisah di banyak tempat.
2. Logout cukup tersedia pada dropdown avatar untuk menghindari redundancy.
3. Navbar tidak menjadi tempat menaruh terlalu banyak tombol modul.

### 5.3 Content Area

Content area adalah tempat kerja utama. Setiap halaman harus mengikuti pola yang sama:

1. Page header.
2. Summary bar atau helper text bila perlu.
3. Filter/search section bila halaman list.
4. Primary content.
5. Secondary content hanya bila benar-benar dibutuhkan.

---

## 6. Dashboard Design

Dashboard harus menjadi dashboard operasional, bukan dashboard presentasi.

### 6.1 Tujuan Dashboard

1. Menunjukkan apa yang perlu diperhatikan sekarang.
2. Mempercepat akses ke modul kerja utama.
3. Menyediakan ringkasan universal lintas tenant.
4. Memberikan pengalaman informatif bagi owner yang login ke web.

### 6.2 Isi Dashboard

Komponen dashboard yang direkomendasikan:

1. Ringkasan metrik utama.
2. Daftar pekerjaan atau status yang perlu perhatian.
3. Shortcut ke modul operasional utama.
4. Aktivitas terbaru yang relevan.

Contoh kartu ringkasan universal:

1. Total order hari ini.
2. Order pending.
3. Order aktif.
4. Item stok kritis.

Contoh panel operasional:

1. Order terbaru yang perlu ditindaklanjuti.
2. Perubahan status terbaru.
3. Daftar item stok kritis.

### 6.3 Batas Dashboard

Dashboard tidak boleh:

1. menampilkan semua laporan dalam satu layar,
2. menjadi tempat semua tombol aksi sistem,
3. mengulang data yang lebih tepat ditampilkan di halaman modul,
4. memakai banyak chart yang tidak memberi tindakan lanjutan.

---

## 7. Navigasi Berbasis Role

Navigasi ditentukan oleh permission, tetapi secara UX dapat dimulai dari baseline per role.

### 7.1 Menu Dasar Owner

Owner web melihat menu yang sesuai dengan kebutuhan deep control:

1. Dashboard
2. Order
3. Stok
4. Laporan
5. Produk / Item (bila dibutuhkan)

Owner tidak perlu melihat menu teknis atau konfigurasi berat secara default. Namun dashboard dan reporting harus informatif dan berguna agar owner tidak merasa perlu beralih ke WhatsApp untuk insight.

### 7.2 Menu Dasar Admin

Admin dapat melihat menu yang lebih lengkap:

1. Dashboard
2. Order
3. Produk / Item
4. Stok
5. Laporan
6. Pengguna
7. Knowledge Base
8. Pengaturan Tenant

### 7.3 Menu Dasar Staff

Staff hanya melihat modul yang relevan dengan pekerjaan harian:

1. Dashboard
2. Order
3. Produk / Item bila memang diperlukan role-nya
4. Stok bila memang diperlukan role-nya

### 7.4 Aturan Permission UX

1. Menu tanpa izin tidak ditampilkan.
2. Aksi tanpa izin tidak ditampilkan atau dinonaktifkan dengan penjelasan yang jelas sesuai konteks.
3. Jangan tampilkan halaman kosong hanya karena user tidak punya akses.
4. Jika URL diakses langsung tanpa izin, tampilkan halaman akses ditolak yang human-readable.

---

## 8. Pola Halaman yang Direkomendasikan

### 8.1 Halaman List

Digunakan untuk Order, Produk, Stok, User, Knowledge, dan data lain yang serupa.

Struktur:

1. Judul halaman dan deskripsi singkat.
2. Search bar tunggal.
3. Filter yang benar-benar penting.
4. Tabel atau card list.
5. Pagination atau load more.
6. Tombol aksi utama seperti Tambah Order atau Tambah Produk.

Aturan:

1. Hindari terlalu banyak filter di awal.
2. Filter lanjutan ditempatkan dalam panel tambahan atau drawer.
3. Kolom tabel hanya menampilkan informasi yang dibutuhkan untuk pengambilan keputusan cepat.
4. ID internal tidak ditampilkan sebagai kolom utama.

### 8.2 Halaman Detail

Digunakan untuk melihat satu entitas secara lengkap.

Struktur:

1. Header dengan nama atau nomor referensi utama.
2. Status badge yang jelas.
3. Info utama di bagian atas.
4. Section detail terpisah berdasarkan konteks.
5. Timeline atau histori bila relevan.

Contoh untuk Order Detail:

1. nomor order,
2. status saat ini,
3. pihak terkait,
4. daftar item,
5. histori status,
6. catatan operasional.

### 8.3 Halaman Form

Digunakan untuk create dan edit.

Aturan:

1. Satu halaman form untuk satu tujuan utama.
2. Kelompok field berdasarkan makna bisnis, bukan nama tabel.
3. Label field harus business-readable.
4. Penjelasan tambahan ditempatkan sebagai helper text singkat.
5. Validasi tampil dekat field, bukan hanya di toast global.
6. Tombol primer dan sekunder harus konsisten posisinya.

### 8.4 Halaman Monitoring / Reporting

Digunakan untuk laporan operasional dasar.

Aturan:

1. Tampilkan ringkasan dulu, detail kemudian.
2. Gunakan tabel dan summary cards sebagai komponen utama.
3. Chart hanya dipakai jika memang membantu pembacaan tren.
4. Hindari dashboard analitik berat yang bertentangan dengan arah produk.

Catatan Stock MVP:

1. UI stok pada MVP **tidak menampilkan selector atau filter lokasi stok**.
2. Semua data stok ditampilkan tanpa breakdown per lokasi (karena hanya single-location).
3. Multi-location UI akan ditambahkan di fase selanjutnya ketika fitur diaktifkan via feature flag.

---

## 9. Aturan Anti-Redundancy

UI harus menghindari pengulangan informasi dan aksi yang tidak perlu.

### 9.1 Redundancy yang Harus Dihindari

1. Tombol logout di sidebar, navbar, dan halaman profil sekaligus.
2. Menu dashboard dan home yang menuju layar yang sama.
3. Menampilkan status yang sama dalam badge, text, subtitle, dan card terpisah tanpa nilai tambah.
4. Menampilkan metrik ringkasan yang sama di dashboard dan di atas setiap halaman list tanpa alasan.
5. Tombol Tambah, Buat Baru, dan Create yang semuanya memicu aksi sama dalam satu layar.

### 9.2 Strategi Mengurangi Redundancy

1. Satu aksi primer utama per halaman.
2. Satu lokasi utama untuk logout, yaitu dropdown avatar.
3. Satu pola filter untuk semua halaman list.
4. Satu pola status badge lintas modul.
5. Satu pola page header lintas modul.

---

## 10. Aturan Agar UI Tidak Developer-Centric

Bagian ini wajib dijadikan guardrail implementasi.

### 10.1 Bahasa dan Label

Gunakan label seperti:

1. Produk atau Item, bukan entity item master.
2. Status Pesanan, bukan order state machine.
3. Riwayat Status, bukan status transition logs.
4. Pengguna, bukan user records.
5. Pengaturan Bisnis, bukan tenant config payload.

Hindari menampilkan:

1. UUID atau binary ID,
2. istilah internal backend,
3. nama enum mentah,
4. kode error teknis mentah,
5. struktur JSON mentah kecuali di area admin teknis yang memang sangat khusus.

### 10.2 Penyajian Data

1. Tampilkan nomor referensi bisnis, bukan primary key.
2. Tampilkan waktu dalam format lokal yang mudah dibaca user.
3. Gunakan badge, label, dan grouping yang sesuai bahasa operasional tenant.
4. Jika sistem memakai istilah generik internal, UI harus memetakan ke istilah tenant-facing.

### 10.3 Error Handling

Contoh pendekatan yang benar:

1. Gagal memuat data order. Coba lagi beberapa saat.
2. Anda tidak memiliki akses ke halaman ini.
3. Data yang dimasukkan belum lengkap.

Contoh yang harus dihindari:

1. 403 forbidden permission denied.
2. invalid payload schema.
3. null reference on status mapping.

---

## 11. Design Rules per Komponen Utama

### 11.1 Sidebar Item

1. Ikon sederhana dan konsisten.
2. Label pendek, maksimal 1 sampai 2 kata bila memungkinkan.
3. Active state jelas.
4. Hover state jelas.
5. Tidak memakai badge notifikasi berlebihan kecuali benar-benar aksiable.

### 11.2 Navbar Avatar Menu

1. Avatar selalu tampil di kanan atas.
2. Dropdown kecil dan fokus.
3. Logout mudah ditemukan.
4. Tidak perlu submenu berlapis.

### 11.3 Status Badge

1. Warna harus konsisten lintas modul.
2. Label status mengikuti istilah tenant-facing.
3. Jangan gunakan warna sebagai satu-satunya penanda.
4. Badge harus tetap terbaca dalam mode kontras rendah sekalipun.

### 11.4 Search dan Filter

1. Search tunggal di posisi konsisten.
2. Filter utama tampil langsung.
3. Filter tambahan tidak memadati header.
4. Reset filter harus mudah.

### 11.5 Table

1. Kolom penting di kiri.
2. Aksi row tidak terlalu banyak.
3. Gunakan sticky header bila perlu.
4. Empty state harus memberi arahan tindakan berikutnya.

### 11.6 Form Action Area

1. Tombol primer seperti Simpan.
2. Tombol sekunder seperti Batal.
3. Tombol destruktif seperti Arsipkan dipisahkan secara visual.
4. Jangan mencampur terlalu banyak tombol setara dalam satu baris.

---

## 12. Responsive Behavior

### 12.1 Desktop

1. Sidebar tetap terlihat.
2. Navbar tetap horizontal.
3. Content area memakai grid yang efisien.

### 12.2 Tablet

1. Sidebar dapat collapse atau berubah jadi overlay.
2. Dashboard card dapat turun menjadi 2 kolom atau 1 kolom sesuai ruang.
3. Tabel lebar dapat memakai horizontal scroll yang terkendali.

### 12.3 Mobile

1. Sidebar menjadi drawer.
2. Navbar tetap sederhana.
3. Filter berat dipindah ke bottom sheet atau drawer.
4. Tabel kompleks bisa berubah menjadi card list bila perlu.

Catatan:

1. Mobile harus usable, tetapi optimasi utama tetap untuk desktop operasional.
2. Jangan memindahkan semua informasi dashboard ke mobile bila membuat layar menjadi terlalu padat.

---

## 13. Konfigurasi Tenant pada UI

UI harus mendukung variasi tenant tanpa mengubah struktur inti.

Yang boleh berubah lewat konfigurasi:

1. label istilah bisnis,
2. label status,
3. warna badge ringan,
4. urutan prioritas status ringan,
5. preferensi tampilan sederhana.

Yang tidak boleh berubah lewat konfigurasi:

1. struktur layout utama,
2. pola navigasi dasar,
3. pola form inti,
4. perilaku akses berbasis permission.

---

## 14. Rekomendasi Implementasi Frontend

### 14.1 Struktur Komponen UI

Komponen shell yang direkomendasikan:

1. AppShell
2. Sidebar
3. SidebarSection
4. Navbar
5. AvatarMenu
6. PageHeader
7. SummaryCards
8. FilterBar
9. DataTable
10. EmptyState
11. ErrorState
12. ConfirmDialog

### 14.2 Pola Reuse

1. Semua halaman memakai shell yang sama.
2. Semua list memakai pola header, filter, content, pagination yang sama.
3. Semua form memakai pola section title, field group, helper text, dan action bar yang sama.
4. Semua status memakai komponen badge yang sama.

### 14.3 Hal yang Tidak Disarankan

1. Membuat layout berbeda-beda per modul tanpa alasan kuat.
2. Menaruh business logic permission yang terlalu kompleks hanya di frontend.
3. Menampilkan seluruh capability backend sebagai menu walau tidak relevan bagi user.
4. Menjadikan dashboard sebagai dumping ground semua widget.

---

## 15. Acceptance Criteria UI

Dokumen ini dianggap terpenuhi bila implementasi UI nantinya memenuhi hal berikut:

1. Web menggunakan app shell konsisten dengan sidebar di kiri dan navbar di atas.
2. Avatar user berada di kanan navbar dan menyediakan logout melalui dropdown.
3. Menu yang tampil mengikuti role dan permission.
4. Staff dapat memahami alur utama tanpa harus memahami istilah teknis sistem.
5. Dashboard menampilkan ringkasan operasional dasar yang informatif bagi semua role termasuk owner.
6. Owner mendapat pengalaman web yang lengkap dan memuaskan tanpa perlu beralih ke WhatsApp.
7. Tidak ada duplikasi menu, aksi primer, atau lokasi logout yang tidak perlu.
8. Istilah yang tampil ke user tidak developer-centric.
9. UI tetap usable pada desktop, tablet, dan mobile.
10. UI stok pada MVP tidak menampilkan selector lokasi stok.

---

## 16. Ringkasan Keputusan UI

Rancangan UI web untuk mini ERP ini mengambil pendekatan yang tegas namun pragmatis:

1. web difokuskan untuk semua pengguna termasuk owner,
2. owner mendapat akses web penuh (Deep Mode) — WhatsApp melengkapi sebagai quick insight (Quick Mode),
3. layout utama memakai sidebar plus navbar plus content area,
4. navigasi selalu berbasis role dan permission,
5. logout cukup melalui avatar menu di kanan navbar,
6. pola halaman dibuat seragam agar tidak redundant,
7. bahasa UI harus bisnis-friendly dan tidak developer-centric,
8. UI stok MVP tidak menampilkan complexity multi-location.

Dokumen ini menjadi acuan implementasi frontend agar aplikasi web terasa ringan, mudah digunakan, konsisten, dan sesuai arah produk mini ERP SaaS yang sudah didefinisikan dalam dokumen lain.