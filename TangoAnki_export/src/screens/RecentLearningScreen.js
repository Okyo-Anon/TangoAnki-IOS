import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getColors } from '../utils/colors';
import { speakJapanese } from '../utils/helpers';

const DATE_FILTERS = [
  { key: 'today', label: '今天' },
  { key: 'yesterday', label: '昨天' },
  { key: 'beforeYesterday', label: '前天' },
  { key: 'earlier', label: '更早' },
];

const TYPE_FILTERS = [
  { key: 'learn', label: '学习' },
  { key: 'review', label: '复习' },
  { key: 'mastered', label: '已标熟' },
];

export default function RecentLearningScreen({ navigation }) {
  const { allWords, userVocab, settings } = useApp();
  const isDark = settings.theme === 'dark';
  const colors = getColors(isDark);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState('today');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('learn');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);

  const today = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, []);

  const beforeYesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return d.toISOString().split('T')[0];
  }, []);

  const getDateRange = (key) => {
    switch (key) {
      case 'today': return { start: today, end: today };
      case 'yesterday': return { start: yesterday, end: yesterday };
      case 'beforeYesterday': return { start: beforeYesterday, end: beforeYesterday };
      case 'earlier': return { start: '', end: beforeYesterday };
      default: return { start: today, end: today };
    }
  };

  const getDateFilterCount = (key) => {
    const { start, end } = getDateRange(key);
    const words = allWords.filter(w => {
      const vocab = userVocab[w.id];
      if (!vocab) return false;
      if (key === 'earlier') {
        return vocab.lastReviewDate && vocab.lastReviewDate < end;
      }
      return vocab.lastReviewDate && vocab.lastReviewDate >= start && vocab.lastReviewDate <= end;
    });
    return words.length;
  };

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        const q = searchQuery.toLowerCase();
        const results = allWords.filter(w =>
          w.word.toLowerCase().includes(q) ||
          w.kana.toLowerCase().includes(q) ||
          w.meaning.toLowerCase().includes(q)
        );
        setSearchResults(results);
      }, 300);
    } else {
      setSearchResults([]);
    }
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, allWords]);

  const filteredWords = useMemo(() => {
    const { start, end } = getDateRange(selectedDateFilter);

    const dateFiltered = allWords.filter(w => {
      const vocab = userVocab[w.id];
      if (!vocab) return false;
      const reviewDate = vocab.lastReviewDate || '';
      if (selectedDateFilter === 'earlier') {
        return reviewDate > '' && reviewDate < end;
      }
      return reviewDate >= start && reviewDate <= end;
    });

    return dateFiltered;
  }, [selectedDateFilter, allWords, userVocab]);

  const displayedWords = useMemo(() => {
    const { start, end } = getDateRange(selectedDateFilter);

    let baseWords = allWords.filter(w => {
      const vocab = userVocab[w.id];
      if (!vocab) return false;
      if (selectedDateFilter === 'earlier') {
        return vocab.lastReviewDate && vocab.lastReviewDate < end;
      }
      return vocab.lastReviewDate && vocab.lastReviewDate >= start && vocab.lastReviewDate <= end;
    });

    if (selectedTypeFilter === 'learn') {
      baseWords = baseWords.filter(w => {
        const vocab = userVocab[w.id];
        return vocab.learnedDate && (selectedDateFilter === 'earlier'
          ? vocab.learnedDate < end
          : vocab.learnedDate >= start && vocab.learnedDate <= end);
      });
    } else if (selectedTypeFilter === 'review') {
      baseWords = baseWords.filter(w => {
        const vocab = userVocab[w.id];
        const learnedInRange = vocab.learnedDate && (selectedDateFilter === 'earlier'
          ? vocab.learnedDate < end
          : vocab.learnedDate >= start && vocab.learnedDate <= end);
        return !learnedInRange;
      });
    } else if (selectedTypeFilter === 'mastered') {
      baseWords = baseWords.filter(w => {
        const vocab = userVocab[w.id];
        return vocab.isMastered;
      });
    }

    return baseWords;
  }, [selectedDateFilter, selectedTypeFilter, allWords, userVocab]);

  const finalWords = showSearch && searchQuery.trim()
    ? displayedWords.filter(w => {
        const q = searchQuery.toLowerCase();
        return w.word.toLowerCase().includes(q) ||
               w.kana.toLowerCase().includes(q) ||
               w.meaning.toLowerCase().includes(q);
      })
    : displayedWords;

  const renderWordItem = ({ item }) => {
    const vocab = userVocab[item.id] || {};
    const isMastered = vocab.isMastered;
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
            {item.type && (
              <View style={[styles.typeBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.typeText, { color: colors.primary }]}>{item.type}</Text>
              </View>
            )}
            {isMastered && (
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            )}
          </View>
        </View>
        <TouchableOpacity onPress={() => speakJapanese(item.word)} style={styles.speakerBtn}>
          <Ionicons name="volume-high" size={18} color={colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const getDateDropdownLabel = () => {
    const count = getDateFilterCount(selectedDateFilter);
    const label = DATE_FILTERS.find(d => d.key === selectedDateFilter)?.label || '今天';
    return `${label}（${count}词）`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>最近学习</Text>
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
          <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.dateDropdownRow}>
        <TouchableOpacity
          style={[styles.dateDropdown, { backgroundColor: colors.card }]}
          onPress={() => setShowDateDropdown(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dateDropdownText, { color: colors.text }]}>{getDateDropdownLabel()}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDateDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDateDropdown(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDateDropdown(false)}>
          <View style={[styles.dropdownPanel, { backgroundColor: colors.card }]}>
            {DATE_FILTERS.map((filter) => {
              const count = getDateFilterCount(filter.key);
              const isSelected = selectedDateFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[styles.dropdownItem, isSelected && { backgroundColor: colors.primaryLight }]}
                  onPress={() => { setSelectedDateFilter(filter.key); setShowDateDropdown(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownItemText, { color: isSelected ? colors.primary : colors.text }]}>
                    {filter.label}（{count}词）
                  </Text>
                  {isSelected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>

      <View style={[styles.typeFilterBar, { borderBottomColor: colors.border }]}>
        {TYPE_FILTERS.map((filter) => {
          const isActive = selectedTypeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.typeFilterBtn,
                isActive ? { backgroundColor: colors.primary } : { backgroundColor: colors.card },
              ]}
              onPress={() => setSelectedTypeFilter(filter.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.typeFilterText, { color: isActive ? '#fff' : colors.text }]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={finalWords}
        renderItem={renderWordItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>暂无相关学习记录</Text>
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
  dateDropdownRow: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  dateDropdown: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  dateDropdownText: { fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  dropdownPanel: { borderRadius: 16, padding: 8, minWidth: 200 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  dropdownItemText: { fontSize: 15 },
  typeFilterBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  typeFilterBtn: { paddingHorizontal: 20, paddingVertical: 7, borderRadius: 16 },
  typeFilterText: { fontSize: 14 },
  listContent: { padding: 16, paddingBottom: 100, gap: 8 },
  wordItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10 },
  wordItemLeft: { flex: 1 },
  wordText: { fontSize: 16, fontWeight: '500' },
  wordMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  kanaText: { fontSize: 13 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  typeText: { fontSize: 11 },
  speakerBtn: { padding: 4 },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15 },
});