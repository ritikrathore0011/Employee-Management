<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'google_id',
        'avatar',
        'last_login_at',
        'date_of_birth',
        'phone_number',
        'password',
        'address',
        'department',
        'designation',
        'date_of_joining',
        'emergency_contact_phone',
        'bank_name',
        'account_number',
        'ifsc_code',
        'resume_path',
        'id_proof_path',
        'contract_path',
        'status'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    //     protected static function boot()
// {
//     parent::boot();

    //     static::creating(function ($user) {
//         $lastUser = self::whereNotNull('employee_id')
//             ->orderByDesc('id')
//             ->first();

    //         $lastNumber = 100;

    //         if ($lastUser && preg_match('/NEXT(\d+)/', $lastUser->employee_id, $matches)) {
//             $lastNumber = (int)$matches[1];
//         }

    //         $user->employee_id = 'NEXT' . ($lastNumber + 1);
//     });
// }
protected static function boot()
{
    parent::boot();

    static::creating(function ($user) {
        // Explicitly include soft-deleted records
        $max = self::withTrashed()
            ->where('employee_id', 'like', 'NEXT%')
            ->selectRaw("MAX(CAST(SUBSTRING(employee_id, 5) AS UNSIGNED)) as max_id")
            ->value('max_id');

        $nextNumber = $max ? (int) $max + 1 : 101;

        $user->employee_id = 'NEXT' . $nextNumber;
    });
}



    public function leaves()
    {
        return $this->hasMany(Leave::class);
    }



}
