import React, { useEffect, useState } from 'react';
import api from '../api';

const SalesHistory = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                // Assuming we will create this route: GET /api/billing/sales
                // Or if the user wants us to use the specific endpoint from previous context
                // I'll assume /api/sales based on common REST patterns, we can adjust server later.
                const response = await api.get('/sales');
                setSales(response.data);
            } catch (error) {
                console.error('Error fetching sales history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSales();
    }, []);

    if (loading) return <div>Loading sales history...</div>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Sales Past Transactions</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="py-2 px-4 text-left">Date</th>
                            <th className="py-2 px-4 text-left">Customer Email</th>
                            <th className="py-2 px-4 text-left">Items Sold</th>
                            <th className="py-2 px-4 text-left">Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale) => (
                            <tr key={sale._id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-4">
                                    {new Date(sale.createdAt).toLocaleString()}
                                </td>
                                <td className="py-2 px-4">
                                    {sale.customerEmail || 'N/A'}
                                </td>
                                <td className="py-2 px-4">
                                    <ul className="list-disc list-inside text-sm">
                                        {sale.items.map((item, index) => (
                                            <li key={index}>
                                                {/* Assuming populate or basic data. If product is ID, might need name. */}
                                                {item.product?.name || 'Product'} (x{item.quantity})
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="py-2 px-4 font-bold">
                                    ${sale.total.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        {sales.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-4">No sales recorded.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesHistory;
