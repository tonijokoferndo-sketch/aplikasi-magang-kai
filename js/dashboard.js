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