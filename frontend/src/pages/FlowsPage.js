import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Workflow, Trash2, Edit, Power, PowerOff } from 'lucide-react';
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

export default function FlowsPage() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newFlow, setNewFlow] = useState({
    name: '',
    description: '',
    trigger_type: 'manual',
    trigger_value: ''
  });

  useEffect(() => {
    loadFlows();
    window.addEventListener('pageChanged', loadFlows);
    return () => window.removeEventListener('pageChanged', loadFlows);
  }, []);

  const loadFlows = async () => {
    try {
      const pageId = localStorage.getItem('selectedPageId');
      if (!pageId) {
        setFlows([]);
        setLoading(false);
        return;
      }
      const res = await axios.get(`${API}/flows?page_id=${pageId}`);
      setFlows(res.data);
    } catch (error) {
      toast.error('فشل تحميل الـ Flows');
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
      const res = await axios.post(`${API}/flows`, { ...newFlow, page_id: pageId });
      toast.success('تم إنشاء Flow بنجاح!');
      setShowDialog(false);
      setNewFlow({ name: '', description: '', trigger_type: 'manual', trigger_value: '' });
      navigate(`/flows/${res.data.id}`);
    } catch (error) {
      toast.error('فشل إنشاء Flow');
    }
  };

  const handleDelete = async (flowId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا Flow؟')) return;
    try {
      await axios.delete(`${API}/flows/${flowId}`);
      toast.success('تم حذف Flow');
      loadFlows();
    } catch (error) {
      toast.error('فشل حذف Flow');
    }
  };

  const handleToggle = async (flowId, isActive) => {
    try {
      await axios.patch(`${API}/flows/${flowId}`, { is_active: !isActive });
      toast.success(!isActive ? 'تم تفعيل Flow' : 'تم إيقاف Flow');
      loadFlows();
    } catch (error) {
      toast.error('فشل تغيير حالة Flow');
    }
  };

  const getTriggerLabel = (type) => {
    const labels = {
      'welcome': 'رسالة ترحيب',
      'keyword': 'كلمة مفتاحية',
      'comment': 'تعليق على منشور',
      'manual': 'يدوي'
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
    <div className="p-8" data-testid="flows-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Conversation Flows</h1>
          <p className="text-gray-600">ابني محادثات تفاعلية مع المشتركين</p>
        </div>
        <Button 
          onClick={() => setShowDialog(true)}
          className="bg-emerald-500 hover:bg-emerald-600"
          data-testid="create-flow-btn"
        >
          <Plus className="w-4 h-4 ml-2" />
          Flow جديد
        </Button>
      </div>

      {flows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
              <Workflow className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد Flows بعد</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              ابدأ ببناء أول Flow لك! استخدم Flow Builder لإنشاء محادثات تفاعلية مع المشتركين.
            </p>
            <Button 
              onClick={() => setShowDialog(true)}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="w-4 h-4 ml-2" />
              إنشاء أول Flow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flows.map(flow => (
            <Card key={flow.id} className="card-hover" data-testid={`flow-card-${flow.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{flow.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{flow.description || 'لا يوجد وصف'}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                        {getTriggerLabel(flow.trigger_type)}
                      </span>
                      {flow.trigger_value && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {flow.trigger_value}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(flow.id, flow.is_active)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    data-testid={`toggle-flow-${flow.id}`}
                  >
                    {flow.is_active ? (
                      <Power className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <PowerOff className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => navigate(`/flows/${flow.id}`)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    data-testid={`edit-flow-${flow.id}`}
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => handleDelete(flow.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    data-testid={`delete-flow-${flow.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{flow.steps?.length || 0} خطوة</span>
                    <span className={flow.is_active ? 'text-emerald-600' : 'text-gray-400'}>
                      {flow.is_active ? 'نشط' : 'متوقف'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Flow Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء Flow جديد</DialogTitle>
            <DialogDescription>
              ابني محادثة تفاعلية مع المشتركين باستخدام Flow Builder
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>اسم Flow</Label>
              <Input
                value={newFlow.name}
                onChange={(e) => setNewFlow({ ...newFlow, name: e.target.value })}
                placeholder="مثال: رسالة ترحيب للمشتركين الجدد"
                required
                data-testid="flow-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label>الوصف (اختياري)</Label>
              <Input
                value={newFlow.description}
                onChange={(e) => setNewFlow({ ...newFlow, description: e.target.value })}
                placeholder="وصف مختصر للـ Flow"
                data-testid="flow-desc-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select
                value={newFlow.trigger_type}
                onValueChange={(value) => setNewFlow({ ...newFlow, trigger_type: value })}
              >
                <SelectTrigger data-testid="trigger-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">يدوي</SelectItem>
                  <SelectItem value="welcome">رسالة ترحيب</SelectItem>
                  <SelectItem value="keyword">كلمة مفتاحية</SelectItem>
                  <SelectItem value="comment">تعليق على منشور</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(newFlow.trigger_type === 'keyword' || newFlow.trigger_type === 'comment') && (
              <div className="space-y-2">
                <Label>الكلمة المفتاحية</Label>
                <Input
                  value={newFlow.trigger_value}
                  onChange={(e) => setNewFlow({ ...newFlow, trigger_value: e.target.value })}
                  placeholder="مثال: عرض، خصم، معلومات"
                  data-testid="trigger-value-input"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600" data-testid="submit-flow-btn">
                إنشاء وبدء التصميم
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