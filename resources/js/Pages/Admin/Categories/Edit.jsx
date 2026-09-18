import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Loader2 } from "lucide-react";

export default function Edit({ category }) {
    const { data, setData, post, processing, errors } = useForm({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        is_active: category.is_active,
        _method: "PUT",
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

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/dashboard/categories/${category.id}`);
    };

    return (
        <AdminLayout title="Edit Kategori">
            <Head title={`Edit ${category.name} - Admin`} />

            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 mb-6"
            >
                <h2 className="text-sm font-semibold text-gray-900 mb-4">
                    Informasi Kategori
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Nama Kategori *
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => handleNameChange(e.target.value)}
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
                            onChange={(e) => setData("slug", e.target.value)}
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
                        onChange={(e) => setData("description", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    />
                </div>

                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData("is_active", e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                        Aktifkan kategori
                    </span>
                </label>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
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
                            "Update Kategori"
                        )}
                    </button>
                    <Link
                        href="/dashboard/categories"
                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition text-center"
                    >
                        Batal
                    </Link>
                </div>
            </form>
        </AdminLayout>
    );
}
