import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, MousePointerClick, Eye, Sparkles, Package } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

export default function Analytics() {
  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => base44.entities.Analytics.list('-created_date', 1000),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: looks = [] } = useQuery({
    queryKey: ['looks'],
    queryFn: () => base44.entities.Look.list(),
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalClicks = analytics.filter(a => a.event_type === 'affiliate_click').length;
    const totalViews = analytics.filter(a => a.event_type === 'product_view').length;
    const lookViews = analytics.filter(a => a.event_type === 'look_view').length;
    const productClicks = analytics.filter(a => a.event_type === 'product_click').length;

    return { totalClicks, totalViews, lookViews, productClicks };
  }, [analytics]);

  // Daily clicks/views for last 7 days
  const dailyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      return {
        date: format(date, 'MMM d'),
        clicks: 0,
        views: 0,
      };
    });

    analytics.forEach(event => {
      const eventDate = startOfDay(new Date(event.created_date));
      const dayIndex = last7Days.findIndex(d => {
        const targetDate = subDays(new Date(), 6 - last7Days.indexOf(d));
        return startOfDay(targetDate).getTime() === eventDate.getTime();
      });

      if (dayIndex !== -1) {
        if (event.event_type === 'affiliate_click') {
          last7Days[dayIndex].clicks += 1;
        } else if (event.event_type === 'product_view') {
          last7Days[dayIndex].views += 1;
        }
      }
    });

    return last7Days;
  }, [analytics]);

  // Top products by clicks
  const topProducts = useMemo(() => {
    const productStats = {};
    
    analytics.forEach(event => {
      if (event.product_id && (event.event_type === 'affiliate_click' || event.event_type === 'product_click')) {
        if (!productStats[event.product_id]) {
          productStats[event.product_id] = { clicks: 0, views: 0 };
        }
        if (event.event_type === 'affiliate_click') {
          productStats[event.product_id].clicks += 1;
        }
      }
      if (event.product_id && event.event_type === 'product_view') {
        if (!productStats[event.product_id]) {
          productStats[event.product_id] = { clicks: 0, views: 0 };
        }
        productStats[event.product_id].views += 1;
      }
    });

    return Object.entries(productStats)
      .map(([productId, stats]) => {
        const product = products.find(p => p.id === productId);
        return {
          id: productId,
          name: product?.name || 'Unknown Product',
          ...stats,
          conversionRate: stats.views > 0 ? ((stats.clicks / stats.views) * 100).toFixed(1) : 0,
        };
      })
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);
  }, [analytics, products]);

  // Event type distribution
  const eventDistribution = useMemo(() => {
    const dist = {
      'Affiliate Clicks': 0,
      'Product Views': 0,
      'Look Views': 0,
      'Product Clicks': 0,
    };

    analytics.forEach(event => {
      if (event.event_type === 'affiliate_click') dist['Affiliate Clicks'] += 1;
      if (event.event_type === 'product_view') dist['Product Views'] += 1;
      if (event.event_type === 'look_view') dist['Look Views'] += 1;
      if (event.event_type === 'product_click') dist['Product Clicks'] += 1;
    });

    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [analytics]);

  const COLORS = ['#f43f5e', '#f97316', '#eab308', '#22c55e'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-orange-50/30">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-stone-900">Analytics Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-0 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-600">Affiliate Clicks</span>
              <MousePointerClick className="h-4 w-4 text-rose-500" />
            </div>
            <p className="text-3xl font-semibold text-stone-900" style={{ fontFamily: 'Instrument Serif, serif' }}>
              {metrics.totalClicks}
            </p>
          </Card>

          <Card className="p-6 border-0 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-600">Product Views</span>
              <Eye className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-3xl font-semibold text-stone-900" style={{ fontFamily: 'Instrument Serif, serif' }}>
              {metrics.totalViews}
            </p>
          </Card>

          <Card className="p-6 border-0 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-600">Look Views</span>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-3xl font-semibold text-stone-900" style={{ fontFamily: 'Instrument Serif, serif' }}>
              {metrics.lookViews}
            </p>
          </Card>

          <Card className="p-6 border-0 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-600">Total Products</span>
              <Package className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-3xl font-semibold text-stone-900" style={{ fontFamily: 'Instrument Serif, serif' }}>
              {products.length}
            </p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 border-0 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Last 7 Days Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="date" tick={{ fill: '#78716c', fontSize: 12 }} />
                <YAxis tick={{ fill: '#78716c', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e7e5e4',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Line type="monotone" dataKey="clicks" stroke="#f43f5e" strokeWidth={2} name="Clicks" />
                <Line type="monotone" dataKey="views" stroke="#f97316" strokeWidth={2} name="Views" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 border-0 shadow-sm">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Event Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eventDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top Products Table */}
        <Card className="p-6 border-0 shadow-sm">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Top Performing Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-stone-600">Product</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-stone-600">Views</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-stone-600">Clicks</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-stone-600">Conv. Rate</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-stone-500 text-sm">
                      No product data yet. Share your shop link to start tracking!
                    </td>
                  </tr>
                ) : (
                  topProducts.map((product) => (
                    <tr key={product.id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="py-3 px-4 text-sm text-stone-900">{product.name}</td>
                      <td className="py-3 px-4 text-sm text-stone-600 text-right">{product.views}</td>
                      <td className="py-3 px-4 text-sm text-stone-900 text-right font-medium">{product.clicks}</td>
                      <td className="py-3 px-4 text-sm text-green-600 text-right font-medium">{product.conversionRate}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}