<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 200);
            $table->string('codigo', 50)->unique();
            $table->string('codigo_barras', 50)->nullable()->unique();
            $table->text('descricao')->nullable();
            $table->string('unidade_medida', 20)->default('un');
            $table->decimal('preco_custo', 12, 2)->default(0.00);
            $table->decimal('preco_venda', 12, 2)->nullable();
            $table->integer('estoque_atual')->default(0);
            $table->integer('estoque_minimo')->default(5);
            $table->integer('estoque_maximo')->nullable();
            $table->string('imagem')->nullable();
            $table->boolean('ativo')->default(true);
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->foreignId('storage_location_id')->nullable()->constrained('storage_locations')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
