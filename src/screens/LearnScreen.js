import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getColors } from '../utils/colors';
import { speakJapanese, shuffleArray } from '../utils/helpers';

export default function LearnScreen({ route, navigation }) {
  const { words: initialWords, mode = 'learn' } = route.params;
  const isReviewMode = mode === 'first_review';
  const {
    recordAnswer,
    toggleBookmark,
    updateUserVocab,
    updateUserReviewVocab,
    getWordProgress,
    setWordProgress,
    bookmarkedWords,
    finishSession,
    settings,
    allWords,
    startLearnSession,
    moveToNewLearningQueue,
  } = useApp();

  const isDark = settings.theme === 'dark';
  const colors = getColors(isDark);

  const [learnQueue, setLearnQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [optionsDisabled, setOptionsDisabled] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [initialCount] = useState(initialWords?.length || 0);
  const [showSpelling, setShowSpelling] = useState(false);
  const [spellingInput, setSpellingInput] = useState('');
  const [spellingResult, setSpellingResult] = useState(null);
  const [spellingIndex, setSpellingIndex] = useState(0);
  const [spellingCorrect, setSpellingCorrect] = useState(0);
  const [spellingWords, setSpellingWords] = useState([]);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [showMeaningCard, setShowMeaningCard] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [postJudgmentKnow, setPostJudgmentKnow] = useState(false);

  // 复习模式状态
  const [reviewShowMeaning, setReviewShowMeaning] = useState(false);
  const [reviewJudged, setReviewJudged] = useState(false);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [pendingFinalReview, setPendingFinalReview] = useState([]);
  const [isFinalReview, setIsFinalReview] = useState(false);
  const [finalReviewQueue, setFinalReviewQueue] = useState([]);

  const answerDelayRef = useRef(null);
  const spellingTimeoutRef = useRef(null);

  const currentWord = learnQueue[currentIndex];

  useEffect(() => {
    if (initialWords && initialWords.length > 0) {
      if (isReviewMode) {
        const queue = initialWords.map((word, idx) => ({ ...word, originalIndex: idx }));
        setReviewQueue(queue);
        setPendingFinalReview([]);
        setIsFinalReview(false);
        setFinalReviewQueue([]);
      } else {
        const queue = initialWords.map((word, idx) => ({
          ...word,
          originalIndex: idx,
        }));
        setLearnQueue(queue);
      }
      startLearnSession(initialWords);
    }

    return () => {
      if (answerDelayRef.current) clearTimeout(answerDelayRef.current);
      if (spellingTimeoutRef.current) clearTimeout(spellingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (currentWord) {
      generateOptionsForWord(currentWord);
      setShowAnswer(false);
      setWaitingForNext(false);
      setShowMeaningCard(false);
      setShowHint(false);
      setShowContinueButton(false);
      setPostJudgmentKnow(false);
      setSelectedOption(null);
      setOptionsDisabled(false);
      setIsCorrect(null);
    }
  }, [currentIndex, currentWord]);

  const generateOptionsForWord = useCallback((word) => {
    if (!word) return;
    const correctMeaning = word.meaning;
    const wrongOptions = allWords
      .filter(w => w.id !== word.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.meaning);
    const allOptions = shuffleArray([correctMeaning, ...wrongOptions]);
    setOptions(allOptions);
  }, [allWords]);

  const handleSelectOption = (meaning) => {
    if (optionsDisabled || !currentWord) return;

    const correct = meaning === currentWord.meaning;
    setSelectedOption(meaning);
    setIsCorrect(correct);
    setOptionsDisabled(true);
    recordAnswer(currentWord.id, correct ? 'know' : 'dontKnow');

    const progress = getWordProgress(currentWord.id) || { currentRound: 1, consecutiveCorrect: 0 };
    if (correct) {
      progress.consecutiveCorrect++;
    } else {
      progress.consecutiveCorrect = 0;
    }
    setWordProgress(currentWord.id, progress);
    updateUserVocabForRound(currentWord.id, correct ? 2 : 0);

    if (correct) {
      if (answerDelayRef.current) clearTimeout(answerDelayRef.current);
      answerDelayRef.current = setTimeout(() => {
        setWaitingForNext(true);
        setShowAnswer(true);
      }, 500);
    } else {
      setShowContinueButton(true);
    }
  };

  const handleContinue = () => {
    setShowContinueButton(false);
    setWaitingForNext(true);
    setShowAnswer(true);
  };

  const handleShowAnswer = () => {
    if (answerDelayRef.current) clearTimeout(answerDelayRef.current);
    setOptionsDisabled(true);
    setSelectedOption(null);
    setIsCorrect(false);
    recordAnswer(currentWord.id, 'dontKnow');

    const progress = getWordProgress(currentWord.id) || { currentRound: 1, consecutiveCorrect: 0 };
    progress.consecutiveCorrect = 0;
    setWordProgress(currentWord.id, progress);
    updateUserVocabForRound(currentWord.id, 0);

    setWaitingForNext(true);
    setShowAnswer(true);
  };

  const handleJudgment = (isKnow) => {
    if (!currentWord) return;

    const progress = getWordProgress(currentWord.id) || { currentRound: 1, consecutiveCorrect: 0 };
    const round = progress.currentRound;

    recordAnswer(currentWord.id, isKnow ? 'know' : 'dontKnow');

    if (round === 2) {
      if (isKnow) {
        progress.consecutiveCorrect++;
        progress.currentRound = 3;
        updateUserVocabForRound(currentWord.id, 2);
        setWordProgress(currentWord.id, progress);
        setPostJudgmentKnow(true);
        setShowMeaningCard(true);
      } else {
        progress.consecutiveCorrect = 0;
        progress.currentRound = 1;
        updateUserVocabForRound(currentWord.id, 0);
        setWordProgress(currentWord.id, progress);
        setPostJudgmentKnow(false);
        setShowMeaningCard(true);
      }
    } else if (round === 3) {
      if (isKnow) {
        progress.consecutiveCorrect = 3;
        progress.currentRound = 4;
        updateUserVocabForRound(currentWord.id, 2);
        setWordProgress(currentWord.id, progress);
        setPostJudgmentKnow(true);
        setShowMeaningCard(true);
      } else {
        progress.consecutiveCorrect = 0;
        progress.currentRound = 1;
        updateUserVocabForRound(currentWord.id, 0);
        setWordProgress(currentWord.id, progress);
        setPostJudgmentKnow(false);
        setShowMeaningCard(true);
      }
    }
  };

  const handleMistake = () => {
    if (!currentWord) return;
    const progress = getWordProgress(currentWord.id) || { currentRound: 1, consecutiveCorrect: 0 };
    progress.consecutiveCorrect = 0;
    progress.currentRound = 1;
    setWordProgress(currentWord.id, progress);
    updateUserVocabForRound(currentWord.id, 0);
    setPostJudgmentKnow(false);
    handleNextWord();
  };

  const updateUserVocabForRound = (wordId, quality) => {
    updateUserVocab(wordId, quality);
  };

  const handleNextWord = () => {
    if (answerDelayRef.current) clearTimeout(answerDelayRef.current);
    if (!currentWord) return;

    const progress = getWordProgress(currentWord.id) || { currentRound: 1, consecutiveCorrect: 0 };
    const isRoundOne = waitingForNext;

    if (isRoundOne) {
      if (progress.consecutiveCorrect >= 1) {
        progress.currentRound = 2;
      }
      setWordProgress(currentWord.id, progress);
    }

    let newQueue;
    let newIndex = currentIndex;
    const isMastered = progress.consecutiveCorrect >= 3 && progress.currentRound >= 4;

    if (isMastered) {
      newQueue = learnQueue.filter((_, idx) => idx !== currentIndex);
      setCompletedCount(prev => prev + 1);
      newIndex = Math.min(currentIndex, newQueue.length - 1);
    } else {
      newQueue = [
        ...learnQueue.slice(0, currentIndex),
        ...learnQueue.slice(currentIndex + 1),
        learnQueue[currentIndex],
      ];
    }

    setShowAnswer(false);
    setWaitingForNext(false);
    setShowMeaningCard(false);
    setOptionsDisabled(false);
    setSelectedOption(null);
    setIsCorrect(null);

    if (newQueue.length === 0) {
      finishSession();
      navigation.replace('Result', {
        total: initialCount,
        completed: completedCount + (isMastered ? 1 : 0),
        words: initialWords,
      });
    } else {
      setLearnQueue(newQueue);
      setCurrentIndex(newIndex);
    }
  };

  const handleClose = () => navigation.goBack();
  const handleBookmark = () => {
    const wordToBookmark = isReviewMode || isFinalReview ? reviewCurrentWord : currentWord;
    wordToBookmark && toggleBookmark(wordToBookmark.id);
  };
  const handlePronounce = () => currentWord && speakJapanese(currentWord.word);
  const handleExamplePronounce = () => currentWord?.example && speakJapanese(currentWord.example);

  // 复习模式处理函数
  const handleFirstReviewJudgment = (result) => {
    if (!reviewCurrentWord || reviewJudged) return;
    setReviewJudged(true);

    if (result === 'forget') {
      updateUserReviewVocab(reviewCurrentWord.id, 'forget');
      setWordProgress(reviewCurrentWord.id, { currentRound: 1, consecutiveCorrect: 0 });
      moveToNewLearningQueue(reviewCurrentWord.id);
      const newQueue = reviewQueue.filter((_, idx) => idx !== 0);
      setReviewQueue(newQueue);
      setReviewShowMeaning(false);
      setReviewJudged(false);
      if (newQueue.length === 0) {
        transitionToFinalReview();
      }
    } else {
      setReviewShowMeaning(true);
      setPendingFinalReview(prev => [...prev, reviewCurrentWord]);
    }
  };

  const handleReviewNextWord = () => {
    if (!reviewCurrentWord) return;
    const newQueue = reviewQueue.filter((_, idx) => idx !== 0);
    setReviewQueue(newQueue);
    setReviewShowMeaning(false);
    setReviewJudged(false);
    if (newQueue.length === 0) {
      transitionToFinalReview();
    }
  };

  const transitionToFinalReview = () => {
    const finalWords = pendingFinalReview;
    if (finalWords.length === 0) {
      finishSession();
      navigation.replace('Result', { total: initialCount, know: 0, fuzzy: 0, dontKnow: initialCount, words: initialWords });
      return;
    }
    setFinalReviewQueue(finalWords);
    setIsFinalReview(true);
    setReviewQueue([]);
    setPendingFinalReview([]);
    setReviewShowMeaning(false);
    setReviewJudged(false);
  };

  const handleFinalReviewJudgment = (isKnow) => {
    if (!reviewCurrentWord) return;
    if (isKnow) {
      updateUserReviewVocab(reviewCurrentWord.id, 'know');
    } else {
      updateUserReviewVocab(reviewCurrentWord.id, 'forget');
    }
    const newQueue = finalReviewQueue.filter((_, idx) => idx !== 0);
    setFinalReviewQueue(newQueue);
    if (newQueue.length === 0) {
      finishSession();
      navigation.replace('Result', { total: initialCount, know: initialCount, fuzzy: 0, dontKnow: 0, words: initialWords });
    }
  };

  const getReviewCurrentWord = () => {
    if (isFinalReview) return finalReviewQueue[0];
    return reviewQueue[0];
  };

  const reviewCurrentWord = getReviewCurrentWord();

  const startSpellingTest = () => {
    setSpellingWords([...learnQueue]);
    setSpellingIndex(0);
    setSpellingCorrect(0);
    setSpellingInput('');
    setSpellingResult(null);
    setShowSpelling(true);
  };

  const handleSpellingSubmit = () => {
    if (!spellingWords[spellingIndex]) return;
    const correct = spellingInput.trim().toLowerCase().replace(/\s+/g, '') ===
      spellingWords[spellingIndex].word.toLowerCase().replace(/\s+/g, '');
    setSpellingResult(correct);
    if (correct) setSpellingCorrect(prev => prev + 1);

    spellingTimeoutRef.current = setTimeout(() => {
      if (spellingIndex < spellingWords.length - 1) {
        setSpellingIndex(prev => prev + 1);
        setSpellingInput('');
        setSpellingResult(null);
      } else {
        setShowSpelling(false);
        navigation.replace('Result', {
          total: initialCount,
          completed: initialCount,
          spellingCorrect: spellingCorrect + (correct ? 1 : 0),
          spellingTotal: spellingWords.length,
          words: initialWords,
        });
      }
    }, 1500);
  };

  const handleSpellingPronounce = () => {
    if (spellingWords[spellingIndex]) speakJapanese(spellingWords[spellingIndex].word);
  };

  const getOptionStyle = (option) => {
    if (!optionsDisabled) return { backgroundColor: colors.card };
    const isCorrectOption = option === currentWord?.meaning;
    const isSelectedOption = option === selectedOption;
    if (isCorrectOption) return { backgroundColor: '#22c55e', borderWidth: 2, borderColor: '#16a34a' };
    if (isSelectedOption && !isCorrect) return { backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#dc2626' };
    return { backgroundColor: colors.card };
  };

  const getOptionTextStyle = (option) => {
    if (!optionsDisabled) return { color: colors.text };
    const isCorrectOption = option === currentWord?.meaning;
    if (isCorrectOption) return { color: '#ffffff' };
    if (option === selectedOption && !isCorrect) return { color: '#ffffff' };
    return { color: colors.text };
  };

  const progress = initialCount > 0 ? (completedCount / initialCount) * 100 : 0;
  const currentRound = currentWord ? (getWordProgress(currentWord.id)?.currentRound || 1) : 1;

  const renderMeaningCard = () => (
    <ScrollView style={styles.meaningSection}>
      <View style={[styles.meaningCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.typeTag, { color: colors.primary, backgroundColor: colors.primaryLight }]}>
          {currentWord?.type}
        </Text>
        <Text style={[styles.meaningText, { color: colors.text }]}>{currentWord?.meaning}</Text>
        {currentWord?.meaning2 && (
          <Text style={[styles.meaning2Text, { color: colors.textSecondary }]}>{currentWord.meaning2}</Text>
        )}
        {currentWord?.example && (
          <View style={styles.exampleSection}>
            <Text style={[styles.exampleJp, { color: colors.text }]}>{currentWord.example}</Text>
            {currentWord?.exampleZh && (
              <Text style={[styles.exampleZh, { color: colors.textSecondary }]}>{currentWord.exampleZh}</Text>
            )}
            <TouchableOpacity style={styles.exampleSpeaker} onPress={handleExamplePronounce}>
              <Ionicons name="volume-high" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );

  // 学习完成界面
  if (!currentWord && learnQueue.length === 0 && !showSpelling) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.completeText, { color: colors.text }]}>学习完成！</Text>
          <TouchableOpacity
            style={[styles.spellingButton, { backgroundColor: colors.primary }]}
            onPress={startSpellingTest}
          >
            <Text style={styles.spellingButtonText}>开始拼写测试</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 拼写测试界面
  if (showSpelling && spellingWords.length > 0) {
    const spellingWord = spellingWords[spellingIndex];
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.spellingContainer}
        >
          <View style={styles.spellingHeader}>
            <TouchableOpacity onPress={() => setShowSpelling(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.spellingProgress, { color: colors.textSecondary }]}>
              {spellingIndex + 1} / {spellingWords.length}
            </Text>
          </View>

          <View style={styles.spellingContent}>
            <Text style={[styles.spellingMeaning, { color: colors.text }]}>
              {spellingWord?.meaning}
            </Text>
            <TouchableOpacity style={styles.spellingSpeaker} onPress={handleSpellingPronounce}>
              <Ionicons name="volume-high" size={32} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.spellingInputContainer}>
            <TextInput
              style={[styles.spellingInput, {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: spellingResult === true ? '#22c55e' :
                  spellingResult === false ? '#ef4444' : colors.border
              }]}
              value={spellingInput}
              onChangeText={setSpellingInput}
              placeholder="输入日语单词"
              placeholderTextColor={colors.textTertiary}
              autoFocus
              onSubmitEditing={handleSpellingSubmit}
            />
            {spellingResult !== null && (
              <View style={[
                styles.spellingFeedback,
                { backgroundColor: spellingResult ? '#22c55e' : '#ef4444' }
              ]}>
                <Text style={styles.spellingFeedbackText}>
                  {spellingResult ? '✓ 正确' : `✗ 正确答案是: ${spellingWord?.word}`}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.spellingSubmitButton, { backgroundColor: colors.primary }]}
            onPress={handleSpellingSubmit}
            disabled={spellingResult !== null}
          >
            <Text style={styles.spellingSubmitText}>确认</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // 主学习界面
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryLight }]}>
      <View style={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          {!isFinalReview && !isReviewMode && (
            <>
              <View style={styles.roundIndicator}>
                {[1, 2, 3].map(round => (
                  <View key={round} style={[styles.roundDot, { backgroundColor: currentRound >= round ? colors.primary : colors.textTertiary }]} />
                ))}
              </View>
              <Text style={[styles.countText, { color: colors.textSecondary }]}>{completedCount}/{initialCount}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
              </View>
            </>
          )}
          {(isReviewMode || isFinalReview) && (
            <>
              <Text style={[styles.countText, { color: colors.textSecondary }]}>
                {isFinalReview ? '最终复习' : '第一轮复习'}
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, {
                  width: isFinalReview
                    ? `${finalReviewQueue.length > 0 ? ((initialCount - finalReviewQueue.length) / initialCount) * 100 : 100}%`
                    : `${reviewQueue.length > 0 ? ((initialCount - reviewQueue.length) / initialCount) * 100 : 100}%`,
                  backgroundColor: colors.primary
                }]} />
              </View>
              <Text style={[styles.countText, { color: colors.textSecondary }]}>
                {isFinalReview
                  ? `${finalReviewQueue.length}/${initialCount}`
                  : `${reviewQueue.length}/${initialCount}`}
              </Text>
            </>
          )}
          <TouchableOpacity onPress={handleBookmark} style={styles.headerButton}>
            <Ionicons name={bookmarkedWords.includes((isReviewMode || isFinalReview ? reviewCurrentWord?.id : currentWord?.id)) ? 'star' : 'star-outline'} size={22} color={bookmarkedWords.includes((isReviewMode || isFinalReview ? reviewCurrentWord?.id : currentWord?.id)) ? '#fbbf24' : colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 复习模式 UI */}
        {(isReviewMode || isFinalReview) && reviewCurrentWord ? (
          <>
            {!isFinalReview ? (
              <>
                {/* 第一轮复习：显示单词 + 例句 + 三按钮 */}
                <View style={styles.wordSection}>
                  <Text style={[styles.wordText, { color: colors.text }]}>{reviewCurrentWord.word}</Text>
                  <View style={styles.wordMeta}>
                    <Text style={[styles.kanaText, { color: colors.textSecondary }]}>{reviewCurrentWord.kana}</Text>
                    <Text style={[styles.pitchText, { color: colors.primary }]}>{reviewCurrentWord.pitch}</Text>
                  </View>
                  <TouchableOpacity style={styles.speakerButton} onPress={() => speakJapanese(reviewCurrentWord.word)}>
                    <Ionicons name="volume-high" size={28} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                {reviewCurrentWord.example && (
                  <View style={[styles.round2Card, { backgroundColor: colors.card, marginHorizontal: 16 }]}>
                    <Text style={[styles.exampleLabel, { color: colors.textSecondary }]}>例句：</Text>
                    <Text style={[styles.round2ExampleJp, { color: colors.text }]}>{reviewCurrentWord.example}</Text>
                    <View style={styles.round2SpeakerContainer}>
                      <TouchableOpacity onPress={() => speakJapanese(reviewCurrentWord.example)}>
                        <Ionicons name="volume-high" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {reviewShowMeaning && (
                  <ScrollView style={styles.meaningSection}>
                    <View style={[styles.meaningCard, { backgroundColor: colors.card }]}>
                      <Text style={[styles.typeTag, { color: colors.primary, backgroundColor: colors.primaryLight }]}>
                        {reviewCurrentWord.type}
                      </Text>
                      <Text style={[styles.meaningText, { color: colors.text }]}>{reviewCurrentWord.meaning}</Text>
                      {reviewCurrentWord.meaning2 && (
                        <Text style={[styles.meaning2Text, { color: colors.textSecondary }]}>{reviewCurrentWord.meaning2}</Text>
                      )}
                      <TouchableOpacity style={styles.exampleSpeaker} onPress={() => speakJapanese(reviewCurrentWord.example)}>
                        <Ionicons name="volume-high" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                )}

                {!reviewShowMeaning && !reviewJudged && (
                  <View style={styles.judgmentSection}>
                    <View style={styles.judgmentButtons}>
                      <TouchableOpacity style={[styles.knowButton, { backgroundColor: colors.success }]} onPress={() => handleFirstReviewJudgment('know')}>
                        <Text style={styles.judgmentText}>认识</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.fuzzyButton, { backgroundColor: '#f59e0b' }]} onPress={() => handleFirstReviewJudgment('fuzzy')}>
                        <Text style={styles.judgmentText}>模糊</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.dontKnowButton, { backgroundColor: colors.danger }]} onPress={() => handleFirstReviewJudgment('forget')}>
                        <Text style={styles.judgmentText}>忘记</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {reviewShowMeaning && (
                  <View style={styles.nextButtonSection}>
                    <TouchableOpacity style={[styles.nextButton, { backgroundColor: colors.primary }]} onPress={handleReviewNextWord}>
                      <Text style={styles.nextButtonText}>下一词</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <>
                {/* 最终复习：显示释义 + 蒙版覆盖 + 两按钮 */}
                <View style={styles.wordSection}>
                  <View style={styles.coverContainer}>
                    <View style={styles.coverOverlay} />
                    <Text style={[styles.wordText, { color: colors.text }]}>{reviewCurrentWord.word}</Text>
                    <View style={styles.wordMeta}>
                      <Text style={[styles.kanaText, { color: colors.textSecondary }]}>{reviewCurrentWord.kana}</Text>
                      <Text style={[styles.pitchText, { color: colors.primary }]}>{reviewCurrentWord.pitch}</Text>
                    </View>
                    {reviewCurrentWord.example && (
                      <View style={[styles.round2Card, { backgroundColor: colors.card, marginTop: 12, alignSelf: 'stretch', marginHorizontal: 16 }]}>
                        <Text style={[styles.exampleLabel, { color: colors.textSecondary }]}>例句：</Text>
                        <Text style={[styles.round2ExampleJp, { color: colors.text }]}>{reviewCurrentWord.example}</Text>
                        <View style={styles.round2SpeakerContainer}>
                          <TouchableOpacity onPress={() => speakJapanese(reviewCurrentWord.example)}>
                            <Ionicons name="volume-high" size={24} color={colors.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                <ScrollView style={styles.meaningSection}>
                  <View style={[styles.meaningCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.typeTag, { color: colors.primary, backgroundColor: colors.primaryLight }]}>
                      {reviewCurrentWord.type}
                    </Text>
                    <Text style={[styles.meaningText, { color: colors.text }]}>{reviewCurrentWord.meaning}</Text>
                    {reviewCurrentWord.meaning2 && (
                      <Text style={[styles.meaning2Text, { color: colors.textSecondary }]}>{reviewCurrentWord.meaning2}</Text>
                    )}
                  </View>
                </ScrollView>

                <View style={styles.judgmentSection}>
                  <View style={styles.judgmentButtons}>
                    <TouchableOpacity style={[styles.knowButton, { backgroundColor: colors.success }]} onPress={() => handleFinalReviewJudgment(true)}>
                      <Text style={styles.judgmentText}>认识</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.dontKnowButton, { backgroundColor: colors.danger }]} onPress={() => handleFinalReviewJudgment(false)}>
                      <Text style={styles.judgmentText}>忘记</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </>
        ) : isFinalReview && !reviewCurrentWord ? (
          <View style={styles.centered}>
            <Text style={[styles.completeText, { color: colors.text }]}>复习完成！</Text>
          </View>
        ) : (
          <>
        {/* 单词展示区 */}
        <View style={styles.wordSection}>
          <Text style={[styles.wordText, { color: colors.text }]}>{currentWord?.word}</Text>
          <View style={styles.wordMeta}>
            <Text style={[styles.kanaText, { color: colors.textSecondary }]}>{currentWord?.kana}</Text>
            <Text style={[styles.pitchText, { color: colors.primary }]}>{currentWord?.pitch}</Text>
          </View>
          <TouchableOpacity style={styles.speakerButton} onPress={handlePronounce}>
            <Ionicons name="volume-high" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.typeSection}>
          <Text style={[styles.typeTag, { color: colors.primary, backgroundColor: colors.primaryLight }]}>{currentWord?.type}</Text>
        </View>

        {/* 第1轮：未看答案时显示选项 + 看答案按钮 */}
        {currentRound === 1 && !waitingForNext && !showMeaningCard && (
          <>
            <View style={styles.optionsSection}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.optionButton, getOptionStyle(option)]}
                  onPress={() => handleSelectOption(option)}
                  disabled={optionsDisabled}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionLetter, { color: optionsDisabled && option === currentWord?.meaning ? '#ffffff' : colors.primary }]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                  <Text style={getOptionTextStyle(option)}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {showContinueButton ? (
              <View style={styles.showAnswerSection}>
                <TouchableOpacity style={[styles.continueButton, { backgroundColor: colors.primary }]} onPress={handleContinue}>
                  <Text style={styles.continueButtonText}>继续</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.showAnswerSection}>
                <TouchableOpacity style={[styles.showAnswerButton, { backgroundColor: colors.primary }]} onPress={handleShowAnswer}>
                  <Text style={styles.showAnswerText}>看答案</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* 第2、3轮：未不认识时显示判断区域 */}
        {currentRound >= 2 && currentRound <= 3 && !waitingForNext && !showMeaningCard && (
          <View style={styles.judgmentSection}>
            <Text style={[styles.roundLabel, { color: colors.textTertiary }]}>第{currentRound}轮</Text>
            {currentRound === 2 && currentWord?.example && (
              <View style={[styles.round2Card, { backgroundColor: colors.card }]}>
                <Text style={[styles.exampleLabel, { color: colors.textSecondary }]}>例句：</Text>
                <Text style={[styles.round2ExampleJp, { color: colors.text }]}>{currentWord.example}</Text>
                <View style={styles.round2SpeakerContainer}>
                  <TouchableOpacity onPress={handleExamplePronounce}>
                    <Ionicons name="volume-high" size={24} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                {showHint && currentWord?.exampleZh && (
                  <Text style={[styles.round2ExampleZh, { color: colors.textSecondary }]}>{currentWord.exampleZh}</Text>
                )}
              </View>
            )}
            {currentRound === 2 && !showHint && (
              <TouchableOpacity style={styles.hintButton} onPress={() => setShowHint(true)}>
                <Ionicons name="bulb-outline" size={24} color={colors.warning} />
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>提示一下</Text>
              </TouchableOpacity>
            )}
            <View style={styles.judgmentButtons}>
              <TouchableOpacity style={[styles.knowButton, { backgroundColor: colors.success }]} onPress={() => handleJudgment(true)}>
                <Text style={styles.judgmentText}>认识</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.dontKnowButton, { backgroundColor: colors.danger }]} onPress={() => handleJudgment(false)}>
                <Text style={styles.judgmentText}>不认识</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 答案卡片 */}
        {(waitingForNext || showMeaningCard) && renderMeaningCard()}

        {/* 下一词按钮（第1轮） */}
        {waitingForNext && !showMeaningCard && (
          <View style={styles.nextButtonSection}>
            <TouchableOpacity style={[styles.nextButton, { backgroundColor: colors.primary }]} onPress={handleNextWord}>
              <Text style={styles.nextButtonText}>下一词</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 下一词/记错了按钮（第2/3轮判断后） */}
        {showMeaningCard && !waitingForNext && postJudgmentKnow && (
          <View style={styles.postJudgmentButtons}>
            <TouchableOpacity style={[styles.nextButton, { backgroundColor: colors.primary, flex: 1 }]} onPress={handleNextWord}>
              <Text style={styles.nextButtonText}>下一词</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.mistakeButton, { flex: 1 }]} onPress={handleMistake}>
              <Text style={styles.mistakeButtonText}>记错了</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 下一词按钮（第2/3轮不认识后） */}
        {showMeaningCard && !waitingForNext && !postJudgmentKnow && (
          <View style={styles.nextButtonSection}>
            <TouchableOpacity style={[styles.nextButton, { backgroundColor: colors.primary }]} onPress={handleNextWord}>
              <Text style={styles.nextButtonText}>下一词</Text>
            </TouchableOpacity>
          </View>
        )}
        </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  completeText: { fontSize: 24, fontWeight: 'bold' },
  spellingButton: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  spellingButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  spellingContainer: { flex: 1, padding: 20 },
  spellingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  spellingProgress: { fontSize: 16 },
  spellingContent: { alignItems: 'center', marginBottom: 40 },
  spellingMeaning: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  spellingSpeaker: { padding: 16, backgroundColor: '#eff6ff', borderRadius: 30 },
  spellingInputContainer: { marginBottom: 20 },
  spellingInput: { borderWidth: 2, borderRadius: 12, padding: 16, fontSize: 18, textAlign: 'center' },
  spellingFeedback: { marginTop: 12, padding: 12, borderRadius: 8, alignItems: 'center' },
  spellingFeedbackText: { color: '#fff', fontSize: 14 },
  spellingSubmitButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  spellingSubmitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  closeButton: { padding: 8 },
  roundIndicator: { flexDirection: 'row', gap: 4, marginHorizontal: 8 },
  roundDot: { width: 8, height: 8, borderRadius: 4 },
  countText: { fontSize: 12, marginHorizontal: 8 },
  progressBar: { flex: 1, height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  headerButton: { padding: 8 },
  wordSection: { alignItems: 'center', paddingVertical: 24 },
  wordText: { fontSize: 36, fontWeight: 'bold', marginBottom: 8 },
  wordMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kanaText: { fontSize: 16 },
  pitchText: { fontSize: 14, backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  speakerButton: { marginTop: 16, padding: 12, backgroundColor: '#eff6ff', borderRadius: 25 },
  typeSection: { alignItems: 'center', paddingBottom: 16 },
  typeTag: { fontSize: 12, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  optionsSection: { paddingHorizontal: 16, paddingBottom: 16 },
  optionButton: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 8 },
  optionLetter: { fontSize: 16, fontWeight: 'bold', marginRight: 12 },
  showAnswerSection: { paddingHorizontal: 16 },
  showAnswerButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  showAnswerText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  continueButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  continueButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  meaningSection: { flex: 1, paddingHorizontal: 16 },
  meaningCard: { padding: 20, borderRadius: 16, alignItems: 'center' },
  meaningText: { fontSize: 20, marginVertical: 12 },
  meaning2Text: { fontSize: 14, color: '#9ca3af' },
  exampleSection: { marginTop: 16, width: '100%', alignItems: 'center' },
  exampleJp: { fontSize: 16, marginBottom: 4, textAlign: 'center' },
  exampleZh: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 8 },
  exampleSpeaker: { marginTop: 8, alignSelf: 'center', padding: 8 },
  judgmentSection: { paddingHorizontal: 16 },
  roundLabel: { textAlign: 'center', fontSize: 12, marginBottom: 12 },
  round2Card: { padding: 16, borderRadius: 16, marginBottom: 12 },
  exampleLabel: { fontSize: 12, marginBottom: 8 },
  round2ExampleJp: { fontSize: 16, marginBottom: 4 },
  round2SpeakerContainer: { alignItems: 'flex-end', marginTop: 12 },
  round2ExampleZh: { fontSize: 14, marginTop: 8, color: '#6b7280' },
  hintButton: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginBottom: 8 },
  hintText: { fontSize: 11, marginTop: 4 },
  judgmentButtons: { flexDirection: 'row', gap: 12 },
  knowButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  dontKnowButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  judgmentText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  nextButtonSection: { paddingHorizontal: 16, marginTop: 16, marginBottom: 16 },
  nextButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  postJudgmentButtons: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 16, marginBottom: 16 },
  mistakeButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#fee2e2' },
  mistakeButtonText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
  coverContainer: { position: 'relative', alignItems: 'center', paddingVertical: 24 },
  coverOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10, borderRadius: 16 },
  fuzzyButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
});