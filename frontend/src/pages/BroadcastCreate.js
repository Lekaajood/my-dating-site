import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Save, Plus, Trash2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/App';

export default function BroadcastCreate() {
  const navigate = useNavigate();
  const [broadcast, setBroadcast] = useState({
    name: '',
    message: {
      text: '',
      cards: [],
      buttons: []
    },
    target_audience: 'all'
  });

  const handleSaveDraft = async () => {
    const pageId = localStorage.getItem('selectedPageId');
    if (!pageId) {
      toast.error('الرجاء اختيار صفحة أولاً');
      return;
    }
    if (!broadcast.name) {
      toast.error('الرجاء إدخال اسم Broadcast');
      return;
    }
    try {
      await axios.post(`${API}/broadcasts`, { ...broadcast, page_id: pageId });
      toast.success('تم حفظ Broadcast كمسودة');
      navigate('/broadcasts');
    } catch (error) {
      toast.error('فشل حفظ Broadcast');
    }
  };

  const handleSendNow = async () => {
    const pageId = localStorage.getItem('selectedPageId');
    if (!pageId) {
      toast.error('الرجاء اختيار صفحة أولاً');
      return;
    }
    if (!broadcast.name || !broadcast.message.text) {
      toast.error('الرجاء إدخال اسم ورسالة Broadcast');
      return;
    }
    try {
      const res = await axios.post(`${API}/broadcasts`, { ...broadcast, page_id: pageId });
      await axios.post(`${API}/broadcasts/${res.data.id}/send`);
      toast.success('تم إرسال Broadcast بنجاح!');
      navigate('/broadcasts');
    } catch (error) {
      toast.error('فشل إرسال Broadcast');
    }
  };

  const addButton = () => {
    setBroadcast({
      ...broadcast,
      message: {
        ...broadcast.message,
        buttons: [
          ...broadcast.message.buttons,
          { id: `btn-${Date.now()}`, title: 'زر جديد', url: 'https://example.com' }
        ]
      }
    });
  };

  const updateButton = (index, field, value) => {
    const newButtons = [...broadcast.message.buttons];
    newButtons[index][field] = value;
    setBroadcast({
      ...broadcast,
      message: { ...broadcast.message, buttons: newButtons }
    });
  };

  const deleteButton = (index) => {
    setBroadcast({
      ...broadcast,
      message: {
        ...broadcast.message,
        buttons: broadcast.message.buttons.filter((_, i) => i !== index)
      }
    });
  };

  const addCard = () => {
    setBroadcast({
      ...broadcast,
      message: {
        ...broadcast.message,
        cards: [
          ...broadcast.message.cards,
          { 
            id: `card-${Date.now()}`, 
            title: '', 
            subtitle: '', 
            image_url: '',
            buttons: []
          }
        ]
      }
    });
  };

  const updateCard = (index, field, value) => {
    const newCards = [...broadcast.message.cards];
    newCards[index][field] = value;
    setBroadcast({
      ...broadcast,
      message: { ...broadcast.message, cards: newCards }
    });
  };

  const deleteCard = (index) => {
    setBroadcast({
      ...broadcast,
      message: {
        ...broadcast.message,
        cards: broadcast.message.cards.filter((_, i) => i !== index)
      }
    });
  };

  const addCardButton = (cardIndex) => {
    const newCards = [...broadcast.message.cards];
    if (!newCards[cardIndex].buttons) {
      newCards[cardIndex].buttons = [];
    }
    newCards[cardIndex].buttons.push({
      id: `btn-${Date.now()}`,
      title: 'زر جديد',
      url: 'https://example.com'
    });
    setBroadcast({
      ...broadcast,
      message: { ...broadcast.message, cards: newCards }
    });
  };

  const updateCardButton = (cardIndex, buttonIndex, field, value) => {
    const newCards = [...broadcast.message.cards];
    newCards[cardIndex].buttons[buttonIndex][field] = value;
    setBroadcast({
      ...broadcast,
      message: { ...broadcast.message, cards: newCards }
    });
  };

  const deleteCardButton = (cardIndex, buttonIndex) => {
    const newCards = [...broadcast.message.cards];
    newCards[cardIndex].buttons = newCards[cardIndex].buttons.filter((_, i) => i !== buttonIndex);
    setBroadcast({
      ...broadcast,
      message: { ...broadcast.message, cards: newCards }
    });
  };

  return (
    <div className="p-8" data-testid="broadcast-create-page">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/broadcasts')}
              data-testid="back-to-broadcasts-btn"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              رجوع
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">إنشاء Broadcast جديد</h1>
              <p className="text-sm text-gray-600">أرسل رسالة جماعية لمشتركينك</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              data-testid="save-draft-btn"
            >
              <Save className="w-4 h-4 ml-2" />
              حفظ كمسودة
            </Button>
            <Button
              onClick={handleSendNow}
              className="bg-emerald-500 hover:bg-emerald-600"
              data-testid="send-now-btn"
            >
              <Send className="w-4 h-4 ml-2" />
              إرسال الآن
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>اسم Broadcast</Label>
                <Input
                  value={broadcast.name}
                  onChange={(e) => setBroadcast({ ...broadcast, name: e.target.value })}
                  placeholder="مثال: عرض خاص - خصم 50%"
                  data-testid="broadcast-name-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Message Content */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-800">محتوى الرسالة</h3>
              <div className="space-y-2">
                <Label>نص الرسالة</Label>
                <Textarea
                  value={broadcast.message.text}
                  onChange={(e) => setBroadcast({
                    ...broadcast,
                    message: { ...broadcast.message, text: e.target.value }
                  })}
                  placeholder="اكتب رسالتك هنا..."
                  rows={4}
                  data-testid="broadcast-text-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cards */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">الكروت</h3>
                <Button
                  onClick={addCard}
                  size="sm"
                  variant="outline"
                  data-testid="add-card-btn"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة كارد
                </Button>
              </div>

              {broadcast.message.cards.map((card, cardIndex) => (
                <Card key={card.id} className="p-4" data-testid={`card-${cardIndex}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">كارد #{cardIndex + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteCard(cardIndex)}
                        data-testid={`delete-card-${cardIndex}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                    <Input
                      value={card.title}
                      onChange={(e) => updateCard(cardIndex, 'title', e.target.value)}
                      placeholder="عنوان الكارد"
                      data-testid={`card-title-${cardIndex}`}
                    />
                    <Textarea
                      value={card.subtitle}
                      onChange={(e) => updateCard(cardIndex, 'subtitle', e.target.value)}
                      placeholder="وصف الكارد"
                      rows={2}
                      data-testid={`card-subtitle-${cardIndex}`}
                    />
                    <Input
                      value={card.image_url}
                      onChange={(e) => updateCard(cardIndex, 'image_url', e.target.value)}
                      placeholder="رابط الصورة (اختياري)"
                      data-testid={`card-image-${cardIndex}`}
                    />

                    {/* Card Buttons */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">أزرار الكارد</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addCardButton(cardIndex)}
                          data-testid={`add-card-button-${cardIndex}`}
                        >
                          <Plus className="w-3 h-3 ml-1" />
                          زر
                        </Button>
                      </div>
                      {card.buttons?.map((button, buttonIndex) => (
                        <div key={button.id} className="flex gap-2 mb-2" data-testid={`card-${cardIndex}-button-${buttonIndex}`}>
                          <Input
                            value={button.title}
                            onChange={(e) => updateCardButton(cardIndex, buttonIndex, 'title', e.target.value)}
                            placeholder="نص الزر"
                            className="flex-1"
                            data-testid={`card-${cardIndex}-button-title-${buttonIndex}`}
                          />
                          <Input
                            value={button.url}
                            onChange={(e) => updateCardButton(cardIndex, buttonIndex, 'url', e.target.value)}
                            placeholder="https://..."
                            className="flex-1"
                            data-testid={`card-${cardIndex}-button-url-${buttonIndex}`}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteCardButton(cardIndex, buttonIndex)}
                            data-testid={`delete-card-${cardIndex}-button-${buttonIndex}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Buttons */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">الأزرار</h3>
                <Button
                  onClick={addButton}
                  size="sm"
                  variant="outline"
                  data-testid="add-main-button-btn"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة زر
                </Button>
              </div>

              {broadcast.message.buttons.map((button, index) => (
                <div key={button.id} className="flex gap-2" data-testid={`main-button-${index}`}>
                  <Input
                    value={button.title}
                    onChange={(e) => updateButton(index, 'title', e.target.value)}
                    placeholder="نص الزر"
                    className="flex-1"
                    data-testid={`main-button-title-${index}`}
                  />
                  <Input
                    value={button.url}
                    onChange={(e) => updateButton(index, 'url', e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1"
                    data-testid={`main-button-url-${index}`}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteButton(index)}
                    data-testid={`delete-main-button-${index}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}

              {broadcast.message.buttons.length === 0 && (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                  <p className="text-sm">لا توجد أزرار</p>
                  <p className="text-xs">اضغط "إضافة زر" لإنشاء زر جديد</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}