import StorefrontLayout from "@/Layouts/StorefrontLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function Payment({ order: initialOrder }) {
    const { flash } = usePage().props;
    const [order, setOrder] = useState(initialOrder);
    const [copied, setCopied] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    const formatRupiah = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value || 0);

    const copyInvoice = () => {
        navigator.clipboard.writeText(order.invoice_number);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const copyDelivery = (content, idx) => {
        navigator.clipboard.writeText(content);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // Polling status tiap 5 detik
    useEffect(() => {
        if (order.status !== "pending") return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(
                    `/checkout/${order.invoice_number}/status`,
                    {
                        headers: { Accept: "application/json" },
                    },
                );
                const data = await res.json();

                if (data.status && data.status !== order.status) {
                    setOrder((prev) => ({ ...prev, ...data }));
                } else if (data.items && data.items.length > 0) {
                    setOrder((prev) => ({ ...prev, items: data.items }));
                }
            } catch (e) {
                // silent fail
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [order.status, order.invoice_number]);

    // Countdown expired
    useEffect(() => {
        if (!order.expired_at || order.status !== "pending") return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const expiry = new Date(order.expired_at).getTime();
            const diff = expiry - now;

            if (diff <= 0) {
                setTimeLeft({ minutes: 0, seconds: 0, expired: true });
            } else {
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimeLeft({ minutes, seconds, expired: false });
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [order.expired_at, order.status]);

    const isPending = order.status === "pending";
    const isPaid = order.status === "paid" || order.status === "delivered";
    const isExpired = order.status === "expired" || order.status === "failed";

    return (
        <StorefrontLayout>
            <Head title="Pembayaran" />

            <div className="max-w-lg mx-auto">
                {/* Status Badge */}
                <div className="flex justify-center mb-4">
                    {isPending && !timeLeft?.expired && (
                        <div className="px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium">
                            Menunggu Pembayaran
                        </div>
                    )}
                    {isPaid && (
                        <div className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                            Pembayaran Berhasil
                        </div>
                    )}
                    {isExpired && (
                        <div className="px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-medium">
                            Pesanan{" "}
                            {order.status === "expired"
                                ? "Kadaluarsa"
                                : "Gagal"}
                        </div>
                    )}
                </div>

                <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-6">
                    {isPaid ? "Pembayaran Berhasil" : "Selesaikan Pembayaran"}
                </h1>

                {/* Invoice Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-500">
                            No. Invoice
                        </span>
                        <button
                            onClick={copyInvoice}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                            {copied ? "Tersalin" : "Salin"}
                        </button>
                    </div>
                    <p className="font-mono text-sm font-bold text-gray-900 mb-3">
                        {order.invoice_number}
                    </p>

                    <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Total Bayar
                            </span>
                            <span className="text-lg font-bold text-blue-600">
                                {formatRupiah(order.total_amount)}
                            </span>
                        </div>
                    </div>

                    {/* Countdown */}
                    {isPending && timeLeft && !timeLeft.expired && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                    Sisa waktu
                                </span>
                                <span className="font-mono font-bold text-red-600">
                                    {String(timeLeft.minutes).padStart(2, "0")}:
                                    {String(timeLeft.seconds).padStart(2, "0")}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ==================== PAID: Tampil Produk ==================== */}
                {isPaid && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                        <h2 className="text-sm font-semibold text-green-700 mb-3">
                            Pesanan Kamu
                        </h2>

                        <div className="space-y-3">
                            {order.items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white rounded-lg p-3 border border-green-100"
                                >
                                    <p className="text-sm font-semibold text-gray-900 mb-0.5">
                                        {item.product_name}
                                    </p>
                                    <p className="text-xs text-gray-500 mb-3">
                                        {item.variant_name}
                                    </p>

                                    {item.delivery_content ? (
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className="text-xs font-medium text-gray-500">
                                                    Detail Produk
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        copyDelivery(
                                                            item.delivery_content,
                                                            idx,
                                                        )
                                                    }
                                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    {copiedIndex === idx
                                                        ? "Tersalin"
                                                        : "Salin"}
                                                </button>
                                            </div>
                                            <pre className="text-xs text-gray-900 whitespace-pre-wrap font-mono break-all">
                                                {item.delivery_content}
                                            </pre>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 italic">
                                            Detail produk akan dikirim segera.
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Detail Item — sembunyi kalau udah paid */}
                {isPending && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                        <h2 className="text-sm font-semibold text-gray-900 mb-3">
                            Detail Pesanan
                        </h2>
                        {order.items.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between text-sm py-1"
                            >
                                <div className="min-w-0 mr-2">
                                    <p className="text-gray-900 truncate">
                                        {item.product_name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {item.variant_name}
                                    </p>
                                </div>
                                <p className="text-gray-900 font-medium shrink-0">
                                    {formatRupiah(item.subtotal)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* QRIS */}
                {isPending && order.qr_string && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                        <h2 className="text-sm font-semibold text-gray-900 mb-3 text-center">
                            Scan QRIS untuk Bayar
                        </h2>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(order.qr_string)}`}
                                alt="QRIS"
                                className="w-full max-w-xs mx-auto"
                            />
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-3">
                            Scan pakai GoPay, DANA, OVO, ShopeePay, atau
                            m-banking
                        </p>
                    </div>
                )}

                {/* Expired */}
                {isExpired && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                        <h2 className="text-sm font-semibold text-red-700 mb-1">
                            Pesanan Kadaluarsa
                        </h2>
                        <p className="text-xs text-red-600">
                            Silakan buat pesanan baru.
                        </p>
                    </div>
                )}

                {/* Flash */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                        <p className="text-xs text-green-700">
                            {flash.success}
                        </p>
                    </div>
                )}

                {/* Tombol Cek Pesanan */}
                <Link
                    href="/cek-pesanan"
                    className="block w-full text-center bg-blue-600 text-white text-sm font-semibold px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                    Cek Status Pesanan
                </Link>
            </div>
        </StorefrontLayout>
    );
}
