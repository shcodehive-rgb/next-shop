"use client";

import { useState } from "react";
import { useShop, ShippingRate } from "@/context/ShopContext";
import { toast } from "sonner";
import { Save, Plus, Trash2, Edit, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { getLocalized } from "@/lib/utils";

export default function AdminShipping() {
    const { shippingRates, addShippingRate, updateShippingRate, deleteShippingRate } = useShop();
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const t = useTranslations('Admin');

    const [formData, setFormData] = useState({
        city: "",
        price: "",
        isDefault: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.city || !formData.price) {
            toast.error(t('error_required'));
            return;
        }

        if (Number(formData.price) < 0) {
            toast.error("Shipping price must be positive");
            return;
        }

        setLoading(true);
        try {
            const rate: ShippingRate = {
                id: editingId || Date.now().toString(),
                city: formData.city,
                price: Number(formData.price),
                isDefault: formData.isDefault
            };

            if (editingId) {
                await updateShippingRate(editingId, rate);
                toast.success(t('success_update'));
                setEditingId(null);
            } else {
                await addShippingRate(rate);
                toast.success(t('success_add'));
            }

            setFormData({ city: "", price: "", isDefault: false });
        } catch (error) {
            console.error("Error saving shipping rate:", error);
            toast.error(t('error_generic'));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (rate: ShippingRate) => {
        setFormData({
            city: rate.city,
            price: rate.price.toString(),
            isDefault: rate.isDefault
        });
        setEditingId(rate.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('delete_confirm'))) return;

        try {
            await deleteShippingRate(id);
            toast.success(t('success_delete'));
        } catch (error) {
            console.error("Error deleting shipping rate:", error);
            toast.error(t('error_generic'));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Add/Edit Form */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border space-y-6">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    {editingId ? 'Edit Shipping Rate' : 'Add Shipping Rate'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-2 gap-4">
                        {/* City Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">
                                City Name
                            </label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full p-3 bg-gray-50 border rounded-xl"
                                placeholder="Casablanca, Tangier, etc."
                            />
                        </div>

                        {/* Shipping Price */}
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">
                                Shipping Price (DH)
                            </label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full p-3 bg-gray-50 border rounded-xl"
                                placeholder="20"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Default Rate Checkbox */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                            className="w-5 h-5 accent-emerald-600"
                            id="isDefault"
                        />
                        <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                            Set as Default Rate (for cities not listed)
                        </label>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-black text-white py-3 px-6 rounded-xl font-bold hover:bg-gray-900 transition flex items-center gap-2"
                        >
                            {loading ? (
                                <>Loading...</>
                            ) : (
                                <>
                                    {editingId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    <span>{editingId ? 'Save' : 'Add'}</span>
                                </>
                            )}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ city: "", price: "", isDefault: false });
                                }}
                                className="bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-bold hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </section>

            {/* Shipping Rates List */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <h3 className="font-bold text-lg text-gray-800">
                    Shipping Rates ({shippingRates.length})
                </h3>

                {shippingRates.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                        No shipping rates yet. Add your first rate above.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-bold text-gray-700">City</th>
                                    <th className="text-left py-3 px-4 font-bold text-gray-700">Price (DH)</th>
                                    <th className="text-left py-3 px-4 font-bold text-gray-700">Default</th>
                                    <th className="text-right py-3 px-4 font-bold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shippingRates.map((rate) => (
                                    <tr key={rate.id} className="border-b hover:bg-gray-50 transition">
                                        <td className="py-3 px-4 font-medium">{getLocalized(rate.city)}</td>
                                        <td className="py-3 px-4">{rate.price} DH</td>
                                        <td className="py-3 px-4">
                                            {rate.isDefault && (
                                                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                                                    Default
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => handleEdit(rate)}
                                                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(rate.id)}
                                                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
