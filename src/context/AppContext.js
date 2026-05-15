import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveState, loadState, getToday, DEFAULT_SETTINGS, updateReviewInterval, shuffleArray } from '../utils/helpers';

const AppContext = createContext();

const STORAGE_KEY_PREFIX = 'tangoanki_';

const initialState = {
  currentUser: null,
  streak: 0,
  lastStudyDate: '',
  totalMastered: 0,
  masteredWordIds: [],
  wordResults: {},
  bookmarkedWords: [],
  userVocab: {},
  dailyStudyCount: {},
  totalStudyMinutes: 0,
  settings: DEFAULT_SETTINGS,
  allWords: [],
  currentSessionWords: [],
  currentWordIndex: 0,
  wordProgress: {},
  isLoading: true,
  todayReviewWords: [],
  currentSessionResult: { know: 0, fuzzy: 0, dontKnow: 0 },
  initialWordCount: 0,
};

const getStorageKey = (user) => {
  return STORAGE_KEY_PREFIX + (user || 'guest');
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOAD_STATE':
      return {
        ...state,
        currentUser: action.payload.currentUser || null,
        streak: action.payload.streak || 0,
        lastStudyDate: action.payload.lastStudyDate || '',
        totalMastered: action.payload.totalMastered || 0,
        masteredWordIds: action.payload.masteredWordIds || [],
        wordResults: action.payload.wordResults || {},
        bookmarkedWords: action.payload.bookmarkedWords || [],
        userVocab: action.payload.userVocab || {},
        dailyStudyCount: action.payload.dailyStudyCount || {},
        totalStudyMinutes: action.payload.totalStudyMinutes || 0,
        settings: action.payload.settings || DEFAULT_SETTINGS,
        isLoading: false,
      };

    case 'SET_USER':
      return { ...state, currentUser: action.payload };

    case 'SET_ALL_WORDS':
      return { ...state, allWords: action.payload };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'START_LEARN_SESSION':
      return {
        ...state,
        currentSessionWords: action.payload.words,
        currentWordIndex: 0,
        wordProgress: {},
        initialWordCount: action.payload.words.length,
        currentSessionResult: { know: 0, fuzzy: 0, dontKnow: 0 },
      };

    case 'UPDATE_WORD_PROGRESS':
      return {
        ...state,
        wordProgress: {
          ...state.wordProgress,
          [action.payload.wordId]: action.payload.progress,
        },
      };

    case 'NEXT_WORD':
      return { ...state, currentWordIndex: state.currentWordIndex + 1 };

    case 'SET_CURRENT_INDEX':
      return { ...state, currentWordIndex: action.payload };

    case 'RECORD_ANSWER':
      const { answer, wordId } = action.payload;
      const newResults = { ...state.wordResults, [wordId]: answer };
      let newMasteredIds = [...state.masteredWordIds];
      let newTotalMastered = state.totalMastered;
      let newSessionResult = { ...state.currentSessionResult };

      if (answer === 'know') {
        newSessionResult.know++;
        if (!newMasteredIds.includes(wordId)) {
          newMasteredIds.push(wordId);
          newTotalMastered++;
        }
      } else if (answer === 'fuzzy') {
        newSessionResult.fuzzy++;
      } else {
        newSessionResult.dontKnow++;
      }

      return {
        ...state,
        wordResults: newResults,
        masteredWordIds: newMasteredIds,
        totalMastered: newTotalMastered,
        currentSessionResult: newSessionResult,
      };

    case 'TOGGLE_BOOKMARK':
      const wordIdToToggle = action.payload;
      const isBookmarked = state.bookmarkedWords.includes(wordIdToToggle);
      return {
        ...state,
        bookmarkedWords: isBookmarked
          ? state.bookmarkedWords.filter(id => id !== wordIdToToggle)
          : [...state.bookmarkedWords, wordIdToToggle],
      };

    case 'UPDATE_USER_VOCAB':
      return { ...state, userVocab: action.payload };

    case 'FINISH_SESSION':
      const today = getToday();
      let newStreak = state.streak;
      if (state.lastStudyDate !== today) {
        newStreak++;
      }
      const newDailyCount = {
        ...state.dailyStudyCount,
        [today]: (state.dailyStudyCount[today] || 0) + state.currentSessionResult.know,
      };

      return {
        ...state,
        streak: newStreak,
        lastStudyDate: today,
        dailyStudyCount: newDailyCount,
        totalStudyMinutes: state.totalStudyMinutes + 3,
        currentSessionWords: [],
      };

    case 'RESET_SESSION':
      return {
        ...state,
        currentSessionWords: [],
        currentWordIndex: 0,
        wordProgress: {},
        currentSessionResult: { know: 0, fuzzy: 0, dontKnow: 0 },
      };

    case 'LOGOUT':
      return {
        ...initialState,
        allWords: state.allWords,
        isLoading: false,
      };

    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    loadAllWords();
    loadUserState();
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      persistState();
    }
  }, [state.currentUser, state.streak, state.userVocab, state.settings, state.bookmarkedWords]);

  const loadAllWords = async () => {
    try {
      const defaultWords = require('../data/wordlist.json');
      dispatch({ type: 'SET_ALL_WORDS', payload: defaultWords });
    } catch (error) {
      console.error('Failed to load words:', error);
    }
  };

  const loadUserState = async () => {
    try {
      const lastUser = await AsyncStorage.getItem('tangoanki_lastuser');
      const user = lastUser || null;
      const savedState = await loadState(user);

      if (savedState) {
        dispatch({ type: 'LOAD_STATE', payload: { ...savedState, currentUser: user } });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Failed to load user state:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const persistState = async () => {
    const stateToSave = {
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
    await saveState(state.currentUser, stateToSave);
  };

  const switchUser = async (username) => {
    await AsyncStorage.setItem('tangoanki_lastuser', username);
    const savedState = await loadState(username);
    if (savedState) {
      dispatch({ type: 'LOAD_STATE', payload: { ...savedState, currentUser: username } });
    } else {
      dispatch({ type: 'SET_USER', payload: username });
      dispatch({ type: 'LOAD_STATE', payload: { currentUser: username } });
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('tangoanki_lastuser');
    dispatch({ type: 'LOGOUT' });
  };

  const startLearnSession = (words) => {
    dispatch({ type: 'START_LEARN_SESSION', payload: { words } });
  };

  const recordAnswer = (wordId, answer) => {
    dispatch({ type: 'RECORD_ANSWER', payload: { wordId, answer } });
  };

  const toggleBookmark = (wordId) => {
    dispatch({ type: 'TOGGLE_BOOKMARK', payload: wordId });
  };

  const updateSettings = (settings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const finishSession = () => {
    dispatch({ type: 'FINISH_SESSION' });
  };

  const resetSession = () => {
    dispatch({ type: 'RESET_SESSION' });
  };

  const getWordProgress = useCallback((wordId) => {
    return state.wordProgress[wordId] || { currentRound: 1, consecutiveCorrect: 0 };
  }, [state.wordProgress]);

  const setWordProgress = useCallback((wordId, progress) => {
    dispatch({ type: 'UPDATE_WORD_PROGRESS', payload: { wordId, progress } });
  }, []);

  const updateUserVocab = useCallback((wordId, quality) => {
    const newUserVocab = updateReviewInterval(wordId, quality, { ...state.userVocab });
    dispatch({ type: 'UPDATE_USER_VOCAB', payload: newUserVocab });
  }, [state.userVocab]);

  const getRemainingNewWordsCount = useCallback(() => {
    return state.allWords.filter(w => !state.userVocab[w.id]).length;
  }, [state.allWords, state.userVocab]);

  const getTodayReviewWords = useCallback(() => {
    const today = getToday();
    return state.allWords.filter(w => {
      const vocab = state.userVocab[w.id];
      return vocab && vocab.nextReviewDate && vocab.nextReviewDate <= today && !vocab.isMastered;
    });
  }, [state.allWords, state.userVocab]);

  const value = {
    ...state,
    switchUser,
    logout,
    startLearnSession,
    recordAnswer,
    toggleBookmark,
    updateSettings,
    finishSession,
    resetSession,
    getWordProgress,
    setWordProgress,
    updateUserVocab,
    getRemainingNewWordsCount,
    getTodayReviewWords,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
