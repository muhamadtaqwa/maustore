import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const statusColors = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    paid: "bg-green-50 text-green-700 border-green-200",
    delivered: "bg-blue-50 text-blue-700 border-blue-200",
    expired: "bg-gray-50 text-gray-700 border-gray-200",
    failed: "bg-red-50 text-red-700 border-red-200",
};

const statusLabels = {
    pending: "Pending",
    paid: "Paid",
    delivered: "Delivered",
    expired: "Expired",
    failed: "Failed",
};

export default function Index({ orders, stats, filters }) {
    const [search, setSearch] = useState(filters.search || "");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const formatRupiah = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value || 0);

    // Tutup dropdown kalau klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const applyFilter = (status) => {
        setDropdownOpen(false);
        router.get(
            "/dashboard/orders",
            { status, search },
            { preserveState: true },
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            "/dashboard/orders",
            { status: filters.status, search },
            { preserveState: true },
        );
    };

    const activeStatusLabel =
        filters.status === "all"
            ? "Semua"
            : statusLabels[filters.status] || "Semua";

    const statusOptions = [
        { value: "all", label: `Semua (${stats.all})` },
        { value: "pending", label: `Pending (${stats.pending})` },
        { value: "paid", label: `Paid (${stats.paid})` },
        { value: "delivered", label: `Delivered (${stats.delivered})` },
        { value: "expired", label: `Expired (${stats.expired})` },
        { value: "failed", label: `Failed (${stats.failed})` },
    ];

    return (
        <AdminLayout title="Pesanan">
            <Head title="Pesanan - Admin" />

            {/* Header */}
            <div className="mb-5">
                <h1 className="text-xl font-bold text-gray-900">Pesanan</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    Kelola pesanan customer
                </p>
            </div>

            {/* Search + Filter Dropdown */}
            <div className="flex gap-2 mb-4">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari invoice / no HP / email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white"
                        />
                    </div>
                </form>

                {/* Dropdown Filter */}
                <div className="relative shrink-0" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="h-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:border-blue-400 transition inline-flex items-center gap-2"
                    >
                        {activeStatusLabel}
                        <svg
                            className={`w-3.5 h-3.5 transition-transform ${
                                dropdownOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-30 overflow-hidden">
                            {statusOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => applyFilter(opt.value)}
                                    className={`w-full text-left px-3 py-2 text-sm transition border-b border-gray-100 last:border-0 ${
                                        filters.status === opt.value
                                            ? "bg-blue-50 text-blue-600 font-medium"
                                            : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-200">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <p className="text-sm">Belum ada pesanan</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="p-3 hover:bg-gray-50 transition"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Link
                                                href={`/dashboard/orders/${order.id}`}
                                                className="font-mono text-sm font-bold text-gray-900 hover:text-blue-600"
                                            >
                                                {order.invoice_number}
                                            </Link>
                                            <span
                                                className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColors[order.status]}`}
                                            >
                                                {statusLabels[order.status]}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {order.customer.phone} •{" "}
                                            {order.created_at}
                                        </p>
                                        <p className="text-sm font-bold text-blue-600 mt-1">
                                            {formatRupiah(order.total_amount)}
                                        </p>
                                    </div>

                                    <Link
                                        href={`/dashboard/orders/${order.id}`}
                                        className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition shrink-0"
                                    >
                                        Lihat
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
