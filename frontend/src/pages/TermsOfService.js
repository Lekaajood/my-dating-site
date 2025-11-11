export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">شروط الخدمة</h1>
        <p className="text-sm text-gray-600 mb-8">آخر تحديث: {new Date().toLocaleDateString('ar-SA')}</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. قبول الشروط</h2>
            <p>
              مرحباً بك في Reply Alto Bot. باستخدامك لهذه الخدمة، فإنك توافق على الالتزام بهذه الشروط والأحكام. 
              إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام الخدمة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. وصف الخدمة</h2>
            <p className="mb-2">
              Reply Alto Bot هو منصة لأتمتة محادثات Facebook Messenger. الخدمة تتيح لك:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>إنشاء وإدارة Conversation Flows</li>
              <li>إرسال رسائل جماعية (Broadcasts)</li>
              <li>إعداد ردود تلقائية (Automations)</li>
              <li>إدارة المشتركين والمحادثات</li>
              <li>تحليل أداء الحملات</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. التسجيل والحساب</h2>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>يجب أن تكون لديك صفحة Facebook نشطة لاستخدام الخدمة</li>
              <li>أنت مسؤول عن الحفاظ على سرية معلومات حسابك</li>
              <li>أنت مسؤول عن جميع الأنشطة التي تحدث تحت حسابك</li>
              <li>يجب عليك إخطارنا فوراً بأي استخدام غير مصرح به لحسابك</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. الاستخدام المقبول</h2>
            <p className="mb-2">أنت توافق على عدم استخدام الخدمة لـ:</p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>إرسال رسائل غير مرغوب فيها (spam)</li>
              <li>نشر محتوى مسيء أو غير قانوني</li>
              <li>انتهاك حقوق الملكية الفكرية لأي طرف</li>
              <li>محاولة الوصول غير المصرح به إلى أنظمتنا</li>
              <li>انتهاك سياسات Facebook Platform</li>
              <li>جمع معلومات المستخدمين بطرق غير قانونية</li>
              <li>انتحال شخصية أي شخص أو كيان</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Facebook Platform</h2>
            <p>
              خدمتنا مبنية على Facebook Messenger Platform. أنت توافق على الالتزام بـ:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4 mt-2">
              <li>شروط خدمة Facebook</li>
              <li>سياسات Facebook Platform</li>
              <li>إرشادات Messenger Platform</li>
            </ul>
            <p className="mt-2">
              قد يؤدي انتهاك سياسات Facebook إلى تعليق أو إنهاء حسابك.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. الملكية الفكرية</h2>
            <p>
              جميع حقوق الملكية الفكرية في الخدمة، بما في ذلك التصميم والشعار والكود، 
              مملوكة لـ Reply Alto Bot. أنت تحتفظ بملكية المحتوى الذي تنشئه (الرسائل، الصور، إلخ).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. الخصوصية وحماية البيانات</h2>
            <p>
              يتم التعامل مع بياناتك وفقاً لـ 
              <a href="/privacy" className="text-emerald-600 hover:underline mx-1">سياسة الخصوصية</a>
              الخاصة بنا. باستخدام الخدمة، فإنك توافق على جمع واستخدام المعلومات كما هو موضح في سياسة الخصوصية.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. الرسوم والدفع</h2>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>قد تكون بعض ميزات الخدمة مدفوعة</li>
              <li>الأسعار قابلة للتغيير بإشعار مسبق</li>
              <li>جميع الرسوم غير قابلة للاسترداد إلا في حالات محددة</li>
              <li>أنت مسؤول عن دفع جميع الضرائب المطبقة</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. إنهاء الخدمة</h2>
            <p className="mb-2">نحتفظ بالحق في:</p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>تعليق أو إنهاء حسابك في حالة انتهاك هذه الشروط</li>
              <li>تعديل أو إيقاف الخدمة في أي وقت</li>
              <li>رفض الخدمة لأي شخص لأي سبب</li>
            </ul>
            <p className="mt-2">
              يمكنك إنهاء حسابك في أي وقت من خلال إعدادات الحساب.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. إخلاء المسؤولية</h2>
            <p>
              الخدمة مقدمة "كما هي" و"حسب التوفر". لا نضمن أن الخدمة ستكون متاحة دائماً أو خالية من الأخطاء. 
              نحن لا نتحمل المسؤولية عن:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4 mt-2">
              <li>أي انقطاع في الخدمة</li>
              <li>فقدان البيانات أو المحتوى</li>
              <li>أي أضرار ناتجة عن استخدام الخدمة</li>
              <li>تصرفات أطراف ثالثة (بما في ذلك Facebook)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. تحديد المسؤولية</h2>
            <p>
              لن نكون مسؤولين عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية ناتجة عن استخدام الخدمة، 
              حتى لو تم إخطارنا باحتمال حدوث مثل هذه الأضرار.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. التعويض</h2>
            <p>
              أنت توافق على تعويضنا والدفاع عنا ضد أي مطالبات أو أضرار أو التزامات ناتجة عن:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4 mt-2">
              <li>استخدامك للخدمة</li>
              <li>انتهاكك لهذه الشروط</li>
              <li>انتهاكك لأي حقوق لطرف ثالث</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. القانون الحاكم</h2>
            <p>
              تخضع هذه الشروط للقوانين المعمول بها. 
              أي نزاع ينشأ عن هذه الشروط سيتم حله عبر التحكيم أو المحاكم المختصة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">14. التغييرات على الشروط</h2>
            <p>
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. 
              سنخطرك بأي تغييرات جوهرية. استمرارك في استخدام الخدمة بعد التغييرات يعني قبولك للشروط المعدلة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">15. اتصل بنا</h2>
            <p>
              إذا كان لديك أي أسئلة حول شروط الخدمة، يرجى الاتصال بنا:
            </p>
            <ul className="list-none space-y-2 mr-4 mt-2">
              <li><strong>الموقع:</strong> https://replyaltobot.online</li>
              <li><strong>البريد الإلكتروني:</strong> support@replyaltobot.online</li>
            </ul>
          </section>

          <section className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">English Version</h2>
            <p className="text-sm text-gray-600">
              For English version of these Terms of Service, please contact us at support@replyaltobot.online
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
