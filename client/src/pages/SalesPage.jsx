import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SalesPage = () => {
    const [sales, setSales] = useState([]);

    useEffect(() => {
        // Placeholder fetching sales history
        // axios.get('/api/sales').then(res => setSales(res.data));
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Sales History</h1>

            <div className="overflow-x-auto">
                <table className="min-w-full border shadow-sm">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border p-2 text-left">Sale ID</th>
                            <th className="border p-2 text-left">Date</th>
                            <th className="border p-2 text-left">Customer</th>
                            <th className="border p-2 text-left">Total</th>
                            <th className="border p-2 text-left">Items Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale) => (
                            <tr key={sale._id} className="hover:bg-gray-50">
                                <td className="border p-2 font-mono text-sm">{sale._id}</td>
                                <td className="border p-2">{new Date(sale.createdAt).toLocaleDateString()}</td>
                                <td className="border p-2">{sale.customerEmail || 'Walk-in'}</td>
                                <td className="border p-2 font-bold">${sale.total}</td>
                                <td className="border p-2">{sale.items.length}</td>
                            </tr>
                        ))}
                        {sales.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-4 text-center text-gray-500">No sales recorded yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesPage;
