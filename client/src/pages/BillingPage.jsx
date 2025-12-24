import React, { useState, useEffect } from 'react';
import { getProducts, createSale } from '../api';
import '../styles/billing-fallback.css';

const BillingPage = () => {
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [cart, setCart] = useState([]);
    const [customerEmail, setCustomerEmail] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error("Error loading products:", error);
        }
    };

    const checkInventory = (product, newQuantity) => {
        if (!product.recipe || product.recipe.length === 0) return true;

        for (const ingredient of product.recipe) {
            const invItem = ingredient.inventoryId;
            if (!invItem) continue; // Skip if data issue

            const totalNeeded = ingredient.qtyNeeded * newQuantity;
            const available = invItem.qty - invItem.minQty; // Strict available stock based on rules

            if (totalNeeded > available) {
                alert(`Insufficient Stock! \nCannot add '${product.name}' (Qty: ${newQuantity}). \nIngredient '${invItem.name}' is low.\nAvailable to use: ${available} ${invItem.unit}. Needed: ${totalNeeded} ${invItem.unit}.`);
                return false;
            }
        }
        return true;
    };

    const addToCart = () => {
        if (!selectedProductId) return;

        const product = products.find(p => p._id === selectedProductId);
        if (!product) return;

        const existingItem = cart.find(item => item.productId === product._id);
        const newQuantity = existingItem ? existingItem.quantity + 1 : 1;

        if (!checkInventory(product, newQuantity)) return;

        if (existingItem) {
            setCart(cart.map(item =>
                item.productId === product._id
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1, productId: product._id }]);
        }
        setSelectedProductId(''); // Reset selection
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId, delta) => {
        const product = products.find(p => p._id === productId);
        // Note: 'product' here comes from the main 'products' list which has full recipe data.
        // 'cart' items might not have the full recipe populated if we just spread properties.
        // But in addToCart we did { ...product }, so it should be there. 
        // Safer to look up from 'products' state to ensure latest inventory data (though inventory data is static at load time currently).

        const cartItem = cart.find(item => item.productId === productId);
        if (!cartItem || !product) return;

        const newQty = cartItem.quantity + delta;

        if (newQty <= 0) {
            // Let logic below handle it or keep current behavior of not going below 1 (Wait, current logic is > 0 check)
            // Original: return newQty > 0 ? ... : item;
            // We can just return if native check implies no change.
            // But let's check inventory if delta > 0
        }

        if (delta > 0) {
            if (!checkInventory(product, newQty)) return;
        }

        setCart(cart.map(item => {
            if (item.productId === productId) {
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert("Cart is empty!");
            return;
        }

        let finalEmail = customerEmail;
        if (!finalEmail) {
            const input = window.prompt("Please enter customer email (Required for receipt):");
            if (input) {
                finalEmail = input;
                setCustomerEmail(input);
            } else {
                alert("Checkout cancelled: Email is required.");
                return;
            }
        }

        setLoading(true);
        try {
            const payload = {
                items: cart.map(item => ({ productId: item.productId, quantity: item.quantity })),
                customerEmail: finalEmail
            };

            await createSale(payload);
            alert('Order placed successfully! Invoice sent to email.');
            setCart([]);
            setCustomerEmail('');
        } catch (error) {
            console.error("Checkout failed:", error);
            const msg = error.response?.data?.message || "Checkout failed. Please check inventory.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

    return (
        <div className="billing-container p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Billing & POS</h1>

            {/* Product Selection Section */}
            <div className="billing-card bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                <h2 className="text-lg font-bold mb-4 text-gray-700 uppercase tracking-wide">Add Item</h2>
                <div className="billing-flex flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full">
                        <label className="billing-label block text-sm font-semibold text-gray-600 mb-2">Select Product</label>
                        <select
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            className="billing-select w-full border border-gray-300 p-4 rounded text-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition"
                            style={{ paddingRight: '2rem' }}
                        >
                            <option value="">-- Choose a Product --</option>
                            {products.map(p => (
                                <option key={p._id} value={p._id}>
                                    {p.name} - ${p.price.toFixed(2)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="md:w-auto w-full">
                        <button
                            onClick={addToCart}
                            disabled={!selectedProductId}
                            className={`billing-btn h-[56px] w-full md:w-auto px-10 rounded font-bold text-lg shadow-sm transition ${!selectedProductId
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Table Section */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
                    <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded border shadow-sm">
                        {cart.length} items
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-100 text-gray-600 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4 text-center">Quantity</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {cart.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                        Cart is empty. Add products above to start a bill.
                                    </td>
                                </tr>
                            ) : (
                                cart.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                                        <td className="px-6 py-4 text-gray-600">${item.price.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center items-center">
                                                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, -1)}
                                                        className="px-3 py-1 hover:bg-gray-200 text-gray-600 border-r"
                                                    >-</button>
                                                    <span className="px-4 py-1 font-semibold text-gray-700 w-12 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, 1)}
                                                        className="px-3 py-1 hover:bg-gray-200 text-gray-600 border-l"
                                                    >+</button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-800">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => removeFromCart(item.productId)}
                                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-full transition"
                                                title="Remove Item"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {cart.length > 0 && (
                            <tfoot className="bg-gray-100 font-bold text-gray-800">
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-right uppercase tracking-wider text-gray-600">
                                        Total Amount:
                                    </td>
                                    <td className="px-6 py-4 text-right text-xl text-blue-800">
                                        ${totalAmount.toFixed(2)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>


                <div className="bg-gray-50 p-6 border-t border-gray-200">
                    <div className="billing-footer flex flex-col md:flex-row justify-between items-end gap-6">
                        <div className="w-full md:w-1/2 mt-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Customer Email (Required)</label>
                            <input
                                type="email"
                                className="w-full border border-gray-300 p-4 rounded text-lg focus:ring-2 focus:ring-green-500 outline-none transition bg-white"
                                placeholder="Enter customer email..."
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                            />
                        </div>

                        <div className="w-full md:w-auto flex flex-col items-end gap-4 mt-6 md:mt-0">

                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || loading}
                                className={`billing-btn px-12 py-5 rounded-xl font-bold text-2xl shadow-xl transition w-full md:w-auto ${cart.length === 0 || loading
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
                                    }`}
                            >
                                {loading ? 'Processing...' : 'Complete Checkout'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingPage;
