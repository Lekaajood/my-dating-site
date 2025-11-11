import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [fbSettings, setFbSettings] = useState({
    app_id: '',
    app_secret: '',
    verify_token: '',
    webhook_url: ''
  });

  const handleSave = () => {
    // In real app, save to backend
    toast.success('تم حفظ الإعدادات بنجاح!');
  };

  return (
    <div className="p-8" data-testid="settings-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">الإعدادات</h1>
        <p className="text-gray-600">ربط تطبيقك مع Facebook Messenger API</p>
      </div>

      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Facebook App Credentials</CardTitle>
            <CardDescription>
              أدخل معلومات Facebook App الخاصة بك لربط التطبيق مع Messenger API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>App ID</Label>
              <Input
                value={fbSettings.app_id}
                onChange={(e) => setFbSettings({ ...fbSettings, app_id: e.target.value })}
                placeholder="123456789012345"
                data-testid="app-id-input"
              />
            </div>
            <div className="space-y-2">
              <Label>App Secret</Label>
              <Input
                type="password"
                value={fbSettings.app_secret}
                onChange={(e) => setFbSettings({ ...fbSettings, app_secret: e.target.value })}
                placeholder="••••••••••••••••"
                data-testid="app-secret-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Verify Token</Label>
              <Input
                value={fbSettings.verify_token}
                onChange={(e) => setFbSettings({ ...fbSettings, verify_token: e.target.value })}
                placeholder="my_verify_token_123"
                data-testid="verify-token-input"
              />
              <p className="text-xs text-gray-500">
                استخدم هذا الـ token عند ربط webhook في Facebook Developer Console.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhook URL</CardTitle>
            <CardDescription>
              استخدم هذا الرابط في Facebook App لربط webhooks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  value="https://your-domain.com/api/webhook/facebook"
                  readOnly
                  className="bg-gray-50"
                  data-testid="webhook-url-display"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText('https://your-domain.com/api/webhook/facebook');
                    toast.success('تم نسخ الرابط');
                  }}
                >
                  نسخ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">📝 ملاحظة</h3>
            <p className="text-sm text-blue-800 mb-3">
              حالياً التطبيق في وضع Demo. للاستخدام الفعلي:
            </p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>أنشئ Facebook App في <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="underline">Facebook Developers</a></li>
              <li>فعّل Messenger Product</li>
              <li>أضف App ID & App Secret هنا</li>
              <li>ربط Webhook URL مع Verify Token</li>
              <li>اشترك في page_messages و messaging_postbacks webhooks</li>
            </ol>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-emerald-500 hover:bg-emerald-600"
            data-testid="save-settings-btn"
          >
            <Save className="w-4 h-4 ml-2" />
            حفظ الإعدادات
          </Button>
        </div>
      </div>
    </div>
  );
}