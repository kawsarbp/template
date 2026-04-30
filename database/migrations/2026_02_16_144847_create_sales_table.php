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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('sale_number', 100);
            $table->foreignId('customer_id')->nullable()->constrained('customers');
            $table->unsignedTinyInteger('sale_type');
            $table->date('sale_date');
            $table->unsignedInteger('total_units')->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->nullable()->default(0);
            $table->decimal('total_paid', 10, 2)->default(0);
            $table->decimal('total_due', 10, 2)->default(0);
            $table->unsignedTinyInteger('payment_status')->default(3);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
