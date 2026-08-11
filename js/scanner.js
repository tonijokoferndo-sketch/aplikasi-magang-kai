/***************************************************
 * SCANNER.JS
 * QR Scanner Absensi Magang KAI
 ***************************************************/

let qrScanner = null;


/* ================================================
   MEMBUKA SCANNER
================================================ */

function startScanner() {

    const user = getUser();

    if (!user) {

        showLogin();

        return;

    }


    document.getElementById("app").innerHTML = `

        <section class="scanner-container">

            <div class="scanner-header">

                <h2>
                    Scan QR Absensi
                </h2>

                <button
                    class="scanner-close"
                    onclick="stopScanner()">

                    Tutup

                </button>

            </div>


            <div id="reader"></div>


            <div class="scanner-info">

                Arahkan kamera ke QR Code
                absensi yang tersedia.

            </div>

        </section>

    `;


    loadQRScannerLibrary();

}


/* ================================================
   LOAD LIBRARY QR SCANNER
================================================ */

function loadQRScannerLibrary() {

    if (
        typeof window.Html5Qrcode !==
        "undefined"
    ) {

        initializeScanner();

        return;

    }


    const script =
        document.createElement("script");


    script.src =
        "https://unpkg.com/html5-qrcode@2.3.8/minified/html5-qrcode.min.js";


    script.onload = function () {

        initializeScanner();

    };


    script.onerror = function () {

        alert(
            "Library QR Scanner gagal dimuat. Pastikan koneksi internet aktif."
        );

    };


    document
        .head
        .appendChild(script);

}


/* ================================================
   INITIALIZE CAMERA
================================================ */

async function initializeScanner() {

    try {

        if (
            !window.isSecureContext &&
            location.hostname !== "localhost" &&
            location.hostname !== "127.0.0.1"
        ) {

            alert(
                "Buka aplikasi melalui localhost atau HTTPS agar kamera bisa dipakai."
            );

            return;

        }


        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            alert(
                "Browser Anda tidak mendukung akses kamera."
            );

            return;

        }


        const reader =
            document.getElementById("reader");


        if (!reader) {

            setTimeout(
                initializeScanner,
                200
            );

            return;

        }


        qrScanner =
            new Html5Qrcode("reader");


        const cameras =
            await Html5Qrcode.getCameras();


        if (
            !cameras ||
            cameras.length === 0
        ) {

            alert(
                "Kamera tidak ditemukan. Pastikan browser memiliki izin kamera."
            );

            return;

        }


        let cameraId =
            cameras[0].id;


        for (
            let i = 0;
            i < cameras.length;
            i++
        ) {

            const label =
                (cameras[i].label || "")
                    .toLowerCase();


            if (
                label.includes("back") ||
                label.includes("rear") ||
                label.includes("environment")
            ) {

                cameraId =
                    cameras[i].id;

                break;

            }

        }


        const scanningConfig = {

            fps: 10,

            qrbox: {
                width: 250,
                height: 250
            }

        };


        await startQRScanner(
            cameraId,
            scanningConfig
        );


    } catch (error) {

        console.error(
            "Scanner Error:",
            error
        );


        alert(
            "Tidak dapat membuka kamera. Pastikan izin kamera diberikan dan aplikasi dibuka lewat localhost/HTTPS."
        );

    }

}


async function startQRScanner(
    cameraId,
    scanningConfig
) {

    const successCallback =
        function(decodedText) {

            handleQRResult(
                decodedText
            );

        };


    const errorCallback =
        function() {

            // Error scan biasa tidak perlu
            // ditampilkan ke user.

        };


    try {

        await qrScanner.start(
            cameraId,
            scanningConfig,
            successCallback,
            errorCallback
        );

    } catch (firstError) {

        try {

            await qrScanner.start(
                {
                    facingMode: "environment"
                },
                scanningConfig,
                successCallback,
                errorCallback
            );

        } catch (secondError) {

            try {

                await qrScanner.start(
                    {
                        facingMode: "user"
                    },
                    scanningConfig,
                    successCallback,
                    errorCallback
                );

            } catch (thirdError) {

                throw thirdError;

            }

        }

    }

}


/* ================================================
   HASIL SCAN QR
================================================ */

async function handleQRResult(qrCode) {

    if (!qrScanner) {

        return;

    }


    try {

        await qrScanner.stop();

    } catch (error) {

        console.log(error);

    }


    const user = getUser();


    if (!user) {

        showLogin();

        return;

    }


    /*
     * Setelah QR terbaca,
     * kita ambil lokasi GPS.
     */

    getLocationAndSubmit(
        qrCode,
        user
    );

}


/* ================================================
   AMBIL GPS
================================================ */

function getLocationAndSubmit(
    qrCode,
    user
) {

    if (!navigator.geolocation) {

        alert(
            "Browser tidak mendukung GPS."
        );

        showDashboard();

        return;

    }


    SwalLoading(
        "Mengambil lokasi..."
    );


    navigator.geolocation.getCurrentPosition(

        function(position) {

            const latitude =
                position.coords.latitude;


            const longitude =
                position.coords.longitude;


            submitAttendance(

                qrCode,

                user,

                latitude,

                longitude

            );

        },


        function(error) {

            console.error(
                "GPS Error:",
                error
            );


            SwalClose();


            alert(
                "Lokasi/GPS tidak dapat diperoleh. Pastikan GPS aktif dan izin lokasi diberikan."
            );


            showDashboard();

        },


        {

            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0

        }

    );

}


/* ================================================
   KIRIM ABSENSI
================================================ */

async function submitAttendance(

    qrCode,
    user,
    latitude,
    longitude

) {

    try {

        SwalLoading(
            "Mengirim absensi..."
        );


        const result =
            await apiRequest(

                "absen",

                {

                    nim: user.nim,

                    nama: user.nama,

                    qr: qrCode,

                    latitude: latitude,

                    longitude: longitude

                }

            );


        SwalClose();


        if (result.status) {

            alert(
                result.message ||
                "Absensi berhasil."
            );


            showDashboard();


        } else {

            alert(
                result.message ||
                "Absensi gagal."
            );


            showDashboard();

        }


    } catch (error) {

        console.error(
            "Absensi Error:",
            error
        );


        SwalClose();


        alert(
            "Terjadi kesalahan saat mengirim absensi."
        );


        showDashboard();

    }

}


/* ================================================
   STOP SCANNER
================================================ */

async function stopScanner() {

    if (qrScanner) {

        try {

            await qrScanner.stop();

            qrScanner.clear();

        } catch (error) {

            console.log(error);

        }

        qrScanner = null;

    }


    showDashboard();

}


/* ================================================
   LOADING SEDERHANA
================================================ */

function SwalLoading(message) {

    let loading =
        document.getElementById(
            "scannerLoading"
        );


    if (!loading) {

        loading =
            document.createElement(
                "div"
            );

        loading.id =
            "scannerLoading";


        loading.style.position =
            "fixed";

        loading.style.inset =
            "0";

        loading.style.background =
            "rgba(0,0,0,0.65)";

        loading.style.display =
            "flex";

        loading.style.alignItems =
            "center";

        loading.style.justifyContent =
            "center";

        loading.style.zIndex =
            "99999";


        document.body.appendChild(
            loading
        );

    }


    loading.innerHTML = `

        <div style="
            background:white;
            padding:25px;
            border-radius:15px;
            text-align:center;
        ">

            <div class="loading-spinner"></div>

            <p style="
                margin-top:15px;
                color:#333;
            ">

                ${message}

            </p>

        </div>

    `;

}


/* ================================================
   TUTUP LOADING
================================================ */

function SwalClose() {

    const loading =
        document.getElementById(
            "scannerLoading"
        );


    if (loading) {

        loading.remove();

    }

}