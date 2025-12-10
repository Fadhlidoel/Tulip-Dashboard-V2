# 🔍 DEBUG INSTRUCTIONS - Suhu & Kelembapan Issue

## Status Perbaikan

Saya sudah menambahkan **extensive logging** ke dalam kode untuk membantu identifikasi masalah. Ada 3 file debug baru yang saya buat:

1. **`quick_debug.html`** ⭐ **BUKA INI DULUAN**
2. `debug_full.html` (dashboard visual)
3. `test_thinkspeak.html` (test dasar)

## Langkah-Langkah Debug

### Step 1: Buka Quick Debug File
```
1. Buka browser dan navigate ke: quick_debug.html
2. File akan auto-run diagnostics
3. Tunggu hingga selesai
```

### Step 2: Lihat Hasil di Browser
Halaman akan menampilkan:
- ✅/❌ Status setiap field (field1-field8)
- Raw nilai dari ThinkSpeak
- Mapping ke HTML elements
- Findings/masalah yang terdeteksi

### Step 3: Screenshot & Share

Silakan screenshot atau copy-paste hasil output. Itu akan menunjukkan:

**Kemungkinan Masalah yang Bisa Ditemukan:**

1. **Field3 KOSONG di ThinkSpeak**
   - Masalah: Sensor Suhu tidak mengirim data
   - Solusi: Cek hardware/firmware di device

2. **Field4 berisi nilai Field3**
   - Masalah: Device firmware salah kirim ke field
   - Solusi: Perbaiki firmware device

3. **HTML Element tidak ditemukan**
   - Masalah: ID di HTML salah/typo
   - Solusi: Cek index.html

4. **Semuanya normal tapi tidak update**
   - Masalah: Cache/timing issue
   - Solusi: Refresh page atau clear cache

## Perbaikan yang Sudah Dilakukan

### 1. **Merged DOMContentLoaded Events**
Sebelumnya ada 2 event listener `DOMContentLoaded` yang bisa konflik.
Sudah digabung menjadi 1.

### 2. **Enhanced Logging**
Ditambahkan `console.log` di berbagai tempat:
- `processThingspeakData()` - menampilkan raw data dari API
- `updateMetricCards()` - menampilkan mapping & parsing
- `updateDashboard()` - menampilkan fetch process
- Initialization - menampilkan startup status

### 3. **Better Error Handling**
Ditambahkan try-catch & error logging di async functions

## Struktur Field yang Benar

```javascript
SENSORS = {
    radiasi: { field: 'field1', htmlId: 'radiation-value' },    // CPM
    karbon:  { field: 'field2', htmlId: 'carbon-value' },       // PPM
    suhu:    { field: 'field3', htmlId: 'temperature-value' },  // °C ⚠️
    kelembapan: { field: 'field4', htmlId: 'humidity-value' }   // % ⚠️
}
```

## Browser Console Shortcuts

Setelah buka main dashboard (`index.html`), di console (F12) bisa coba:

```javascript
// Trigger manual update
updateDashboard();

// Check latest values
const url = 'https://api.thingspeak.com/channels/3182232/feeds.json?results=1&api_key=Q4EK1PMPN150NY25';
fetch(url).then(r => r.json()).then(d => {
    console.log('Field3 (Suhu):', d.feeds[0].field3);
    console.log('Field4 (Kelembapan):', d.feeds[0].field4);
});

// Check if elements exist
document.getElementById('temperature-value')     // should return element
document.getElementById('humidity-value')        // should return element
```

## File Changes Summary

| File | Changes |
|------|---------|
| `script.js` | Added comprehensive logging to updateMetricCards(), processThingspeakData(), updateDashboard() |
| `quick_debug.html` | NEW - Quick diagnostic tool |
| `debug_full.html` | NEW - Full visual dashboard |
| `test_thinkspeak.html` | NEW - Basic API test |

## Next Steps

1. ✅ Buka `quick_debug.html`
2. ✅ Lihat hasil output
3. ✅ Share findings dengan saya
4. ✅ Saya buat fix berdasarkan findings

---

**Questions?** Check console output atau share screenshot dari quick_debug.html
