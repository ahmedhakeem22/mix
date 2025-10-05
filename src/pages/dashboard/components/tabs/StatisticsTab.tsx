import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboardStatistics } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { useTheme } from '@/context/theme-provider';

function formatNumber(value: number | string) {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('ar-EG').format(isNaN(n) ? 0 : n);
}

function formatChange(change: number) {
  const sign = change > 0 ? '+' : change < 0 ? '' : '';
  const val = Math.abs(change).toFixed(0);
  const color = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-muted-foreground';
  return { text: `${sign}${val}% من الشهر الماضي`, color };
}

function normalizeRate(rate: number) {
  // API may return 0.05 (fraction) or 5 (percent). Convert to percentage.
  if (rate <= 1) return rate * 100;
  return rate;
}

export function StatisticsTab() {
  const { data, isLoading, isError } = useDashboardStatistics();
  const { theme } = useTheme();
  
  // تحديد ألوان الوضع الداكن والفاتح
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  const chartColors = {
    text: isDark ? '#f1f5f9' : '#334155',
    grid: isDark ? '#374151' : '#e2e8f0',
    background: isDark ? '#1f2937' : '#ffffff',
    primary: '#8b5cf6',
    secondary: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b'
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    );
  }

  if (isError || !data) {
    return <div className="text-center text-red-600">تعذر جلب البيانات حالياً</div>;
  }

  const { summary, views_chart, performance_chart } = data;
  const viewsChange = formatChange(summary.views.change);
  const inquiriesChange = formatChange(summary.inquiries.change);
  const conversionChange = formatChange(summary.conversion_rate.change);
  const ratePercent = normalizeRate(Number(summary.conversion_rate.rate));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>الإحصائيات</CardTitle>
          <CardDescription>إحصائيات الإعلانات والمشاهدات والاستفسارات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground mb-1">المشاهدات</div>
                <div className="text-2xl font-bold">{formatNumber(summary.views.total)}</div>
                <div className={`text-xs mt-1 ${viewsChange.color}`}>{viewsChange.text}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground mb-1">الاستفسارات</div>
                <div className="text-2xl font-bold">{formatNumber(summary.inquiries.total)}</div>
                <div className={`text-xs mt-1 ${inquiriesChange.color}`}>{inquiriesChange.text}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground mb-1">الإعلانات النشطة</div>
                <div className="text-2xl font-bold">{formatNumber(summary.active_listings.count)}</div>
                <div className="text-xs text-muted-foreground mt-1">من أصل {formatNumber(summary.active_listings.limit)} إعلان</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground mb-1">معدل التحويل</div>
                <div className="text-2xl font-bold">{ratePercent.toFixed(2)}%</div>
                <div className={`text-xs mt-1 ${conversionChange.color}`}>{conversionChange.text}</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المشاهدات</CardTitle>
          <CardDescription>إحصائيات المشاهدات خلال الأشهر الماضية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={views_chart} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: chartColors.text, fontSize: 12 }}
                  axisLine={{ stroke: chartColors.grid }}
                  tickLine={{ stroke: chartColors.grid }}
                />
                <YAxis 
                  tick={{ fill: chartColors.text, fontSize: 12 }}
                  axisLine={{ stroke: chartColors.grid }}
                  tickLine={{ stroke: chartColors.grid }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: chartColors.background,
                    border: `1px solid ${chartColors.grid}`,
                    borderRadius: '8px',
                    color: chartColors.text
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke={chartColors.primary} 
                  strokeWidth={2}
                  activeDot={{ r: 6, fill: chartColors.primary }} 
                  name="المشاهدات"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>أداء الإعلانات</CardTitle>
          <CardDescription>مقارنة أداء الإعلانات من حيث المشاهدات والاستفسارات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance_chart} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: chartColors.text, fontSize: 11 }}
                  axisLine={{ stroke: chartColors.grid }}
                  tickLine={{ stroke: chartColors.grid }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis 
                  tick={{ fill: chartColors.text, fontSize: 12 }}
                  axisLine={{ stroke: chartColors.grid }}
                  tickLine={{ stroke: chartColors.grid }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: chartColors.background,
                    border: `1px solid ${chartColors.grid}`,
                    borderRadius: '8px',
                    color: chartColors.text
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: chartColors.text }}
                />
                <Bar dataKey="views" fill={chartColors.primary} name="المشاهدات" />
                <Bar dataKey="inquiries" fill={chartColors.success} name="الاستفسارات" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
