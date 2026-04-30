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
        Schema::table('sale_items', function (Blueprint $table) {
            $table->string('source_type', 10)->default('stock')->after('sale_price');
            $table->unsignedInteger('line_number')->default(1)->after('source_type');
            $table->foreignId('stock_purchase_id')->nullable()->after('line_number')
                ->constrained('stock_purchases')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropForeign(['stock_purchase_id']);
            $table->dropColumn(['source_type', 'line_number', 'stock_purchase_id']);
        });
    }
};
