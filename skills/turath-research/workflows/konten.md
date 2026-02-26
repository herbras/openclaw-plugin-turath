# Workflow: Pembuatan Konten

Langkah-langkah saat user meminta dibuatkan konten (kajian, artikel, media sosial) berbasis kitab klasik.

---

## Langkah 1: Pahami Kebutuhan Konten

| Pertanyaan | Opsi |
|------------|------|
| Jenis konten? | Ceramah, artikel, thread, quote, makalah |
| Topik apa? | Spesifik (misal: "hukum riba") atau umum ("tentang sabar") |
| Target audiens? | Umum, mahasiswa, anak muda, akademisi |
| Durasi/panjang? | 10 menit, 20 menit, 1000 kata, 5 slide |
| Gaya bahasa? | Nasihat, akademis, inspiratif, informatif |

**Jika user tidak menyebutkan:** asumsikan kajian umum, bahasa Indonesia, audiens umum.

---

## Langkah 2: Riset Bahan

```
1. turath_search { query: "[topik dalam Arab]" }
2. Pilih 2-4 sumber utama dari hasil pencarian
3. turath_get_page untuk setiap sumber → ambil kutipan terbaik
4. Cari juga: ayat Al-Quran, hadits, dan kisah yang relevan
```

**Prinsip pemilihan sumber:**
- Pilih kitab yang **terkenal** dan **diakui** oleh audiens target
- Variasi sumber: gabungkan tafsir + hadits + fiqih + adab
- Prioritaskan kutipan yang **ringkas dan kuat** (bisa diucapkan di ceramah)

---

## Langkah 3: Susun Struktur Konten

### Ceramah / Kajian
```
1. Pembukaan (hamdalah + shalawat + pengantar) — 2 menit
2. Dalil utama (ayat/hadits pembuka) — 3 menit
3. Isi (2-4 poin + kutipan kitab) — 10-15 menit
4. Kisah/teladan — 3 menit
5. Penutup (rangkuman + doa) — 2 menit
```

### Artikel
```
1. Judul yang menarik
2. Pendahuluan (hook + konteks)
3. Isi (3-5 sub-bagian + kutipan)
4. Kesimpulan
5. Daftar referensi
```

### Media Sosial (Thread/Carousel)
```
1. Slide/tweet pembuka (hook kuat)
2. 3-5 poin utama (1 kutipan per poin)
3. Slide penutup (kesimpulan + CTA)
4. Sumber referensi
```

### Quote / Poster
```
1. Cari kutipan pendek dan kuat dari kitab
2. Format: Arab + terjemahan + nama ulama
```

---

## Langkah 4: Tulis Konten

Ikuti template dari `templates/konten.md`.

**Prinsip penulisan:**
- Setiap klaim **harus** punya sumber dari kitab
- Teks Arab asli **harus** ada untuk kutipan utama
- Bahasa disesuaikan dengan konteks audiens
- Jangan terlalu panjang — lebih baik ringkas tapi berisi
- Sisipkan kisah/teladan agar tidak membosankan

---

## Langkah 5: Review dan Penyesuaian

Setelah output, tanya user:
> "Materi sudah jadi. Mau disesuaikan?
> - Ditambah dalil?
> - Diperpanjang/dipersingkat?
> - Ganti gaya bahasa?
> - Tambah slide/poin?"

---

## Contoh Tool Call Flow per Jenis Konten

### Ceramah tentang "Tawakkal"
```
turath_search { query: "التوكل على الله" }
  → dapat snippet dari beberapa kitab

turath_search { query: "المتوكلين", precision: 1 }
  → cari ayat/hadits tentang orang yang bertawakkal

turath_get_page { book_id: [ihya], page_number: [bab tawakkal] }
  → ambil pembahasan Al-Ghazali tentang tawakkal

turath_get_page { book_id: [madarij], page_number: [bab tawakkal] }
  → ambil pembahasan Ibnu Qayyim tentang manzilah tawakkal
```

### Quote Instagram dari Imam Asy-Syafi'i
```
turath_filter_ids { author_name: "الشافعي" }
  → dapat author ID

turath_search { query: "الشافعي", author: [id] }
  → cari kutipan-kutipan dari kitab beliau

turath_get_page { book_id: [diwan], page_number: [beberapa halaman] }
  → cari bait syair atau kata hikmah yang pendek dan kuat
```

### Artikel akademis tentang "Maqashid Syariah"
```
turath_filter_ids { category_name: "أصول الفقه" }
  → dapat category ID

turath_search { query: "مقاصد الشريعة", category: [usul_fiqh_id] }
  → cari pembahasan maqashid dari berbagai kitab ushul fiqih

turath_filter_ids { author_name: "الشاطبي" }
  → cari karya Al-Syathibi (Al-Muwafaqat)

turath_get_book { book_id: [muwafaqat], include: "indexes" }
  → ambil daftar isi untuk navigasi ke bab maqashid
```
