import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Link as LinkIcon, TrendingUp, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function Landing() {
  const handleSignUp = async (tier) => {
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) {
      base44.auth.redirectToLogin(window.location.pathname + `?tier=${tier}`);
    } else {
      // Update user tier and redirect to dashboard
      await base44.auth.updateMe({ subscription_tier: tier });
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <h1 className="text-3xl font-bold text-stone-900" style={{ fontFamily: 'Instrument Serif, serif' }}>
              AffiliateHub
            </h1>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-stone-900 mb-6"
            style={{ fontFamily: 'Instrument Serif, serif' }}
          >
            Your Affiliate Links,
            <br />
            <span className="bg-gradient-to-r from-rose-500 to-orange-400 bg-clip-text text-transparent">
              One Beautiful Hub
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-stone-600 max-w-2xl mx-auto mb-8"
          >
            Create your personalized storefront. Share all your favorite products in one place. 
            Perfect for influencers, creators, and anyone who loves to share.
          </motion.p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="h-8 w-8 text-rose-500" />
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">One Link for Everything</h3>
            <p className="text-stone-600">
              Get your unique link like affiliatehub.com/@yourname to share everywhere
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">Curated Collections</h3>
            <p className="text-stone-600">
              Organize products into beautiful "Shop the Look" collections
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-rose-500" />
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">Track Performance</h3>
            <p className="text-stone-600">
              See what your audience loves with built-in analytics
            </p>
          </motion.div>
        </div>

        {/* Pricing */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-stone-900 mb-12" style={{ fontFamily: 'Instrument Serif, serif' }}>
            Choose Your Plan
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-8 border-2 border-stone-200 rounded-2xl hover:shadow-xl transition-all">
                <div className="mb-6">
                  <h4 className="text-2xl font-bold text-stone-900 mb-2">Free</h4>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-bold text-stone-900">$0</span>
                    <span className="text-stone-500">/month</span>
                  </div>
                  <Badge className="bg-stone-100 text-stone-700 hover:bg-stone-100">
                    Branded with AffiliateHub badge
                  </Badge>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span className="text-stone-600">Unlimited products</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span className="text-stone-600">Shop the Look collections</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span className="text-stone-600">Multi-region affiliate links</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span className="text-stone-600">Basic analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span className="text-stone-600">Your unique link (@username)</span>
                  </li>
                </ul>

                <Button
                  onClick={() => handleSignUp('free')}
                  className="w-full h-12 rounded-lg bg-stone-900 hover:bg-stone-800 text-white"
                >
                  Get Started Free
                </Button>
              </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="p-8 border-2 border-rose-500 rounded-2xl hover:shadow-xl transition-all relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-rose-500 to-orange-400 text-white border-0">
                    Most Popular
                  </Badge>
                </div>

                <div className="mb-6">
                  <h4 className="text-2xl font-bold text-stone-900 mb-2">Pro</h4>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-bold text-stone-900">$9</span>
                    <span className="text-stone-500">/month</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 hover:bg-rose-100">
                    <Zap className="h-3 w-3 mr-1" />
                    Fully unbranded
                  </Badge>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span className="text-stone-600"><strong>Everything in Free</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span className="text-stone-600"><strong>No AffiliateHub branding</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span className="text-stone-600">Advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span className="text-stone-600">Custom profile customization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span className="text-stone-600">Priority support</span>
                  </li>
                </ul>

                <Button
                  onClick={() => handleSignUp('pro')}
                  className="w-full h-12 rounded-lg bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 text-white border-0"
                >
                  Upgrade to Pro
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-20"
        >
          <p className="text-stone-500 text-sm">
            No credit card required for free plan • Cancel anytime
          </p>
        </motion.div>
      </div>
    </div>
  );
}