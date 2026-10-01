<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\StorageLocation;
use App\Models\Product;
use App\Models\InventoryMovement;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. USERS ──────────────────────────────────────────────────────────
        $admin = User::create([
            'name'     => 'Administrador SENAI',
            'email'    => 'admin@senai.br',
            'password' => Hash::make('admin123'),
            'role'     => 'admin',
            'phone'    => '(11) 3321-5000',
            'ativo'    => true,
        ]);

        $op1 = User::create([
            'name'     => 'Carlos Oliveira',
            'email'    => 'carlos.oliveira@senai.br',
            'password' => Hash::make('operador123'),
            'role'     => 'operador',
            'phone'    => '(11) 3321-5010',
            'ativo'    => true,
        ]);

        $op2 = User::create([
            'name'     => 'Fernanda Lima',
            'email'    => 'fernanda.lima@senai.br',
            'password' => Hash::make('operador123'),
            'role'     => 'operador',
            'phone'    => '(11) 3321-5011',
            'ativo'    => true,
        ]);

        // ── 2. CATEGORIES ─────────────────────────────────────────────────────
        $catEletrica   = Category::create(['nome' => 'Elétrica e Eletrônica',     'descricao' => 'Componentes elétricos, cabos, tomadas, relés e equipamentos eletrônicos.', 'cor' => '#f59e0b']);
        $catMecanica   = Category::create(['nome' => 'Mecânica e Ferramentas',     'descricao' => 'Ferramentas manuais, pneumáticas e peças mecânicas em geral.',              'cor' => '#6366f1']);
        $catEPI        = Category::create(['nome' => 'EPI e Segurança',            'descricao' => 'Equipamentos de proteção individual e coletiva.',                            'cor' => '#ef4444']);
        $catInformatica = Category::create(['nome' => 'Informática e Periféricos', 'descricao' => 'Computadores, periféricos, cabos e acessórios de informática.',             'cor' => '#0081fc']);
        $catLimpeza    = Category::create(['nome' => 'Limpeza e Higiene',          'descricao' => 'Produtos de limpeza, descartáveis e materiais de higienização.',             'cor' => '#10b981']);
        $catEscritorio = Category::create(['nome' => 'Papelaria e Escritório',     'descricao' => 'Material de escritório, papelaria, cartuchos e impressão.',                 'cor' => '#8b5cf6']);

        // ── 3. SUPPLIERS ──────────────────────────────────────────────────────
        $sup1 = Supplier::create([
            'nome'     => 'Distribuidora Elétrica São Paulo Ltda.',
            'cnpj'     => '12.345.678/0001-90',
            'email'    => 'vendas@desao.com.br',
            'telefone' => '(11) 3333-4444',
            'contato'  => 'Roberto Mendes',
            'endereco' => 'Rua das Indústrias, 450 - Santo André/SP',
        ]);

        $sup2 = Supplier::create([
            'nome'     => 'Ferramentas e Máquinas Brasil S.A.',
            'cnpj'     => '98.765.432/0001-11',
            'email'    => 'pedidos@fmb.ind.br',
            'telefone' => '(11) 4567-8900',
            'contato'  => 'Ana Cristina',
            'endereco' => 'Av. Industrial, 1200 - São Bernardo do Campo/SP',
        ]);

        $sup3 = Supplier::create([
            'nome'     => 'EPI Segurança do Trabalho',
            'cnpj'     => '55.444.333/0001-22',
            'email'    => 'comercial@episeg.com.br',
            'telefone' => '(11) 2222-9999',
            'contato'  => 'Marcos Ferreira',
            'endereco' => 'Rua da Proteção, 88 - Osasco/SP',
        ]);

        $sup4 = Supplier::create([
            'nome'     => 'TechBrasil Informática',
            'cnpj'     => '33.222.111/0001-44',
            'email'    => 'compras@techbrasil.com.br',
            'telefone' => '(11) 5555-0000',
            'contato'  => 'Juliana Souza',
            'endereco' => 'Av. Paulista, 1578, cj 308 - São Paulo/SP',
        ]);

        // ── 4. STORAGE LOCATIONS ──────────────────────────────────────────────
        $locA1 = StorageLocation::create(['nome' => 'Galpão A - Prateleira 01', 'codigo' => 'GA-PR-01', 'tipo' => 'prateleira', 'descricao' => 'Prateleira de componentes elétricos']);
        $locA2 = StorageLocation::create(['nome' => 'Galpão A - Prateleira 02', 'codigo' => 'GA-PR-02', 'tipo' => 'prateleira', 'descricao' => 'Prateleira de ferramentas manuais']);
        $locB1 = StorageLocation::create(['nome' => 'Galpão B - Armário 01',   'codigo' => 'GB-AR-01', 'tipo' => 'armario',   'descricao' => 'Armário de EPIs']);
        $locB2 = StorageLocation::create(['nome' => 'Galpão B - Prateleira 01', 'codigo' => 'GB-PR-01', 'tipo' => 'prateleira', 'descricao' => 'Prateleira de informática']);
        $locC1 = StorageLocation::create(['nome' => 'Sala de Suprimentos',      'codigo' => 'SS-01',    'tipo' => 'sala',       'descricao' => 'Sala para itens de limpeza e escritório']);
        $locExt = StorageLocation::create(['nome' => 'Depósito Externo',         'codigo' => 'DEP-EXT',  'tipo' => 'externo',    'descricao' => 'Depósito externo para grandes volumes']);

        // ── 5. PRODUCTS ───────────────────────────────────────────────────────
        $products = [
            // Elétrica
            [
                'nome' => 'Cabo Elétrico Flexível 2,5mm² (rolo 100m)',
                'codigo' => 'ELE-001', 'codigo_barras' => '7891234560001',
                'unidade_medida' => 'rl', 'preco_custo' => 185.00, 'preco_venda' => 240.00,
                'estoque_atual' => 12, 'estoque_minimo' => 5, 'estoque_maximo' => 30,
                'descricao' => 'Cabo flexível 2,5mm², 750V, cores variadas.',
                'category_id' => $catEletrica->id, 'supplier_id' => $sup1->id,
                'storage_location_id' => $locA1->id,
            ],
            [
                'nome' => 'Disjuntor DIN 20A Monofásico',
                'codigo' => 'ELE-002', 'codigo_barras' => '7891234560002',
                'unidade_medida' => 'un', 'preco_custo' => 18.50, 'preco_venda' => 28.00,
                'estoque_atual' => 3, 'estoque_minimo' => 10, 'estoque_maximo' => 50,
                'descricao' => 'Disjuntor termomagético DIN 20A, curva C.',
                'category_id' => $catEletrica->id, 'supplier_id' => $sup1->id,
                'storage_location_id' => $locA1->id,
            ],
            [
                'nome' => 'Tomada 2P+T 10A NBR14136',
                'codigo' => 'ELE-003', 'codigo_barras' => '7891234560003',
                'unidade_medida' => 'un', 'preco_custo' => 8.20, 'preco_venda' => 14.50,
                'estoque_atual' => 45, 'estoque_minimo' => 20, 'estoque_maximo' => 100,
                'descricao' => 'Tomada padrão brasileiro 10A, branca.',
                'category_id' => $catEletrica->id, 'supplier_id' => $sup1->id,
                'storage_location_id' => $locA1->id,
            ],
            [
                'nome' => 'Multímetro Digital True RMS',
                'codigo' => 'ELE-004', 'codigo_barras' => '7891234560004',
                'unidade_medida' => 'un', 'preco_custo' => 220.00, 'preco_venda' => 320.00,
                'estoque_atual' => 6, 'estoque_minimo' => 3, 'estoque_maximo' => 15,
                'descricao' => 'Multímetro digital True RMS com 4000 pontos.',
                'category_id' => $catEletrica->id, 'supplier_id' => $sup1->id,
                'storage_location_id' => $locA1->id,
            ],

            // Mecânica
            [
                'nome' => 'Chave de Fenda Philips 1/4" × 6"',
                'codigo' => 'MEC-001', 'codigo_barras' => '7891234560010',
                'unidade_medida' => 'un', 'preco_custo' => 12.00, 'preco_venda' => 18.00,
                'estoque_atual' => 20, 'estoque_minimo' => 10, 'estoque_maximo' => 50,
                'descricao' => 'Chave de fenda Philips com cabo ergonômico.',
                'category_id' => $catMecanica->id, 'supplier_id' => $sup2->id,
                'storage_location_id' => $locA2->id,
            ],
            [
                'nome' => 'Alicate Universal 8" Aço Cromo-Vanádio',
                'codigo' => 'MEC-002', 'codigo_barras' => '7891234560011',
                'unidade_medida' => 'un', 'preco_custo' => 35.00, 'preco_venda' => 55.00,
                'estoque_atual' => 8, 'estoque_minimo' => 5, 'estoque_maximo' => 20,
                'descricao' => 'Alicate universal aço cromo-vanádio, isolamento 1000V.',
                'category_id' => $catMecanica->id, 'supplier_id' => $sup2->id,
                'storage_location_id' => $locA2->id,
            ],
            [
                'nome' => 'Furadeira de Impacto 750W 3/8"',
                'codigo' => 'MEC-003', 'codigo_barras' => '7891234560012',
                'unidade_medida' => 'un', 'preco_custo' => 380.00, 'preco_venda' => 520.00,
                'estoque_atual' => 2, 'estoque_minimo' => 2, 'estoque_maximo' => 8,
                'descricao' => 'Furadeira de impacto 750W, chuck 3/8", reversível.',
                'category_id' => $catMecanica->id, 'supplier_id' => $sup2->id,
                'storage_location_id' => $locExt->id,
            ],

            // EPI
            [
                'nome' => 'Capacete de Segurança Classe B Amarelo',
                'codigo' => 'EPI-001', 'codigo_barras' => '7891234560020',
                'unidade_medida' => 'un', 'preco_custo' => 22.00, 'preco_venda' => 38.00,
                'estoque_atual' => 4, 'estoque_minimo' => 15, 'estoque_maximo' => 60,
                'descricao' => 'Capacete classe B, resistente a choque elétrico.',
                'category_id' => $catEPI->id, 'supplier_id' => $sup3->id,
                'storage_location_id' => $locB1->id,
            ],
            [
                'nome' => 'Luva de Borracha Elétrica 10kV (par)',
                'codigo' => 'EPI-002', 'codigo_barras' => '7891234560021',
                'unidade_medida' => 'pr', 'preco_custo' => 95.00, 'preco_venda' => 145.00,
                'estoque_atual' => 6, 'estoque_minimo' => 5, 'estoque_maximo' => 25,
                'descricao' => 'Luva de borracha isolante classe 1 (10kV), par.',
                'category_id' => $catEPI->id, 'supplier_id' => $sup3->id,
                'storage_location_id' => $locB1->id,
            ],
            [
                'nome' => 'Óculos de Proteção Incolor Anti-risco',
                'codigo' => 'EPI-003', 'codigo_barras' => '7891234560022',
                'unidade_medida' => 'un', 'preco_custo' => 9.50, 'preco_venda' => 16.00,
                'estoque_atual' => 30, 'estoque_minimo' => 20, 'estoque_maximo' => 100,
                'descricao' => 'Óculos de proteção incolor com lente anti-risco.',
                'category_id' => $catEPI->id, 'supplier_id' => $sup3->id,
                'storage_location_id' => $locB1->id,
            ],

            // Informática
            [
                'nome' => 'Mouse USB Óptico 1200 DPI',
                'codigo' => 'INFO-001', 'codigo_barras' => '7891234560030',
                'unidade_medida' => 'un', 'preco_custo' => 25.00, 'preco_venda' => 45.00,
                'estoque_atual' => 15, 'estoque_minimo' => 8, 'estoque_maximo' => 40,
                'descricao' => 'Mouse USB óptico, 1200 DPI, compatível com Windows/Linux.',
                'category_id' => $catInformatica->id, 'supplier_id' => $sup4->id,
                'storage_location_id' => $locB2->id,
            ],
            [
                'nome' => 'Teclado USB ABNT2 Padrão',
                'codigo' => 'INFO-002', 'codigo_barras' => '7891234560031',
                'unidade_medida' => 'un', 'preco_custo' => 40.00, 'preco_venda' => 65.00,
                'estoque_atual' => 10, 'estoque_minimo' => 5, 'estoque_maximo' => 30,
                'descricao' => 'Teclado USB ABNT2, tecla Windows, Multimedia.',
                'category_id' => $catInformatica->id, 'supplier_id' => $sup4->id,
                'storage_location_id' => $locB2->id,
            ],
            [
                'nome' => 'Cabo de Rede UTP Cat6 (rolo 305m)',
                'codigo' => 'INFO-003', 'codigo_barras' => '7891234560032',
                'unidade_medida' => 'rl', 'preco_custo' => 310.00, 'preco_venda' => 450.00,
                'estoque_atual' => 3, 'estoque_minimo' => 2, 'estoque_maximo' => 10,
                'descricao' => 'Cabo UTP Cat6 4 pares, 305m, 100% cobre.',
                'category_id' => $catInformatica->id, 'supplier_id' => $sup4->id,
                'storage_location_id' => $locB2->id,
            ],

            // Limpeza
            [
                'nome' => 'Detergente Neutro 5L',
                'codigo' => 'LMP-001', 'codigo_barras' => '7891234560040',
                'unidade_medida' => 'lt', 'preco_custo' => 18.00, 'preco_venda' => 28.00,
                'estoque_atual' => 20, 'estoque_minimo' => 10, 'estoque_maximo' => 60,
                'descricao' => 'Detergente neutro concentrado 5 litros.',
                'category_id' => $catLimpeza->id,
                'storage_location_id' => $locC1->id,
            ],
            [
                'nome' => 'Álcool 70° INPM Gel 500ml',
                'codigo' => 'LMP-002', 'codigo_barras' => '7891234560041',
                'unidade_medida' => 'un', 'preco_custo' => 8.50, 'preco_venda' => 14.00,
                'estoque_atual' => 2, 'estoque_minimo' => 15, 'estoque_maximo' => 80,
                'descricao' => 'Álcool gel 70° INPM, frasco 500ml.',
                'category_id' => $catLimpeza->id,
                'storage_location_id' => $locC1->id,
            ],

            // Escritório
            [
                'nome' => 'Resma de Papel A4 75g/m² (500 folhas)',
                'codigo' => 'ESC-001', 'codigo_barras' => '7891234560050',
                'unidade_medida' => 'rs', 'preco_custo' => 22.00, 'preco_venda' => 32.00,
                'estoque_atual' => 25, 'estoque_minimo' => 10, 'estoque_maximo' => 100,
                'descricao' => 'Papel sulfite A4 75g, 500 folhas, brancura 91%.',
                'category_id' => $catEscritorio->id,
                'storage_location_id' => $locC1->id,
            ],
            [
                'nome' => 'Cartucho Tinta Preta HP 664',
                'codigo' => 'ESC-002', 'codigo_barras' => '7891234560051',
                'unidade_medida' => 'un', 'preco_custo' => 38.00, 'preco_venda' => 58.00,
                'estoque_atual' => 4, 'estoque_minimo' => 5, 'estoque_maximo' => 20,
                'descricao' => 'Cartucho HP 664 preto para impressoras HP DeskJet.',
                'category_id' => $catEscritorio->id, 'supplier_id' => $sup4->id,
                'storage_location_id' => $locC1->id,
            ],
        ];

        $createdProducts = [];
        foreach ($products as $p) {
            $createdProducts[] = Product::create($p);
        }

        // ── 6. INITIAL INVENTORY MOVEMENTS ───────────────────────────────────
        // Record opening stock entries for all products (admin user)
        foreach ($createdProducts as $product) {
            InventoryMovement::create([
                'product_id'          => $product->id,
                'user_id'             => $admin->id,
                'tipo'                => 'entrada',
                'quantidade'          => $product->estoque_atual,
                'estoque_antes'       => 0,
                'estoque_depois'      => $product->estoque_atual,
                'motivo'              => 'Estoque inicial — abertura do sistema',
                'documento'           => 'INIT-' . str_pad($product->id, 4, '0', STR_PAD_LEFT),
                'storage_location_id' => $product->storage_location_id,
                'preco_unitario'      => $product->preco_custo,
            ]);
        }

        // Extra realistic movements by operators
        $disjuntor    = $createdProducts[1]; // ELE-002 - critical stock
        $capacete     = $createdProducts[7]; // EPI-001 - critical stock
        $alcool       = $createdProducts[13]; // LMP-002 - critical stock
        $cabo         = $createdProducts[0]; // ELE-001

        // Saída: operador retira 2 capacetes para uso em obra
        // Convention: saída quantities are stored as negative integers.
        // This ensures estoque_antes + quantidade = estoque_depois universally.
        InventoryMovement::create([
            'product_id'          => $capacete->id,
            'user_id'             => $op1->id,
            'tipo'                => 'saida',
            'quantidade'          => -2,
            'estoque_antes'       => $capacete->estoque_atual + 2,
            'estoque_depois'      => $capacete->estoque_atual,
            'motivo'              => 'Retirada para uso na área de construção — bloco C',
            'documento'           => 'OS-2024-0892',
            'storage_location_id' => $locB1->id,
        ]);

        // Saída: Fernanda retira 3 rolos de cabo elétrico
        InventoryMovement::create([
            'product_id'          => $cabo->id,
            'user_id'             => $op2->id,
            'tipo'                => 'saida',
            'quantidade'          => -3,
            'estoque_antes'       => $cabo->estoque_atual + 3,
            'estoque_depois'      => $cabo->estoque_atual,
            'motivo'              => 'Instalação elétrica — laboratório de automação',
            'documento'           => 'OS-2024-0899',
            'storage_location_id' => $locA1->id,
        ]);

        // Ajuste: disjuntores saiu mais do que o registrado — ajuste de inventário
        InventoryMovement::create([
            'product_id'     => $disjuntor->id,
            'user_id'        => $admin->id,
            'tipo'           => 'ajuste',
            'quantidade'     => -2,
            'estoque_antes'  => 5,
            'estoque_depois' => 3,
            'motivo'         => 'Ajuste após contagem física — 2 unidades danificadas',
            'documento'      => 'AJUSTE-001',
        ]);

        $this->command->info('✅  Seeder concluído com sucesso!');
        $this->command->info('    Admin: admin@senai.br / admin123');
        $this->command->info('    Operador: carlos.oliveira@senai.br / operador123');
        $this->command->info('    Operador: fernanda.lima@senai.br / operador123');
        $this->command->info('    Produtos cadastrados: ' . count($createdProducts));
        $this->command->info('    Movimentações registradas: ' . InventoryMovement::count());
    }
}
