# Absensi Magang KAI

Aplikasi absensi mahasiswa magang untuk PT KAI Divre II Sumbar.

## Fitur

- Login mahasiswa
- Daftar akun melalui server
- Dashboard absensi
- Pemindaian QR Code untuk absen
- Halaman admin untuk generate QR dan finalize attendance
- Admin actions secured with short-lived server-issued tokens
- PWA installable via browser

## Menjalankan aplikasi

1. Jalankan server lokal di folder proyek:
   ```powershell
   cd /d "d:\aplikasi magang kai\aplikasi-magang-kai"
   python -m http.server 8000
   ```
2. Buka browser ke `http://127.0.0.1:8000`.

## Deployment Apps Script & Testing

1. Buat Google Spreadsheet baru dan catat `Spreadsheet ID` dari URL (bagian `/d/<<ID>>/edit`).
2. Pastikan sheet pertama (tab paling kiri) berisi header user: `nim`, `nama`, `email`, `divisi`, `password` (kolom lainnya dapat ditambahkan).
3. Buka Google Apps Script (https://script.google.com) → buat proyek baru → paste isi `apps-script/Code.gs`.
4. Update `Config.SHEET_ID` dengan `Spreadsheet ID` Anda.
   - Catatan: Proyek ini tidak lagi menggunakan `ADMIN_KEY`. Admin actions menggunakan token singkat yang dibuat oleh server; admin harus login di UI untuk mendapatkan token.
5. Deploy: `Deploy` → `New deployment` → `Web app` → `Execute as: Me` → `Who has access: Anyone` (atau sesuai kebutuhan).
6. Salin `Web app URL` dan set `CONFIG.API_URL` di `js/config.js` ke URL tersebut.

Menjalankan frontend lokal:
```powershell
cd /d "d:\aplikasi magang kai\aplikasi-magang-kai"
python -m http.server 8000
# buka http://127.0.0.1:8000/index.html
```

Contoh request PowerShell (generate QR menggunakan admin token):
```powershell
$body = @{ action = 'generate_qr'; admin_token = 'YOUR_ADMIN_TOKEN'; type = 'masuk'; nim = '202311001'; date = (Get-Date -Format yyyy-MM-dd) } | ConvertTo-Json
Invoke-RestMethod -Uri 'https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec' -Method Post -Body $body -ContentType 'application/json'
```

Contoh request PowerShell (absen menggunakan payload QR):
```powershell
$payloadText = 'KAI_ABSEN|nim=202311001|type=masuk|date=' + (Get-Date -Format yyyy-MM-dd)
$body = @{ action = 'absen'; nim = '202311001'; qr = $payloadText; nama = 'Nama Pengguna' } | ConvertTo-Json
Invoke-RestMethod -Uri 'https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec' -Method Post -Body $body -ContentType 'application/json'
```

Catatan penting:
- Ganti `YOUR_DEPLOY_ID` dengan ID deployment Apps Script Anda.
- Admin actions sekarang memerlukan `admin_token`. Dapatkan token dengan login sebagai admin melalui antarmuka web; halaman admin akan meminta token secara otomatis.
- Apps Script akan membuat sheets `qr_log`, `attendance`, `attendance_summary`, dan `admin_tokens` bila belum ada.

Butuh bantuan deploy? Saya bisa pandu langkah demi langkah atau membantu memperbaiki setting akses pada Apps Script.
