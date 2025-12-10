import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ProductCard from '@/components/products/ProductCard';
import LookCard from '@/components/looks/LookCard';
import ViewLookModal from '@/components/looks/ViewLookModal';

export default function Shop() {
  const [activeTab, setActiveTab] = useState('looks');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingLook, setViewingLook] = useState(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
  });

  const { data: looks = [], isLoading: looksLoading } = useQuery({
    queryKey: ['looks'],
    queryFn: () => base44.entities.Look.list('-created_date'),
  });

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLooks = looks.filter(look =>
    look.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-11 bg-stone-100 rounded-lg p-1">
            <TabsTrigger value="looks" className="rounded-lg text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-1.5" />
              Shop my style
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg text-sm font-medium">
              All Products
            </TabsTrigger>
          </TabsList>

          {/* Search */}
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-lg border-stone-200 bg-white"
            />
          </div>

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
                      onViewProducts={(l) => setViewingLook(l)}
                      isAdmin={false}
                    />
                  ))}
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
                    <ProductCard
                      key={product.id}
                      product={product}
                      onToggleFavorite={() => {}}
                      isAdmin={false}
                    />
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
    </div>
  );
}