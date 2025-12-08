# Mobile Responsive Dashboard V2 - Implementation Guide

## Overview
Dashboard PKM-TULIP telah diupdate dengan fitur responsif untuk perangkat mobile (max-width: 992px).

## Perubahan Struktur

### 1. **Layout Mobile** 
- **Desktop**: Navbar di kiri (250px width), content di kanan
- **Mobile**: Navbar hilang, diganti dengan bottom navigation bar (70px height)
- Header mobile baru dengan indikator di bawah logo

### 2. **Three-Page Mobile Interface**

#### **Halaman 1: Sensor & Lokasi (Home Page)**
- Menampilkan 4 kartu sensor (Radiasi, CO2, Suhu, Kelembapan) dalam grid 2x2
- Lokasi transmitter dengan peta
- Prakiraan cuaca bawaan

**CSS Class**: `.mobile-bottom-nav .nav-item[data-page="home"]`

#### **Halaman 2: Grafik & Detail Sensor (Analytic Page)**
- Switch sensor menggunakan tombol horizontal
- Dropdown/Toggle untuk pilihan Harian/Mingguan
- Detail per sensor (nilai saat ini, status)
- Grafik harian dan mingguan
- Margin bawah 80px untuk space navbar

**CSS Class**: `.mobile-bottom-nav .nav-item[data-page="analytic"]`

#### **Halaman 3: Prakiraan Cuaca (Weather Page)**  
- Menampilkan prakiraan 7 hari
- Format compact untuk mobile
- Suhu min/max dan probabilitas hujan

**CSS Class**: `.mobile-bottom-nav .nav-item[data-page="weather"]`

### 3. **Bottom Navigation Bar**

```html
<nav class="mobile-bottom-nav">
    <a class="nav-item" data-page="home">Sensor</a>
    <a class="nav-item" data-page="analytic">Grafik</a>
    <a class="nav-item" data-page="weather">Cuaca</a>
</nav>
```

- **Position**: Fixed di bottom
- **Height**: 70px
- **Z-index**: 1000
- **Active State**: Background color dan highlight

### 4. **Indikator (Header Mobile)**

Indikator WiFi/LoRa, GPS, dan Battery dipindahkan ke header mobile dengan layout:
```
Logo + Judul
─────────────
LoRa  GPS  Battery
```

Responsive design dengan font size yang disesuaikan.

## CSS Media Query Structure

```css
@media screen and (max-width: 992px) {
    /* Hide desktop elements */
    nav { display: none !important; }
    .desktop-only { display: none !important; }
    
    /* Show mobile elements */
    .mobile-only { display: block !important; }
    
    /* Responsive layouts */
    .cards-container { grid-template-columns: 1fr 1fr; }
    .content-view.active { display: flex; }
    
    /* Mobile navbar */
    .mobile-bottom-nav {
        position: fixed;
        bottom: 0;
        height: 70px;
    }
}
```

## JavaScript Navigation

### Desktop Navigation (Existing)
- Tetap menggunakan navbar kiri
- Click #dash-btn untuk Dashboard
- Click #data-btn untuk Data Analitik

### Mobile Navigation (New)
```javascript
// Mobile nav items dengan data-page attribute
mobileNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
        const page = this.getAttribute('data-page');
        
        if(page === 'home') { // Sensor
            show #home-view
        } else if(page === 'analytic') { // Grafik
            show #analytic-view
        } else if(page === 'weather') { // Cuaca
            show prakiraan cuaca
        }
    });
});
```

## Responsive Breakpoints

| Element | Desktop | Mobile |
|---------|---------|--------|
| Cards Grid | 4 kolom | 2x2 grid |
| Font Size (Title) | 48px | 20px |
| Font Size (Body) | 18px | 12-14px |
| Padding | 30px | 15px |
| Chart Height | 300px | 250px |
| Navbar | 250px (left) | 70px (bottom) |

## Color & Style

- **Navbar Mobile**: `var(--navbar-color)` (#FFFDFD)
- **Border**: 1px solid rgba(32, 49, 70, 0.2)
- **Active State**: rgba(32, 49, 70, 0.1) background
- **Icons**: 24x24px, colored dengan currentColor

## File Modifications

### `index.html`
- ✅ Added mobile header dengan indikator
- ✅ Added bottom navigation bar (3 menu items)
- ✅ Existing content views tetap sama

### `style.css`
- ✅ Added comprehensive media query (max-width: 992px)
- ✅ Mobile navbar styling
- ✅ Responsive grid layouts
- ✅ Adjusted typography untuk mobile
- ✅ Added bottom padding body untuk space navbar

### `script.js`
- ✅ Added mobile navigation event listeners
- ✅ Page switching logic (home/analytic/weather)
- ✅ Maintained desktop navigation compatibility
- ✅ Active state management

## Testing Checklist

- [ ] Open dashboard di browser mobile
- [ ] Test responsive di max-width 992px
- [ ] Click setiap bottom nav item (Sensor, Grafik, Cuaca)
- [ ] Verify sensor cards tampil di halaman Sensor
- [ ] Verify grafik & detail tampil di halaman Grafik
- [ ] Verify prakiraan cuaca tampil di halaman Cuaca
- [ ] Check indikator WiFi/GPS/Battery di header
- [ ] Test sensor switching (radio button/switch)
- [ ] Test daily/weekly chart toggle
- [ ] Verify maps tampil di halaman Sensor

## Notes

- Mobile navbar **tidak menghilangkan** data atau fitur apapun
- Semua data ThingSpeak tetap update setiap 15 detik
- Forecast data tetap terupdate dari Open-Meteo API
- Kompatibilitas desktop **100% preserved**
- Transisi antar halaman smooth dengan CSS

## Future Enhancements

- Swipe gesture untuk navigasi antar halaman
- Dark mode support
- Optimize chart rendering untuk performa mobile
- Add map library (Leaflet) untuk lokasi transmitter
