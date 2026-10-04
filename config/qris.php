<?php

return [
    /*
    |--------------------------------------------------------------------------
    | QRIS Statis Configuration
    |--------------------------------------------------------------------------
    |
    | Pengaturan untuk metode pembayaran QRIS Statis / Manual.
    | File gambar QRIS default ditaruh di public/images/qris.png
    | atau bisa disesuaikan path-nya lewat variabel environment.
    |
    */

    // Path gambar QRIS relatif terhadap public/ (atau URL eksternal)
    'image_path' => env('QRIS_IMAGE_PATH', '/images/qris.png'),

    // Nama toko / merchant yang tampil di bawah QRIS
    'merchant_name' => env('QRIS_MERCHANT_NAME', env('APP_NAME', 'MauStore')),

    // Nomor WhatsApp admin untuk konfirmasi pembayaran (format 628xxx)
    'whatsapp_number' => env('STORE_WHATSAPP_NUMBER', '6285952418477'),

    // Masa berlaku pesanan sebelum otomatis kadaluarsa (dalam menit)
    'expiry_minutes' => (int) env('QRIS_EXPIRY_MINUTES', 60),

    // Apakah mengaktifkan kode unik (100 - 999) agar mudah mendeteksi pembayaran di mutasi
    'enable_unique_code' => env('QRIS_ENABLE_UNIQUE_CODE', true),
];
