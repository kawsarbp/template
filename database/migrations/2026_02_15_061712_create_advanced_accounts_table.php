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
        Schema::create('advanced_accounts', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('customer_id');
            $table->string('voucher_number', 20);
            $table->date('date');
            $table->decimal('amount', 12, 2);
            $table->unsignedTinyInteger('type');
            $table->text('note')->nullable();
            $table->text('attachment')->nullable();
            $table->decimal('used_amount', 12, 2)->default(0);
            $table->unsignedTinyInteger('bank_account_id');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('advanced_accounts');
    }
};
