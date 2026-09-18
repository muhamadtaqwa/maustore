<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Tampil form cek pesanan
     */
    public function index(): Response
    {
        return Inertia::render('Order/Check');
    }

    /**
     * Proses cek pesanan
     */
    public function check(Request $request)
    {
        $validated = $request->validate([
            'invoice_number' => 'required|string',
        ]);

        $order = Order::query()
            ->where('invoice_number', $validated['invoice_number'])
            ->first();

        if (!$order) {
            return back()->withErrors([
                'invoice_number' => 'Pesanan tidak ditemukan. Cek lagi No. Invoice.',
            ])->withInput();
        }

        return redirect()->route('order.detail', ['invoice' => $order->invoice_number]);
    }

    /**
     * Tampil detail pesanan
     */
    public function detail(string $invoice): Response
    {
        $order = Order::query()
            ->where('invoice_number', $invoice)
            ->with(['customer', 'items.product'])
            ->firstOrFail();

        return Inertia::render('Order/Detail', [
            'order' => [
                'id' => $order->id,
                'invoice_number' => $order->invoice_number,
                'status' => $order->status,
                'total_amount' => (float) $order->total_amount,
                'payment_method' => $order->payment_method,
                'payment_proof' => $order->payment_proof,
                'paid_at' => $order->paid_at?->format('d M Y H:i'),
                'delivered_at' => $order->delivered_at?->format('d M Y H:i'),
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

    /**
     * API: Cek status pesanan untuk polling di halaman pembayaran
     */
    public function status(string $invoice)
    {
        $order = Order::with('items')->where('invoice_number', $invoice)->firstOrFail();

        $response = [
            'status' => $order->status,
        ];

        // Jika sudah dibayar, kirimkan juga delivery_content (data akun)
        if (in_array($order->status, ['processing', 'paid', 'completed'])) {
            $items = $order->items->map(function ($item) {
                // Cari varian untuk ambil delivery content
                $variant = \App\Models\ProductVariant::find($item->product_variant_id);
                return [
                    'product_name' => $item->product_name,
                    'variant_name' => $item->variant_name,
                    'delivery_content' => $variant ? $variant->delivery_content : 'Data akan dikirim manual.',
                ];
            });

            $response['delivery_data'] = $items;
        }

        return response()->json($response);
    }
}
