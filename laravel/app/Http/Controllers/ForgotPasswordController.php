<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Carbon;

class ForgotPasswordController extends Controller
{
    public function sendOtp(Request $request)
    {
        $request->validate(
            ['email' => 'required|email|exists:users,email'],
            [
                'email.required' => 'The email field is required.',
                'email.email' => 'Please enter a valid email address.',
                'email.exists' => 'This email is not registered in our system.'
            ]
        );
        // Send the password reset link
        // $status = Password::sendResetLink(
        //     $request->only('email')
        // );

        // if ($status === Password::RESET_LINK_SENT) {
        //     return response()->json([
        //         'success' => true,
        //         'message' => 'A password reset link has been sent to your email.'
        //     ]);
        // } else {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Failed to send password reset email. Please try again later.'
        //     ], 500);
        // }


        $otp = rand(100000, 999999);
        $email = $request->email;

        // Save OTP in password_resets table (encrypt if needed)
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => $otp, // you can also use Hash::make($otp) for security
                'created_at' => Carbon::now()
            ]
        );

        // Send OTP via email
        Mail::raw("Your OTP is: $otp", function ($message) use ($email) {
            $message->to($email)->subject('Your Password Reset OTP');
        });

        return response()->json([
            'success' => true,
            'message' => 'An OTP has been sent to your email.'
        ]);

    }
}