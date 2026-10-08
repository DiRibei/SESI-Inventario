<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\InventoryMovement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryMovementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $operador;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role'  => 'admin',
            'ativo' => true,
        ]);

        $this->operador = User::factory()->create([
            'role'  => 'operador',
            'ativo' => true,
        ]);

        $category = Category::create([
            'nome'  => 'Test Category ' . uniqid(),
            'cor'   => '#0081fc',
            'ativo' => true,
        ]);

        $this->product = Product::create([
            'nome'           => 'Produto Teste ' . uniqid(),
            'codigo'         => 'TEST-' . rand(1000, 9999),
            'unidade_medida' => 'UN',
            'preco_custo'    => 50.00,
            'estoque_atual'  => 10,
            'estoque_minimo' => 5,
            'category_id'    => $category->id,
            'ativo'          => true,
        ]);
    }

    public function test_operador_can_view_dashboard(): void
    {
        $response = $this->actingAs($this->operador)->get('/dashboard');
        $response->assertStatus(200);
    }

    public function test_operador_can_view_products_catalog(): void
    {
        $response = $this->actingAs($this->operador)->get('/products');
        $response->assertStatus(200);
    }

    public function test_operador_cannot_access_product_creation(): void
    {
        $response = $this->actingAs($this->operador)->get('/products/create');
        $response->assertStatus(403);
    }

    public function test_admin_can_access_product_creation(): void
    {
        $response = $this->actingAs($this->admin)->get('/products/create');
        $response->assertStatus(200);
    }

    public function test_entrada_increases_product_stock_atomically(): void
    {
        $initialStock = $this->product->estoque_atual;

        $response = $this->actingAs($this->operador)->post('/inventory-movements', [
            'product_id' => $this->product->id,
            'tipo'       => 'entrada',
            'quantidade' => 5,
            'motivo'     => 'Reposição Teste',
            'documento'  => 'NF-TEST-01',
        ]);

        $response->assertRedirect('/inventory-movements');

        $this->product->refresh();
        $this->assertEquals($initialStock + 5, $this->product->estoque_atual);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $this->product->id,
            'tipo'       => 'entrada',
            'quantidade' => 5,
            'user_id'    => $this->operador->id,
        ]);
    }

    public function test_saida_decreases_product_stock_atomically(): void
    {
        $initialStock = $this->product->estoque_atual;

        $response = $this->actingAs($this->operador)->post('/inventory-movements', [
            'product_id' => $this->product->id,
            'tipo'       => 'saida',
            'quantidade' => 3,
            'motivo'     => 'Requisição para oficina',
        ]);

        $response->assertRedirect('/inventory-movements');

        $this->product->refresh();
        $this->assertEquals($initialStock - 3, $this->product->estoque_atual);
    }

    public function test_saida_cannot_exceed_available_stock_preventing_negative_inventory(): void
    {
        $initialStock = $this->product->estoque_atual;

        $response = $this->actingAs($this->operador)->post('/inventory-movements', [
            'product_id' => $this->product->id,
            'tipo'       => 'saida',
            'quantidade' => $initialStock + 99,
            'motivo'     => 'Tentativa de retirada ilegal',
        ]);

        $response->assertSessionHasErrors('quantidade');

        $this->product->refresh();
        $this->assertEquals($initialStock, $this->product->estoque_atual);
    }

    public function test_reports_page_and_csv_export_work(): void
    {
        $response = $this->actingAs($this->operador)->get('/reports');
        $response->assertStatus(200);

        $csvResponse = $this->actingAs($this->operador)->get('/reports/export-csv');
        $csvResponse->assertStatus(200);
        $this->assertStringContainsString('text/csv', $csvResponse->headers->get('Content-Type'));
    }

    public function test_in_app_manual_loads_successfully(): void
    {
        $response = $this->actingAs($this->operador)->get('/manual');
        $response->assertStatus(200);
    }

    public function test_ajuste_reducao_cannot_exceed_available_stock_preventing_negative_inventory(): void
    {
        $initialStock = $this->product->estoque_atual;

        $response = $this->actingAs($this->operador)->post('/inventory-movements', [
            'product_id'   => $this->product->id,
            'tipo'         => 'ajuste',
            'ajuste_tipo'  => 'reducao',
            'quantidade'   => $initialStock + 50,
            'motivo'       => 'Tentativa de ajuste negativo excessivo',
        ]);

        $response->assertSessionHasErrors('quantidade');

        $this->product->refresh();
        $this->assertEquals($initialStock, $this->product->estoque_atual);
    }

    public function test_low_stock_badge_triggers_when_stock_is_at_or_below_minimum(): void
    {
        // When stock > min: not critical
        $this->product->update(['estoque_atual' => 10, 'estoque_minimo' => 5]);
        $this->assertFalse($this->product->isEstoqueCritico());

        // When stock == min: critical
        $this->product->update(['estoque_atual' => 5, 'estoque_minimo' => 5]);
        $this->assertTrue($this->product->isEstoqueCritico());

        // When stock < min: critical
        $this->product->update(['estoque_atual' => 2, 'estoque_minimo' => 5]);
        $this->assertTrue($this->product->isEstoqueCritico());
    }

    public function test_user_with_movements_is_deactivated_instead_of_deleted_to_preserve_audit(): void
    {
        // Operator records a movement
        InventoryMovement::create([
            'product_id'     => $this->product->id,
            'user_id'        => $this->operador->id,
            'tipo'           => 'entrada',
            'quantidade'     => 1,
            'estoque_antes'  => 10,
            'estoque_depois' => 11,
        ]);

        $response = $this->actingAs($this->admin)->delete("/users/{$this->operador->id}");

        $response->assertRedirect('/users');
        $response->assertSessionHas('warning');

        // Operator should not be hard-deleted, but deactivated (ativo = false)
        $this->assertDatabaseHas('users', [
            'id'    => $this->operador->id,
            'ativo' => false,
        ]);
    }
}
