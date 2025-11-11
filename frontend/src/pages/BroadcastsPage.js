import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Radio, Trash2, Send, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/App';

export default function BroadcastsPage() {
  const navigate = useNavigate();
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBroadcasts();
    window.addEventListener('pageChanged', loadBroadcasts);
    return () => window.removeEventListener('pageChanged', loadBroadcasts);
  }, []);

  const loadBroadcasts = async () => {
    try {
      const pageId = localStorage.getItem('selectedPageId');
      if (!pageId) {
        setBroadcasts([]);
        setLoading(false);
        return;
      }
      const res = await axios.get(`${API}/broadcasts?page_id=${pageId}`);
      setBroadcasts(res.data);
    } catch (error) {
      toast.error('فشل تحميل Broadcasts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا Broadcast؟')) return;
    try {
      await axios.delete(`${API}/broadcasts/${id}`);
      toast.success('تم حذف Broadcast');
      loadBroadcasts();
    } catch (error) {
      toast.error('فشل حذف Broadcast');
    }
  };

  const handleSend = async (id) => {
    if (!window.confirm('هل أنت متأكد من إرسال هذا Broadcast الآن؟')) return;
    try {
      await axios.post(`${API}/broadcasts/${id}/send`);
      toast.success('تم إرسال Broadcast بنجاح!');
      loadBroadcasts();
    } catch (error) {
      toast.error('فشل إرسال Broadcast');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'draft': 'bg-gray-100 text-gray-700',
      'scheduled': 'bg-blue-100 text-blue-700',
      'sending': 'bg-yellow-100 text-yellow-700',
      'sent': 'bg-emerald-100 text-emerald-700'
    };
    const labels = {
      'draft': 'مسودة',
      'scheduled': 'مجدول',
      'sending': 'قيد الإرسال',
      'sent': 'تم الإرسال'
    };
    return (
      <span className={`text-xs px-2 py-1 rounded ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="broadcasts-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Broadcasts</h1>
          <p className="text-gray-600">أرسل رسائل جماعية لمشتركينك</p>
        </div>
        <Button 
          onClick={() => navigate('/broadcasts/new')}
          className="bg-emerald-500 hover:bg-emerald-600"
          data-testid="create-broadcast-btn"
        >
          <Plus className="w-4 h-4 ml-2" />
          Broadcast جديد
        </Button>
      </div>

      {broadcasts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
              <Radio className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد Broadcasts بعد</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              ابدأ بإنشاء أول Broadcast لك! أرسل رسائل جماعية مع كروت وأزرار لكل مشتركينك.
            </p>
            <Button 
              onClick={() => navigate('/broadcasts/new')}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="w-4 h-4 ml-2" />
              إنشاء أول Broadcast
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {broadcasts.map(broadcast => (
            <Card key={broadcast.id} className="card-hover" data-testid={`broadcast-card-${broadcast.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{broadcast.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      {getStatusBadge(broadcast.status)}
                      <span className="text-xs text-gray-500">
                        {new Date(broadcast.created_at).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                  <Radio className="w-8 h-8 text-emerald-500" />
                </div>

                {broadcast.status === 'sent' && (
                  <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600">المستلمين</p>
                      <p className="text-lg font-semibold text-gray-800">{broadcast.total_recipients || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">تم التسليم</p>
                      <p className="text-lg font-semibold text-emerald-600">{broadcast.delivered_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">تمت القراءة</p>
                      <p className="text-lg font-semibold text-blue-600">{broadcast.read_count || 0}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {broadcast.status === 'draft' && (
                    <>
                      <Button
                        onClick={() => handleSend(broadcast.id)}
                        size="sm"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                        data-testid={`send-broadcast-${broadcast.id}`}
                      >
                        <Send className="w-4 h-4 ml-2" />
                        إرسال الآن
                      </Button>
                      <Button
                        onClick={() => handleDelete(broadcast.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`delete-broadcast-${broadcast.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {broadcast.status === 'sent' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      عرض التفاصيل
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}