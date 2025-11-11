import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { MessageSquare, Zap, Users, TrendingUp } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoName, setDemoName] = useState('');

  useEffect(() => {
    // Handle OAuth callback
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    
    if (token) {
      localStorage.setItem('token', token);
      toast.success('تم تسجيل الدخول عبر Facebook بنجاح!');
      navigate('/');
    } else if (error) {
      toast.error(`خطأ في تسجيل الدخول: ${error}`);
    }
  }, [searchParams, navigate]);

  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/auth/facebook/login`);
      
      if (res.data.demo_mode) {
        // Demo mode - show demo login form
        setDemoMode(true);
        setLoading(false);
        toast.info('وضع Demo: يمكنك تسجيل الدخول بدون Facebook');
      } else {
        // Redirect to Facebook OAuth
        window.location.href = res.data.auth_url;
      }
    } catch (error) {
      toast.error('فشل الاتصال بـ Facebook');
      setLoading(false);
    }
  };

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/demo-login?name=${encodeURIComponent(demoName)}`);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('تم تسجيل الدخول بنجاح!');
      navigate('/');
    } catch (error) {
      toast.error('فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">ChatFlow</h1>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            أتمتة محادثات<br />Facebook Messenger
          </h2>
          <p className="text-lg text-gray-600">
            ابني flows ذكية، أرسل broadcasts، وأتمت ردودك بطريقة احترافية
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Flow Builder</h3>
            <p className="text-sm text-gray-600">ابني محادثات تفاعلية بسهولة</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Broadcasts</h3>
            <p className="text-sm text-gray-600">أرسل رسائل جماعية لمشتركينك</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Comment Automation</h3>
            <p className="text-sm text-gray-600">رد تلقائي على تعليقات Facebook</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Analytics</h3>
            <p className="text-sm text-gray-600">تتبع أداء رسائلك</p>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">ChatFlow</h1>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">مرحباً بك في ChatFlow</CardTitle>
              <CardDescription>سجل الدخول عبر Facebook للبدء</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!demoMode ? (
                <>
                  <Button 
                    onClick={handleFacebookLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6"
                    disabled={loading}
                    data-testid="facebook-login-btn"
                  >
                    <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    {loading ? 'جاري الاتصال بـ Facebook...' : 'تسجيل الدخول عبر Facebook'}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-gray-500">أو</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      💡 لم يتم تكوين Facebook App ID بعد؟<br />
                      يمكنك استخدام وضع Demo للتجربة
                    </p>
                    <Button 
                      onClick={handleFacebookLogin}
                      variant="outline"
                      className="w-full"
                    >
                      جرب التطبيق (Demo Mode)
                    </Button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleDemoLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="demo-name">اسمك</Label>
                    <Input
                      id="demo-name"
                      type="text"
                      value={demoName}
                      onChange={(e) => setDemoName(e.target.value)}
                      placeholder="أدخل اسمك للتجربة"
                      required
                      data-testid="demo-name-input"
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                    disabled={loading}
                    data-testid="demo-login-btn"
                  >
                    {loading ? 'جاري الدخول...' : 'دخول (Demo)'}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setDemoMode(false)}
                  >
                    رجوع
                  </Button>
                </form>
              )}
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>ملاحظة:</strong> لاستخدام تسجيل الدخول عبر Facebook، يجب إضافة Facebook App ID في إعدادات الخادم.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}