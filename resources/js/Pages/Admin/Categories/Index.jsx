import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

export default function Index({ categories }) {
    const [search, setSearch] = useState("");

    const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
    );

    const handleDelete = (id, name) => {
        if (confirm(`Hapus kategori "${name}"?`)) {
            router.delete(`/dashboard/categories/${id}`);
        }
    };

    return (
        <AdminLayout title="Kategori">
            <Head title="Kategori - Admin" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Kategori
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {categories.length} kategori terdaftar
                    </p>
                </div>
                <Link
                    href="/dashboard/categories/create"
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                    Tambah Kategori
                </Link>
            </div>

            {/* Search + List */}
            <div className="bg-white rounded-xl border border-gray-200 mb-4">
                <div className="p-3 border-b border-gray-100">
                    <input
                        type="text"
                        placeholder="Cari kategori..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    />
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <p className="text-sm">
                            {search
                                ? "Kategori tidak ditemukan"
                                : "Belum ada kategori"}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filtered.map((cat) => (
                            <div
                                key={cat.id}
                                className="p-3 hover:bg-gray-50 transition"
                            >
                                {/* Baris 1: Nama + Nonaktif (kiri), Edit/Hapus (kanan) */}
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                                            {cat.name}
                                        </h3>
                                        {!cat.is_active && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                                                Nonaktif
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <Link
                                            href={`/dashboard/categories/${cat.id}/edit`}
                                            className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(cat.id, cat.name)
                                            }
                                            className="bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-700 transition"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>

                                {/* Baris 2: Slug + Produk count */}
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                                    <span className="font-mono">
                                        {cat.slug}
                                    </span>
                                    <span>{cat.products_count} produk</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
