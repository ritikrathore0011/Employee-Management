<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use File;
class ResetPasswordController extends Controller
{
    public function reset(Request $request)
    {
        $request->validate([
            'otp' => 'required',
            'password' => [
                'required',
                'string',
                'regex:/[a-z]/', 
                'regex:/\d/', 
                'regex:/[@#$!%*?&]/', 
                'min:8', 
                'confirmed',
            ],
        ], [
            'password.regex' => 'The password must contain at least: 
        - One lowercase letter (a-z), 
        - One number (0-9), 
        - One special character (@#$!%*?&).',
        ]);

        $resetData = DB::table('password_reset_tokens')
            ->where('token', $request->otp) 
            ->first();

        if (!$resetData) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP.'
            ], 400);
        }

        // Check if OTP is older than 5 minutes
        if (Carbon::parse($resetData->created_at)->addMinutes(5)->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'OTP has expired.'
            ], 400);
        }
        // Find the user using the email stored in the token table
        $user = User::where('email', $resetData->email)->first();

        if (!$user) {
            // return back()->withErrors(['email' => 'User not found.']);
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        // Update the password
        $user->update(['password' => Hash::make($request->password)]);

        // Delete the reset token after successful password reset
        DB::table('password_reset_tokens')->where('email', $resetData->email)->delete();


        // This will revoke (delete) all tokens for the user
        $user->tokens()->delete();


        return response()->json([
            'success' => true,
            'message' => 'Password reset successful.',
            'redirect' => '/login' 
        ]);
    }
}

