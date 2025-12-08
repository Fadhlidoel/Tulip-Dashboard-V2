const CHANNEL_ID = '3182232';        
const READ_API_KEY = 'Q4EK1PMPN150NY25'; 

const SENSORS = {
    radiasi: { 
        field: 'field1', unit: 'CPM', title: 'Level Radiasi', color: 'rgba(255, 206, 86, 1)', 
        sensorName: 'Geiger Counter', statusType: 'radiasi', htmlId:'radiation-value'
    },
    karbon: { 
        field: 'field2', unit: 'PPM', title: 'Kadar Karbon', color: 'rgba(54, 162, 235, 1)', 
        sensorName: 'MQ-7 (CO)', statusType: 'karbon', htmlId:'carbon-value'
    },
    suhu: { 
        field: 'field3', unit: '°C', title: 'Suhu Lingkungan', color: 'rgba(255, 99, 132, 1)', 
        sensorName: 'DHT22', statusType: 'suhu', htmlId:'temperature-value'
    },
    kelembapan: { 
        field: 'field4', unit: '%', title: 'Kelembapan', color: 'rgba(75, 192, 192, 1)', 
        sensorName: 'DHT22', statusType: 'lembab', htmlId:'humidity-value'
    }
};

const STATUS_FIELDS = {
    BATT_FIELD: 'field5',
    RSSI_FIELD: 'field6',
    GPS_LAT_FIELD: 'field7'
}

const SENSOR_CONFIG = {
    'radiasi' : {
        field: 'field1', unit: 'CPM', decimals: 3, color: 'rgba(249, 159, 57, 1)',
        panelId: 'panel-radiation',
        dailyChartId: 'radDailyChart', weeklyChartId: 'radWeeklyChart',
        currentValId: 'rad-current-val', 
        statusId: 'rad-current-status', // TAMBAHAN BARU
        statusType: 'radiasi',          // TAMBAHAN BARU
        dailyAvgId: 'rad-daily-average', weeklyAvgId: 'rad-weekly-average'
    },
    'co2' : {
        field: 'field2', unit: 'PPM', decimals: 1, color: 'rgba(87, 219, 171, 1)',
        panelId: 'panel-co2',
        dailyChartId: 'co2DailyChart', weeklyChartId: 'co2WeeklyChart',
        currentValId: 'co2-current-val', 
        statusId: 'co2-current-status', // TAMBAHAN BARU
        statusType: 'karbon',           // TAMBAHAN BARU
        dailyAvgId: 'co2-daily-average', weeklyAvgId: 'co2-weekly-average'
    },
    'suhu' : {
        field: 'field3', unit: '°C', decimals: 1, color: 'rgba(116, 148, 190, 1)',
        panelId: 'panel-temp',
        dailyChartId: 'tempDailyChart', weeklyChartId: 'tempWeeklyChart',
        currentValId: 'temp-current-val', 
        statusId: 'temp-current-status', // TAMBAHAN BARU
        statusType: 'suhu',              // TAMBAHAN BARU
        dailyAvgId: 'temp-daily-average', weeklyAvgId: 'temp-weekly-average'
    },
    'kelembapan' : {
        field: 'field4', unit: '%', decimals: 1, color: 'rgba(116, 148, 190, 1)',
        panelId: 'panel-humid',
        dailyChartId: 'humidDailyChart', weeklyChartId: 'humidWeeklyChart',
        currentValId: 'humid-current-val', 
        statusId: 'humid-current-status', // TAMBAHAN BARU
        statusType: 'lembab',             // TAMBAHAN BARU
        dailyAvgId: 'humid-daily-average', weeklyAvgId: 'humid-weekly-average'
    }
};

let activeCharts = {}; 

const API_URLS = {
    ThinkSpeak: `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=1&api_key=${READ_API_KEY}`,
    forecast:'https://api.open-meteo.com/v1/forecast?latitude=-7.775040835568914&longitude=110.40497111653978&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=temperature_2m,relative_humidity_2m&forecast_days=7&timezone=Asia%2FJakarta'};

// FUNGSI HELPER //
function formatDateKey(dateObj) {
    return `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
}

function getStatus(val, type) {
    if (isNaN(val) || val === null) return { text: "N/A", color: "gray" };
    
    if (type === 'karbon') { // PPM
        if (val <= 1000) return { text: "AMAN", color: "#34d399" };
        if (val <= 2000) return { text: "WASPADA", color: "#facc15" };
        return { text: "BAHAYA", color: "#f43f5e" };
    }
    if (type === 'suhu') { // Celcius
        if (val <= 19) return {text: "DINGIN", color: "#2daafdff"};
        if (val >= 20 && val <= 29) return { text: "NYAMAN", color: "#34d399" };
        if (val > 29 && val <= 34) return { text: "HANGAT", color: "#facc15" };
        if (val >= 35) return { text: "PANAS", color: "#f43f5e" };
    }
    if (type === 'radiasi') { // CPM (Sesuaikan threshold CPM-nya)
        if (val <= 50) return { text: "NORMAL", color: "#34d399" };
        return { text: "BAHAYA", color: "#f43f5e" };
    }
    if (type === 'lembab') { // %
        if (val >= 40 && val <= 60) return { text: "IDEAL", color: "#34d399" };
        return { text: "NORMAL", color: "#2daafdff" };
    }
    return { text: "Info", color: "black" };
}



// FUNGSI HANDLE //
/**
 * 1. DATA THINKSPEAK (Memperbarui 4 Kartu Metrik)
 * @param {Object} dataFeed - Object feed terakhir (d) dari ThingSpeak
 */
function updateMetricCards(dataFeed) {

    for (const sensorType in SENSORS) {
        if (SENSORS.hasOwnProperty(sensorType)) {
            const sensorConfig = SENSORS[sensorType];

            const fieldKey = sensorConfig.field;
            const htmlId = sensorConfig.htmlId;
            const unit = sensorConfig.unit;

            const rawValue = dataFeed[fieldKey];
            const value = parseFloat(rawValue);
            const decimals = (sensorType === 'radiasi') ? 3 : 1;
            const element = document.getElementById(htmlId);

            if (element) {
                let formattedValue;

                // PERBAIKAN 1: Logika isNaN dibalik
                if (isNaN(value)) {
                    formattedValue = "--"; // Tampilkan '--' jika bukan angka
                } else {
                    formattedValue = value.toFixed(decimals) + ' ' + unit; // Tampilkan nilai
                }
                element.textContent = formattedValue;
            }
        }
    }
}

/**
 * 2. DATA STATUS LORA GPS & BATERAI
 * @param {object} dataFeed - (d) data terakhir
 */
function updateStatusIndicators(dataFeed) {
    const batt = parseFloat(dataFeed[STATUS_FIELDS.BATT_FIELD]);
    const rssi = parseFloat(dataFeed[STATUS_FIELDS.RSSI_FIELD]);
    const lat = dataFeed[STATUS_FIELDS.GPS_LAT_FIELD];

    const bVal = isNaN(batt) ? 0 : Math.min(100, Math.max(0, batt));
    const elBat = document.getElementById('battery-status-value');
    const batIcon = document.getElementById('battery-icon');

    if (elBat) {
        elBat.textContent = bVal.toFixed(0) + "%";
    }
    if (batIcon) {
        batIcon.style.fill ='#1760fd';
    }

    const rVal = isNaN(rssi) ? -120 : rssi;
    const wifiVal = document.getElementById('wifi-status-value');
    const wifiIcon = document.getElementById('wifi-icon');
    const wifiName = document.getElementById('wifi-name');

    if (wifiVal && wifiIcon) {
        wifiVal.textContent = rVal + " dBm";
        
        if (rVal > -70) {
            wifiVal.style.color = '#13DE7', wifiIcon.style.fill = '#13DE7', wifiName.style.color = '#13DE7';
        }
        if (rVal > -90) {
            wifiVal.style.color = 'orange', wifiIcon.style.fill = 'orange', wifiName.style.color = 'orange';
        }
    }

    const gpsVal = document.getElementById('gps-status-value');
    const gpsIcon = document.getElementById('gps-icon');

    if (lat && lat !== "N/A" && lat !== "0" && !isNaN(parseFloat(lat))) {
        if(gpsVal) gpsVal.textContent = "Aktif";
        if(gpsIcon) gpsIcon.style.fill = '#1760fd';
    } else {
        if(gpsVal) gpsVal.textContent = "Tidak Aktif";
        if(gpsIcon) gpsIcon.style.fill = '#1760fd';
    }
}

/**
 * 3. RENDER CHART (DIPERBAIKI: DISTRIBUSI LABEL MERATA)
 */
function renderChart(canvasId, type, labels, data, color, labelName) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error("Canvas tidak ditemukan:", canvasId);
        return;
    }
    
    const ctx = canvas.getContext('2d');

    // Hapus chart lama
    if (activeCharts[canvasId]) {
        activeCharts[canvasId].destroy();
    }

    const isWeekly = canvasId.includes('Weekly');
    const totalData = labels.length; // Hitung total jumlah data

    // --- KONFIGURASI SUMBU X ---
    const xTickConfig = {
        grid: { display: false },
        ticks: {
            font: { size: 10 },
            maxRotation: 0,
            autoSkip: false, // Kita atur manual, jadi matikan autoSkip bawaan
            
            // CALLBACK: Logika manual untuk menentukan label mana yang muncul
            callback: function(val, index) {
                // val = index data saat ini
                const label = this.getLabelForValue(val);

                // KASUS 1: MINGGUAN (Tampilkan Semua)
                if (isWeekly) {
                    return label; 
                }

                // KASUS 2: HARIAN (Tampilkan per ~4 jam)
                // Logika: Kita bagi total data dengan 6 (karena 24 jam / 4 jam = 6 segmen)
                // Contoh: Jika ada 100 data, step = 16. Label muncul di index 0, 16, 32...
                const step = Math.ceil(totalData / 6);
                
                // Tampilkan label jika:
                // 1. Ini data pertama (index 0)
                // 2. ATAU ini data terakhir
                // 3. ATAU index saat ini kelipatan dari step
                if (index === 0 || index === totalData - 1 || index % step === 0) {
                    return label;
                }
                
                // Sembunyikan label lainnya
                return null; 
            }
        }
    };

    // Buat Chart Baru
    activeCharts[canvasId] = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: labelName,
                data: data,
                borderColor: color,
                backgroundColor: type === 'bar' ? color : color.replace('1)', '0.2)'), 
                borderWidth: 2,
                tension: 0.3,
                fill: type === 'line', 
                borderRadius: type === 'bar' ? 5 : 0,
                pointRadius: 1, // Titik garis
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: { legend: { display: false } },
            scales: {
                x: xTickConfig, // Gunakan config custom di atas
                y: { beginAtZero: false } 
            }
        }
    });
}

/**
 * 4. LOAD DATA ANALYTIC (Chart & Detail Angka)
 */
async function loadSensorAnalytics(sensorKey) {
    const config = SENSOR_CONFIG[sensorKey];
    if (!config) return;

    // URL: Daily (24 jam = 1440 menit), Weekly (7 hari)
    const urlDaily = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?minutes=1440&api_key=${READ_API_KEY}`;
    const urlWeekly = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?days=7&api_key=${READ_API_KEY}`;

    try {
        // --- PROSES DAILY ---
        const respDaily = await fetch(urlDaily);
        const dataDaily = await respDaily.json();

        let labelsDaily = [];
        let valuesDaily = [];
        let sumDaily = 0;
        let countDaily = 0;

        dataDaily.feeds.forEach(feed => {
            let value = feed[config.field];

            // Filter data kosong/null
            if (value !== null && value !== undefined && value !== "") {
                let floatVal = parseFloat(value);
                if(!isNaN(floatVal)) {
                    let dateObj = new Date(feed.created_at);
                    let timeLabel = dateObj.toLocaleTimeString('id-ID', {
                        hour: '2-digit', minute: '2-digit', hour12: false
                    });

                    labelsDaily.push(timeLabel);
                    valuesDaily.push(floatVal);
                    sumDaily += floatVal;
                    countDaily++;
                }
            }
        });

        // Update Text Nilai
        const lastValRaw = valuesDaily.length > 0 ? valuesDaily[valuesDaily.length - 1] : 0;
        const dailyAvgRaw = countDaily > 0 ? (sumDaily / countDaily) : 0;
        const lastValFormatted = lastValRaw.toFixed(config.decimals) + ' ' + config.unit;
        const dailyAvgFormatted = dailyAvgRaw.toFixed(config.decimals) + ' ' + config.unit;

        const elVal = document.getElementById(config.currentValId);
        if(elVal) elVal.innerText = lastValFormatted;

        const elAvgD = document.getElementById(config.dailyAvgId);
        if(elAvgD) elAvgD.innerText = dailyAvgFormatted;

        // --- FIX STATUS COLORING ---
        // Kita hanya ubah warna TEKS (h3) dan BORDER KOTAK (div parent)
        const statusData = getStatus(lastValRaw, config.statusType);
        const elStatus = document.getElementById(config.statusId);
        
        if(elStatus) {
            elStatus.innerText = statusData.text; // Ubah teks status
            elStatus.style.color = statusData.color; // Ubah warna teks status
        }

        renderChart(config.dailyChartId, 'line', labelsDaily, valuesDaily, config.color, "Harian");


        // --- PROSES WEEKLY ---
        const respWeekly = await fetch(urlWeekly);
        const dataWeekly = await respWeekly.json();

        const dailyDataMap = {};
        dataWeekly.feeds.forEach(feed => {
            const val = parseFloat(feed[config.field]);
            if (!isNaN(val)) {
                const d = new Date(feed.created_at);
                const key = formatDateKey(d);
                if (!dailyDataMap[key]) dailyDataMap[key] = { sum: 0, count: 0 };
                dailyDataMap[key].sum += val;
                dailyDataMap[key].count++;
            }
        });

        let labelsWeekly = [];
        let valuesWeekly = [];
        let totalWeeklySum = 0;
        let totalWeeklyCount = 0;

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = formatDateKey(d);
            const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
            
            labelsWeekly.push(`${dayName} (${key})`);

            if (dailyDataMap[key]) {
                const avg = dailyDataMap[key].sum / dailyDataMap[key].count;
                valuesWeekly.push(avg.toFixed(2));
                totalWeeklySum += avg;
                totalWeeklyCount++;
            } else {
                valuesWeekly.push(0);
            }
        }

        const weeklyAvgRaw = totalWeeklyCount > 0 ? (totalWeeklySum / totalWeeklyCount) : 0;
        const weeklyAvgFormatted = weeklyAvgRaw.toFixed(config.decimals) + ' ' + config.unit;

        const elAvgW = document.getElementById(config.weeklyAvgId);
        if(elAvgW) elAvgW.innerText = weeklyAvgFormatted;

        renderChart(config.weeklyChartId, 'bar', labelsWeekly, valuesWeekly, config.color, "Rata-rata Mingguan");

    } catch (error) {
        console.error("Error loading charts:", error);
    }
}

/**
 * 5. DATA OPENWEATHER (Memperbarui Prakiraan Cuaca)*/
function updateForecastData(data) {
    const fc = document.getElementById('cuaca-placeholder');

    if (!fc || !data.daily) {
        if (fc) fc.innerHTML = '<p>Data cuaca tidak tersedia.</p>';
        return;
    }

    const daily = data.daily;
    let html = '';

    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const dayLabel = date.toLocaleDateString('id-ID', {weekday: 'long'});

        html += `
            <div class="forecast-row">
                <span class="forecast-day">${dayLabel}</span>
                <div class="forecast-details">
                <span class="forecast-humidity">
                <svg viewBox="0 0 20 23" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.623002 13.1969C0.215487 13.9095 0 14.7233 0 15.5503C0 18.1486 2.09353 20.2624 4.66669 20.2624C7.23985 20.2624 9.33321 18.1486 9.33321 15.5503C9.33321 14.7233 9.11789 13.9095 8.71038 13.1969L4.66669 6.59667C4.65383 6.6179 4.94926 6.1357 0.623002 13.1969ZM7.99997 15.5503C7.99997 17.4062 6.50476 18.9161 4.66669 18.9161C2.82862 18.9161 1.33341 17.4062 1.33341 15.5503C1.33341 14.9627 1.4853 14.3848 1.7729 13.8784L4.66669 9.15564L7.56048 13.8784C7.84808 14.3848 7.99997 14.9627 7.99997 15.5503ZM19.377 15.8894L15.3333 9.28935C15.3203 9.31041 15.6157 8.82838 11.2896 15.8894C10.8821 16.6021 10.6666 17.416 10.6666 18.243C10.6666 20.866 12.7601 23 15.3333 23C17.9065 23 20 20.866 20 18.243C20 17.416 19.7845 16.6023 19.377 15.8894ZM15.3333 21.6537C13.4952 21.6537 12 20.1236 12 18.243C12 17.6553 12.1519 17.0773 12.4395 16.5711L15.3333 11.8481L18.2271 16.5711C18.5147 17.0773 18.6666 17.6553 18.6666 18.243C18.6666 20.1236 17.1712 21.6537 15.3333 21.6537ZM11.3334 0C11.2978 0.0596619 11.5466 -0.357971 8.44449 4.84963C8.15376 5.35711 7.99997 5.93811 7.99997 6.52982C7.99997 8.38565 9.49534 9.89562 11.3332 9.89562C13.1713 9.89562 14.6667 8.38565 14.6667 6.52982C14.6667 5.93776 14.5127 5.35641 14.2213 4.84858L11.3334 0ZM11.3332 8.54937C10.2306 8.54937 9.33338 7.64339 9.33338 6.52982C9.33338 6.17623 9.42409 5.83002 9.59596 5.52837L11.3332 2.61196L13.0702 5.52785C13.2424 5.82984 13.3333 6.17623 13.3333 6.52982C13.3333 7.64339 12.436 8.54937 11.3332 8.54937Z"/>
                </svg>
                ${daily.precipitation_probability_max[i]}%
                </span>
                    <span class="forecast-temp">${daily.temperature_2m_max[i]}°C / ${daily.temperature_2m_min[i]}°C
                    </span>
                    
                </div>
            </div>
        `;
    }

    fc.innerHTML = html;
}

/**
 * 6. Logika Pemrosesan Data ThingSpeak (Mengambil data terakhir)
 * @param {Object} json - Object feeds lengkap dari ThingSpeak
 */
function processThingspeakData(json) {
    if (!json.feeds || json.feeds.length === 0) return;
    const d = json.feeds[0];

         updateMetricCards(d);
         updateStatusIndicators(d);
}


// FUNGSI FETCH DATA (DATA UTAMA) //
async function updateDashboard() {
    console.log ('Memperbarui dashboard...');

    try {
        const [thinkSpeakResponse, forecastResponse] = await Promise.all([
            fetch(API_URLS.ThinkSpeak),
            fetch(API_URLS.forecast)
        ]);

        if (!thinkSpeakResponse.ok || !forecastResponse.ok) {
            throw new Error(`Alamat API atau gagal mengambil data. Status TS: ${thinkSpeakResponse.status}, Status OWM: ${forecastResponse.status}`);
        }

        const thinkSpeakData = await thinkSpeakResponse.json();
        const forecastData = await forecastResponse.json();

        // PERBAIKAN 2 & 3: Pastikan pemanggilan fungsi benar dan menggunakan data yang sudah di-parse
        processThingspeakData(thinkSpeakData);
        updateForecastData(forecastData);

    } catch (error) {
        console.error('Error memperbarui dashboard:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();

    setInterval(updateDashboard, 15000);
});

 // FUNGSI INSTALASI DAN NAVIGASI //

document.addEventListener('DOMContentLoaded', function() {

    // NAVIGATION
    const navDashBtn = document.getElementById('dash-btn');
    const navDataBtn = document.getElementById('data-btn');
    const homeView = document.getElementById('home-view');
    const analyticView = document.getElementById('analytic-view');
    const pageTitle = document.getElementById('page-title');

    const cardSection = document.getElementById('cards-section');
    const weatherSection = document.getElementById('weather-section');
    const mapsSection = document.getElementById('map-section');


    function handleResponsiveLayout() {
        const isDesktop = window.innerWidth > 992;

        if (isDesktop) {
            // --- MODE DESKTOP ---
            // Saat di desktop, kita WAJIB mereset (menghapus) style yang ditempel oleh mode mobile.
            // Kita set ke '' (kosong) agar browser kembali mengikuti aturan file CSS (style.css).
            
            // Pastikan Home View menampilkan semua bagiannya
            if(cardSection) cardSection.style.display = ''; 
            if(weatherSection) weatherSection.style.display = ''; 
            if(mapsSection) mapsSection.style.display = '';
            
        }
        else {
            // --- MODE MOBILE ---
            // Cek tab mana yang sedang aktif (Home / Analytic / Weather)
            const weatherBtn = document.querySelector('.nav-item[data-page="weather"]');
            const analyticBtn = document.querySelector('.nav-item[data-page="analytic"]');
            
            const isWeatherActive = weatherBtn && weatherBtn.classList.contains('active');
            const isAnalyticActive = analyticBtn && analyticBtn.classList.contains('active');

            if (!isAnalyticActive) {
                if (isWeatherActive) {
                    // TAB CUACA: Sembunyikan Kartu & Peta, Tampilkan Cuaca
                    if(cardSection) cardSection.style.display = 'none';
                    if(mapsSection) mapsSection.style.display = 'none';
                    if(weatherSection) weatherSection.style.display = '';
                } else {
                    // TAB HOME (Default): Tampilkan Kartu & Peta, Sembunyikan Cuaca
                    if(cardSection) cardSection.style.display = '';
                    if(mapsSection) mapsSection.style.display = '';
                    if(weatherSection) weatherSection.style.display = 'none';
                }
            }
        }
    }
    handleResponsiveLayout();
    window.addEventListener('resize', handleResponsiveLayout);

    function showElement(el) {
        if (el) el.style.display = ''; 
    }
    // Fungsi ini memaksa elemen hilang
    function hideElement(el) {
        if (el) el.style.display = 'none';
    }

    if(navDashBtn && navDataBtn && homeView && analyticView && pageTitle) {
        navDashBtn.addEventListener('click', function(e) {
            e.preventDefault();
            homeView.classList.remove('hidden');
            analyticView.classList.add('hidden');
            navDashBtn.classList.add('active');
            navDataBtn.classList.remove('active');
            pageTitle.innerHTML = 'Pantauan<br>Lingkungan';
        });

        navDataBtn.addEventListener('click', function(e) {
            e.preventDefault();
            homeView.classList.add('hidden');
            analyticView.classList.remove('hidden');
            navDashBtn.classList.remove('active');
            navDataBtn.classList.add('active');
            pageTitle.innerHTML = 'Analisa<br>Data';
        });
    }

    // MOBILE NAVIGATION
    const mobileNavItems = document.querySelectorAll('.mobile-bottom-nav .nav-item');
    
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const page = this.getAttribute('data-page');
            
            mobileNavItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            if (page === 'analytic') {
                homeView.classList.add('hidden');
                analyticView.classList.remove('hidden');
            }
            else {
                homeView.classList.remove('hidden');
                analyticView.classList.add('hidden');

                if(page === 'home') {
                    if(cardSection) cardSection.style.display = '';
                    if(mapsSection) mapsSection.style.display = '';
                    if (weatherSection) weatherSection.style.display = 'none';
                }
                else if (page === 'weather') {
                    if (cardSection) cardSection.style.display = 'none';
                    if (mapsSection) mapsSection.style.display = 'none';
                    if (weatherSection) weatherSection.style.display = '';
                }
            }
        });
    });

    if(navDashBtn) {
        navDashBtn.addEventListener('click', function() {
            if(cardSection) cardSection.style.display = '';
            if(mapsSection) mapsSection.style.display = '';
            if(weatherSection) weatherSection.style.display = '';
        });
    }

    // NAVIGASI SUB BUTTON
    function setupAnalyticNavigation() {

        const NAV_MAPPING = {
            'rad-btn' : 'panel-radiation',
            'c02-btn' : 'panel-co2',
            'temp-btn' : 'panel-temp',
            'humid-btn' : 'panel-humid'
        };

        const DATA_MAPPING = {
            'rad-btn' : 'radiasi',
            'c02-btn' : 'co2',
            'temp-btn' : 'suhu',
            'humid-btn' : 'kelembapan'
        };

        const allSubButtons = document.querySelectorAll('.sub-btn');
        const allPanels = document.querySelectorAll('.sensor-panel');

        allSubButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();

                allSubButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                allPanels.forEach(panel => {
                    panel.classList.add('hidden');
                });

                const panelTargetId = NAV_MAPPING[btn.id];
                const targetPanel = document.getElementById(panelTargetId);

                if (targetPanel) {
                    targetPanel.classList.remove('hidden');
                }

                const sensorKey = DATA_MAPPING[btn.id]; 
                if (sensorKey) {
                    loadSensorAnalytics(sensorKey);
                }
            });
        });
        loadSensorAnalytics('radiasi');
    }
    setupAnalyticNavigation();
});

 
