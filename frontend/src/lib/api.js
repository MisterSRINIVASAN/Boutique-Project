export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/** Products fetched per "page" of the grid. Small enough to render fast. */
export const PAGE_SIZE = 24;

/** Inline placeholder: no DNS lookup, no request, paints immediately. */
export const PLACEHOLDER_IMG =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='533'%3E%3Crect width='400' height='533' fill='%23eeeaf2'/%3E%3Ctext x='50%25' y='50%25' fill='%23a99fb5' font-family='sans-serif' font-size='20' text-anchor='middle'%3EAttire Destination%3C/text%3E%3C/svg%3E";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Fetch JSON from the API. Throws ApiError on a non-OK response so React Query
 * can distinguish success from failure.
 */
export async function apiFetch(path, { auth = false, ...opts } = {}) {
  const headers = { ...(opts.headers || {}) };

  if (auth) {
    const token = localStorage.getItem('boutique_token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (opts.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  if (!res.ok) {
    throw new ApiError(`Request failed: ${res.status}`, res.status);
  }
  if (res.status === 204) return null;
  return res.json();
}

/** Query key factories -- shared so any component can read or invalidate a cache entry. */
export const keys = {
  categories: () => ['categories'],
  products: (filters = {}) => ['products', filters],
  product: (id) => ['product', id],
  lookbook: () => ['lookbook'],
  favorites: () => ['favorites'],
  myOrders: () => ['orders', 'mine'],
};

export function fetchCategories() {
  return apiFetch('/api/products/categories');
}

export function fetchProduct(id) {
  return apiFetch(`/api/products/${id}`);
}

export function fetchProductPage({ categoryId, sortBy = 'popular', pageParam = 0 }) {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    skip: String(pageParam * PAGE_SIZE),
    sort_by: sortBy,
  });
  if (categoryId) params.set('category_id', categoryId);
  return apiFetch(`/api/products?${params}`);
}

/**
 * Ask the image host for the size the layout actually uses.
 *
 * Seeded URLs request w=1000 even for a ~300px grid cell, so most of every
 * product image is downloaded and thrown away. Unsplash and Pexels both size
 * from a query parameter; anything else is returned untouched.
 */
export function sizedImage(url, width) {
  if (!url || typeof url !== 'string') return url;
  try {
    const u = new URL(url);
    if (u.hostname.endsWith('unsplash.com')) {
      u.searchParams.set('w', String(width));
      u.searchParams.set('q', '75');
      u.searchParams.set('auto', 'format');
      return u.toString();
    }
    if (u.hostname.endsWith('pexels.com')) {
      u.searchParams.set('w', String(width));
      u.searchParams.set('auto', 'compress');
      return u.toString();
    }
    if (u.hostname.endsWith('cloudinary.com')) {
      // Insert a delivery transformation after /upload/ if none is present.
      return u.toString().replace(
        /\/image\/upload\/(?!.*\bw_\d)/,
        `/image/upload/f_auto,q_auto,w_${width}/`
      );
    }
    return url;
  } catch {
    return url;
  }
}

/** Products may arrive as a JSON array or as a JSON-encoded string. */
export function parseImages(images) {
  let imgs = images;
  if (typeof imgs === 'string') {
    try { imgs = JSON.parse(imgs); } catch { imgs = []; }
  }
  return Array.isArray(imgs) ? imgs : [];
}

export function firstImage(product, width = 400) {
  const imgs = parseImages(product?.images);
  return imgs.length > 0 ? sizedImage(imgs[0], width) : PLACEHOLDER_IMG;
}
