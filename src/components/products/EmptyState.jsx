import React from 'react';
import { Button } from "@/components/ui/button";
import { Package, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState({ onAddProduct }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-4"
    >
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-600 to-yellow-600 flex items-center justify-center mb-8 shadow-2xl shadow-amber-500/30">
        <Package className="h-12 w-12 text-neutral-950" />
      </div>
      
      <h3 className="text-2xl font-semibold text-white mb-3">
        No products yet
      </h3>
      <p className="text-neutral-400 text-center max-w-md mb-10 leading-relaxed">
        Start building your exclusive affiliate product collection. Add your first product to begin curating your portfolio.
      </p>
      
      <Button
        onClick={onAddProduct}
        className="h-14 px-8 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:via-amber-400 hover:to-yellow-500 text-neutral-950 border-0 shadow-2xl shadow-amber-500/40 font-semibold tracking-wide"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Your First Product
      </Button>
    </motion.div>
  );
}