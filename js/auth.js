const Auth = {

    currentUser: null,


    // =====================================
    // INIT
    // =====================================

    init: function () {

        const savedUser =
            localStorage.getItem(
                "absensi_user"
            );


        if (savedUser) {

            try {

                this.currentUser =
                    JSON.parse(savedUser);

            } catch (error) {

                console.error(
                    "[AUTH] Session rusak"
                );

                localStorage.removeItem(
                    "absensi_user"
                );

            }

        }

    },


    // =====================================
    // LOGIN
    // =====================================

    login: async function (
        nim,
        password
    ) {

        if (!nim || !password) {

            return {

                status: false,

                message:
                    "NIM dan password wajib diisi."

            };

        }


        const result =
            await apiRequest(
                "login",
                {
                    nim: nim,
                    password: password
                }
            );


        console.log(
            "[AUTH] LOGIN:",
            result
        );


        if (!result.status) {

            return result;

        }


        const user =
            result.user;


        if (!user) {

            return {

                status: false,

                message:
                    "Data user tidak ditemukan."

            };

        }


        /*
         * Normalisasi role
         */

        let role =
            String(
                user.role || "user"
            )
            .trim()
            .toLowerCase();


        if (
            role !== "admin" &&
            role !== "user"
        ) {

            role = "user";

        }


        user.role = role;


        this.currentUser =
            user;


        localStorage.setItem(
            "absensi_user",
            JSON.stringify(user)
        );


        return {

            status: true,

            message:
                result.message ||
                "Login berhasil.",

            user: user

        };

    },


    // =====================================
    // REGISTER
    // =====================================

    register: async function (data) {

        const result =
            await apiRequest(
                "register",
                data
            );


        console.log(
            "[AUTH] REGISTER:",
            result
        );


        return result;

    },


    // =====================================
    // LOGOUT
    // =====================================

    logout: function () {

        this.currentUser = null;


        localStorage.removeItem(
            "absensi_user"
        );


        location.reload();

    },


    // =====================================
    // GET USER
    // =====================================

    getUser: function () {

        return this.currentUser;

    },


    // =====================================
    // IS LOGIN
    // =====================================

    isLoggedIn: function () {

        return Boolean(
            this.currentUser
        );

    },


    // =====================================
    // IS ADMIN
    // =====================================

    isAdmin: function () {

        return (
            this.currentUser &&
            String(
                this.currentUser.role
            )
            .toLowerCase() ===
            "admin"
        );

    }

};


Auth.init();