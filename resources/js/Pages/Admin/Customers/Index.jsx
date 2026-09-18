import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";

export default function Index({ customers }) {
    const [search, setSearch] = useState("");

    const filtered = customers.filter(
        (c) =>
            c.phone.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase()) ||
            (c.name && c.name.toLowerCase().includes(search.toLowerCase())),
    );

    const formatRupiah = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value || 0);

    return (
        <AdminLayout title="Customer">
            <Head title="Customer - Admin" />

            {/* Header */}
            <div className="mb-5">
                <h1 className="text-xl font-bold text-gray-900">Customer</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    {customers.length} customer terdaftar
                </p>
            </div>

            {/* Search + List */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-3 border-b border-gray-100">
                    <input
                        type="text"
                        placeholder="Cari nama / no HP / email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    />
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <p className="text-sm">
                            {search
                                ? "Customer tidak ditemukan"
                                : "Belum ada customer"}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filtered.map((customer) => (
                            <div
                                key={customer.id}
                                className="p-3 hover:bg-gray-50 transition"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    {/* Kiri: Nama + HP/Email */}
                                    <div className="flex-1 min-w-0">
                                        {customer.name && (
                                            <h3 className="text-sm font-semibold text-gray-900 truncate mb-0.5">
                                                {customer.name}
                                            </h3>
                                        )}
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                                            <span>{customer.phone}</span>
                                            <span className="truncate">
                                                {customer.email}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Kanan: Order count + Total */}
                                    <div className="text-right shrink-0">
                                        <p className="text-xs text-gray-500">
                                            {customer.orders_count} order
                                        </p>
                                        {customer.total_spent > 0 && (
                                            <p className="text-sm font-bold text-blue-600">
                                                {formatRupiah(
                                                    customer.total_spent,
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
