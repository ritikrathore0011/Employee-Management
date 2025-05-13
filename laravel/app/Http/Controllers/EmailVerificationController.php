<?php

// namespace App\Http\Controllers;

// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\URL;
// use App\Models\User;
// use Illuminate\Support\Facades\Mail;
// use App\Mail\VerifyEmail;
// use Exception;
// class EmailVerificationController extends Controller
// {
//     public function verify(Request $request)
//     {
//         $message = null;
//         // Check if the verification link is valid
//         if (!$request->hasValidSignature()) {
//             $message = 'Invalid or expired verification link.';
//         } else {
//             // Find the user by ID
//             $user = User::find($request->id);
//             if (!$user) {
//                 $message = 'User not found';
//             } else if ($user->email_verified_at) {
//                 return redirect('/login')->with('status', 'Email Already verified!');
//             } else {
//                 // Mark email as verified
//                 $user->email_verified_at = now();
//                 $user->save();
//             }

//         }
//         if ($message) {
//             return view('auth.verification', compact('message'));
//         } else {
//             return redirect('/login')->with('status', 'Email verified successfully!');

//         }
//         // return response()->json(['message' => 'Email verified successfully!']);

//     }

//     public function resendVerification(Request $request)
//     {
//         // Validate email input
//         $request->validate(['email' => 'required|email']);

//         // Find user by email
//         $user = User::where('email', $request->email)->first();
//         $message = null;
//         if (!$user) {
//             $message = 'User not found';
//         }
//         // Check if user is already verified
//         else if ($user->email_verified_at) {
//             $message = 'Email already verified.';
//         } else {
//             // Generate a new signed verification link
//             $verificationUrl = URL::temporarySignedRoute(
//                 'verify.email',
//                 now()->addHours(24),
//                 ['id' => $user->id]
//             );

//             // Send verification email
//             // Mail::to($user->email)->send(new VerifyEmail($user, $verificationUrl));
//             try {
//                 Mail::to($user->email)->send(new VerifyEmail($user, $verificationUrl));
//                 $message = 'Mail sent successfully on your email.';
//             } catch (Exception $e) {
//                 $message = 'Failed to send email. Please try again.' . $e->getMessage();
//             }
//         }
//         return view('auth.verification', compact('message'));

//     }
// }
