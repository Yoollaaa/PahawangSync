<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Kosongkan data lama dulu agar tidak duplikat saat db:seed
        Product::truncate();

        $products = [
            // --- PENGINAPAN ---
            [
                'name' => 'Villa Apung Andreas Luxury',
                'category' => 'Penginapan',
                'description' => 'Villa eksklusif di atas air dengan pemandangan langsung ke laut jernih Pahawang.',
                'price' => 1250000,
                'image' => 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=800',
                'stock' => 5
            ],
            // --- TRANSPORTASI ---
            [
                'name' => 'Charter Speedboat 15 Pax',
                'category' => 'Transportasi',
                'description' => 'Sewa perahu cepat dari Dermaga Ketapang untuk hopping island seharian.',
                'price' => 850000,
                'image' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800',
                'stock' => 10
            ],
            // --- WAHANA ---
            [
                'name' => 'Paket Snorkeling Candi & Nemo',
                'category' => 'Wahana',
                'description' => 'Sewa alat lengkap, pelampung, kaki katak, dan dokumentasi underwater.',
                'price' => 250000,
                'image' => 'https://images.unsplash.com/photo-1544552866-d3ed42536fcb?q=80&w=800',
                'stock' => 50
            ],
            // --- KULINER ---
            [
                'name' => 'Paket BBQ Seafood Malam Pantai',
                'category' => 'Kuliner',
                'description' => 'Sajian ikan bakar, cumi, dan udang segar tangkapan nelayan lokal, dibakar langsung di tepi pantai.',
                'price' => 120000,
                'image' => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800',
                'stock' => 30
            ],
            // --- JASA DOKUMENTASI ---
            [
                'name' => 'Jasa Foto GoPro & Pilot Drone',
                'category' => 'Jasa Dokumentasi',
                'description' => 'Dokumentasi sinematik liburanmu dari udara menggunakan drone dan foto underwater jernih.',
                'price' => 450000,
                'image' => 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800',
                'stock' => 3
            ],
            // --- OLEH-OLEH ---
            [
                'name' => 'Kaos Eksklusif Pahawang Island',
                'category' => 'Oleh-oleh',
                'description' => 'Kaos premium bahan katun combed dengan desain khas kearifan lokal Pulau Pahawang.',
                'price' => 950000, // Disesuaikan format angka
                'image' => 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800',
                'stock' => 100
            ],
            // --- PAKET TOUR ---
            [
                'name' => 'Paket Bundling Group 3D2N Premium',
                'category' => 'Paket Tour',
                'description' => 'Paket lengkap terima beres mencakup Villa Apung, Boat, Makan 3x sehari, Alat Snorkeling, dan Guide.',
                'price' => 2450000,
                'image' => 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800',
                'stock' => 2
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}