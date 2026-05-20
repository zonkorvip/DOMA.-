CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_color TEXT DEFAULT '#0D9488',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  icon TEXT DEFAULT 'Stethoscope',
  color TEXT DEFAULT '#0D9488',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS levels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  icon TEXT DEFAULT 'BarChart3',
  color TEXT DEFAULT '#0D9488',
  sort_order INTEGER DEFAULT 0,
  min_score_to_pass INTEGER DEFAULT 60,
  time_limit_seconds INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  level_id INTEGER NOT NULL REFERENCES levels(id),
  topic TEXT NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A','B','C','D')),
  explanation TEXT NOT NULL,
  clinical_note TEXT,
  difficulty_weight REAL DEFAULT 1.0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  level_id INTEGER NOT NULL REFERENCES levels(id),
  mode TEXT NOT NULL DEFAULT 'exam' CHECK (mode IN ('learn', 'exam')),
  score REAL NOT NULL DEFAULT 0,
  weighted_score REAL NOT NULL DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  overall_grade TEXT NOT NULL DEFAULT 'راسب',
  grade_level INTEGER DEFAULT 0,
  competency_class TEXT DEFAULT 'D',
  competency_label TEXT DEFAULT 'يحتاج تطوير مكثف',
  error_pattern TEXT DEFAULT 'مختلط',
  detailed_analysis TEXT NOT NULL DEFAULT '{}',
  ai_feedback TEXT,
  study_recommendations TEXT NOT NULL DEFAULT '[]',
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attempt_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  user_answer TEXT,
  is_correct BOOLEAN,
  time_spent_seconds INTEGER DEFAULT 0,
  attempt_number INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  level_id INTEGER NOT NULL REFERENCES levels(id),
  best_score REAL DEFAULT 0,
  best_weighted_score REAL DEFAULT 0,
  best_grade TEXT,
  best_competency_class TEXT DEFAULT 'D',
  attempts_count INTEGER DEFAULT 0,
  avg_score REAL DEFAULT 0,
  is_mastered BOOLEAN DEFAULT false,
  mastered_at DATETIME,
  last_attempt_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, category_id, level_id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT DEFAULT '#F59E0B',
  condition_type TEXT NOT NULL,
  condition_value TEXT NOT NULL DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id),
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);
