import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, DollarSign, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BrandCard({ brand }) {
  const placeholderLogo = "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200&h=200&fit=crop&auto=format";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-lg">
        <div className="p-6">
          {/* Logo and Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-lg bg-stone-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-stone-700">
              {brand.logo_url ? (
                <img 
                  src={brand.logo_url} 
                  alt={brand.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = placeholderLogo; }}
                />
              ) : (
                <span className="text-2xl font-bold text-stone-400">
                  {brand.name[0]?.toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-stone-900 text-xl leading-tight mb-2">
                {brand.name}
              </h3>
              {brand.category && (
                <Badge className="bg-black text-white hover:bg-stone-900 text-xs shadow-none">
                  {brand.category}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {brand.description && (
            <p className="text-sm text-stone-600 mb-4 line-clamp-3 leading-relaxed">
              {brand.description}
            </p>
          )}

          {/* Program Details */}
          <div className="space-y-2 mb-4">
            {brand.commission_rate && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span className="text-stone-700">
                  <span className="font-medium text-emerald-600">{brand.commission_rate}</span> commission
                </span>
              </div>
            )}
            
            {brand.cookie_duration && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-stone-500" />
                <span className="text-stone-600">{brand.cookie_duration} cookie</span>
              </div>
            )}

            {brand.payment_terms && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-stone-500" />
                <span className="text-stone-600">{brand.payment_terms}</span>
              </div>
            )}
          </div>

          {/* Apply Button */}
          <Button
            variant="outline"
            className="w-full bg-white hover:bg-stone-50 text-stone-700 border-stone-300 rounded-lg h-10"
            onClick={() => window.open(brand.program_url, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Apply to Program
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}