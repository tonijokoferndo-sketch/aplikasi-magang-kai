/**
 * =========================================================
 * CLOUDFLARE WORKER
 * Proxy API Absensi Magang KAI
 * =========================================================
 */

// =========================================================
// GOOGLE APPS SCRIPT
// =========================================================

const GOOGLE_APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycby4BPS22eGNDmwLepYMf63J_jDmrpXuumkwAKlcOJT-WSwvks1wNExkOkSJ5c9dTB40lQ/exec";


// =========================================================
// CORS
// =========================================================

const CORS_HEADERS = {

    "Access-Control-Allow-Origin": "*",

    "Access-Control-Allow-Methods":
        "GET, POST, OPTIONS",

    "Access-Control-Allow-Headers":
        "Content-Type",

    "Access-Control-Max-Age":
        "86400"

};


// =========================================================
// JSON RESPONSE
// =========================================================

function jsonResponse(data, status = 200) {

    return new Response(

        JSON.stringify(data),

        {
            status: status,

            headers: {
                ...CORS_HEADERS,

                "Content-Type":
                    "application/json; charset=utf-8"
            }
        }

    );

}


// =========================================================
// WORKER
// =========================================================

export default {

    async fetch(request, env, ctx) {

        console.log(
            "[WORKER] METHOD:",
            request.method
        );


        console.log(
            "[WORKER] URL:",
            request.url
        );


        // =================================================
        // OPTIONS / CORS PREFLIGHT
        // =================================================

        if (request.method === "OPTIONS") {

            return new Response(

                null,

                {
                    status: 204,

                    headers:
                        CORS_HEADERS
                }

            );

        }


        // =================================================
        // GET
        // =================================================
        //
        // Digunakan untuk mengecek Worker.
        //

        if (request.method === "GET") {

            return jsonResponse({

                status: true,

                message:
                    "Cloudflare Worker Absensi KAI - OK",

                service:
                    "aplikasi-magang-kai",

                version:
                    "1.0.0"

            });

        }


        // =================================================
        // HANYA POST
        // =================================================

        if (request.method !== "POST") {

            return jsonResponse(

                {
                    status: false,

                    message:
                        "Method tidak diizinkan"
                },

                405

            );

        }


        // =================================================
        // BACA BODY
        // =================================================

        let requestBody;

        try {

            requestBody =
                await request.text();


        } catch (error) {

            console.error(
                "[WORKER] REQUEST BODY ERROR:",
                error
            );


            return jsonResponse(

                {
                    status: false,

                    message:
                        "Tidak dapat membaca request."
                },

                400

            );

        }


        console.log(
            "[WORKER] REQUEST BODY:",
            requestBody
        );


        // =================================================
        // VALIDASI BODY
        // =================================================

        if (!requestBody) {

            return jsonResponse(

                {
                    status: false,

                    message:
                        "Request body kosong."
                },

                400

            );

        }


        // =================================================
        // VALIDASI JSON
        // =================================================

        let payload;

        try {

            payload =
                JSON.parse(requestBody);


        } catch (error) {

            console.error(
                "[WORKER] INVALID JSON:",
                error
            );


            return jsonResponse(

                {
                    status: false,

                    message:
                        "Request bukan JSON yang valid."
                },

                400

            );

        }


        console.log(
            "[WORKER] PAYLOAD:",
            payload
        );


        // =================================================
        // KIRIM KE GOOGLE APPS SCRIPT
        // =================================================

        try {

            const googleResponse =
                await fetch(

                    GOOGLE_APPS_SCRIPT_URL,

                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "text/plain;charset=utf-8"

                        },

                        body:
                            JSON.stringify(payload),

                        redirect:
                            "follow"

                    }

                );


            console.log(
                "[WORKER] GOOGLE STATUS:",
                googleResponse.status
            );


            // =================================================
            // BACA RESPONSE GOOGLE
            // =================================================

            const googleText =
                await googleResponse.text();


            console.log(
                "[WORKER] GOOGLE RESPONSE:",
                googleText
            );


            // =================================================
            // VALIDASI RESPONSE GOOGLE
            // =================================================

            let googleResult;


            try {

                googleResult =
                    JSON.parse(googleText);


            } catch (error) {

                console.error(
                    "[WORKER] GOOGLE RESPONSE BUKAN JSON:",
                    googleText
                );


                return jsonResponse(

                    {
                        status: false,

                        message:
                            "Google Apps Script tidak mengirim response JSON.",

                        googleStatus:
                            googleResponse.status,

                        raw:
                            googleText.substring(
                                0,
                                1000
                            )
                    },

                    502

                );

            }


            // =================================================
            // KEMBALIKAN RESPONSE
            // =================================================

            return jsonResponse(

                googleResult,

                200

            );


        } catch (error) {

            console.error(
                "[WORKER] GOOGLE ERROR:",
                error
            );


            return jsonResponse(

                {
                    status: false,

                    message:
                        "Tidak dapat terhubung ke Google Apps Script.",

                    error:
                        error.message
                },

                502

            );

        }

    }

};