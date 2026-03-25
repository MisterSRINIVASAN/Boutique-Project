import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('boutique_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [savedAddress, setSavedAddress] = useState(() => {
    return localStorage.getItem('boutique_user_address') || '';
  });

  useEffect(() => {
    localStorage.setItem('boutique_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, size_label, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product_id === product.id && item.size_label === size_label);
      if (existing) {
        return prev.map(item => 
          (item.product_id === product.id && item.size_label === size_label) 
            ? { ...item, quantity: item.quantity + quantity, checked: true } 
            : item
        );
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.images ? product.images[0] : null,
        size_label,
        quantity,
        checked: true
      }];
    });
  };

  const updateQuantity = (product_id, size_label, quantity) => {
    setCartItems(prev => prev.map(item => 
      (item.product_id === product_id && item.size_label === size_label)
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    ));
  };

  const toggleCheck = (product_id, size_label) => {
    setCartItems(prev => prev.map(item => 
      (item.product_id === product_id && item.size_label === size_label)
        ? { ...item, checked: !item.checked }
        : item
    ));
  };

  const setAllChecked = (checked) => {
    setCartItems(prev => prev.map(item => ({ ...item, checked })));
  };

  const removeFromCart = (product_id, size_label) => {
    setCartItems(prev => prev.filter(item => 
      !(item.product_id === product_id && item.size_label === size_label)
    ));
  };

  const clearCart = () => setCartItems([]);

  const saveAddress = (addr) => {
    setSavedAddress(addr);
    localStorage.setItem('boutique_user_address', addr);
  };

  const getCartTotal = () => {
    return cartItems
      .filter(item => item.checked)
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      toggleCheck,
      setAllChecked,
      removeFromCart,
      clearCart,
      getCartTotal,
      cartCount: cartItems.length,
      selectedCount: cartItems.filter(item => item.checked).length,
      savedAddress,
      saveAddress
    }}>
      {children}
    </CartContext.Provider>
  );
}
