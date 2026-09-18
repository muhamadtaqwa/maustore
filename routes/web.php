<?php

use App\Http\Controllers\AdminCategoryController;
use App\Http\Controllers\AdminCustomerController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminOrderController;
use App\Http\Controllers\AdminProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentCallbackController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

// ==================== CRON TRIGGER (EXTERNAL) ====================
Route::get('/cron/expire-orders/{token}', function ($token) {
    if ($token !== config('app.cron_token')) {
        abort(403);
    }

    Artisan::call('orders:expire');
    $output = Artisan::output();

    Log::info('Cron expire-orders triggered', [
        'output' => trim($output),
        'ip' => request()->ip(),
    ]);

    return response(trim($output));
})->middleware('throttle:10,1');

// ==================== PAYMENT WEBHOOK ====================
Route::post('/payment/duitku-callback', [PaymentCallbackController::class, 'handle'])
    ->middleware('throttle:30,1')
    ->name('payment.callback');

// ==================== STOREFRONT ====================
Route::get('/', [ProductController::class, 'index'])->name('home');
Route::get('/produk', [ProductController::class, 'index'])->name('products.index');
Route::get('/produk/{slug}', [ProductController::class, 'show'])->name('products.show');

// ==================== CHECKOUT ====================
Route::get('/checkout/{slug}', [CheckoutController::class, 'show'])->name('checkout.show');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/checkout/{invoice}/payment', [CheckoutController::class, 'payment'])->name('checkout.payment');
Route::get('/checkout/{invoice}/status', [CheckoutController::class, 'status'])->name('checkout.status');
Route::post('/checkout/{invoice}/upload-proof', [CheckoutController::class, 'uploadProof'])->name('checkout.upload-proof');

// ==================== CEK PESANAN ====================
Route::get('/cek-pesanan', [OrderController::class, 'index'])->name('order.check');
Route::post('/cek-pesanan', [OrderController::class, 'check'])
    ->name('order.check.submit')
    ->middleware('throttle:5,1');
Route::get('/cek-pesanan/{invoice}', [OrderController::class, 'detail'])->name('order.detail');

// ==================== AUTH ADMIN ====================
Route::get('/dashboard/login', [AuthController::class, 'showLogin'])->name('admin.login');
Route::post('/dashboard/login', [AuthController::class, 'login'])->name('admin.login.submit');
Route::post('/dashboard/logout', [AuthController::class, 'logout'])->name('admin.logout');

// ==================== ADMIN (PROTECTED) ====================
Route::middleware('admin')->prefix('dashboard')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Products
    Route::resource('products', AdminProductController::class)->except(['show']);

    // Categories
    Route::resource('categories', AdminCategoryController::class)->except(['show']);

    // Customers
    Route::get('customers', [AdminCustomerController::class, 'index'])->name('customers.index');

    // Orders
    Route::get('orders', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
    Route::post('orders/{order}/verify', [AdminOrderController::class, 'verifyPayment'])->name('orders.verify');
    Route::post('orders/{order}/deliver', [AdminOrderController::class, 'deliver'])->name('orders.deliver');
    Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::delete('orders/{order}', [AdminOrderController::class, 'destroy'])->name('orders.destroy');
});
