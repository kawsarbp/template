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
            $table->unsignedBigInteger('brand_id')->nullable()->after('brand');
        });

        // Migrate existing brand text data to brand records
        $brands = DB::table('products')
            ->whereNotNull('brand')
            ->where('brand', '!=', '')
            ->distinct()
            ->pluck('brand');

        foreach ($brands as $brandName) {
            $brandId = DB::table('brands')->insertGetId([
                'name' => $brandName,
                'status' => VisibilityStatus::ACTIVE->value,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('products')
                ->where('brand', $brandName)
                ->update(['brand_id' => $brandId]);
        }

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('brand');
            $table->foreign('brand_id')->references('id')->on('brands');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['brand_id']);
            $table->string('brand', 100)->nullable()->after('description');
        });

        // Migrate brand_id back to brand text
        $products = DB::table('products')
            ->whereNotNull('brand_id')
            ->get(['id', 'brand_id']);

        foreach ($products as $product) {
            $brandName = DB::table('brands')->where('id', $product->brand_id)->value('name');
            if ($brandName) {
                DB::table('products')->where('id', $product->id)->update(['brand' => $brandName]);
            }
        }

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('brand_id');
        });
    }
};
