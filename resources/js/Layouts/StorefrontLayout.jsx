import { Link, usePage, router } from "@inertiajs/react";
import { Search, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const navLinks = [
    { label: "Produk", href: "/produk" },
    { label: "Cek Pesanan", href: "/cek-pesanan" },
];

export default function StorefrontLayout({ children }) {
    const { url } = usePage();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [shouldRenderSearch, setShouldRenderSearch] = useState(false);

    const searchInputRef = useRef(null);
    const searchContainerRef = useRef(null);
    const menuContainerRef = useRef(null); // ← baru

    // Tutup menu tiap ganti halaman
    useEffect(() => {
        setMenuOpen(false);
    }, [url]);

    // Lock scroll pas menu kebuka
    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    // Handle render + focus search
    useEffect(() => {
        if (searchOpen) {
            setShouldRenderSearch(true);
            setTimeout(() => searchInputRef.current?.focus(), 150);
        } else {
            const t = setTimeout(() => setShouldRenderSearch(false), 250);
            return () => clearTimeout(t);
        }
    }, [searchOpen]);

    // Tutup search kalau klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                searchOpen &&
                searchContainerRef.current &&
                !searchContainerRef.current.contains(e.target)
            ) {
                setSearchOpen(false);
                setSearchValue("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [searchOpen]);

    // Tutup menu mobile kalau klik di luar ← BARU
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                menuOpen &&
                menuContainerRef.current &&
                !menuContainerRef.current.contains(e.target)
            ) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    const isActive = (href) => url.startsWith(href);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchValue.trim()) {
            router.get("/produk", { search: searchValue.trim() });
            setSearchOpen(false);
        }
    };

    const handleCloseSearch = () => {
        setSearchOpen(false);
        setSearchValue("");
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
            {/* ==================== HEADER ==================== */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                {/* Bungkus seluruh header pakai ref menu */}
                <div ref={menuContainerRef}>
                    <div className="max-w-6xl mx-auto px-4 md:px-6">
                        <div className="h-14 md:h-16 flex items-center justify-between gap-4 relative">
                            {/* Kiri: Hamburger + Logo desktop */}
                            <div className="flex items-center gap-2 flex-1">
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="md:hidden p-2.5 -ml-2 rounded-lg text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition"
                                    aria-label="Menu"
                                    aria-expanded={menuOpen}
                                >
                                    {menuOpen ? (
                                        <X className="w-5 h-5" />
                                    ) : (
                                        <Menu className="w-5 h-5" />
                                    )}
                                </button>

                                <Link
                                    href="/"
                                    className="hidden md:inline-block text-xl font-bold text-gray-900 hover:text-blue-600 transition"
                                >
                                    Mau
                                    <span className="text-blue-600">Store</span>
                                </Link>
                            </div>

                            {/* Tengah: Logo mobile */}
                            <Link
                                href="/"
                                className={`md:hidden absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-900 transition-all duration-300 ${
                                    searchOpen
                                        ? "opacity-0 scale-95 pointer-events-none"
                                        : "opacity-100 scale-100"
                                }`}
                            >
                                Mau<span className="text-blue-600">Store</span>
                            </Link>

                            {/* Desktop Nav */}
                            <nav
                                className={`hidden md:flex items-center gap-8 text-sm font-medium transition-all duration-300 ${
                                    searchOpen
                                        ? "opacity-0 scale-95 pointer-events-none"
                                        : "opacity-100 scale-100"
                                }`}
                            >
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`transition ${
                                            isActive(link.href)
                                                ? "text-blue-600"
                                                : "text-gray-700 hover:text-blue-600"
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>

                            {/* Kanan: Search */}
                            <div className="flex items-center gap-1 flex-1 justify-end">
                                <div
                                    ref={searchContainerRef}
                                    className="relative flex items-center"
                                >
                                    {shouldRenderSearch && (
                                        <form
                                            onSubmit={handleSearchSubmit}
                                            className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm z-10 transition-all ease-out origin-right ${
                                                searchOpen
                                                    ? "opacity-100 scale-x-100"
                                                    : "opacity-0 scale-x-0 pointer-events-none"
                                            }`}
                                            style={{
                                                width: "260px",
                                                transitionDuration: "250ms",
                                            }}
                                        >
                                            <Search className="w-4 h-4 text-gray-400 ml-3 shrink-0" />
                                            <input
                                                ref={searchInputRef}
                                                type="text"
                                                placeholder="Cari produk..."
                                                value={searchValue}
                                                onChange={(e) =>
                                                    setSearchValue(
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1 py-2.5 pr-2 outline-none text-sm bg-transparent min-w-0"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleCloseSearch}
                                                className="p-2 mr-1 rounded-md text-gray-400 hover:bg-gray-100 transition shrink-0"
                                                aria-label="Tutup"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </form>
                                    )}

                                    <button
                                        onClick={() => setSearchOpen(true)}
                                        className={`p-2.5 rounded-lg text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 ${
                                            searchOpen
                                                ? "opacity-0 scale-90 pointer-events-none"
                                                : "opacity-100 scale-100"
                                        }`}
                                        aria-label="Cari produk"
                                    >
                                        <Search className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Nav */}
                    <div
                        className={`md:hidden overflow-hidden border-t border-gray-200 bg-white transition-[max-height] duration-300 ease-out ${
                            menuOpen ? "max-h-80" : "max-h-0"
                        }`}
                    >
                        <nav className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`py-3 px-2 rounded-lg text-sm font-medium transition ${
                                        isActive(link.href)
                                            ? "text-blue-600"
                                            : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Divider */}
                            <div className="border-t border-gray-100 my-2" />

                            {/* Admin Panel */}
                            <a
                                href="/dashboard"
                                className="py-3 px-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition"
                            >
                                Admin Panel
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* ==================== MAIN ==================== */}
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-8">
                {children}
            </main>

            {/* ==================== FOOTER ==================== */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
                    <p className="text-xs text-gray-400 text-center">
                        © {new Date().getFullYear()} MauStore. All rights
                        reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
