import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getColors } from '../utils/colors';
import { speakJapanese } from '../utils/helpers';

const STATUS_FILTERS = [
  { key: 'reviewing', label: '复习中' },
  { key: 'completed', label: '复习完成' },
  { key: 'mastered', label: '已标熟' },
];

const STATUS_LABELS = {
  reviewing: '复习中',
  completed: '复习完成',
  mastered: '已标熟',
};

export default function AllLearningScreen({ navigation }) {
  const { allWords, userVocab, settings } = useApp();
  const isDark = settings.theme === 'dark';
  const colors = getColors(isDark);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('reviewing');
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        // search handled in displayedWords
      }, 300);
    }
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery]);

  const learnedWords = useMemo(() => {
    return allWords.filter(w => !!userVocab[w.id]);
  }, [allWords, userVocab]);

  const filteredWords = useMemo(() => {
    return learnedWords.filter(w => {
      const vocab = userVocab[w.id];
      if (!vocab) return false;
      if (selectedFilter === 'reviewing') {
        return vocab.consecutiveCorrect < 3 && vocab.isMastered !== true;
      } else if (selectedFilter === 'completed') {
        return vocab.consecutiveCorrect >= 3 && vocab.isMastered !== true;
      } else if (selectedFilter === 'mastered') {
        return vocab.isMastered === true;
      }
      return false;
    });
  }, [learnedWords, selectedFilter, userVocab]);

  const displayedWords = useMemo(() => {
    if (!searchQuery.trim()) return filteredWords;
    const q = searchQuery.toLowerCase();
    return filteredWords.filter(w =>
      w.word.toLowerCase().includes(q) ||
      w.kana.toLowerCase().includes(q) ||
      w.meaning.toLowerCase().includes(q)
    );
  }, [filteredWords, searchQuery]);

  const getStatusLabel = (vocab) => {
    if (vocab.isMastered) return STATUS_LABELS.mastered;
    if (vocab.consecutiveCorrect >= 3) return STATUS_LABELS.completed;
    return STATUS_LABELS.reviewing;
  };

  const getStatusColor = (vocab) => {
    if (vocab.isMastered) return colors.success;
    if (vocab.consecutiveCorrect >= 3) return colors.warning;
    return colors.primary;
  };

  const renderWordItem = ({ item }) => {
    const vocab = userVocab[item.id] || {};
    const statusLabel = getStatusLabel(vocab);
    const statusColor = getStatusColor(vocab);
    return (
      <TouchableOpacity
        style={[styles.wordItem, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('WordDetail', { word: item })}
        activeOpacity={0.7}
      >
        <View style={styles.wordItemLeft}>
          <Text style={[styles.wordText, { color: colors.text }]}>{item.word}</Text>
          <View style={styles.wordMeta}>
            <Text style={[styles.kanaText, { color: colors.textSecondary }]}>{item.kana}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => speakJapanese(item.word)} style={styles.speakerBtn}>
          <Ionicons name="volume-high" size={18} color={colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>全部学习</Text>
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
          <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); }}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
        {STATUS_FILTERS.map((filter) => {
          const isActive = selectedFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterBtn,
                isActive ? { backgroundColor: colors.primary } : { backgroundColor: colors.card },
              ]}
              onPress={() => setSelectedFilter(filter.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, { color: isActive ? '#fff' : colors.text }]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={displayedWords}
        renderItem={renderWordItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>暂无相关单词</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  searchButton: { padding: 4 },
  searchArea: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  searchInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, fontSize: 16 },
  filterBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  filterBtn: { paddingHorizontal: 20, paddingVertical: 7, borderRadius: 16 },
  filterText: { fontSize: 14 },
  listContent: { padding: 16, paddingBottom: 100, gap: 8 },
  wordItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10 },
  wordItemLeft: { flex: 1 },
  wordText: { fontSize: 16, fontWeight: '500' },
  wordMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  kanaText: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  statusText: { fontSize: 11 },
  speakerBtn: { padding: 4 },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15 },
});