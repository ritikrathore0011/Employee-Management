<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginLogout extends Model
{
    use HasFactory;

    // Specify the table name (optional if it follows Laravel's naming convention)
    protected $table = 'login_logout';

    // Define which columns are mass assignable
    protected $fillable = ['user_id', 'login_time', 'logout_time', 'date','note'];

    // If the timestamps column (created_at, updated_at) are not needed, set this to false
    public $timestamps = true;

    // Define the relationship with the User model
    public function user()
    {
        return $this->belongsTo(User::class); // A login/logout time belongs to a user
    }
}