import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Crown, Link as LinkIcon, User, Instagram, MessageCircle, Youtube, Check, Upload, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';

export default function Settings() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || '',
    social_links: user?.social_links || { instagram: '', tiktok: '', youtube: '' },
    shop_title: user?.shop_title || '',
    shop_description: user?.shop_description || '',
    custom_links: user?.custom_links || [],
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        social_links: user.social_links || { instagram: '', tiktok: '', youtube: '' },
        shop_title: user.shop_title || '',
        shop_description: user.shop_description || '',
        custom_links: user.custom_links || [],
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Settings saved!');
    },
  });

  const handleSave = async (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, avatar_url: file_url }));
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpgradeToPro = async () => {
    setLoading(true);
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
          userId: user.id,
        }),
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      toast.error('Failed to start checkout');
      setLoading(false);
    }
  };

  const publicUrl = `${window.location.origin}/@${user?.username || ''}`;
  const isPro = user?.subscription_tier === 'pro';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-orange-50/30">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-stone-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-lg font-semibold text-stone-900">Settings</h1>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              variant="outline"
              className="h-9 px-4 rounded-lg"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Status */}
        <Card className="p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-stone-900 mb-2">Subscription</h2>
              <div className="flex items-center gap-2">
                {isPro ? (
                  <>
                    <Badge className="bg-gradient-to-r from-rose-500 to-orange-400 text-white border-0">
                      <Crown className="h-3 w-3 mr-1" />
                      Pro Plan
                    </Badge>
                    <span className="text-sm text-stone-600">$9/month • Unbranded</span>
                  </>
                ) : (
                  <>
                    <Badge className="bg-stone-100 text-stone-700">Free Plan</Badge>
                    <span className="text-sm text-stone-600">Branded with AffiliateHub</span>
                  </>
                )}
              </div>
            </div>
            {!isPro && (
              <Button
                onClick={handleUpgradeToPro}
                disabled={loading}
                className="bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 text-white border-0"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </>
                )}
              </Button>
            )}
          </div>

          {!isPro && (
            <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-lg p-4">
              <h3 className="font-semibold text-stone-900 mb-2">Upgrade to Pro</h3>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-rose-500" />
                  Remove "Powered by AffiliateHub" branding
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-rose-500" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-rose-500" />
                  Priority support
                </li>
              </ul>
            </div>
          )}
        </Card>

        {/* Profile Settings */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-stone-900 mb-6">Profile Settings</h2>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-700">
                <User className="h-4 w-4 inline mr-1" />
                Username
              </Label>
              <Input
                placeholder="yourname"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                className="h-10 rounded-lg border-stone-200"
              />
              {formData.username && (
                <div className="flex items-center gap-2 mt-2">
                  <LinkIcon className="h-4 w-4 text-stone-400" />
                  <span className="text-sm text-stone-500">{window.location.origin}/@{formData.username}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      toast.success('Link copied!');
                    }}
                    className="h-7 px-3 text-xs"
                  >
                    Copy Link
                  </Button>
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-700">Bio</Label>
              <Input
                placeholder="Tell your audience about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="h-10 rounded-lg border-stone-200"
              />
            </div>

            {/* Shop Title */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-700">Shop Page Title</Label>
              <Input
                placeholder="Shop my favorite products"
                value={formData.shop_title}
                onChange={(e) => setFormData(prev => ({ ...prev, shop_title: e.target.value }))}
                className="h-10 rounded-lg border-stone-200"
              />
            </div>

            {/* Shop Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-700">Shop Page Description</Label>
              <Input
                placeholder="Discover my curated collection of products and styled looks."
                value={formData.shop_description}
                onChange={(e) => setFormData(prev => ({ ...prev, shop_description: e.target.value }))}
                className="h-10 rounded-lg border-stone-200"
              />
            </div>

            {/* Avatar */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-stone-700">Profile Picture</Label>
              
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-2 border-stone-200">
                  <AvatarImage src={formData.avatar_url} alt="Profile" />
                  <AvatarFallback className="bg-gradient-to-br from-rose-500 to-orange-400 text-white text-2xl">
                    {formData.username?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-10 rounded-lg border-stone-200"
                        disabled={uploadingAvatar}
                        onClick={(e) => {
                          e.preventDefault();
                          e.currentTarget.previousElementSibling.click();
                        }}
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload Image
                      </Button>
                    </label>
                    {formData.avatar_url && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-lg border-stone-200"
                        onClick={() => setFormData(prev => ({ ...prev, avatar_url: '' }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Or paste image URL..."
                    value={formData.avatar_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                    className="h-10 rounded-lg border-stone-200"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-stone-900">Social Links</h3>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-stone-700">
                  <Instagram className="h-4 w-4 inline mr-1" />
                  Instagram URL
                </Label>
                <Input
                  placeholder="https://instagram.com/yourname"
                  value={formData.social_links?.instagram || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    social_links: { ...prev.social_links, instagram: e.target.value }
                  }))}
                  className="h-10 rounded-lg border-stone-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-stone-700">
                  <MessageCircle className="h-4 w-4 inline mr-1" />
                  TikTok URL
                </Label>
                <Input
                  placeholder="https://tiktok.com/@yourname"
                  value={formData.social_links?.tiktok || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    social_links: { ...prev.social_links, tiktok: e.target.value }
                  }))}
                  className="h-10 rounded-lg border-stone-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-stone-700">
                  <Youtube className="h-4 w-4 inline mr-1" />
                  YouTube URL
                </Label>
                <Input
                  placeholder="https://youtube.com/@yourname"
                  value={formData.social_links?.youtube || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    social_links: { ...prev.social_links, youtube: e.target.value }
                  }))}
                  className="h-10 rounded-lg border-stone-200"
                />
              </div>
            </div>

            <Separator />

            {/* Custom Menu Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-stone-900">Custom Menu Links</h3>
                <span className="text-xs text-stone-500">Max 4 links</span>
              </div>
              
              {formData.custom_links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Label (e.g., Podcast)"
                    value={link.label}
                    onChange={(e) => {
                      const newLinks = [...formData.custom_links];
                      newLinks[index] = { ...newLinks[index], label: e.target.value };
                      setFormData(prev => ({ ...prev, custom_links: newLinks }));
                    }}
                    className="h-10 rounded-lg border-stone-200 flex-1"
                  />
                  <Input
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...formData.custom_links];
                      newLinks[index] = { ...newLinks[index], url: e.target.value };
                      setFormData(prev => ({ ...prev, custom_links: newLinks }));
                    }}
                    className="h-10 rounded-lg border-stone-200 flex-[2]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-lg"
                    onClick={() => {
                      const newLinks = formData.custom_links.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, custom_links: newLinks }));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {formData.custom_links.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 rounded-lg border-dashed"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      custom_links: [...prev.custom_links, { label: '', url: '' }]
                    }));
                  }}
                >
                  + Add Link
                </Button>
              )}
            </div>

            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full h-11 rounded-lg bg-black hover:bg-stone-900 text-white"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </Card>

        {/* Public Link Preview */}
        {user?.username && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Your Public Link</h2>
            <div className="bg-stone-50 rounded-lg p-4 flex items-center justify-between">
              <code className="text-sm text-stone-700">{publicUrl}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/shop?preview=true'}
              >
                Preview Shop
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}