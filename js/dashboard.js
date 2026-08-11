/***************************************************
 * DASHBOARD.JS
 * Dashboard Mahasiswa
 ***************************************************/


/* ================================================
   MENAMPILKAN DASHBOARD
================================================ */

async function showDashboard() {

    const user = getUser();


    if (!user) {

        showLogin();

        return;

    }


    document.getElementById("app").innerHTML = `

        <section class="dashboard">

            <header class="dashboard-header">

                <div>

                    <small>
                        Selamat Datang
                    </small>

                    <h2>
                        ${escapeHTML(user.nama)}
                    </h2>

                    <p>
                        ${escapeHTML(
                            user.divisi || "Peserta Magang"
                        )}
                    </p>

                </div>


                <button
                    class="btn-logout"
                    onclick="logout()">

                    Keluar

                </button>

            </header>


            <div class="status-card">

                <div class="status-title">
                    Status Absensi Hari Ini
                </div>

                <div
                    id="attendanceStatus"
                    class="status-value">

                    Memuat...

                </div>

            </div>


            <div class="attendance-card">

                <h3>
                    Absensi
                </h3>

                <p>
                    Silakan scan QR Code untuk
                    melakukan absensi masuk atau pulang.
                </p>


                <button
                    class="btn-primary"
                    onclick="startScanner()">

                    📷 Scan QR Code

                </button>

            </div>

            <div class="install-card" id="dashboardInstallCard" style="display:none;">

                <button
                    class="btn-secondary"
                    id="dashboardInstallButton"
                >
                    Pasang Aplikasi
                </button>

            </div>

            <div class="menu-card">

                <button
                    onclick="showHistory()">

                    📋 Riwayat Absensi

                </button>

            </div>

        </section>

    `;


    loadDashboardData();

}


/* ================================================
   DATA DASHBOARD
================================================ */

async function loadDashboardData() {

    const user = getUser();


    if (!user) {

        return;

    }


    const result = await apiRequest(

        "dashboard",

        {

            nim: user.nim

        }

    );


    const statusElement =
        document.getElementById(
            "attendanceStatus"
        );


    if (!statusElement) {

        return;

    }


    if (!result.status) {

        statusElement.textContent =
            "Tidak dapat memuat data";

        statusElement.className =
            "status-value status-danger";

        return;

    }


    const hariIni =
        result.data.hariIni;


    if (!hariIni) {

        statusElement.textContent =
            "Belum Absen";

        statusElement.className =
            "status-value status-warning";

        return;

    }


    if (
        hariIni.jamMasuk &&
        !hariIni.jamPulang
    ) {

        statusElement.textContent =
            `Sudah Masuk - ${hariIni.jamMasuk}`;

        statusElement.className =
            "status-value status-success";

        return;

    }


    if (
        hariIni.jamMasuk &&
        hariIni.jamPulang
    ) {

        statusElement.textContent =
            "Sudah Absen Lengkap";

        statusElement.className =
            "status-value status-success";

    }

}


/* ================================================
   ESCAPE HTML
================================================ */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;

}


/* ================================================
   RIWAYAT ABSENSI
================================================ */

async function showHistory() {

    const user = getUser();

    if (!user) {
        showLogin();
        return;
    }

    document.getElementById("app").innerHTML = `

        <section class="history">

            <header class="history-header">

                <button
                    class="btn-back"
                    onclick="showDashboard()">
                    ← Kembali
                </button>

                <h2>Riwayat Absensi</h2>

            </header>

            <div id="historyContainer" class="history-container">

                <div class="loading">
                    Memuat data...
                </div>

            </div>

        </section>

    `;

    loadHistoryData(user.nim);

}


async function loadHistoryData(nim) {

    const result = await apiRequest(

        "history",

        {

            nim: nim

        }

    );

    const container =
        document.getElementById(
            "historyContainer"
        );

    if (!container) {
        return;
    }

    if (!result.status) {

        container.innerHTML = `

            <div class="error-message">
                Tidak dapat memuat riwayat absensi.
                ${result.message || ""}
            </div>

        `;

        return;

    }

    const records = result.data || [];

    if (records.length === 0) {

        container.innerHTML = `

            <div class="empty-message">
                Belum ada riwayat absensi.
            </div>

        `;

        return;

    }

    let html = '<div class="history-table">';

    records.forEach(function(record, index) {

        const tanggal = record.tanggal || '-';
        const jam = record.jam || '-';
        const status = record.status || '-';
        const qr = record.qr || '-';

        html += `

            <div class="history-row">

                <div class="history-cell">
                    <strong>Tanggal:</strong>
                    ${escapeHTML(tanggal)}
                </div>

                <div class="history-cell">
                    <strong>Jam:</strong>
                    ${escapeHTML(jam)}
                </div>

                <div class="history-cell">
                    <strong>Status:</strong>
                    ${escapeHTML(status)}
                </div>

                <div class="history-cell">
                    <strong>QR Code:</strong>
                    ${escapeHTML(qr)}
                </div>

            </div>

        `;

    });

    html += '</div>';

    container.innerHTML = html;

}