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

            // 1. Validasi Signature
            $calcSignature = md5($merchantCode . $amount . $merchantOrderId . $apiKey);

            if ($signature !== $calcSignature) {
                Log::warning('Duitku Callback Invalid Signature', [
                    'ip' => $request->ip(),
                    'merchantOrderId' => $merchantOrderId,
                ]);
                return response()->json(['success' => false, 'message' => 'Invalid signature'], 400);
            }

            // 2. Cari pesanan
            $order = Order::where('invoice_number', $merchantOrderId)->first();

            if (!$order) {
                Log::warning('Duitku Callback Order Not Found', [
                    'ip' => $request->ip(),
                    'merchantOrderId' => $merchantOrderId,
                ]);
                return response()->json(['success' => false, 'message' => 'Order not found'], 404);
            }

            // 3. Validasi Amount ← FIX INI
            if ((int) $order->total_amount !== (int) $amount) {
                Log::error('Duitku Callback Amount Mismatch', [
                    'invoice' => $merchantOrderId,
                    'expected' => $order->total_amount,
                    'received' => $amount,
                    'ip' => $request->ip(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Amount mismatch',
                ], 400);
            }

            // 4. Idempotency
            if (in_array($order->status, ['paid', 'delivered'])) {
                return response()->json(['success' => true, 'message' => 'Order already processed']);
            }

            // 5. Update status
            if ($resultCode === '00') {
                $order->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'payment_method' => 'qris',
                    'payment_reference' => $reference,
                ]);

                Log::info('Duitku Order Paid', [
                    'invoice' => $merchantOrderId,
                    'amount' => $amount,
                ]);
            } elseif ($resultCode === '01') {
                $order->update(['status' => 'failed']);

                Log::info('Duitku Order Failed', [
                    'invoice' => $merchantOrderId,
                ]);
            }

            return response()->json(['success' => true, 'message' => 'Callback processed']);
        } catch (\Exception $e) {
            Log::error('Duitku Callback Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Internal server error'], 500);
        }
    }
}
