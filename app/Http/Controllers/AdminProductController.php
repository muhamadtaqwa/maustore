<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminProductController extends Controller
{
    public function index(): Response
    {
        $products = Product::query()
            ->with(['categories:id,name', 'variants'])
            ->latest()
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'image' => $p->image,
                'is_active' => $p->is_active,
                'variants_count' => $p->variants->count(),
                'min_price' => $p->variants->min('price'),
                'categories' => $p->categories->map(fn($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                ]),
                'variants' => $p->variants->map(fn($v) => [
                    'id' => $v->id,
                    'name' => $v->name,
                    'duration' => $v->duration,
                    'account_type' => $v->account_type,
                    'price' => (float) $v->price,
                    'stock' => $v->stock,
                    'is_active' => $v->is_active,
                ]),
                'created_at' => $p->created_at->format('d M Y'),
            ]);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
        ]);
    }

    public function create(): Response
    {
        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/Products/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products,slug',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'categories' => 'array',
            'categories.*' => 'exists:categories,id',
            'variants' => 'required|array|min:1',
            'variants.*.name' => 'required|string|max:255',
            'variants.*.duration' => 'nullable|string|max:255',
            'variants.*.account_type' => 'nullable|string|max:255',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.delivery_type' => 'required|in:link,account',
            'variants.*.delivery_content' => 'nullable|string',
            'variants.*.is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('products', 'public');
            }

            $product = Product::create([
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'description' => $validated['description'] ?? null,
                'image' => $imagePath,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            if (!empty($validated['categories'])) {
                $product->categories()->sync($validated['categories']);
            }

            foreach ($validated['variants'] as $variant) {
                $product->variants()->create([
                    'name' => $variant['name'],
                    'duration' => $variant['duration'] ?? null,
                    'account_type' => $variant['account_type'] ?? null,
                    'price' => $variant['price'],
                    'stock' => $variant['stock'],
                    'delivery_type' => $variant['delivery_type'],
                    'delivery_content' => $variant['delivery_content'] ?? null,
                    'is_active' => $variant['is_active'] ?? true,
                ]);
            }
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Produk berhasil ditambahkan.');
    }

    public function edit(Product $product): Response
    {
        $product->load(['categories:id', 'variants']);

        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/Products/Edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'image' => $product->image,
                'is_active' => $product->is_active,
                'categories' => $product->categories->pluck('id'),
                'variants' => $product->variants->map(fn($v) => [
                    'id' => $v->id,
                    'name' => $v->name,
                    'duration' => $v->duration,
                    'account_type' => $v->account_type,
                    'price' => (float) $v->price,
                    'stock' => $v->stock,
                    'delivery_type' => $v->delivery_type,
                    'delivery_content' => $v->delivery_content,
                    'is_active' => $v->is_active,
                ]),
            ],
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products,slug,' . $product->id,
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'categories' => 'array',
            'categories.*' => 'exists:categories,id',
            'variants' => 'required|array|min:1',
            'variants.*.id' => 'nullable|integer|exists:product_variants,id',
            'variants.*.name' => 'required|string|max:255',
            'variants.*.duration' => 'nullable|string|max:255',
            'variants.*.account_type' => 'nullable|string|max:255',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.delivery_type' => 'required|in:link,account',
            'variants.*.delivery_content' => 'nullable|string',
            'variants.*.is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($validated, $request, $product) {
            $imagePath = $product->image;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('products', 'public');
            }

            $product->update([
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'description' => $validated['description'] ?? null,
                'image' => $imagePath,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            $product->categories()->sync($validated['categories'] ?? []);

            // Variants: sync (update existing, create new, delete missing)
            $existingIds = collect($validated['variants'])->pluck('id')->filter()->toArray();
            $product->variants()->whereNotIn('id', $existingIds)->delete();

            foreach ($validated['variants'] as $variant) {
                if (!empty($variant['id'])) {
                    $product->variants()->where('id', $variant['id'])->update([
                        'name' => $variant['name'],
                        'duration' => $variant['duration'] ?? null,
                        'account_type' => $variant['account_type'] ?? null,
                        'price' => $variant['price'],
                        'stock' => $variant['stock'],
                        'delivery_type' => $variant['delivery_type'],
                        'delivery_content' => $variant['delivery_content'] ?? null,
                        'is_active' => $variant['is_active'] ?? true,
                    ]);
                } else {
                    $product->variants()->create([
                        'name' => $variant['name'],
                        'duration' => $variant['duration'] ?? null,
                        'account_type' => $variant['account_type'] ?? null,
                        'price' => $variant['price'],
                        'stock' => $variant['stock'],
                        'delivery_type' => $variant['delivery_type'],
                        'delivery_content' => $variant['delivery_content'] ?? null,
                        'is_active' => $variant['is_active'] ?? true,
                    ]);
                }
            }
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Produk berhasil diupdate.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'Produk berhasil dihapus.');
    }
}
