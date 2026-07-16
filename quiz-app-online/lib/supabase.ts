import { createClient } from '@supabase/supabase-js';
import { Question, WrongAnswer, Favorite, UserProfile, PointsTransaction, QuizSettings } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
});

// ============ Auth ============
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nickname: email.split('@')[0] } }
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ============ User Profile ============
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId);
  return { data, error };
}

// ============ Questions ============
export async function getQuestions(userId: string, subject?: string): Promise<Question[]> {
  let query = supabase.from('questions').select('*').eq('user_id', userId);
  if (subject) query = query.eq('subject', subject);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function addQuestion(question: Omit<Question, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('questions')
    .insert([question])
    .select()
    .single();
  return { data, error };
}

export async function updateQuestion(id: string, updates: Partial<Question>) {
  const { data, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteQuestion(id: string) {
  const { error } = await supabase.from('questions').delete().eq('id', id);
  return { error };
}

// ============ Wrong Answers ============
export async function getWrongAnswers(userId: string): Promise<WrongAnswer[]> {
  const { data, error } = await supabase
    .from('wrong_answers')
    .select('*, question:questions(*)')
    .eq('user_id', userId)
    .order('last_wrong', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function recordWrongAnswer(userId: string, questionId: string) {
  const { data: existing } = await supabase
    .from('wrong_answers')
    .select('*')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .single();
  
  if (existing) {
    const { data, error } = await supabase
      .from('wrong_answers')
      .update({
        wrong_count: existing.wrong_count + 1,
        last_wrong: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();
    return { data, error };
  } else {
    const { data, error } = await supabase
      .from('wrong_answers')
      .insert([{
        user_id: userId,
        question_id: questionId,
        wrong_count: 1,
        first_wrong: new Date().toISOString(),
        last_wrong: new Date().toISOString(),
      }])
      .select()
      .single();
    return { data, error };
  }
}

export async function removeWrongAnswer(id: string) {
  const { error } = await supabase.from('wrong_answers').delete().eq('id', id);
  return { error };
}

// ============ Favorites ============
export async function getFavorites(userId: string): Promise<Favorite[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId);
  if (error) return [];
  return data || [];
}

export async function toggleFavorite(userId: string, questionId: string) {
  const { data: existing } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .single();
  
  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('favorites').insert([{ user_id: userId, question_id: questionId }]);
    return true;
  }
}

// ============ Points ============
export async function getBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('balance_points')
    .eq('id', userId)
    .single();
  if (error || !data) return 0;
  return data.balance_points;
}

export async function deductPoints(
  userId: string,
  amount: number,
  actionType: string,
  description: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('deduct_points', {
    p_user_id: userId,
    p_amount: amount,
    p_action_type: actionType,
    p_description: description,
  });
  return !error && data === true;
}

export async function getTransactions(userId: string): Promise<PointsTransaction[]> {
  const { data, error } = await supabase
    .from('points_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return [];
  return data || [];
}

// ============ Settings ============
export async function getSettings(userId: string): Promise<QuizSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('settings')
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  return data.settings;
}

export async function saveSettings(userId: string, settings: QuizSettings) {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, settings }, { onConflict: 'user_id' });
  return { data, error };
}
