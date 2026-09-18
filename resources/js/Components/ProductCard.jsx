import { Link } from "@inertiajs/react";

export default function ProductCard({ product }) {
    const formatRupiah = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);

    // Total stok semua varian
    const totalStock =
        product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;

    return (
        <Link
            href={`/produk/${product.slug}`}
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
        >
            {/* Image */}
            <div className="aspect-square bg-gray-100 overflow-hidden">
                {product.image ? (
                    <img
                        src={`/storage/${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                        No Img
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col gap-1.5">
                {/* Baris 1: Kategori (kiri) + Stok (kanan) */}
                <div className="flex items-center justify-between gap-2 min-h-[1.25rem]">
                    {/* Kiri: Kategori */}
                    <div className="flex flex-wrap gap-1 min-w-0">
                        {product.categories?.slice(0, 1).map((cat) => (
                            <span
                                key={cat.id}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium truncate"
                            >
                                {cat.name}
                            </span>
                        ))}
                    </div>

                    {/* Kanan: Stok */}
                    <span
                        className={`text-[10px] font-medium shrink-0 ${
                            totalStock > 0 ? "text-gray-500" : "text-red-500"
                        }`}
                    >
                        {totalStock > 0 ? `Stok: ${totalStock}` : "Habis"}
                    </span>
                </div>

                {/* Baris 2: Judul */}
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] leading-snug">
                    {product.name}
                </h3>

                {/* Baris 3: Label kiri, Harga kanan */}
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-gray-400 font-medium">
                        Start from
                    </span>
                    <span className="text-sm font-bold text-blue-600 shrink-0">
                        {product.min_price
                            ? formatRupiah(product.min_price)
                            : "-"}
                    </span>
                </div>
            </div>
        </Link>
    );
}
