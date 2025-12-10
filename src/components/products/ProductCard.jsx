import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink, Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProductCard({ product, onEdit, onDelete, onToggleFavorite }) {
  const copyAffiliateLink = (e) => {
    e.stopPropagation();
    if (product.affiliate_link) {
      navigator.clipboard.writeText(product.affiliate_link);
      toast.success('Affiliate link copied!');
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
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-stone-100 to-stone-50">
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
          </div>

          {/* Category badge */}
          {product.category && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-white/90 text-stone-700 hover:bg-white border-0 shadow-sm text-xs font-medium">
                {product.category}
              </Badge>
            </div>
          )}

          {/* Bottom actions */}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {product.affiliate_link && (
              <Button
                size="sm"
                className="flex-1 bg-black hover:bg-stone-900 text-white rounded-full h-9 text-xs font-medium"
                onClick={copyAffiliateLink}
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy Link
              </Button>
            )}
            {product.affiliate_link && (
              <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9 rounded-full bg-white/95 hover:bg-white shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(product.affiliate_link, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4 text-stone-600" />
              </Button>
            )}
          </div>
        </div>

        <div className="p-4" onClick={() => onEdit(product)}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-stone-900 text-base leading-tight flex-1">
              {product.name}
            </h3>
            {product.price && (
              <span className="text-base font-semibold text-stone-900 whitespace-nowrap">
                {product.price}
              </span>
            )}
          </div>

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