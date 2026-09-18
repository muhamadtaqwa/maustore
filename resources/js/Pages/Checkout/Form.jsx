import StorefrontLayout from "@/Layouts/StorefrontLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Loader2 } from "lucide-react";

export default function Form({ product, variant }) {
    const { data, setData, post, processing, errors } = useForm({
        product_id: product.id,
        variant_id: variant.id,
        phone: "",
    });

    const formatRupiah = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/checkout");
    };

    return (
        <StorefrontLayout>
            <Head title="Checkout" />

            {/* Back link */}
            <Link
                href={`/produk/${product.slug}`}
                className="inline-block text-sm text-gray-500 hover:text-blue-600 mb-4 transition"
            >
                Kembali
            </Link>

            <div className="max-w-lg mx-auto">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                    Konfirmasi Pesanan
                </h1>

                {/* Ringkasan Produk */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                    <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            {product.image ? (
                                <img
                                    src={`/storage/${product.image}`}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                                    No Img
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {product.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {variant.name}
                            </p>
                            <p className="text-sm font-bold text-blue-600 mt-2">
                                {formatRupiah(variant.price)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl border border-gray-200 p-4"
                >
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">
                        Data Pembeli
                    </h2>

                    {/* No HP */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            No. WhatsApp
                        </label>
                        <input
                            type="tel"
                            inputMode="tel"
                            placeholder="08123456789"
                            value={data.phone}
                            onChange={(e) => setData("phone", e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                            required
                        />
                        {errors.phone && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    {/* Total */}
                    <div className="pt-4 border-t border-gray-200 mb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Total Bayar
                            </span>
                            <span className="text-lg font-bold text-blue-600">
                                {formatRupiah(variant.price)}
                            </span>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            "Lanjut Bayar"
                        )}
                    </button>
                </form>
            </div>
        </StorefrontLayout>
    );
}
