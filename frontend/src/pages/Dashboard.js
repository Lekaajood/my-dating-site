import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Radio, Workflow, TrendingUp, ArrowUp } from 'lucide-react';
import { API } from '@/App';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    window.addEventListener('pageChanged', loadStats);
    return () => window.removeEventListener('pageChanged', loadStats);
  }, []);

  const loadStats = async () => {
    try {
      const pageId = localStorage.getItem('selectedPageId');
      const res = await axios.get(`${API}/stats${pageId ? `?page_id=${pageId}` : ''}`);
      setStats(res.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'إجمالي المشتركين',
      value: stats?.total_subscribers || 0,
      icon: Users,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'المشتركين النشطين',
      value: stats?.active_subscribers || 0,
      icon: TrendingUp,
      color: 'teal',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600'
    },
    {
      title: 'إجمالي الرسائل',
      value: stats?.total_messages || 0,
      icon: MessageSquare,
      color: 'cyan',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600'
    },
    {
      title: 'Broadcasts',
      value: stats?.total_broadcasts || 0,
      icon: Radio,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Flows',
      value: stats?.total_flows || 0,
      icon: Workflow,
      color: 'violet',
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة التحكم</h1>
        <p className="text-gray-600">نظرة عامة على أداء حملاتك</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="card-hover" data-testid={`stat-card-${stat.title}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>مرحباً بك في Reply Alto Bot!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <h3 className="font-semibold text-emerald-900 mb-2">✨ ابدأ الآن</h3>
                <ul className="space-y-2 text-sm text-emerald-800">
                  <li>• أضف صفحة Facebook من القائمة الجانبية</li>
                  <li>• ابني Flow جديد للترحيب بالمشتركين</li>
                  <li>• أنشئ أول Broadcast لك</li>
                  <li>• فعّل الأتمتة التلقائية</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-2">📊 Demo Mode</h3>
                <p className="text-sm text-blue-800">
                  حالياً التطبيق في وضع Demo. يمكنك إضافة صفحات وهمية وتجربة كل الميزات.
                  لاحقاً يمكنك ربط Facebook App credentials من الإعدادات.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>آخر النشاطات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>لا توجد نشاطات بعد</p>
              <p className="text-sm">ابدأ بإنشاء Flow أو Broadcast</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}