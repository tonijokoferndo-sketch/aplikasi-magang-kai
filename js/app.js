/***************************************************
 * APP.JS
 * Aplikasi utama Absensi Magang KAI
 ***************************************************/


let deferredInstallPrompt = null;

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

            if (isLoggedIn()) {

                showDashboard();

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
                    loginMessage.textContent =
                        result.message;
                    loginMessage.style.color =
                        "#28a745";

                    setTimeout(
                        function() {
                            showDashboard();
                        },
                        800
                    );
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
                const result =
                    await register(
                        nim,
                        password,
                        nama,
                        divisi
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
