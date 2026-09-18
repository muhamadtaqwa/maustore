import StorefrontLayout from "@/Layouts/StorefrontLayout";
import { Head, useForm } from "@inertiajs/react";
import { Loader2 } from "lucide-react";

export default function Check() {
    const { data, setData, post, processing, errors } = useForm({
        invoice_number: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/cek-pesanan");
    };

    return (
        <StorefrontLayout>
            <Head title="Cek Pesanan" />

            <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                        Cek Status Pesanan
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Masukkan No. Invoice
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl border border-gray-200 p-4"
                >
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            No. Invoice
                        </label>
                        <input
                            type="text"
                            placeholder="INV-20260918-XXXXXX"
                            value={data.invoice_number}
                            onChange={(e) =>
                                setData(
                                    "invoice_number",
                                    e.target.value.toUpperCase(),
                                )
                            }
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-mono"
                            required
                            autoFocus
                        />
                        {errors.invoice_number && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.invoice_number}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Mencari...
                            </>
                        ) : (
                            "Cek Pesanan"
                        )}
                    </button>
                </form>
            </div>
        </StorefrontLayout>
    );
}
