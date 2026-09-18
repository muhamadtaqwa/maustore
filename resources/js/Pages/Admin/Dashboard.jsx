import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import {
    TrendingUp,
    ShoppingCart,
    Clock,
    Users,
    Banknote,
    Package,
} from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const statusColors = {
    pending: "bg-yellow-50 text-yellow-700",
    paid: "bg-green-50 text-green-700",
    delivered: "bg-blue-50 text-blue-700",
    expired: "bg-gray-50 text-gray-700",
    failed: "bg-red-50 text-red-700",
};

const statusLabels = {
    pending: "Pending",
    paid: "Paid",
    delivered: "Delivered",
    expired: "Expired",
    failed: "Failed",
};

export default function Dashboard({
    stats,
    chartData,
    latestOrders,
    topProducts,
}) {
    const formatRupiah = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value || 0);

    const formatRupiahShort = (value) => {
        if (value >= 1000000) return `Rp${(value / 1000000).toFixed(1)}jt`;
        if (value >= 1000) return `Rp${(value / 1000).toFixed(0)}rb`;
        return `Rp${value}`;
    };

    // 6 stat cards
    const statCards = [
        {
            label: "Revenue Hari Ini",
            value: formatRupiah(stats.revenue_today),
            icon: Banknote,
            color: "bg-green-50 text-green-600",
        },
        {
            label: "Revenue Bulan Ini",
            value: formatRupiah(stats.revenue_month),
            icon: TrendingUp,
            color: "bg-blue-50 text-blue-600",
        },
        {
            label: "Order Hari Ini",
            value: stats.orders_today,
            icon: ShoppingCart,
            color: "bg-blue-50 text-blue-600",
        },
        {
            label: "Order Pending",
            value: stats.pending_orders,
            icon: Clock,
            color:
                stats.pending_orders > 0
                    ? "bg-yellow-50 text-yellow-600"
                    : "bg-gray-50 text-gray-500",
        },
        {
            label: "Total Produk",
            value: stats.total_products,
            icon: Package,
            color: "bg-purple-50 text-purple-600",
        },
        {
            label: "Total Customer",
            value: stats.total_customers,
            icon: Users,
            color: "bg-indigo-50 text-indigo-600",
        },
    ];

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard - Admin" />

            {/* Stat Cards — 6 */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-5">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            className="bg-white rounded-xl border border-gray-200 p-3 md:p-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] md:text-xs text-gray-500 font-medium">
                                    {card.label}
                                </span>
                                <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <p className="text-base md:text-lg font-bold text-gray-900 truncate">
                                {card.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Chart Penjualan */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 mb-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">
                    Penjualan 7 Hari Terakhir
                </h2>
                <div className="w-full h-56 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f1f5f9"
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: "#64748b" }}
                                axisLine={{ stroke: "#e2e8f0" }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: "#64748b" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={formatRupiahShort}
                                width={55}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                }}
                                formatter={(value) => [
                                    formatRupiah(value),
                                    "Revenue",
                                ]}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: "#3b82f6", r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Order Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 mb-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">
                    Order 7 Hari Terakhir
                </h2>
                <div className="w-full h-48 md:h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f1f5f9"
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: "#64748b" }}
                                axisLine={{ stroke: "#e2e8f0" }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: "#64748b" }}
                                axisLine={false}
                                tickLine={false}
                                width={25}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                }}
                                formatter={(value) => [value, "Order"]}
                            />
                            <Bar
                                dataKey="orders"
                                fill="#8b5cf6"
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Grid: Order Terbaru + Top Produk */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Order Terbaru */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-900">
                            Order Terbaru
                        </h2>
                        <Link
                            href="/dashboard/orders"
                            className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                        >
                            Lihat Semua
                        </Link>
                    </div>

                    {latestOrders.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">
                            Belum ada order
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {latestOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/dashboard/orders/${order.id}`}
                                    className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <div className="min-w-0">
                                        <p className="font-mono text-xs font-bold text-gray-900 truncate">
                                            {order.invoice_number}
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                            {order.customer_phone}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-bold text-blue-600">
                                            {formatRupiah(order.total_amount)}
                                        </p>
                                        <span
                                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColors[order.status]}`}
                                        >
                                            {statusLabels[order.status]}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Produk */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-900">
                            Produk Terlaris
                        </h2>
                        <Link
                            href="/dashboard/products"
                            className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                        >
                            Lihat Semua
                        </Link>
                    </div>

                    {topProducts.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">
                            Belum ada produk terjual
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {topProducts.map((product, idx) => (
                                <div
                                    key={product.id}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {product.name}
                                        </p>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500 shrink-0">
                                        {product.sold_count} terjual
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
