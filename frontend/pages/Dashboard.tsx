import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBackend } from '../hooks/useBackend';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Activity, 
  Trophy, 
  BookOpen, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  Star, 
  Clock,
  LayoutDashboard,
  BarChart3,
  Award,
  Stethoscope
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  name_en: string;
  description: string;
  icon: string;
  color: string;
}

interface Level {
  id: number;
  name: string;
  name_en: string;
  description: string;
  icon: string;
  color: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { request } = useBackend();
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, levs, hist] = await Promise.all([
          request('/api/quizzes/categories'),
          request('/api/quizzes/levels'),
          request('/api/quizzes/history')
        ]);
        setCategories(cats.categories);
        setLevels(levs.levels);
        setHistory(hist.attempts);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope': return <Stethoscope className="w-6 h-6" />;
      case 'BookOpen': return <BookOpen className="w-6 h-6" />;
      case 'Brain': return <Activity className="w-6 h-6" />;
      case 'Trophy': return <Trophy className="w-6 h-6" />;
      case 'BarChart3': return <BarChart3 className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-[#020617]">
    <div className="animate-pulse text-teal-500 text-2xl font-bold">N.R EXAM</div>
  </div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 glass-card border-none border-l border-white/5 hidden lg:flex flex-col p-6">
        <div className="text-2xl font-black gradient-text mb-10">N.R EXAM</div>
        
        <nav className="flex-1 space-y-2">
          <SidebarItem icon={<LayoutDashboard />} label="لوحة التحكم" active />
          <Link to="/progress"><SidebarItem icon={<BarChart3 />} label="تقدمي الدراسي" /></Link>
          <Link to="/achievements"><SidebarItem icon={<Award />} label="الإنجازات" /></Link>
          <SidebarItem icon={<Settings />} label="الإعدادات" />
        </nav>

        <div className="pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-6 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center font-bold">
              {user?.name[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-bold truncate">{user?.name}</div>
              <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={logout}>
            <LogOut className="ml-2 w-5 h-5" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black mb-2">أهلاً بك، {user?.name.split(' ')[0]} 👋</h1>
            <p className="text-slate-400">جاهز لاختبار مهاراتك التمريضية اليوم؟</p>
          </div>
          <div className="flex gap-4">
            <div className="glass-card px-4 py-2 rounded-2xl flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold" />
              <span className="font-bold">1,250 XP</span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="إجمالي الاختبارات" value={history.length.toString()} icon={<Activity className="text-teal-400" />} />
          <StatCard title="متوسط الدرجات" value="85%" icon={<Star className="text-gold" />} />
          <StatCard title="ساعات الدراسة" value="12.5" icon={<Clock className="text-blue-400" />} />
        </div>

        {/* Categories Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="text-teal-400" />
            اختر التصنيف
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="space-y-4">
                <div className="glass-card p-6 rounded-3xl border-teal-500/20 bg-teal-500/5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-400">
                      {getIcon(cat.icon)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{cat.name}</h3>
                      <p className="text-xs text-slate-500">{cat.name_en}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-6 line-clamp-2">{cat.description}</p>
                  
                  <div className="space-y-3">
                    {levels.map((level) => (
                      <Link 
                        key={level.id} 
                        to={`/exam/${cat.id}/${level.id}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold">
                            {level.id}
                          </div>
                          <span className="text-sm font-medium">{level.name}</span>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-slate-600 group-hover:text-teal-400 group-hover:-translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-2xl font-bold mb-6">النشاط الأخير</h2>
          <div className="glass-card rounded-3xl overflow-hidden">
            <table className="w-full text-right">
              <thead className="bg-white/5 text-slate-400 text-sm">
                <tr>
                  <th className="p-4 font-medium">الاختبار</th>
                  <th className="p-4 font-medium">المستوى</th>
                  <th className="p-4 font-medium">الدرجة</th>
                  <th className="p-4 font-medium">التاريخ</th>
                  <th className="p-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.slice(0, 5).map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold">{attempt.category_name}</td>
                    <td className="p-4 text-slate-400">{attempt.level_name}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        attempt.score >= 80 ? 'bg-green-500/20 text-green-400' : 
                        attempt.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {attempt.score}%
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {new Date(attempt.completed_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="p-4">
                      <Link to={`/results/${attempt.id}`}>
                        <Button variant="ghost" size="sm" className="text-teal-400">التفاصيل</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-500">لا توجد اختبارات مكتملة بعد.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
    active ? 'bg-teal-500/10 text-teal-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'
  }`}>
    <div className="w-5 h-5">
      {icon}
    </div>
    <span className="font-bold">{label}</span>
  </div>
);

const StatCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
  <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
    <div>
      <div className="text-slate-500 text-sm font-medium mb-1">{title}</div>
      <div className="text-3xl font-black">{value}</div>
    </div>
    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
      {icon}
    </div>
  </div>
);

export default Dashboard;
