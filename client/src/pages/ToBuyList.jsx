import React, { useEffect, useState } from 'react';
import { getToBuyList } from '../api';

const ToBuyList = () => {
    const [shortages, setShortages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShortages = async () => {
            try {
                // Fetch shortages directly from server (checks qty <= minQty)
                const data = await getToBuyList();
                setShortages(data);
            } catch (error) {
                console.error('Error fetching to-buy list:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchShortages();
    }, []);

    if (loading) return <div className="p-4">Loading To-Buy List...</div>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-red-600">To-Buy List</h2>
            <p className="mb-4 text-gray-700">Items requiring replenishment (Qty &le; Min Qty)</p>

            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full bg-red-50 border border-red-200">
                    <thead className="bg-red-100">
                        <tr className="text-left text-red-800">
                            <th className="p-3 border-b border-red-200">Item Name</th>
                            <th className="p-3 border-b border-red-200">Current Qty</th>
                            <th className="p-3 border-b border-red-200">Min Qty</th>
                            <th className="p-3 border-b border-red-200">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shortages.map((item) => (
                            <tr key={item._id} className="border-b border-red-100 hover:bg-red-200 transition-colors">
                                <td className="p-3 text-red-900">{item.name}</td>
                                <td className="p-3 font-bold text-red-900">{item.qty} {item.unit}</td>
                                <td className="p-3 text-red-900">{item.minQty}</td>
                                <td className="p-3 text-red-700 font-bold uppercase text-xs tracking-wider">Low Stock</td>
                            </tr>
                        ))}
                        {shortages.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-8 text-center bg-white">
                                    <div className="text-green-600 font-bold text-lg mb-1">All Good!</div>
                                    <div className="text-gray-500">All inventory levels are above the minimum threshold.</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ToBuyList;
