<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'Admin MauStore',
            'email' => 'admin@maustore.test',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        // Staff (opsional, buat testing role nanti)
        User::create([
            'name' => 'Staff MauStore',
            'email' => 'staff@maustore.test',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
    }
}
