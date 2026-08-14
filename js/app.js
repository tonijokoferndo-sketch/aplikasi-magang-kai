document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "[APP] Aplikasi dimulai"
        );


        setTimeout(
            function () {

                const loading =
                    document.getElementById(
                        "loadingScreen"
                    );


                if (loading) {

                    loading.style.display =
                        "none";

                }


                startApplication();

            },
            500
        );

    }
);


function startApplication() {

    console.log(
        "[APP] Menentukan halaman..."
    );


    if (
        typeof Auth !==
        "undefined" &&
        Auth.isLoggedIn()
    ) {

        const user =
            Auth.getUser();


        if (
            String(user.role)
                .toLowerCase() ===
            "admin"
        ) {

            showAdmin();

        } else {

            showDashboard();

        }


        return;

    }


    showModeSelection();

}


// =========================================
// MODE SELECTION
// =========================================

function showModeSelection() {

    const app =
        document.getElementById("app");


    app.innerHTML = `

        <section class="mode-page">

            <div class="mode-container">

                <h1>
                    Masuk sebagai
                </h1>

                <p>
                    Pilih mode akses aplikasi
                </p>


                <div class="mode-buttons">

                    <button
                        class="mode-btn active"
                        onclick="showLogin('user')">

                        User

                    </button>


                    <button
                        class="mode-btn"
                        onclick="showLogin('admin')">

                        Admin

                    </button>

                </div>


                <div class="mode-info">

                    Jika Anda admin, pilih
                    <b>Admin</b> untuk membuka
                    halaman admin.

                </div>

            </div>

        </section>

    `;

}


// =========================================
// LOGIN
// =========================================

function showLogin(mode = "user") {

    const app =
        document.getElementById("app");


    const title =
        mode === "admin"
            ? "Login Admin"
            : "Login User";


    app.innerHTML = `

        <section class="auth-page">

            <div class="auth-card">

                <div class="logo-circle">
                    KAI
                </div>


                <h1>
                    ABSENSI MAGANG
                </h1>

                <p class="company">
                    PT KAI DIVRE II SUMBAR
                </p>


                <h2>
                    ${title}
                </h2>


                <form
                    id="loginForm"
                    onsubmit="handleLogin(event, '${mode}')">


                    <label>
                        NIM
                    </label>

                    <input
                        type="text"
                        id="loginNim"
                        placeholder="Masukkan NIM"
                        autocomplete="username"
                        required>


                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        id="loginPassword"
                        placeholder="Masukkan Password"
                        autocomplete="current-password"
                        required>


                    <button
                        type="submit"
                        class="primary-btn">

                        LOGIN

                    </button>


                    <p
                        id="loginMessage"
                        class="message">
                    </p>

                </form>


                <p class="switch-auth">

                    Belum punya akun?

                    <button
                        type="button"
                        onclick="showRegister()">

                        Daftar di sini

                    </button>

                </p>


                <button
                    class="back-btn"
                    onclick="showModeSelection()">

                    ← Kembali

                </button>

            </div>

        </section>

    `;

}


// =========================================
// REGISTER
// =========================================

function showRegister() {

    const app =
        document.getElementById("app");


    app.innerHTML = `

        <section class="auth-page">

            <div class="auth-card">


                <div class="logo-circle">
                    KAI
                </div>


                <h1>
                    ABSENSI MAGANG
                </h1>

                <p class="company">
                    PT KAI DIVRE II SUMBAR
                </p>


                <form
                    id="registerForm"
                    onsubmit="handleRegister(event)">


                    <label>
                        NIM
                    </label>

                    <input
                        type="text"
                        id="registerNim"
                        placeholder="Masukkan NIM"
                        required>


                    <label>
                        Nama Lengkap
                    </label>

                    <input
                        type="text"
                        id="registerNama"
                        placeholder="Masukkan Nama Lengkap"
                        required>


                    <label>
                        Divisi / Instansi
                    </label>

                    <input
                        type="text"
                        id="registerDivisi"
                        placeholder="Contoh: IT / Operasi">


                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        id="registerPassword"
                        placeholder="Masukkan Password"
                        required>


                    <label>
                        Daftar sebagai
                    </label>

                    <select
                        id="registerRole"
                        required>

                        <option value="user">
                            Pengguna (User)
                        </option>

                        <option value="admin">
                            Administrator (Admin)
                        </option>

                    </select>


                    <button
                        type="submit"
                        class="primary-btn">

                        DAFTAR

                    </button>


                    <p
                        id="registerMessage"
                        class="message">
                    </p>

                </form>


                <p class="switch-auth">

                    Sudah punya akun?

                    <button
                        type="button"
                        onclick="showModeSelection()">

                        Login di sini

                    </button>

                </p>


            </div>

        </section>

    `;

}


// =========================================
// HANDLE LOGIN
// =========================================

async function handleLogin(
    event,
    selectedMode
) {

    event.preventDefault();


    const nim =
        document.getElementById(
            "loginNim"
        ).value.trim();


    const password =
        document.getElementById(
            "loginPassword"
        ).value;


    const message =
        document.getElementById(
            "loginMessage"
        );


    message.textContent =
        "Menghubungkan ke server...";


    message.className =
        "message loading";


    const result =
        await Auth.login(
            nim,
            password
        );


    if (!result.status) {

        message.textContent =
            result.message ||
            "Login gagal.";

        message.className =
            "message error";

        return;

    }


    const user =
        result.user;


    /*
     * Mode yang dipilih hanya digunakan
     * sebagai pemeriksaan tambahan.
     *
     * Role sebenarnya berasal dari
     * Google Spreadsheet.
     */

    if (
        selectedMode === "admin" &&
        user.role !== "admin"
    ) {

        Auth.logout();

        alert(
            "Akun ini bukan akun administrator."
        );

        return;

    }


    if (
        selectedMode === "user" &&
        user.role === "admin"
    ) {

        Auth.logout();

        alert(
            "Akun administrator harus masuk melalui mode Admin."
        );

        return;

    }


    if (
        user.role === "admin"
    ) {

        showAdmin();

    } else {

        showDashboard();

    }

}


// =========================================
// HANDLE REGISTER
// =========================================

async function handleRegister(event) {

    event.preventDefault();


    const nim =
        document.getElementById(
            "registerNim"
        ).value.trim();


    const nama =
        document.getElementById(
            "registerNama"
        ).value.trim();


    const divisi =
        document.getElementById(
            "registerDivisi"
        ).value.trim();


    const password =
        document.getElementById(
            "registerPassword"
        ).value;


    const role =
        document.getElementById(
            "registerRole"
        ).value;


    const message =
        document.getElementById(
            "registerMessage"
        );


    message.textContent =
        "Mendaftarkan akun...";


    message.className =
        "message loading";


    const result =
        await Auth.register({

            nim: nim,

            nama: nama,

            divisi: divisi,

            password: password,

            role: role

        });


    console.log(
        "[REGISTER RESULT]",
        result
    );


    if (!result.status) {

        message.textContent =
            result.message ||
            "Pendaftaran gagal.";

        message.className =
            "message error";

        return;

    }


    message.textContent =
        "Pendaftaran berhasil. Silakan login.";

    message.className =
        "message success";


    setTimeout(
        function () {

            showModeSelection();

        },
        1200
    );

}


// =========================================
// ADMIN
// =========================================

function showAdmin() {

    const app =
        document.getElementById("app");


    app.innerHTML = `

        <section class="dashboard-page">

            <div class="dashboard-card">

                <h1>
                    ADMIN DASHBOARD
                </h1>

                <p>
                    Selamat datang,
                    <strong>
                        ${Auth.getUser().nama}
                    </strong>
                </p>

                <p>
                    Role:
                    <strong>ADMIN</strong>
                </p>


                <button
                    class="primary-btn"
                    onclick="Auth.logout()">

                    LOGOUT

                </button>

            </div>

        </section>

    `;

}


// =========================================
// USER DASHBOARD
// =========================================

function showDashboard() {

    const app =
        document.getElementById("app");


    const user =
        Auth.getUser();


    app.innerHTML = `

        <section class="dashboard-page">

            <div class="dashboard-card">

                <h1>
                    DASHBOARD
                </h1>

                <p>
                    Selamat datang,
                    <strong>
                        ${user.nama}
                    </strong>
                </p>

                <p>
                    NIM:
                    ${user.nim}
                </p>

                <p>
                    Divisi:
                    ${user.divisi || "-"}
                </p>


                <button
                    class="primary-btn"
                    onclick="Auth.logout()">

                    LOGOUT

                </button>

            </div>

        </section>

    `;

}