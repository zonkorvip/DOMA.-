import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBackend } from '../hooks/useBackend';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  explanation: string;
  clinical_note: string;
}

const ExamPage: React.FC = () => {
  const { categoryId, levelId } = useParams();
  const navigate = useNavigate();
  const { request } = useBackend();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const startExam = async () => {
      try {
        const data = await request('/api/quizzes/start', {
          method: 'POST',
          body: JSON.stringify({ categoryId, levelId, mode: 'exam' })
        });
        setQuestions(data.questions);
        setAttemptId(data.attemptId);
      } catch (err) {
        console.error(err);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    startExam();
  }, [categoryId, levelId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswer = (option: string) => {
    const questionId = questions[currentIndex].id;
    setAnswers(prev => ({ ...prev, [questionId]: option }));
    
    // Auto-advance after a short delay
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    }
  };

  const handleFinish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Submit all answers
      for (const [qId, ans] of Object.entries(answers)) {
        await request('/api/quizzes/answer', {
          method: 'POST',
          body: JSON.stringify({ 
            attemptId, 
            questionId: parseInt(qId), 
            userAnswer: ans, 
            timeSpentSeconds: 0 
          })
        });
      }
      
      const result = await request('/api/quizzes/finish', {
        method: 'POST',
        body: JSON.stringify({ attemptId })
      });
      
      navigate(`/results/${attemptId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-[#020617]">
    <div className="animate-pulse text-teal-500 text-2xl font-bold">جاري تحضير الاختبار...</div>
  </div>;

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 glass-card border-none flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">اختبار محاكي</div>
            <div className="font-black">العلامات الحيوية - مستوى أساسي</div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-teal-400 font-mono text-xl font-bold">
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          <Button 
            className="gradient-bg border-none font-bold px-8" 
            onClick={handleFinish}
            disabled={isSubmitting}
          >
            إنهاء الاختبار
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/5">
        <motion.div 
          className="h-full bg-teal-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-teal-500 font-bold">
                  <HelpCircle className="w-5 h-5" />
                  السؤال {currentIndex + 1} من {questions.length}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                  {currentQuestion.question_text}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OptionButton 
                  label="A" 
                  text={currentQuestion.option_a} 
                  selected={answers[currentQuestion.id] === 'A'}
                  onClick={() => handleAnswer('A')}
                />
                <OptionButton 
                  label="B" 
                  text={currentQuestion.option_b} 
                  selected={answers[currentQuestion.id] === 'B'}
                  onClick={() => handleAnswer('B')}
                />
                <OptionButton 
                  label="C" 
                  text={currentQuestion.option_c} 
                  selected={answers[currentQuestion.id] === 'C'}
                  onClick={() => handleAnswer('C')}
                />
                <OptionButton 
                  label="D" 
                  text={currentQuestion.option_d} 
                  selected={answers[currentQuestion.id] === 'D'}
                  onClick={() => handleAnswer('D')}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-12 flex justify-between items-center">
            <Button 
              variant="outline" 
              className="border-white/10 h-12 px-6 font-bold"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
            >
              <ChevronRight className="ml-2 w-5 h-5" />
              السابق
            </Button>
            
            <div className="flex gap-2">
              {questions.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex ? 'bg-teal-500 w-6' : 
                    answers[questions[i].id] ? 'bg-teal-500/40' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            <Button 
              variant="outline" 
              className="border-white/10 h-12 px-6 font-bold"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex(prev => prev + 1)}
            >
              التالي
              <ChevronLeft className="mr-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

const OptionButton = ({ label, text, selected, onClick }: { label: string, text: string, selected: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-2xl text-right transition-all duration-300 flex items-center gap-6 group ${
      selected ? 'bg-teal-500 text-white glow-teal scale-[1.02]' : 'bg-white/5 hover:bg-white/10 text-slate-300'
    }`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg transition-colors ${
      selected ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500 group-hover:text-teal-400'
    }`}>
      {label}
    </div>
    <span className="text-lg font-medium">{text}</span>
  </button>
);

export default ExamPage;
