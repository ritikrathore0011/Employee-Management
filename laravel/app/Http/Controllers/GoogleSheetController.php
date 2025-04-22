<?php

namespace App\Http\Controllers;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Sheets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GoogleSheetController extends Controller
{
    //     public function createSheet(Request $request)
//     {
//         // Step 1: Set up the Google Client
//         $client = new Client();
//         $client->setClientId(env('GOOGLE_CLIENT_ID')); // Add your client ID
//         $client->setClientSecret(env('GOOGLE_CLIENT_SECRET')); // Add your client secret
//         $client->setRedirectUri(env('GOOGLE_REDIRECT_URI')); // Add your redirect URI
//         $client->addScope(Sheets::SPREADSHEETS); // Request the Sheets API scope
//         $client->setAccessType('offline'); // Required to get refresh token
//         $spreadsheetTitle = $request->input('title');

    //         // Step 2: Authenticate using the access token sent from frontend

    //         $authHeader = $request->header('Authorization');

    //         if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
//             $accessToken = str_replace('Bearer ', '', $authHeader);
//             $client->setAccessToken($accessToken);
//         } else {
//             return response()->json(['error' => 'Access token missing'], 400);
//         }


    //         ///####
// // Google Drive API service
//         $driveService = new Drive($client);

    //         // Search for a file with the same title (spreadsheet) in Google Drive
//         $files = $driveService->files->listFiles([
//             'q' => "name = '{$spreadsheetTitle}' and mimeType = 'application/vnd.google-apps.spreadsheet'",
//             'fields' => 'files(id, name)',
//         ]);

    //         if (count($files->getFiles()) > 0) {
//             // If the sheet already exists, return the URL of the existing sheet
//             $existingFile = $files->getFiles()[0];
//             return response()->json(['message' => 'Sheet already exists', 'url' => 'https://docs.google.com/spreadsheets/d/' . $existingFile->getId()]);
//         }



    //         // Step 3: Create a new Google Sheet
//         try {

    //             $service = new Sheets($client);
//             $spreadsheet = new \Google_Service_Sheets_Spreadsheet([
//                 'properties' => [
//                     'title' => $request->input('title', 'New Spreadsheet') // Default title
//                 ]
//             ]);

    //             // Step 4: Make the API request to create the sheet
//             $response = $service->spreadsheets->create($spreadsheet);
//             $spreadsheetId = $response->spreadsheetId;

    //             $url = 'https://docs.google.com/spreadsheets/d/' . $spreadsheetId;

    //             return response()->json(['url' => $url]);
//         } catch (\Exception $e) {
//             Log::error('Error creating Google Sheet: ' . $e->getMessage());
//             return response()->json(['error' => 'Failed to create Google Sheet'], 500);
//         }
//     }




    public function createSheet(Request $request)
    {
        $client = new Client();
        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $client->setRedirectUri(env('GOOGLE_REDIRECT_URI'));
        $client->addScope(Sheets::SPREADSHEETS);
        $client->setAccessType('offline');

        $spreadsheetTitle = $request->input('title'); // Title of existing spreadsheet
        $newSheetName = $request->input('new_sheet_name', 'Fourth'); // New tab name

        $authHeader = $request->header('Authorization');
        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            $accessToken = str_replace('Bearer ', '', $authHeader);
            $client->setAccessToken($accessToken);
        } else {
            return response()->json(['error' => 'Access token missing'], 400);
        }

        $driveService = new Drive($client);

        // Find the existing spreadsheet by title
        $files = $driveService->files->listFiles([
            'q' => "name = '{$spreadsheetTitle}' and mimeType = 'application/vnd.google-apps.spreadsheet'",
            'fields' => 'files(id, name)',
        ]);

        if (count($files->getFiles()) === 0) {
            return response()->json(['error' => 'Spreadsheet not found'], 404);
        }

        $spreadsheetId = $files->getFiles()[0]->getId();

        $service = new Sheets($client);

        // Add the new sheet
        $addSheetRequest = new \Google_Service_Sheets_BatchUpdateSpreadsheetRequest([
            'requests' => [
                [
                    'addSheet' => [
                        'properties' => [
                            'title' => $newSheetName
                        ]
                    ]
                ]
            ]
        ]);

        try {
            $service->spreadsheets->batchUpdate($spreadsheetId, $addSheetRequest);

            return response()->json([
                'message' => "Sheet '{$newSheetName}' added successfully.",
                'url' => 'https://docs.google.com/spreadsheets/d/' . $spreadsheetId
            ]);
        } catch (\Exception $e) {
            Log::error('Error adding sheet to spreadsheet: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to add new sheet'], 500);
        }
    }


}
