<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;




Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/', function () {
    return 'hello';
});





















use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\EmailVerificationController;


// Route::put('/verify-otp', [UserController::class, 'verifyOtp'])->name('verify.otp');
// Route::get('/verify-email', [EmailVerificationController::class, 'verify'])->name('verify.email');
//Route::get('login', [AuthController::class, 'index'])->name('login');

// Route::get('/forgot-password', [ForgotPasswordController::class, 'showLinkRequestForm'])->name('passwordReset.blade');
// Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail'])->name('passwordReset.email');
// Route::get('/reset-password/{token}', [ResetPasswordController::class, 'showResetForm'])->name('password.reset');
// Route::post('reset-password', [ResetPasswordController::class, 'reset'])->name('password.update');
