import { Link, usePage, router } from "@inertiajs/react";
import {
    LayoutDashboard,
    Package,
    Tags,
    Users,
    ShoppingCart,
    LogOut,
    Menu,
    X,
    ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Pesanan", href: "/dashboard/orders", icon: ShoppingCart },
    { label: "Produk", href: "/dashboard/products", icon: Package },
    { label: "Kategori", href: "/dashboard/categories", icon: Tags },
    { label: "Customer", href: "/dashboard/customers", icon: Users },
];

export default function AdminLayout({ children, title }) {
    const { url, props } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = props.auth?.user;

    useEffect(() => {
        setSidebarOpen(false);
    }, [url]);

    const isActive = (href) => {
        if (href === "/dashboard") return url === "/dashboard";
        return url.startsWith(href);
    };

    const handleLogout = () => {
        router.post("/dashboard/logout");
    };

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans">
            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-200 ease-out flex flex-col ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                }`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                    <Link
                        href="/dashboard"
                        className="text-lg font-bold text-gray-900"
                    >
                        Mau<span className="text-blue-600">Store</span>
                        <span className="text-xs text-gray-400 ml-1">
                            Admin
                        </span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                                    active
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="p-3 border-t border-gray-100 flex flex-col gap-1">
                    <a
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                    >
                        <ExternalLink className="w-4 h-4 shrink-0" />
                        Lihat Toko
                    </a>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition w-full text-left"
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-base font-semibold text-gray-900">
                            {title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">
                                {user?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {user?.email}
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
