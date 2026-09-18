import StorefrontLayout from "@/Layouts/StorefrontLayout";
import ProductCard from "@/Components/ProductCard";
import { Head } from "@inertiajs/react";

export default function Index({ products }) {
    return (
        <StorefrontLayout>
            <Head title="Produk" />

            {/* Hero / Title */}
            <div className="mb-5 md:mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    Semua Produk
                </h1>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                    {products.length} produk tersedia
                </p>
            </div>

            {/* Grid Produk */}
            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <p className="text-sm">Belum ada produk tersedia.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </StorefrontLayout>
    );
}
