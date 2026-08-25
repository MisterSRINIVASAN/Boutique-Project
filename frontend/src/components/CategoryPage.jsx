import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import ProductCard from './ProductCard';
import { fetchCategories, fetchProductPage, keys, sizedImage } from '../lib/api';

export default function CategoryPage() {
    const { id } = useParams();

    // Shares the cache entry the homepage already populated, so arriving from
    // a collection tile needs no category request at all.
    const { data: categories = [], isLoading: categoryLoading } = useQuery({
        queryKey: keys.categories(),
        queryFn: fetchCategories,
        staleTime: 5 * 60_000,
    });

    const category = useMemo(
        () => categories.find(c => c.id === id) ?? null,
        [categories, id]
    );

    const {
        data,
        isLoading: productsLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: keys.products({ categoryId: id, sortBy: 'popular' }),
        queryFn: ({ pageParam }) =>
            fetchProductPage({ categoryId: id, sortBy: 'popular', pageParam }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.reduce((n, p) => n + p.items.length, 0);
            return loaded < lastPage.total ? allPages.length : undefined;
        },
    });

    const products = useMemo(() => data?.pages.flatMap(p => p.items) ?? [], [data]);
    const totalProducts = data?.pages[0]?.total ?? 0;

    if (categoryLoading || productsLoading) {
        return <div className="text-center py-32 text-gray-400 font-medium">Loading collection...</div>;
    }

    if (!category) {
        return (
            <div className="text-center py-32">
                <h2 className="text-2xl font-serif text-gray-900 mb-4">Collection not found.</h2>
                <Link to="/" className="text-pink-600 underline font-bold">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Category Hero Banner */}
            <div className="relative w-full h-[40vh] sm:h-[50vh] bg-gray-100 flex items-center justify-center overflow-hidden">
                {category.image_url ? (
                    <img
                        src={sizedImage(category.image_url, 1200)}
                        alt={category.name}
                        fetchpriority="high"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-pink-100 to-purple-200"></div>
                )}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                
                <div className="relative z-10 text-center px-4 max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-serif font-black text-white tracking-tight drop-shadow-lg mb-4">
                        {category.name}
                    </h1>
                    {category.description && (
                        <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md">
                            {category.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex justify-between items-center mb-10">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                        Showing {products.length} of {totalProducts} {totalProducts === 1 ? 'Design' : 'Designs'}
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 border border-gray-100 rounded-3xl">
                        <p className="text-gray-500 text-lg">We are currently crafting new designs for this collection.</p>
                        <p className="text-gray-400 mt-2">Check back soon.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                            {products.map((product, i) => (
                                <div key={product.id} className="animate-fade-in">
                                    <ProductCard product={product} index={i} />
                                </div>
                            ))}
                        </div>
                        {hasNextPage && (
                            <div className="flex justify-center mt-12">
                                <button
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="border-2 border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 disabled:opacity-50 px-8 py-3 rounded-xl font-bold uppercase tracking-widest transition-all text-xs"
                                >
                                    {isFetchingNextPage ? 'Loading…' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
