<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentCallbackController extends Controller
{
    /**
     * Webhook/Callback dari Duitku
     */
    public function handle(Request $request)
    {
        try {
            $merchantCode = config('services.duitku.merchant_code');
            $apiKey = config('services.duitku.api_key');

            $amount = $request->amount;
            $merchantOrderId = $request->merchantOrderId;
            $signature = $request->signature;
            $reference = $request->reference;
            $resultCode = $request->resultCode;

            // Validasi Signature (MD5(merchantCode + amount + merchantOrderId + apiKey))
            $calcSignature = md5($merchantCode . $amount . $merchantOrderId . $apiKey);

            if ($signature !== $calcSignature) {
                Log::warning('Duitku Callback Invalid Signature', $request->all());
                return response()->json(['success' => false, 'message' => 'Invalid signature'], 400);
            }

            // Cari pesanan
            $order = Order::where('invoice_number', $merchantOrderId)->first();

            if (!$order) {
                return response()->json(['success' => false, 'message' => 'Order not found'], 404);
            }

            // Idempotency: kalau udah paid/delivered, abaikan
            if (in_array($order->status, ['paid', 'delivered'])) {
                return response()->json(['success' => true, 'message' => 'Order already processed']);
            }

            // Kalau pembayaran sukses (00)
            if ($resultCode === '00') {
                $order->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'payment_method' => 'qris',
                    'payment_reference' => $reference,
                ]);
            } elseif ($resultCode === '01') {
                $order->update(['status' => 'failed']);
            }

            return response()->json(['success' => true, 'message' => 'Callback processed']);
        } catch (\Exception $e) {
            Log::error('Duitku Callback Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Internal server error'], 500);
        }
    }
}
