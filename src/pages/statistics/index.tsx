
import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, MessageSquare, BarChart2, Activity, Heart, ChevronUp, ChevronDown, DollarSign, Loader2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { useUserStats } from '@/hooks/use-api';

// Example data for charts - this would come from the API in a real implementation
const viewsData = [
  { name: 'السبت', count: 12 },
  { name: 'الأحد', count: 19 },
  { name: 'الاثنين', count: 15 },
  { name: 'الثلاثاء', count: 25 },
  { name: 'الأربعاء', count: 32 },
  { name: 'الخميس', count: 27 },
  { name: 'الجمعة', count: 30 },
];

const categoryData = [
  { name: 'عقارات', value: 35 },
  { name: 'سيارات', value: 25 },
  { name: 'الكترونيات', value: 20 },
  { name: 'أثاث', value: 15 },
  { name: 'أخرى', value: 5 },
];

const COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#8A898C'];

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: userStats, isLoading } = useUserStats();
  
  // Comparison with previous period
  const viewsChange = 15; // Percentage change
  const messagesChange = -8;
  const favoritesChange = 23;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header isLoggedIn={true} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand" />
            <p className="text-muted-foreground">جاري تحميل الإحصائيات...</p>
          </div>
        </main>
        <Footer />
        <MobileNav />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={true} />
      
      <main className="flex-1 pb-20 md:pb-0">
        <div className="bg-gray-50 border-b border-border">
          <div className="container px-4 mx-auto py-6">
            <h1 className="text-2xl font-bold">الإحصائيات</h1>
            <p className="text-muted-foreground">إحصائيات حسابك وإعلاناتك</p>
          </div>
        </div>
        
        <div className="container px-4 mx-auto py-6">
          {/* Stats overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">المشاهدات</p>
                    <p className="text-3xl font-bold mt-1">245</p>
                    <div className={`flex items-center mt-1 ${viewsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {viewsChange >= 0 ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                      <span className="text-xs">{Math.abs(viewsChange)}% من الأسبوع الماضي</span>
                    </div>
                  </div>
                  <div className="bg-brand/10 p-3 rounded-full">
                    <Eye className="h-6 w-6 text-brand" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">الرسائل</p>
                    <p className="text-3xl font-bold mt-1">18</p>
                    <div className={`flex items-center mt-1 ${messagesChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {messagesChange >= 0 ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                      <span className="text-xs">{Math.abs(messagesChange)}% من الأسبوع الماضي</span>
                    </div>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">المفضلة</p>
                    <p className="text-3xl font-bold mt-1">32</p>
                    <div className={`flex items-center mt-1 ${favoritesChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {favoritesChange >= 0 ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                      <span className="text-xs">{Math.abs(favoritesChange)}% من الأسبوع الماضي</span>
                    </div>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">الإعلانات النشطة</p>
                    <p className="text-3xl font-bold mt-1">8</p>
                    <div className="text-muted-foreground text-xs mt-1">
                      <span>من أصل 12 إعلان</span>
                    </div>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <BarChart2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs for different stats */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="ads">الإعلانات</TabsTrigger>
              <TabsTrigger value="engagement">التفاعل</TabsTrigger>
            </TabsList>
            
            {/* Overview tab content */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>مشاهدات آخر أسبوع</CardTitle>
                    <CardDescription>
                      إجمالي مشاهدات إعلاناتك في الأسبوع الماضي
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={viewsData}>
                          <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <CartesianGrid strokeDasharray="3 3" />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#8B5CF6" 
                            fillOpacity={1} 
                            fill="url(#colorViews)" 
                            name="المشاهدات"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>توزيع الإعلانات</CardTitle>
                    <CardDescription>
                      توزيع إعلاناتك حسب التصنيف
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>أكثر الإعلانات مشاهدة</CardTitle>
                    <CardDescription>
                      إعلاناتك التي حصلت على أكبر عدد من المشاهدات
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((_, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-md flex-shrink-0 ml-3"></div>
                            <div>
                              <p className="font-medium">عنوان الإعلان {index + 1}</p>
                              <p className="text-sm text-muted-foreground">التصنيف • المدينة</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 text-muted-foreground ml-1" />
                            <span className="text-sm">{123 - index * 30}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>أكثر الإعلانات تفاعلاً</CardTitle>
                    <CardDescription>
                      إعلاناتك التي حصلت على أكبر عدد من الرسائل
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((_, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-md flex-shrink-0 ml-3"></div>
                            <div>
                              <p className="font-medium">عنوان الإعلان {index + 1}</p>
                              <p className="text-sm text-muted-foreground">التصنيف • المدينة</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 text-muted-foreground ml-1" />
                            <span className="text-sm">{15 - index * 5}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Ads tab content */}
            <TabsContent value="ads">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>أداء الإعلانات</CardTitle>
                    <CardDescription>
                      مقارنة أداء إعلاناتك المختلفة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'إعلان 1', views: 120, messages: 10, favorites: 15 },
                            { name: 'إعلان 2', views: 98, messages: 8, favorites: 12 },
                            { name: 'إعلان 3', views: 86, messages: 12, favorites: 8 },
                            { name: 'إعلان 4', views: 99, messages: 5, favorites: 9 },
                            { name: 'إعلان 5', views: 85, messages: 4, favorites: 7 },
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="views" name="المشاهدات" fill="#8B5CF6" />
                          <Bar dataKey="messages" name="الرسائل" fill="#0EA5E9" />
                          <Bar dataKey="favorites" name="المفضلة" fill="#F97316" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>حالة الإعلانات</CardTitle>
                    <CardDescription>
                      توزيع إعلاناتك حسب الحالة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'نشط', value: 8 },
                              { name: 'قيد المراجعة', value: 2 },
                              { name: 'تم البيع', value: 3 },
                              { name: 'منتهي', value: 1 },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill="#10B981" />
                            <Cell fill="#F59E0B" />
                            <Cell fill="#3B82F6" />
                            <Cell fill="#6B7280" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="flex justify-between text-sm mt-4">
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full ml-2"></span>
                        <span>نشط (8)</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-amber-500 rounded-full ml-2"></span>
                        <span>قيد المراجعة (2)</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full ml-2"></span>
                        <span>تم البيع (3)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>مقارنة أسعار الإعلانات</CardTitle>
                  <CardDescription>
                    مقارنة أسعار إعلاناتك مع متوسط الأسعار في نفس التصنيف
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'عقار 1', yourPrice: 500000, avgPrice: 450000 },
                          { name: 'عقار 2', yourPrice: 700000, avgPrice: 720000 },
                          { name: 'سيارة 1', yourPrice: 85000, avgPrice: 90000 },
                          { name: 'سيارة 2', yourPrice: 75000, avgPrice: 70000 },
                          { name: 'جوال', yourPrice: 3500, avgPrice: 3000 },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toLocaleString()} SYP`} />
                        <Legend />
                        <Bar dataKey="yourPrice" name="سعرك" fill="#8B5CF6" />
                        <Bar dataKey="avgPrice" name="متوسط السعر" fill="#6B7280" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Engagement tab content */}
            <TabsContent value="engagement">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>معدل الاستجابة</CardTitle>
                    <CardDescription>
                      معدل استجابتك للرسائل الواردة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center p-6">
                      <div className="relative w-48 h-48">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="10"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#8B5CF6"
                            strokeWidth="10"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * 85) / 100}
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <span className="text-4xl font-bold">85%</span>
                          <span className="text-sm text-muted-foreground">معدل الاستجابة</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 w-full">
                        <div className="flex justify-between text-sm mb-1">
                          <span>متوسط وقت الرد</span>
                          <span className="font-medium">ساعتان</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-brand h-2 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                        <div className="flex justify-between mt-3">
                          <span className="text-xs text-muted-foreground">ممتاز: أقل من ساعة</span>
                          <span className="text-xs text-muted-foreground">ضعيف: أكثر من 24 ساعة</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>مصادر المشاهدات</CardTitle>
                    <CardDescription>
                      من أين يأتي الزوار لمشاهدة إعلاناتك
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'البحث', value: 55 },
                              { name: 'الصفحة الرئيسية', value: 20 },
                              { name: 'التصنيفات', value: 15 },
                              { name: 'وسائل التواصل', value: 10 },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill="#8B5CF6" />
                            <Cell fill="#D946EF" />
                            <Cell fill="#F97316" />
                            <Cell fill="#0EA5E9" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>ترويج الإعلانات</CardTitle>
                    <CardDescription>
                      تأثير ترويج الإعلانات على المشاهدات
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={[
                            { day: '1', normal: 15, promoted: 0 },
                            { day: '2', normal: 12, promoted: 0 },
                            { day: '3', normal: 17, promoted: 0 },
                            { day: '4', normal: 14, promoted: 0 },
                            { day: '5', normal: 10, promoted: 0 },
                            { day: '6', normal: 8, promoted: 0 },
                            { day: '7', normal: 11, promoted: 0 },
                            { day: '8', normal: 9, promoted: 0 },
                            { day: '9', normal: 5, promoted: 0 },
                            { day: '10', normal: 7, promoted: 0 },
                            { day: '11', normal: 0, promoted: 25 },
                            { day: '12', normal: 0, promoted: 38 },
                            { day: '13', normal: 0, promoted: 32 },
                            { day: '14', normal: 0, promoted: 30 },
                            { day: '15', normal: 0, promoted: 35 },
                          ]}
                        >
                          <defs>
                            <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6B7280" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#6B7280" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPromoted" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="day" />
                          <YAxis />
                          <CartesianGrid strokeDasharray="3 3" />
                          <Tooltip />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="normal" 
                            name="بدون ترويج" 
                            stroke="#6B7280" 
                            fillOpacity={1} 
                            fill="url(#colorNormal)" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="promoted" 
                            name="مع الترويج" 
                            stroke="#F97316" 
                            fillOpacity={1} 
                            fill="url(#colorPromoted)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex">
                        <DollarSign className="h-5 w-5 text-amber-500 ml-2 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-amber-800">زيادة المشاهدات بنسبة 300%</p>
                          <p className="text-sm text-amber-700 mt-1">
                            قم بترويج إعلاناتك للحصول على مشاهدات أكثر ومزيد من فرص البيع السريع.
                          </p>
                          <button className="mt-2 px-4 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-sm transition-colors">
                            ترويج الإعلانات
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      <MobileNav />
    </div>
  );
}
