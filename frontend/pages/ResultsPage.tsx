import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBackend } from '../hooks/useBackend';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Brain, 
  ChevronLeft, 
  LayoutDashboard,
  RotateCcw,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ResultsPage: React.FC = () => {
  const { attemptId } = useParams();
  const { request } = useBackend();
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await request(`/api/quizzes/history`);
        const attempt = data.attempts.find((a: any) => a.id === parseInt(attemptId!));
        setResult(attempt);
        
        if (attempt && attempt.score >= 80) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#0D9488', '#2563EB', '#F59E0B']
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-[#020617]">
    <div className="animate-pulse text-teal-500 text-2xl font-bold">جاري تحليل النتائج...</div>
  </div>;

  if (!result) return <div className="h-screen w-screen flex items-center justify-center bg-[#020617]">
    <div className="text-red-400">النتيجة غير موجودة</div>
  </div>;

  const isPassed = result.score >= 60;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10 overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <Link to="/dashboard">
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              <LayoutDashboard className="ml-2 w-5 h-5" />
              لوحة التحكم
            </Button>
          </Link>
          <div className="flex gap-4">
            <Button variant="outline" className="border-white/10">
              <Share2 className="ml-2 w-4 h-4" />
              مشاركة
            </Button>
          </div>
        </div>

        {/* Main Result Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 rounded-[40px] text-center relative overflow-hidden mb-10"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-blue-500"></div>
          
          <div className="mb-8 inline-block relative">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
              isPassed ? 'bg-teal-500/20 text-teal-400 glow-teal' : 'bg-red-500/20 text-red-400'
            }`}>
              <Trophy className="w-16 h-16" />
            </div>
            {isPassed && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-[-10px] border-2 border-dashed border-teal-500/30 rounded-full"
              />
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4">
            {isPassed ? 'تهانينا! لقد اجتزت الاختبار' : 'للأسف، لم تجتز الاختبار هذه المرة'}
          </h1>
          <p className="text-slate-400 text-lg mb-10">
            لقد حصلت على درجة <span className={`font-bold ${isPassed ? 'text-teal-400' : 'text-red-400'}`}>{result.score}%</span> في اختبار {result.category_name}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <ResultStat icon={<CheckCircle2 className="text-green-400" />} label="صحيحة" value={result.correct_count} />
            <ResultStat icon={<XCircle className="text-red-400" />} label="خاطئة" value={result.wrong_count} />
            <ResultStat icon={<Clock className="text-blue-400" />} label="الوقت" value={`${Math.floor(result.time_spent_seconds / 60)}د`} />
            <ResultStat icon={<Target className="text-purple-400" />} label="التقدير" value={result.overall_grade} />
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to={`/exam/${result.category_id}/${result.level_id}`}>
              <Button size="lg" className="h-14 px-10 text-lg font-bold gradient-bg border-none glow-teal group">
                <RotateCcw className="ml-2 group-hover:rotate-180 transition-transform duration-500" />
                إعادة المحاولة
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold border-white/10">
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* AI Analysis Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section className="glass-card p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Brain className="text-teal-400" />
                تحليل الذكاء الاصطناعي
              </h3>
              <div className="space-y-6 text-slate-300 leading-relaxed">
                <p>أداؤك في هذا الاختبار يظهر فهماً جيداً للمفاهيم الأساسية، ولكن هناك حاجة للتركيز أكثر على الحالات السريرية المعقدة.</p>
                <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/10">
                  <h4 className="font-bold text-teal-400 mb-2">توصية الخبير:</h4>
                  <p className="text-sm">قم بمراجعة الفصل الخاص بـ "تفسير العلامات الحيوية في حالات الصدمة" قبل المحاولة القادمة.</p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="glass-card p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-6">توزيع الكفاءة</h3>
              <div className="space-y-6">
                <CompetencyItem label="الدقة السريرية" value={result.score} color="bg-teal-500" />
                <CompetencyItem label="سرعة الاستجابة" value={75} color="bg-blue-500" />
                <CompetencyItem label="التفكير النقدي" value={60} color="bg-purple-500" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultStat = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: any }) => (
  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
    <div className="flex justify-center mb-2">{icon}</div>
    <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-tighter">{label}</div>
    <div className="text-2xl font-black">{value}</div>
  </div>
);

const CompetencyItem = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm font-bold">
      <span>{label}</span>
      <span className="text-slate-400">{value}%</span>
    </div>
    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, delay: 0.5 }}
        className={`h-full ${color}`}
      />
    </div>
  </div>
);

export default ResultsPage;
