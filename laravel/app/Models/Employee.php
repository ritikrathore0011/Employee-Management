<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
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
        'status',
    ];

    protected $dates = ['date_of_joining', 'deleted_at'];
    protected $hidden = ['id', 'user_id', 'created_at', 'updated_at'];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
