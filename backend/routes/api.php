<?php

use App\Http\Controllers\Api\ProductController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;

// 1. Route untuk mengambil data produk di Landing Page
Route::get('/products', [ProductController::class, 'index']);

// 2. Route untuk Login
Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Data tidak cocok'], 401);
    }

    // Buat Token akses (Sanctum)
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'user' => $user,
        'token' => $token,
    ]);
});