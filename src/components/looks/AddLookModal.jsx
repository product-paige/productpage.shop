import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { Plus, Upload, Loader2, ImageIcon, X, Search, Tag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ScrollArea } from "@/components/ui/scroll-area";
import AddProductModal from '@/components/products/AddProductModal';

export default function AddLookModal({ open, onOpenChange, onLookAdded, editingLook, products }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  
  const [formData, setFormData] = useState(editingLook || {
    name: '',
    image_url: '',
    description: '',
    product_ids: [],
  });

  React.useEffect(() => {
    if (editingLook) {
      setFormData(editingLook);
    } else {
      setFormData({
        name: '',
        image_url: '',
        description: '',
        product_ids: [],
      });
    }
    setProductSearch('');
  }, [editingLook, open]);

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

  const toggleProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      product_ids: prev.product_ids?.includes(productId)
        ? prev.product_ids.filter(id => id !== productId)
        : [...(prev.product_ids || []), productId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Look name is required');
      return;
    }
    if (!formData.product_ids?.length) {
      toast.error('Please select at least one product');
      return;
    }

    setLoading(true);
    try {
      if (editingLook) {
        await base44.entities.Look.update(editingLook.id, formData);
        toast.success('Look updated!');
      } else {
        await base44.entities.Look.create(formData);
        toast.success('Look created!');
      }
      onLookAdded();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save look');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingLook ? 'Edit Look' : 'Create New Look'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Image */}
          <div className="space-y-3">
                <Label className="text-sm font-medium text-stone-700">Look Image</Label>
                {formData.image_url ? (
                  <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-stone-100">
                    <img 
                      src={formData.image_url} 
                      alt="Look" 
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
                <Label className="text-sm font-medium text-stone-700">Look Name *</Label>
                <Input
                  placeholder="e.g., Spring Brunch Outfit"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-10 rounded-lg border-stone-200"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-stone-700">Description</Label>
                <Textarea
                  placeholder="Describe this look..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[80px] rounded-lg border-stone-200 resize-none"
                />
              </div>

              {/* Products */}
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-stone-700">
                    Select Products * ({formData.product_ids?.length || 0} selected)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddProductModal(true)}
                    className="h-8 px-3 rounded-lg border-stone-200 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    New Product
                  </Button>
                </div>
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
                  {products.length === 0 ? (
                    <p className="text-sm text-stone-500 text-center py-4">No products available</p>
                  ) : (
                    products
                      .filter(p => 
                        p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.category?.toLowerCase().includes(productSearch.toLowerCase())
                      )
                      .map(product => (
                      <div key={product.id} className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded-lg transition-colors">
                        <Checkbox
                          checked={formData.product_ids?.includes(product.id)}
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

                {/* Ad Toggle */}
                <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg">
                <Checkbox
                  checked={formData.is_ad}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_ad: checked }))}
                />
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-stone-600" />
                  <Label className="text-sm font-medium text-stone-700 cursor-pointer">
                    Mark as sponsored/ad content
                  </Label>
                </div>
                </div>

                {/* Submit */}
          <div className="flex gap-3 pt-4">
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
              ) : editingLook ? (
                'Save Changes'
              ) : (
                'Create Look'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>

      <AddProductModal
        open={showAddProductModal}
        onOpenChange={setShowAddProductModal}
        onProductAdded={() => {
          queryClient.invalidateQueries({ queryKey: ['products'] });
          setShowAddProductModal(false);
        }}
      />
    </Dialog>
  );
}