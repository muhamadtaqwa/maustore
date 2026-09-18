<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpireOrders extends Command
{
    protected $signature = 'orders:expire';
    protected $description = 'Expire pending orders yang udah lewat expired_at';

    public function handle(): int
    {
        $expired = Order::query()
            ->where('status', 'pending')
            ->whereNotNull('expired_at')
            ->where('expired_at', '<', now())
            ->with('items')
            ->get();

        if ($expired->isEmpty()) {
            $this->info('Gak ada order yang perlu di-expire.');
            return self::SUCCESS;
        }

        $count = 0;

        foreach ($expired as $order) {
            // Restore stock
            foreach ($order->items as $item) {
                if ($item->product_variant_id) {
                    \App\Models\ProductVariant::where('id', $item->product_variant_id)
                        ->increment('stock', $item->quantity);
                }
            }

            $order->update([
                'status' => 'expired',
                'notes' => ($order->notes ? $order->notes . ' | ' : '') . 'Auto-expired at ' . now()->format('Y-m-d H:i:s'),
            ]);

            $count++;

            Log::info('Order expired', [
                'invoice' => $order->invoice_number,
                'expired_at' => $order->expired_at,
            ]);
        }

        $this->info("✅ {$count} order berhasil di-expire.");
        return self::SUCCESS;
    }
}
