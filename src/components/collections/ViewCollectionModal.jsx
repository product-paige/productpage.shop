import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function ViewCollectionModal({ open, onOpenChange, collection, products }) {
  if (!collection) return null;

  const collectionProducts = products.filter(p => p.collection_ids?.includes(collection.id));

  const copyAffiliateLink = (link) => {
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success('Link copied!');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{collection.name}</DialogTitle>
          {collection.description && (
            <p className="text-sm text-stone-600 mt-2">{collection.description}</p>
          )}
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {collectionProducts.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-8">No products in this collection</p>
          ) : (
            collectionProducts.map((product) => (
              <div key={product.id} className="flex gap-4 p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200&h=200&fit=crop'}
                  alt={product.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-stone-900 mb-1">{product.name}</h4>
                  {product.retailer && (
                    <p className="text-xs text-stone-500 mb-2">{product.retailer}</p>
                  )}
                  {product.notes && (
                    <p className="text-sm text-stone-600 mb-3">{product.notes}</p>
                  )}
                  <div className="flex flex-wrap gap-4">
                    {product.affiliate_links?.US && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className="h-8 px-3 rounded-full bg-black hover:bg-stone-900 text-white text-xs"
                          onClick={() => window.open(product.affiliate_links.US, '_blank')}
                        >
                          <span className="mr-2">🇺🇸</span> Shop now
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-full"
                          onClick={() => copyAffiliateLink(product.affiliate_links.US)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                    {product.affiliate_links?.CA && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className="h-8 px-3 rounded-full bg-black hover:bg-stone-900 text-white text-xs"
                          onClick={() => window.open(product.affiliate_links.CA, '_blank')}
                        >
                          <span className="mr-2">🇨🇦</span> Shop now
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-full"
                          onClick={() => copyAffiliateLink(product.affiliate_links.CA)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                    {product.affiliate_links?.UK && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className="h-8 px-3 rounded-full bg-black hover:bg-stone-900 text-white text-xs"
                          onClick={() => window.open(product.affiliate_links.UK, '_blank')}
                        >
                          <span className="mr-2">🇬🇧</span> Shop now
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-full"
                          onClick={() => copyAffiliateLink(product.affiliate_links.UK)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                    {product.affiliate_link && !product.affiliate_links && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className="h-8 px-3 rounded-full bg-black hover:bg-stone-900 text-white text-xs"
                          onClick={() => window.open(product.affiliate_link, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Shop Now
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-full"
                          onClick={() => copyAffiliateLink(product.affiliate_link)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}