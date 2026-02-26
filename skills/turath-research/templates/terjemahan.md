# Template: Output Terjemahan

Format baku yang **wajib** diikuti saat menerjemahkan teks dari kitab.

---

## Format Per Halaman

```
📖 **[Nama Kitab]** — [Nama Penulis]
📄 [Jilid X, Halaman Y] | [Nama Bab jika ada]

### Teks Arab
> [teks Arab asli dari API, tanpa modifikasi]

### Terjemahan [Bahasa Target]
[terjemahan yang akurat, mudah dipahami, dan natural dalam bahasa target]

### Catatan
- **[istilah Arab]** ([transliterasi]): [penjelasan singkat]
- **[istilah Arab]** ([transliterasi]): [penjelasan singkat]
- [catatan kontekstual jika diperlukan]

---
📚 Referensi: [Nama Kitab], [Penulis], Jilid [X], Halaman [Y]
🔗 Sumber: Turath.io (Book ID: [XXXX])
```

---

## Aturan Terjemahan

### Wajib
- Teks Arab asli **harus** ditampilkan sebelum terjemahan
- Istilah teknis Arab yang tidak umum **harus** diberi catatan
- Referensi lengkap **harus** ada di akhir setiap halaman
- Ayat Al-Quran diterjemahkan dengan format: *"terjemahan"* (QS. [Surat]: [Ayat])
- Hadits Nabi dicantumkan perawi: (HR. [Perawi])

### Dianjurkan
- Transliterasi untuk istilah penting: **الإخلاص** (*al-ikhlash*)
- Catatan cross-reference jika ada pembahasan terkait di halaman lain
- Terjemahan nama bab jika bab baru dimulai

### Dilarang
- Menerjemahkan tanpa menampilkan teks Arab asli
- Memodifikasi teks Arab (menambah/mengurangi)
- Menerjemahkan tanpa referensi halaman dan book ID
- Skip halaman tanpa konfirmasi user

---

## Format Navigasi

Di akhir setiap halaman, tampilkan:

```
⬅️ Halaman sebelumnya: [Y-1]
➡️ Lanjut ke halaman: [Y+1]
```

Atau jika dalam konteks bab:

```
📑 Bab ini: halaman [awal] - [akhir] (sisa [N] halaman)
➡️ Lanjut ke halaman [Y+1]?
```

---

## Contoh Output Lengkap

📖 **Riyadhus Shalihin** — Imam An-Nawawi
📄 Jilid 1, Halaman 3 | Bab 1: الإخلاص والنية

### Teks Arab
> بَابُ الإِخْلاصِ وَالنِّيَّةِ
>
> قَالَ اللهُ تَعَالَى: {وَمَا أُمِرُوا إِلا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ حُنَفَاءَ وَيُقِيمُوا الصَّلاةَ وَيُؤْتُوا الزَّكَاةَ وَذَلِكَ دِينُ الْقَيِّمَةِ}
>
> وَقَالَ تَعَالَى: {لَنْ يَنَالَ اللَّهَ لُحُومُهَا وَلا دِمَاؤُهَا وَلَكِنْ يَنَالُهُ التَّقْوَى مِنْكُمْ}

### Terjemahan Indonesia

**Bab Keikhlasan dan Niat**

Allah Ta'ala berfirman: *"Padahal mereka tidak diperintah melainkan supaya menyembah Allah dengan memurnikan ketaatan kepada-Nya dalam (menjalankan) agama dengan lurus, mendirikan shalat, dan menunaikan zakat. Dan yang demikian itulah agama yang lurus."* (QS. Al-Bayyinah: 5)

Dan Allah Ta'ala berfirman: *"Daging-daging dan darah-darah unta dan sapi itu sekali-kali tidak dapat mencapai (keridhaan) Allah, tetapi ketakwaan dari kamulah yang dapat mencapainya."* (QS. Al-Hajj: 37)

### Catatan
- **الإخلاص** (*al-ikhlash*): keikhlasan, memurnikan amalan hanya untuk Allah semata
- **حنفاء** (*hunafa'*): bentuk jamak dari *hanif*, bermakna condong/lurus kepada kebenaran
- **دين القيمة** (*din al-qayyimah*): agama yang lurus dan tegak

---
📚 Referensi: Riyadhus Shalihin, Imam An-Nawawi, Jilid 1, Halaman 3
🔗 Sumber: Turath.io (Book ID: 21796)

📑 Bab 1: halaman 3 - 8 (sisa 5 halaman)
➡️ Lanjut ke halaman 4?
