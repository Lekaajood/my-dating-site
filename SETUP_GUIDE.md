# دليل تفعيل تطبيق ChatFlow مع Facebook Messenger

## الخطوة 1: إنشاء Facebook App

1. **اذهب إلى Facebook Developers**
   - افتح https://developers.facebook.com
   - سجل الدخول بحسابك على Facebook

2. **إنشاء تطبيق جديد**
   - اضغط على "My Apps" من القائمة العلوية
   - اضغط "Create App"
   - اختر "Business" كنوع التطبيق
   - املأ المعلومات:
     * App Name: اسم تطبيقك (مثال: ChatFlow Bot)
     * App Contact Email: بريدك الإلكتروني
   - اضغط "Create App"

3. **إضافة منتج Messenger**
   - في صفحة التطبيق، ابحث عن "Messenger" في قائمة المنتجات
   - اضغط "Set Up" بجانب Messenger

## الخطوة 2: الحصول على المفاتيح (Credentials)

1. **App ID و App Secret**
   - اذهب إلى Settings → Basic
   - انسخ:
     * App ID
     * App Secret (اضغط Show لرؤيته)

2. **Page Access Token**
   - اذهب إلى Messenger → Settings
   - في قسم "Access Tokens"
   - اختر صفحة Facebook التي تريد ربطها
   - انسخ الـ Page Access Token

## الخطوة 3: إعداد Webhooks

1. **في Facebook Developer Console:**
   - اذهب إلى Messenger → Settings
   - في قسم "Webhooks"
   - اضغط "Add Callback URL"

2. **معلومات Webhook:**
   ```
   Callback URL: https://your-domain.com/api/webhook/facebook
   Verify Token: أي نص عشوائي آمن (مثال: my_secure_token_12345)
   ```

3. **الاشتراك في الأحداث:**
   - messages
   - messaging_postbacks
   - message_echoes
   - message_reads
   - messaging_referrals

## الخطوة 4: إعداد التطبيق (Backend)

1. **أضف المتغيرات في ملف .env:**
   ```bash
   # Facebook OAuth
   FACEBOOK_APP_ID=your_app_id_here
   FACEBOOK_APP_SECRET=your_app_secret_here
   
   # Facebook Messenger
   FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token
   FACEBOOK_VERIFY_TOKEN=my_secure_token_12345
   
   # URLs
   FRONTEND_URL=https://your-domain.com
   BACKEND_URL=https://your-domain.com
   ```

2. **أعد تشغيل الـ Backend:**
   ```bash
   sudo supervisorctl restart backend
   ```

## الخطوة 5: التجربة

### التسجيل عبر Facebook:
1. افتح التطبيق
2. اضغط "تسجيل الدخول عبر Facebook"
3. سيتم توجيهك إلى Facebook للموافقة
4. بعد الموافقة، ستعود للتطبيق وأنت مسجل

### إضافة صفحة Facebook:
1. بعد تسجيل الدخول، اضغط "إضافة صفحة"
2. أدخل:
   - اسم الصفحة
   - Page ID (من إعدادات صفحة Facebook)
   - Page Access Token (من Developer Console)

### إنشاء أول Flow:
1. اذهب إلى Flows
2. اضغط "Flow جديد"
3. املأ المعلومات:
   - الاسم: "رسالة ترحيب"
   - النوع: "رسالة ترحيب"
4. أضف خطوات:
   - رسالة نصية
   - كارد مع صورة
   - أزرار للموقع

### إنشاء Broadcast:
1. اذهب إلى Broadcasts
2. اضغط "Broadcast جديد"
3. أضف:
   - نص الرسالة
   - صورة قابلة للنقر (ارفع من جهازك)
   - رابط الوجهة
   - كروت وأزرار
4. اضغط "إرسال الآن"

## الخطوة 6: تفعيل Automations

### Comment to Message:
1. اذهب إلى الأتمتة
2. اضغط "أتمتة جديدة"
3. اختر "Comment to Message"
4. حدد الكلمة المفتاحية (مثال: "عرض")
5. عندما يكتب شخص "عرض" في تعليق، سيصله رسالة في المسنجر

## الخطوة 7: الربط الكامل مع Facebook API

لتفعيل الإرسال الحقيقي للرسائل، تحتاج إلى:

1. **إضافة Webhook Handler في Backend**
2. **التحقق من Webhook مع Facebook**
3. **إرسال الرسائل عبر Graph API**

### مثال على إرسال رسالة:
```python
import httpx

async def send_message(recipient_id, message_text):
    url = "https://graph.facebook.com/v20.0/me/messages"
    params = {"access_token": PAGE_ACCESS_TOKEN}
    data = {
        "recipient": {"id": recipient_id},
        "message": {"text": message_text}
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, params=params, json=data)
        return response.json()
```

## الوضع الحالي (Demo Mode)

حالياً التطبيق يعمل في **Demo Mode** حيث:
- ✅ يمكنك تسجيل الدخول بدون Facebook
- ✅ يمكنك إنشاء Flows و Broadcasts
- ✅ يمكنك إدارة المشتركين
- ✅ كل الواجهات تعمل بشكل كامل
- ⚠️ الإرسال الفعلي للرسائل يحتاج Facebook API setup

## المساعدة والدعم

إذا واجهت أي مشكلة:
1. تحقق من الـ logs: `tail -f /var/log/supervisor/backend.err.log`
2. تأكد من صحة المتغيرات في `.env`
3. تحقق من صلاحيات Facebook App

## الموارد المفيدة

- [Facebook Messenger Platform Docs](https://developers.facebook.com/docs/messenger-platform)
- [Facebook Graph API Reference](https://developers.facebook.com/docs/graph-api)
- [Webhook Setup Guide](https://developers.facebook.com/docs/messenger-platform/webhooks)
