# Contoh: Eksplorasi Karya Ulama

## Skenario
User ingin tahu tentang Imam Ibnu Taimiyah dan karya-karyanya.

---

### Percakapan

**User:** Ceritakan tentang Ibnu Taimiyah dan kitab-kitabnya yang ada di Turath

**Asisten:**

Baik, saya carikan dulu data Ibnu Taimiyah di database...

> `turath_filter_ids { author_name: "ابن تيمية" }`

Ditemukan beberapa ID. Yang utama adalah **Taqiyuddin Ibnu Taimiyah** (ID: 22).

> `turath_get_author { author_id: 22 }`

---

# Syaikhul Islam Ibnu Taimiyah

**Nama lengkap:** Taqiyuddin Abu Al-Abbas Ahmad bin Abdul Halim bin Abdussalam bin Taimiyah Al-Harrani
**Wafat:** 728 H (1328 M)
**Mazhab:** Hanbali

## Biografi Singkat

*(isi dari API — biografi yang dikembalikan dari turath_get_author)*

## Karya-karya di Turath

Dari hasil pencarian, berikut kitab-kitab Ibnu Taimiyah yang tersedia:

> `turath_search { query: "ابن تيمية", author: 22 }`

| No | Kitab | Book ID | Keterangan |
|----|-------|---------|------------|
| 1 | مجموع الفتاوى | XXXX | Kumpulan fatwa, 37 jilid |
| 2 | منهاج السنة النبوية | XXXX | Bantahan terhadap Syiah |
| 3 | درء تعارض العقل والنقل | XXXX | Filsafat & teologi |
| 4 | اقتضاء الصراط المستقيم | XXXX | Larangan menyerupai non-muslim |
| 5 | الفتوى الحموية | XXXX | Akidah — sifat Allah |
| 6 | العقيدة الواسطية | XXXX | Ringkasan akidah Ahlussunnah |
| ... | ... | ... | ... |

---

Mau saya:
1. **Buka salah satu kitab** untuk lihat daftar isi?
2. **Terjemahkan bagian tertentu** dari kitabnya?
3. **Bandingkan pendapatnya** dengan ulama lain dalam topik tertentu?

---

**User:** Buka Majmu' Fatawa, saya mau lihat daftar isinya

**Asisten:**

> `turath_get_book { book_id: XXXX, include: "indexes" }`

📖 **Majmu' Al-Fatawa** — Ibnu Taimiyah

Daftar isi (37 jilid):

```
Jilid 1: Tauhid Uluhiyah
  p.3   مقدمة المحقق
  p.15  التوحيد
  p.22  أقسام التوحيد
  ...

Jilid 2: Tauhid Asma wa Sifat
  p.1   الأسماء والصفات
  ...

Jilid 3: Maturidiyah dan Asy'ariyah
  ...
```

*(menampilkan 20 heading pertama, lalu "... dan XXX heading lagi")*

Kitab ini sangat besar. Jilid dan bab mana yang ingin kamu baca atau terjemahkan?

---

## Poin Penting dari Contoh Ini

1. **Mulai dari filter** — cari ID penulis dulu pakai `turath_filter_ids`.
2. **Ambil biografi** — gunakan `turath_get_author` untuk data lengkap.
3. **Daftar karya** — search dengan filter author ID untuk kitab-kitab beliau.
4. **Tabel yang rapi** — tampilkan karya dalam tabel, bukan daftar panjang.
5. **Tawarkan aksi lanjutan** — buka kitab, terjemahkan, atau bandingkan.
6. **Navigasi daftar isi** — untuk kitab besar, tampilkan TOC agar user bisa pilih.
