import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import { useState } from "react";

const statusColors = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    paid: "bg-green-50 text-green-700 border-green-200",
    delivered: "bg-blue-50 text-blue-700 border-blue-200",
    expired: "bg-gray-50 text-gray-700 border-gray-200",
    failed: "bg-red-50 text-red-700 border-red-200",
};

const statusLabels = {
    pending: "Pending",
    paid: "Paid",
    delivered: "Delivered",
    expired: "Expired",
    failed: "Failed",
};

export default function Show({ order }) {
    const [copied, setCopied] = useState(false);

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

    return (
        <AdminLayout title={`Order ${order.invoice_number}`}>
            <Head title={`Order ${order.invoice_number} - Admin`} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Kolom Kiri */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Info Order */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">
                                    No. Invoice
                                </p>
                                <div className="flex items-center gap-2">
                                    <p className="font-mono text-base font-bold text-gray-900">
                                        {order.invoice_number}
                                    </p>
                                    <button
                                        onClick={copyInvoice}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        {copied ? "Tersalin" : "Salin"}
                                    </button>
                                </div>
                            </div>
                            <span
                                className={`text-xs px-3 py-1.5 rounded-full border font-medium ${statusColors[order.status]}`}
                            >
                                {statusLabels[order.status]}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs">
                            <div>
                                <p className="text-gray-500">Dibuat</p>
                                <p className="font-medium text-gray-900 mt-0.5">
                                    {order.created_at}
                                </p>
                            </div>
                            {order.paid_at && (
                                <div>
                                    <p className="text-gray-500">Dibayar</p>
                                    <p className="font-medium text-gray-900 mt-0.5">
                                        {order.paid_at}
                                    </p>
                                </div>
                            )}
                            {order.delivered_at && (
                                <div>
                                    <p className="text-gray-500">Dikirim</p>
                                    <p className="font-medium text-gray-900 mt-0.5">
                                        {order.delivered_at}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Item + Delivery Content */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
                        <h2 className="text-sm font-semibold text-gray-900 mb-3">
                            Item Pesanan
                        </h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                                >
                                    <div className="flex justify-between gap-3 text-sm mb-2">
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {item.product_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {item.variant_name}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {formatRupiah(item.price)} ×{" "}
                                                {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-bold text-gray-900 shrink-0">
                                            {formatRupiah(item.subtotal)}
                                        </p>
                                    </div>

                                    {item.delivery_content && (
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mt-2">
                                            <p className="text-[10px] text-gray-500 font-medium mb-1 uppercase tracking-wide">
                                                Konten Produk
                                            </p>
                                            <pre className="text-xs text-gray-900 whitespace-pre-wrap font-mono break-all">
                                                {item.delivery_content}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="pt-3 mt-3 border-t-2 border-gray-100 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                                Total
                            </span>
                            <span className="text-lg font-bold text-blue-600">
                                {formatRupiah(order.total_amount)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan */}
                <div className="space-y-4">
                    {/* Customer */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
                        <h2 className="text-sm font-semibold text-gray-900 mb-3">
                            Customer
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div>
                                <p className="text-xs text-gray-500">No. HP</p>
                                <p className="font-medium text-gray-900">
                                    {order.customer.phone}
                                </p>
                            </div>
                            {order.customer.email && (
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Email
                                    </p>
                                    <p className="font-medium text-gray-900 break-all">
                                        {order.customer.email}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tombol Kembali — full width */}
            <Link
                href="/dashboard/orders"
                className="block w-full text-center bg-blue-600 text-white text-sm font-semibold px-4 py-3 rounded-lg hover:bg-blue-700 transition"
            >
                Kembali ke Pesanan
            </Link>
        </AdminLayout>
    );
}
