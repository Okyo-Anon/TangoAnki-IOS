import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getColors } from '../utils/colors';
import { speakJapanese, shuffleArray } from '../utils/helpers';

export default function HomeScreen({ navigation }) {
  const {
    allWords,
    currentUser,
    userVocab,
    settings,
    streak,
    masteredWordIds,
    getRemainingNewWordsCount,
    getTodayReviewWords,
    getDueReviewWords,
    generateReviewList,
    todayReviewWords,
  } = useApp();

  const isDark = settings.theme === 'dark';
  const colors = getColors(isDark);

  const [randomWord, setRandomWord] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (allWords.length > 0) {
      const shuffled = shuffleArray(allWords);
      setRandomWord(shuffled[0]);
    }
  }, [allWords]);

  useEffect(() => {
    if (allWords.length > 0 && userVocab) {
      generateReviewList();
    }
  }, [allWords, userVocab]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        const query = searchQuery.toLowerCase();
        const results = allWords.filter(
          w =>
            w.word.toLowerCase().includes(query) ||
            w.kana.toLowerCase().includes(query) ||
            w.meaning.toLowerCase().includes(query)
        );
        setSearchResults(results.slice(0, 20));
        setIsSearching(false);
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, allWords]);

  const handleStartLearn = () => {
    const newWords = allWords.filter(w => !userVocab[w.id] || userVocab[w.id]?.needsRelearning);
    if (newWords.length === 0) {
      alert('所有单词都已学习完毕！');
      return;
    }
    const wordsToLearn = shuffleArray(newWords).slice(0, settings.studyWordsPerSession || 10);
    navigation.navigate('Learn', { words: wordsToLearn, mode: 'learn' });
  };

  const handleStartReview = () => {
    const reviewWords = getDueReviewWords();
    if (reviewWords.length === 0) {
      alert('今日没有需要复习的单词！');
      return;
    }
    const wordsToReview = shuffleArray(reviewWords).slice(0, settings.reviewWordsPerSession || 20);
    navigation.navigate('Learn', { words: wordsToReview, mode: 'first_review' });
  };

  const todayReviewCount = todayReviewWords.length;
  const newWordsRemaining = getRemainingNewWordsCount();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Text style={styles.avatarText}>
              {currentUser ? currentUser.charAt(0).toUpperCase() : 'T'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearch(!showSearch)}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search Area */}
        {showSearch && (
          <View style={[styles.searchArea, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="搜索单词..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {isSearching ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <ScrollView style={styles.searchResults} keyboardShouldPersistTaps="handled">
            {searchResults.map(word => (
              <TouchableOpacity
                key={word.id}
                style={[styles.searchResultItem, { backgroundColor: colors.card }]}
                onPress={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  navigation.navigate('WordDetail', { word });
                }}
                activeOpacity={0.7}
              >
                <View style={styles.searchResultText}>
                  <Text style={[styles.searchResultWord, { color: colors.text }]}>
                    {word.word}
                  </Text>
                  <Text style={[styles.searchResultKana, { color: colors.textSecondary }]}>
                    {word.kana} · {word.meaning}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => speakJapanese(word.word)}
                  style={styles.speakerButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="volume-high" size={20} color={colors.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Main Content */}
        {!showSearch && searchResults.length === 0 && (
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {/* Random Word Preview */}
            {randomWord && (
              <TouchableOpacity
                style={[styles.randomWordCard, { backgroundColor: colors.card }]}
                onPress={() => navigation.navigate('WordDetail', { word: randomWord })}
                activeOpacity={0.7}
              >
                <Text style={[styles.previewLabel, { color: colors.textTertiary }]}>今日单词</Text>
                <Text style={[styles.previewWord, { color: colors.text }]}>{randomWord.word}</Text>
                <View style={styles.previewRow}>
                  <Text style={[styles.previewKana, { color: colors.textSecondary }]}>
                    {randomWord.kana}
                  </Text>
                  <Text style={[styles.previewPitch, { color: colors.primary }]}>
                    {randomWord.pitch}
                  </Text>
                </View>
                <Text style={[styles.previewMeaning, { color: colors.textSecondary }]}>
                  {randomWord.meaning}
                </Text>
                <TouchableOpacity
                  style={styles.previewSpeaker}
                  onPress={() => speakJapanese(randomWord.word)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="volume-high" size={24} color={colors.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}

            {/* Word Library Card */}
            <TouchableOpacity
              style={[styles.libraryCard, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
            >
              <View style={styles.libraryInfo}>
                <Ionicons name="book-outline" size={24} color={colors.primary} />
                <View>
                  <Text style={[styles.libraryName, { color: colors.text }]}>
                    标准日本语·初级上
                  </Text>
                  <Text style={[styles.libraryMeta, { color: colors.textTertiary }]}>
                    N5级别 · {allWords.length}词
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={20} color={colors.textTertiary} />
            </TouchableOpacity>

            {/* Bottom Buttons */}
            <View style={styles.bottomButtons}>
              <TouchableOpacity
                style={[styles.learnButton, { backgroundColor: colors.primary }]}
                onPress={handleStartLearn}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>覚える</Text>
                <Text style={styles.buttonCountInside}>剩余 {newWordsRemaining} 词</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reviewButton, { borderColor: colors.primary }]}
                onPress={handleStartReview}
                activeOpacity={0.8}
              >
                <Text style={[styles.reviewButtonText, { color: colors.primary }]}>復習</Text>
                <Text style={[styles.reviewCountInside, { color: colors.primary }]}>今日 {todayReviewCount} 词</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  searchButton: {
    padding: 8,
  },
  searchArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    fontSize: 16,
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultWord: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchResultKana: {
    fontSize: 12,
    marginTop: 2,
  },
  speakerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 16,
  },
  randomWordCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  previewLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  previewWord: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  previewKana: {
    fontSize: 16,
  },
  previewPitch: {
    fontSize: 14,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  previewMeaning: {
    fontSize: 16,
  },
  previewSpeaker: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  libraryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  libraryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  libraryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  libraryMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 100,
  },
  learnButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    includeFontPadding: false,
  },
  buttonCountInside: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  reviewButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  reviewButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    includeFontPadding: false,
  },
  reviewCountInside: {
    fontSize: 12,
    marginTop: 2,
    includeFontPadding: false,
  },
});
