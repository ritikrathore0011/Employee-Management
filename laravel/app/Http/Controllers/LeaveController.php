<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use App\Models\User;
use Illuminate\Support\Carbon;
use App\Models\LoginLogout;

class LeaveController extends Controller
{

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
        ]);

        try {
            // 🔐 Decrypt the user ID
            // $userId = Crypt::decrypt($request->user_id);

            $user = auth()->user();

            // 🔍 Find the user
            //  $user = User::find($userId);

            if (!$user) {
                return response()->json(['error' => 'User not found.'], 404);
            }

            // ✅ Proceed to create leave request (example)
            $leave = $user->leaves()->create([
                'type' => $request->type,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'reason' => $request->reason,
            ]);

            return response()->json(['message' => 'Leave request submitted.']);

        } catch (\Exception $e) {
            // ⚠️ Error in decryption or something else
            return response()->json(['error' => 'Invalid user ID.'], 400);
        }
    }

    public function getUserLeaves(Request $request)
    {
        // $request->validate([
        //     'user_id' => 'required',
        // ]);

        $user = auth()->user();
        // $userId = Crypt::decrypt($request->user_id);

        // 🔍 Find the user
        // $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }
        // if ($user->role === "Admin") {
        //     $leaves = Leave::where('status', 'pending')->get();
        //     return response()->json(data: $leaves);
        // }
        if ($user->role === "Admin") {
            // Eager load the user data (name and employee_id) with the leave records
            $leaves = Leave::where('status', 'pending')
                ->with('user:id,name,employee_id') // Load the user data with the leave records
                ->get();

            // Add user_name, employee_id, and encrypt leave_id in a single variable
            $leaves->each(function ($leave) {
                // Merging user information into the leave record
                $leave->user_name = $leave->user->name; // Add user name to leave
                $leave->employee_id = $leave->user->employee_id; // Add employee ID to leave

                // Encrypt the leave id and replace the original id with the encrypted one
                $leave->leave_id_encrypted = Crypt::encryptString($leave->id); // Encrypt the leave_id
                unset($leave->id); // Optionally remove the original id if you don't want to return it

                // Remove the entire user object to avoid it in the final response
                unset($leave->user); // This removes the 'user' relationship
            });

            return response()->json(data: $leaves);
        }
        if ($user->role === "Employee") {
            $leaves = $user->leaves; // Assuming the relationship is defined in the User model
            return response()->json(data: $leaves);
        }
    }

    public function approve(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }
        if ($user->role === "Admin") {
            //   $leaveId = $request->input('id'); // 👈 will receive the ID as 'id'
            try {
                $leaveId = Crypt::decryptString($request->leaveId);

                $leave = Leave::find($leaveId);

                if (!$leave) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Leave not found.'
                    ], 404);
                }

                if ($request->action == 0) {
                    // Update leave status
                    $leave->status = 'Rejected';
                    $leave->save();

                    return response()->json([
                        'status' => true,
                        'message' => 'Leave Rejected Successfully.',
                    ]);

                } else if ($request->action == 1) {
                    // Update leave status
                    $leave->status = 'approved';
                    $leave->save();

                    // Generate records from start_date to end_date
                    $start = Carbon::parse($leave->start_date);
                    $end = Carbon::parse($leave->end_date);
                    // Loop through the date range
                    for ($date = $start; $date->lte($end); $date->addDay()) {
                        // Check if attendance record already exists
                        if (
                            !LoginLogout::where('user_id', $leave->user_id)
                                ->where('date', $date->format('Y-m-d'))
                                ->exists()
                        ) {
                            // If it doesn't exist, create the attendance record
                            LoginLogout::create([
                                'user_id' => $leave->user_id,
                                'date' => $date->format('Y-m-d'),
                                'note' => 'leave'
                            ]);
                        }
                    }

                    return response()->json([
                        'status' => true,
                        'message' => 'Leave approved and attendance records created.',
                    ]);
                }

            } catch (\Exception $e) {
                return response()->json([
                    'status' => false,
                    'message' => 'Error processing leave approval.',
                    'error' => $e->getMessage()
                ], 400);
            }
        }
    }

    public function pendingCount(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $count = Leave::where('status', 'pending')->count();
        return response()->json(['count' => $count]);
        
    }

}