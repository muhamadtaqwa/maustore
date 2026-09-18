const statusConfig = {
    pending: {
        label: "Menunggu Pembayaran",
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    paid: {
        label: "Sudah Dibayar",
        className: "bg-green-50 text-green-700 border-green-200",
    },
    expired: {
        label: "Kadaluarsa",
        className: "bg-gray-50 text-gray-700 border-gray-200",
    },
    failed: {
        label: "Gagal",
        className: "bg-red-50 text-red-700 border-red-200",
    },
    delivered: {
        label: "Selesai",
        className: "bg-blue-50 text-blue-700 border-blue-200",
    },
};

export default function OrderStatusBadge({ status }) {
    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span
            className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium border ${config.className}`}
        >
            {config.label}
        </span>
    );
}
