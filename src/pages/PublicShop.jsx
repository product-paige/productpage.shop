import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles, Instagram, MessageCircle, Youtube, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/products/ProductCard';
import LookCard from '@/components/looks/LookCard';
import ViewLookModal from '@/components/looks/ViewLookModal';

export default function PublicShop() {
  const [activeTab, setActiveTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingLook, setViewingLook] = useState(null);
  const [influencer, setInfluencer] = useState(null);
  const [username, setUsername] = useState('');

  // Get username from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user');
    if (user) {
      setUsername(user);
    }
  }, []);

  // Fetch influencer profile
  const { data: users = [] } = useQuery({
    queryKey: ['influencer', username],
    queryFn: () => base44.entities.User.list(),
    enabled: !!username,
  });

  useEffect(() => {
    if (users.length > 0 && username) {
      const user = users.find(u => u.username === username);
      setInfluencer(user);
    }
  }, [users, username]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
  });

  const { data: looks = [] } = useQuery({
    queryKey: ['looks'],
    queryFn: () => base44.entities.Look.list('-created_date'),
  });

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFree = !influencer || influencer.subscription_tier === 'free';

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Invalid Link</h2>
          <p className="text-stone-600">Please check your URL</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-orange-50/30">
      {/* Header with Profile */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center text-center">
            {influencer?.avatar_url && (
              <img
                src={influencer.avatar_url}
                alt={influencer.full_name}
                className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-white shadow-lg"
              />
            )}
            <h1 className="text-3xl font-bold text-stone-900 mb-2" style={{ fontFamily: 'Instrument Serif, serif' }}>
              {influencer?.full_name || username}
            </h1>
            {influencer?.bio && (
              <p className="text-stone-600 max-w-xl mb-4">{influencer.bio}</p>
            )}
            
            {/* Social Links */}
            {influencer?.social_links && (
              <div className="flex gap-3 mb-4">
                {influencer.social_links.instagram && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => window.open(influencer.social_links.instagram, '_blank')}
                  >
                    <Instagram className="h-4 w-4" />
                  </Button>
                )}
                {influencer.social_links.tiktok && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => window.open(influencer.social_links.tiktok, '_blank')}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}
                {influencer.social_links.youtube && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => window.open(influencer.social_links.youtube, '_blank')}
                  >
                    <Youtube className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Free Badge */}
            {isFree && (
              <Badge className="bg-gradient-to-r from-rose-500 to-orange-400 text-white border-0 text-xs">
                Powered by AffiliateHub
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-11 bg-stone-100 rounded-lg p-1">
            <TabsTrigger value="products" className="rounded-lg text-sm font-medium">
              All Products
            </TabsTrigger>
            <TabsTrigger value="looks" className="rounded-lg text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-1.5" />
              Shop the Look
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-8">
            {/* Search */}
            <div className="relative max-w-md mx-auto mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-lg border-stone-200 bg-white"
              />
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-stone-500">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isAdmin={false}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="looks" className="mt-8">
            {looks.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-stone-500">No looks available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
                  {looks.map((look) => (
                    <LookCard
                      key={look.id}
                      look={look}
                      products={products}
                      onViewProducts={(l) => setViewingLook(l)}
                      isAdmin={false}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* View Look Modal */}
      <ViewLookModal
        open={!!viewingLook}
        onOpenChange={() => setViewingLook(null)}
        look={viewingLook}
        products={products}
      />

      {/* Footer */}
      {isFree && (
        <footer className="text-center py-8 border-t border-stone-100 mt-12">
          <p className="text-sm text-stone-500 mb-2">
            Want your own affiliate hub?
          </p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => window.location.href = '/landing'}
          >
            Create Your Hub
          </Button>
        </footer>
      )}
    </div>
  );
}