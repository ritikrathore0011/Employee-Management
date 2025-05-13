<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Carbon\Carbon;
use App\Models\LoginLogout;
use DB;
class TimeTrackerController extends Controller
{
    public function checkIn()
    {
        try {
            $user = auth()->user();
            $userId = $user->id;



            // $log = LoginLogout::create([
            //     'user_id' => $userId,
            //     'login_time' => now(),
            //     'date' => Carbon::now()->toDateString(),
            // ]);

            $log = LoginLogout::updateOrCreate(
                [
                    'user_id' => $userId,
                    'date' => Carbon::now()->toDateString(),
                ],
                [
                    'login_time' => now(),
                ]
            );
            
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
            $log_id = Crypt::decrypt($request->log_id);
            $log = LoginLogout::find($log_id);
            if ($log) {
                $log->note = $request->note;
                $log->eod = $request->eod;
                $log->logout_time = now();
                $log->save();

                return response()->json([
                    'status' => true,
                    'message' => 'checkout successful'
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

    // public function saveNote(Request $request)
    // {
    //     try {
    //         // 🔓 Decrypt the log_id
    //         $log_id = Crypt::decrypt($request->log_id);
    //         // 🔄 Find the log entry and update the logout_time
    //         $log = LoginLogout::find($log_id);

    //         if ($log) {
    //             $log->note = $request->note;
    //             $log->save();

    //             return response()->json([
    //                 'status' => true,
    //                 'message' => 'Logout successful'
    //             ]);
    //         } else {
    //             return response()->json([
    //                 'status' => false,
    //                 'message' => 'Log entry not found'
    //             ]);
    //         }
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'status' => false,
    //             'message' => 'Invalid log_id or error occurred',
    //             'error' => $e->getMessage()
    //         ]);
    //     }
    // }


    public function checkStatus()
    {
        // $userId = Crypt::decrypt($request->id);
        $user = auth()->user();
        $userId = $user->id;

        $currentDate = Carbon::now()->toDateString();

        // Check if the user has a record for today
        $existingRecord = LoginLogout::where('user_id', $userId)
            ->where('date', $currentDate)
            ->first();

        if ($existingRecord) {
            // Exclude the 'id' field from the record
            $recordWithoutId = $existingRecord->except(['id', 'user_id']);

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


    // public function takeLeave(Request $request)
    // {
    //     $userId = Crypt::decrypt($request->id);
    //     // Optional: Check if leave already taken today
    //     $today = now()->toDateString();
    //     $alreadyMarked = LoginLogout::where('user_id', $userId)->whereDate('date', $today)->exists();

    //     if ($alreadyMarked) {
    //         return response()->json(['status' => false, 'message' => 'Leave already marked for today']);
    //     }

    //     $leave = $request->note ? $request->note : "Leave";

    //     LoginLogout::create([
    //         'user_id' => $userId,
    //         'date' => $today,
    //         'note' => $leave, // optional
    //     ]);

    //     return response()->json(['status' => true, 'message' => 'Leave marked successfully']);
    // }

    public function records(Request $request)
    {
        $user = auth()->user();
        $userId = $user->id;

        $year = $request->filled('year') ? $request->year : now()->year;
        $month = $request->filled('month') ? str_pad($request->month, 2, '0', STR_PAD_LEFT) : now()->format('m');

        $firstDay = Carbon::create($year, $month, 1);
        $lastDay = $firstDay->copy()->endOfMonth();

        // Generate all dates in the month
        $allDates = [];
        $date = $firstDay->copy();
        while ($date <= $lastDay) {
            $allDates[] = $date->format('Y-m-d');
            $date->addDay();
        }

        // Fetch attendance logs
        $logs = LoginLogout::with('user:id,name')
            ->where('user_id', $userId)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->orderBy('login_time', 'desc')
            ->get();


        if ($logs->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'No records found for selected month and year.',
            ]);
        }

        // Map logs by date
        $recordsByDate = $logs->mapWithKeys(function ($log) {
            return [
                $log->date => [
                    'id' => $log->id,
                    'login_time' => $log->login_time,
                    'logout_time' => $log->logout_time,
                    'note' => $log->note,
                    'date' => $log->date,
                    'eod' => $log->eod
                ]
            ];
        });

        // Get holidays
        $holidays = DB::table('holidays')
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->pluck('title', 'date');

        // Fill in dates without logs
        foreach ($allDates as $dateStr) {
            if (!isset($recordsByDate[$dateStr])) {
                $carbonDate = Carbon::parse($dateStr);
                $dayOfWeek = $carbonDate->dayOfWeek; // 0 = Sunday
                $weekOfMonth = intval(floor(($carbonDate->day - 1) / 7)) + 1;

                $note = null;
                if ($holidays->has($dateStr)) {
                    $note = $holidays[$dateStr];
                } elseif ($dayOfWeek === 0) {
                    $note = 'Sunday';
                } elseif ($dayOfWeek === 6 && ($weekOfMonth === 2 || $weekOfMonth === 4)) {
                    $note = 'Saturday';
                }

                $recordsByDate[$dateStr] = [
                    'id' => null,
                    'login_time' => null,
                    'logout_time' => null,
                    'note' => $note,
                    'date' => $dateStr,
                ];
            }
        }
        // $request = null;
        // $request = [
        //     'id' => $userId,
        //     'month' => $month,
        //     'year' => $year,
        // ];
        $request->id = $userId;

        $monthSummary = $this->monthSummary($request);

        // Sort and return
        $sortedRecords = collect($recordsByDate)->sortBy('date')->values();

        return response()->json([
            'status' => true,
            'records' => $sortedRecords,
            'summary' => $monthSummary
        ]);
    }

    public function monthSummary(Request $request)
    {
        // $userId = $request->id;   
        // $month = $request->month;    
        // $year = $request->year;
        $userId = $request->id;
        $month = $request->month ? $request->month : now()->month;
        $year = $request->year ? $request->year : now()->year;

        $startDate = Carbon::create($year, $month, 1);
        $endDate = $startDate->copy()->endOfMonth();

        $totalDays = 0;
        $saturdayCount = 0;

        $logs = DB::table('login_logout')
        ->where('user_id', $userId)
        ->whereBetween('date', [$startDate, $endDate])
        ->get();

        if ($logs->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'No records found for selected month and year.',
            ]);
        }

        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            if ($date->isSunday()) {
                continue; // Exclude all Sundays
            }

            if ($date->isSaturday()) {
                $saturdayCount++;
                if ($saturdayCount === 2 || $saturdayCount === 4) {
                    continue; // Exclude 2nd and 4th Saturday
                }
            }

            $totalDays++;
        }

        $holiday = DB::table('holidays')
            ->whereBetween('date', [$startDate, $endDate])
            ->count();

        // $leave = DB::table('login_logout')
        //     ->where('user_id', $userId)
        //     ->whereNull('login_time')
        //     ->whereNull('logout_time')
        //     ->whereBetween('date', [$startDate, $endDate])
        //     // ->whereMonth('date',$month)
        //     // ->whereYear('date',$year)
        //     ->count();


        // $totalWorkingDays = $totalDays - $holiday;


        // $records = DB::table('login_logout')
        //     ->where('user_id', $userId)
        //     ->whereNotNull('login_time')
        //     ->whereBetween('date', [$startDate, $endDate])
        //     ->count();

        // $late_logins = DB::table('login_logout')
        //     ->where('user_id', $userId)
        //     ->whereNotNull('login_time')
        //     ->whereBetween('date', [$startDate, $endDate])
        //     ->whereTime('login_time', '>', '11:00:00')
        //     ->count();

        // $early_logouts = DB::table('login_logout')
        //     ->where('user_id', $userId)
        //     ->whereNotNull('logout_time')
        //     ->whereBetween('date', [$startDate, $endDate])
        //     ->whereTime('logout_time', '<', '5:30:00') // before 6 PM
        //     ->count();

        // $logs = DB::table('login_logout')
        //     ->where('user_id', $userId)
        //     ->whereBetween('date', [$startDate, $endDate])
        //     ->get();

        // Initialize counts
        $leave = 0;
        $records = 0;
        $late_logins = 0;
        $early_logouts = 0;

        // Loop through logs once and calculate everything
        foreach ($logs as $log) {
            if (is_null($log->login_time) && is_null($log->logout_time)) {
                $leave++;
            }

            if (!is_null($log->login_time)) {
                $records++;

                if (!is_null($log->login_time)) {
                    if (Carbon::parse($log->login_time)->gt(Carbon::createFromTime(11, 0))) {
                        $late_logins++;
                    }
                }

                if (!is_null($log->logout_time)) {
                    if (Carbon::parse($log->logout_time)->lt(Carbon::createFromTime(17, 30))) {
                        $early_logouts++;
                    }
                }
            }
        }

        // 3. Calculate total working days
        $totalWorkingDays = $totalDays - $holiday;


        return response()->json([
            'status' => true,
            'total_days' => $totalWorkingDays,
            'Holiday' => $holiday,
            'Total Working days' => $totalWorkingDays,
            'present' => $records,
            'leaves' => $leave,
            'late_logins' => $late_logins,
            'early_logouts' => $early_logouts
        ]);
    }
}