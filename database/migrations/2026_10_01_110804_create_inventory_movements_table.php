<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->enum('tipo', ['entrada', 'saida', 'ajuste', 'transferencia']);
            $table->integer('quantidade');
            $table->integer('estoque_antes');
            $table->integer('estoque_depois');
            $table->string('motivo', 255)->nullable();
            $table->string('documento', 100)->nullable();
            $table->string('lote', 50)->nullable();
            $table->date('data_validade')->nullable();
            $table->decimal('preco_unitario', 12, 2)->nullable();
            $table->foreignId('storage_location_id')->nullable()->constrained('storage_locations')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
    }
};
