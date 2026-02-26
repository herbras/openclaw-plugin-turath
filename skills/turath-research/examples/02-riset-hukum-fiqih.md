# Contoh: Riset Hukum Fiqih

## Skenario
User ingin tahu hukum qunut subuh menurut berbagai mazhab.

---

### Percakapan

**User:** Apa hukum qunut subuh menurut 4 mazhab? Carikan referensinya dari kitab-kitab klasik.

**Asisten:**

Baik, saya akan riset hukum qunut subuh dari kitab-kitab klasik 4 mazhab. Ini perlu beberapa langkah karena harus dicari dari beberapa sumber.

Pertama, saya cari pembahasan qunut subuh di perpustakaan Turath...

> `turath_search { query: "قنوت الصبح" }`

Ditemukan banyak hasil. Saya akan ambil dari kitab-kitab mu'tamad tiap mazhab.

Untuk kitab tiap mazhab, saya cari penulisnya:

> `turath_filter_ids { author_name: "النووي" }` — Mazhab Syafi'i
> `turath_filter_ids { author_name: "ابن قدامة" }` — Mazhab Hanbali
> `turath_filter_ids { author_name: "ابن عابدين" }` — Mazhab Hanafi
> `turath_filter_ids { author_name: "ابن رشد" }` — Perbandingan mazhab

Sekarang saya cari spesifik di kitab masing-masing...

> `turath_search { query: "قنوت الصبح", author: 54 }` — An-Nawawi
> `turath_search { query: "القنوت في الصبح", author: 206 }` — Ibnu Qudamah

*(ambil halaman-halaman yang relevan dari hasil pencarian)*

> `turath_get_page { book_id: XXXX, page_number: YY }`

---

# Hukum Qunut Subuh Menurut 4 Mazhab

## 1. Mazhab Hanafi
**Hukum:** Tidak disyariatkan qunut pada shalat subuh secara rutin.

Imam Al-Kasani dalam *Bada'i Ash-Shana'i* menyebutkan:

> والقنوت عندنا في الوتر لا في الفجر
>
> "Qunut menurut kami (Hanafiyah) di dalam shalat witir, bukan di shalat subuh."

📚 Bada'i Ash-Shana'i, Al-Kasani, Jilid 1, Hal. XX (Book ID: XXXX)

## 2. Mazhab Maliki
**Hukum:** Sunnah qunut subuh sebelum ruku', tanpa mengangkat tangan.

Imam Ibnu Rusyd dalam *Bidayatul Mujtahid* menyebutkan:

> وأما مالك فقال: يقنت في الصبح قبل الركوع
>
> "Adapun Imam Malik berkata: qunut di shalat subuh sebelum ruku'."

📚 Bidayatul Mujtahid, Ibnu Rusyd, Jilid 1, Hal. XX (Book ID: XXXX)

## 3. Mazhab Syafi'i
**Hukum:** Sunnah mu'akkadah qunut pada shalat subuh setiap hari, setelah ruku' rakaat kedua.

Imam An-Nawawi dalam *Al-Majmu' Syarh Al-Muhadzdzab* menyebutkan:

> قال أصحابنا: يستحب القنوت في صلاة الصبح، وهو سنة مؤكدة
>
> "Ashab kami (Syafi'iyah) berkata: disunahkan qunut pada shalat subuh, dan itu adalah sunnah mu'akkadah."

📚 Al-Majmu', An-Nawawi, Jilid 3, Hal. XX (Book ID: XXXX)

## 4. Mazhab Hanbali
**Hukum:** Tidak disyariatkan qunut subuh secara rutin, kecuali qunut nazilah saat ada musibah.

Ibnu Qudamah dalam *Al-Mughni* menyebutkan:

> ولا يقنت في الفجر إلا أن تنزل بالمسلمين نازلة
>
> "Tidak ada qunut di shalat subuh kecuali jika ada musibah yang menimpa kaum muslimin."

📚 Al-Mughni, Ibnu Qudamah, Jilid 1, Hal. XX (Book ID: XXXX)

---

## Ringkasan

| Mazhab | Hukum | Posisi | Sumber Utama |
|--------|-------|--------|--------------|
| Hanafi | Tidak disyariatkan | — | Bada'i Ash-Shana'i |
| Maliki | Sunnah | Sebelum ruku' | Bidayatul Mujtahid |
| Syafi'i | Sunnah mu'akkadah | Setelah ruku' | Al-Majmu' |
| Hanbali | Tidak (kecuali nazilah) | — | Al-Mughni |

---

**Daftar Referensi:**
1. Bada'i Ash-Shana'i — Al-Kasani (Book ID: XXXX)
2. Bidayatul Mujtahid — Ibnu Rusyd (Book ID: XXXX)
3. Al-Majmu' Syarh Al-Muhadzdzab — An-Nawawi (Book ID: XXXX)
4. Al-Mughni — Ibnu Qudamah (Book ID: XXXX)

---

Apakah ada mazhab tertentu yang ingin diperdalam? Atau mau saya carikan dalil haditsnya juga?

---

## Poin Penting dari Contoh Ini

1. **Riset per mazhab** — jangan campur aduk. Pisahkan pendapat tiap mazhab dengan jelas.
2. **Cari kitab mu'tamad** — gunakan kitab induk tiap mazhab, bukan kitab sembarangan.
3. **Kutip teks Arab asli** — sertakan teks Arab + terjemahan untuk setiap pendapat.
4. **Tabel ringkasan** — di akhir, buat tabel perbandingan yang mudah dibaca.
5. **Daftar referensi** — semua kitab yang dikutip harus tercantum lengkap.
6. **Tawarkan pendalaman** — tanya user mau diperdalam aspek tertentu atau tidak.
