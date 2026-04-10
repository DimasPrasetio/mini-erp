Sistem yang akan dibangun adalah sebuah SaaS mini ERP berbasis monorepo dengan stack React untuk frontend dan NestJS untuk backend, yang dirancang untuk membantu bisnis yang operasionalnya masih berjalan secara manual agar dapat beralih ke sistem yang lebih tertata tanpa kehilangan kenyamanan dalam pengawasan oleh owner. Fokus utama sistem ini bukan menjadi ERP besar yang rumit, melainkan menjadi sistem operasional yang cukup sederhana untuk dipakai oleh tim atau karyawan sehari-hari, namun tetap memiliki nilai strategis tinggi karena owner dapat mengakses kontrol bisnis secara penuh melalui web sekaligus melakukan monitoring cepat melalui WhatsApp.

## Sistem Utama dan Jalur Akses

Produk ini memiliki dua jalur akses yang saling melengkapi:

1. **Web Application (Primary System)** — Sistem utama yang menyediakan kontrol penuh atas seluruh operasional bisnis. Semua pengguna termasuk owner, admin, dan staff menggunakan web untuk aktivitas inti seperti pengelolaan produk, pencatatan order, pengelolaan stok, konfigurasi bisnis, manajemen pengguna, monitoring, dan reporting. Web adalah satu-satunya jalur untuk melakukan aksi kritikal dan write-heavy operations.

2. **WhatsApp Owner Assistant (Secondary Interface)** — Jalur akses cepat yang ditujukan untuk owner saat tidak sempat membuka web. WhatsApp digunakan untuk mendapatkan insight instan, monitoring ringkas, dan tanya jawab seputar kondisi bisnis. WhatsApp bersifat read-heavy dan tidak menggantikan fungsi utama web.

## Dual Mode Experience

Sistem ini menghadirkan dua mode pengalaman yang saling melengkapi:

- **Deep Mode (Web)** — Untuk analisis mendalam, kontrol penuh, eksplorasi data, konfigurasi, dan seluruh operasional bisnis. Ini adalah mode utama untuk semua pengguna.
- **Quick Mode (WhatsApp)** — Untuk tanya cepat, monitoring ringkas, dan insight instan saat owner membutuhkan informasi tanpa harus membuka dashboard web.

## Operasional Web

Pada sisi operasional, seluruh pengguna termasuk owner menggunakan aplikasi web untuk menjalankan aktivitas inti bisnis seperti pengelolaan produk, pencatatan order, pengelolaan stok, perubahan status pesanan, serta kebutuhan monitoring dan reporting. Sistem ini dirancang agar cocok digunakan oleh berbagai jenis bisnis dengan pendekatan core module yang universal, seperti product, order, stock, user, dan reporting, lalu diperkuat dengan lapisan konfigurasi bisnis agar beberapa perbedaan flow antar jenis usaha tetap bisa diakomodasi tanpa perlu membangun ulang sistem dari nol. Dengan pendekatan ini, sistem tetap generik untuk kebutuhan SaaS, tetapi masih fleksibel jika ada kebutuhan enhancement yang spesifik pada tenant tertentu.

## Owner Assistant via WhatsApp

Sebagai pelengkap akses web, owner dapat berinteraksi melalui WhatsApp untuk mendapatkan insight bisnis secara cepat, dengan format pertanyaan yang fleksibel dan natural, tanpa harus menghafal command yang kaku. WhatsApp hanya digunakan untuk kebutuhan read-heavy seperti monitoring, Q&A, dan insight — bukan untuk menggantikan web sebagai jalur operasional utama. Untuk mewujudkan hal ini, WhatsApp akan dihubungkan menggunakan Baileys sebagai gateway, lalu pesan owner diproses oleh backend NestJS melalui lapisan owner assistant. Di dalam lapisan ini terdapat message router yang dapat menjalankan tiga mode engine: `bot` (aturan dan algoritma internal tanpa AI eksternal), `ai` (menggunakan OpenAI sebagai reasoning engine), dan `hybrid` (bot menangani intent rutin, AI dipakai untuk pertanyaan yang lebih kompleks atau knowledge-based). Baik bot maupun AI tidak diberi akses langsung ke database, melainkan hanya dapat menggunakan sekumpulan tool internal berbentuk API/service yang sudah didefinisikan secara aman dan terbatas. Dengan mekanisme ini, sistem tetap cepat, aman, dan tidak bergantung penuh pada AI eksternal.

### Mode Engine Assistant

1. **Bot mode**: Menggunakan intent router, parser, aturan, dan algoritma internal. Cocok untuk query rutin seperti penjualan hari ini, order pending, stok kritis, atau ringkasan operasional.
2. **AI mode**: Menggunakan OpenAI untuk memahami pertanyaan natural yang lebih fleksibel, melakukan reasoning, dan menyusun jawaban yang lebih kontekstual.
3. **Hybrid mode**: Menggabungkan bot dan AI. Bot menangani pertanyaan rutin yang deterministik, sedangkan AI dipakai untuk pertanyaan kompleks, follow-up, knowledge/SOP, atau penyusunan jawaban yang membutuhkan reasoning lebih tinggi.

### Perilaku Assistant

Assistant pada sistem ini harus mengikuti aturan perilaku berikut:

1. **Default langsung jawab**: Assistant harus langsung memberikan jawaban yang ringkas dan to the point tanpa bertanya balik, kecuali situasi benar-benar ambigu.
2. **Data tidak lengkap**: Assistant menjawab dengan data yang tersedia, lalu menjelaskan keterbatasannya.
3. **Ambiguitas tinggi**: Assistant baru meminta klarifikasi jika pertanyaan benar-benar tidak bisa dipahami konteksnya.
4. **Hindari terlalu banyak tanya balik**: Owner tidak ingin sesi tanya jawab yang berlarut-larut.
5. **Format WhatsApp-friendly**: Output harus pendek, jelas, terstruktur, dan mudah dibaca di layar WhatsApp.

### Batasan WhatsApp vs Web

| Aspek | Web | WhatsApp |
|-------|-----|----------|
| Orientasi | Write-heavy, kontrol penuh | Read-heavy, insight & monitoring |
| Operasi | CRUD, konfigurasi, reporting detail | Q&A, ringkasan, monitoring cepat |
| Aksi kritikal | ✅ Diperbolehkan | ❌ Tidak diperbolehkan |
| Target user | Semua (owner, admin, staff) | Owner saja |
| Data mutation | ✅ Penuh | ⚠️ Opsional, hanya aksi ringan & aman |

## Karakter Assistant dan AI

Meskipun mode AI pada sistem ini dapat menggunakan API dari ChatGPT atau OpenAI sebagai engine, assistant tersebut tidak diposisikan sebagai ChatGPT umum yang terlihat seperti asisten publik. Seluruh pengalaman harus dirancang sebagai asisten pribadi milik owner sekaligus assistant internal perusahaan. Artinya, baik pada mode bot maupun mode AI, karakter, fungsi, dan konteks kerjanya dibuat khusus untuk memahami bisnis yang menggunakan sistem tersebut, mengenali istilah-istilah internal, memahami struktur operasional perusahaan, serta menjawab kebutuhan owner dalam konteks bisnisnya sendiri. Dengan pendekatan ini, pengalaman yang dirasakan owner bukan seperti sedang berbicara dengan chatbot publik, tetapi seperti sedang berbicara dengan asisten internal perusahaan yang memang bekerja untuk bisnisnya, memahami data operasionalnya, mengetahui SOP perusahaannya, dan membantu owner mengambil keputusan secara cepat dan praktis.

## Knowledge Non-Transaksional

Selain akses data operasional berbasis tool, sistem juga dapat memanfaatkan RAG AI dari OpenAI atau ChatGPT untuk menangani knowledge yang sifatnya non-transaksional, seperti SOP bisnis, definisi status, kebijakan retur, panduan penggunaan sistem, atau pertanyaan owner yang membutuhkan konteks dari dokumen bisnis. Jadi, data real-time seperti penjualan, order pending, stok kritis, atau performa harian akan tetap diambil dari API internal yang terstruktur, sedangkan RAG digunakan saat mode `ai` atau `hybrid` aktif untuk melengkapi kemampuan assistant dalam menjawab pertanyaan yang membutuhkan pengetahuan bisnis atau kebijakan operasional. Pendekatan ini membuat sistem lebih aman, lebih terkontrol, dan lebih mudah dikembangkan secara bertahap.

## Stock Management Scope

Untuk fase MVP, sistem beroperasi dengan **single stock location** per tenant secara operasional. Namun, struktur database tetap dirancang multi-location (future-ready) agar tidak perlu migrasi besar saat fitur multi-warehouse dibutuhkan di masa depan. Pada MVP, UI hanya menampilkan satu lokasi default dan tidak mengekspos kompleksitas multi-location kepada pengguna.

## Arsitektur

Secara arsitektur, sistem akan dibangun dalam bentuk monorepo agar pengelolaan frontend dan backend lebih rapi, terintegrasi, dan efisien. Frontend React akan menangani antarmuka web untuk seluruh pengguna termasuk owner, admin, dan staff, sedangkan NestJS akan menangani business logic, API internal, autentikasi, integrasi WhatsApp, owner assistant router, bot internal, AI orchestration, serta service layer untuk tiap modul inti. Dengan monorepo, pengembangan shared types, contract API, utility umum, dan standar struktur project dapat dijaga lebih konsisten. Ini penting agar sistem tetap maintainable saat berkembang dari MVP ke produk SaaS yang lebih matang.

## Kesimpulan

Secara keseluruhan, sistem ini adalah mini ERP modern yang ditujukan untuk menata operasional bisnis melalui web sebagai sistem utama, sambil memberi owner cara yang lebih praktis untuk melakukan monitoring cepat melalui WhatsApp melalui owner assistant sebagai secondary interface. Web menyediakan kontrol penuh dan deep access untuk semua pengguna, sementara WhatsApp menyediakan quick insight untuk owner yang sedang tidak sempat membuka web. Produk ini tidak dijual sekadar sebagai aplikasi pencatatan, tetapi sebagai sistem operasional yang membantu tim bekerja lebih terstruktur dan membantu owner mengambil keputusan dengan cepat baik melalui web maupun WhatsApp. Di saat yang sama, assistant di dalam sistem ini dapat berjalan sebagai bot internal, AI berbasis OpenAI, atau kombinasi hybrid, tetapi tetap hadir sebagai representasi asisten pribadi owner dan assistant internal perusahaan, bukan sekadar chatbot umum. Dengan fondasi React dan NestJS dalam monorepo, sistem ini dirancang untuk cepat dibangun, mudah dikembangkan, dan cukup fleksibel untuk melayani banyak jenis bisnis dalam model SaaS.
