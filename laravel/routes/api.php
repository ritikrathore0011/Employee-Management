<?php
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TimeTrackerController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\ResetPasswordController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/send-otp', [ForgotPasswordController::class, 'sendOtp']);
Route::get('/check-in', [TimeTrackerController::class, 'checkIn'])->middleware('auth:sanctum');
Route::post('/check-out', [TimeTrackerController::class, 'checkOut'])->middleware('auth:sanctum');
// Route::post('/save-note', [TimeTrackerController::class, 'saveNote']);
Route::get('/checkStatus', [TimeTrackerController::class, 'checkStatus'])->middleware('auth:sanctum');
Route::get('/employees', [UserController::class, 'getUsers'])->middleware('auth:sanctum');
Route::get('/employees-count', [UserController::class, 'getUsersCount'])->middleware('auth:sanctum');
Route::post('/records', [TimeTrackerController::class, 'records'])->middleware('auth:sanctum');
Route::post('/auth/google-login', [GoogleAuthController::class, 'googleLogin']);
Route::post('/profile', [ProfileController::class, 'getProfile'])->middleware('auth:sanctum');
Route::post('/profile-save', [ProfileController::class, 'saveProfile'])->middleware('auth:sanctum');
Route::post('/delete', [ProfileController::class, 'deleteProfile'])->middleware('auth:sanctum');
Route::post('/leaves', [LeaveController::class, 'store'])->middleware('auth:sanctum');
Route::post('/leaves-status', [LeaveController::class, 'getUserLeaves'])->middleware('auth:sanctum');
Route::get('/pending-count', [LeaveController::class, 'pendingCount'])->middleware('auth:sanctum');
Route::post('/approve-leave', [LeaveController::class, 'approve'])->middleware('auth:sanctum');
Route::post('/add-holiday', [HolidayController::class, 'addHoliday'])->middleware('auth:sanctum');
Route::get('/holidays', [HolidayController::class, 'upcomingHolidays']);
Route::post('/summary', [TimeTrackerController::class, 'monthSummary'])->middleware('auth:sanctum');
// Route::get('/reset-password/{token}', [ResetPasswordController::class, 'showResetForm'])->name('password.reset');
Route::post('reset-password', [ResetPasswordController::class, 'reset'])->name('password.update');





