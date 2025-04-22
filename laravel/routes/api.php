<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TimeTrackerController;
use App\Http\Controllers\GoogleSheetController;
use App\Http\Controllers\Auth\GoogleAuthController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/check-in', [TimeTrackerController::class, 'checkIn']);
Route::post('/check-out', [TimeTrackerController::class, 'checkOut']);
Route::post('/save-note', [TimeTrackerController::class, 'saveNote']);
Route::post('/checkStatus', [TimeTrackerController::class, 'checkStatus']);
Route::post('/take-leave', [TimeTrackerController::class, 'takeLeave']);

Route::post('/records', [TimeTrackerController::class, 'records']);
// Route::get('/auth/google', [GoogleAuthController::class, 'redirectToGoogle']);
// Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);

Route::post('/auth/google-login', [GoogleAuthController::class, 'googleLogin']);
Route::post('/create-google-sheet', [GoogleSheetController::class, 'createSheet']);
