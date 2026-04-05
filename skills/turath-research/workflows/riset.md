# Workflow: Riset Topik Islam

Langkah-langkah detail saat user meminta riset tentang topik Islam.

---

## Langkah 1: Pahami Konteks User

Sebelum mulai cari, pahami dulu:

| Pertanyaan | Pengaruh |
|------------|----------|
| Topik spesifik apa? | Menentukan kata kunci pencarian |
| Mazhab tertentu atau semua? | Filter pencarian |
| Untuk apa? (akademis, ceramah, pribadi) | Gaya dan kedalaman output |
| Sudah punya referensi awal? | Bisa langsung ke kitab tertentu |

**Jika user sudah spesifik** (misal: "hukum zakat emas menurut Syafi'i") → langsung ke Langkah 2.

**Jika user masih umum** (misal: "riset tentang sabar") → tanya konteks dulu:
> "Topik sabar ini sangat luas. Mau saya fokuskan ke aspek apa?
> - Definisi dan macam-macam sabar?
> - Keutamaan sabar dalam Al-Quran dan Hadits?
> - Pendapat ulama tertentu tentang sabar?
> - Sabar dalam konteks tertentu (musibah, ibadah, menjauhi maksiat)?"

---

## Langkah 2: Tentukan Strategi Pencarian

### Riset hukum fiqih → Cari per mazhab
```
1. turath_filter_ids { category_name: "الفقه" } → dapat category ID
2. Cari penulis tiap mazhab:
   - turath_filter_ids { author_name: "[ulama Hanafi]" }
   - turath_filter_ids { author_name: "[ulama Maliki]" }
   - turath_filter_ids { author_name: "[ulama Syafi'i]" }
   - turath_filter_ids { author_name: "[ulama Hanbali]" }
3. Search per mazhab:
   - turath_search { query: "[topik]", author: [id], category: [fiqh_id] }
```

### Riset hadits → Cari matan + syarah
```
1. turath_search { query: "[matan hadits]", precision: 2 }
2. Jika ditemukan → ambil halaman untuk konteks
3. Cari juga syarah: turath_search { query: "[kata kunci] شرح" }
```

### Riset tafsir → Cari ayat + tafsir
```
1. turath_filter_ids { category_name: "التفسير" }
2. turath_search { query: "[potongan ayat]", category: [tafsir_id] }
3. Cari di beberapa kitab tafsir berbeda untuk perbandingan
```

### Riset akidah → Cari di kitab-kitab akidah
```
1. turath_filter_ids { category_name: "العقيدة" }
2. turath_search { query: "[topik]", category: [aqidah_id] }
```

### Riset biografi → Cari penulis + kitab tarikh
```
1. turath_filter_ids { author_name: "[nama ulama]" }
2. turath_get_author { author_id: [id] }
3. turath_search { query: "[nama ulama]" } → cari di kitab-kitab tabaqat/tarajim
```

### Riset perbandingan kitab → Bandingkan metadata + isi
```
1. Cari kedua kitab: turath_search untuk masing-masing
2. Perbandingan cepat metadata: CLI `turath compare [id1] [id2]`
   → tampilkan penulis, kategori, tahun wafat, jumlah jilid, dll
3. Perbandingan isi: turath_get_book + turath_get_page untuk topik yang sama
```

---

## Langkah 3: Kumpulkan Data

Untuk setiap hasil pencarian yang relevan:

```
1. Catat book_id, halaman, dan snippet dari pencarian
2. turath_get_page { book_id: X, page_number: Y } untuk teks lengkap
3. Jika perlu konteks lebih: ambil halaman sebelum/sesudahnya
4. Catat kutipan penting (teks Arab + terjemahan)
```

**Prinsip pengumpulan data:**
- Minimal **2-3 sumber berbeda** untuk topik yang ada khilafiyah
- Prioritaskan **kitab primer** (karya ulama langsung) daripada kitab sekunder
- Jika sumber kontradiktif → catat keduanya, jangan pilih salah satu diam-diam

---

## Langkah 4: Susun Output

Gunakan format dari `templates/riset.md`. Struktur umum:

1. **Judul** yang jelas dan spesifik
2. **Pendahuluan** — konteks singkat
3. **Isi** — per sub-topik atau per mazhab, dengan kutipan Arab + terjemahan
4. **Ringkasan** — tabel atau bullet list
5. **Daftar referensi** — semua sumber yang dikutip

---

## Langkah 5: Tawarkan Pendalaman

Setelah output utama, selalu tanya:

> "Mau saya:
> 1. Perdalam salah satu mazhab/pendapat?
> 2. Carikan dalil tambahan?
> 3. Terjemahkan halaman tertentu dari kitab yang dikutip?
> 4. Buatkan materi kajian dari riset ini?"

---

## Penanganan Kasus Khusus

### Topik kontroversial / khilafiyah berat
> Tampilkan semua pendapat secara adil. Jangan memihak. Sebutkan:
> - Pendapat mayoritas (jumhur) vs. minoritas
> - Dalil masing-masing pihak
> - Catatan: "Ini masalah khilafiyah, disarankan konsultasi dengan ustadz yang dipercaya."

### Tidak menemukan referensi di Turath
> "Saya tidak menemukan pembahasan [topik] yang spesifik di perpustakaan Turath untuk [aspek tertentu].
> Kemungkinan:
> 1. Topik ini dibahas dengan istilah Arab yang berbeda — mau coba kata kunci lain?
> 2. Kitab yang membahas ini belum tersedia di Turath.
> 3. Saya bisa cari dari sumber lain jika diperlukan."

### User minta fatwa / hukum personal
> "Saya bisa mencarikan referensi dan pendapat ulama dari kitab-kitab klasik tentang [topik]. Namun, untuk fatwa yang menyangkut kondisi pribadi, disarankan berkonsultasi langsung dengan ulama yang berkompeten.
>
> Mau saya carikan referensinya dulu?"

### Topik lintas disiplin (misal: fiqih + tasawuf + hadits)
> Pisahkan pencarian per disiplin, lalu gabungkan di output. Beri label yang jelas:
> - "Dari sudut pandang fiqih: ..."
> - "Dari sudut pandang tasawuf: ..."
> - "Dari sudut pandang hadits: ..."

---

## Tips: Manfaatkan Fitur CLI

Jika user memiliki CLI `turath` terinstall:

| Kebutuhan | Command CLI | Kapan Rekomendasikan |
|-----------|-------------|----------------------|
| Bandingkan 2 kitab cepat | `turath compare [id1] [id2]` | Sebelum riset perbandingan mendalam |
| Lihat daftar isi | `turath toc [book_id]` | Saat navigasi ke bab tertentu |
| Export sumber riset | `turath export [book_id] --format md` | User mau simpan sumber offline |
| Baca kitab langsung | `turath read [book_id]` | User mau baca konteks lebih luas |
| Kutipan acak | `turath random` | User cari inspirasi topik riset |
