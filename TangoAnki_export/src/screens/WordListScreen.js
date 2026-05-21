import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getColors } from '../utils/colors';

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'notStarted', label: '未学习' },
  { key: 'reviewing', label: '复习中' },
  { key: 'completed', label: '复习完成' },
  { key: 'mastered', label: '已标熟' },
];

export default function WordListScreen({ navigation }) {
  const { allWords, userVocab, wordResults, bookmarkedWords, settings } = useApp();
  const isDark = settings.theme === 'dark';
  const colors = getColors(isDark);

  const [activeFilter, setActiveFilter] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);

  const getWordStatus = (wordId) => {
    const result = wordResults[wordId];
    if (result === 'know') return 'mastered';
    if (result === 'fuzzy') return 'reviewing';
    if (result === 'dontKnow') return 'completed';
    return 'notStarted';
  };

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        const query = searchQuery.toLowerCase();
        const results = allWords.filter(
          w =>
            w.word.toLowerCase().includes(query) ||
            w.kana.toLowerCase().includes(query) ||
            w.meaning.toLowerCase().includes(query)
        );
        setSearchResults(results);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, allWords]);

  const filteredWords = activeFilter === 'all'
    ? allWords
    : allWords.filter(w => getWordStatus(w.id) === activeFilter);

  const filteredSearchResults = activeFilter === 'all'
    ? searchResults
    : searchResults.filter(w => getWordStatus(w.id) === activeFilter);

  const displayWords = showSearch && searchQuery.trim() ? filteredSearchResults : filteredWords;

  const renderWordItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.wordItem, { backgroundColor: colors.card }]}
      onPress={() => {
        setSearchQuery('');
        setSearchResults([]);
        navigation.navigate('WordDetail', { word: item });
      }}
      activeOpacity={0.7}
    >
      <Text style={[styles.wordText, { color: colors.text }]}>{item.word}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>正在学习的单词</Text>
        <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.searchButton}>
          <Ionicons name="search" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

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
          <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  isActive ? { backgroundColor: colors.primary } : { backgroundColor: colors.card },
                ]}
                onPress={() => setActiveFilter(filter.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isActive ? '#fff' : colors.text },
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={displayWords}
        renderItem={renderWordItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchButton: {
    padding: 4,
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
  filterBar: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterText: {
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 8,
  },
  wordItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  wordText: {
    fontSize: 16,
  },
});