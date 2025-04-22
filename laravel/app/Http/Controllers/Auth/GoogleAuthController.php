<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Google_Client;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Crypt;
use Google_Service_Sheets;
use Google_Service_Drive;
use Google_Service_Sheets_Spreadsheet;
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
        
        $user = User::firstOrCreate(
            ['email' => $payload['email']],
            [
                'name' => $payload['name'],
                'google_id' => $payload['sub'],
                'avatar' => $payload['picture'],
                'date_of_birth' => $payload['dob'] ?? null,
                'phone_number' => $payload['phone_number'] ?? null,
                'password' => Hash::make(Str::random(16)),
            ]
        );
 
        // Update last login time
        $user->update([
            'last_login_at' => now()
        ]);


        // Create token
        $token = $user->createToken('google')->plainTextToken;
        return response()->json([
            'user' => [
                'id' => Crypt::encrypt($user->id),
                'name' => $user->name,
                'profile'=>$user->avatar,
                'initials' => strtoupper(substr($user->name, 0, 1)) .
                (str_contains($user->name, ' ') ? strtoupper(substr(explode(' ', $user->name)[1], 0, 1)) : '')
            ],
            'access_token' => $token,
        ]);
        
    }

    


    public function createGoogleSheet(Request $request)
    {
        $accessToken = $request->bearerToken();
    
        // Initialize Google Client with Access Token
        $client = new Google_Client();
        $client->setAccessToken($accessToken);
    
        // Check if the access token is still valid
        if ($client->isAccessTokenExpired()) {
            return response()->json(['error' => 'Access token expired'], 401);
        }
    
        // Initialize Google Sheets service
        $service = new Google_Service_Sheets($client);
    
        // Create a new sheet with a title
        $spreadsheet = new \Google_Service_Sheets_Spreadsheet([
            'properties' => ['title' => 'My New Sheet']
        ]);
    
        try {
            $newSheet = $service->spreadsheets->create($spreadsheet);
            return response()->json(['url' => $newSheet->spreadsheetUrl]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create sheet', 'message' => $e->getMessage()], 500);
        }
    }

}