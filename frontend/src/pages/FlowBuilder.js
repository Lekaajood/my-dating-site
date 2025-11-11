import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Save, Plus, Trash2, Link2, MessageSquare, CreditCard, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/App';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FlowBuilder() {
  const { flowId } = useParams();
  const navigate = useNavigate();
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState(null);
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [newStep, setNewStep] = useState({
    type: 'message',
    content: { text: '' },
    buttons: []
  });

  useEffect(() => {
    loadFlow();
  }, [flowId]);

  const loadFlow = async () => {
    try {
      const res = await axios.get(`${API}/flows/${flowId}`);
      setFlow(res.data);
    } catch (error) {
      toast.error('فشل تحميل Flow');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.patch(`${API}/flows/${flowId}`, { steps: flow.steps });
      toast.success('تم حفظ Flow بنجاح!');
    } catch (error) {
      toast.error('فشل حفظ Flow');
    }
  };

  const handleAddStep = () => {
    const step = {
      ...newStep,
      id: `step-${Date.now()}`,
      position: { x: 100, y: (flow.steps.length * 150) + 100 }
    };
    setFlow({ ...flow, steps: [...flow.steps, step] });
    setShowStepDialog(false);
    setNewStep({ type: 'message', content: { text: '' }, buttons: [] });
    toast.success('تم إضافة خطوة جديدة');
  };

  const handleDeleteStep = (stepId) => {
    setFlow({ ...flow, steps: flow.steps.filter(s => s.id !== stepId) });
    setSelectedStep(null);
    toast.success('تم حذف الخطوة');
  };

  const handleUpdateStep = (stepId, updates) => {
    setFlow({
      ...flow,
      steps: flow.steps.map(s => s.id === stepId ? { ...s, ...updates } : s)
    });
  };

  const addButton = (stepId) => {
    const step = flow.steps.find(s => s.id === stepId);
    if (!step) return;
    
    const newButton = {
      id: `btn-${Date.now()}`,
      type: 'url',
      title: 'زر جديد',
      url: 'https://example.com'
    };
    
    handleUpdateStep(stepId, {
      buttons: [...(step.buttons || []), newButton]
    });
  };

  const updateButton = (stepId, buttonId, updates) => {
    const step = flow.steps.find(s => s.id === stepId);
    if (!step) return;
    
    handleUpdateStep(stepId, {
      buttons: step.buttons.map(b => b.id === buttonId ? { ...b, ...updates } : b)
    });
  };

  const deleteButton = (stepId, buttonId) => {
    const step = flow.steps.find(s => s.id === stepId);
    if (!step) return;
    
    handleUpdateStep(stepId, {
      buttons: step.buttons.filter(b => b.id !== buttonId)
    });
  };

  const getStepIcon = (type) => {
    switch(type) {
      case 'message': return MessageSquare;
      case 'card': return CreditCard;
      case 'delay': return Clock;
      default: return MessageSquare;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" data-testid="flow-builder-page">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/flows')}
              data-testid="back-to-flows-btn"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              رجوع
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{flow.name}</h1>
              <p className="text-sm text-gray-600">{flow.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowStepDialog(true)}
              variant="outline"
              data-testid="add-step-btn"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة خطوة
            </Button>
            <Button
              onClick={handleSave}
              className="bg-emerald-500 hover:bg-emerald-600"
              data-testid="save-flow-btn"
            >
              <Save className="w-4 h-4 ml-2" />
              حفظ
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex">
        {/* Left Panel - Steps List */}
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <h3 className="font-semibold text-gray-800 mb-4">خطوات Flow ({flow.steps.length})</h3>
          <div className="space-y-2">
            {flow.steps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">لا توجد خطوات بعد</p>
                <p className="text-xs">اضغط "إضافة خطوة" للبدء</p>
              </div>
            ) : (
              flow.steps.map((step, index) => {
                const Icon = getStepIcon(step.type);
                return (
                  <Card
                    key={step.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedStep?.id === step.id ? 'ring-2 ring-emerald-500 bg-emerald-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedStep(step)}
                    data-testid={`step-${step.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-500">#{index + 1}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {step.type === 'message' ? 'رسالة' : step.type === 'card' ? 'كارد' : 'تأخير'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 truncate">
                          {step.content?.text || step.content?.title || 'بدون محتوى'}
                        </p>
                        {step.buttons && step.buttons.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">{step.buttons.length} أزرار</p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Step Editor */}
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
          {selectedStep ? (
            <Card className="p-6 max-w-2xl mx-auto" data-testid="step-editor">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">تعديل الخطوة</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteStep(selectedStep.id)}
                  data-testid="delete-step-btn"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف
                </Button>
              </div>

              <div className="space-y-4">
                {selectedStep.type === 'message' && (
                  <div className="space-y-2">
                    <Label>نص الرسالة</Label>
                    <Textarea
                      value={selectedStep.content.text || ''}
                      onChange={(e) => handleUpdateStep(selectedStep.id, {
                        content: { ...selectedStep.content, text: e.target.value }
                      })}
                      placeholder="اكتب رسالتك هنا..."
                      rows={4}
                      data-testid="message-text-input"
                    />
                  </div>
                )}

                {selectedStep.type === 'card' && (
                  <>
                    <div className="space-y-2">
                      <Label>عنوان الكارد</Label>
                      <Input
                        value={selectedStep.content.title || ''}
                        onChange={(e) => handleUpdateStep(selectedStep.id, {
                          content: { ...selectedStep.content, title: e.target.value }
                        })}
                        placeholder="عنوان جذاب"
                        data-testid="card-title-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>وصف الكارد</Label>
                      <Textarea
                        value={selectedStep.content.subtitle || ''}
                        onChange={(e) => handleUpdateStep(selectedStep.id, {
                          content: { ...selectedStep.content, subtitle: e.target.value }
                        })}
                        placeholder="وصف مختصر"
                        rows={3}
                        data-testid="card-subtitle-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>رابط الصورة (اختياري)</Label>
                      <Input
                        value={selectedStep.content.image_url || ''}
                        onChange={(e) => handleUpdateStep(selectedStep.id, {
                          content: { ...selectedStep.content, image_url: e.target.value }
                        })}
                        placeholder="https://example.com/image.jpg"
                        data-testid="card-image-input"
                      />
                    </div>
                  </>
                )}

                {/* Buttons Section */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base">الأزرار</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addButton(selectedStep.id)}
                      data-testid="add-button-btn"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة زر
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {(selectedStep.buttons || []).map((button, index) => (
                      <Card key={button.id} className="p-4" data-testid={`button-${button.id}`}>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">زر #{index + 1}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteButton(selectedStep.id, button.id)}
                              data-testid={`delete-button-${button.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Input
                              value={button.title || ''}
                              onChange={(e) => updateButton(selectedStep.id, button.id, { title: e.target.value })}
                              placeholder="نص الزر"
                              data-testid={`button-title-${button.id}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">الرابط (URL)</Label>
                            <Input
                              value={button.url || ''}
                              onChange={(e) => updateButton(selectedStep.id, button.id, { url: e.target.value })}
                              placeholder="https://example.com"
                              data-testid={`button-url-${button.id}`}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                    {(!selectedStep.buttons || selectedStep.buttons.length === 0) && (
                      <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                        <p className="text-sm">لا توجد أزرار</p>
                        <p className="text-xs">اضغط "إضافة زر" لإنشاء زر جديد</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">اختر خطوة من القائمة</p>
                <p className="text-sm">أو أضف خطوة جديدة للبدء</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Step Dialog */}
      <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة خطوة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>نوع الخطوة</Label>
              <Select
                value={newStep.type}
                onValueChange={(value) => setNewStep({ ...newStep, type: value })}
              >
                <SelectTrigger data-testid="step-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message">رسالة نصية</SelectItem>
                  <SelectItem value="card">كارد مع أزرار</SelectItem>
                  <SelectItem value="delay">تأخير</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddStep} className="flex-1 bg-emerald-500 hover:bg-emerald-600" data-testid="confirm-add-step-btn">
                إضافة
              </Button>
              <Button variant="outline" onClick={() => setShowStepDialog(false)} className="flex-1">
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}