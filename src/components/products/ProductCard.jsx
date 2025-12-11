import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink, Copy, MoreHorizontal, Pencil, Trash2, Percent } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProductCard({ product, onEdit, onDelete, onToggleFavorite, isAdmin = true }) {
  // Get any available affiliate link
  const getAffiliateLink = () => {
    if (product.affiliate_links) {
      return product.affiliate_links.US || product.affiliate_links.CA || product.affiliate_links.UK;
    }
    return product.affiliate_link; // backwards compatibility
  };

  const hasMultipleRegions = product.affiliate_links && 
    Object.values(product.affiliate_links).filter(link => link).length > 1;

  const availableRegions = product.affiliate_links ? 
    Object.entries(product.affiliate_links)
      .filter(([_, link]) => link)
      .map(([region, _]) => region) : [];

  const copyAffiliateLink = async (e) => {
    e.stopPropagation();
    const link = getAffiliateLink();
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success('Affiliate link copied!');

      // Track affiliate click
      if (!isAdmin) {
        try {
          await base44.entities.Analytics.create({
            event_type: 'affiliate_click',
            product_id: product.id,
          });
        } catch (error) {
          console.error('Failed to track click:', error);
        }
      }
    }
  };

  const placeholderImage = "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=400&fit=crop&auto=format";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-lg">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-stone-100 to-stone-50 rounded-t-lg">
          <img
            src={product.image_url || placeholderImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.target.src = placeholderImage; }}
          />
          
          {/* Overlay actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Top actions */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {onToggleFavorite && (
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg"
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(product); }}
              >
                <Heart 
                  className={`h-4 w-4 transition-colors ${product.is_favorite ? 'fill-rose-500 text-rose-500' : 'text-stone-600'}`} 
                />
              </Button>
            )}
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4 text-stone-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => onEdit(product)}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(product)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Top left badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {!getAffiliateLink() && (
              <Badge className="bg-amber-500/90 text-white hover:bg-amber-500 border-0 shadow-sm text-xs font-medium w-fit">
                No Link
              </Badge>
            )}
            {product.is_ad && (
              <Badge className="bg-blue-500/90 text-white hover:bg-blue-500 border-0 shadow-sm text-xs font-medium w-fit">
                Ad
              </Badge>
            )}
            {product.category && (
              <Badge className="bg-white/90 text-stone-700 hover:bg-white border-0 shadow-sm text-xs font-medium">
                {product.category}
              </Badge>
            )}
          </div>

          {/* Bottom actions - Region buttons */}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {product.affiliate_links?.US && (
              <Button
                size="sm"
                className="flex-1 bg-black hover:bg-stone-900 text-white rounded-full h-9 text-xs font-medium"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!isAdmin) {
                    try {
                      await base44.entities.Analytics.create({
                        event_type: 'affiliate_click',
                        product_id: product.id,
                      });
                    } catch (error) {
                      console.error('Failed to track click:', error);
                    }
                  }
                  window.open(product.affiliate_links.US, '_blank');
                }}
              >
                🇺🇸 US
              </Button>
            )}
            {product.affiliate_links?.CA && (
              <Button
                size="sm"
                className="flex-1 bg-black hover:bg-stone-900 text-white rounded-full h-9 text-xs font-medium"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!isAdmin) {
                    try {
                      await base44.entities.Analytics.create({
                        event_type: 'affiliate_click',
                        product_id: product.id,
                      });
                    } catch (error) {
                      console.error('Failed to track click:', error);
                    }
                  }
                  window.open(product.affiliate_links.CA, '_blank');
                }}
              >
                🇨🇦 CA
              </Button>
            )}
            {product.affiliate_links?.UK && (
              <Button
                size="sm"
                className="flex-1 bg-black hover:bg-stone-900 text-white rounded-full h-9 text-xs font-medium"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!isAdmin) {
                    try {
                      await base44.entities.Analytics.create({
                        event_type: 'affiliate_click',
                        product_id: product.id,
                      });
                    } catch (error) {
                      console.error('Failed to track click:', error);
                    }
                  }
                  window.open(product.affiliate_links.UK, '_blank');
                }}
              >
                🇬🇧 UK
              </Button>
            )}
            {product.affiliate_link && !product.affiliate_links && (
              <Button
                size="sm"
                className="flex-1 bg-black hover:bg-stone-900 text-white rounded-full h-9 text-xs font-medium"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!isAdmin) {
                    try {
                      await base44.entities.Analytics.create({
                        event_type: 'affiliate_click',
                        product_id: product.id,
                      });
                    } catch (error) {
                      console.error('Failed to track click:', error);
                    }
                  }
                  window.open(product.affiliate_link, '_blank');
                }}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Shop
              </Button>
            )}
          </div>
        </div>

        <div className="p-4" onClick={isAdmin && onEdit ? () => onEdit(product) : undefined}>
          <h3 className="font-semibold text-stone-900 text-lg leading-tight mb-1">
            {product.name}
          </h3>

          {product.retailer && (
            <p className="text-xs text-stone-500 mb-2">
              {product.retailer}
            </p>
          )}

          {product.commission_rate && (
            <p className="text-xs text-emerald-600 font-medium mb-2">
              {product.commission_rate} commission
            </p>
          )}

          {product.notes && (
            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
              {product.notes}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}