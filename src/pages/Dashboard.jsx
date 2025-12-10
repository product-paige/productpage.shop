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
import LookCard from '@/components/looks/LookCard';
import AddLookModal from '@/components/looks/AddLookModal';
import ViewLookModal from '@/components/looks/ViewLookModal';

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [user, setUser] = useState(null);
  const [showAddLookModal, setShowAddLookModal] = useState(false);
  const [editingLook, setEditingLook] = useState(null);
  const [viewingLook, setViewingLook] = useState(null);
  const [deleteLookConfirm, setDeleteLookConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('products');

  const queryClient = useQueryClient();

  // Check if user is admin
  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const isAdmin = user?.role === 'admin';

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
  });

  const { data: looks = [], isLoading: isLoadingLooks } = useQuery({
    queryKey: ['looks'],
    queryFn: () => base44.entities.Look.list('-created_date'),
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

  const deleteLookMutation = useMutation({
    mutationFn: (id) => base44.entities.Look.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['looks'] });
      toast.success('Look deleted');
      setDeleteLookConfirm(null);
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

  const handleEditLook = (look) => {
    setEditingLook(look);
    setShowAddLookModal(true);
  };

  const handleCloseLookModal = () => {
    setShowAddLookModal(false);
    setEditingLook(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-orange-50/30">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-lg font-semibold text-stone-900">Affiliate Hub</h1>
            </div>

            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="h-9 px-4 rounded-full bg-black hover:bg-stone-900 text-white border-0 text-sm"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Product
                </Button>
                <Button
                  onClick={() => setShowAddLookModal(true)}
                  className="h-9 px-4 rounded-full bg-black hover:bg-stone-900 text-white border-0 text-sm"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Look
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-stone-200">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'products'
                ? 'border-black text-black'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            All products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('looks')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'looks'
                ? 'border-black text-black'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            Shop the Look ({looks.length})
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm"
          >
            <p className="text-xs text-stone-500 font-medium mb-1">Total Products</p>
            <p className="text-2xl font-bold text-stone-900">{products.length}</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm"
          >
            <p className="text-xs text-stone-500 font-medium mb-1">With Links</p>
            <p className="text-2xl font-bold text-stone-900">
              {products.filter(p => p.affiliate_link).length}
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm"
          >
            <p className="text-xs text-stone-500 font-medium mb-1">Categories</p>
            <p className="text-2xl font-bold text-stone-900">{categories.length}</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm"
          >
            <p className="text-xs text-stone-500 font-medium mb-1">Favorites</p>
            <p className="text-2xl font-bold text-stone-900">
              {products.filter(p => p.is_favorite).length}
            </p>
          </motion.div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl border-stone-200 bg-white"
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 px-4 rounded-xl border-stone-200">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {filterCategory === 'all' ? 'All Categories' : filterCategory}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setFilterCategory('all')}>
                  All Categories
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {categories.map(cat => (
                  <DropdownMenuItem key={cat} onClick={() => setFilterCategory(cat)}>
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              className={`h-10 w-10 rounded-xl border-stone-200 ${showFavoritesOnly ? 'bg-rose-500 hover:bg-rose-600 border-0' : ''}`}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-white text-white' : ''}`} />
            </Button>

            <div className="flex bg-stone-100 rounded-xl p-1">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
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

        {/* Content */}
        {activeTab === 'products' ? (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : products.length === 0 ? (
              <EmptyState onAddProduct={() => setShowAddModal(true)} />
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-stone-500">No products match your filters</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                  : "flex flex-col gap-4"
              }>
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={isAdmin ? handleEdit : null}
                      onDelete={isAdmin ? (p) => setDeleteConfirm(p) : null}
                      onToggleFavorite={(p) => toggleFavoriteMutation.mutate(p)}
                      isAdmin={isAdmin}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        ) : (
          <>
            {isLoadingLooks ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : looks.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-stone-500 mb-4">No looks created yet</p>
                {isAdmin && (
                  <Button
                    onClick={() => setShowAddLookModal(true)}
                    className="h-10 px-6 rounded-xl bg-black hover:bg-stone-900 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Look
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
                  {looks.map((look) => (
                    <LookCard
                      key={look.id}
                      look={look}
                      products={products}
                      onEdit={handleEditLook}
                      onDelete={(l) => setDeleteLookConfirm(l)}
                      onViewProducts={(l) => setViewingLook(l)}
                      isAdmin={isAdmin}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
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

      {/* Modals */}
      <AddLookModal
        open={showAddLookModal}
        onOpenChange={handleCloseLookModal}
        onLookAdded={() => {
          queryClient.invalidateQueries({ queryKey: ['looks'] });
          handleCloseLookModal();
        }}
        editingLook={editingLook}
        products={products}
      />

      <ViewLookModal
        open={!!viewingLook}
        onOpenChange={() => setViewingLook(null)}
        look={viewingLook}
        products={products}
      />

      {/* Delete Confirmations */}
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

      <AlertDialog open={!!deleteLookConfirm} onOpenChange={() => setDeleteLookConfirm(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Look</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteLookConfirm?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteLookMutation.mutate(deleteLookConfirm.id)}
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