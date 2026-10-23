import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext(null);

const emptyCart = {
  items: [],
  subtotal: 0,
  discount: 0,
  shipping: 0,
  total: 0,
  promotion: null,
  promoCode: null,
};

export function CartProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(emptyCart);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch {
      setCart(emptyCart);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addItem(productId, quantity = 1) {
    if (!user) {
      toast.error('Please log in to add items to your cart.');
      return;
    }
    const res = await api.post('/cart/items', { productId, quantity });
    setCart(res.data);
    toast.success('Added to cart');
  }

  async function updateItem(itemId, quantity) {
    const res = await api.patch(`/cart/items/${itemId}`, { quantity });
    setCart(res.data);
  }

  async function removeItem(itemId) {
    const res = await api.delete(`/cart/items/${itemId}`);
    setCart(res.data);
  }

  async function applyPromo(code) {
    const res = await api.post('/cart/promo', { code });
    setCart(res.data);
    return res.data;
  }

  const count = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, count, loading, refresh, addItem, updateItem, removeItem, applyPromo }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
