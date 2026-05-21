import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

const STORAGE_KEY_PREFIX = 'tangoanki_';

export const getStorageKey = (user) => {
  return STORAGE_KEY_PREFIX + (user || 'guest');
};

export const saveState = async (user, state) => {
  try {
    const key = getStorageKey(user);
    const dataToSave = {
      currentUser: state.currentUser,
      streak: state.streak,
      lastStudyDate: state.lastStudyDate,
      totalMastered: state.totalMastered,
      masteredWordIds: state.masteredWordIds,
      wordResults: state.wordResults,
      bookmarkedWords: state.bookmarkedWords,
      userVocab: state.userVocab,
      dailyStudyCount: state.dailyStudyCount,
      totalStudyMinutes: state.totalStudyMinutes,
      settings: state.settings,
    };
    await AsyncStorage.setItem(key, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
};

export const loadState = async (user) => {
  try {
    const key = getStorageKey(user);
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
  return null;
};

export const speakJapanese = (text) => {
  Speech.speak(text, {
    language: 'ja-JP',
    pitch: 1.0,
    rate: 0.8,
  });
};

export const getToday = () => {
  return new Date().toISOString().split('T')[0];
};

export const updateReviewInterval = (wordId, quality, userVocab) => {
  const today = getToday();
  const isNew = !userVocab[wordId];
  const vocab = userVocab[wordId] || {
    id: wordId,
    intervalDays: 1,
    easeFactor: 2.5,
    consecutiveCorrect: 0,
    isMastered: false,
    nextReviewDate: today,
    stability: 0,
    lastReviewDate: '',
    dueDate: today,
  };

  // 清除 needsRelearning 标记（重新学习时）
  if (vocab.needsRelearning) {
    vocab.needsRelearning = false;
  }

  if (quality >= 2) {
    vocab.consecutiveCorrect++;
    if (vocab.consecutiveCorrect >= 3) {
      vocab.isMastered = true;
    }

    if (vocab.intervalDays === 1) {
      vocab.intervalDays = 3;
    } else if (vocab.intervalDays === 3) {
      vocab.intervalDays = 7;
    } else {
      vocab.intervalDays = Math.round(vocab.intervalDays * vocab.easeFactor);
    }

    vocab.easeFactor = Math.max(1.3, vocab.easeFactor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02)));

    // 首次学习成功后，设置 dueDate 为明天
    if (isNew || !vocab.lastReviewDate) {
      vocab.stability = 0;
      vocab.lastReviewDate = today;
      vocab.learnedDate = today;
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1);
      vocab.dueDate = nextDate.toISOString().split('T')[0];
      vocab.intervalDays = 1;
    }
  } else {
    vocab.consecutiveCorrect = 0;
    vocab.intervalDays = 1;

    // 即使答错也设置 initial dueDate
    if (isNew || !vocab.lastReviewDate) {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1);
      vocab.dueDate = nextDate.toISOString().split('T')[0];
      vocab.lastReviewDate = today;
    }
  }

  if (!vocab.dueDate) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + vocab.intervalDays);
    vocab.dueDate = nextDate.toISOString().split('T')[0];
  }
  vocab.nextReviewDate = vocab.dueDate;

  userVocab[wordId] = vocab;
  return userVocab;
};

export const DEFAULT_SETTINGS = {
  studyWordsPerSession: 10,
  reviewWordsPerSession: 20,
  firstReviewDelay: 'all',
  theme: 'system',
};

export const calculateStats = (userVocab, dailyStudyCount, masteredWordIds) => {
  const today = getToday();
  const todayReviewWords = Object.values(userVocab).filter(vocab => {
    return vocab.nextReviewDate && vocab.nextReviewDate <= today && !vocab.isMastered;
  });

  const totalDays = Object.keys(dailyStudyCount).length;
  const totalWords = Object.keys(userVocab).length;
  const totalMinutes = Object.values(dailyStudyCount).reduce((sum, count) => sum + count * 3, 0);

  return {
    streak: 0,
    mastered: masteredWordIds.length,
    todayReview: todayReviewWords.length,
    newWordsRemaining: totalWords > 0 ? 0 : 0,
    totalDays,
    totalWords,
    totalMinutes,
  };
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getRandomWords = (words, count) => {
  const shuffled = shuffleArray(words);
  return shuffled.slice(0, count);
};

export const normalizeKana = (text) => {
  return (text || '').trim();
};

export const updateReviewVocab = (wordId, result, userVocab) => {
  const today = getToday();
  const vocab = userVocab[wordId] || {
    id: wordId,
    intervalDays: 1,
    easeFactor: 2.5,
    consecutiveCorrect: 0,
    isMastered: false,
    nextReviewDate: today,
    stability: 0,
    lastReviewDate: '',
    dueDate: today,
  };

  if (result === 'know') {
    vocab.stability = Math.min(100, (vocab.stability || 0) + 20);
    const interval = Math.max(1, Math.min(365, Math.round((vocab.stability || 0) / 10)));
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    vocab.dueDate = nextDate.toISOString().split('T')[0];
    vocab.intervalDays = interval;
    vocab.consecutiveCorrect = (vocab.consecutiveCorrect || 0) + 1;
  } else if (result === 'fuzzy') {
    vocab.stability = Math.min(100, (vocab.stability || 0) + 5);
    const currentInterval = vocab.intervalDays || 1;
    const nextInterval = Math.max(1, Math.round(currentInterval * 0.5));
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + nextInterval);
    vocab.dueDate = nextDate.toISOString().split('T')[0];
    vocab.intervalDays = nextInterval;
  } else {
    vocab.stability = 0;
    vocab.intervalDays = 1;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    vocab.dueDate = nextDate.toISOString().split('T')[0];
    vocab.consecutiveCorrect = 0;
  }

  vocab.lastReviewDate = today;
  vocab.nextReviewDate = vocab.dueDate;

  userVocab[wordId] = vocab;
  return userVocab;
};
