<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('stocks', 'condition')) {
            Schema::table('stocks', function (Blueprint $table) {
                $table->renameColumn('condition', 'condition_id');
            });
        }

        Schema::table('stocks', function (Blueprint $table) {
            $table->unsignedBigInteger('condition_id')->change();
        });

        Schema::table('stocks', function (Blueprint $table) {
            $table->foreign('condition_id')->references('id')->on('conditions');
        });

        if (Schema::hasColumn('stock_purchase_items', 'condition')) {
            Schema::table('stock_purchase_items', function (Blueprint $table) {
                $table->renameColumn('condition', 'condition_id');
            });
        }

        Schema::table('stock_purchase_items', function (Blueprint $table) {
            $table->unsignedBigInteger('condition_id')->change();
        });

        Schema::table('stock_purchase_items', function (Blueprint $table) {
            $table->foreign('condition_id')->references('id')->on('conditions');
        });
    }

    public function down(): void
    {
        Schema::table('stock_purchase_items', function (Blueprint $table) {
            $table->dropForeign(['condition_id']);
            $table->unsignedTinyInteger('condition_id')->change();
            $table->renameColumn('condition_id', 'condition');
        });

        Schema::table('stocks', function (Blueprint $table) {
            $table->dropForeign(['condition_id']);
            $table->unsignedTinyInteger('condition_id')->change();
            $table->renameColumn('condition_id', 'condition');
        });
    }
};
