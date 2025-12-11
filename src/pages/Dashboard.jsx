import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Heart,
  Loader2,
  SlidersHorizontal,
  Sparkles,
  FolderOpen
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
import AddCollectionModal from '@/components/collections/AddCollectionModal';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Looks state
  const [showAddLookModal, setShowAddLookModal] = useState(false);
  const [editingLook, setEditingLook] = useState(null);
  const [viewingLook, setViewingLook] = useState(null);
  const [deleteLookConfirm, setDeleteLookConfirm] = useState(null);

  // Collections state
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);

  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
  });

  const { data: looks = [], isLoading: looksLoading } = useQuery({
    queryKey: ['looks'],
    queryFn: () => base44.entities.Look.list('-created_date'),
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: () => base44.entities.Collection.list('-created_date'),
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

  // Get unique categories and subcategories combined
  const allCategories = [
    ...new Set([
      ...products.filter(p => p.category).map(p => p.category),
      ...products.filter(p => p.subcategory).map(p => p.subcategory)
    ])
  ].sort();

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || 
                           selectedCategories.includes(product.category) || 
                           selectedCategories.includes(product.subcategory);
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
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-lg font-semibold text-stone-900">Affiliate Hub</h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => window.location.href = '/settings'}
                variant="outline"
                className="h-9 px-4 rounded-full"
              >
                Settings
              </Button>
              <Button
                onClick={() => {
                  if (activeTab === 'products') setShowAddModal(true);
                  else if (activeTab === 'looks') setShowAddLookModal(true);
                  else setShowCollectionModal(true);
                }}
                className="h-9 px-4 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 text-white border-0 shadow-md shadow-rose-500/20 text-sm"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                {activeTab === 'products' ? 'Add Product' : activeTab === 'looks' ? 'Add Look' : 'Add Collection'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 h-11 bg-stone-100 rounded-lg p-1">
            <TabsTrigger value="products" className="rounded-lg text-sm font-medium">
              All products
            </TabsTrigger>
            <TabsTrigger value="looks" className="rounded-lg text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-1.5" />
              Shop my style
            </TabsTrigger>
            <TabsTrigger value="collections" className="rounded-lg text-sm font-medium">
              <FolderOpen className="h-4 w-4 mr-1.5" />
              Collections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-0">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-4 border border-stone-100 shadow-sm"
          >
            <p className="text-xs text-stone-500 font-medium mb-1">Total Products</p>
            <p className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Instrument Serif, serif' }}>{products.length}</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-lg p-4 border border-stone-100 shadow-sm"
          >
            <p className="text-xs text-stone-500 font-medium mb-1">With Links</p>
            <p className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Instrument Serif, serif' }}>
              {products.filter(p => p.affiliate_link).length}
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-4 border border-stone-100 shadow-sm"
          >
            <p className="text-xs text-stone-500 font-medium mb-1">Categories</p>
            <p className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Instrument Serif, serif' }}>{allCategories.length}</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-lg p-4 border border-stone-100 shadow-sm"
          >
            <p className="text-xs text-stone-500 font-medium mb-1">Favorites</p>
            <p className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Instrument Serif, serif' }}>
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
              className="pl-10 h-10 rounded-lg border-stone-200 bg-white"
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 px-4 rounded-lg border-stone-200">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {selectedCategories.length === 0 ? 'All Categories' : `${selectedCategories.length} selected`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs font-semibold text-stone-500">
                  Filter by Category
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-64 overflow-y-auto">
                  {allCategories.map(cat => (
                    <DropdownMenuItem 
                      key={cat} 
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedCategories(prev => 
                          prev.includes(cat) 
                            ? prev.filter(c => c !== cat)
                            : [...prev, cat]
                        );
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedCategories.includes(cat)}
                        onCheckedChange={(checked) => {
                          setSelectedCategories(prev => 
                            checked 
                              ? [...prev, cat]
                              : prev.filter(c => c !== cat)
                          );
                        }}
                      />
                      <span className="text-sm">{cat}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setSelectedCategories([])}
                      className="text-xs text-stone-500 justify-center"
                    >
                      Clear all
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              className={`h-10 w-10 rounded-lg border-stone-200 ${showFavoritesOnly ? 'bg-rose-500 hover:bg-rose-600 border-0' : ''}`}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-white text-white' : ''}`} />
            </Button>

            <div className="flex bg-stone-100 rounded-lg p-1">
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
        {(selectedCategories.length > 0 || showFavoritesOnly || searchQuery) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCategories.map(cat => (
              <Badge 
                key={cat}
                variant="secondary" 
                className="bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer"
                onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}
              >
                {cat} ×
              </Badge>
            ))}
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

        {/* Products Grid/List */}
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
                  onEdit={handleEdit}
                  onDelete={(p) => setDeleteConfirm(p)}
                  onToggleFavorite={(p) => toggleFavoriteMutation.mutate(p)}
                />
              ))}
            </AnimatePresence>
          </div>
          )}
          </TabsContent>

          <TabsContent value="looks" className="mt-8">
            {looksLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : looks.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center mb-6 mx-auto">
                  <Sparkles className="h-10 w-10 text-rose-500" />
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-2">
                  No looks yet
                </h3>
                <p className="text-stone-500 text-center max-w-sm mb-8 mx-auto">
                  Create your first "Shop the Look" collection to showcase curated product combinations.
                </p>
                <Button
                  onClick={() => setShowAddLookModal(true)}
                  className="h-12 px-6 rounded-lg bg-black hover:bg-stone-900 text-white border-0"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Look
                </Button>
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
                      isAdmin={true}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="collections" className="mt-8">
            {collections.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center mb-6 mx-auto">
                  <FolderOpen className="h-10 w-10 text-rose-500" />
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-2">
                  No collections yet
                </h3>
                <p className="text-stone-500 text-center max-w-sm mb-8 mx-auto">
                  Create collections to organize your products into themed groups.
                </p>
                <Button
                  onClick={() => setShowCollectionModal(true)}
                  className="h-12 px-6 rounded-lg bg-black hover:bg-stone-900 text-white border-0"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Collection
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => {
                  const collectionProducts = products.filter(p => 
                    p.collection_ids?.includes(collection.id)
                  );
                  return (
                    <motion.div
                     key={collection.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-white rounded-lg border border-stone-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                     onClick={() => {
                       setEditingCollection(collection);
                       setShowCollectionModal(true);
                     }}
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
                       <h3 className="text-lg font-semibold text-stone-900 mb-1 group-hover:text-rose-600 transition-colors">{collection.name}</h3>
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
              </div>
            )}
          </TabsContent>
          </Tabs>
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

      {/* Add/Edit Look Modal */}
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

      {/* View Look Modal */}
      <ViewLookModal
        open={!!viewingLook}
        onOpenChange={() => setViewingLook(null)}
        look={viewingLook}
        products={products}
      />

      {/* Add/Edit Collection Modal */}
      <AddCollectionModal
        open={showCollectionModal}
        onOpenChange={() => {
          setShowCollectionModal(false);
          setEditingCollection(null);
        }}
        onCollectionAdded={() => {
          queryClient.invalidateQueries({ queryKey: ['collections'] });
          setShowCollectionModal(false);
          setEditingCollection(null);
        }}
        editingCollection={editingCollection}
      />

      {/* Delete Product Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteConfirm.id)}
              className="rounded-lg bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Look Confirmation */}
      <AlertDialog open={!!deleteLookConfirm} onOpenChange={() => setDeleteLookConfirm(null)}>
        <AlertDialogContent className="rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Look</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteLookConfirm?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteLookMutation.mutate(deleteLookConfirm.id)}
              className="rounded-lg bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
      );
      }