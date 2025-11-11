import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Search, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/App';

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSubscribers();
    window.addEventListener('pageChanged', loadSubscribers);
    return () => window.removeEventListener('pageChanged', loadSubscribers);
  }, []);

  const loadSubscribers = async () => {
    try {
      const pageId = localStorage.getItem('selectedPageId');
      if (!pageId) {
        setSubscribers([]);
        setLoading(false);
        return;
      }
      const res = await axios.get(`${API}/subscribers?page_id=${pageId}`);
      setSubscribers(res.data);
    } catch (error) {
      toast.error('فشل تحميل المشتركين');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const fullName = `${sub.first_name || ''} ${sub.last_name || ''}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="subscribers-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">المشتركين</h1>
        <p className="text-gray-600">إدارة مشتركي صفحتك</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن مشترك..."
            className="pr-10"
            data-testid="search-subscriber-input"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي المشتركين</p>
                <p className="text-2xl font-bold text-gray-800">{subscribers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">المشتركين النشطين</p>
                <p className="text-2xl font-bold text-gray-800">{subscribers.filter(s => s.subscribed).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">مع Tags</p>
                <p className="text-2xl font-bold text-gray-800">{subscribers.filter(s => s.tags?.length > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers List */}
      {filteredSubscribers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm ? 'لم يتم العثور على مشتركين' : 'لا يوجد مشتركين بعد'}
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              {searchTerm ? 'جرّب بحث آخر' : 'سيظهر المشتركون هنا عندما يبدؤون بالتفاعل مع صفحتك'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {filteredSubscribers.map(subscriber => (
                <div 
                  key={subscriber.id} 
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  data-testid={`subscriber-${subscriber.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-lg">
                        {(subscriber.first_name || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-800">
                          {subscriber.first_name || subscriber.last_name ? 
                            `${subscriber.first_name || ''} ${subscriber.last_name || ''}`.trim() : 
                            'مستخدم'}
                        </h3>
                        {subscriber.subscribed && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                            نشط
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        PSID: {subscriber.psid.substring(0, 20)}...
                      </p>
                      {subscriber.tags && subscriber.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {subscriber.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-left text-sm text-gray-500">
                      <p>آخر تفاعل</p>
                      <p className="font-medium">
                        {new Date(subscriber.last_interaction).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}