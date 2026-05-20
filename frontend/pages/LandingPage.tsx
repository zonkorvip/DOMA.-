import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ChevronLeft, Shield, Brain, Trophy, Activity, BookOpen, Users } from 'lucide-react';
import HeroScene from '../three/HeroScene';
import { Button } from '../components/ui/button';

gsap.registerPlugin(ScrollTrigger);

const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-title span', {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power4.out'
      });

      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: '.features-grid',
          start: 'top 80%',
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'back.out(1.7)'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#020617] text-white overflow-hidden">
      <HeroScene />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center glass-card border-none bg-transparent">
        <div className="text-2xl font-black tracking-tighter gradient-text">N.R EXAM</div>
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#features" className="hover:text-teal-400 transition-colors">المميزات</a>
          <a href="#about" className="hover:text-teal-400 transition-colors">عن المنصة</a>
          <a href="#contact" className="hover:text-teal-400 transition-colors">اتصل بنا</a>
        </div>
        <div className="flex gap-4">
          <Link to="/login">
            <Button variant="ghost" className="text-white hover:text-teal-400">تسجيل الدخول</Button>
          </Link>
          <Link to="/register">
            <Button className="gradient-bg border-none hover:opacity-90 transition-all glow-teal">ابدأ الآن</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 pt-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="mb-6 px-4 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-bold tracking-widest uppercase"
        >
          مستقبل تعليم التمريض هنا
        </motion.div>
        
        <h1 className="hero-title text-6xl md:text-8xl font-black mb-6 leading-tight">
          <span className="inline-block">احترف</span>{' '}
          <span className="inline-block gradient-text">التمريض</span>{' '}
          <span className="inline-block">بذكاء</span>
        </h1>
        
        <p className="max-w-2xl text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
          المنصة الأولى المدعومة بالذكاء الاصطناعي لتدريب ممرضي المستقبل. اختبارات محاكية، تحليل دقيق للأداء، ومسارات تعلم مخصصة.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <Link to="/register">
            <Button size="lg" className="h-14 px-10 text-lg font-bold gradient-bg border-none glow-teal group">
              ابدأ رحلة التميز
              <ChevronLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold border-white/10 hover:bg-white/5">
            شاهد العرض التجريبي
          </Button>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <div className="w-6 h-10 rounded-full border-2 border-white flex justify-center pt-2">
            <div className="w-1 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">لماذا تختار <span className="gradient-text">N.R EXAM</span>؟</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">نحن نجمع بين التكنولوجيا المتقدمة والخبرة الطبية لنقدم لك أفضل تجربة تعليمية.</p>
          </div>

          <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Brain className="w-8 h-8 text-teal-400" />}
              title="ذكاء اصطناعي متطور"
              description="تحليل عميق لإجاباتك وتحديد نقاط القوة والضعف بدقة متناهية."
            />
            <FeatureCard 
              icon={<Activity className="w-8 h-8 text-blue-400" />}
              title="محاكاة واقعية"
              description="اختبارات تحاكي بيئة الامتحانات الوطنية والدولية للتمريض."
            />
            <FeatureCard 
              icon={<Trophy className="w-8 h-8 text-purple-400" />}
              title="نظام إنجازات"
              description="تحدى نفسك واكسب أوسمة تعكس تقدمك واحترافيتك السريرية."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 bg-white/5 relative overflow-hidden">
        <div className="mesh-blob opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <StatItem value="+50,000" label="سؤال تدريبي" />
          <StatItem value="+10,000" label="طالب نشط" />
          <StatItem value="98%" label="نسبة النجاح" />
          <StatItem value="+15" label="تخصص تمريضي" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-[#010413]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="text-3xl font-black gradient-text mb-6">N.R EXAM</div>
            <p className="text-slate-500 max-w-md">
              نحن نؤمن بأن التعليم الطبي يجب أن يكون ملهماً، تفاعلياً، ومتاحاً للجميع. انضم إلينا في بناء جيل جديد من الممرضين المتميزين.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">روابط سريعة</h4>
            <ul className="space-y-4 text-slate-500">
              <li><a href="#" className="hover:text-teal-400 transition-colors">الرئيسية</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">الاختبارات</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">المدونة</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">تواصل معنا</h4>
            <ul className="space-y-4 text-slate-500">
              <li>info@nrexam.com</li>
              <li>+966 500 000 000</li>
              <li className="flex gap-4 mt-6">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-teal-500/20 transition-colors cursor-pointer">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-teal-500/20 transition-colors cursor-pointer">
                  <Users className="w-5 h-5" />
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-slate-600 text-sm">
          © 2024 N.R EXAM. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="feature-card glass-card p-8 group hover:-translate-y-2 transition-all duration-500">
    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-4">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const StatItem = ({ value, label }: { value: string, label: string }) => (
  <div className="group">
    <div className="text-4xl md:text-5xl font-black gradient-text mb-2 group-hover:scale-110 transition-transform duration-500 inline-block">{value}</div>
    <div className="text-slate-500 font-medium">{label}</div>
  </div>
);

export default LandingPage;
