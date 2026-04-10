# UI Design Document

## 1. Tujuan Dokumen

Dokumen ini menjelaskan rancangan UI web untuk mini ERP dengan asumsi:

1. satu perusahaan,
2. banyak cabang,
3. web sebagai sistem utama,
4. permission-aware navigation,
5. branch-aware operation.

---

## 2. Prinsip UI

1. Operational first
2. Simple by default
3. Role-aware
4. Branch-aware
5. Consistent shell
6. No redundancy
7. Business-readable
8. Progressive disclosure
9. Mobile-tolerant

---

## 3. Target Pengguna

### 3.1 Owner

- kontrol penuh via web,
- monitoring cepat via WhatsApp,
- butuh dashboard dan reporting yang berguna.

### 3.2 Admin

- mengelola data master, user, dan konfigurasi,
- memantau operasional lintas cabang yang diizinkan.

### 3.3 Staff

- fokus pada tugas harian,
- bekerja pada cabang aktif,
- memerlukan UI cepat dan minim distraksi.

---

## 4. Struktur Layout Global

Layout dasar tetap:

1. Sidebar kiri
2. Navbar atas
3. Content area utama

### 4.1 Sidebar

Aturan:

1. menu mengikuti permission,
2. tidak memuat aksi mikro,
3. urutan menu mengikuti alur kerja,
4. tidak menampilkan menu tanpa izin.

### 4.2 Navbar

Isi minimum:

1. breadcrumb atau judul halaman,
2. nama perusahaan,
3. badge cabang aktif,
4. avatar user,
5. role switcher bila user punya lebih dari satu role,
6. branch switcher bila user punya lebih dari satu cabang.

Branch switcher harus ringan dan tidak memerlukan logout.

### 4.3 Content Area

Pola umum:

1. page header,
2. helper text atau summary bila perlu,
3. filter/search,
4. primary content,
5. action area yang jelas.

---

## 5. Dashboard Design

Dashboard adalah dashboard operasional, bukan dashboard presentasi.

### 5.1 Tujuan Dashboard

1. menunjukkan apa yang perlu diperhatikan sekarang,
2. memberi shortcut ke modul utama,
3. menunjukkan konteks cabang aktif,
4. membantu owner dan admin memantau operasional dengan cepat.

### 5.2 Isi Dashboard

1. total order hari ini,
2. order pending,
3. order aktif,
4. item stok kritis,
5. daftar order yang perlu tindakan,
6. panel stok kritis.

### 5.3 Branch Context di Dashboard

1. dashboard default menampilkan data cabang aktif,
2. jika owner/admin punya akses ke banyak cabang, branch switcher di navbar menjadi jalur resmi untuk berpindah konteks,
3. dashboard tidak boleh mencampur data cabang berbeda tanpa penanda yang jelas.

---

## 6. Navigasi Berbasis Role

### 6.1 Owner

1. Dashboard
2. Order
3. Produk
4. Stok
5. Laporan
6. Pengguna
7. Knowledge
8. Pengaturan
9. WhatsApp
10. Audit Log

### 6.2 Admin

1. Dashboard
2. Order
3. Produk
4. Stok
5. Laporan
6. Pengguna
7. Knowledge
8. Pengaturan

### 6.3 Staff

1. Dashboard
2. Order
3. Produk bila diizinkan
4. Stok bila diizinkan

---

## 7. Aturan Permission UX

1. Menu tanpa izin tidak ditampilkan.
2. Aksi tanpa izin tidak ditampilkan atau dinonaktifkan dengan penjelasan singkat.
3. URL yang diakses langsung tanpa izin harus menampilkan halaman 403 yang human-readable.

---

## 8. Pola Halaman

### 8.1 Halaman List

Dipakai untuk order, produk, stok, user, knowledge, audit log.

Struktur:

1. judul,
2. search,
3. filter penting,
4. tabel atau list,
5. pagination,
6. satu aksi primer.

### 8.2 Halaman Detail

Dipakai untuk order, produk, dan detail stok item.

### 8.3 Halaman Form

Aturan:

1. satu tujuan utama per halaman,
2. field dikelompokkan berdasarkan makna bisnis,
3. validasi tampil dekat field,
4. tombol primer dan sekunder konsisten.

### 8.4 Halaman Monitoring / Reporting

1. ringkasan dahulu,
2. detail setelahnya,
3. data default mengikuti cabang aktif,
4. tidak menjadi BI dashboard berat.

---

## 9. Branch-Aware UX Rules

1. User harus selalu tahu cabang aktif saat ini.
2. Branch aktif harus tampil jelas di navbar.
3. Jika user berpindah cabang, sidebar tidak berubah, tetapi data halaman harus berubah sesuai context baru.
4. Jika halaman saat ini tidak valid setelah switch cabang, user diarahkan ke dashboard.
5. Form operasional tidak menampilkan field `branch_id` bila cabang aktif sudah dipilih dari session.

---

## 10. Aturan Anti-Redundancy

Hindari:

1. tombol logout di banyak tempat,
2. menu ganda ke halaman yang sama,
3. badge status berulang tanpa nilai tambah,
4. aksi create yang tersebar terlalu banyak,
5. branch selector di banyak tempat.

Branch selection resmi cukup di:

1. halaman `/select-branch` setelah login bila diperlukan,
2. branch switcher di navbar.

---

## 11. Aturan Bahasa UI

Gunakan istilah:

1. Produk / Item
2. Pesanan / Order
3. Riwayat Status
4. Pengguna
5. Pengaturan Perusahaan
6. Cabang Aktif

Hindari istilah:

1. istilah teknis internal (gunakan `branch` untuk context scoping),
2. payload,
3. UUID,
4. raw status code,
5. istilah backend mentah.

---

## 12. Responsive Behavior

### Desktop

- sidebar tetap terlihat,
- navbar horizontal,
- branch switcher ada di navbar.

### Tablet

- sidebar dapat collapse,
- cards turun menjadi 2 kolom,
- tabel dapat scroll horizontal.

### Mobile

- sidebar menjadi drawer,
- filter kompleks pindah ke drawer atau bottom sheet,
- branch switcher tetap tersedia tetapi ringkas.

---

## 13. Acceptance Criteria UI

Dokumen ini terpenuhi bila:

1. web memakai app shell konsisten,
2. role switcher dan branch switcher tersedia di navbar bila relevan,
3. dashboard menampilkan data cabang aktif secara jelas,
4. user tidak kebingungan context cabang saat bekerja,
5. semua interface menggunakan istilah `branch` untuk clarity,
6. UI stok MVP tidak menampilkan selector lokasi stok.

---

## 14. Ringkasan

UI web tetap mempertahankan struktur dan skala produk yang sama, tetapi direvisi agar:

1. bekerja untuk satu perusahaan,
2. branch-aware,
3. tetap sederhana bagi staff,
4. tetap informatif bagi owner dan admin,
5. dirancang khusus untuk model single company + multi-branch.
