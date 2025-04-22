<?php

// namespace App\Http\Controllers\Auth;

// use App\Http\Controllers\Controller;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Password;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\DB;
// use App\Models\User;
// use Illuminate\Support\Facades\Hash;
// use File;
// class ResetPasswordController extends Controller
// {
//     public function showResetForm($token)
//     {
//         return view('auth.reset-password', ['token' => $token]);
//     }
//     public function reset(Request $request)
//     {
//         $request->validate([
//             'token' => 'required',
//             // 'password' => 'required|min:8|confirmed',
//             'password' => [
//                 'required',
//                 'string',
//                 'regex:/[a-z]/', // At least one lowercase letter
//                 'regex:/\d/', // At least one number
//                 'regex:/[@#$!%*?&]/', // At least one special character
//                 'min:8', // Minimum 8 characters
//                 'confirmed', // Matches password_confirmation
//             ],
//         ], [
//             //'password.required' => 'The password field is required.',
//             //'password.min' => 'The password must be at least 8 characters long.',
//             //'password.confirmed' => 'The password confirmation does not match.',
//             'password.regex' => 'The password must contain at least: 
//         - One lowercase letter (a-z), 
//         - One number (0-9), 
//         - One special character (@#$!%*?&).',
//         ]);

//         // Retrieve the reset data using the token
//         // $resetData = DB::table('password_reset_tokens')->first();

//         // if (!$resetData || !Hash::check($request->token, $resetData->token)) {
//         //     return back()->withErrors(['token' => 'Invalid or expired token.']);
//         // }
//         $resetData = DB::table('password_reset_tokens')->get()->first(function ($item) use ($request) {
//             return Hash::check($request->token, $item->token);
//         });
        
//         if (!$resetData) {
//             return back()->withErrors(['token' => 'Invalid or expired token.']);
//         }
        
//         // Find the user using the email stored in the token table
//         $user = User::where('email', $resetData->email)->first();

//         if (!$user) {
//             return back()->withErrors(['email' => 'User not found.']);
//         }

//         // Update the password
//         $user->update(['password' => Hash::make($request->password)]);

//         // Delete the reset token after successful password reset
//         DB::table('password_reset_tokens')->where('email', $resetData->email)->delete();


//          //for logout from all devices 
//          $userId = $user->id;  // Get the current user's ID
      
//          // Directory where Laravel stores session files
//          $sessionDirectory = storage_path('framework/sessions');
 
//          // Get all session files in the session directory
//          $sessionFiles = File::allFiles($sessionDirectory);
 
 
//          // Loop through each session file
//          foreach ($sessionFiles as $file) {
//              // Get the session data from the file
//              $sessionData = unserialize(File::get($file));
 
//              // Check if the session data contains the user's ID
//              if (isset($sessionData['user_id']) && $sessionData['user_id'] == $userId) {
//                  // Delete the session file if it belongs to the user
//                  File::delete($file);
 
//              }
//          }


//         return redirect('/login')->with('status', 'Password reset successful.');
//     }
// }

