<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Carbon\Carbon;
use App\Models\LoginLogout;
class TimeTrackerController extends Controller
{

    public function checkIn(Request $request)
    {
        try {
            // 🔓 Decrypt the user ID from request
            $userId = Crypt::decrypt($request->id);

            // 📝 Create a new log entry for check-in
            $log = LoginLogout::create([
                'user_id' => $userId,
                'login_time' => now(),
                'date' => Carbon::now()->toDateString(),
            ]);

            // ✅ Return encrypted log_id so it can be used for logout later
            return response()->json([
                'status' => true,
                'log_id' => Crypt::encrypt($log->id),
                'message' => 'Check-In successful'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Check-In failed',
                'error' => $e->getMessage()
            ]);
        }
    }


    public function checkOut(Request $request)
    {
        try {
            // 🔓 Decrypt the log_id
            $log_id = Crypt::decrypt($request->log_id);

            // 🔄 Find the log entry and update the logout_time
            $log = LoginLogout::find($log_id);

            if ($log) {
                $log->logout_time = now();
                $log->save();

                return response()->json([
                    'status' => true,
                    'message' => 'Logout successful'
                ]);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'Log entry not found'
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid log_id or error occurred',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function saveNote(Request $request)
    {
        try {
            // 🔓 Decrypt the log_id
            $log_id = Crypt::decrypt($request->log_id);
            // print_r($log_id);die;

            // 🔄 Find the log entry and update the logout_time
            $log = LoginLogout::find($log_id);

            if ($log) {
                $log->note = $request->note;
                $log->save();

                return response()->json([
                    'status' => true,
                    'message' => 'Logout successful'
                ]);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'Log entry not found'
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid log_id or error occurred',
                'error' => $e->getMessage()
            ]);
        }
    }


    public function checkStatus(Request $request)
    {
        $userId = Crypt::decrypt($request->id);
        $currentDate = Carbon::now()->toDateString(); // Get the current date

        // Check if the user has a record for today
        $existingRecord = LoginLogout::where('user_id', $userId)
            ->where('date', $currentDate)
            ->first();

        if ($existingRecord) {
            // Exclude the 'id' field from the record
            $recordWithoutId = $existingRecord->except(['id']);

            return response()->json([
                'status' => true,
                'message' => 'You have already checked in today.',
                'check_in_status' => 'checked-in',
                'log_id' => Crypt::encrypt($existingRecord->id), // Send the existing log_id for any further operations like checkout
                'record' => $recordWithoutId, // Send the full record except for the 'id'
            ]);
        }

        return response()->json([
            'status' => false,
            'message' => 'No record found for today, you can check in.',
            'check_in_status' => 'pending',
        ]);
    }


    public function takeLeave(Request $request)
    {
        $userId = Crypt::decrypt($request->id);


        // Optional: Check if leave already taken today
        $today = now()->toDateString();
        $alreadyMarked = LoginLogout::where('user_id', $userId)->whereDate('date', $today)->exists();

        if ($alreadyMarked) {
            return response()->json(['status' => false, 'message' => 'Leave already marked for today']);
        }

        $leave =  $request->note ? $request->note : "Leave"; 

        LoginLogout::create([
            'user_id' => $userId,
            'date' => $today,
            'note' => $leave, // optional
        ]);

        return response()->json(['status' => true, 'message' => 'Leave marked successfully']);
    }

    //     public function records(Request $request)
//     {
//         $userId = Crypt::decrypt($request->user_id);

    //         // Fetch logs with user info (adjust table/column names as per your DB)
//         $logs = LoginLogout::with('user:id,name') // assumes a `user()` relationship is defined
//             ->orderBy('login_time', 'desc')
//             ->get()
//             ->map(function ($log) {
//                 return [
//                     'id' => $log->id,
//                     'login_time' => $log->login_time,
//                     'logout_time' => $log->logout_time,
//                     'note' => $log->note,
//                     'date' =>$log->date
//                 ];
//             });

    //         return response()->json([
//             'status' => true,
//             'records' => $logs,
//         ]);
//     }

    // }
    public function records(Request $request)
    {
        $userId = Crypt::decrypt($request->user_id);

        $query = LoginLogout::with('user:id,name')
            ->where('user_id', $userId);

        // Filter if year and month are provided
        if ($request->filled('year') && $request->filled('month')) {
            $year = $request->year;
            $month = str_pad($request->month, 2, '0', STR_PAD_LEFT);

            $query->whereYear('date', $year)
                ->whereMonth('date', $month);
        }

        $logs = $query->orderBy('login_time', 'desc')->get();

        if ($logs->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'No records found for selected month and year.',
            ]);
        }

        $records = $logs->map(function ($log) {
            return [
                'id' => $log->id,
                'login_time' => $log->login_time,
                'logout_time' => $log->logout_time,
                'note' => $log->note,
                'date' => $log->date
            ];
        });

        return response()->json([
            'status' => true,
            'records' => $records,
        ]);
    }

}