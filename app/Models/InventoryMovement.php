<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryMovement extends Model
{
    use HasFactory;

    // No SoftDeletes — movements are immutable audit records.

    protected $fillable = [
        'product_id',
        'user_id',
        'tipo',
        'quantidade',
        'estoque_antes',
        'estoque_depois',
        'motivo',
        'documento',
        'lote',
        'data_validade',
        'preco_unitario',
        'storage_location_id',
    ];

    protected $casts = [
        'data_validade'  => 'date',
        'preco_unitario' => 'decimal:2',
    ];

    // ─── Relationships ───────────────────────────────────────

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function storageLocation(): BelongsTo
    {
        return $this->belongsTo(StorageLocation::class);
    }

    // ─── Scopes ──────────────────────────────────────────────

    public function scopeEntradas($query)
    {
        return $query->where('tipo', 'entrada');
    }

    public function scopeSaidas($query)
    {
        return $query->where('tipo', 'saida');
    }

    public function scopePeriodo($query, $inicio, $fim)
    {
        return $query->whereBetween('created_at', [$inicio, $fim]);
    }
}
