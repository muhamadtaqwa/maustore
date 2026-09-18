import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Loader2 } from "lucide-react";

const emptyVariant = {
    name: "",
    duration: "",
    account_type: "",
    price: "",
    stock: 0,
    delivery_type: "account",
    delivery_content: "",
    is_active: true,
};

export default function Create({ categories }) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        slug: "",
        description: "",
        image: null,
        is_active: true,
        categories: [],
        variants: [{ ...emptyVariant }],
    });

    const handleNameChange = (value) => {
        setData("name", value);
        setData(
            "slug",
            value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, ""),
        );
    };

    const addVariant = () => {
        setData("variants", [...data.variants, { ...emptyVariant }]);
    };

    const removeVariant = (idx) => {
        setData(
            "variants",
            data.variants.filter((_, i) => i !== idx),
        );
    };

    const updateVariant = (idx, key, value) => {
        const updated = [...data.variants];
        updated[idx][key] = value;
        setData("variants", updated);
    };

    const toggleCategory = (id) => {
        const cats = data.categories.includes(id)
            ? data.categories.filter((c) => c !== id)
            : [...data.categories, id];
        setData("categories", cats);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/dashboard/products");
    };

    return (
        <AdminLayout title="Tambah Produk">
            <Head title="Tambah Produk - Admin" />

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                {/* Info Produk */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">
                        Informasi Produk
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Nama Produk *
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    handleNameChange(e.target.value)
                                }
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                                required
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Slug *
                            </label>
                            <input
                                type="text"
                                value={data.slug}
                                onChange={(e) =>
                                    setData("slug", e.target.value)
                                }
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-mono"
                                required
                            />
                            {errors.slug && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.slug}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Deskripsi
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            rows={3}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                        />
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Gambar
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setData("image", e.target.files[0])
                            }
                            className="w-full text-sm"
                        />
                        {errors.image && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.image}
                            </p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kategori
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                                        data.categories.includes(cat.id)
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="flex items-center gap-2 mt-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) =>
                                setData("is_active", e.target.checked)
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                            Aktifkan produk
                        </span>
                    </label>
                </div>

                {/* Varian */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-900">
                            Varian Produk
                        </h2>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                        >
                            Tambah Varian
                        </button>
                    </div>

                    {errors.variants && (
                        <p className="text-xs text-red-500 mb-3">
                            {errors.variants}
                        </p>
                    )}

                    <div className="space-y-3">
                        {data.variants.map((v, idx) => (
                            <div
                                key={idx}
                                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-gray-700">
                                        Varian #{idx + 1}
                                    </span>
                                    {data.variants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(idx)}
                                            className="bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded hover:bg-red-700 transition"
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Nama varian *"
                                        value={v.name}
                                        onChange={(e) =>
                                            updateVariant(
                                                idx,
                                                "name",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-sm"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Durasi (contoh: 1 Bulan)"
                                        value={v.duration}
                                        onChange={(e) =>
                                            updateVariant(
                                                idx,
                                                "duration",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Tipe akun (Private/Sharing)"
                                        value={v.account_type}
                                        onChange={(e) =>
                                            updateVariant(
                                                idx,
                                                "account_type",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-sm"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Harga *"
                                        value={v.price}
                                        onChange={(e) =>
                                            updateVariant(
                                                idx,
                                                "price",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-sm"
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Stok *"
                                        value={v.stock}
                                        onChange={(e) =>
                                            updateVariant(
                                                idx,
                                                "stock",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-sm"
                                        required
                                    />
                                    <select
                                        value={v.delivery_type}
                                        onChange={(e) =>
                                            updateVariant(
                                                idx,
                                                "delivery_type",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-sm"
                                    >
                                        <option value="account">Akun</option>
                                        <option value="link">Link</option>
                                    </select>
                                </div>

                                <textarea
                                    placeholder="Isi pengiriman (link / email:pass)"
                                    value={v.delivery_content}
                                    onChange={(e) =>
                                        updateVariant(
                                            idx,
                                            "delivery_content",
                                            e.target.value,
                                        )
                                    }
                                    rows={2}
                                    className="w-full mt-3 px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:bg-gray-300"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan Produk"
                        )}
                    </button>
                    <Link
                        href="/dashboard/products"
                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition text-center"
                    >
                        Batal
                    </Link>
                </div>
            </form>
        </AdminLayout>
    );
}
