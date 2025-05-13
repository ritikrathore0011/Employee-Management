<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Crypt;
use App\Models\LoginLogout;
use Carbon\Carbon;
class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Validate input
        $request->validate([
            'username' => 'required|string',
            'password' => 'required'
        ]);

        $remember = $request->has('remember'); // Check if "Remember Me" is checked

        //  Save Remember Me Cookie **Before Login Attempt**
        if ($remember) {
            Cookie::queue('remembered_username', $request->username, 10080); // Store for 7 days
            Cookie::queue('remembered_password', $request->password, 10080); // Store for 7 days
        } else {
            Cookie::queue(Cookie::forget('remembered_username'));
        }

        // Check if user exists with given username
        $user = User::where('name', $request->username)
            ->orWhere('email', $request->username)
            ->first();


        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'User not found'
            ], 404);
        }


        $credentials = [
            'email' => $user->email,  // Always use the email field for Auth::attempt()
            'password' => $request->password
        ];

        // Attempt login
        if (Auth::attempt($credentials)) {
            // Redirect based on role
            $user = Auth::user();

            $token = $user->createToken('auth_token')->plainTextToken;
            return response()->json([
                'status' => true,
                'message' => 'Login successful',
                'user' => [
                    'name' => $user->name,
                    'access_token' => $token,
                    'role' =>$user->role,
                    'initials' => strtoupper(substr($user->name, 0, 1)) .
                        (str_contains($user->name, ' ') ? strtoupper(substr(explode(' ', $user->name)[1], 0, 1)) : '')
                ]
            ]);
        }

        return response()->json([
            'status' => false,
            'message' => 'Invalid credentials'
        ], 401);
    }


    public function logout(Request $request)
    {
        $logId = Crypt::decrypt($request->log_id); // Get decrypted log ID

        // Update logout time
        LoginLogout::where('id', $logId)->update([
            'logout_time' => now()
        ]);

        Auth::logout(); // Optional, depends on your session setup

        return response()->json(['message' => 'Logout successful']);
    }

}
