<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DuitkuService
{
    protected string $merchantCode;
    protected string $apiKey;
    protected string $baseUrl;
    protected string $callbackUrl;
    protected string $returnUrl;
    protected int $expiryMinutes;

    public function __construct()
    {
        $this->merchantCode = config('services.duitku.merchant_code');
        $this->apiKey = config('services.duitku.api_key');
        $this->baseUrl = config('services.duitku.base_url');
        $this->callbackUrl = config('services.duitku.callback_url');
        $this->returnUrl = config('services.duitku.return_url');
        $this->expiryMinutes = (int) config('services.duitku.expiry_minutes', 30);
    }

    /**
     * Signature create invoice:
     * MD5(merchantCode + merchantOrderId + amount + apiKey)
     */
    public function generateSignature(string $merchantOrderId, int $amount): string
    {
        return md5($this->merchantCode . $merchantOrderId . $amount . $this->apiKey);
    }

    /**
     * Signature check status:
     * MD5(merchantCode + merchantOrderId + apiKey)
     */
    public function generateStatusSignature(string $merchantOrderId): string
    {
        return md5($this->merchantCode . $merchantOrderId . $this->apiKey);
    }

    /**
     * Buat transaksi QRIS ke Duitku (NQ = QRIS)
     */
    public function createQrisTransaction(Order $order): array
    {
        $amount = (int) $order->total_amount;
        $merchantOrderId = $order->invoice_number;
        $signature = $this->generateSignature($merchantOrderId, $amount);

        $payload = [
            'merchantCode' => $this->merchantCode,
            'paymentAmount' => $amount,
            'paymentMethod' => 'NQ',
            'merchantOrderId' => $merchantOrderId,
            'productDetails' => 'Order ' . $merchantOrderId,
            'email' => $order->customer->email ?? 'noreply@maustore.test',
            'phoneNumber' => $order->customer->phone,
            'customerVaName' => $order->customer->name ?? $order->customer->phone,
            'callbackUrl' => $this->callbackUrl,
            'returnUrl' => $this->returnUrl,
            'signature' => $signature,
            'expiryPeriod' => $this->expiryMinutes,
            'itemDetails' => $order->items->map(fn($item) => [
                'name' => $item->product_name . ' - ' . $item->variant_name,
                'price' => (int) $item->price,
                'quantity' => $item->quantity,
            ])->toArray(),
        ];

        $response = Http::asJson()
            ->timeout(30)
            ->post($this->baseUrl . '/api/merchant/v2/inquiry', $payload);

        $data = $response->json();

        Log::info('Duitku createInvoice', [
            'order' => $merchantOrderId,
            'response' => $data,
        ]);

        if (!isset($data['statusCode']) || $data['statusCode'] !== '00') {
            throw new \Exception(
                $data['statusMessage'] ?? 'Gagal membuat transaksi Duitku'
            );
        }

        return [
            'reference' => $data['reference'] ?? null,
            'qr_string' => $data['qrString'] ?? null,
            'payment_url' => $data['paymentUrl'] ?? null,
            'amount' => $data['amount'] ?? $amount,
        ];
    }

    /**
     * Cek status transaksi ke Duitku
     * Signature = MD5(merchantCode + merchantOrderId + apiKey)
     */
    public function checkTransaction(string $merchantOrderId): array
    {
        $signature = $this->generateStatusSignature($merchantOrderId);

        $response = Http::asJson()
            ->timeout(30)
            ->post($this->baseUrl . '/api/merchant/transactionStatus', [
                'merchantCode' => $this->merchantCode,
                'merchantOrderId' => $merchantOrderId,
                'signature' => $signature,
            ]);

        return $response->json() ?? [];
    }

    /**
     * Verifikasi signature callback dari Duitku
     * Signature callback = MD5(merchantCode + amount + merchantOrderId + apiKey)
     */
    public function verifyCallback(array $data): bool
    {
        $expected = md5(
            $this->merchantCode .
                ($data['amount'] ?? '') .
                ($data['merchantOrderId'] ?? '') .
                $this->apiKey
        );

        return hash_equals($expected, $data['signature'] ?? '');
    }
}
