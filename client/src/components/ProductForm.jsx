import React, { useState, useEffect } from 'react';
import { getInventory, getProducts } from '../api';
import axios from 'axios';

const ProductForm = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [inventory, setInventory] = useState([]);
    const [products, setProducts] = useState([]);

    // Recipe state
    const [recipe, setRecipe] = useState([]);

    const [selectedIngredientId, setSelectedIngredientId] = useState('');
    const [ingredientQty, setIngredientQty] = useState('');

    // New states for adding custom ingredient on the fly
    const [isAddingNewIngredient, setIsAddingNewIngredient] = useState(false);
    const [newIngName, setNewIngName] = useState('');
    const [newIngUnit, setNewIngUnit] = useState('');

    const [editingProductId, setEditingProductId] = useState(null);

    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadInventory();
        loadProducts();
    }, []);

    const loadInventory = async () => {
        try {
            const data = await getInventory();
            setInventory(data);
        } catch (err) {
            console.error("Failed to load inventory", err);
        }
    };

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (err) {
            console.error("Failed to load products", err);
        }
    };

    const createNewIngredient = async () => {
        if (!newIngName || !newIngUnit) {
            alert("Please provide name and unit for the new ingredient.");
            return;
        }
        try {
            const payload = {
                name: newIngName,
                qty: 0,
                unit: newIngUnit,
                minQty: 5 // Default per user request
            };
            const res = await axios.post('http://localhost:5000/api/inventory', payload);
            await loadInventory();
            setSelectedIngredientId(res.data._id);
            setNewIngName('');
            setNewIngUnit('');
            setIsAddingNewIngredient(false);
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 400) {
                alert("Item with this name already exists in inventory. Please select it from the dropdown.");
                setIsAddingNewIngredient(false);
                const existing = inventory.find(i => i.name.toLowerCase() === newIngName.toLowerCase());
                if (existing) setSelectedIngredientId(existing._id);
            } else {
                alert("Error creating new ingredient.");
            }
        }
    };

    const addIngredient = () => {
        if (!selectedIngredientId || !ingredientQty) return;

        const ingredientObj = inventory.find(i => i._id === selectedIngredientId);
        if (!ingredientObj) return;

        const newIngredient = {
            inventoryId: selectedIngredientId,
            qtyNeeded: Number(ingredientQty),
            name: ingredientObj.name,
            unit: ingredientObj.unit
        };

        setRecipe([...recipe, newIngredient]);
        setSelectedIngredientId('');
        setIngredientQty('');
    };

    const removeIngredient = (index) => {
        const newRecipe = [...recipe];
        newRecipe.splice(index, 1);
        setRecipe(newRecipe);
    };

    const handleEditProduct = (product) => {
        setName(product.name);
        setPrice(String(product.price)); // Convert to string for controlled input

        // Map populated recipe back to form format
        const formattedRecipe = product.recipe.map(r => ({
            inventoryId: r.inventoryId._id,
            name: r.inventoryId.name,
            unit: r.inventoryId.unit,
            qtyNeeded: r.qtyNeeded
        }));
        setRecipe(formattedRecipe);

        setEditingProductId(product._id);
        setShowForm(true); // Show form when editing
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setName('');
        setPrice('');
        setRecipe([]);
        setEditingProductId(null);
        setShowForm(false); // Hide form
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !price || recipe.length === 0) {
            alert("Please fill in all fields and add at least one ingredient.");
            return;
        }

        try {
            const payload = {
                name,
                price: Number(price),
                recipe: recipe.map(r => ({
                    inventoryId: r.inventoryId,
                    qtyNeeded: r.qtyNeeded
                }))
            };

            if (editingProductId) {
                await axios.put(`http://localhost:5000/api/products/${editingProductId}`, payload);
                alert('Product updated successfully!');
                setEditingProductId(null);
            } else {
                await axios.post('http://localhost:5000/api/products', payload);
                alert('Product created successfully!');
            }

            setName('');
            setPrice('');
            setRecipe([]);
            setShowForm(false); // Hide form after submit
            loadProducts();

        } catch (error) {
            console.error(error);
            alert('Error saving product');
        }
    };

    // Helper to get unit of selected item
    const selectedItem = inventory.find(i => i._id === selectedIngredientId);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
                {!showForm && (
                    <button
                        onClick={() => {
                            setEditingProductId(null);
                            setName('');
                            setPrice('');
                            setRecipe([]);
                            setShowForm(true);
                        }}
                        className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 shadow-sm transition"
                    >
                        + Add New Product
                    </button>
                )}
            </div>

            {/* Form Section */}
            {showForm && (
                <div className="form-wrapper bg-white p-8 rounded-lg shadow-lg mb-8 border border-gray-200">
                    <div className="flex justify-between items-center mb-6 border-b pb-2">
                        <h2 className={`text-xl font-bold ${editingProductId ? 'text-blue-700' : 'text-gray-800'}`}>
                            {editingProductId ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className="text-sm text-gray-500 hover:text-red-500 font-medium underline"
                        >
                            Cancel / Close Form
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* Tabular Form Layout */}
                        <table className="w-full mb-6">
                            <tbody>
                                <tr>
                                    <td className="py-2 pr-4 font-semibold text-gray-600 align-middle w-1/4">Product Name:</td>
                                    <td className="py-2">
                                        <input
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="e.g. Margherita Pizza"
                                            required
                                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 font-semibold text-gray-600 align-middle">Price ($):</td>
                                    <td className="py-2">
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                            placeholder="0.00"
                                            required
                                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="recipe-section bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">Recipe Configuration</h3>

                            {/* Custom Ingredient Creation Box */}
                            {isAddingNewIngredient && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm mb-6 animate-fade-in-down">
                                    <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-3">Define New Material</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                                            <input
                                                placeholder="e.g. Yeast"
                                                value={newIngName}
                                                onChange={e => setNewIngName(e.target.value)}
                                                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Unit</label>
                                            <input
                                                placeholder="e.g. g"
                                                value={newIngUnit}
                                                onChange={e => setNewIngUnit(e.target.value)}
                                                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={createNewIngredient} className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 font-medium transition">Save Material</button>
                                        <button type="button" onClick={() => setIsAddingNewIngredient(false)} className="bg-white text-gray-700 border border-gray-300 text-sm px-4 py-2 rounded hover:bg-gray-50 font-medium transition">Cancel</button>
                                    </div>
                                </div>
                            )}

                            {/* Ingredient Selector & Add Button */}
                            <div className="flex flex-col md:flex-row gap-4 items-end mb-6 bg-white p-4 rounded border border-gray-100 shadow-sm">
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Select Ingredient</label>
                                    <select
                                        value={selectedIngredientId}
                                        onChange={e => {
                                            if (e.target.value === "NEW") {
                                                setIsAddingNewIngredient(true);
                                                setSelectedIngredientId('');
                                            } else {
                                                setSelectedIngredientId(e.target.value);
                                            }
                                        }}
                                        disabled={isAddingNewIngredient}
                                        className="w-full border border-gray-300 p-2 rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm h-10"
                                    >
                                        <option value="">-- Choose Ingredient --</option>
                                        <option value="NEW" className="font-bold text-blue-600 bg-blue-50">+ Create New Material</option>
                                        {inventory.map(item => (
                                            <option key={item._id} value={item._id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-full md:w-32">
                                    <label className="block text-sm font-semibold text-gray-600 mb-1">Qty</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={ingredientQty}
                                            onChange={e => setIngredientQty(e.target.value)}
                                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm h-10 pr-8"
                                        />
                                        <span className="absolute right-2 top-2.5 text-gray-400 text-xs pointer-events-none">
                                            {selectedItem ? selectedItem.unit : ''}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={addIngredient}
                                    disabled={!selectedIngredientId || !ingredientQty}
                                    className={`h-10 px-6 rounded font-bold text-sm shadow-sm transition flex items-center justify-center ${!selectedIngredientId || !ingredientQty
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gray-800 text-white hover:bg-gray-700'
                                        }`}
                                >
                                    Add
                                </button>
                            </div>

                            {/* Added Ingredients Table */}
                            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-2 w-10">#</th>
                                            <th className="px-4 py-2">Ingredient</th>
                                            <th className="px-4 py-2">Quantity</th>
                                            <th className="px-4 py-2 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recipe.length > 0 ? (
                                            recipe.map((ing, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition">
                                                    <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                                                    <td className="px-4 py-3 font-medium text-gray-800">{ing.name}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                                                            {ing.qtyNeeded} {ing.unit}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeIngredient(idx)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition"
                                                            title="Remove Ingredient"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-8 text-center text-gray-400 italic bg-gray-50">
                                                    No ingredients added. Select items above to build your recipe.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </div >

                        <button type="submit" className={`w-full text-white py-3 rounded font-bold shadow-sm transition ${editingProductId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
                            {editingProductId ? 'Update Product' : 'Save New Product'}
                        </button>
                    </form >
                </div >
            )}

            {/* Existing Products Table - Full Width */}
            <div className="product-list">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Menu / Product List</h2>

                <div className="bg-white shadow rounded overflow-hidden">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Product Name
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Details
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50 transition">
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm font-medium text-gray-900">
                                        {product.name}
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-green-600 font-bold">
                                        ${product.price.toFixed(2)}
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-gray-500">
                                        <span title={product.recipe.map(i => i.inventoryId?.name).join(', ')} className="cursor-help border-b border-dotted border-gray-400">
                                            {product.recipe.length} Ingredients
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm flex gap-2">
                                        <button
                                            onClick={() => handleEditProduct(product)}
                                            className="bg-green-600 text-white font-bold text-xs px-3 py-1.5 rounded hover:bg-green-700 transition shadow-sm mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Delete product "${product.name}"?`)) {
                                                    try {
                                                        await axios.delete(`http://localhost:5000/api/products/${product._id}`);
                                                        loadProducts();
                                                    } catch (e) {
                                                        alert("Failed to delete product");
                                                        console.error(e);
                                                    }
                                                }
                                            }}
                                            className="bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded hover:bg-red-600 transition shadow-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-6 text-center text-gray-500">No products available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div >
    );
};

export default ProductForm;
