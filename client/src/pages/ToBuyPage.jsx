import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ToBuyPage = () => {
    const [toBuyList, setToBuyList] = useState([]);

    useEffect(() => {
        // This could fetching a dedicated endpoint or filtering client-side if we had full inventory state
        // For now, assuming an API endpoint that returns the shortage list
        // axios.get('/api/inventory/shortages').then(res => setToBuyList(res.data));
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-red-600">To-Buy List / Shortages</h1>
            <p className="mb-4 text-gray-600">Items below threshold (Qty &lt;= 2 * Needed for recent sales)</p>

            <table className="min-w-full border bg-red-50">
                <thead>
                    <tr>
                        <th className="border p-2 text-left">Item Name</th>
                        <th className="border p-2 text-left">Current Qty</th>
                        <th className="border p-2 text-left">Threshold Trigger</th>
                        <th className="border p-2 text-left">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {toBuyList.map((item, idx) => (
                        <tr key={idx} className="border-b">
                            <td className="p-2">{item.name}</td>
                            <td className="p-2 font-bold">{item.currentQty} {item.unit}</td>
                            <td className="p-2 text-gray-500">Hit {item.threshold} limit</td>
                            <td className="p-2 text-red-600 font-bold">Refill Needed</td>
                        </tr>
                    ))}
                    {toBuyList.length === 0 && (
                        <tr>
                            <td colSpan="4" className="p-4 text-center text-gray-500">No shortages detected currently.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ToBuyPage;
