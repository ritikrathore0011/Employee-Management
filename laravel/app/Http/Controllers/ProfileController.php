<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class ProfileController extends Controller
{
    public function getProfile(Request $request)
    {
        try {
            $user = auth()->user();
            $userId = $user->id;
            // $user = User::with('employee')->findOrFail(id: $userId);
            $user = User::findOrFail($userId);

            // Step 3: Return user + employee data (you can customize this as needed)
            return response()->json([
                'status' => true,
                'data' => $user,
            ]);

        } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid or tampered ID.',
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Something went wrong.',
            ], 500);
        }
    }
    public function saveProfile(Request $request)
    {
        $userId = $request->id;
        if ($userId) {
            $request->validate([
                'name' => 'required|string',
                'date_of_birth' => 'required|date',
                'email' => 'required|unique:users,email,' . $userId,
                'phone_number' => 'required|string',
            ]);
        } else {
            $request->validate([
                'name' => 'required|string',
                'date_of_birth' => 'required|date',
                'email' => 'required|unique:users',
                'phone_number' => 'required|string',
                'password' => 'required|string|confirmed',
            ]);
        }

        try {
            // Check if authenticated user or creating a new user
            $authUser = auth()->user();
            $user = null;



            if (!$authUser || $authUser->role !== 'Admin') {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized.',
                ], 403);
            }

            if ($request->has('id')) {
                $user = User::find($request->id);
            }

            $password = $request->password;
            $hashed_password = password_hash($password, PASSWORD_BCRYPT);

            // Initialize paths
            $resumePath = $user->resume_path ?? null;
            $idProofPath = $user->id_proof_path ?? null;
            $contractPath = $user->contract_path ?? null;


            // File uploads
            if ($request->hasFile('resume')) {
                if ($resumePath && file_exists(public_path($resumePath))) {
                    unlink(public_path($resumePath));
                }
                $resumePath = '/storage/' . $request->file('resume')->store('documents/resumes', 'public');
            }

            if ($request->hasFile('id_proof')) {
                if ($idProofPath && file_exists(public_path($idProofPath))) {
                    unlink(public_path($idProofPath));
                }
                $idProofPath = '/storage/' . $request->file('id_proof')->store('documents/id_proofs', 'public');
            }

            if ($request->hasFile('contract')) {
                if ($contractPath && file_exists(public_path($contractPath))) {
                    unlink(public_path($contractPath));
                }
                $contractPath = '/storage/' . $request->file('contract')->store('documents/contracts', 'public');
            }

            // If user doesn't exist, create one
            if (!$user) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone_number' => $request->phone_number,
                    'date_of_birth' => $request->date_of_birth,
                    'password' => $hashed_password,
                    'address' => $request->address,
                    'department' => $request->department,
                    'designation' => $request->designation,
                    'date_of_joining' => $request->date_of_joining,
                    'emergency_contact_phone' => $request->emergency_contact_phone,
                    'account_number' => $request->account_number,
                    'ifsc_code' => $request->ifsc_code,
                    'bank_name' => $request->bank_name,
                    'resume_path' => $resumePath,
                    'id_proof_path' => $idProofPath,
                    'contract_path' => $contractPath,
                ]);

            } else {
                // Update user details
                $user->update([
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone_number' => $request->phone_number,
                    'date_of_birth' => $request->date_of_birth,
                    'address' => $request->address,
                    'department' => $request->department,
                    'designation' => $request->designation,
                    'date_of_joining' => $request->date_of_joining,
                    'emergency_contact_phone' => $request->emergency_contact_phone,
                    'account_number' => $request->account_number,
                    'ifsc_code' => $request->ifsc_code,
                    'bank_name' => $request->bank_name,
                    'resume_path' => $resumePath,
                    'id_proof_path' => $idProofPath,
                    'contract_path' => $contractPath,
                    'status' => $request->status ? $request->status : "active"

                ]);
            }

            return response()->json([
                'status' => true,
                'message' => 'Profile saved successfully.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Something went wrong: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function deleteProfile(Request $request){

        $user = auth()->user();
       $request->validate([
            'id' => 'required|exists:users,id'
       ]);

       $user = User::find($request->id);

       if ($user) {
           $user->delete(); // This performs a soft delete
           return response()->json([
            'status' => true,
            'message' => 'User soft deleted successfully.']);
       }
   
       return response()->json(['error' => 'User not found.'], 404);
    }
}
