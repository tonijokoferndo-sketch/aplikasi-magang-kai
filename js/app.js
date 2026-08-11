/***************************************************
 * APP.JS
 * Aplikasi utama Absensi Magang KAI
 ***************************************************/


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
   TAMPILKAN LOGIN
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


                <div class="auth-toggle">
                    <button
                        type="button"
                        class="auth-toggle-btn active"
                        id="showLoginBtn"
                    >
                        LOGIN
                    </button>

                    <button
                        type="button"
                        class="auth-toggle-btn"
                        id="showRegisterBtn"
                    >
                        DAFTAR
                    </button>
                </div>


                <form id="authForm">

                    <input
                        type="hidden"
                        id="authMode"
                        value="login"
                    >

                    <div class="form-group">

                        <label for="nim">
                            NIM
                        </label>

                        <input
                            type="text"
                            id="nim"
                            placeholder="Masukkan NIM"
                            autocomplete="username"
                            required
                        >

                    </div>


                    <div class="form-group" id="namaGroup" style="display:none;">

                        <label for="nama">
                            Nama Lengkap
                        </label>

                        <input
                            type="text"
                            id="nama"
                            placeholder="Masukkan Nama Lengkap"
                            autocomplete="name"
                        >

                    </div>


                    <div class="form-group" id="divisiGroup" style="display:none;">

                        <label for="divisi">
                            Divisi / Instansi
                        </label>

                        <input
                            type="text"
                            id="divisi"
                            placeholder="Contoh: IT / Operasi"
                            autocomplete="organization"
                        >

                    </div>


                    <div class="form-group">

                        <label for="password">
                            Password
                        </label>

                        <input
                            type="password"
                            id="password"
                            placeholder="Masukkan Password"
                            autocomplete="current-password"
                            required
                        >

                    </div>


                    <button
                        type="submit"
                        id="authButton"
                        class="btn-primary"
                    >

                        LOGIN

                    </button>


                </form>


                <p class="message" id="authMessage"></p>

                <p class="login-footer">

                    Sistem Absensi Mahasiswa Magang

                </p>

            </div>

        </div>

    `;


    const form =
        document.getElementById(
            "authForm"
        );


    const loginBtn =
        document.getElementById(
            "showLoginBtn"
        );

    const registerBtn =
        document.getElementById(
            "showRegisterBtn"
        );


    function setAuthMode(mode) {

        const authModeInput =
            document.getElementById(
                "authMode"
            );

        const namaGroup =
            document.getElementById(
                "namaGroup"
            );

        const divisiGroup =
            document.getElementById(
                "divisiGroup"
            );

        const button =
            document.getElementById(
                "authButton"
            );


        authModeInput.value = mode;


        if (mode === "register") {

            namaGroup.style.display = "block";

            divisiGroup.style.display = "block";

            button.textContent = "DAFTAR";

            loginBtn.classList.remove("active");

            registerBtn.classList.add("active");

        } else {

            namaGroup.style.display = "none";

            divisiGroup.style.display = "none";

            button.textContent = "LOGIN";

            loginBtn.classList.add("active");

            registerBtn.classList.remove("active");

        }

    }


    loginBtn.addEventListener(
        "click",
        function () {
            setAuthMode("login");
        }
    );


    registerBtn.addEventListener(
        "click",
        function () {
            setAuthMode("register");
        }
    );


    form.addEventListener(
        "submit",
        handleLogin
    );

    /* Fallback link if toggle buttons are not visible for some reason */
    const footer = document.createElement('div');
    footer.style.textAlign = 'center';
    footer.style.marginTop = '12px';
    footer.innerHTML = `
        <a href="#" id="fallbackRegister" style="color:var(--kai-blue);font-weight:700;">Belum punya akun? Daftar</a>
    `;

    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
        loginCard.appendChild(footer);
    }

    const fallbackLink = document.getElementById('fallbackRegister');
    if (fallbackLink) {
        fallbackLink.addEventListener('click', function (e) {
            e.preventDefault();
            setAuthMode('register');
            window.scrollTo(0, 0);
        });
    }
}


/* ================================================
   PROSES LOGIN
================================================ */

async function handleLogin(event) {

    event.preventDefault();


    const authMode =
        document.getElementById(
            "authMode"
        ).value;

    const nim =
        document
            .getElementById("nim")
            .value
            .trim();


    const password =
        document
            .getElementById("password")
            .value
            .trim();


    const nama =
        document
            .getElementById("nama")
            ?.value
            .trim();


    const divisi =
        document
            .getElementById("divisi")
            ?.value
            .trim();


    const button =
        document.getElementById(
            "authButton"
        );


    const messageBox =
        document.getElementById(
            "authMessage"
        );


    if (authMode === "register") {

        if (!nim || !password || !nama) {

            messageBox.textContent =
                "NIM, Nama, dan Password wajib diisi.";

            return;

        }

    } else if (!nim || !password) {

        messageBox.textContent =
            "NIM dan Password wajib diisi.";

        return;

    }


    button.disabled = true;

    button.textContent =
        "MEMPROSES...";


    try {

        let result;


        if (authMode === "register") {

            result =
                await register(
                    nim,
                    password,
                    nama,
                    divisi
                );

        } else {

            result =
                await login(
                    nim,
                    password
                );

        }


        if (result.status) {

            showDashboard();

        } else {

            messageBox.textContent =
                result.message ||
                "Proses gagal.";

        }


    } catch (error) {

        console.error(
            "AUTH ERROR:",
            error
        );


        messageBox.textContent =
            "Terjadi kesalahan saat memproses data.";


    } finally {

        button.disabled = false;

        button.textContent =
            authMode === "register"
                ? "DAFTAR"
                : "LOGIN";

    }

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