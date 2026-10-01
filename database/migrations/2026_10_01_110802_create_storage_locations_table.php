<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('storage_locations', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->string('codigo', 30)->unique();
            $table->string('descricao')->nullable();
            $table->enum('tipo', ['galpao', 'prateleira', 'armario', 'sala', 'externo'])->default('prateleira');
            $table->boolean('ativo')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('storage_locations');
    }
};
