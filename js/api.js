function apiRequest(action, data = {}) {

    return new Promise((resolve, reject) => {

        console.log("API REQUEST:", {
            action,
            ...data
        });


        // =====================================
        // LOGIN
        // =====================================

        if (action === "login") {

            google.script.run

                .withSuccessHandler(function(response) {

                    console.log(
                        "LOGIN RESPONSE:",
                        response
                    );

                    resolve(response);

                })

                .withFailureHandler(function(error) {

                    console.error(
                        "LOGIN ERROR:",
                        error
                    );

                    reject(error);

                })

                .loginUser(
                    data.nim,
                    data.password
                );

            return;
        }


        // =====================================
        // REGISTER
        // =====================================

        if (action === "register") {

            google.script.run

                .withSuccessHandler(function(response) {

                    console.log(
                        "REGISTER RESPONSE:",
                        response
                    );

                    resolve(response);

                })

                .withFailureHandler(function(error) {

                    console.error(
                        "REGISTER ERROR:",
                        error
                    );

                    reject(error);

                })

                .registerUser(

                    data.nim,

                    data.nama,

                    data.divisi,

                    data.password,

                    data.role

                );

            return;
        }


        reject(
            new Error(
                "Action tidak didukung: " +
                action
            )
        );

    });

}