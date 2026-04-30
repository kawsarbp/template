<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('condition', 'condition_id');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('condition_id')->nullable()->change();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreign('condition_id')->references('id')->on('conditions');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['condition_id']);
            $table->unsignedTinyInteger('condition_id')->nullable()->change();
            $table->renameColumn('condition_id', 'condition');
        });
    }
};
