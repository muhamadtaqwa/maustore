<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\DuitkuService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    protected DuitkuService $duitku;

    public function __construct(DuitkuService $duitku)
    {
        $this->duitku = $duitku;
    }

    public function show(string $slug, Request $request): Response
    {
        $product = Product::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->with(['variants' => function ($q) {
                $q->where('is_active', true);
            }])
            ->firstOrFail();

        $variant = $product->variants->firstWhere('id', (int) $request->variant);

        if (!$variant) {
            abort(404, 'Varian tidak ditemukan');
        }

        return Inertia::render('Checkout/Form', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'image' => $product->image,
            ],
            'variant' => [
                'id' => $variant->id,
                'name' => $variant->name,
                'duration' => $variant->duration,
                'account_type' => $variant->account_type,
                'price' => (float) $variant->price,
                'stock' => $variant->stock,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'required|exists:product_variants,id',
            'phone' => 'required|string|min:9|max:20',
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $variant = ProductVariant::findOrFail($validated['variant_id']);

        if ($variant->product_id !== $product->id) {
            abort(400, 'Varian tidak cocok dengan produk');
        }

        if ($variant->stock <= 0) {
            return back()->withErrors(['variant_id' => 'Stok varian habis.']);
        }

        // Bikin Order
        $order = DB::transaction(function () use ($validated, $product, $variant) {
            $customer = Customer::firstOrCreate(
                ['phone' => $validated['phone']],
                ['email' => null]
            );

            $order = Order::create([
                'invoice_number' => $this->generateInvoiceNumber(),
                'customer_id' => $customer->id,
                'status' => 'pending',
                'total_amount' => $variant->price,
                'expired_at' => now()->addMinutes(config('services.duitku.expiry_minutes', 30)),
            ]);

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'product_variant_id' => $variant->id,
                'product_name' => $product->name,
                'variant_name' => $variant->name,
                'delivery_content' => $variant->delivery_content,   // ← snapshot
                'price' => $variant->price,
                'quantity' => 1,
                'subtotal' => $variant->price,
            ]);

            $variant->decrement('stock');

            return $order;
        });

        // Panggil Duitku
        try {
            $order->load(['customer', 'items']);
            $duitkuResponse = $this->duitku->createQrisTransaction($order);

            $order->update([
                'payment_method' => 'qris',
                'payment_reference' => $duitkuResponse['reference'],
                'duitku_reference' => $duitkuResponse['reference'],
                'qr_string' => $duitkuResponse['qr_string'],
            ]);

            Log::info('Duitku QRIS created', [
                'order' => $order->invoice_number,
                'reference' => $duitkuResponse['reference'],
            ]);
        } catch (\Exception $e) {
            Log::error('Duitku error saat checkout', [
                'order' => $order->invoice_number,
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('checkout.payment', ['invoice' => $order->invoice_number])
                ->withErrors(['duitku' => 'Gagal membuat QRIS: ' . $e->getMessage()]);
        }

        return redirect()->route('checkout.payment', ['invoice' => $order->invoice_number]);
    }

    public function payment(string $invoice): Response
    {
        $order = Order::query()
            ->where('invoice_number', $invoice)
            ->with(['customer', 'items.product'])
            ->firstOrFail();

        return Inertia::render('Checkout/Payment', [
            'order' => [
                'id' => $order->id,
                'invoice_number' => $order->invoice_number,
                'total_amount' => (float) $order->total_amount,
                'status' => $order->status,
                'qr_string' => $order->qr_string,
                'payment_reference' => $order->payment_reference,
                'expired_at' => $order->expired_at?->toIso8601String(),
                'paid_at' => $order->paid_at?->format('d M Y H:i'),
                'created_at' => $order->created_at->format('d M Y H:i'),
                'customer' => [
                    'phone' => $order->customer->phone,
                ],
                'items' => $order->items->map(fn($item) => [
                    'product_name' => $item->product_name,
                    'variant_name' => $item->variant_name,
                    'delivery_content' => $item->delivery_content,
                    'price' => (float) $item->price,
                    'quantity' => $item->quantity,
                    'subtotal' => (float) $item->subtotal,
                ]),
            ],
        ]);
    }

    public function status(string $invoice)
    {
        $order = Order::where('invoice_number', $invoice)->firstOrFail();

        if ($order->status === 'pending' && $order->duitku_reference) {
            try {
                $duitkuStatus = $this->duitku->checkTransaction($order->invoice_number);

                if (isset($duitkuStatus['statusCode']) && $duitkuStatus['statusCode'] === '00') {
                    $order->update([
                        'status' => 'paid',
                        'paid_at' => now(),
                    ]);
                }
            } catch (\Exception $e) {
                Log::warning('Gagal cek status Duitku', [
                    'order' => $invoice,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Kirim delivery_content kalau udah paid
        $items = [];
        if (in_array($order->status, ['paid', 'delivered'])) {
            $order->load('items');
            $items = $order->items->map(fn($item) => [
                'product_name' => $item->product_name,
                'variant_name' => $item->variant_name,
                'delivery_content' => $item->delivery_content,
            ])->toArray();
        }

        return response()->json([
            'status' => $order->status,
            'paid_at' => $order->paid_at?->toIso8601String(),
            'items' => $items,
        ]);
    }

    public function uploadProof(Request $request, string $invoice)
    {
        $validated = $request->validate([
            'payment_proof' => 'required|image|max:2048',
        ]);

        $order = Order::where('invoice_number', $invoice)->firstOrFail();

        if ($order->status !== 'pending') {
            return back()->withErrors(['payment_proof' => 'Order sudah diproses.']);
        }

        $path = $request->file('payment_proof')->store('payment-proofs', 'public');

        $order->update([
            'payment_proof' => $path,
        ]);

        return redirect()->route('checkout.payment', ['invoice' => $invoice])
            ->with('success', 'Bukti pembayaran berhasil diupload. Menunggu verifikasi admin.');
    }

    private function generateInvoiceNumber(): string
    {
        $prefix = 'INV-' . now()->format('Ymd') . '-';

        do {
            $token = strtoupper(\Illuminate\Support\Str::random(6));
            $invoice = $prefix . $token;
        } while (Order::where('invoice_number', $invoice)->exists());

        return $invoice;
    }
}
