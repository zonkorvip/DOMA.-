import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useBackend } from '../hooks/useBackend';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Trophy, 
  Star, 
  Flame, 
  Zap, 
  Crown, 
  Lock,
  LayoutDashboard,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/button';

interface Achievement {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const AchievementsPage: React.FC = () => {
  const { request } = useBackend();
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [all, user] = await Promise.all([
          request('/api/achievements'),
          request('/api/achievements/user')
        ]);
        setAllAchievements(all.achievements);
        setUserAchievements(user.achievements);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getIcon = (iconName: string, color: string) => {
    const props = { size: 32, color };
    switch (iconName) {
      case 'Award': return <Award {...props} />;
      case 'Trophy': return <Trophy {...props} />;
      case 'Star': return <Star {...props} />;
      case 'Flame': return <Flame {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Crown': return <Crown {...props} />;
      default: return <Award {...props} />;
    }
  };

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-[#020617]">
    <div className="animate-pulse text-teal-500 text-2xl font-bold">جاري تحميل الإنجازات...</div>
  </div>;

  const earnedIds = new Set(userAchievements.map(a => a.id));

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
              <Trophy className="text-gold w-10 h-10" />
              خزانة الإنجازات
            </h1>
            <p className="text-slate-400">لقد حققت {userAchievements.length} من أصل {allAchievements.length} إنجازاً</p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline" className="border-white/10">
              <LayoutDashboard className="ml-2 w-5 h-5" />
              العودة للوحة التحكم
            </Button>
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allAchievements.map((achievement) => {
            const isEarned = earnedIds.has(achievement.id);
            return (
              <motion.div 
                key={achievement.id}
                whileHover={isEarned ? { scale: 1.05 } : {}}
                className={`glass-card p-8 rounded-[32px] relative overflow-hidden transition-all duration-500 ${
                  isEarned ? 'border-teal-500/30 bg-teal-500/5' : 'opacity-50 grayscale'
                }`}
              >
                {!isEarned && (
                  <div className="absolute top-4 left-4">
                    <Lock className="w-5 h-5 text-slate-600" />
                  </div>
                )}
                
                {isEarned && (
                  <div className="absolute top-4 left-4">
                    <CheckCircle2 className="w-5 h-5 text-teal-400" />
                  </div>
                )}

                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${
                  isEarned ? 'bg-white/5 glow-teal' : 'bg-white/5'
                }`}>
                  {getIcon(achievement.icon, isEarned ? achievement.color : '#475569')}
                </div>

                <h3 className={`text-xl font-black mb-2 ${isEarned ? 'text-white' : 'text-slate-500'}`}>
                  {achievement.name}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {achievement.description}
                </p>

                {isEarned && (
                  <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-teal-500">تم الإنجاز</span>
                    <span className="text-[10px] text-slate-600 font-mono">2024/05/12</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;
