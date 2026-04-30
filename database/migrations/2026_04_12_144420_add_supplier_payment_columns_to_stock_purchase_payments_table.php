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
        Schema::table('stock_purchase_payments', function (Blueprint $table) {
            $table->foreignId('stock_purchase_id')->nullable()->change();
            $table->boolean('is_bulk_payment')->default(false)->after('paid_to');
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete()->after('is_bulk_payment');
            $table->foreignId('parent_id')->nullable()->after('supplier_id');
            $table->foreign('parent_id')->references('id')->on('stock_purchase_payments')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_purchase_payments', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropForeign(['supplier_id']);
            $table->dropColumn(['is_bulk_payment', 'supplier_id', 'parent_id']);
            $table->foreignId('stock_purchase_id')->nullable(false)->change();
        });
    }
};
