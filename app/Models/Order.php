<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'invoice_number',
        'customer_id',
        'status',
        'total_amount',
        'payment_method',
        'payment_reference',
        'qr_string',              // ← baru
        'duitku_reference',       // ← baru
        'expired_at',             // ← baru
        'payment_proof',
        'payment_verified_at',
        'payment_verified_by',
        'paid_at',
        'delivered_at',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'delivered_at' => 'datetime',
        'payment_verified_at' => 'datetime',
        'expired_at' => 'datetime',    // ← baru
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'payment_verified_by');
    }
}
