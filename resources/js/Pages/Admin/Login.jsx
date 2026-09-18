import { Head, useForm } from "@inertiajs/react";
import { Loader2 } from "lucide-react";

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/dashboard/login");
    };

    return (
        <>
            <Head title="Login Admin" />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Mau<span className="text-blue-600">Store</span>
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Login Admin Panel
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
                    >
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="admin@maustore.test"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                                autoFocus
                                required
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                                required
                            />
                        </div>

                        <label className="flex items-center gap-2 mb-5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData("remember", e.target.checked)
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600">
                                Ingat saya
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <a
                            href="/"
                            className="text-xs text-gray-500 hover:text-blue-600 transition"
                        >
                            Kembali ke toko
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
