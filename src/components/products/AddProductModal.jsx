import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Checkbox } from "@/components/ui/checkbox";
import { Link, Upload, Loader2, ImageIcon, X, Tag, ChevronsUpDown, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const REGIONS = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
];

export default function AddProductModal({ open, onOpenChange, onProductAdded, editingProduct }) {
  const [activeTab, setActiveTab] = useState('url');
  const [loading, setLoading] = useState(false);
  const [fetchingImage, setFetchingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [imageOptions, setImageOptions] = useState([]);

  const { data: collections = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: () => base44.entities.Collection.list(),
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ['all-products'],
    queryFn: () => base44.entities.Product.list(),
  });

  // Extract unique categories and subcategories
  const existingCategories = [...new Set(allProducts.filter(p => p.category).map(p => p.category))].sort();
  const existingSubcategories = [...new Set(allProducts.filter(p => p.subcategory).map(p => p.subcategory))].sort();

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [subcategoryOpen, setSubcategoryOpen] = useState(false);
  
  const [formData, setFormData] = useState(editingProduct || {
    name: '',
    retailer: '',
    price: '',
    product_url: '',
    affiliate_links: {},
    image_url: '',
    notes: '',
    category: '',
    subcategory: '',
    commission_rate: '',
    collection_ids: [],
    is_ad: false,
  });

  React.useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
    } else {
      setFormData({
        name: '',
        retailer: '',
        price: '',
        product_url: '',
        affiliate_links: {},
        image_url: '',
        notes: '',
        category: '',
        subcategory: '',
        commission_rate: '',
        collection_ids: [],
        is_ad: false,
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
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-stone-100">
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
                    <Link className="h-3.5 w-3.5 mr-1.5" /> Image URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="rounded-md text-xs font-medium">
                    <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="mt-3">
                  <Input
                    placeholder="Paste image URL (e.g., https://example.com/image.jpg)"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    className="h-10 rounded-lg border-stone-200"
                  />
                </TabsContent>
                
                <TabsContent value="upload" className="mt-3">
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
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Product URL */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">Product Page URL</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Original product page link..."
                value={formData.product_url}
                onChange={(e) => setFormData(prev => ({ ...prev, product_url: e.target.value }))}
                className="h-10 rounded-lg border-stone-200"
              />
              <Button
                type="button"
                variant="outline"
                onClick={fetchProductInfo}
                disabled={fetchingImage || !formData.product_url}
                className="h-10 px-4 rounded-lg border-stone-200 whitespace-nowrap"
              >
                {fetchingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Auto-fill'
                )}
              </Button>
            </div>
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

          {/* Retailer & Price */}
          <div className="grid grid-cols-[1fr,auto] gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-700">Retailer/Brand</Label>
              <Input
                placeholder="e.g., Zara, Nike, Amazon"
                value={formData.retailer}
                onChange={(e) => setFormData(prev => ({ ...prev, retailer: e.target.value }))}
                className="h-10 rounded-lg border-stone-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-700">Price</Label>
              <Input
                placeholder="$99"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="h-10 rounded-lg border-stone-200 w-24"
              />
            </div>
          </div>

          {/* Affiliate Links by Region */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-stone-700">Affiliate Links by Region</Label>
            
            {/* Add Region Dropdown */}
            <div className="flex gap-2">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="flex-1 h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm"
              >
                <option value="">Select region to add...</option>
                {REGIONS.filter(region => !formData.affiliate_links?.[region.code]).map(region => (
                  <option key={region.code} value={region.code}>
                    {region.flag} {region.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (selectedRegion) {
                    setFormData(prev => ({
                      ...prev,
                      affiliate_links: { ...(prev.affiliate_links || {}), [selectedRegion]: '' }
                    }));
                    setSelectedRegion('');
                  }
                }}
                disabled={!selectedRegion}
                className="h-10 px-4 rounded-lg"
              >
                Add
              </Button>
            </div>

            {/* Active Regions */}
            {Object.keys(formData.affiliate_links || {}).filter(code => formData.affiliate_links[code] !== undefined).length > 0 && (
              <div className="space-y-2 border border-stone-200 rounded-lg p-3 max-h-[250px] overflow-y-auto">
                {Object.entries(formData.affiliate_links || {})
                  .filter(([_, link]) => link !== undefined)
                  .map(([code, link]) => {
                    const region = REGIONS.find(r => r.code === code);
                    if (!region) return null;
                    return (
                      <div key={code} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-stone-500 font-normal">
                            {region.flag} {region.name}
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setFormData(prev => {
                                const newLinks = { ...prev.affiliate_links };
                                delete newLinks[code];
                                return { ...prev, affiliate_links: newLinks };
                              });
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <Input
                          placeholder={`${region.name} affiliate link...`}
                          value={link || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            affiliate_links: { ...(prev.affiliate_links || {}), [code]: e.target.value }
                          }))}
                          className="h-9 rounded-lg border-stone-200"
                        />
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-700">Category</Label>
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={categoryOpen}
                    className="w-full h-10 justify-between rounded-lg border-stone-200"
                  >
                    {formData.category || "Select category..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search or type new..." 
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    />
                    <CommandEmpty>
                      <div className="p-2 text-sm text-stone-500">
                        Press Enter to create "{formData.category}"
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="max-h-[200px]">
                        {existingCategories.map((cat) => (
                          <CommandItem
                            key={cat}
                            value={cat}
                            onSelect={(value) => {
                              setFormData(prev => ({ ...prev, category: value }));
                              setCategoryOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.category === cat ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {cat}
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-700">Subcategory</Label>
              <Popover open={subcategoryOpen} onOpenChange={setSubcategoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={subcategoryOpen}
                    className="w-full h-10 justify-between rounded-lg border-stone-200"
                  >
                    {formData.subcategory || "Select subcategory..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search or type new..." 
                      value={formData.subcategory}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value }))}
                    />
                    <CommandEmpty>
                      <div className="p-2 text-sm text-stone-500">
                        Press Enter to create "{formData.subcategory}"
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="max-h-[200px]">
                        {existingSubcategories.map((sub) => (
                          <CommandItem
                            key={sub}
                            value={sub}
                            onSelect={(value) => {
                              setFormData(prev => ({ ...prev, subcategory: value }));
                              setSubcategoryOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.subcategory === sub ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {sub}
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Commission */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">Commission</Label>
            <Input
              placeholder="e.g., 15%"
              value={formData.commission_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: e.target.value }))}
              className="h-10 rounded-lg border-stone-200"
            />
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

          {/* Collections */}
          {collections.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-700">Collections</Label>
              <div className="border border-stone-200 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                {collections.map(collection => (
                  <div key={collection.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.collection_ids?.includes(collection.id)}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          collection_ids: checked
                            ? [...(prev.collection_ids || []), collection.id]
                            : (prev.collection_ids || []).filter(id => id !== collection.id)
                        }));
                      }}
                    />
                    <span className="text-sm text-stone-700">{collection.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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