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

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" data-testid="login-tab">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">حساب جديد</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">مرحباً بعودتك</CardTitle>
                  <CardDescription>ادخل بياناتك لتسجيل الدخول</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">البريد الإلكتروني</Label>
                      <Input
                        id="login-email"
                        type="email"
                        name="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        data-testid="login-email-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">كلمة المرور</Label>
                      <Input
                        id="login-password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        data-testid="login-password-input"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-emerald-500 hover:bg-emerald-600"
                      disabled={loading}
                      data-testid="login-submit-btn"
                    >
                      {loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
                  <CardDescription>ابدأ باستخدام ChatFlow اليوم</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">الاسم</Label>
                      <Input
                        id="register-name"
                        type="text"
                        name="name"
                        placeholder="الاسم الكامل"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        data-testid="register-name-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">البريد الإلكتروني</Label>
                      <Input
                        id="register-email"
                        type="email"
                        name="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        data-testid="register-email-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">كلمة المرور</Label>
                      <Input
                        id="register-password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        data-testid="register-password-input"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-emerald-500 hover:bg-emerald-600"
                      disabled={loading}
                      data-testid="register-submit-btn"
                    >
                      {loading ? 'جاري التحميل...' : 'إنشاء الحساب'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}