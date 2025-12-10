import React, { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, Upload, Loader2, ImageIcon, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AddProductModal({ open, onOpenChange, onProductAdded, editingProduct }) {
  const [activeTab, setActiveTab] = useState('url');
  const [loading, setLoading] = useState(false);
  const [fetchingImage, setFetchingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState(editingProduct || {
    name: '',
    product_url: '',
    affiliate_link: '',
    image_url: '',
    notes: '',
    category: '',
    commission_rate: '',
  });

  React.useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
    } else {
      setFormData({
        name: '',
        product_url: '',
        affiliate_link: '',
        image_url: '',
        notes: '',
        category: '',
        commission_rate: '',
      });
    }
  }, [editingProduct, open]);

  const fetchProductInfo = async () => {
    if (!formData.product_url) {
      toast.error('Please enter a product URL');
      return;
    }
    
    setFetchingImage(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract product information from this URL: ${formData.product_url}
        
        Try to identify:
        1. The product name
        2. A direct image URL for the product (look for og:image, product images, or main images)
        
        Return ONLY valid, working image URLs that end in image extensions or are from known CDNs.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            product_name: { type: "string" },
            image_url: { type: "string" }
          }
        }
      });

      if (result.product_name || result.image_url) {
        setFormData(prev => ({
          ...prev,
          name: prev.name || result.product_name || '',
          image_url: result.image_url || prev.image_url
        }));
        toast.success('Product info fetched!');
      } else {
        toast.info('Could not auto-fetch product info. Please enter manually.');
      }
    } catch (error) {
      toast.error('Failed to fetch product info');
    } finally {
      setFetchingImage(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Product name is required');
      return;
    }

    setLoading(true);
    try {
      if (editingProduct) {
        await base44.entities.Product.update(editingProduct.id, formData);
        toast.success('Product updated!');
      } else {
        await base44.entities.Product.create(formData);
        toast.success('Product added!');
      }
      onProductAdded();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Image Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-stone-700">Product Image</Label>
            
            {formData.image_url ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-stone-100">
                <img 
                  src={formData.image_url} 
                  alt="Product" 
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-10 bg-stone-100 rounded-lg p-1">
                  <TabsTrigger value="url" className="rounded-md text-xs font-medium">
                    <Link className="h-3.5 w-3.5 mr-1.5" /> From URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="rounded-md text-xs font-medium">
                    <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="mt-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste product page URL..."
                      value={formData.product_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, product_url: e.target.value }))}
                      className="flex-1 h-10 rounded-lg border-stone-200"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={fetchProductInfo}
                      disabled={fetchingImage}
                      className="h-10 px-4 rounded-lg border-stone-200"
                    >
                      {fetchingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Fetch'
                      )}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="upload" className="mt-3">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
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
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">Product Name *</Label>
            <Input
              placeholder="e.g., Summer Dress Collection"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="h-10 rounded-lg border-stone-200"
            />
          </div>

          {/* Affiliate Link */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">Affiliate Link</Label>
            <Input
              placeholder="Your affiliate URL..."
              value={formData.affiliate_link}
              onChange={(e) => setFormData(prev => ({ ...prev, affiliate_link: e.target.value }))}
              className="h-10 rounded-lg border-stone-200"
            />
          </div>

          {/* Category & Commission */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-700">Category</Label>
              <Input
                placeholder="e.g., Fashion"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="h-10 rounded-lg border-stone-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-700">Commission</Label>
              <Input
                placeholder="e.g., 15%"
                value={formData.commission_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: e.target.value }))}
                className="h-10 rounded-lg border-stone-200"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">Notes</Label>
            <Textarea
              placeholder="Talking points, why you love it, promo codes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="min-h-[100px] rounded-lg border-stone-200 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-xl border-stone-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 text-white border-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingProduct ? (
                'Save Changes'
              ) : (
                'Add Product'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}