import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Play } from 'lucide-react';
import { toast } from 'sonner';

// Helper function to get embed URL
const getEmbedUrl = (url) => {
  if (!url) return null;
  
  // TikTok
  if (url.includes('tiktok.com')) {
    const videoIdMatch = url.match(/\/video\/(\d+)/);
    if (videoIdMatch) {
      return `https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`;
    }
  }
  
  // Instagram
  if (url.includes('instagram.com')) {
    const cleanUrl = url.split('?')[0];
    return `${cleanUrl}embed`;
  }
  
  return null;
};

export default function ViewLookModal({ open, onOpenChange, look, products }) {
  const [videoError, setVideoError] = useState(false);

  if (!look) return null;

  const lookProducts = products.filter(p => look.product_ids?.includes(p.id));
  const embedUrl = getEmbedUrl(look.video_url);
  const showVideo = look.video_url && embedUrl && !videoError;

  const copyAffiliateLink = (link) => {
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success('Link copied!');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{look.name}</DialogTitle>
          {look.description && (
            <p className="text-sm text-stone-600 mt-2">{look.description}</p>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 mt-4">
          {/* Left: Video or Image */}
          <div className="space-y-4">
            {showVideo ? (
              <div className="relative w-full max-w-[300px] aspect-[9/16] bg-stone-100 rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  scrolling="no"
                  allow="encrypted-media"
                  onError={() => setVideoError(true)}
                />
              </div>
            ) : look.image_url ? (
              <div className="relative w-full max-w-[300px] aspect-[9/16] bg-stone-100 rounded-lg overflow-hidden">
                <img
                  src={look.image_url}
                  alt={look.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full max-w-[300px] aspect-[9/16] bg-stone-100 rounded-lg flex items-center justify-center">
                <p className="text-stone-400">No media available</p>
              </div>
            )}
          </div>

          {/* Right: Products */}
          <div className="space-y-4 overflow-y-auto max-h-[70vh]">
            {lookProducts.map((product) => (
              <div key={product.id} className="flex gap-3 p-3 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200&h=200&fit=crop'}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-stone-900 text-sm mb-1">{product.name}</h4>
                  {product.notes && (
                    <p className="text-xs text-stone-600 mb-2 line-clamp-2">{product.notes}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {product.affiliate_links?.US && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.US, '_blank')}>🇺🇸</Button>}
                    {product.affiliate_links?.CA && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.CA, '_blank')}>🇨🇦</Button>}
                    {product.affiliate_links?.MX && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.MX, '_blank')}>🇲🇽</Button>}
                    {product.affiliate_links?.UK && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.UK, '_blank')}>🇬🇧</Button>}
                    {product.affiliate_links?.FR && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.FR, '_blank')}>🇫🇷</Button>}
                    {product.affiliate_links?.DE && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.DE, '_blank')}>🇩🇪</Button>}
                    {product.affiliate_links?.ES && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.ES, '_blank')}>🇪🇸</Button>}
                    {product.affiliate_links?.IT && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.IT, '_blank')}>🇮🇹</Button>}
                    {product.affiliate_links?.NL && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.NL, '_blank')}>🇳🇱</Button>}
                    {product.affiliate_links?.SE && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.SE, '_blank')}>🇸🇪</Button>}
                    {product.affiliate_links?.KR && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.KR, '_blank')}>🇰🇷</Button>}
                    {product.affiliate_links?.CN && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.CN, '_blank')}>🇨🇳</Button>}
                    {product.affiliate_links?.IN && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.IN, '_blank')}>🇮🇳</Button>}
                    {product.affiliate_links?.SG && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.SG, '_blank')}>🇸🇬</Button>}
                    {product.affiliate_links?.PH && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.PH, '_blank')}>🇵🇭</Button>}
                    {product.affiliate_links?.AU && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.AU, '_blank')}>🇦🇺</Button>}
                    {product.affiliate_links?.NZ && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.NZ, '_blank')}>🇳🇿</Button>}
                    {product.affiliate_links?.BR && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.BR, '_blank')}>🇧🇷</Button>}
                    {product.affiliate_links?.CO && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.CO, '_blank')}>🇨🇴</Button>}
                    {product.affiliate_links?.AE && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.AE, '_blank')}>🇦🇪</Button>}
                    {product.affiliate_links?.ZA && <Button size="sm" className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs" onClick={() => window.open(product.affiliate_links.ZA, '_blank')}>🇿🇦</Button>}
                    {product.affiliate_link && !product.affiliate_links && (
                      <Button
                        size="sm"
                        className="h-7 px-2 rounded-full bg-black hover:bg-stone-900 text-white text-xs"
                        onClick={() => window.open(product.affiliate_link, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Shop
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}