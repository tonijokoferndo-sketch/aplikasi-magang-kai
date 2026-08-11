/***************************************************
 * SW.JS
 * Service Worker
 * Aplikasi Absensi Magang KAI
 ***************************************************/

const CACHE_NAME = "absensi-kai-v2";


/*
 * File utama yang akan disimpan
 * di cache browser.
 */

const APP_SHELL = [

    "./",

    "./index.html",

    "./css/style.css",

    "./js/config.js",

    "./js/api.js",

    "./js/auth.js",

    "./js/app.js",

    "./js/dashboard.js",

    "./js/scanner.js",

    "./manifest.json",

    "./assets/icon-192.png",

    "./assets/icon-512.png"

];


/* =================================================
   INSTALL
================================================= */

self.addEventListener(
    "install",
    function (event) {

        console.log(
            "Service Worker: INSTALL"
        );


        event.waitUntil(

            caches.open(CACHE_NAME)

                .then(function (cache) {

                    console.log(
                        "Menyimpan file aplikasi..."
                    );

                    return cache.addAll(
                        APP_SHELL
                    );

                })

        );


        /*
         * Langsung menggunakan Service Worker
         * yang baru.
         */

        self.skipWaiting();

    }
);


/* =================================================
   ACTIVATE
================================================= */

self.addEventListener(
    "activate",
    function (event) {

        console.log(
            "Service Worker: ACTIVATE"
        );


        event.waitUntil(

            caches.keys()

                .then(function (cacheNames) {

                    return Promise.all(

                        cacheNames.map(
                            function (cacheName) {

                                /*
                                 * Hapus cache versi lama
                                 */

                                if (
                                    cacheName !==
                                    CACHE_NAME
                                ) {

                                    console.log(
                                        "Menghapus cache lama:",
                                        cacheName
                                    );

                                    return caches.delete(
                                        cacheName
                                    );

                                }

                            }
                        )

                    );

                })

        );


        /*
         * Service Worker langsung mengontrol
         * halaman yang sedang dibuka.
         */

        self.clients.claim();

    }
);


/* =================================================
   FETCH
================================================= */

self.addEventListener(
    "fetch",
    function (event) {

        /*
         * Jangan cache request POST.
         *
         * Login dan absensi kita menggunakan
         * request ke Google Apps Script.
         */

        if (
            event.request.method !== "GET"
        ) {

            return;

        }


        event.respondWith(

            caches.match(event.request)

                .then(function (cachedResponse) {

                    /*
                     * Jika file tersedia di cache,
                     * gunakan cache.
                     */

                    if (cachedResponse) {

                        return cachedResponse;

                    }


                    /*
                     * Jika belum ada di cache,
                     * ambil dari internet.
                     */

                    return fetch(event.request)

                        .then(function (response) {

                            /*
                             * Simpan salinan response
                             * ke cache.
                             */

                            if (
                                !response ||
                                response.status !== 200 ||
                                response.type === "opaque"
                            ) {

                                return response;

                            }


                            const responseClone =
                                response.clone();


                            caches.open(
                                CACHE_NAME
                            )
                            .then(
                                function (cache) {

                                    cache.put(
                                        event.request,
                                        responseClone
                                    );

                                }
                            );


                            return response;

                        })

                        .catch(function () {

                            /*
                             * Jika tidak ada internet
                             * dan halaman belum ada cache,
                             * tampilkan index.html.
                             */

                            return caches.match(
                                "./index.html"
                            );

                        });

                })

        );

    }
);