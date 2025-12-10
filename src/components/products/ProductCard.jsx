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
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className="group overflow-hidden border border-amber-900/20 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 bg-gradient-to-br from-neutral-900 to-neutral-800">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900">
          <img
            src={product.image_url || placeholderImage}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
            onError={(e) => { e.target.src = placeholderImage; }}
          />
          
          {/* Overlay actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
          
          {/* Top actions */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-xl bg-neutral-950/80 hover:bg-neutral-950 backdrop-blur-sm border border-amber-500/20 shadow-xl"
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(product); }}
            >
              <Heart 
                className={`h-4 w-4 transition-colors ${product.is_favorite ? 'fill-amber-500 text-amber-500' : 'text-amber-300'}`} 
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 rounded-xl bg-neutral-950/80 hover:bg-neutral-950 backdrop-blur-sm border border-amber-500/20 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4 text-amber-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-neutral-900 border-amber-900/20">
                <DropdownMenuItem onClick={() => onEdit(product)} className="text-white focus:bg-neutral-800 focus:text-white">
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(product)}
                  className="text-red-400 focus:text-red-400 focus:bg-neutral-800"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Category badge */}
          {product.category && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-gradient-to-r from-amber-600 to-yellow-600 text-neutral-950 hover:from-amber-500 hover:to-yellow-500 border-0 shadow-lg text-xs font-semibold tracking-wide">
                {product.category}
              </Badge>
            </div>
          )}

          {/* Bottom actions */}
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150">
            {product.affiliate_link && (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:via-amber-400 hover:to-yellow-500 text-neutral-950 shadow-xl shadow-amber-500/40 rounded-xl h-10 text-xs font-bold tracking-wide border-0"
                onClick={copyAffiliateLink}
              >
                <Copy className="h-3.5 w-3.5 mr-2" />
                Copy Link
              </Button>
            )}
            {product.product_url && (
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 rounded-xl bg-neutral-950/80 hover:bg-neutral-950 backdrop-blur-sm border border-amber-500/20 shadow-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(product.product_url, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4 text-amber-300" />
              </Button>
            )}
          </div>
        </div>

        <div className="p-5" onClick={() => onEdit(product)}>
          <h3 className="font-semibold text-white truncate text-base mb-2 tracking-tight">
            {product.name}
          </h3>
          
          {product.commission_rate && (
            <p className="text-xs text-amber-400 font-semibold mb-2 tracking-wide uppercase">
              {product.commission_rate} commission
            </p>
          )}
          
          {product.notes && (
            <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
              {product.notes}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}