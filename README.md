# Absensi Magang KAI

Aplikasi absensi mahasiswa magang untuk PT KAI Divre II Sumbar.

## Fitur

- Login mahasiswa
- Daftar akun lokal
- Dashboard absensi
- Pemindaian QR Code untuk absen
- PWA installable via browser

## Menjalankan aplikasi

1. Jalankan server lokal di folder proyek:
   ```powershell
   cd /d "d:\Absensi Magang"
   python -m http.server 8000
   ```
2. Buka browser ke `http://127.0.0.1:8000`.

## GitHub Pages

1. Pastikan repository sudah terpush ke GitHub.
2. Buka repository di GitHub.
3. Pilih `Settings` -> `Pages`.
4. Pada `Source`, pilih branch `main` dan folder `/root`.
5. Klik `Save`.
6. Tunggu beberapa menit sampai URL Pages muncul.

> Jika tidak tersedia, pastikan branch `main` sudah ada dan Anda memiliki akses repository.

## Menampilkan aplikasi sebagai PWA

- Buka URL GitHub Pages di browser Chrome/Edge.
- Login dan buka dashboard.
- Tombol `Pasang Aplikasi` akan muncul jika browser mendukung PWA.
