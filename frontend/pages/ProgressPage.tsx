import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useBackend } from '../hooks/useBackend';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Target, 
  ChevronLeft,
  LayoutDashboard,
  Activity,
  Star,
  Clock
} from 'lucide-react';
import { Button } from '../components/ui/button';

const ProgressPage: React.FC = () => {
  const { request } = useBackend();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await request('/api/quizzes/history');
        setHistory(data.attempts);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-[#020617]">
    <div className="animate-pulse text-teal-500 text-2xl font-bold">جاري تحميل التقدم...</div>
  </div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
              <BarChart3 className="text-teal-400 w-10 h-10" />
              تقدمي الدراسي
            </h1>
            <p className="text-slate-400">تتبع تطورك السريري عبر الزمن</p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline" className="border-white/10">
              <LayoutDashboard className="ml-2 w-5 h-5" />
              العودة للوحة التحكم
            </Button>
          </Link>
        </header>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <ProgressStat label="إجمالي المحاولات" value={history.length} icon={<Activity className="w-5 h-5" />} color="text-teal-400" />
          <ProgressStat label="أعلى درجة" value={`${Math.max(...history.map(h => h.score), 0)}%`} icon={<Star className="w-5 h-5" />} color="text-gold" />
          <ProgressStat label="ساعات التدريب" value="12.5" icon={<Clock className="w-5 h-5" />} color="text-blue-400" />
          <ProgressStat label="مستوى الكفاءة" value="B+" icon={<Target className="w-5 h-5" />} color="text-purple-400" />
        </div>

        {/* Performance Chart Placeholder */}
        <section className="glass-card p-8 rounded-[40px] mb-12 relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="text-teal-400" />
              منحنى الأداء
            </h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="bg-teal-500/10 text-teal-400">أسبوعي</Button>
              <Button variant="ghost" size="sm" className="text-slate-500">شهري</Button>
            </div>
          </div>
          
          <div className="h-64 w-full flex items-end gap-4 px-4">
            {history.slice(-10).map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h.score}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="flex-1 bg-gradient-to-t from-teal-500/20 to-teal-500 rounded-t-lg relative group"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {h.score}%
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[10px] text-slate-600 font-bold uppercase tracking-widest px-4">
            <span>البداية</span>
            <span>اليوم</span>
          </div>
        </section>

        {/* Detailed History */}
        <section>
          <h3 className="text-xl font-bold mb-6">سجل الاختبارات التفصيلي</h3>
          <div className="space-y-4">
            {history.map((attempt) => (
              <motion.div 
                key={attempt.id}
                whileHover={{ x: -10 }}
                className="glass-card p-6 rounded-3xl flex items-center justify-between group"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${
                    attempt.score >= 80 ? 'bg-teal-500/20 text-teal-400' : 
                    attempt.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {attempt.score}%
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{attempt.category_name}</h4>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {attempt.level_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(attempt.completed_at).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Link to={`/results/${attempt.id}`}>
                  <Button variant="ghost" className="text-teal-400 group-hover:bg-teal-500/10">
                    عرض التحليل
                    <ChevronLeft className="mr-2 w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const ProgressStat = ({ label, value, icon, color }: { label: string, value: any, icon: React.ReactNode, color: string }) => (
  <div className="glass-card p-6 rounded-3xl">
    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${color}`}>
      {icon}
    </div>
    <div className="text-slate-500 text-xs font-bold uppercase mb-1">{label}</div>
    <div className="text-2xl font-black">{value}</div>
  </div>
);

export default ProgressPage;
