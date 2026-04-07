import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export function useFavorites() {
  return useContext(FavoritesContext);
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const { isLoggedIn, token } = useAuth();
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    if (isLoggedIn) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isLoggedIn]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${API_URL}/api/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else if (response.status === 401) {
          console.warn("Unauthorized to fetch favorites. Session might be expired.");
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (productId) => {
    if (!isLoggedIn) {
      alert('Please login to save favorites!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/favorites/toggle/${productId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Refresh favorites list
        fetchFavorites();
      } else if (response.status === 401) {
        alert("Session expired or invalid user. Please log out and log back in as a regular user.");
      } else {
          console.error("Failed to toggle favorite:", await response.text());
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isFavorited = (productId) => {
    return favorites.some(fav => fav.product_id === productId);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      toggleFavorite,
      isFavorited,
      favoritesCount: favorites.length
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}
