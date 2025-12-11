import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Sparkles, SlidersHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';

import BrandCard from '@/components/brands/BrandCard';

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: () => base44.entities.Brand.list('-created_date'),
  });

  // Get unique categories
  const categories = [...new Set(brands.filter(b => b.category).map(b => b.category))].sort();

  const filteredBrands = brands.filter((brand) => {
    const matchesSearch = brand.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         brand.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || brand.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-orange-50/30">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-stone-900">Brand Marketplace</h1>
            </div>

            <Button
              onClick={() => window.location.href = '/dashboard'}
              variant="outline"
              className="h-9 px-4 rounded-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-3" style={{ fontFamily: 'Instrument Serif, serif' }}>
            Discover Affiliate Programs
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Browse and apply to top affiliate programs. Grow your earnings with trusted brands.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-lg border-stone-200 bg-white"
            />
          </div>
          
          {categories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 px-4 rounded-lg border-stone-200">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setSelectedCategory('all')}>
                  All Categories
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat} onClick={() => setSelectedCategory(cat)}>
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Active Filters */}
        {(selectedCategory !== 'all' || searchQuery) && (
          <div className="flex flex-wrap gap-2 mb-6 max-w-3xl mx-auto">
            {selectedCategory !== 'all' && (
              <Badge 
                variant="secondary" 
                className="bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer"
                onClick={() => setSelectedCategory('all')}
              >
                {selectedCategory} ×
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

        {/* Brands Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center mb-6 mx-auto">
              <Sparkles className="h-10 w-10 text-rose-500" />
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">
              No brands yet
            </h3>
            <p className="text-stone-500">
              Check back soon for new affiliate program opportunities!
            </p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-500">No brands match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredBrands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}