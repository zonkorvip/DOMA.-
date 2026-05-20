import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { db, initDB } from './backend/auth/db';
import { signToken, verifyToken } from './backend/auth/jwt';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Database
  initDB();

  // --- Auth Routes ---
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const stmt = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
      const result = stmt.run(name, email, passwordHash);
      
      const user = { id: result.lastInsertRowid as number, name, email };
      const token = signToken({ userId: user.id, email: user.email, name: user.name });
      
      res.json({ token, user });
    } catch (err: any) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  });

  // Middleware for protected routes
  const authenticate = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
    
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ message: 'Invalid token' });
    
    req.user = payload;
    next();
  };

  app.get('/api/auth/me', authenticate, (req: any, res) => {
    const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.user.userId);
    res.json(user);
  });

  // --- Quiz Routes ---
  app.get('/api/quizzes/categories', authenticate, (req, res) => {
    const categories = db.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order').all();
    res.json({ categories });
  });

  app.get('/api/quizzes/levels', authenticate, (req, res) => {
    const { categoryId } = req.query;
    const levels = db.prepare('SELECT * FROM levels ORDER BY sort_order').all();
    res.json({ levels });
  });

  app.get('/api/quizzes/questions', authenticate, (req, res) => {
    const { categoryId, levelId } = req.query;
    const questions = db.prepare('SELECT * FROM questions WHERE category_id = ? AND level_id = ? AND is_active = 1 ORDER BY sort_order').all(categoryId, levelId);
    res.json({ questions });
  });

  app.post('/api/quizzes/start', authenticate, (req: any, res) => {
    const { categoryId, levelId, mode } = req.body;
    const questions = db.prepare('SELECT * FROM questions WHERE category_id = ? AND level_id = ? AND is_active = 1 ORDER BY RANDOM() LIMIT 25').all(categoryId, levelId);
    
    const stmt = db.prepare('INSERT INTO attempts (user_id, category_id, level_id, mode, total_questions) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(req.user.userId, categoryId, levelId, mode, questions.length);
    
    res.json({ attemptId: result.lastInsertRowid, questions, startedAt: new Date() });
  });

  app.post('/api/quizzes/answer', authenticate, (req, res) => {
    const { attemptId, questionId, userAnswer, timeSpentSeconds } = req.body;
    const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(questionId) as any;
    const isCorrect = question.correct_option === userAnswer;
    
    db.prepare('INSERT INTO attempt_answers (attempt_id, question_id, user_answer, is_correct, time_spent_seconds) VALUES (?, ?, ?, ?, ?)')
      .run(attemptId, questionId, userAnswer, isCorrect ? 1 : 0, timeSpentSeconds);
      
    res.json({ 
      isCorrect, 
      correctOption: question.correct_option, 
      explanation: question.explanation,
      clinicalNote: question.clinical_note
    });
  });

  app.post('/api/quizzes/finish', authenticate, (req, res) => {
    const { attemptId } = req.body;
    const answers = db.prepare('SELECT * FROM attempt_answers WHERE attempt_id = ?').all() as any[];
    const correctCount = answers.filter(a => a.is_correct).length;
    const totalCount = answers.length;
    const score = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
    const timeSpent = answers.reduce((acc, a) => acc + a.time_spent_seconds, 0);
    
    let grade = 'راسب';
    if (score >= 90) grade = 'ممتاز';
    else if (score >= 80) grade = 'جيد جداً';
    else if (score >= 70) grade = 'جيد';
    else if (score >= 60) grade = 'مقبول';

    db.prepare('UPDATE attempts SET score = ?, correct_count = ?, wrong_count = ?, time_spent_seconds = ?, overall_grade = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(score, correctCount, totalCount - correctCount, timeSpent, grade, attemptId);
      
    res.json({ attemptId, score, grade });
  });

  app.get('/api/quizzes/history', authenticate, (req: any, res) => {
    const attempts = db.prepare(`
      SELECT a.*, c.name as category_name, l.name as level_name 
      FROM attempts a
      JOIN categories c ON a.category_id = c.id
      JOIN levels l ON a.level_id = l.id
      WHERE a.user_id = ? AND a.completed_at IS NOT NULL
      ORDER BY a.created_at DESC
    `).all(req.user.userId);
    res.json({ attempts });
  });

  app.get('/api/achievements', authenticate, (req, res) => {
    const achievements = db.prepare('SELECT * FROM achievements ORDER BY sort_order').all();
    res.json({ achievements });
  });

  app.get('/api/achievements/user', authenticate, (req: any, res) => {
    const userAchievements = db.prepare(`
      SELECT a.* FROM achievements a
      JOIN user_achievements ua ON a.id = ua.achievement_id
      WHERE ua.user_id = ?
    `).all(req.user.userId);
    res.json({ achievements: userAchievements });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
