<?php

use App\Enums\BooleanStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('title')->unique();
            $table->string('slug')->unique();
            $table->string('sku', 50)->unique();
            $table->text('description')->nullable();
            $table->string('brand', 150);
            $table->string('model', 150);
            $table->string('color', 100)->nullable();
            $table->string('storage_capacity', 150)->nullable();
            $table->string('ram', 100)->nullable();
            $table->unsignedTinyInteger('condition');
            $table->string('operating_system')->nullable();
            $table->text('photos')->nullable();
            $table->unsignedTinyInteger('is_active')->default(BooleanStatus::YES->value);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
