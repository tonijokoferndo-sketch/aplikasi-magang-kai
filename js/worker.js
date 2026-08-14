/**
 * =========================================================
 * CLOUDFLARE WORKER
 * Proxy API Absensi Magang KAI
 * =========================================================
 */

// URL Google Apps Script
const GOOGLE_APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycby4BPS22eGNDmwLepYMf63J_jDmrpXuumkwAKlcOJT-WSwvks1wNExkOkSJ5c9dTB40lQ/exec";


/**
 * =========================================================
 * CORS HEADERS
 * =========================================================
 */
function corsHeaders() {

    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400"
    };

}


/**
 * =========================================================
 * RESPONSE JSON
 * =========================================================
 */
function jsonResponse(data, status = 200) {

    return new Response(
        JSON.stringify(data),
        {
            status: status,

            headers: {
                "Content-Type": "application/json; charset=utf-8",
                ...corsHeaders()
            }
        }
    );

}


/**
 * =========================================================
 * MAIN WORKER
 * =========================================================
 */
export default {

    async fetch(request, env, ctx) {

        /**
         * ---------------------------------------------
         * CORS PREFLIGHT
         * ---------------------------------------------
         */

        if (request.method === "OPTIONS") {

            return new Response(null, {
                status: 204,
                headers: corsHeaders()
            });

        }


        /**
         * ---------------------------------------------
         * GET
         * ---------------------------------------------
         *
         * Untuk mengecek apakah Worker hidup.
         */

        if (request.method === "GET") {

            return jsonResponse({

                status: true,

                message:
                    "Cloudflare Worker Absensi KAI - OK",

                service:
                    "aplikasi-magang-kai"

            });

        }


        /**
         * ---------------------------------------------
         * HANYA POST
         * ---------------------------------------------
         */

        if (request.method !== "POST") {

            return jsonResponse(
                {
                    status: false,
                    message: "Method tidak diizinkan"
                },
                405
            );

        }


        /**
         * ---------------------------------------------
         * BACA REQUEST DARI FRONTEND
         * ---------------------------------------------
         */

        let body;

        try {

            body = await request.json();

        } catch (error) {

            return jsonResponse(
                {
                    status: false,
                    message: "Request JSON tidak valid"
                },
                400
            );

        }


        console.log(
            "REQUEST DARI FRONTEND:",
            JSON.stringify(body)
        );


        /**
         * ---------------------------------------------
         * KIRIM KE GOOGLE APPS SCRIPT
         * ---------------------------------------------
         */

        try {

            const googleResponse =
                await fetch(
                    GOOGLE_APPS_SCRIPT_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "text/plain;charset=utf-8"
                        },

                        body:
                            JSON.stringify(body),

                        redirect: "follow"
                    }
                );


            /**
             * -----------------------------------------
             * BACA RESPONSE GOOGLE APPS SCRIPT
             * -----------------------------------------
             */

            const responseText =
                await googleResponse.text();


            console.log(
                "RESPONSE GOOGLE APPS SCRIPT:",
                responseText
            );


            /**
             * -----------------------------------------
             * VALIDASI RESPONSE
             * -----------------------------------------
             */

            let result;

            try {

                result =
                    JSON.parse(responseText);

            } catch (error) {

                return jsonResponse(
                    {
                        status: false,

                        message:
                            "Google Apps Script tidak mengirim JSON",

                        raw:
                            responseText
                    },
                    502
                );

            }


            /**
             * -----------------------------------------
             * KEMBALIKAN RESPONSE KE FRONTEND
             * -----------------------------------------
             */

            return jsonResponse(
                result,
                googleResponse.ok
                    ? 200
                    : googleResponse.status
            );


        } catch (error) {

            console.error(
                "ERROR GOOGLE APPS SCRIPT:",
                error
            );


            return jsonResponse(
                {
                    status: false,

                    message:
                        "Tidak dapat terhubung ke Google Apps Script",

                    error:
                        error.message
                },
                502
            );

        }

    }

};