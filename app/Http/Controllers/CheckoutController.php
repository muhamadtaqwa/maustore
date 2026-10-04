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
    protected ?DuitkuService $duitku;

    public function __construct(?DuitkuService $duitku = null)
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

        // Bikin Order dengan metode QRIS Statis
        $order = DB::transaction(function () use ($validated, $product, $variant) {
            $customer = Customer::firstOrCreate(
                ['phone' => $validated['phone']],
                ['email' => null]
            );

            // Generate kode unik (100 - 999) agar mutasi mudah dicek
            $useUniqueCode = config('qris.enable_unique_code', true);
            $uniqueCode = $useUniqueCode ? rand(100, 999) : 0;
            $totalAmount = (float) $variant->price + $uniqueCode;
            $expiryMinutes = config('qris.expiry_minutes', 60);

            $order = Order::create([
                'invoice_number' => $this->generateInvoiceNumber(),
                'customer_id' => $customer->id,
                'status' => 'pending',
                'unique_code' => $uniqueCode,
                'total_amount' => $totalAmount,
                'payment_method' => 'qris_manual',
                'expired_at' => now()->addMinutes($expiryMinutes),
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

        Log::info('Order QRIS Statis dibuat', [
            'invoice' => $order->invoice_number,
            'total' => $order->total_amount,
            'unique_code' => $order->unique_code,
        ]);

        return redirect()->route('checkout.payment', ['invoice' => $order->invoice_number]);
    }

    public function payment(string $invoice): Response
    {
        $order = Order::query()
            ->where('invoice_number', $invoice)
            ->with(['customer', 'items.product'])
            ->firstOrFail();

        // Cari gambar QRIS: cek apakah public/images/qris.png / jpg / svg ada
        $configuredPath = config('qris.image_path', '/images/qris.png');
        $cleanPath = ltrim($configuredPath, '/');
        $qrisImageUrl = asset($configuredPath);

        if (!file_exists(public_path($cleanPath))) {
            if (file_exists(public_path('images/qris-placeholder.svg'))) {
                $qrisImageUrl = asset('images/qris-placeholder.svg');
            }
        }

        $merchantName = config('qris.merchant_name', 'MauStore');
        $whatsappNumber = config('qris.whatsapp_number', '6281234567890');
        
        // Bersihkan nomor WhatsApp (hanya angka, pastikan format 62xxx)
        $cleanWaNumber = preg_replace('/[^0-9]/', '', $whatsappNumber);
        if (str_starts_with($cleanWaNumber, '08')) {
            $cleanWaNumber = '628' . substr($cleanWaNumber, 2);
        }

        $firstItem = $order->items->first();
        $productText = $firstItem ? "{$firstItem->product_name} ({$firstItem->variant_name})" : "Produk MauStore";
        $totalFormatted = 'Rp ' . number_format($order->total_amount, 0, ',', '.');

        $waMessage = "Halo {$merchantName}, saya sudah melakukan pembayaran pesanan:\n\n"
            . "• No Invoice: {$order->invoice_number}\n"
            . "• Produk: {$productText}\n"
            . "• Total Bayar: {$totalFormatted}\n"
            . "• No HP: {$order->customer->phone}\n\n"
            . "Berikut saya lampirkan bukti pembayarannya, mohon segera diproses ya min. Terima kasih!";

        $whatsappUrl = "https://wa.me/{$cleanWaNumber}?text=" . rawurlencode($waMessage);

        return Inertia::render('Checkout/Payment', [
            'order' => [
                'id' => $order->id,
                'invoice_number' => $order->invoice_number,
                'total_amount' => (float) $order->total_amount,
                'unique_code' => (int) ($order->unique_code ?? 0),
                'status' => $order->status,
                'payment_proof' => $order->payment_proof ? asset('storage/' . $order->payment_proof) : null,
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
            'qris' => [
                'image_url' => $qrisImageUrl,
                'merchant_name' => $merchantName,
                'whatsapp_url' => $whatsappUrl,
                'whatsapp_number' => $cleanWaNumber,
            ],
        ]);
    }

    public function status(string $invoice)
    {
        $order = Order::where('invoice_number', $invoice)->firstOrFail();

        // Optional Duitku check fallback jika ada data lama
        if ($order->status === 'pending' && $order->duitku_reference && $this->duitku) {
            try {
                $duitkuStatus = $this->duitku->checkTransaction($order->invoice_number);

                if (isset($duitkuStatus['statusCode']) && $duitkuStatus['statusCode'] === '00') {
                    $order->update([
                        'status' => 'paid',
                        'paid_at' => now(),
                    ]);
                }
            } catch (\Exception $e) {
                // ignore
            }
        }

        // Kirim delivery_content kalau udah paid atau delivered
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
            'payment_proof' => $order->payment_proof ? asset('storage/' . $order->payment_proof) : null,
            'paid_at' => $order->paid_at?->toIso8601String(),
            'items' => $items,
        ]);
    }

    public function uploadProof(Request $request, string $invoice)
    {
        $request->validate([
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg,webp|max:4096',
        ], [
            'payment_proof.required' => 'Silakan pilih foto atau screenshot bukti pembayaran.',
            'payment_proof.image' => 'File harus berupa gambar.',
            'payment_proof.mimes' => 'Format file gambar harus jpg, jpeg, png, atau webp.',
            'payment_proof.max' => 'Ukuran gambar maksimal 4 MB.',
        ]);

        $order = Order::where('invoice_number', $invoice)->firstOrFail();

        if ($order->status !== 'pending') {
            return back()->withErrors(['payment_proof' => 'Pesanan ini sudah tidak dalam status pending.']);
        }

        $path = $request->file('payment_proof')->store('payment-proofs', 'public');

        $order->update([
            'payment_proof' => $path,
        ]);

        return redirect()->route('checkout.payment', ['invoice' => $invoice])
            ->with('success', 'Bukti pembayaran berhasil diupload! Admin akan segera memverifikasi pesanan Anda.');
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
