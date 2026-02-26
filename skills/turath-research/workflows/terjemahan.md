# Workflow: Terjemahan Kitab

Langkah-langkah detail saat user meminta terjemahan kitab klasik.

---

## Langkah 1: Klarifikasi Permintaan

**JANGAN langsung kerja.** Tanyakan dulu:

| Pertanyaan | Kenapa penting |
|------------|----------------|
| Nama kitab apa? | Bisa ada banyak kitab dengan nama mirip |
| Halaman/bab berapa? | Kitab bisa ratusan jilid, harus spesifik |
| Bahasa tujuan? | Default Indonesia, tapi bisa Inggris/Melayu |
| Konteks penggunaan? | Akademis vs. umum mempengaruhi gaya bahasa |

**Contoh respons:**

> "Saya bantu terjemahkan [nama kitab]. Kitab ini cukup panjang, jadi kita kerjakan **bertahap per halaman** ya.
>
> Beberapa pertanyaan:
> 1. Bab atau halaman berapa yang ingin diterjemahkan?
> 2. Terjemahan ke bahasa apa?
>
> Saya carikan dulu kitabnya..."

---

## Langkah 2: Cari dan Identifikasi Buku

```
Tool calls:
1. turath_search { query: "[nama kitab dalam Arab]" }
2. Jika banyak hasil → tampilkan top 3, minta user pilih
3. Jika sudah pasti → turath_get_book { book_id: X, include: "indexes" }
```

**Tampilkan ke user:**
- Nama kitab + penulis + tahun wafat
- Konfirmasi: "Apakah ini kitab yang dimaksud?"
- Daftar isi (jika user belum tahu halaman berapa)

---

## Langkah 3: Navigasi ke Halaman yang Tepat

Jika user menyebut **bab** (bukan halaman):
```
1. Baca daftar isi dari turath_get_book (indexes.headings)
2. Cari heading yang cocok
3. Tampilkan: "Bab [X] dimulai di halaman [Y]. Saya ambil dari situ ya?"
```

Jika user menyebut **halaman**:
```
1. Langsung turath_get_page { book_id: X, page_number: Y }
```

---

## Langkah 4: Terjemahkan Satu Halaman

```
Tool call:
turath_get_page { book_id: X, page_number: Y }
```

Proses terjemahan:
1. Baca teks Arab dari hasil API
2. Strip HTML tags (br, span, dll) untuk teks bersih
3. Terjemahkan dengan prinsip:
   - **Akurat** — tidak menambah/mengurangi makna
   - **Natural** — bahasa target yang enak dibaca
   - **Kontekstual** — sesuai konteks kitab (fiqih, hadits, tasawuf, dll)
4. Identifikasi istilah teknis → buat catatan
5. Format output sesuai template `templates/terjemahan.md`

**Pesan ke user sebelum mulai:**

> "Mohon bersabar ya, saya terjemahkan halaman ini dengan hati-hati..."

---

## Langkah 5: Tampilkan Hasil + Navigasi

Setelah terjemahan selesai:
1. Tampilkan output sesuai template
2. Di akhir, tanya:

> "➡️ Lanjut ke halaman [Y+1]?"

Atau jika dalam konteks bab:

> "📑 Bab ini masih [N] halaman lagi. Lanjut?"

---

## Langkah 6: Ulangi atau Selesai

- Jika user bilang "lanjut" → kembali ke Langkah 4 dengan halaman berikutnya
- Jika user bilang "cukup" atau "stop" → selesai
- Jika user bilang "loncat ke halaman Z" → kembali ke Langkah 4 dengan halaman Z
- Jika user minta bab lain → kembali ke Langkah 3

---

## Penanganan Kasus Khusus

### Teks kosong / halaman tidak ditemukan
> "Halaman [Y] tidak tersedia untuk kitab ini. Mungkin halaman dimulai dari nomor yang berbeda. Saya cek daftar isi..."
> → turath_get_book dengan indexes, cari halaman valid terdekat

### Teks sangat panjang (1 halaman penuh teks padat)
> Bagi jadi beberapa bagian, terjemahkan per paragraf agar user tidak overwhelmed.

### Kitab dengan banyak edisi
> Tampilkan semua edisi yang ditemukan, minta user pilih. Biasanya dibedakan dari nama penerbit atau penulis tahqiq (editor).

### User minta terjemahkan seluruh kitab sekaligus
> "Kitab ini memiliki [N] halaman. Menerjemahkan seluruhnya akan memakan waktu sangat lama dan hasilnya mungkin kurang akurat.
>
> Saya sarankan kita kerjakan per bab. Mau mulai dari bab mana?"
