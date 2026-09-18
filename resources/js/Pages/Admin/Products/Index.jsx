import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

export default function Index({ products }) {
    const [search, setSearch] = useState("");

    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
    );

    const formatRupiah = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value || 0);

    const handleDelete = (id, name) => {
        if (confirm(`Hapus produk "${name}"?`)) {
            router.delete(`/dashboard/products/${id}`);
        }
    };

    return (
        <AdminLayout title="Produk">
            <Head title="Produk - Admin" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Produk</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {products.length} produk terdaftar
                    </p>
                </div>
                <Link
                    href="/dashboard/products/create"
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                    Tambah Produk
                </Link>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-200 mb-4">
                <div className="p-3 border-b border-gray-100">
                    <input
                        type="text"
                        placeholder="Cari produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    />
                </div>

                {/* List */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <p className="text-sm">
                            {search
                                ? "Produk tidak ditemukan"
                                : "Belum ada produk"}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filtered.map((product) => (
                            <div
                                key={product.id}
                                className="p-3 hover:bg-gray-50 transition"
                            >
                                {/* Baris 1: Kategori (kiri) + Edit/Hapus (kanan) */}
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    {/* Kiri: Kategori */}
                                    <div className="flex flex-wrap gap-1 min-w-0">
                                        {product.categories.length > 0 ? (
                                            product.categories.map((c) => (
                                                <span
                                                    key={c.id}
                                                    className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium"
                                                >
                                                    {c.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] text-gray-400 italic">
                                                Tanpa kategori
                                            </span>
                                        )}
                                        {!product.is_active && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                                                Nonaktif
                                            </span>
                                        )}
                                    </div>

                                    {/* Kanan: Edit + Hapus */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Link
                                            href={`/dashboard/products/${product.id}/edit`}
                                            className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    product.id,
                                                    product.name,
                                                )
                                            }
                                            className="bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-700 transition"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>

                                {/* Baris 2: Nama Produk */}
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                    {product.name}
                                </h3>

                                {/* Baris 3+: Varian */}
                                <div className="space-y-1">
                                    {product.variants.map((v) => (
                                        <div
                                            key={v.id}
                                            className="flex items-center justify-between gap-2 text-xs"
                                        >
                                            <span className="text-gray-700 truncate min-w-0">
                                                • {v.name}
                                            </span>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="font-semibold text-blue-600">
                                                    {formatRupiah(v.price)}
                                                </span>
                                                <span
                                                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                                        v.stock > 0
                                                            ? "bg-green-50 text-green-600"
                                                            : "bg-red-50 text-red-600"
                                                    }`}
                                                >
                                                    Stok: {v.stock}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
