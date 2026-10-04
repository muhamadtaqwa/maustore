import StorefrontLayout from "@/Layouts/StorefrontLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import {
    Copy,
    Check,
    Upload,
    Clock,
    AlertCircle,
    CheckCircle2,
    MessageCircle,
    ExternalLink,
    Image as ImageIcon,
    RefreshCw,
} from "lucide-react";

export default function Payment({ order: initialOrder, qris }) {
    const { flash } = usePage().props;
    const [order, setOrder] = useState(initialOrder);
    const [copiedInvoice, setCopiedInvoice] = useState(false);
    const [copiedTotal, setCopiedTotal] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showReupload, setShowReupload] = useState(false);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        payment_proof: null,
    });

    const formatRupiah = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value || 0);

    const copyInvoice = () => {
        navigator.clipboard.writeText(order.invoice_number);
        setCopiedInvoice(true);
        setTimeout(() => setCopiedInvoice(false), 2000);
    };

    const copyTotalAmount = () => {
        navigator.clipboard.writeText(Math.round(order.total_amount).toString());
        setCopiedTotal(true);
        setTimeout(() => setCopiedTotal(false), 2000);
    };

    const copyDelivery = (content, idx) => {
        navigator.clipboard.writeText(content);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // Polling status setiap 5 detik jika status masih pending
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
                const result = await res.json();

                if (result.status && result.status !== order.status) {
                    setOrder((prev) => ({ ...prev, ...result }));
                } else if (result.payment_proof && result.payment_proof !== order.payment_proof) {
                    setOrder((prev) => ({ ...prev, payment_proof: result.payment_proof }));
                } else if (result.items && result.items.length > 0) {
                    setOrder((prev) => ({ ...prev, items: result.items }));
                }
            } catch (e) {
                // silent fail on network glitch
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

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("payment_proof", file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUploadProof = (e) => {
        e.preventDefault();
        if (!data.payment_proof) return;

        post(`/checkout/${order.invoice_number}/upload-proof`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setPreviewUrl(null);
                setShowReupload(false);
            },
        });
    };

    const isPending = order.status === "pending";
    const isPaid = order.status === "paid" || order.status === "delivered";
    const isExpired = order.status === "expired" || order.status === "failed";
    const hasProof = Boolean(order.payment_proof);

    // Hitung subtotal produk tanpa kode unik
    const baseAmount = order.unique_code > 0 
        ? order.total_amount - order.unique_code 
        : order.total_amount;

    return (
        <StorefrontLayout>
            <Head title="Pembayaran" />

            <div className="max-w-lg mx-auto pb-10">
                {/* Status Badge */}
                <div className="flex justify-center mb-4">
                    {isPending && (
                        hasProof ? (
                            <div className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold inline-flex items-center gap-1.5 border border-blue-200">
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                                Menunggu Verifikasi Admin
                            </div>
                        ) : !timeLeft?.expired ? (
                            <div className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold inline-flex items-center gap-1.5 border border-amber-200">
                                <Clock className="w-3.5 h-3.5" />
                                Menunggu Pembayaran
                            </div>
                        ) : (
                            <div className="px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-semibold inline-flex items-center gap-1.5 border border-red-200">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Waktu Pembayaran Habis
                            </div>
                        )
                    )}
                    {isPaid && (
                        <div className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold inline-flex items-center gap-1.5 border border-green-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Pembayaran Berhasil
                        </div>
                    )}
                    {isExpired && (
                        <div className="px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-semibold inline-flex items-center gap-1.5 border border-red-200">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Pesanan {order.status === "expired" ? "Kadaluarsa" : "Gagal"}
                        </div>
                    )}
                </div>

                <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-6">
                    {isPaid ? "Pesanan Selesai" : "Selesaikan Pembayaran"}
                </h1>

                {/* Flash Success Notification */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <p className="text-xs md:text-sm text-green-800 font-medium">
                            {flash.success}
                        </p>
                    </div>
                )}

                {/* Flash Error Notification */}
                {errors?.payment_proof && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-xs md:text-sm text-red-700 font-medium">
                            {errors.payment_proof}
                        </p>
                    </div>
                )}

                {/* Invoice & Total Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 mb-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">
                            No. Invoice
                        </span>
                        <button
                            type="button"
                            onClick={copyInvoice}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition"
                        >
                            {copiedInvoice ? (
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
                    <p className="font-mono text-sm md:text-base font-bold text-gray-900 mb-4 tracking-wider">
                        {order.invoice_number}
                    </p>

                    <div className="pt-3 border-t border-gray-100 space-y-2">
                        {order.unique_code > 0 && isPending && (
                            <>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Subtotal Produk</span>
                                    <span>{formatRupiah(baseAmount)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                                    <span className="font-medium">Kode Unik Verifikasi</span>
                                    <span className="font-mono font-bold">+{order.unique_code}</span>
                                </div>
                            </>
                        )}

                        <div className="flex items-center justify-between pt-1">
                            <div>
                                <span className="text-xs font-medium text-gray-500 block">
                                    Total yang Harus Ditransfer
                                </span>
                                {order.unique_code > 0 && isPending && (
                                    <span className="text-[11px] text-red-500 font-semibold block">
                                        *Wajib transfer pas hingga 3 digit terakhir
                                    </span>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1.5 justify-end">
                                    <span className="text-xl md:text-2xl font-black text-blue-600 font-mono">
                                        {formatRupiah(order.total_amount)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={copyTotalAmount}
                                        title="Salin total transfer"
                                        className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition"
                                    >
                                        {copiedTotal ? (
                                            <Check className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {copiedTotal && (
                                    <span className="text-[10px] text-green-600 font-medium block">
                                        Nominal tersalin!
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Countdown Timer */}
                    {isPending && timeLeft && !timeLeft.expired && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    Batas waktu pembayaran:
                                </span>
                                <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                    {String(timeLeft.minutes).padStart(2, "0")}:
                                    {String(timeLeft.seconds).padStart(2, "0")}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ==================== PAID: TAMPIL PRODUK ==================== */}
                {isPaid && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 md:p-5 mb-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <h2 className="text-sm md:text-base font-bold text-green-800">
                                Detail Pesanan & Akun Anda
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {order.items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white rounded-lg p-3 md:p-4 border border-green-200 shadow-xs"
                                >
                                    <p className="text-sm font-bold text-gray-900 mb-0.5">
                                        {item.product_name}
                                    </p>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Varian: {item.variant_name}
                                    </p>

                                    {item.delivery_content ? (
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className="text-xs font-semibold text-gray-700">
                                                    Data Akun / Konten Produk:
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        copyDelivery(
                                                            item.delivery_content,
                                                            idx,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    {copiedIndex === idx ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 text-green-600" />
                                                            <span className="text-green-600">Tersalin</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3.5 h-3.5" />
                                                            <span>Salin Data</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <pre className="text-xs text-gray-900 whitespace-pre-wrap font-mono break-all bg-white p-2.5 rounded border border-gray-200">
                                                {item.delivery_content}
                                            </pre>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 italic bg-gray-50 p-2.5 rounded">
                                            Detail produk akan dikirim segera oleh admin.
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ==================== PENDING: QRIS & CARA BAYAR ==================== */}
                {isPending && (!timeLeft?.expired || hasProof) && (
                    <>
                        {/* Box QRIS Statis */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 mb-4 text-center shadow-sm">
                            <h2 className="text-sm font-bold text-gray-900 mb-1">
                                Scan QRIS untuk Pembayaran
                            </h2>
                            <p className="text-xs text-gray-500 mb-4">
                                {qris?.merchant_name || "MauStore"}
                            </p>

                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 max-w-xs mx-auto mb-3">
                                <img
                                    src={qris?.image_url || "/images/qris-placeholder.svg"}
                                    alt="QRIS Pembayaran"
                                    className="w-full max-w-[280px] mx-auto rounded-lg shadow-xs object-contain"
                                />
                            </div>

                            <div className="flex justify-center mb-3">
                                <a
                                    href={qris?.image_url || "/images/qris-placeholder.svg"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Buka / Simpan Gambar QRIS
                                </a>
                            </div>

                            <p className="text-xs text-gray-500 bg-gray-50 py-2 px-3 rounded-lg border border-gray-100">
                                Mendukung semua aplikasi perbankan & e-wallet:
                                <br />
                                <span className="font-semibold text-gray-700">
                                    BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay, Seabank
                                </span>
                            </p>
                        </div>

                        {/* Box Upload Bukti Pembayaran */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 mb-4 shadow-sm">
                            <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <Upload className="w-4 h-4 text-blue-600" />
                                Konfirmasi Bukti Transfer
                            </h2>
                            <p className="text-xs text-gray-500 mb-4">
                                Unggah screenshot bukti pembayaran agar pesanan segera diproses.
                            </p>

                            {/* Tampilan jika sudah pernah upload bukti */}
                            {hasProof && !showReupload && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 mb-4">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                            <span className="text-xs font-semibold text-blue-800">
                                                Bukti Pembayaran Sudah Diunggah
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowReupload(true)}
                                            className="text-xs text-blue-700 hover:text-blue-900 font-medium underline inline-flex items-center gap-1"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                            Ganti Foto
                                        </button>
                                    </div>
                                    <div className="mt-2 rounded-md overflow-hidden border border-blue-100 max-w-[200px]">
                                        <a href={order.payment_proof} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={order.payment_proof}
                                                alt="Bukti Pembayaran"
                                                className="w-full h-28 object-cover hover:opacity-90 transition"
                                            />
                                        </a>
                                    </div>
                                    <p className="text-[11px] text-blue-600 mt-2">
                                        Sedang diverifikasi oleh admin. Jika mendesak, silakan klik tombol WhatsApp di bawah.
                                    </p>
                                </div>
                            )}

                            {/* Form Upload Bukti */}
                            {(!hasProof || showReupload) && (
                                <form onSubmit={handleUploadProof} className="space-y-3">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition bg-gray-50 hover:bg-blue-50/30"
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />

                                        {previewUrl ? (
                                            <div className="space-y-2">
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview Bukti"
                                                    className="max-h-40 mx-auto rounded-lg border border-gray-200 object-contain"
                                                />
                                                <p className="text-xs text-blue-600 font-medium">
                                                    Klik untuk memilih gambar lain
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1.5 py-2">
                                                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
                                                <p className="text-xs font-semibold text-gray-700">
                                                    Pilih Foto Bukti Transfer
                                                </p>
                                                <p className="text-[11px] text-gray-400">
                                                    PNG, JPG, JPEG atau WEBP (Maks 4 MB)
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        {showReupload && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowReupload(false);
                                                    setPreviewUrl(null);
                                                    reset();
                                                }}
                                                className="px-3 py-2.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100"
                                            >
                                                Batal
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={!data.payment_proof || processing}
                                            className="flex-1 bg-blue-600 disabled:bg-gray-300 text-white text-xs md:text-sm font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xs"
                                        >
                                            <Upload className="w-4 h-4" />
                                            {processing ? "Mengunggah..." : "Kirim Bukti Pembayaran"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Box Konfirmasi WhatsApp */}
                        {qris?.whatsapp_url && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 shadow-sm">
                                <h2 className="text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
                                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                                    Mau Proses Lebih Cepat?
                                </h2>
                                <p className="text-xs text-emerald-700 mb-3">
                                    Konfirmasi langsung ke admin melalui WhatsApp dengan invoice Anda.
                                </p>
                                <a
                                    href={qris.whatsapp_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition shadow-xs"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Konfirmasi via WhatsApp
                                </a>
                            </div>
                        )}
                    </>
                )}

                {/* Expired State */}
                {isExpired && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-center">
                        <h2 className="text-sm font-bold text-red-700 mb-1">
                            Pesanan Kadaluarsa
                        </h2>
                        <p className="text-xs text-red-600 mb-3">
                            Waktu pembayaran telah habis. Silakan buat pesanan baru.
                        </p>
                        <Link
                            href="/produk"
                            className="inline-block text-xs bg-red-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                            Belanja Lagi
                        </Link>
                    </div>
                )}

                {/* Tombol Cek Pesanan */}
                <Link
                    href="/cek-pesanan"
                    className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs md:text-sm font-semibold px-4 py-3 rounded-lg transition"
                >
                    Cek Status Pesanan Lain
                </Link>
            </div>
        </StorefrontLayout>
    );
}
