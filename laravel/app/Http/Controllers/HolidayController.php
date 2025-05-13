<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Holiday;
use Carbon\Carbon;


class HolidayController extends Controller
{
    // Store a new holiday
    public function addHoliday(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }
        if ($user->role === "Admin") {

            // Validate input data
            $request->validate([
                'name' => 'required|string|max:255',
                'date' => 'required|date',
            ]);

            $existingHoliday = Holiday::where('date', $request->date)->first();

            if ($existingHoliday) {
                return response()->json([
                    'message' => 'Holiday on this date already exists.',
                ], 409); // 409 Conflict
            }

            // Create a new holiday record
            $holiday = new Holiday;
            $holiday->title = $request->name;
            $holiday->date = $request->date;
            $holiday->save();

            return response()->json([
                'status' => 'true',
                'message' => 'Holiday saved successfully',
                'holiday' => $holiday
            ], 201);
        }
    }
    public function upcomingHolidays(Request $request)
    {
        $currentDate = Carbon::now();

        // Fetch holidays that are after the current date
        $holidays = Holiday::where('date', '>', $currentDate)
            ->orderBy('date', 'asc') // Order by date (ascending)
            ->get();

        return response()->json([
            'status' => true,
            'holidays' => $holidays,
        ]);
    }

}

