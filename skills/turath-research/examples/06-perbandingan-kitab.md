# Contoh: Perbandingan Antar Kitab

## Skenario
User ingin membandingkan pembahasan nikah mut'ah di dua kitab berbeda.

---

### Percakapan

**User:** Bandingkan pembahasan nikah mut'ah di Fathul Bari (Ibnu Hajar) dan Al-Mughni (Ibnu Qudamah)

**Asisten:**

Baik, saya akan cari kedua kitab dan pembahasan nikah mut'ah di dalamnya.

**Langkah 1: Cari kedua kitab**

> `turath_search { query: "فتح الباري ابن حجر" }`
> `turath_search { query: "المغني ابن قدامة" }`

Ditemukan:
- **فتح الباري** — Ibnu Hajar Al-Asqalani (Book ID: AAAA)
- **المغني** — Ibnu Qudamah Al-Maqdisi (Book ID: BBBB)

**Langkah 2: Cari bab nikah mut'ah dari daftar isi**

> `turath_get_book { book_id: AAAA, include: "indexes" }`
> `turath_get_book { book_id: BBBB, include: "indexes" }`

Dari daftar isi:
- Fathul Bari → Kitab An-Nikah, Bab Nahyu an Nikah Al-Mut'ah → Halaman XXX
- Al-Mughni → Kitab An-Nikah, Bab Nikah Al-Mut'ah → Halaman YYY

**Langkah 3: Ambil halaman yang relevan**

> `turath_get_page { book_id: AAAA, page_number: XXX }`
> `turath_get_page { book_id: BBBB, page_number: YYY }`

---

# Perbandingan: Nikah Mut'ah

## Fathul Bari — Ibnu Hajar Al-Asqalani (w. 852 H)

**Konteks:** Syarah (penjelasan) hadits-hadits dalam Sahih Al-Bukhari tentang nikah mut'ah.

**Isi:**

> *(kutipan teks Arab dari halaman)*

**Ringkasan pendapat:**
- Nikah mut'ah pernah dibolehkan di awal Islam
- Kemudian diharamkan secara definitif pada Fathu Makkah
- Ibnu Hajar menyebutkan ada perbedaan riwayat tentang kapan pengharaman ini terjadi
- Beliau menguatkan bahwa pengharaman terakhir adalah definitif dan tidak dinasakh lagi
- Mengutip ijma' (konsensus) ulama Ahlussunnah tentang keharamannya

📚 Fathul Bari, Ibnu Hajar, Kitab An-Nikah, Jilid X, Hal. XXX (Book ID: AAAA)

---

## Al-Mughni — Ibnu Qudamah Al-Maqdisi (w. 620 H)

**Konteks:** Kitab fiqih Hanbali yang membahas hukum dari sudut pandang dalil dan perbandingan mazhab.

**Isi:**

> *(kutipan teks Arab dari halaman)*

**Ringkasan pendapat:**
- Nikah mut'ah haram berdasarkan hadits shahih larangan Nabi ﷺ
- Ibnu Qudamah menyebutkan dalil-dalil dari kedua pihak
- Menyebutkan pendapat Ibnu Abbas yang sempat membolehkan lalu rujuk (kembali)
- Mengutip ijma' sahabat bahwa nikah mut'ah haram

📚 Al-Mughni, Ibnu Qudamah, Kitab An-Nikah, Jilid X, Hal. YYY (Book ID: BBBB)

---

## Tabel Perbandingan

| Aspek | Fathul Bari | Al-Mughni |
|-------|-------------|-----------|
| **Pendekatan** | Syarah hadits (tahlili) | Fiqih perbandingan mazhab |
| **Hukum** | Haram (definitif) | Haram (definitif) |
| **Dalil utama** | Hadits-hadits Bukhari | Hadits + atsar sahabat |
| **Pembahasan sejarah** | Detail kronologi nasakh | Ringkas, fokus hukum |
| **Pendapat berbeda** | Menyebutkan khilaf riwayat | Menyebutkan pendapat Ibnu Abbas |
| **Ijma'** | Ya, disebutkan | Ya, disebutkan |

## Kesimpulan

Kedua kitab **sepakat** bahwa nikah mut'ah haram. Perbedaannya ada di **pendekatan**:
- Ibnu Hajar lebih detail membahas **kronologi nasakh** dan riwayat-riwayat hadits
- Ibnu Qudamah lebih fokus pada **dalil hukum** dan perbandingan pendapat mazhab

---

Mau saya dalami salah satu kitab? Atau cari pembahasan yang sama di kitab mazhab lain?

---

## Poin Penting dari Contoh Ini

1. **Cari kedua kitab** — jangan tebak, cari keduanya di Turath.
2. **Gunakan daftar isi** — navigasi ke bab yang tepat, jangan asal ambil halaman.
3. **Kutip dari kedua sisi** — teks Arab asli dari masing-masing kitab.
4. **Ringkasan per kitab** — jelaskan pendapat masing-masing secara terpisah dulu.
5. **Tabel perbandingan** — bantu user melihat perbedaan dan persamaan.
6. **Kesimpulan** — rangkum poin utama persamaan dan perbedaan.

---

## Shortcut: Perbandingan Cepat via CLI

Sebelum melakukan perbandingan isi yang mendalam, user bisa mendapatkan perbandingan metadata secara instan menggunakan CLI:

```bash
turath compare AAAA BBBB
```

Output contoh:
```
                             فتح الباري                        المغني
  ──────────────────────────────────────────────────────────────────────
  ID                         AAAA                             ≠ BBBB
  Author                     ابن حجر العسقلاني                ≠ ابن قدامة المقدسي
  Category                   شروح الحديث                      ≠ الفقه الحنبلي
  Author Death               852 AH                           ≠ 620 AH
  Headings                   5230                             ≠ 3450
  Volumes                    1-13                             ≠ 1-15
  PDF                        Yes                              = Yes
```

Ini membantu user memahami perbedaan mendasar kedua kitab sebelum masuk ke perbandingan isi yang lebih detail.

**Kapan pakai `compare` vs riset manual:**
- `compare` → perbandingan metadata cepat (penulis, kategori, ukuran)
- Riset manual → perbandingan **isi/pembahasan** topik tertentu di kedua kitab
