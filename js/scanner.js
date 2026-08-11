/***************************************************
 * SCANNER.JS
 * QR Scanner Absensi Magang KAI
 ***************************************************/

let qrScanner = null;

function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|Windows Phone|Mobile/i.test(
        navigator.userAgent || ""
    );
}

function getPreferredCameraId(cameras) {
    if (!cameras || cameras.length === 0) {
        return null;
    }

    const rearCamera = cameras.find(function(camera) {
        const label = (camera.label || "").toLowerCase();
        return (
            label.includes("back") ||
            label.includes("rear") ||
            label.includes("environment") ||
            label.includes("primary")
        );
    });

    if (rearCamera) {
        console.log(
            "[SCANNER] Menggunakan kamera belakang dari daftar kamera:",
            rearCamera.label || rearCamera.id
        );
        return rearCamera.id;
    }

    return cameras[0].id;
}

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


    console.log(
        "[SCANNER] startScanner dipanggil, menunggu DOM siap..."
    );

    setTimeout(
        loadQRScannerLibrary,
        500
    );

}


/* ================================================
   LOAD LIBRARY QR SCANNER
================================================ */

function loadQRScannerLibrary() {

    console.log(
        "[SCANNER] loadQRScannerLibrary called"
    );

    if (typeof Html5Qrcode === "undefined") {

        console.warn(
            "[SCANNER] Html5Qrcode not found, waiting..."
        );

        let attempts = 0;
        const checkLibrary = setInterval(
            function() {

                attempts++;

                if (typeof Html5Qrcode !== "undefined") {

                    clearInterval(checkLibrary);

                    console.log(
                        "[SCANNER] Library ready after",
                        attempts * 100,
                        "ms"
                    );

                    initializeScanner();
                    return;

                }

                if (attempts >= 50) {

                    clearInterval(checkLibrary);

                    console.error(
                        "[SCANNER] Library timeout after 5 seconds"
                    );

                    alert(
                        "Library QR Scanner gagal dimuat. Silakan refresh halaman dan coba lagi."
                    );

                    showDashboard();

                }

            },
            100
        );

    } else {

        console.log(
            "[SCANNER] Html5Qrcode library ready, initializing..."
        );

        initializeScanner();

    }

}


/* ================================================
   INITIALIZE CAMERA
================================================ */

async function initializeScanner() {

    try {

        console.log(
            "[SCANNER] Inisialisasi pemindai QR..."
        );

        if (
            !window.isSecureContext &&
            location.hostname !== "localhost" &&
            location.hostname !== "127.0.0.1"
        ) {

            console.error(
                "[SCANNER] Tidak dalam secure context"
            );

            alert(
                "Buka aplikasi melalui localhost atau HTTPS agar kamera bisa dipakai."
            );

            return;

        }


        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            console.error(
                "[SCANNER] MediaDevices tidak tersedia"
            );

            alert(
                "Browser Anda tidak mendukung akses kamera."
            );

            return;

        }


        console.log(
            "[SCANNER] Mencari element #reader..."
        );

        const reader =
            document.getElementById("reader");


        if (!reader) {

            console.log(
                "[SCANNER] Element belum siap, retry..."
            );

            setTimeout(
                initializeScanner,
                300
            );

            return;

        }

        console.log(
            "[SCANNER] Element #reader ditemukan"
        );

        qrScanner =
            new Html5Qrcode("reader");

        console.log(
            "[SCANNER] Html5Qrcode instance dibuat"
        );


        console.log(
            "[SCANNER] Mencari daftar kamera..."
        );

        const cameras =
            await Html5Qrcode.getCameras();


        if (
            !cameras ||
            cameras.length === 0
        ) {

            console.error(
                "[SCANNER] Tidak ada kamera ditemukan"
            );

            alert(
                "Kamera tidak ditemukan atau browser belum diberi izin. Pastikan Anda sudah memberikan izin akses kamera ke browser."
            );

            showDashboard();
            return;

        }

        console.log(
            `[SCANNER] ${cameras.length} kamera ditemukan`
        );

        cameras.forEach(
            function(cam, idx) {

                console.log(
                    `  [${idx + 1}] ${cam.label || "Unknown"} - ${cam.id}`
                );

            }
        );


        const cameraId =
            getPreferredCameraId(cameras);

        const mobile =
            isMobileDevice();

        console.log(
            `[SCANNER] Mobile device: ${mobile}`
        );

        const scanningConfig = {

            fps: 10,

            qrbox: {
                width: 250,
                height: 250
            }

        };


        console.log(
            "[SCANNER] Mencoba memulai scanner..."
        );

        await startQRScanner(
            cameraId,
            scanningConfig
        );

        console.log(
            "[SCANNER] Scanner berhasil dimulai"
        );


    } catch (error) {

        console.error(
            "[SCANNER] Error:",
            error
        );

        alert(
            `Tidak dapat membuka kamera.\n\nError: ${error.message}\n\nPastikan:\n1. Izin kamera sudah diberikan\n2. Aplikasi dibuka lewat localhost\n3. Browser mendukung akses kamera`
        );

        showDashboard();

    }

}


async function startQRScanner(
    cameraId,
    scanningConfig
) {

    const successCallback =
        function(decodedText) {

            console.log(
                "[SCANNER] QR terbaca:",
                decodedText
            );

            handleQRResult(
                decodedText
            );

        };


    const errorCallback =
        function(error) {

            // Silenced - scanning errors normal

        };


    try {

        if (isMobileDevice()) {

            console.log(
                "[SCANNER] Mobile device, mencoba facingMode environment terlebih dahulu"
            );

            await qrScanner.start(
                {
                    facingMode: "environment"
                },
                scanningConfig,
                successCallback,
                errorCallback
            );

            console.log(
                "[SCANNER] Berhasil dengan facingMode environment pada ponsel"
            );

            return;

        }

        console.log(
            `[SCANNER] Memulai dengan kamera ID: ${cameraId}`
        );

        await qrScanner.start(
            cameraId,
            scanningConfig,
            successCallback,
            errorCallback
        );

    } catch (firstError) {

        console.warn(
            "[SCANNER] Gagal dengan mobile environment/cameraId, coba kamera ID",
            firstError.message
        );

        try {

            if (cameraId) {

                await qrScanner.start(
                    cameraId,
                    scanningConfig,
                    successCallback,
                    errorCallback
                );

                console.log(
                    "[SCANNER] Berhasil dengan cameraId fallback"
                );

            } else {

                throw new Error(
                    "Kamera ID tidak tersedia"
                );

            }

        } catch (secondError) {

            console.warn(
                "[SCANNER] Gagal cameraId, coba facingMode environment",
                secondError.message
            );

            try {

                await qrScanner.start(
                    {
                        facingMode: "environment"
                    },
                    scanningConfig,
                    successCallback,
                    errorCallback
                );

                console.log(
                    "[SCANNER] Berhasil dengan facingMode environment"
                );

            } catch (thirdError) {

                console.warn(
                    "[SCANNER] Gagal environment, coba facingMode user",
                    thirdError.message
                );

                try {

                    await qrScanner.start(
                        {
                            facingMode: "user"
                        },
                        scanningConfig,
                        successCallback,
                        errorCallback
                    );

                    console.log(
                        "[SCANNER] Berhasil dengan facingMode user"
                    );

                } catch (fourthError) {

                    console.error(
                        "[SCANNER] Semua metode gagal",
                        fourthError
                    );

                    throw new Error(
                        `Tidak bisa membuka kamera. Terakhir error: ${fourthError.message}`
                    );

                }

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