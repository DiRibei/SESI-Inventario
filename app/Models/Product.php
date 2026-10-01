<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nome',
        'codigo',
        'codigo_barras',
        'descricao',
        'unidade_medida',
        'preco_custo',
        'preco_venda',
        'estoque_atual',
        'estoque_minimo',
        'estoque_maximo',
        'imagem',
        'ativo',
        'category_id',
        'supplier_id',
        'storage_location_id',
    ];

    protected $casts = [
        'preco_custo' => 'decimal:2',
        'preco_venda' => 'decimal:2',
        'ativo'       => 'boolean',
    ];

    // ─── Business Logic ──────────────────────────────────────

    /**
     * Returns true when stock is at or below the minimum threshold.
     */
    public function isEstoqueCritico(): bool
    {
        return $this->estoque_atual <= $this->estoque_minimo;
    }

    /**
     * Returns true when the product has sufficient stock for the requested quantity.
     */
    public function hasSufficientStock(int $quantidade): bool
    {
        return $this->estoque_atual >= $quantidade;
    }

    // ─── Relationships ───────────────────────────────────────

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function storageLocation(): BelongsTo
    {
        return $this->belongsTo(StorageLocation::class);
    }

    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }

    // ─── Scopes ──────────────────────────────────────────────

    public function scopeAtivo($query)
    {
        return $query->where('ativo', true);
    }

    /**
     * Scope that returns products where estoque_atual <= estoque_minimo.
     */
    public function scopeEstoqueCritico($query)
    {
        return $query->whereColumn('estoque_atual', '<=', 'estoque_minimo');
    }
}
