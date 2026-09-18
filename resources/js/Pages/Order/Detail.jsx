import StorefrontLayout from "@/Layouts/StorefrontLayout";
import OrderStatusBadge from "@/Components/OrderStatusBadge";
import { Head, Link } from "@inertiajs/react";
import { useState } from "react";

export default function Detail({ order }) {
    const [copied, setCopied] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);

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

    const isPaid = order.status === "paid" || order.status === "delivered";
    const isPending = order.status === "pending";

    return (
        <StorefrontLayout>
            <Head title={`Pesanan ${order.invoice_number}`} />

            <Link
                href="/cek-pesanan"
                className="inline-block text-sm text-gray-500 hover:text-blue-600 mb-4 transition"
            >
                Cek pesanan lain
            </Link>

            <div className="max-w-lg mx-auto">
                {/* Status */}
                <div className="text-center mb-6">
                    <OrderStatusBadge status={order.status} />
                    <h1 className="text-lg md:text-xl font-bold text-gray-900 mt-3">
                        Detail Pesanan
                    </h1>
                </div>

                {/* Info Order */}
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

                    <div className="space-y-1 pt-3 border-t border-gray-100 text-xs text-gray-600">
                        <p>Dibuat: {order.created_at}</p>
                        <p>No. HP: {order.customer.phone}</p>
                    </div>
                </div>

                {/* ==================== PRODUK (kalau paid) ==================== */}
                {isPaid && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                        <h2 className="text-sm font-semibold text-green-700 mb-3">
                            Produk Kamu
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

                {/* ==================== ITEM (kalau pending) ==================== */}
                {isPending && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                        <h2 className="text-sm font-semibold text-gray-900 mb-3">
                            Item Pesanan
                        </h2>
                        {order.items.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0"
                            >
                                <div className="min-w-0 mr-2">
                                    <p className="text-gray-900 truncate font-medium">
                                        {item.product_name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {item.variant_name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Qty: {item.quantity}
                                    </p>
                                </div>
                                <p className="text-gray-900 font-bold shrink-0">
                                    {formatRupiah(item.subtotal)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Total */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Total</span>
                        <span className="text-lg font-bold text-blue-600">
                            {formatRupiah(order.total_amount)}
                        </span>
                    </div>
                </div>

                {/* Info delivered */}
                {order.status === "delivered" && order.delivered_at && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                        <p className="text-sm text-green-700 font-medium">
                            Pesanan dikirim pada {order.delivered_at}
                        </p>
                    </div>
                )}

                {/* Tombol Bayar Sekarang — kalau pending */}
                {isPending && (
                    <Link
                        href={`/checkout/${order.invoice_number}/payment`}
                        className="block w-full text-center bg-blue-600 text-white text-sm font-semibold px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Bayar Sekarang
                    </Link>
                )}
            </div>
        </StorefrontLayout>
    );
}
