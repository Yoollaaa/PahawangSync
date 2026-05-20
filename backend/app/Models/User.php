<?php

namespace App\Models;

// Pastikan baris ini ada:
use Laravel\Sanctum\HasApiTokens; 
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    // Pastikan HasApiTokens ditambahkan di sini:
    use HasApiTokens, HasFactory, Notifiable; 

    // ... sisa kode di bawahnya biarkan saja
}