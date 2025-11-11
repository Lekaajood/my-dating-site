import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Zap, Trash2, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/App';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AutomationsPage() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    type: 'comment_to_message',
    trigger: { keyword: '' }
  });

  useEffect(() => {
    loadAutomations();
    window.addEventListener('pageChanged', loadAutomations);
    return () => window.removeEventListener('pageChanged', loadAutomations);
  }, []);

  const loadAutomations = async () => {
    try {
      const pageId = localStorage.getItem('selectedPageId');
      if (!pageId) {
        setAutomations([]);
        setLoading(false);
        return;
      }
      const res = await axios.get(`${API}/automations?page_id=${pageId}`);
      setAutomations(res.data);
    } catch (error) {
      toast.error('فشل تحميل الأتمتة');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const pageId = localStorage.getItem('selectedPageId');
    if (!pageId) {
      toast.error('الرجاء اختيار صفحة أولاً');
      return;
    }
    try {
      await axios.post(`${API}/automations`, { ...newAutomation, page_id: pageId });
      toast.success('تم إنشاء الأتمتة بنجاح!');
      setShowDialog(false);
      setNewAutomation({ name: '', type: 'comment_to_message', trigger: { keyword: '' } });
      loadAutomations();
    } catch (error) {
      toast.error('فشل إنشاء الأتمتة');
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await axios.patch(`${API}/automations/${id}?is_active=${!isActive}`);
      toast.success(!isActive ? 'تم تفعيل الأتمتة' : 'تم إيقاف الأتمتة');
      loadAutomations();
    } catch (error) {
      toast.error('فشل تغيير حالة الأتمتة');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الأتمتة؟')) return;
    try {
      await axios.delete(`${API}/automations/${id}`);
      toast.success('تم حذف الأتمتة');
      loadAutomations();
    } catch (error) {
      toast.error('فشل حذف الأتمتة');
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      'comment_to_message': 'Comment to Message',
      'welcome_message': 'رسالة ترحيب',
      'keyword': 'كلمة مفتاحية'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="automations-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">الأتمتة</h1>
          <p className="text-gray-600">ردود تلقائية على التعليقات والرسائل</p>
        </div>
        <Button 
          onClick={() => setShowDialog(true)}
          className="bg-emerald-500 hover:bg-emerald-600"
          data-testid="create-automation-btn"
        >
          <Plus className="w-4 h-4 ml-2" />
          أتمتة جديدة
        </Button>
      </div>

      {automations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد أتمتة بعد</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              ابدأ بإنشاء أول أتمتة! رد تلقائياً على تعليقات Facebook وأرسل رسائل في الماسنجر.
            </p>
            <Button 
              onClick={() => setShowDialog(true)}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="w-4 h-4 ml-2" />
              إنشاء أول أتمتة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automations.map(automation => (
            <Card key={automation.id} className="card-hover" data-testid={`automation-card-${automation.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{automation.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                        {getTypeLabel(automation.type)}
                      </span>
                    </div>
                    {automation.trigger?.keyword && (
                      <div className="mb-3">
                        <span className="text-xs text-gray-600">الكلمة المفتاحية:</span>
                        <p className="text-sm font-medium text-gray-800">"{automation.trigger.keyword}"</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggle(automation.id, automation.is_active)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    data-testid={`toggle-automation-${automation.id}`}
                  >
                    {automation.is_active ? (
                      <Power className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <PowerOff className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className={`text-sm ${automation.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {automation.is_active ? 'نشط' : 'متوقف'}
                  </span>
                  <Button
                    onClick={() => handleDelete(automation.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    data-testid={`delete-automation-${automation.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Automation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء أتمتة جديدة</DialogTitle>
            <DialogDescription>
              رد تلقائياً على تعليقات ورسائل المشتركين
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>اسم الأتمتة</Label>
              <Input
                value={newAutomation.name}
                onChange={(e) => setNewAutomation({ ...newAutomation, name: e.target.value })}
                placeholder="مثال: رد تلقائي على كلمة عرض"
                required
                data-testid="automation-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label>نوع الأتمتة</Label>
              <Select
                value={newAutomation.type}
                onValueChange={(value) => setNewAutomation({ ...newAutomation, type: value })}
              >
                <SelectTrigger data-testid="automation-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comment_to_message">Comment to Message</SelectItem>
                  <SelectItem value="welcome_message">رسالة ترحيب</SelectItem>
                  <SelectItem value="keyword">كلمة مفتاحية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(newAutomation.type === 'comment_to_message' || newAutomation.type === 'keyword') && (
              <div className="space-y-2">
                <Label>الكلمة المفتاحية</Label>
                <Input
                  value={newAutomation.trigger.keyword}
                  onChange={(e) => setNewAutomation({
                    ...newAutomation,
                    trigger: { ...newAutomation.trigger, keyword: e.target.value }
                  })}
                  placeholder="مثال: عرض، خصم، معلومات"
                  data-testid="automation-keyword-input"
                />
                <p className="text-xs text-gray-500">
                  عندما يكتب شخص هذه الكلمة في تعليق، سيتم إرسال رسالة تلقائية له في الماسنجر.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600" data-testid="submit-automation-btn">
                إنشاء
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}