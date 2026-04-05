# Turath API Exploration Notes

Dokumentasi hasil eksplorasi API Turath.io menggunakan `agent-browser` CLI.
Tanggal eksplorasi: 2026-04-05

## Metodologi

Menggunakan `agent-browser` (Vercel headless browser CLI) untuk:
1. Navigasi ke https://app.turath.io/
2. Intercept network requests via JS injection (`fetch` + `XMLHttpRequest` monkey-patching)
3. Klik buku dan tombol download untuk menangkap endpoint yang digunakan

### Setup Interception

```javascript
window.__capturedRequests = [];
const origFetch = window.fetch;
window.fetch = function(...args) {
  window.__capturedRequests.push({
    type: 'fetch',
    url: typeof args[0] === 'string' ? args[0] : args[0]?.url
  });
  return origFetch.apply(this, args);
};
const origXHR = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
  window.__capturedRequests.push({ type: 'xhr', method, url: url?.toString() });
  return origXHR.apply(this, arguments);
};
```

## Temuan: Endpoint API

### 1. Book Info (fetch)
```
GET https://api.turath.io/book?id={book_id}&include=indexes&ver=3
```
- Dipanggil saat user membuka halaman buku
- Response: metadata buku + indexes (headings, volumes, page_map)

### 2. Page Content (fetch, lazy-loaded)
```
GET https://api.turath.io/page?book_id={book_id}&pg={page_number}&ver=3
```
- Dipanggil sequential: pg=1, pg=2, pg=3, pg=4, pg=5 (prefetch 5 halaman)
- Tidak ada prefetch tambahan saat scroll (client-side rendering dari cache)

### 3. Book File Download (XHR)
```
GET https://files.turath.io/books-v3/{book_id}.json
```
- Dipanggil saat user klik tombol "تحميل الكتاب" (download)
- **PENTING**: URL lama `books/` sudah tidak aktif, sekarang `books-v3/`
- Response menggunakan format minified dengan Arabic diacritics sebagai keys

### 4. Search (fetch)
```
GET https://api.turath.io/search?q={query}&ver=3[&precision=N&cat_id=N&author=N&page=N&sort=field]
```

## Format v3 Book File: Key Mapping

Response `books-v3/*.json` menggunakan Arabic diacritics sebagai keys untuk minifikasi:

### Meta Object (key: `ً` / U+064B)

| Key | Unicode | Field | Example |
|-----|---------|-------|---------|
| `ٌ` | U+064C | id | `21796` |
| `ٍ` | U+064D | name | `"أصول في التفسير"` |
| `َ` | U+064E | cat_id | `1` |
| `ُ` | U+064F | author_id | `1` |
| `ِ` | U+0650 | pdf_info | `{root, files}` or null |
| `ّ` | U+0651 | details | `"الكتاب: ..."` |
| `ْ` | U+0652 | (unknown) | `""` |
| `ٓ` | U+0653 | version | `"1.0"` |
| `ٔ` | U+0654 | size | `57` |
| `ٕ` | U+0655 | (unknown) | `4` |
| `ٖ` | U+0656 | date_built | `1770153789` |
| `ٗ` | U+0657 | (unknown) | `1` |

### Indexes Object (key: `٘` / U+0658)

| Key | Unicode | Field | Type |
|-----|---------|-------|------|
| `ٙ` | U+0659 | volumes | `string[]` |
| `ٚ` | U+065A | headings | `{title, level, page}[]` |
| `ٛ` | U+065B | page_headings | `Record<number, number[]>` |
| `ٜ` | U+065C | volume_bounds | `Record<string, [number, number]>` |
| `ٝ` | U+065D | page_map | `array` |
| `ٞ` | U+065E | print_pg_to_pg | `Record<string, number>` |
| `ٟ` | U+065F | non_author | `array` |

### Pages Array (key: `pages`)

Tidak di-minify. Format tetap:
```json
{"text": "<html content>", "vol": "1", "page": 3}
```

## Catatan Penting

1. **API version parameter**: Semua endpoint pakai `ver=3`
2. **No authentication**: Semua endpoint public, no API key needed
3. **Headers**: Hanya butuh `Accept: application/json`
4. **No User-Agent/Referer required**: Bisa diakses tanpa browser headers
5. **CDN migration**: `books/` -> `books-v3/` (breaking change, old path returns 404)
6. **Page prefetch**: App prefetch 5 halaman sekaligus, bukan infinite scroll
