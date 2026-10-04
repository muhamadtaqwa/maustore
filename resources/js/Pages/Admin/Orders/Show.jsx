import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import {
    CheckCircle,
    CheckCircle2,
    Truck,
    ExternalLink,
    AlertCircle,
    Clock,
    Copy,
    Check,
} from "lucide-react";

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
    const [isVerifying, setIsVerifying] = useState(false);
    const [isDelivering, setIsDelivering] = useState(false);

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

    const handleVerify = () => {
        if (
            confirm(
                `Apakah Anda yakin ingin memverifikasi pembayaran untuk invoice ${order.invoice_number} sebesar ${formatRupiah(
                    order.total_amount,
                )}?`,
            )
        ) {
            setIsVerifying(true);
            router.post(
                `/dashboard/orders/${order.id}/verify`,
                {},
                {
                    onFinish: () => setIsVerifying(false),
                },
            );
        }
    };

    const handleDeliver = () => {
        if (
            confirm(
                `Tandai pesanan ${order.invoice_number} sebagai sudah terkirim (Delivered)?`,
            )
        ) {
            setIsDelivering(true);
            router.post(
                `/dashboard/orders/${order.id}/deliver`,
                {},
                {
                    onFinish: () => setIsDelivering(false),
                },
            );
        }
    };

    const baseAmount =
        order.unique_code > 0
            ? order.total_amount - order.unique_code
            : order.total_amount;

    return (
        <AdminLayout title={`Order ${order.invoice_number}`}>
            <Head title={`Order ${order.invoice_number} - Admin`} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                {/* Kolom Kiri */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Info Order */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-xs">
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
                                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-green-600" />
                                                <span className="text-green-600">Tersalin</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>Salin</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <span
                                className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${statusColors[order.status]}`}
                            >
                                {statusLabels[order.status]}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-xs">
                            <div>
                                <p className="text-gray-500">Dibuat</p>
                                <p className="font-medium text-gray-900 mt-0.5">
                                    {order.created_at}
                                </p>
                            </div>
                            {order.paid_at && (
                                <div>
                                    <p className="text-gray-500">Dibayar</p>
                                    <p className="font-medium text-green-700 mt-0.5">
                                        {order.paid_at}
                                    </p>
                                </div>
                            )}
                            {order.delivered_at && (
                                <div>
                                    <p className="text-gray-500">Dikirim</p>
                                    <p className="font-medium text-blue-700 mt-0.5">
                                        {order.delivered_at}
                                    </p>
                                </div>
                            )}
                            {order.verified_by && (
                                <div>
                                    <p className="text-gray-500">Diverifikasi oleh</p>
                                    <p className="font-medium text-gray-900 mt-0.5">
                                        {order.verified_by}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Item + Delivery Content */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-xs">
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
                                            <p className="font-semibold text-gray-900 truncate">
                                                {item.product_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Varian: {item.variant_name}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {formatRupiah(item.price)} ×{" "}
                                                {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-bold text-gray-900 shrink-0 font-mono">
                                            {formatRupiah(item.subtotal)}
                                        </p>
                                    </div>

                                    {item.delivery_content && (
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mt-2">
                                            <p className="text-[10px] text-gray-500 font-semibold mb-1 uppercase tracking-wide">
                                                Konten / Akun Produk (Snapshot)
                                            </p>
                                            <pre className="text-xs text-gray-900 whitespace-pre-wrap font-mono break-all bg-white p-2 rounded border border-gray-200">
                                                {item.delivery_content}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Rincian Harga & Kode Unik */}
                        <div className="pt-4 mt-3 border-t border-gray-100 space-y-2">
                            {order.unique_code > 0 && (
                                <>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Subtotal Produk</span>
                                        <span>{formatRupiah(baseAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                                        <span className="font-medium">Kode Unik</span>
                                        <span className="font-mono font-bold">+{order.unique_code}</span>
                                    </div>
                                </>
                            )}
                            <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                                <div>
                                    <span className="text-sm font-semibold text-gray-700 block">
                                        Total Pembayaran
                                    </span>
                                    {order.unique_code > 0 && (
                                        <span className="text-[11px] text-gray-400">
                                            Cocokkan dengan mutasi rekening/QRIS
                                        </span>
                                    )}
                                </div>
                                <span className="text-xl font-black text-blue-600 font-mono">
                                    {formatRupiah(order.total_amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan */}
                <div className="space-y-4">
                    {/* Kotak Tindakan / Verifikasi Pembayaran */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-xs">
                        <h2 className="text-sm font-semibold text-gray-900 mb-3">
                            Aksi Pesanan
                        </h2>

                        {order.status === "pending" && (
                            <div className="space-y-2.5">
                                <button
                                    onClick={handleVerify}
                                    disabled={isVerifying}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold text-sm py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow-xs"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    {isVerifying
                                        ? "Memproses..."
                                        : "Verifikasi Pembayaran (Lunas)"}
                                </button>
                                <p className="text-[11px] text-gray-500 text-center">
                                    Klik tombol ini setelah memeriksa mutasi rekening Anda.
                                </p>
                            </div>
                        )}

                        {order.status === "paid" && (
                            <div className="space-y-2.5">
                                <div className="bg-emerald-50 text-emerald-800 text-xs p-2.5 rounded-lg border border-emerald-200 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>Pembayaran telah lunas</span>
                                </div>
                                <button
                                    onClick={handleDeliver}
                                    disabled={isDelivering}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-sm py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                                >
                                    <Truck className="w-4 h-4" />
                                    {isDelivering
                                        ? "Memproses..."
                                        : "Tandai Sudah Dikirim"}
                                </button>
                            </div>
                        )}

                        {order.status === "delivered" && (
                            <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-200 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                <span>Pesanan telah selesai & terkirim ke customer.</span>
                            </div>
                        )}

                        {order.status === "expired" && (
                            <div className="bg-red-50 text-red-800 text-xs p-3 rounded-lg border border-red-200 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                <span>Pesanan telah kadaluarsa.</span>
                            </div>
                        )}
                    </div>

                    {/* Bukti Pembayaran */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-gray-900">
                                Bukti Pembayaran
                            </h2>
                            {order.payment_proof && (
                                <a
                                    href={order.payment_proof}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Buka Penuh
                                </a>
                            )}
                        </div>

                        {order.payment_proof ? (
                            <div className="space-y-2">
                                <a
                                    href={order.payment_proof}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block rounded-lg overflow-hidden border border-gray-200 hover:opacity-95 transition"
                                >
                                    <img
                                        src={order.payment_proof}
                                        alt="Bukti Transfer"
                                        className="w-full max-h-56 object-contain bg-gray-50"
                                    />
                                </a>
                                <p className="text-[11px] text-gray-500 text-center">
                                    Klik gambar untuk melihat resolusi asli.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-4 text-center border border-dashed border-gray-200">
                                <Clock className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
                                <p className="text-xs text-gray-500 font-medium">
                                    Belum ada bukti pembayaran
                                </p>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    Customer belum mengunggah screenshot bukti transfer.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Customer Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-xs">
                        <h2 className="text-sm font-semibold text-gray-900 mb-3">
                            Customer
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div>
                                <p className="text-xs text-gray-500">No. WhatsApp / HP</p>
                                <div className="flex items-center justify-between mt-0.5">
                                    <p className="font-semibold text-gray-900">
                                        {order.customer.phone}
                                    </p>
                                    <a
                                        href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, "").replace(/^0/, "62")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
                                    >
                                        Chat WA
                                    </a>
                                </div>
                            </div>
                            {order.customer.email && (
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900 break-all mt-0.5">
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
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-3 rounded-lg transition"
            >
                Kembali ke Daftar Pesanan
            </Link>
        </AdminLayout>
    );
}
