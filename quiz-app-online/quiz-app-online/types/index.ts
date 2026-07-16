export interface Question {
  id: string;
  user_id: string;
  subject: string;
  type: 'single' | 'multiple' | 'fill' | 'shortanswer' | 'judgement';
  content: string;
  options?: string[];
  answer: string | string[];
  analysis?: string;
  passage?: string;
  images?: string[];
  difficulty?: number;
  source?: string;
  tags?: string[];
  created_at: string;
}

export interface WrongAnswer {
  id: string;
  user_id: string;
  question_id: string;
  question?: Question;
  wrong_count: number;
  first_wrong: string;
  last_wrong: string;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  question_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  nickname?: string;
  avatar_url?: string;
  balance_points: number;
  total_recharged: number;
  created_at: string;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  type: 'in' | 'out';
  amount: number;
  balance_after: number;
  action_type: string;
  description: string;
  created_at: string;
}

export interface RechargeOrder {
  id: string;
  user_id: string;
  amount_yuan: number;
  points_added: number;
  payment_method: string;
  status: 'pending' | 'paid' | 'failed';
  paid_at?: string;
  created_at: string;
}

export interface QuizSettings {
  soundEffect: boolean;
  bgMusic: boolean;
  autoReadAnalysis: boolean;
  autoRemoveWrong: boolean;
  theme: 'light' | 'dark';
  quizSpeed?: number;
}

export const SUBJECT_ORDER = [
  '政治', '英语', '数学', '专业课',
  '行测', '申论', '公基', '教综',
  '医学', '法律', '会计', '其他'
];

export const SUBJECT_ICONS: Record<string, string> = {
  '政治': '📜',
  '英语': '🔤',
  '数学': '🔢',
  '专业课': '📚',
  '行测': '📊',
  '申论': '✍️',
  '公基': '🏛️',
  '教综': '🎓',
  '医学': '🏥',
  '法律': '⚖️',
  '会计': '💰',
  '其他': '📝',
};
