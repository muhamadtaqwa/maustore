<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Inertia\Inertia;
use Inertia\Response;

class AdminCustomerController extends Controller
{
    public function index(): Response
    {
        $customers = Customer::withCount('orders')
            ->withSum(['orders as total_spent' => function ($q) {
                $q->whereIn('status', ['paid', 'delivered']);
            }], 'total_amount')
            ->latest()
            ->get()
            ->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'phone' => $c->phone,
                'email' => $c->email,
                'orders_count' => $c->orders_count,
                'total_spent' => (float) ($c->total_spent ?? 0),
                'created_at' => $c->created_at->format('d M Y'),
            ]);

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
        ]);
    }
}
