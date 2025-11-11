import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function InboxPage() {
  return (
    <div className="p-8" data-testid="inbox-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">صندوق الوارد</h1>
        <p className="text-gray-600">شاهد ورد على محادثات المشتركين</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
            <MessageSquare className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد محادثات بعد</h3>
          <p className="text-gray-600 text-center max-w-md">
            عندما يبدأ المشتركون بالتفاعل مع صفحتك، ستظهر المحادثات هنا.
            يمكنك الرد يدوياً أو إيقاف الأتمتة مؤقتاً.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}