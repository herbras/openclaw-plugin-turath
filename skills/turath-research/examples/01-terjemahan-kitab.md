# Contoh: Terjemahan Kitab

## Skenario
User ingin menerjemahkan bagian dari kitab Riyadhus Shalihin.

---

### Percakapan

**User:** Tolong terjemahkan kitab Riyadhus Shalihin

**Asisten:**

Baik, saya bantu menerjemahkan kitab Riyadhus Shalihin (رياض الصالحين) karya Imam An-Nawawi.

Kitab ini sangat panjang — ada ratusan bab. Kita akan menerjemahkan **secara bertahap per halaman** supaya hasilnya akurat.

Saya perlu tahu dulu:
1. **Bab atau halaman berapa** yang ingin diterjemahkan? Atau mau mulai dari awal?
2. Terjemahan ke **bahasa Indonesia**?

Saya carikan dulu kitabnya di Turath...

> `turath_search { query: "رياض الصالحين" }`

Saya menemukan beberapa hasil. Ini yang paling cocok:
- **رياض الصالحين** — Imam An-Nawawi (Book ID: 21796)

Apakah benar ini kitab yang dimaksud?

---

**User:** Iya benar. Terjemahkan bab pertama tentang ikhlas.

**Asisten:**

Baik, saya ambil daftar isi dulu untuk mencari bab Ikhlas...

> `turath_get_book { book_id: 21796, include: "indexes" }`

Dari daftar isi, bab pertama "الإخلاص والنية" dimulai di halaman 3.

Saya ambil halamannya sekarang. Mohon bersabar ya, saya akan menerjemahkan dengan hati-hati.

> `turath_get_page { book_id: 21796, page_number: 3 }`

---

📖 **Riyadhus Shalihin** — Imam An-Nawawi
📄 Bab 1: الإخلاص والنية (Keikhlasan dan Niat), Halaman 3

### Teks Arab
> بَابُ الإِخْلاصِ وَالنِّيَّةِ
>
> قَالَ اللهُ تَعَالَى: {وَمَا أُمِرُوا إِلا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ حُنَفَاءَ}
> ...

### Terjemahan Indonesia

**Bab Keikhlasan dan Niat**

Allah Ta'ala berfirman: *"Padahal mereka tidak diperintah melainkan supaya menyembah Allah dengan memurnikan ketaatan kepada-Nya dalam (menjalankan) agama dengan lurus."* (QS. Al-Bayyinah: 5)

...

### Catatan
- **الإخلاص** (al-ikhlash): keikhlasan, memurnikan niat hanya untuk Allah
- **حنفاء** (hunafa'): condong kepada kebenaran, lurus

📚 Referensi: Riyadhus Shalihin, Imam An-Nawawi, Bab 1, Halaman 3
🔗 Sumber: Turath.io (Book ID: 21796)

---

Halaman ini sudah selesai. **Lanjut ke halaman 4?**

---

**User:** Lanjut

**Asisten:**

> `turath_get_page { book_id: 21796, page_number: 4 }`

📖 **Riyadhus Shalihin** — Imam An-Nawawi
📄 Bab 1: الإخلاص والنية, Halaman 4

*(terjemahan halaman berikutnya...)*

---

## Poin Penting dari Contoh Ini

1. **Tanya dulu** — jangan langsung terjemahkan. Tanya kitab apa, halaman berapa.
2. **Konfirmasi buku** — tampilkan hasil pencarian, minta user konfirmasi.
3. **Ambil daftar isi** — bantu user navigasi ke bab yang diinginkan.
4. **Terjemahkan per halaman** — jangan coba terjemahkan seluruh kitab sekaligus.
5. **Format bilingual** — tampilkan teks Arab asli + terjemahan berdampingan.
6. **Catatan istilah** — jelaskan istilah teknis Arab yang mungkin tidak familiar.
7. **Referensi lengkap** — nama kitab, penulis, bab, halaman, book ID.
8. **Tanya lanjut** — setelah selesai satu halaman, tanya mau lanjut atau tidak.
