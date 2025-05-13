<?php

namespace App\Http\Controllers;
use App\Models\User;
use App\Models\EmailOtp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Session;
use File;
use Exception;
use App\Mail\VerifyEmail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;
class UserController extends Controller
{
    // public function index()
    // {
    //     $id = session('user_id');
    //     $user = User::find($id);
    //     return view('settings.index', compact('user'));
    // }

    // public function updateUsername(Request $request)
    // {
    //     $request->validate([
    //         'username' => 'required|string|unique:users,username,' . Auth::id(),
    //         'email' => 'required|string|email:rfc,dns|max:255|unique:users,email,' . Auth::id(),
    //     ]);

    //     $user = Auth::user();
       
    //     if($user->email === $request->email){
    //         $user->username = $request->username;
    //         $user->save();
    //      return response()->json(['success' => 'Username updated successfully!']);
    //     }else{
    //         $user->username = $request->username;
    //         $user->save();

    //        // response()->json(['success' => 'Username updated successfully!']);

    //         $otpResponse = $this->sendOtp($request);
    //         $otpData = json_decode($otpResponse->getContent(), true); // Decode OTP response
    
    //         return response()->json([
    //             'success' => 'Username updated successfully!',
    //             'message' => $otpData['message'], // "OTP sent to your email."
    //             'Otp' => $otpData['Otp']
    //         ]);

    //        // return $this->sendOtp($request);
    //     }
    // }

    // public function sendOtp(Request $request)
    // {
    //     $request->validate([
    //         'email' => 'required|string|email:rfc,dns|max:255|unique:users,email,' . Auth::id(),
    //     ]);
    //     $email = $request->input('email');
    //     // Generate OTP (6-digit random number)
    //     $otp = rand(100000, 999999); // Generate a numeric OTP
    
    //     // Save OTP to database with expiration time (e.g., 5 minutes)
    //     EmailOtp::updateOrCreate(
    //         ['email' => $email], // Ensures one OTP per email
    //         [
    //             'otp' => $otp,
    //             'expires_at' => Carbon::now()->addMinutes(5)
    //         ]
    //     );
    
    //     // Send OTP to email
    //     Mail::send('emails.otp', ['otp' => $otp], function ($message) use ($email) {
    //         $message->to($email)->subject('Your OTP Code');
    //     });
    
    //     return response()->json(['message' => 'OTP sent to your email.','Otp' => true]);
    // }
    
    // public function verifyOtp(Request $request)
    // {
    //     $request->validate([
    //         'email' => 'required|email|exists:email_otps,email',
    //         'otp' => 'required|digits:6',
    //     ]);
       
    //     $email = $request->input('email');
    //     $otp = $request->input('otp');
    
    //     // Check if OTP exists and is not expired
    //     $otpRecord = EmailOtp::where('email', $email)->first();
    
    //     if (!$otpRecord) {
    //         throw ValidationException::withMessages(['email' => ['OTP not found for this email.']]);
    //     }
    
    //     if (now()->greaterThan(date: $otpRecord->expires_at)) {
    //         throw ValidationException::withMessages(['otp' => ['OTP has expired.']]);
    //     }
    
    //     if ($request->otp !== $otpRecord->otp) {
    //         throw ValidationException::withMessages(['otp' => ['Invalid OTP.']]);
    //     }
    //     // Proceed to update email
    //     $user = auth()->user(); // Assuming the user is authenticated
    //     $user->email = $email;
    //     $user->save();
    
    //     // Delete OTP after successful verification
    //     $otpRecord->delete();
    
    //     return response()->json(['success' => 'Email updated successfully.']);
    // }


    // public function updatePassword(Request $request)
    // {
    //     $request->validate([
    //         'current_password' => 'required',
    //         //'new_password' => 'required|min:6|confirmed',
    //         'new_password' => [
    //             'required',
    //             'string',
    //             'regex:/[a-z]/', // At least one lowercase letter
    //             'regex:/\d/', // At least one number
    //             'regex:/[@#$!%*?&]/', // At least one special character
    //             'min:8', // Minimum 8 characters
    //             'confirmed', // Matches password_confirmation
    //         ],
    //     ], [

    //         'new_password.regex' => 'The password must contain at least: 
    //     - One lowercase letter (a-z), 
    //     - One number (0-9), 
    //     - One special character (@#$!%*?&).',
    //     ]);

    //     $user = Auth::user();

    //     if (!Hash::check($request->current_password, $user->password)) {
    //         return response()->json([
    //             'success' => false,
    //             'errors' => ['current_password' => ['Current password is incorrect.']]
    //         ], 422);
    //     }

    //     $user->password = Hash::make($request->new_password);
    //     $user->save();

    //     //for logout from all devices 
    //     $userId = Auth::id();  // Get the current user's ID

    //     // Directory where Laravel stores session files
    //     $sessionDirectory = storage_path('framework/sessions');

    //     // Get all session files in the session directory
    //     $sessionFiles = File::allFiles($sessionDirectory);


    //     // Loop through each session file
    //     foreach ($sessionFiles as $file) {
    //         // Get the session data from the file
    //         $sessionData = unserialize(File::get($file));

    //         // Check if the session data contains the user's ID
    //         if (isset($sessionData['user_id']) && $sessionData['user_id'] == $userId) {
    //             // Delete the session file if it belongs to the user
    //             File::delete($file);

    //         }
    //     }


    //     return response()->json(['success' => 'Password changed successfully!']);
    // }

    // public function roleIndex()
    // {
    //     $users = User::whereIn('role', ['accountant', 'teacher', 'guest'])->get();

    //     return view('roleAssign.index', compact('users'));
    // }

    // public function storeUser(Request $request)
    // {
    //     // Validate request
    //     $request->validate([
    //         'username' => [
    //             'required',
    //             'unique:users,username',
    //             'regex:/^\S+$/'
    //         ],
    //         'firstname' => 'required|string|max:20',
    //         'lastname' => 'required|string|max:20',
    //         'email' => 'required|string|email:rfc,dns|max:255|unique:users',

    //         // 'username' => 'required|unique:users,username|regex:/^[a-zA-Z0-9]+$/',
    //         'role' => 'required|in:accountant,teacher,guest', // Validate ENUM values
    //         'password' => [
    //             'required',
    //             'string',
    //             'regex:/[a-z]/', // At least one lowercase letter
    //             'regex:/\d/', // At least one number
    //             'regex:/[@#$!%*?&]/', // At least one special character
    //             'min:8', // Minimum 8 characters
    //         ],
    //     ], [
    //         'username.regex' => 'Spaces are not allowed in username.',
    //         'password.regex' => 'The password must contain at least: 
    //     - One lowercase letter (a-z), 
    //     - One number (0-9), 
    //     - One special character (@#$!%*?&).',
    //     ]);

    //     // Save user in the database
    //     $user = User::create([
    //         'username' => $request->username,
    //         'email' => $request->email,
    //         'role' => $request->role, // ENUM field
    //         'status' => $request->status,
    //         'fname' => $request->firstname,
    //         'lname' => $request->lastname,
    //         'mobile_no' => $request->phone,
    //         'password' => Hash::make($request->password)
    //     ]);


    //     $verificationUrl = URL::signedRoute('verify.email', ['id' => $user->id]);

    //     try {
    //         Mail::to($user->email)->send(new VerifyEmail($user, $verificationUrl));
    //     } catch (Exception $e) {
    //         return redirect()->back()->with('error', 'User Added but Failed to send email.' . $e->getMessage());
    //     }


    //     return response()->json(['success' => 'User added successfully!']);
    // }

    // public function editUser(Request $request)
    // {
    //     $request->validate([
    //         'username' => 'required|regex:/^\S+$/|unique:users,username,' . $request->id,
    //         'role' => 'required|in:accountant,teacher,guest', // Validate ENUM values
    //     ], [
    //         'username.regex' => 'Spaces are not allowed in username.',
    //     ]);

    //     // Find the user by ID
    //     $user = User::find($request->id);
    //     // Update the user fields
    //     $user->username = $request->username;
    //     $user->role = $request->role;
    //     $user->status = $request->status;
    //     // Save the updated user details
    //     $user->save();
    //     // Return a success response
    //     return response()->json(['message' => 'User updated successfully!']);
    // }

    // public function destroy($id)
    // {
    //     $user = User::find($id); // Find user or throw error
    //     $user->delete(); // Delete user

    //     return response()->json(['message' => 'User deleted successfully']);
    // }


    public function getUsers()
    {
        $users = User::where('role', '!=', 'admin')->get();
        return response()->json([
            'status' => true,
            'users' => $users,
        ]);
    }

    public function getUsersCount(){
        $users = User::where('role', '!=', 'admin')->count();
        return response()->json([
            'status' => true,
            'count' => $users,
        ]);
    }
}


