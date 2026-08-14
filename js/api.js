async function apiRequest(action, data = {}) {

    const payload = {
        action: action,
        ...data
    };


    console.log(
        "[API] REQUEST:",
        payload
    );


    console.log(
        "[API] URL:",
        CONFIG.API_URL
    );


    try {

        const response = await fetch(
            CONFIG.API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body:
                    JSON.stringify(payload),

                redirect: "follow"
            }
        );


        console.log(
            "[API] STATUS:",
            response.status
        );


        const text =
            await response.text();


        console.log(
            "[API] RAW RESPONSE:",
            text
        );


        if (!response.ok) {

            return {

                status: false,

                message:
                    "HTTP " +
                    response.status,

                raw: text

            };

        }


        let result;


        try {

            result =
                JSON.parse(text);

        } catch (error) {

            console.error(
                "[API] JSON ERROR:",
                error
            );


            return {

                status: false,

                message:
                    "Server tidak mengirim JSON.",

                raw: text

            };

        }


        console.log(
            "[API] RESULT:",
            result
        );


        return result;


    } catch (error) {

        console.error(
            "[API] FETCH ERROR:",
            error
        );


        return {

            status: false,

            message:
                "Tidak dapat terhubung ke server.",

            error:
                error.message

        };

    }

}