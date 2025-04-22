<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // Auto-increment primary key
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password')->nullable(); // Nullable for Google login
            $table->string('employee_id')->unique(); // Employee ID
            $table->string('avatar')->nullable(); // Profile image
            $table->enum('role', ['Admin', 'Employee'])->default('Employee'); // Role
            $table->string('google_id')->nullable()->unique(); // Google OAuth ID
            $table->string('phone_number')->nullable()->unique(); // Optional phone
            $table->date('date_of_birth')->nullable(); // Date of Birth
            $table->rememberToken(); // remember_token field
            $table->integer('token_version')->default(1); // For logout from all devices
            $table->timestamp('last_login_at')->nullable(); // Track last login
            $table->timestamps(); // created_at & updated_at
        });
        
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
