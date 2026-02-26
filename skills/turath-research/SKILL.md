---
name: turath-research
description: Skill untuk riset, terjemahan, dan eksplorasi 100,000+ kitab klasik Islam dari Turath.io. Gunakan skill ini saat user meminta riset literatur Islam, menerjemahkan teks Arab, mencari referensi kitab, atau membuat konten berdasarkan teks klasik.
---

# Turath Research Skill

Akses langsung ke perpustakaan Turath.io (100,000+ kitab klasik Islam) dan database metadata lokal untuk riset mendalam literatur Islam.

## Aturan Penting

1. **Selalu mulai dengan pencarian** — jangan menebak ID buku atau penulis. Cari dulu.
2. **Konfirmasi dulu sebelum kerja berat** — sebelum menerjemahkan atau riset panjang, pastikan buku dan halaman yang dimaksud sudah benar.
3. **Bersabar dan bertahap** — terjemahan dan riset kitab klasik butuh ketelitian. Kerjakan per halaman, jangan langsung banyak.
4. **Selalu sertakan referensi** — setiap kutipan harus menyebutkan nama kitab, penulis, jilid, dan halaman.

---

## File Lokasi

**PENTING:** Semua file referensi ada di direktori yang sama dengan SKILL.md ini. Jangan cari di tempat lain.

| File | Lokasi | Fungsi | Kapan Dibaca |
|------|--------|--------|--------------|
| `workflows/terjemahan.md` | Direktori ini | Langkah detail terjemahan kitab | Saat user minta **terjemahkan** |
| `workflows/riset.md` | Direktori ini | Langkah detail riset topik Islam | Saat user minta **riset/cari hukum** |
| `workflows/konten.md` | Direktori ini | Langkah detail buat konten | Saat user minta **buat materi/konten** |
| `templates/terjemahan.md` | Direktori ini | Format baku output terjemahan | Saat menerjemahkan |
| `templates/riset.md` | Direktori ini | Format baku output riset | Saat output riset |
| `templates/konten.md` | Direktori ini | Format baku output konten | Saat output konten |
| `examples/01-terjemahan-kitab.md` | Direktori ini | Contoh percakapan terjemahan | Referensi cara interaksi |
| `examples/02-riset-hukum-fiqih.md` | Direktori ini | Contoh riset hukum 4 mazhab | Referensi cara riset |
| `examples/03-cari-hadits.md` | Direktori ini | Contoh pencarian hadits | Referensi cara cari hadits |
| `examples/04-eksplorasi-ulama.md` | Direktori ini | Contoh eksplorasi karya ulama | Referensi cara eksplorasi |
| `examples/05-konten-kajian.md` | Direktori ini | Contoh buat materi kajian | Referensi cara buat konten |
| `examples/06-perbandingan-kitab.md` | Direktori ini | Contoh perbandingan antar kitab | Referensi cara bandingkan |

### Cara Pakai File Referensi

- **Saat user minta terjemahkan:** baca `workflows/terjemahan.md` + `templates/terjemahan.md` + `examples/01-terjemahan-kitab.md`
- **Saat user minta riset:** baca `workflows/riset.md` + `templates/riset.md` + contoh yang relevan
- **Saat user minta buat konten:** baca `workflows/konten.md` + `templates/konten.md` + `examples/05-konten-kajian.md`

---

## Tools yang Tersedia

### 1. `turath_search` — Cari teks di perpustakaan

| Parameter | Wajib | Deskripsi |
|-----------|-------|-----------|
| `query` | Ya | Query pencarian dalam bahasa Arab |
| `precision` | Tidak | 0=luas (default), 3=persis |
| `category` | Tidak | Filter berdasarkan ID kategori |
| `author` | Tidak | Filter berdasarkan ID penulis |
| `page` | Tidak | Nomor halaman hasil pencarian |
| `sort_field` | Tidak | Urutan: "page_id" atau "death" |

### 2. `turath_get_book` — Info detail buku

| Parameter | Wajib | Deskripsi |
|-----------|-------|-----------|
| `book_id` | Ya | ID buku |
| `include` | Tidak | "indexes" untuk daftar isi |

### 3. `turath_get_page` — Ambil isi halaman

| Parameter | Wajib | Deskripsi |
|-----------|-------|-----------|
| `book_id` | Ya | ID buku |
| `page_number` | Ya | Nomor halaman |

### 4. `turath_get_book_file` — Download seluruh buku (JSON)

| Parameter | Wajib | Deskripsi |
|-----------|-------|-----------|
| `book_id` | Ya | ID buku |

### 5. `turath_get_author` — Biografi penulis

| Parameter | Wajib | Deskripsi |
|-----------|-------|-----------|
| `author_id` | Ya | ID penulis |

### 6. `turath_filter_ids` — Cari ID kategori/penulis berdasarkan nama Arab

| Parameter | Wajib | Deskripsi |
|-----------|-------|-----------|
| `category_name` | Tidak | Nama kategori dalam bahasa Arab |
| `author_name` | Tidak | Nama penulis dalam bahasa Arab |

### 7. `turath_list_categories` — Daftar semua kategori (~40)

Tanpa parameter.

### 8. `turath_list_authors` — Daftar semua penulis (~3,100)

Tanpa parameter.

---

## Routing: Kapan Pakai Workflow Mana

| User bilang... | Baca file | Aksi |
|----------------|-----------|------|
| "terjemahkan", "translate", "artikan" | `workflows/terjemahan.md` | Tanya kitab + halaman dulu |
| "riset", "cari hukum", "apa pendapat", "menurut mazhab" | `workflows/riset.md` | Pahami konteks, cari multi-sumber |
| "cari hadits", "hadits tentang" | `workflows/riset.md` | Cari matan + takhrij |
| "buatkan materi", "buat kajian", "ceramah", "artikel" | `workflows/konten.md` | Riset dulu, lalu susun konten |
| "siapa [ulama]", "karya [ulama]" | Langsung pakai tools | `filter_ids` → `get_author` |
| "buku apa", "cari kitab" | Langsung pakai tools | `search` → `get_book` |
| "daftar kategori/penulis" | Langsung pakai tools | `list_categories` / `list_authors` |

---

## Prinsip Utama

### Terjemahan
- **SELALU tanya dulu**: kitab apa, halaman berapa
- **SELALU bertahap**: per halaman, jangan sekaligus
- **SELALU bilingual**: tampilkan Arab + terjemahan
- **SELALU minta user bersabar**: "Mohon bersabar, menerjemahkan kitab klasik membutuhkan ketelitian"

### Riset
- **SELALU dari sumber primer**: kitab asli ulama
- **SELALU multi-sumber**: minimal 2-3 referensi untuk topik khilafiyah
- **SELALU jujur**: jika ada perbedaan pendapat, sebutkan semua
- **SELALU sertakan kutipan Arab**: setiap klaim harus ada teks asli

### Konten
- **SELALU dari kitab**: jangan mengarang, harus ada sumber
- **SELALU sesuai konteks**: ceramah ≠ artikel ≠ media sosial
- **SELALU tawarkan revisi**: tanya user mau disesuaikan atau tidak

---

## Tips Pencarian

- Gunakan **kata kunci Arab** untuk hasil terbaik
- `precision: 0` untuk pencarian luas, `precision: 2-3` untuk frasa persis
- `turath_filter_ids` dulu → dapat ID → baru `turath_search` dengan filter
- `turath_get_book_file` HANYA untuk seluruh buku — untuk 1-5 halaman pakai `turath_get_page`
- Jika tidak ketemu, coba variasi ejaan Arab (dengan/tanpa ال, dengan/tanpa tasydid)

---

## Database Lokal

Plugin menggunakan database SQLite lokal (`data/turath_metadata.db`) berisi:
- ~40 kategori kitab
- ~3,100 penulis dengan tahun wafat
- Metadata buku termasuk link PDF dan link Shamela

Akses metadata offline dan memperkaya hasil API dengan informasi tambahan.
