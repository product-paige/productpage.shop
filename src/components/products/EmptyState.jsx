import React from 'react';
import { Button } from "@/components/ui/button";
import { Package, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState({ onAddProduct }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center mb-6">
        <Package className="h-10 w-10 text-rose-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-stone-900 mb-2">
        No products yet
      </h3>
      <p className="text-stone-500 text-center max-w-sm mb-8">
        Start building your affiliate product collection. Add your first product to get started.
      </p>
      
      <Button
        onClick={onAddProduct}
        className="h-12 px-6 rounded-lg bg-black hover:bg-stone-900 text-white border-0"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Your First Product
      </Button>
    </motion.div>
  );
}