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
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_purchase_item_id')->constrained('stock_purchase_items')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products');
            $table->string('imei', 20)->nullable();
            $table->unsignedTinyInteger('condition');
            $table->decimal('purchase_price', 10, 2);
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->unsignedTinyInteger('status')->default(1);
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
        Schema::dropIfExists('stocks');
    }
};
