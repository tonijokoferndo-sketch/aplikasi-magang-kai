/**
 * =========================================================
 * API.JS
 * Koneksi Frontend → Cloudflare Worker
 * =========================================================
 */

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

        const response =
            await fetch(
                CONFIG.API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        console.log(
            "[API] HTTP STATUS:",
            response.status
        );


        const text =
            await response.text();


        console.log(
            "[API] RAW RESPONSE:",
            text
        );


        let result;

        try {

            result =
                JSON.parse(text);

        } catch (error) {

            console.error(
                "[API] RESPONSE BUKAN JSON:",
                text
            );

            return {

                status: false,

                message:
                    "Server tidak mengirim response JSON.",

                raw: text

            };

        }


        console.log(
            "[API] RESPONSE:",
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