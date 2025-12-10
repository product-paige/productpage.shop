import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Heart,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import ProductCard from '@/components/products/ProductCard';
import AddProductModal from '@/components/products/AddProductModal';
import EmptyState from '@/components/products/EmptyState';

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
      setDeleteConfirm(null);
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (product) => 
      base44.entities.Product.update(product.id, { is_favorite: !product.is_favorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Get unique categories
  const categories = [...new Set(products.filter(p => p.category).map(p => p.category))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesFavorites = !showFavoritesOnly || product.is_favorite;
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-neutral-950/60 border-b border-amber-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-neutral-950 font-bold text-lg">A</span>
              </div>
              <h1 className="text-xl font-semibold text-white tracking-tight">Affiliate Collection</h1>
            </div>
            
            <Button
              onClick={() => setShowAddModal(true)}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:via-amber-400 hover:to-yellow-500 text-neutral-950 border-0 shadow-lg shadow-amber-500/30 text-sm font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 border border-amber-900/20 shadow-xl"
          >
            <p className="text-xs text-amber-500/70 font-medium mb-2 uppercase tracking-wider">Total Products</p>
            <p className="text-3xl font-bold text-white">{products.length}</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 border border-amber-900/20 shadow-xl"
          >
            <p className="text-xs text-amber-500/70 font-medium mb-2 uppercase tracking-wider">With Links</p>
            <p className="text-3xl font-bold text-white">
              {products.filter(p => p.affiliate_link).length}
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 border border-amber-900/20 shadow-xl"
          >
            <p className="text-xs text-amber-500/70 font-medium mb-2 uppercase tracking-wider">Categories</p>
            <p className="text-3xl font-bold text-white">{categories.length}</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 border border-amber-900/20 shadow-xl"
          >
            <p className="text-xs text-amber-500/70 font-medium mb-2 uppercase tracking-wider">Favorites</p>
            <p className="text-3xl font-bold text-white">
              {products.filter(p => p.is_favorite).length}
            </p>
          </motion.div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/50" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-xl border border-amber-900/20 bg-neutral-900 text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:ring-amber-500/20"
            />
          </div>
          
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 px-5 rounded-xl border-amber-900/20 bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {filterCategory === 'all' ? 'All Categories' : filterCategory}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-neutral-900 border-amber-900/20">
                <DropdownMenuItem onClick={() => setFilterCategory('all')} className="text-white focus:bg-neutral-800 focus:text-white">
                  All Categories
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-amber-900/20" />
                {categories.map(cat => (
                  <DropdownMenuItem key={cat} onClick={() => setFilterCategory(cat)} className="text-white focus:bg-neutral-800 focus:text-white">
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              className={`h-12 w-12 rounded-xl ${showFavoritesOnly ? 'bg-gradient-to-br from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 border-0 shadow-lg shadow-amber-500/30' : 'border-amber-900/20 bg-neutral-900 hover:bg-neutral-800'}`}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-neutral-950 text-neutral-950' : 'text-white'}`} />
            </Button>

            <div className="flex bg-neutral-900 border border-amber-900/20 rounded-xl p-1.5">
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 rounded-lg ${viewMode === 'grid' ? 'bg-gradient-to-br from-amber-600 to-yellow-600 text-neutral-950 shadow-md' : 'text-white hover:bg-neutral-800 hover:text-white'}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 rounded-lg ${viewMode === 'list' ? 'bg-gradient-to-br from-amber-600 to-yellow-600 text-neutral-950 shadow-md' : 'text-white hover:bg-neutral-800 hover:text-white'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(filterCategory !== 'all' || showFavoritesOnly || searchQuery) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filterCategory !== 'all' && (
              <Badge 
                variant="secondary" 
                className="bg-neutral-800 text-amber-400 hover:bg-neutral-700 cursor-pointer border border-amber-900/20 px-3 py-1"
                onClick={() => setFilterCategory('all')}
              >
                {filterCategory} ×
              </Badge>
            )}
            {showFavoritesOnly && (
              <Badge 
                variant="secondary" 
                className="bg-neutral-800 text-amber-400 hover:bg-neutral-700 cursor-pointer border border-amber-900/20 px-3 py-1"
                onClick={() => setShowFavoritesOnly(false)}
              >
                Favorites Only ×
              </Badge>
            )}
            {searchQuery && (
              <Badge 
                variant="secondary" 
                className="bg-neutral-800 text-amber-400 hover:bg-neutral-700 cursor-pointer border border-amber-900/20 px-3 py-1"
                onClick={() => setSearchQuery('')}
              >
                "{searchQuery}" ×
              </Badge>
            )}
          </div>
        )}

        {/* Products Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState onAddProduct={() => setShowAddModal(true)} />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-400">No products match your filters</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-4"
          }>
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={(p) => setDeleteConfirm(p)}
                  onToggleFavorite={(p) => toggleFavoriteMutation.mutate(p)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      <AddProductModal
        open={showAddModal}
        onOpenChange={handleCloseModal}
        onProductAdded={() => {
          queryClient.invalidateQueries({ queryKey: ['products'] });
          handleCloseModal();
        }}
        editingProduct={editingProduct}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteConfirm.id)}
              className="rounded-xl bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}