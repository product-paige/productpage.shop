import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Sparkles, FolderOpen } from 'lucide-react';

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

export default function ViewProductModal({ open, onOpenChange, product, looks, collections, onViewLook, onViewCollection }) {
  if (!product) return null;

  const placeholderImage = "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=400&fit=crop&auto=format";

  // Find looks and collections featuring this product
  const featuredLooks = looks?.filter(look => look.product_ids?.includes(product.id)) || [];
  const featuredCollections = collections?.filter(collection => product.collection_ids?.includes(collection.id)) || [];

  // Get available regions
  const availableRegions = REGIONS.filter(region => product.affiliate_links?.[region.code]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 mt-4">
          {/* Left: Product Image */}
          <div className="space-y-4">
            <div className="relative w-full aspect-square bg-gradient-to-br from-stone-100 to-stone-50 rounded-lg overflow-hidden">
              <img
                src={product.image_url || placeholderImage}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = placeholderImage; }}
              />
            </div>

            {/* Retailer & Price */}
            {(product.retailer || product.price) && (
              <div className="space-y-1">
                {product.retailer && (
                  <p className="text-sm text-stone-600">{product.retailer}</p>
                )}
                {product.price && (
                  <p className="text-lg font-semibold text-stone-900">{product.price}</p>
                )}
              </div>
            )}

            {/* Commission */}
            {product.commission_rate && (
              <p className="text-sm text-emerald-600 font-medium">
                {product.commission_rate} commission
              </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.category && (
                <Badge variant="secondary" className="bg-stone-100 text-stone-700">
                  {product.category}
                </Badge>
              )}
              {product.is_ad && (
                <Badge className="bg-blue-500 text-white">
                  Sponsored
                </Badge>
              )}
            </div>
          </div>

          {/* Right: Details & Links */}
          <div className="space-y-6">
            {/* Notes */}
            {product.notes && (
              <div>
                <h4 className="text-sm font-semibold text-stone-900 mb-2">About this product</h4>
                <p className="text-sm text-stone-600 leading-relaxed">{product.notes}</p>
              </div>
            )}

            {/* Affiliate Links */}
            {availableRegions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-stone-900 mb-3">Shop by Region</h4>
                <div className="flex flex-wrap gap-2">
                  {availableRegions.map(region => (
                    <Button
                      key={region.code}
                      size="sm"
                      className="bg-black hover:bg-stone-900 text-white rounded-full h-8 px-3 text-xs font-medium"
                      onClick={() => window.open(product.affiliate_links[region.code], '_blank')}
                    >
                      {region.flag} {region.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Legacy Link */}
            {product.affiliate_link && !product.affiliate_links && (
              <div>
                <Button
                  className="w-full bg-black hover:bg-stone-900 text-white rounded-lg h-10"
                  onClick={() => window.open(product.affiliate_link, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Shop Now
                </Button>
              </div>
            )}

            {/* Featured in Looks */}
            {featuredLooks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Featured in Looks
                </h4>
                <div className="space-y-2">
                  {featuredLooks.map(look => (
                    <div
                      key={look.id}
                      className="flex items-center gap-3 p-3 border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors"
                      onClick={() => {
                        onOpenChange(false);
                        onViewLook(look);
                      }}
                    >
                      {look.image_url && (
                        <img
                          src={look.image_url}
                          alt={look.name}
                          className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-stone-900">{look.name}</h5>
                        {look.description && (
                          <p className="text-xs text-stone-500 line-clamp-1">{look.description}</p>
                        )}
                      </div>
                      <ExternalLink className="h-4 w-4 text-stone-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured in Collections */}
            {featuredCollections.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Part of Collections
                </h4>
                <div className="space-y-2">
                  {featuredCollections.map(collection => (
                    <div
                      key={collection.id}
                      className="flex items-center gap-3 p-3 border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors"
                      onClick={() => {
                        onOpenChange(false);
                        onViewCollection(collection);
                      }}
                    >
                      {collection.image_url && (
                        <img
                          src={collection.image_url}
                          alt={collection.name}
                          className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-stone-900">{collection.name}</h5>
                        {collection.description && (
                          <p className="text-xs text-stone-500 line-clamp-1">{collection.description}</p>
                        )}
                      </div>
                      <ExternalLink className="h-4 w-4 text-stone-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}