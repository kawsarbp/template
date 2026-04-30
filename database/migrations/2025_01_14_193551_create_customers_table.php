<?php

use App\Enums\VisibilityStatus;
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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('customer_id');
            $table->string('name', 200);
            $table->string('email', 200);
            $table->string('phone', 20)->nullable();
            $table->string('company_name', 200)->nullable();
            $table->text('address')->nullable();
            $table->string('country', 150)->nullable();
            $table->string('state', 150)->nullable();
            $table->string('city', 150)->nullable();
            $table->decimal('advance_payment_balance', 12, 2)->nullable();
            $table->tinyInteger('status')->nullable()->default(VisibilityStatus::ACTIVE->value);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
