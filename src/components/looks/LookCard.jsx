import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, Package, Pin } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";

export default function LookCard({ look, products, onEdit, onDelete, onViewProducts, onTogglePin, isAdmin }) {
  const lookProducts = products.filter((p) => look.product_ids?.includes(p.id));
  const placeholderImage = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop&auto=format";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}>

      <Card className="group overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-lg">
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-stone-100 to-stone-50">
          <img
            src={look.image_url || placeholderImage}
            alt={look.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {e.target.src = placeholderImage;}} />

          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          {look.is_ad &&
          <div className="absolute top-3 left-3">
              <Badge className="bg-gray-100 text-gray-950 px-2.5 py-0.5 text-xs font-medium rounded-md inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-blue-500 border-0 w-fit">
                Ad
              </Badge>
            </div>
          }

          {/* Admin actions */}
          {isAdmin &&
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {onTogglePin && (
                <Button
                  size="icon"
                  variant="secondary"
                  className={`h-8 w-8 rounded-full shadow-lg ${look.is_pinned ? 'bg-rose-500 hover:bg-rose-600' : 'bg-white/90 hover:bg-white'}`}
                  onClick={(e) => { e.stopPropagation(); onTogglePin(look); }}
                >
                  <Pin className={`h-4 w-4 ${look.is_pinned ? 'text-white' : 'text-stone-600'}`} />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg"
                  onClick={(e) => e.stopPropagation()}>

                    <MoreHorizontal className="h-4 w-4 text-stone-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => onEdit(look)}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                  onClick={() => onDelete(look)}
                  className="text-red-600 focus:text-red-600">

                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }

          {/* View products button */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              className="w-full bg-black hover:bg-stone-900 text-white rounded-full h-9 text-xs font-medium"
              onClick={() => onViewProducts(look)}>

              <Package className="h-3.5 w-3.5 mr-1.5" />
              View {lookProducts.length} {lookProducts.length === 1 ? 'Item' : 'Items'}
            </Button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-stone-900 text-lg leading-tight mb-1">
            {look.name}
          </h3>
          {look.description &&
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
              {look.description}
            </p>
          }
        </div>
      </Card>
    </motion.div>);

}