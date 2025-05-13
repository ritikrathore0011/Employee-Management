<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Str;
use Google_Client;
use Illuminate\Support\Facades\Hash;

class GoogleAuthController extends Controller
{
    public function googleLogin(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $client = new Google_Client(['client_id' => env('GOOGLE_CLIENT_ID')]);
        $payload = $client->verifyIdToken($request->token);

        if (!$payload) {
            return response()->json(['error' => 'Invalid Google token'], 401);
        }

        // Create or find user

        // $user = User::firstOrCreate(
        //     ['email' => $payload['email']],
        //     [
        //         'name' => $payload['name'],
        //         'google_id' => $payload['sub'],
        //         'avatar' => $payload['picture'],
        //         'date_of_birth' => $payload['dob'] ?? null,
        //         'phone_number' => $payload['phone_number'] ?? null,
        //         'password' => Hash::make(Str::random(16)),
        //     ]
        // );

        // // Update last login time
        // $user->update([
        //     'last_login_at' => now()
        // ]);

        $user = User::where('google_id', $payload['sub'])
            ->orWhere('email', $payload['email'])
            ->first();

        if (!$user) {
            // If not found, create new user
            $user = User::create([
                'name' => $payload['name'],
                'email' => $payload['email'],
                'google_id' => $payload['sub'],
                'avatar' => $payload['picture'],
                'date_of_birth' => $payload['dob'] ?? null,
                'phone_number' => $payload['phone_number'] ?? null,
                'password' => Hash::make(Str::random(16)),
            ]);
        } elseif (!$user->google_id) {
            // If found but no google_id set, link the account
            $user->update([
                'google_id' => $payload['sub'],
                'avatar' => $payload['picture'], // optional: update picture too
            ]);
        }

        // Create token
        $token = $user->createToken('google')->plainTextToken;
        return response()->json([
            'user' => [
                // 'id' => Crypt::encrypt($user->id),
                'role' => $user->role,
                'name' => $user->name,
                'access_token' => $token,
                'profile' => $user->avatar,
                'initials' => strtoupper(substr($user->name, 0, 1)) .
                    (str_contains($user->name, ' ') ? strtoupper(substr(explode(' ', $user->name)[1], 0, 1)) : '')
            ],
        ]);

    }    

}