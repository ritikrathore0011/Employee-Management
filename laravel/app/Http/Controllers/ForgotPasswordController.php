<?php
// namespace App\Http\Controllers\Auth;

// use App\Http\Controllers\Controller;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Password;

// class ForgotPasswordController extends Controller
// {
//     public function showLinkRequestForm()
//     {
//         return view('auth.forgot-password');
//     }

//     public function sendResetLinkEmail(Request $request)
//     {
//         // Validate email
//         //$request->validate(['email' => 'required|email|exists:users,email']);
//         $request->validate(
//             ['email' => 'required|email|exists:users,email'],
//             [
//                 'email.required' => 'The email field is required.',
//                 'email.email' => 'Please enter a valid email address.',
//                 'email.exists' => 'This email is not registered in our system.'
//             ]
//         );
//         // Send password reset link
//        $status = Password::sendResetLink($request->only('email'));

//        if ($status === Password::RESET_LINK_SENT) {
//          return redirect()->back()->with('success', 'A password reset link has been sent to your email.');
//         } else {
//             return back()->withErrors(['email' => 'Failed to send password reset email. Please try again later.']);
//         }
//     }
// }
