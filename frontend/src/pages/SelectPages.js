import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/App';

export default function SelectPages() {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFacebookPages();
  }, []);

  const loadFacebookPages = async () => {
    try {
      // Get pages from Facebook
      const res = await axios.get(`${API}/facebook/pages`);
      setPages(res.data);
    } catch (error) {
      toast.error('فشل تحميل الصفحات');
    } finally {
      setLoading(false);
    }
  };

  const togglePage = (page) => {
    if (selectedPages.find(p => p.id === page.id)) {
      setSelectedPages(selectedPages.filter(p => p.id !== page.id));
    } else {
      setSelectedPages([...selectedPages, page]);
    }
  };

  const handleConnect = async () => {
    if (selectedPages.length === 0) {
      toast.error('الرجاء اختيار صفحة واحدة على الأقل');
      return;
    }

    try {
      // Save selected pages
      for (const page of selectedPages) {
        await axios.post(`${API}/pages`, {
          page_id: page.id,
          page_name: page.name,
          page_avatar: page.picture?.data?.url,
          access_token: page.access_token
        });
      }
      
      toast.success('تم ربط الصفحات بنجاح!');
      navigate('/');
    } catch (error) {
      toast.error('فشل ربط الصفحات');
    }
  };

  if (loading) {
    return (
      <div className=\"flex items-center justify-center min-h-screen\">
        <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500\"></div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8\" dir=\"rtl\">
      <div className=\"max-w-4xl mx-auto\">
        <div className=\"text-center mb-8\">
          <div className=\"w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4\">
            <MessageSquare className=\"w-8 h-8 text-white\" />
          </div>
          <h1 className=\"text-3xl font-bold text-gray-800 mb-2\">اختر صفحات Facebook</h1>
          <p className=\"text-gray-600\">اختر الصفحات التي تريد إدارتها في Reply Alto Bot</p>
        </div>

        {pages.length === 0 ? (
          <Card>
            <CardContent className=\"p-8 text-center\">
              <p className=\"text-gray-600 mb-4\">لم يتم العثور على صفحات</p>
              <Button onClick={() => navigate('/')} className=\"bg-emerald-500 hover:bg-emerald-600\">
                متابعة
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6\">
              {pages.map(page => {
                const isSelected = selectedPages.find(p => p.id === page.id);
                return (
                  <Card 
                    key={page.id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-emerald-500 bg-emerald-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => togglePage(page)}
                    data-testid={`page-${page.id}`}
                  >
                    <CardContent className=\"p-6\">
                      <div className=\"flex items-center gap-4\">
                        <div className=\"w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0\">
                          {page.picture?.data?.url ? (
                            <img src={page.picture.data.url} alt={page.name} className=\"w-full h-full rounded-full\" />
                          ) : (
                            <MessageSquare className=\"w-7 h-7 text-emerald-600\" />
                          )}
                        </div>
                        <div className=\"flex-1 min-w-0\">
                          <h3 className=\"font-semibold text-gray-800 truncate\">{page.name}</h3>
                          <p className=\"text-sm text-gray-600\">Page ID: {page.id}</p>
                        </div>
                        <div>
                          {isSelected ? (
                            <CheckCircle2 className=\"w-6 h-6 text-emerald-500\" />
                          ) : (
                            <Circle className=\"w-6 h-6 text-gray-300\" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className=\"bg-white rounded-lg p-6 shadow-sm\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <p className=\"text-sm text-gray-600\">
                    تم اختيار <span className=\"font-semibold text-emerald-600\">{selectedPages.length}</span> صفحة
                  </p>
                </div>
                <div className=\"flex gap-2\">
                  <Button
                    variant=\"outline\"
                    onClick={() => navigate('/')}
                  >
                    تخطي
                  </Button>
                  <Button
                    onClick={handleConnect}
                    disabled={selectedPages.length === 0}
                    className=\"bg-emerald-500 hover:bg-emerald-600\"
                    data-testid=\"connect-pages-btn\"
                  >
                    ربط الصفحات ({selectedPages.length})
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
