// 本地缓存层：离线时先用 localStorage，联网后同步到云端

import { Question, WrongAnswer, QuizSettings } from '@/types';

const KEY_QUESTIONS = 'quiz_questions';
const KEY_WRONGBOOK = 'quiz_wrongbook';
const KEY_SETTINGS = 'quiz_settings_v2';
const KEY_LAST_SYNC = 'quiz_last_sync';

export const localStore = {
  getQuestions(): Question[] {
    try { return JSON.parse(localStorage.getItem(KEY_QUESTIONS) || '[]'); } catch { return []; }
  },
  setQuestions(qs: Question[]) {
    localStorage.setItem(KEY_QUESTIONS, JSON.stringify(qs));
  },
  getWrongBook(): WrongAnswer[] {
    try { return JSON.parse(localStorage.getItem(KEY_WRONGBOOK) || '[]'); } catch { return []; }
  },
  setWrongBook(ws: WrongAnswer[]) {
    localStorage.setItem(KEY_WRONGBOOK, JSON.stringify(ws));
  },
  getSettings(): QuizSettings {
    try { return JSON.parse(localStorage.getItem(KEY_SETTINGS) || '{}'); } catch {
      return { soundEffect: true, bgMusic: false, autoReadAnalysis: false, autoRemoveWrong: true, theme: 'light', quizSpeed: 1 };
    }
  },
  setSettings(s: QuizSettings) {
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(s));
  },
  getLastSync(): string {
    return localStorage.getItem(KEY_LAST_SYNC) || '';
  },
  setLastSync(t: string) {
    localStorage.setItem(KEY_LAST_SYNC, t);
  },
  exportAll() {
    return {
      questions: localStore.getQuestions(),
      wrongBook: localStore.getWrongBook(),
      settings: localStore.getSettings(),
      exportAt: new Date().toISOString(),
    };
  },
  importAll(data: any) {
    if (data.questions) localStore.setQuestions(data.questions);
    if (data.wrongBook) localStore.setWrongBook(data.wrongBook);
    if (data.settings) localStore.setSettings(data.settings);
  },
  clear() {
    localStorage.removeItem(KEY_QUESTIONS);
    localStorage.removeItem(KEY_WRONGBOOK);
    localStorage.removeItem(KEY_SETTINGS);
    localStorage.removeItem(KEY_LAST_SYNC);
  },
};
