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
        Schema::create('stock_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->string('batch_number', 50);
            $table->unsignedInteger('total_units')->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->nullable()->default(0);
            $table->decimal('total_paid', 12, 2)->default(0);
            $table->decimal('total_due', 12, 2)->default(0);
            $table->unsignedTinyInteger('payment_status')->default(3);
            $table->date('purchase_date');
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
        Schema::dropIfExists('stock_purchases');
    }
};
