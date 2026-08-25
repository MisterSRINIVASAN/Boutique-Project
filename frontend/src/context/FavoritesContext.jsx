import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { apiFetch, keys } from '../lib/api';

const FavoritesContext = createContext();

export function useFavorites() {
  return useContext(FavoritesContext);
}

const EMPTY = [];

export function FavoritesProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = EMPTY } = useQuery({
    queryKey: keys.favorites(),
    queryFn: () => apiFetch('/api/favorites', { auth: true }),
    enabled: isLoggedIn,
    staleTime: 30_000,
  });

  const { mutate: toggleMutation } = useMutation({
    mutationFn: (productId) =>
      apiFetch(`/api/favorites/toggle/${productId}`, { method: 'POST', auth: true }),

    // Flip the heart immediately; the server call settles in the background.
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: keys.favorites() });
      const previous = queryClient.getQueryData(keys.favorites());

      queryClient.setQueryData(keys.favorites(), (old = []) =>
        old.some(f => f.product_id === productId)
          ? old.filter(f => f.product_id !== productId)
          : [...old, { id: `optimistic-${productId}`, product_id: productId, product: null }]
      );

      return { previous };
    },

    onError: (err, _productId, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(keys.favorites(), context.previous);
      }
      if (err?.status === 401) {
        alert('Session expired or invalid user. Please log out and log back in as a regular user.');
      }
    },

    // Reconcile with the server once, rather than refetching on every click.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: keys.favorites() });
    },
  });

  const toggleFavorite = useCallback((productId) => {
    if (!isLoggedIn) {
      alert('Please login to save favorites!');
      return;
    }
    toggleMutation(productId);
  }, [isLoggedIn, toggleMutation]);

  // A Set turns isFavorited from O(n) per card into O(1) -- it was scanning the
  // whole favorites array once for every product in the grid, on every render.
  const favoriteIds = useMemo(
    () => new Set(favorites.map(f => f.product_id)),
    [favorites]
  );

  const isFavorited = useCallback(
    (productId) => favoriteIds.has(productId),
    [favoriteIds]
  );

  const value = useMemo(() => ({
    favorites,
    toggleFavorite,
    isFavorited,
    favoritesCount: favorites.length,
  }), [favorites, toggleFavorite, isFavorited]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
