/***************************************************
 * AUTH.JS
 * Login dan autentikasi mahasiswa
 ***************************************************/


/* ================================================
   LOGIN
================================================ */

async function login(nim, password) {

    /* Validasi input */

    if (!nim || !password) {

        return {

            status: false,

            message:
                "NIM dan Password wajib diisi."

        };

    }


    const normalizedNim =
        String(nim).trim();


    try {

        /* Kirim request ke Google Apps Script */

        const result =
            await apiRequest(

                "login",

                {

                    nim: normalizedNim,

                    password: password

                }

            );


        if (result.status) {

            localStorage.setItem(

                "user",

                JSON.stringify(
                    result.user
                )

            );

            return result;

        }


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

    }


    /* Fallback lokal jika server tidak merespons */

    const localUser =
        findLocalUser(
            normalizedNim,
            password
        );


    if (localUser) {

        const userData = {
            ...localUser,
            registeredLocally: true
        };


        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );


        return {

            status: true,

            message: "Login berhasil.",

            user: userData

        };

    }


    return {

        status: false,

        message:
            "NIM atau Password salah."

    };

}


/* ================================================
   DAFTAR AKUN BARU
================================================ */

async function register(nim, password, nama, divisi) {

    if (!nim || !password || !nama) {

        return {

            status: false,

            message:
                "NIM, Nama, dan Password wajib diisi."

        };

    }


    const normalizedNim =
        String(nim).trim();


    const users =
        getRegisteredUsers();


    const existingUser =
        users.find(
            (user) =>
                String(user.nim)
                    .toLowerCase() ===
                normalizedNim.toLowerCase()
        );


    if (existingUser) {

        return {

            status: false,

            message:
                "NIM sudah terdaftar. Silakan login."

        };

    }


    try {

        const result =
            await apiRequest(
                "register",
                {
                    nim: normalizedNim,
                    password: password,
                    nama: nama,
                    divisi: divisi || "-"
                }
            );


        if (result && result.status) {

            const userData =
                result.user || {
                    nim: normalizedNim,
                    nama: nama,
                    divisi: divisi || "-"
                };


            localStorage.setItem(
                "user",
                JSON.stringify(userData)
            );


            return result;

        }

    } catch (error) {

        console.error(
            "Register error:",
            error
        );

    }


    /* Fallback lokal */

    const newUser = {

        nim: normalizedNim,

        password: password,

        nama: nama,

        divisi: divisi || "-"

    };


    users.push(newUser);

    saveRegisteredUsers(users);


    const userData = {
        nim: normalizedNim,
        nama: nama,
        divisi: divisi || "-",
        registeredLocally: true
    };


    localStorage.setItem(
        "user",
        JSON.stringify(userData)
    );


    return {

        status: true,

        message:
            "Pendaftaran berhasil. Silakan masuk.",

        user: userData

    };

}


/* ================================================
   DATA USER LOKAL
================================================ */

function getRegisteredUsers() {

    const users =
        localStorage.getItem(
            "registeredUsers"
        );


    if (!users) {

        return [];

    }


    try {

        return JSON.parse(users);

    } catch (error) {

        console.error(
            "Data user lokal rusak:",
            error
        );

        return [];

    }

}


function saveRegisteredUsers(users) {

    localStorage.setItem(
        "registeredUsers",
        JSON.stringify(users)
    );

}


function findLocalUser(nim, password) {

    const users =
        getRegisteredUsers();


    return users.find(
        (user) =>
            String(user.nim)
                .toLowerCase() ===
            String(nim).toLowerCase() &&
            String(user.password) ===
            String(password)
    );

}


/* ================================================
   MENGAMBIL DATA USER
================================================ */

function getUser() {

    const user =
        localStorage.getItem(
            "user"
        );


    if (!user) {

        return null;

    }


    try {

        return JSON.parse(
            user
        );

    } catch (error) {

        console.error(
            "Data user rusak:",
            error
        );


        localStorage.removeItem(
            "user"
        );


        return null;

    }

}


/* ================================================
   CEK STATUS LOGIN
================================================ */

function isLoggedIn() {

    return getUser() !== null;

}


/* ================================================
   LOGOUT
================================================ */

function logout() {

    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "index.html";

}