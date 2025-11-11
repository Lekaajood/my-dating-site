export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">سياسة الخصوصية</h1>
        <p className="text-sm text-gray-600 mb-8">آخر تحديث: {new Date().toLocaleDateString('ar-SA')}</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. المقدمة</h2>
            <p>
              مرحباً بك في Reply Alto Bot. نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. 
              توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك عند استخدام خدماتنا.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. المعلومات التي نجمعها</h2>
            <p className="mb-2">عند استخدام Reply Alto Bot، قد نجمع المعلومات التالية:</p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li><strong>معلومات Facebook:</strong> الاسم، البريد الإلكتروني، صورة الملف الشخصي (عبر Facebook Login)</li>
              <li><strong>معلومات صفحة Facebook:</strong> اسم الصفحة، Page ID، Access Token</li>
              <li><strong>بيانات المشتركين:</strong> معلومات المشتركين في صفحتك على Facebook Messenger</li>
              <li><strong>محتوى الرسائل:</strong> الرسائل والمحادثات التي تنشئها في التطبيق</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. كيفية استخدام المعلومات</h2>
            <p className="mb-2">نستخدم المعلومات المجمعة للأغراض التالية:</p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>تقديم وتحسين خدمات الـ Chatbot</li>
              <li>إدارة حسابك وصفحاتك على Facebook</li>
              <li>إرسال Broadcasts وإدارة Flows</li>
              <li>توفير خدمات الأتمتة والردود التلقائية</li>
              <li>تحليل الأداء وتحسين الخدمة</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. مشاركة المعلومات</h2>
            <p>
              نحن <strong>لا نبيع أو نشارك</strong> معلوماتك الشخصية مع أطراف ثالثة لأغراض تسويقية. 
              قد نشارك المعلومات فقط في الحالات التالية:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4 mt-2">
              <li>مع Facebook (لتشغيل خدمات Messenger Platform)</li>
              <li>عند الحاجة للامتثال للقوانين أو الأوامر القانونية</li>
              <li>لحماية حقوقنا وسلامة مستخدمينا</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. أمن البيانات</h2>
            <p>
              نتخذ تدابير أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الإفصاح أو التدمير. 
              يتم تشفير جميع البيانات الحساسة وتخزينها بشكل آمن.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. حقوقك</h2>
            <p className="mb-2">لديك الحق في:</p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>الوصول إلى بياناتك الشخصية</li>
              <li>تصحيح أو تحديث بياناتك</li>
              <li>حذف حسابك وبياناتك</li>
              <li>سحب موافقتك على معالجة بياناتك</li>
              <li>تصدير بياناتك</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. الاحتفاظ بالبيانات</h2>
            <p>
              نحتفظ بمعلوماتك طالما كان حسابك نشطاً أو حسب الحاجة لتقديم الخدمات. 
              يمكنك طلب حذف بياناتك في أي وقت.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Facebook Platform Policy</h2>
            <p>
              يلتزم Reply Alto Bot بسياسات Facebook Platform. 
              نستخدم Facebook Login وMessenger Platform وفقاً لشروط وأحكام Facebook.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. ملفات تعريف الارتباط (Cookies)</h2>
            <p>
              نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتذكر تفضيلاتك. 
              يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. التغييرات على سياسة الخصوصية</h2>
            <p>
              قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. 
              سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار في التطبيق.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. اتصل بنا</h2>
            <p>
              إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا عبر:
            </p>
            <ul className="list-none space-y-2 mr-4 mt-2">
              <li><strong>الموقع:</strong> https://replyaltobot.online</li>
              <li><strong>البريد الإلكتروني:</strong> privacy@replyaltobot.online</li>
            </ul>
          </section>

          <section className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">English Version</h2>
            <p className="text-sm text-gray-600">
              For English version of this Privacy Policy, please contact us at privacy@replyaltobot.online
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Reply Alto Bot. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
}
