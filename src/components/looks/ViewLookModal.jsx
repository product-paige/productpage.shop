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

export default function ViewLookModal({ open, onOpenChange, look, products }) {
  if (!look) return null;

  const lookProducts = products.filter(p => look.product_ids?.includes(p.id));

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
          <DialogTitle className="text-xl font-semibold">{look.name}</DialogTitle>
          {look.description && (
            <p className="text-sm text-stone-600 mt-2">{look.description}</p>
          )}
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {lookProducts.map((product) => (
            <div key={product.id} className="flex gap-4 p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200&h=200&fit=crop'}
                alt={product.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-stone-900">{product.name}</h4>
                  {product.price && (
                    <span className="font-semibold text-stone-900 whitespace-nowrap">{product.price}</span>
                  )}
                </div>
                {product.notes && (
                  <p className="text-sm text-stone-600 mb-3">{product.notes}</p>
                )}
                <div className="flex gap-2">
                  {product.affiliate_link && (
                    <>
                      <Button
                        size="sm"
                        className="h-8 px-3 rounded-full bg-black hover:bg-stone-900 text-white text-xs"
                        onClick={() => copyAffiliateLink(product.affiliate_link)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 rounded-full text-xs"
                        onClick={() => window.open(product.affiliate_link, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Shop Now
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}