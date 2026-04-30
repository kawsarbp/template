<?php

use App\Enums\VisibilityStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('color_id')->nullable()->after('color');
        });

        // Migrate existing color text data to color records
        $colors = DB::table('products')
            ->whereNotNull('color')
            ->where('color', '!=', '')
            ->distinct()
            ->pluck('color');

        foreach ($colors as $colorName) {
            $colorId = DB::table('colors')->insertGetId([
                'name' => $colorName,
                'status' => VisibilityStatus::ACTIVE->value,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('products')
                ->where('color', $colorName)
                ->update(['color_id' => $colorId]);
        }

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('color');
            $table->foreign('color_id')->references('id')->on('colors');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['color_id']);
            $table->string('color', 100)->nullable()->after('description');
        });

        // Migrate color_id back to color text
        $products = DB::table('products')
            ->whereNotNull('color_id')
            ->get(['id', 'color_id']);

        foreach ($products as $product) {
            $colorName = DB::table('colors')->where('id', $product->color_id)->value('name');
            if ($colorName) {
                DB::table('products')->where('id', $product->id)->update(['color' => $colorName]);
            }
        }

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('color_id');
        });
    }
};
