import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Sparkles, Heart, SlidersHorizontal, FolderOpen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';

import ProductCard from '@/components/products/ProductCard';
import LookCard from '@/components/looks/LookCard';
import ViewLookModal from '@/components/looks/ViewLookModal';
import ViewCollectionModal from '@/components/collections/ViewCollectionModal';

export default function Shop() {
  const [activeTab, setActiveTab] = useState('looks');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingLook, setViewingLook] = useState(null);
  const [viewingCollection, setViewingCollection] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Track analytics
  const trackEvent = async (eventType, productId = null, lookId = null) => {
    try {
      await base44.entities.Analytics.create({
        event_type: eventType,
        product_id: productId,
        look_id: lookId,
        referrer: document.referrer || 'direct',
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  };

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
  });

  const { data: looks = [], isLoading: looksLoading } = useQuery({
    queryKey: ['looks'],
    queryFn: () => base44.entities.Look.list('-created_date'),
  });

  const { data: collections = [], isLoading: collectionsLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => base44.entities.Collection.list('-created_date'),
  });

  // Get unique categories and subcategories
  const categories = [...new Set(products.filter(p => p.category).map(p => p.category))];
  const subcategories = [...new Set(products.filter(p => p.subcategory).map(p => p.subcategory))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory || product.subcategory === filterCategory;
    const matchesFavorites = !showFavoritesOnly || product.is_favorite;
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const filteredLooks = looks.filter(look =>
    look.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCollections = collections.filter(collection =>
    collection.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-orange-50/30">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-lg font-semibold text-stone-900">Affiliate Hub</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-3" style={{ fontFamily: 'Instrument Serif, serif' }}>
            Shop My Favorites
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Discover my curated collection of products and styled looks. Click any item to shop!
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-11 bg-stone-100 rounded-lg p-1">
            <TabsTrigger value="looks" className="rounded-lg text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-1.5" />
              Shop my style
            </TabsTrigger>
            <TabsTrigger value="collections" className="rounded-lg text-sm font-medium">
              <FolderOpen className="h-4 w-4 mr-1.5" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg text-sm font-medium">
              All Products
            </TabsTrigger>
          </TabsList>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-lg border-stone-200 bg-white"
              />
            </div>
            
            {activeTab === 'products' && (
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 px-4 rounded-lg border-stone-200">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      {filterCategory === 'all' ? 'All Categories' : filterCategory}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
                    <DropdownMenuItem onClick={() => setFilterCategory('all')}>
                      All Categories
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {categories.map(cat => {
                      const catSubcategories = products
                        .filter(p => p.category === cat && p.subcategory)
                        .map(p => p.subcategory);
                      const uniqueSubs = [...new Set(catSubcategories)];
                      
                      return (
                        <div key={cat}>
                          <DropdownMenuItem onClick={() => setFilterCategory(cat)}>
                            <span className="font-medium">{cat}</span>
                          </DropdownMenuItem>
                          {uniqueSubs.map(sub => (
                            <DropdownMenuItem 
                              key={`${cat}-${sub}`} 
                              onClick={() => setFilterCategory(sub)}
                              className="pl-6 text-sm"
                            >
                              {sub}
                            </DropdownMenuItem>
                          ))}
                        </div>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant={showFavoritesOnly ? "default" : "outline"}
                  className={`h-10 w-10 rounded-lg border-stone-200 ${showFavoritesOnly ? 'bg-rose-500 hover:bg-rose-600 border-0' : ''}`}
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                >
                  <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-white text-white' : ''}`} />
                </Button>
              </div>
            )}
          </div>

          {/* Active Filters */}
          {activeTab === 'products' && (filterCategory !== 'all' || showFavoritesOnly || searchQuery) && (
            <div className="flex flex-wrap gap-2 mt-4 max-w-3xl mx-auto">
              {filterCategory !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer"
                  onClick={() => setFilterCategory('all')}
                >
                  {filterCategory} ×
                </Badge>
              )}
              {showFavoritesOnly && (
                <Badge 
                  variant="secondary" 
                  className="bg-rose-100 text-rose-700 hover:bg-rose-200 cursor-pointer"
                  onClick={() => setShowFavoritesOnly(false)}
                >
                  Favorites Only ×
                </Badge>
              )}
              {searchQuery && (
                <Badge 
                  variant="secondary" 
                  className="bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer"
                  onClick={() => setSearchQuery('')}
                >
                  "{searchQuery}" ×
                </Badge>
              )}
            </div>
          )}

          <TabsContent value="looks" className="mt-8">
            {looksLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : filteredLooks.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-stone-500">No looks found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredLooks.map((look) => (
                    <LookCard
                      key={look.id}
                      look={look}
                      products={products}
                      onViewProducts={(l) => {
                        trackEvent('look_view', null, l.id);
                        setViewingLook(l);
                      }}
                      isAdmin={false}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="collections" className="mt-8">
            {collectionsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : filteredCollections.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-stone-500">No collections found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredCollections.map((collection) => {
                    const collectionProducts = products.filter(p => 
                      p.collection_ids?.includes(collection.id)
                    );
                    return (
                      <motion.div
                        key={collection.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-lg border border-stone-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                        onClick={() => setViewingCollection(collection)}
                      >
                        <div className="aspect-video bg-gradient-to-br from-stone-100 to-stone-50 relative">
                          {collection.image_url ? (
                            <img src={collection.image_url} alt={collection.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FolderOpen className="h-12 w-12 text-stone-300" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-xl font-semibold text-stone-900 mb-1 group-hover:text-rose-600 transition-colors">{collection.name}</h3>
                          {collection.description && (
                            <p className="text-sm text-stone-500 mb-3">{collection.description}</p>
                          )}
                          <p className="text-xs text-stone-400">
                            {collectionProducts.length} {collectionProducts.length === 1 ? 'product' : 'products'}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="mt-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-stone-500">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onClick={() => trackEvent('product_view', product.id)}
                    >
                      <ProductCard
                        product={product}
                        onToggleFavorite={() => {}}
                        isAdmin={false}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* View Look Modal */}
      <ViewLookModal
        open={!!viewingLook}
        onOpenChange={() => setViewingLook(null)}
        look={viewingLook}
        products={products}
      />

      {/* View Collection Modal */}
      <ViewCollectionModal
        open={!!viewingCollection}
        onOpenChange={() => setViewingCollection(null)}
        collection={viewingCollection}
        products={products}
      />
    </div>
  );
}