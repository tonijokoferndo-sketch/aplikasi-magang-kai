/***************************************************
 * APP.JS
 * Aplikasi utama Absensi Magang KAI
 ***************************************************/


let deferredInstallPrompt = null;
let selectedRole = null;
// Read role from URL query (e.g., index.html?role=admin)
try {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam) selectedRole = String(roleParam).toLowerCase();
} catch (e) {}

window.addEventListener(
    "beforeinstallprompt",
    function (event) {

        event.preventDefault();
        deferredInstallPrompt = event;
        console.log("PWA install prompt tersedia");
        initializeInstallButton();

    }
);

window.addEventListener(
    "appinstalled",
    function () {
        console.log("Aplikasi berhasil dipasang.");
    }
);

document.addEventListener(
    "DOMContentLoaded",
    function () {

        startApp();

    }
);


/* ================================================
   START APPLICATION
================================================ */

function startApp() {

    const loading =
        document.getElementById(
            "loadingScreen"
        );


    /*
     * Beri sedikit waktu agar
     * loading screen terlihat.
     */

    setTimeout(
        function () {

            if (loading) {

                loading.style.display =
                    "none";

            }


            /*
             * Cek apakah user sudah login
             */

           if (user) {

             if (
               String(user.role || "").toLowerCase() === "admin"
                 ) {

                      showAdmin();

                     } else {

                         showDashboard();

                     }  

                        } else {

                            showLogin();
                                }

            

        },

        700

    );

}


/* ================================================
   TAMPILKAN LOGIN (Terpisah: LOGIN & REGISTER)
================================================ */

function showLogin() {

    const app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <div class="login-container">

            <div class="login-card">

                <div class="logo-container">
                    <div class="logo-placeholder">
                        <img src="assets/icon-192.png" alt="KAI" class="login-logo-img">
                    </div>
                </div>

                <h1>
                    ABSENSI MAGANG
                </h1>

                <p class="subtitle">
                    PT KAI DIVRE II SUMBAR
                </p>


                <!-- LOGIN SECTION -->
                <div id="loginSection" class="auth-section">

                    <form id="loginForm">

                        <div class="form-group">

                            <label for="nimLogin">
                                NIM
                            </label>

                            <input
                                type="text"
                                id="nimLogin"
                                placeholder="Masukkan NIM"
                                autocomplete="username"
                                required
                            >

                        </div>


                        <div class="form-group">

                            <label for="passwordLogin">
                                Password
                            </label>

                            <input
                                type="password"
                                id="passwordLogin"
                                placeholder="Masukkan Password"
                                autocomplete="current-password"
                                required
                            >

                        </div>


                        <button
                            type="submit"
                            id="loginButton"
                            class="btn-primary"
                        >

                            LOGIN

                        </button>

                    </form>


                    <p class="message" id="loginMessage"></p>
                    <p id="loginRoleLabel" style="display:none;margin-top:8px;color:#333;font-weight:600"></p>

                    <p style="text-align:center;margin-top:15px;font-size:14px;">
                        Belum punya akun?
                        <a href="#" id="switchToRegister" style="color:var(--kai-blue);font-weight:700;text-decoration:none;cursor:pointer;">
                            Daftar di sini
                        </a>
                    </p>

                </div>


                <!-- REGISTER SECTION -->
                <div id="registerSection" class="auth-section" style="display:none;">

                    <form id="registerForm">

                        <div class="form-group">

                            <label for="nimRegister">
                                NIM
                            </label>

                            <input
                                type="text"
                                id="nimRegister"
                                placeholder="Masukkan NIM"
                                autocomplete="username"
                                required
                            >

                        </div>


                        <div class="form-group">

                            <label for="namaRegister">
                                Nama Lengkap
                            </label>

                            <input
                                type="text"
                                id="namaRegister"
                                placeholder="Masukkan Nama Lengkap"
                                autocomplete="name"
                                required
                            >

                        </div>


                        <div class="form-group">

                            <label for="divisiRegister">
                                Divisi / Instansi
                            </label>

                            <input
                                type="text"
                                id="divisiRegister"
                                placeholder="Contoh: IT / Operasi"
                                autocomplete="organization"
                            >

                        </div>


                        <div class="form-group">

                            <label for="passwordRegister">
                                Password
                            </label>

                            <input
                                type="password"
                                id="passwordRegister"
                                placeholder="Masukkan Password"
                                autocomplete="new-password"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label for="roleRegister">
                                Daftar sebagai
                            </label>

                            <select id="roleRegister">
                                <option value="user" selected>Pengguna (User)</option>
                                <option value="admin">Administrator</option>
                            </select>

                        </div>


                        <button
                            type="submit"
                            id="registerButton"
                            class="btn-primary"
                        >

                            DAFTAR

                        </button>

                    </form>


                    <p class="message" id="registerMessage"></p>

                    <p style="text-align:center;margin-top:15px;font-size:14px;">
                        Sudah punya akun?
                        <a href="#" id="switchToLogin" style="color:var(--kai-blue);font-weight:700;text-decoration:none;cursor:pointer;">
                            Login di sini
                        </a>
                    </p>

                </div>


                <button
                    type="button"
                    id="installAppButton"
                    class="btn-secondary"
                    style="display:none;margin:10px auto 0;"
                >
                    Pasang Aplikasi
                </button>

                <p class="login-footer">

                    Sistem Absensi Mahasiswa Magang

                </p>

            </div>

        </div>

    `;


    const loginSection =
        document.getElementById(
            "loginSection"
        );

    const registerSection =
        document.getElementById(
            "registerSection"
        );

    const switchToRegisterLink =
        document.getElementById(
            "switchToRegister"
        );

    const switchToLoginLink =
        document.getElementById(
            "switchToLogin"
        );

    const loginForm =
        document.getElementById(
            "loginForm"
        );

    const registerForm =
        document.getElementById(
            "registerForm"
        );

    const loginMessage =
        document.getElementById(
            "loginMessage"
        );

    const registerMessage =
        document.getElementById(
            "registerMessage"
        );

    // If a role was selected earlier, preselect it in register form and show on login
    try {
        const roleSelect = document.getElementById('roleRegister');
        if (roleSelect && selectedRole) {
            roleSelect.value = selectedRole;
        }

        const loginRoleLabel = document.getElementById('loginRoleLabel');
        if (loginRoleLabel) {
            if (selectedRole) {
                loginRoleLabel.textContent = 'Masuk sebagai: ' + (selectedRole === 'admin' ? 'Administrator' : 'Pengguna');
                loginRoleLabel.style.display = 'block';
            } else {
                loginRoleLabel.style.display = 'none';
            }
        }
    } catch (e) {
        // ignore
    }


    switchToRegisterLink.addEventListener(
        "click",
        function(e) {
            e.preventDefault();
            loginSection.style.display = "none";
            registerSection.style.display = "block";
            loginMessage.textContent = "";
            loginMessage.style.color = "#333";
            document.getElementById("nimRegister").focus();
        }
    );


    switchToLoginLink.addEventListener(
        "click",
        function(e) {
            e.preventDefault();
            registerSection.style.display = "none";
            loginSection.style.display = "block";
            registerMessage.textContent = "";
            registerMessage.style.color = "#333";
            document.getElementById("nimLogin").focus();
        }
    );


    loginForm.addEventListener(
        "submit",
        async function(e) {
            e.preventDefault();

            const nim =
                document.getElementById(
                    "nimLogin"
                ).value.trim();

            const password =
                document.getElementById(
                    "passwordLogin"
                ).value;

            if (!nim || !password) {
                loginMessage.textContent =
                    "NIM dan Password wajib diisi.";
                loginMessage.style.color =
                    "#dc3545";
                return;
            }

            const button =
                document.getElementById(
                    "loginButton"
                );

            button.disabled = true;
            button.textContent = "MEMPROSES...";

            try {
                const result =
                    await login(nim, password);

                if (result.status) {
                        loginMessage.textContent = result.message;
                        loginMessage.style.color = "#28a745";

                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                        setTimeout(function() {
                            if (user && user.role && String(user.role).toLowerCase() === 'admin') {
                                showAdmin();
                            } else {
                                showDashboard();
                            }
                        }, 600);
                    } else {
                    loginMessage.textContent =
                        result.message ||
                        "Login gagal.";
                    loginMessage.style.color =
                        "#dc3545";
                }
            } catch (error) {
                console.error(
                    "Login error:",
                    error
                );
                loginMessage.textContent =
                    "Terjadi kesalahan saat login.";
                loginMessage.style.color =
                    "#dc3545";
            } finally {
                button.disabled = false;
                button.textContent = "LOGIN";
            }
        }
    );


    registerForm.addEventListener(
        "submit",
        async function(e) {
            e.preventDefault();

            const nim =
                document.getElementById(
                    "nimRegister"
                ).value.trim();

            const nama =
                document.getElementById(
                    "namaRegister"
                ).value.trim();

            const divisi =
                document.getElementById(
                    "divisiRegister"
                ).value.trim();

            const password =
                document.getElementById(
                    "passwordRegister"
                ).value;

            if (!nim || !password || !nama) {
                registerMessage.textContent =
                    "NIM, Nama, dan Password wajib diisi.";
                registerMessage.style.color =
                    "#dc3545";
                return;
            }

            const button =
                document.getElementById(
                    "registerButton"
                );

            button.disabled = true;
            button.textContent = "MEMPROSES...";

            try {
                const role = document.getElementById('roleRegister') ? document.getElementById('roleRegister').value : 'user';
                const result =
                        await register(
                            nim,
                            password,
                            nama,
                            divisi,
                            role
                        );

                if (result.status) {
                    registerMessage.textContent =
                        result.message ||
                        "Pendaftaran berhasil! Silakan login.";
                    registerMessage.style.color =
                        "#28a745";

                    setTimeout(
                        function() {
                            registerSection.style
                                .display = "none";
                            loginSection.style
                                .display = "block";
                            document.getElementById(
                                "nimLogin"
                            ).value = nim;
                            document.getElementById(
                                "nimLogin"
                            ).focus();
                        },
                        1200
                    );
                } else {
                    registerMessage.textContent =
                        result.message ||
                        "Pendaftaran gagal.";
                    registerMessage.style.color =
                        "#dc3545";
                }
            } catch (error) {
                console.error(
                    "Register error:",
                    error
                );
                registerMessage.textContent =
                    "Terjadi kesalahan saat mendaftar.";
                registerMessage.style.color =
                    "#dc3545";
            } finally {
                button.disabled = false;
                button.textContent = "DAFTAR";
            }
        }
    );

    initializeInstallButton();
}

function initializeInstallButton() {
    const loginInstallButton =
        document.getElementById(
            "installAppButton"
        );
    const dashboardInstallButton =
        document.getElementById(
            "dashboardInstallButton"
        );
    const dashboardInstallCard =
        document.getElementById(
            "dashboardInstallCard"
        );

    if (!deferredInstallPrompt) {
        if (loginInstallButton) {
            loginInstallButton.style.display = "none";
        }
        if (dashboardInstallCard) {
            dashboardInstallCard.style.display = "none";
        }
        return;
    }

    if (loginInstallButton) {
        loginInstallButton.style.display = "block";
        loginInstallButton.onclick = installApp;
    }

    if (dashboardInstallCard) {
        dashboardInstallCard.style.display = "block";
    }

    if (dashboardInstallButton) {
        dashboardInstallButton.onclick = installApp;
    }
}

/* ================================================
   ROLE CHOICE LANDING
   Show initial choice: User or Admin
================================================ */

function showRoleChoice() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="role-choice" style="display:flex;align-items:center;justify-content:center;height:75vh;">
            <div style="text-align:center;max-width:520px;width:100%;">
                <h1>Masuk sebagai</h1>
                <p>Pilih mode akses aplikasi</p>
                <div style="display:flex;gap:16px;justify-content:center;margin-top:20px;">
                    <button id="roleUserBtn" class="btn-primary" style="padding:14px 24px;">User</button>
                    <button id="roleAdminBtn" class="btn-secondary" style="padding:14px 24px;">Admin</button>
                </div>
                <p style="margin-top:18px;color:#666;font-size:14px;">Jika Anda admin, pilih <strong>Admin</strong> untuk membuka halaman admin.</p>
            </div>
        </div>
    `;

    document.getElementById('roleUserBtn').addEventListener('click', function() {
        selectedRole = 'user';
        showLogin();
    });

    document.getElementById('roleAdminBtn').addEventListener('click', function() {
        selectedRole = 'admin';
        showLogin();
    });
}

async function installApp() {
    if (!deferredInstallPrompt) {
        alert("Aplikasi tidak dapat dipasang saat ini.");
        return;
    }

    deferredInstallPrompt.prompt();

    const choiceResult =
        await deferredInstallPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
        console.log("Pengguna menerima pemasangan PWA");
    } else {
        console.log("Pengguna menolak pemasangan PWA");
    }

    deferredInstallPrompt = null;
    initializeInstallButton();
}


/* ================================================
   ESCAPE HTML
   Mencegah data user langsung menjadi HTML
================================================ */

function escapeHTML(value) {

    return String(value || "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}

/* ================================================
   ADMIN VIEW (Integrated)
================================================ */

function showAdmin() {
    const user = getUser();
    if (!user || String(user.role || '').toLowerCase() !== 'admin') {
        showLogin();
        return;
    }

    document.getElementById('app').innerHTML = `
        <section class="admin-section">
            <header style="display:flex;align-items:center;justify-content:space-between;">
                <div>
                    <h2>Admin - Generate QR Absensi</h2>
                    <p>Selamat datang, ${escapeHTML(user.nama)}</p>
                </div>
                <div>
                    <button onclick="showDashboard()" class="btn-secondary">Kembali</button>
                    <button id="adminLogoutBtn" class="btn-logout">Keluar</button>
                </div>
            </header>

            <div style="margin-top:12px;max-width:820px;">
                <label for="admin_nim">NIM (opsional untuk single QR)</label>
                <input id="admin_nim" placeholder="Contoh: 202311001" />

                <label for="admin_type">Tipe</label>
                <select id="admin_type"><option value="masuk">Masuk</option><option value="pulang">Pulang</option></select>

                <label for="admin_date">Tanggal</label>
                <input id="admin_date" type="date" />

                <label for="admin_start">Mulai (optional)</label>
                <input id="admin_start" placeholder="07:00" />

                <label for="admin_end">Selesai (optional)</label>
                <input id="admin_end" placeholder="08:00" />

                <div style="margin-top:10px;">
                    <button id="adminGenerateBtn" class="btn-primary">Generate QR</button>
                    <button id="adminFinalizeBtn" class="btn-secondary" style="margin-left:8px">Finalize Attendance</button>
                    <button id="adminViewSummary" class="btn-secondary" style="margin-left:8px">View Summary</button>
                    <button id="adminExportCsv" class="btn-secondary" style="margin-left:8px">Export CSV</button>
                </div>

                <div id="adminResult" style="margin-top:12px"></div>

                <div style="margin-top:12px" id="adminQrPreview" class="qr-preview"><img id="adminQrImg" style="max-width:300px;display:none;background:#fff;padding:10px;border-radius:8px;"/></div>

                <div id="adminSummaryContainer" style="margin-top:18px; display:none;">
                    <h3>Attendance Summary</h3>
                    <table id="adminSummaryTable" style="width:100%;border-collapse:collapse;border:1px solid #ddd">
                        <thead><tr><th style="border:1px solid #ddd;padding:6px">NIM</th><th style="border:1px solid #ddd;padding:6px">Nama</th><th style="border:1px solid #ddd;padding:6px">Status</th></tr></thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </section>
    `;

    document.getElementById('admin_date').value = new Date().toISOString().slice(0,10);

    let adminToken = null;
    (async function(){
        try {
            const tokenRes = await apiRequest('request_admin_token', { admin_nim: user.nim });
            if (tokenRes && tokenRes.status) adminToken = tokenRes.token;
        } catch (e) { console.error('token request failed', e); }
    })();

    document.getElementById('adminGenerateBtn').addEventListener('click', async function(){
        const nim = document.getElementById('admin_nim').value.trim();
        const type = document.getElementById('admin_type').value;
        const date = document.getElementById('admin_date').value;
        const start = document.getElementById('admin_start').value.trim();
        const end = document.getElementById('admin_end').value.trim();
        const payload = { admin_token: adminToken, type: type, date: date };
        if (nim) payload.nim = nim;
        if (start) payload.start = start;
        if (end) payload.end = end;
        const res = await apiRequest('generate_qr', payload);
        if (!res || !res.status) { alert('Gagal generate QR: ' + (res?.message||'')); return; }
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(res.qr)}`;
        const img = document.getElementById('adminQrImg'); img.src = url; img.style.display = 'block';
        document.getElementById('adminResult').textContent = res.message || 'QR dibuat';
    });

    document.getElementById('adminFinalizeBtn').addEventListener('click', async function(){
        const date = document.getElementById('admin_date').value;
        const res = await apiRequest('finalize_attendance', { admin_token: adminToken, date: date });
        if (!res || !res.status) { alert('Gagal finalize: ' + (res?.message||'')); return; }
        alert('Finalize berhasil');
    });

    document.getElementById('adminViewSummary').addEventListener('click', async function(){
        const date = document.getElementById('admin_date').value;
        const res = await apiRequest('get_attendance_summary', { admin_token: adminToken, date: date });
        if (!res || !res.status) { alert('Gagal mengambil summary'); return; }
        const rows = res.rows || [];
        const tbody = document.querySelector('#adminSummaryTable tbody'); tbody.innerHTML = '';
        rows.forEach(r => { const tr=document.createElement('tr'); tr.innerHTML = `<td style="border:1px solid #ddd;padding:6px">${r.nim}</td><td style="border:1px solid #ddd;padding:6px">${r.nama}</td><td style="border:1px solid #ddd;padding:6px">${r.status}</td>`; tbody.appendChild(tr); });
        document.getElementById('adminSummaryContainer').style.display = 'block';
    });

    document.getElementById('adminExportCsv').addEventListener('click', function(){
        const rows = document.querySelectorAll('#adminSummaryTable tbody tr'); if (!rows || rows.length===0) { alert('Tidak ada data'); return; }
        let csv = 'NIM,Nama,Status\n'; rows.forEach(r => { const cols = r.querySelectorAll('td'); csv += `"${cols[0].textContent}","${cols[1].textContent}","${cols[2].textContent}"\n`; });
        const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download = `attendance_summary_${document.getElementById('admin_date').value}.csv`; a.click(); URL.revokeObjectURL(url);
    });

    document.getElementById('adminLogoutBtn').addEventListener('click', async function(){
        try { if (adminToken) await apiRequest('revoke_admin_token', { admin_token: adminToken }); } catch(e){ console.warn(e); }
        localStorage.removeItem('user');
        showRoleChoice();
    });
}
