<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        // Stats
        $revenueToday = Order::whereIn('status', ['paid', 'delivered'])
            ->whereDate('paid_at', today())
            ->sum('total_amount');

        $revenueThisMonth = Order::whereIn('status', ['paid', 'delivered'])
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('total_amount');

        $ordersToday = Order::whereDate('created_at', today())->count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $totalProducts = Product::count();
        $totalCustomers = Customer::count();

        // Chart data 7 hari terakhir
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $revenue = Order::whereIn('status', ['paid', 'delivered'])
                ->whereDate('paid_at', $date)
                ->sum('total_amount');
            $orders = Order::whereDate('created_at', $date)->count();

            $chartData[] = [
                'date' => $date->format('d M'),
                'revenue' => (float) $revenue,
                'orders' => $orders,
            ];
        }

        // Order terbaru
        $latestOrders = Order::with('customer:id,phone')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($o) => [
                'id' => $o->id,
                'invoice_number' => $o->invoice_number,
                'status' => $o->status,
                'total_amount' => (float) $o->total_amount,
                'customer_phone' => $o->customer->phone,
                'created_at' => $o->created_at->format('d M Y H:i'),
            ]);

        // Produk terlaris (top 5 by order count)
        $topProducts = Product::withCount(['orderItems as sold_count'])
            ->orderByDesc('sold_count')
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'sold_count' => $p->sold_count,
            ]);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'revenue_today' => (float) $revenueToday,
                'revenue_month' => (float) $revenueThisMonth,
                'orders_today' => $ordersToday,
                'pending_orders' => $pendingOrders,
                'total_products' => $totalProducts,
                'total_customers' => $totalCustomers,
            ],
            'chartData' => $chartData,
            'latestOrders' => $latestOrders,
            'topProducts' => $topProducts,
        ]);
    }
}
