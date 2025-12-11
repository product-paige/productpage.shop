import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Loader2, ImageIcon, X, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AddCollectionModal({ open, onOpenChange, onCollectionAdded, editingCollection }) {
  const queryClient = useQueryClient();
  const [productSearch, setProductSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState(editingCollection || {
    name: '',
    description: '',
    image_url: '',
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
  });

  React.useEffect(() => {
    if (editingCollection) {
      setFormData(editingCollection);
    } else {
      setFormData({
        name: '',
        description: '',
        image_url: '',
      });
    }
    setProductSearch('');
  }, [editingCollection, open]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Get products currently in this collection
  const collectionProductIds = allProducts
    .filter(p => p.collection_ids?.includes(editingCollection?.id))
    .map(p => p.id);

  const [selectedProductIds, setSelectedProductIds] = useState([]);

  React.useEffect(() => {
    if (editingCollection && allProducts.length > 0) {
      setSelectedProductIds(collectionProductIds);
    } else {
      setSelectedProductIds([]);
    }
  }, [editingCollection, allProducts, open]);

  const toggleProduct = (productId) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const updateProductCollections = async (collectionId) => {
    const updates = [];
    
    // Add collection to newly selected products
    for (const productId of selectedProductIds) {
      const product = allProducts.find(p => p.id === productId);
      if (!product.collection_ids?.includes(collectionId)) {
        updates.push(
          base44.entities.Product.update(productId, {
            collection_ids: [...(product.collection_ids || []), collectionId]
          })
        );
      }
    }

    // Remove collection from deselected products
    for (const product of allProducts) {
      if (product.collection_ids?.includes(collectionId) && !selectedProductIds.includes(product.id)) {
        updates.push(
          base44.entities.Product.update(product.id, {
            collection_ids: product.collection_ids.filter(id => id !== collectionId)
          })
        );
      }
    }

    await Promise.all(updates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Collection name is required');
      return;
    }

    setLoading(true);
    try {
      let collectionId;
      if (editingCollection) {
        await base44.entities.Collection.update(editingCollection.id, formData);
        collectionId = editingCollection.id;
        toast.success('Collection updated!');
      } else {
        const newCollection = await base44.entities.Collection.create(formData);
        collectionId = newCollection.id;
        toast.success('Collection created!');
      }

      // Update product associations
      await updateProductCollections(collectionId);
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onCollectionAdded();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingCollection ? 'Edit Collection' : 'Create New Collection'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Image */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-stone-700">Cover Image (Optional)</Label>
            {formData.image_url ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-stone-100">
                <img 
                  src={formData.image_url} 
                  alt="Collection" 
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                  onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploadingImage ? (
                  <Loader2 className="h-8 w-8 text-stone-400 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-stone-400 mb-2" />
                    <span className="text-sm text-stone-500">Click to upload image</span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">Collection Name *</Label>
            <Input
              placeholder="e.g., Summer Essentials, Holiday Gifts"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="h-10 rounded-lg border-stone-200"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">Description</Label>
            <Textarea
              placeholder="Describe this collection..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[80px] rounded-lg border-stone-200 resize-none"
            />
          </div>

          {/* Products */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-stone-700">
              Products ({selectedProductIds.length} selected)
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-9 h-9 rounded-lg border-stone-200"
              />
            </div>
            <div className="border border-stone-200 rounded-lg p-3 space-y-2 max-h-64 overflow-y-auto">
              {allProducts.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-4">No products available</p>
              ) : (
                allProducts
                  .filter(p =>
                    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.category?.toLowerCase().includes(productSearch.toLowerCase())
                  )
                  .map(product => (
                    <div key={product.id} className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded-lg transition-colors">
                      <Checkbox
                        checked={selectedProductIds.includes(product.id)}
                        onCheckedChange={() => toggleProduct(product.id)}
                      />
                      <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=100&h=100&fit=crop'}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">{product.name}</p>
                        {product.price && (
                          <p className="text-xs text-stone-500">{product.price}</p>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-lg border-stone-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 rounded-lg bg-black hover:bg-stone-900 text-white border-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingCollection ? (
                'Save Changes'
              ) : (
                'Create Collection'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}