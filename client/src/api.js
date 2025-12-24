import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getInventory = async () => {
    const response = await api.get('/inventory');
    return response.data;
};

export const getProducts = async () => {
    const response = await api.get('/products');
    return response.data;
};

export const createSale = async (saleData) => {
    // saleData should look like { items: [{ productId, quantity }], customerEmail }
    const response = await api.post('/billing/checkout', saleData);
    return response.data;
};

export const getToBuyList = async () => {
    const response = await api.get('/inventory/shortages');
    return response.data;
};

export default api;
