import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Workflow, 
  Radio, 
  Zap, 
  Users, 
  MessageSquare, 
  Settings,
  LogOut,
  Plus,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { API } from '@/App';

export default function DashboardLayout({ user, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [showPageDialog, setShowPageDialog] = useState(false);
  const [newPage, setNewPage] = useState({ page_name: '', page_id: '' });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const res = await axios.get(`${API}/pages`);
      setPages(res.data);
      if (res.data.length > 0 && !selectedPage) {
        const savedPageId = localStorage.getItem('selectedPageId');
        const page = savedPageId ? res.data.find(p => p.id === savedPageId) : res.data[0];
        setSelectedPage(page || res.data[0]);
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  };

  const handleSelectPage = (page) => {
    setSelectedPage(page);
    localStorage.setItem('selectedPageId', page.id);
    window.dispatchEvent(new CustomEvent('pageChanged', { detail: page }));
  };

  const handleAddPage = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/pages`, newPage);
      setPages([...pages, res.data]);
      setSelectedPage(res.data);
      localStorage.setItem('selectedPageId', res.data.id);
      setShowPageDialog(false);
      setNewPage({ page_name: '', page_id: '' });
      toast.success('تم إضافة الصفحة بنجاح!');
    } catch (error) {
      toast.error('فشل إضافة الصفحة');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedPageId');
    navigate('/auth');
  };

  const navigation = [
    { name: 'لوحة التحكم', path: '/', icon: LayoutDashboard },
    { name: 'Flows', path: '/flows', icon: Workflow },
    { name: 'Broadcasts', path: '/broadcasts', icon: Radio },
    { name: 'الأتمتة', path: '/automations', icon: Zap },
    { name: 'المشتركين', path: '/subscribers', icon: Users },
    { name: 'المحادثات', path: '/inbox', icon: MessageSquare },
    { name: 'الإعدادات', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Reply Alto Bot</span>
          </div>
        </div>

        {/* Page Selector */}
        {pages.length > 0 ? (
          <div className="p-4 border-b border-gray-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  data-testid="page-selector"
                >
                  <span className="truncate">{selectedPage?.page_name || 'اختر صفحة'}</span>
                  <ChevronDown className="w-4 h-4 mr-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {pages.map(page => (
                  <DropdownMenuItem 
                    key={page.id} 
                    onClick={() => handleSelectPage(page)}
                    data-testid={`page-option-${page.page_name}`}
                  >
                    {page.page_name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={() => setShowPageDialog(true)}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة صفحة جديدة
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="p-4 border-b border-gray-200">
            <Button 
              onClick={() => setShowPageDialog(true)} 
              className="w-full bg-emerald-500 hover:bg-emerald-600"
              data-testid="add-first-page-btn"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة صفحة
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                data-testid={`nav-${item.name}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User menu */}
        <div className="p-4 border-t border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center ml-3">
                  <span className="text-sm font-semibold text-emerald-600">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 text-right">
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 ml-2" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>

      {/* Add Page Dialog */}
      <Dialog open={showPageDialog} onOpenChange={setShowPageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة صفحة Facebook</DialogTitle>
            <DialogDescription>
              حالياً في وضع Demo. أضف معلومات صفحتك يدوياً، لاحقاً سيتم الربط مع Facebook API.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPage} className="space-y-4">
            <div className="space-y-2">
              <Label>اسم الصفحة</Label>
              <Input
                value={newPage.page_name}
                onChange={(e) => setNewPage({ ...newPage, page_name: e.target.value })}
                placeholder="مثال: متجر الإلكترونيات"
                required
                data-testid="page-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Page ID (اختياري)</Label>
              <Input
                value={newPage.page_id}
                onChange={(e) => setNewPage({ ...newPage, page_id: e.target.value })}
                placeholder="مثال: 123456789"
                data-testid="page-id-input"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600" data-testid="submit-page-btn">
                إضافة
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowPageDialog(false)} className="flex-1">
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}