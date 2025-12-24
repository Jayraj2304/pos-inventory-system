import React, { useState, useEffect } from 'react';
import { getInventory } from '../api';
import axios from 'axios';

const InventoryPage = () => {
    const [inventory, setInventory] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', qty: '', unit: '', minQty: '' });
    const [shortages, setShortages] = useState([]);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const data = await getInventory();
            setInventory(data);

            const lowStock = data.filter(item => item.qty <= item.minQty);
            setShortages(lowStock);
        } catch (err) {
            console.error("Error loading inventory", err);
        }
    };

    const [editingId, setEditingId] = useState(null);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newItem.name || !newItem.unit) {
            alert("Please enter Name and Unit");
            return;
        }

        const payload = {
            name: newItem.name,
            qty: Number(newItem.qty) || 0,
            unit: newItem.unit,
            minQty: newItem.minQty ? Number(newItem.minQty) : 5 // Default to 5 if not set
        };

        try {
            if (editingId) {
                // Update existing item
                await axios.put(`http://localhost:5000/api/inventory/${editingId}`, payload);
                alert('Stock updated successfully!');
                setEditingId(null);
            } else {
                // Create new item
                await axios.post('http://localhost:5000/api/inventory', payload);
                alert('Material added / Stock updated!');
            }

            setNewItem({ name: '', qty: '', unit: '', minQty: '' });
            fetchInventory();
        } catch (error) {
            console.error("Error saving material:", error);
            alert('Failed to save material');
        }
    };

    const handleEdit = (item) => {
        setNewItem({
            name: item.name,
            qty: item.qty,
            unit: item.unit,
            minQty: item.minQty
        });
        setEditingId(item._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setNewItem({ name: '', qty: '', unit: '', minQty: '' });
        setEditingId(null);
    };

    const handleDelete = async (id) => {
        console.log("Attempting to delete item:", id);
        if (!window.confirm("CONFIRMATION REQUIRED: Are you sure you want to permanently delete this material?")) {
            return;
        }

        try {
            const res = await axios.delete(`http://localhost:5000/api/inventory/${id}`);
            console.log("Delete response:", res.data);
            if (res.status === 200) {
                fetchInventory(); // Reload list
                alert("Item deleted successfully.");
            }
        } catch (error) {
            console.error("Delete Error:", error);
            const msg = error.response?.data?.message || "Failed to delete item.";
            alert(msg);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Inventory Management</h1>

            {/* Add/Edit Material Section - Tabular Layout */}
            <div className={`mb-10 p-6 border rounded-lg shadow-sm max-w-2xl ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-xl font-bold ${editingId ? 'text-blue-700' : 'text-gray-700'}`}>
                        {editingId ? 'Edit Raw Material' : 'Add New Raw Material'}
                    </h2>
                    {editingId && (
                        <button onClick={cancelEdit} className="text-sm text-gray-500 hover:text-gray-700 underline">
                            Cancel Edit
                        </button>
                    )}
                </div>

                <form onSubmit={handleAdd}>
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="py-3 pr-4 font-semibold text-gray-600 w-1/3 align-middle">
                                    Material Name:
                                </td>
                                <td className="py-2">
                                    <input
                                        placeholder="e.g. Flour"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="py-3 pr-4 font-semibold text-gray-600 align-middle">
                                    Quantity:
                                </td>
                                <td className="py-2">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={newItem.qty}
                                        onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
                                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="py-3 pr-4 font-semibold text-gray-600 align-middle">
                                    Unit:
                                </td>
                                <td className="py-2">
                                    <input
                                        placeholder="e.g. kg"
                                        value={newItem.unit}
                                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="py-3 pr-4 font-semibold text-gray-600 align-middle">
                                    Min Qty (Alert Threshold):
                                </td>
                                <td className="py-2">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="Default: 5"
                                            value={newItem.minQty}
                                            onChange={(e) => setNewItem({ ...newItem, minQty: e.target.value })}
                                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        />
                                        {!newItem.minQty && <span className="absolute right-3 top-2 text-gray-400 text-xs italic pointer-events-none">Auto: 5</span>}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td></td>
                                <td className="pt-4 flex gap-3">
                                    <button type="submit" className={`font-bold py-2 px-6 rounded shadow-sm transition ${editingId ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-800 hover:bg-blue-900 text-white'}`}>
                                        {editingId ? 'Update Item' : 'Add Item'}
                                    </button>
                                    {editingId && (
                                        <button type="button" onClick={cancelEdit} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-300 transition">
                                            Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            </div>

            {/* Shortage Alerts Section */}
            {shortages.length > 0 && (
                <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded shadow-sm">
                    <h2 className="text-xl font-bold mb-3 text-red-700 flex items-center gap-2">
                        To-Buy List / Action Required
                    </h2>
                    <table className="min-w-full bg-white border border-red-100 rounded overflow-hidden">
                        <thead className="bg-red-100">
                            <tr>
                                <th className="p-3 text-left text-red-800 font-semibold">Item Name</th>
                                <th className="p-3 text-left text-red-800 font-semibold">Current Qty</th>
                                <th className="p-3 text-left text-red-800 font-semibold">Min Qty</th>
                                <th className="p-3 text-left text-red-800 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shortages.map((item) => (
                                <tr key={item._id} className="border-t border-red-50 hover:bg-red-50">
                                    <td className="p-3 font-medium">{item.name}</td>
                                    <td className="p-3 font-bold">{item.qty} {item.unit}</td>
                                    <td className="p-3">{item.minQty} {item.unit}</td>
                                    <td className="p-3 text-red-600 font-bold uppercase text-sm">Low Stock</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Full Inventory Table */}
            <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Current Stock Levels</h2>
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Min Threshold</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map((item) => {
                                const isLow = item.qty <= item.minQty;
                                return (
                                    <tr key={item._id} className={`border-b border-gray-200 hover:bg-gray-50 transition ${isLow ? 'bg-red-50' : ''}`}>
                                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                                            {item.name}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-700">
                                            {item.qty}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-700">
                                            {item.unit}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-700">
                                            {item.minQty}
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            {isLow ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-sm flex gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-green-600 hover:text-green-900 font-bold border border-green-200 bg-white px-3 py-1 rounded hover:bg-green-50 transition shadow-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="text-red-600 hover:text-red-900 font-bold border border-red-200 bg-white px-3 py-1 rounded hover:bg-red-50 transition shadow-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {inventory.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500 italic">
                                        No inventory items found. Use the form above to add your first material.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    );
};

export default InventoryPage;
