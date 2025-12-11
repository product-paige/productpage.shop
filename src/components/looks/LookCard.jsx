import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LookCard({ look, products, onEdit, onDelete, onViewProducts, isAdmin }) {
  const lookProducts = products.filter(p => look.product_ids?.includes(p.id));
  const placeholderImage = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop&auto=format";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-stone-100 to-stone-50">
          <img
            src={look.image_url || placeholderImage}
            alt={look.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.target.src = placeholderImage; }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-black/80 text-white hover:bg-black border-0 text-xs font-medium">
              Shop the Look
            </Badge>
          </div>

          {/* Admin actions */}
          {isAdmin && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                  <DropdownMenuItem onClick={() => onEdit(look)}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(look)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* View products button */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              className="w-full bg-black hover:bg-stone-900 text-white rounded-full h-9 text-xs font-medium"
              onClick={() => onViewProducts(look)}
            >
              <Package className="h-3.5 w-3.5 mr-1.5" />
              View {lookProducts.length} {lookProducts.length === 1 ? 'Item' : 'Items'}
            </Button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-stone-900 text-lg leading-tight mb-1">
            {look.name}
          </h3>
          {look.description && (
            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
              {look.description}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}