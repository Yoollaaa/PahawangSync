<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Panggil ProductSeeder
        $this->call([
            ProductSeeder::class,
        ]);

        // Buat User dummy
        User::factory()->create([
            'name' => 'Febby Yolanda Putri',
            'email' => 'yola@example.com',
            'password' => bcrypt('password123'),
        ]);
    }
}