<?php
namespace App\Services;

use Google_Client;
use Google_Service_Sheets;

class GoogleSheetsService
{
    protected $client;
    protected $sheetService;

    public function __construct()
    {
        // Set up Google API client
        $this->client = new Google_Client();
        $this->client->setAuthConfig(storage_path('app/google-credentials.json')); // Path to your credentials file
        $this->client->addScope(Google_Service_Sheets::SPREADSHEETS);
        $this->client->setAccessType('offline');
        $this->client->setPrompt('select_account consent');
        $this->sheetService = new Google_Service_Sheets($this->client);
    }

    public function getSheetData($spreadsheetId, $range)
    {
        return $this->sheetService->spreadsheets_values->get($spreadsheetId, $range);
    }

    public function updateSheetData($spreadsheetId, $range, $values)
    {
        $body = new \Google_Service_Sheets_ValueRange([
            'values' => $values
        ]);
        $params = ['valueInputOption' => 'RAW'];
        return $this->sheetService->spreadsheets_values->update($spreadsheetId, $range, $body, $params);
    }

    public function appendToSheet($spreadsheetId, $range, $values)
    {
        $body = new \Google_Service_Sheets_ValueRange([
            'values' => $values
        ]);
        $params = ['valueInputOption' => 'RAW'];
        return $this->sheetService->spreadsheets_values->append($spreadsheetId, $range, $body, $params);
    }
}
