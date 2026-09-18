import StorefrontLayout from "@/Layouts/StorefrontLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

export default function Show({ product }) {
    const [selectedVariant, setSelectedVariant] = useState(
        product.variants.length > 0 ? product.variants[0] : null,
    );

    const formatRupiah = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);

    const handleBuy = () => {
        if (!selectedVariant) return;
        router.get(`/checkout/${product.slug}`, {
            variant: selectedVariant.id,
        });
    };

    return (
        <StorefrontLayout>
            <Head title={product.name} />

            {/* Back link */}
            <Link
                href="/produk"
                className="inline-block text-sm text-gray-500 hover:text-blue-600 mb-4 transition"
            >
                Kembali ke produk
            </Link>

            {/* Header: Gambar (kiri) + Info (kanan) */}
            <div className="flex gap-3 md:gap-4 mb-5">
                {/* Gambar */}
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
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

                {/* Info */}
                <div className="flex-1 min-w-0">
                    {/* Kategori */}
                    {product.categories?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                            {product.categories.map((cat) => (
                                <span
                                    key={cat.id}
                                    className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium"
                                >
                                    {cat.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Nama */}
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                        {product.name}
                    </h1>

                    {/* Deskripsi */}
                    {product.description && (
                        <p className="text-xs md:text-sm text-gray-600 mt-1 leading-relaxed">
                            {product.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Pilih Varian */}
            <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Pilih Varian
                </label>

                {product.variants.length === 0 ? (
                    <p className="text-sm text-red-500">Stok habis</p>
                ) : (
                    <div className="grid grid-cols-1 gap-2">
                        {product.variants.map((variant) => {
                            const isSelected =
                                selectedVariant?.id === variant.id;
                            const isOutOfStock = variant.stock <= 0;
                            return (
                                <button
                                    key={variant.id}
                                    type="button"
                                    onClick={() =>
                                        !isOutOfStock &&
                                        setSelectedVariant(variant)
                                    }
                                    disabled={isOutOfStock}
                                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition text-left ${
                                        isSelected
                                            ? "border-blue-600 bg-blue-50"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                    } ${
                                        isOutOfStock
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {variant.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Stok: {variant.stock}
                                        </p>
                                    </div>
                                    <p className="text-sm font-bold text-blue-600 shrink-0 ml-2">
                                        {formatRupiah(variant.price)}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Total + Beli */}
            {selectedVariant && (
                <div className="pt-5 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500">Total</span>
                        <span className="text-xl font-bold text-blue-600">
                            {formatRupiah(selectedVariant.price)}
                        </span>
                    </div>

                    <button
                        onClick={handleBuy}
                        disabled={selectedVariant.stock <= 0}
                        className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Beli Sekarang
                    </button>
                </div>
            )}
        </StorefrontLayout>
    );
}
