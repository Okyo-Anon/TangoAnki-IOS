import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getColors } from '../utils/colors';

export default function ContentScreen({ navigation }) {
  const { wordResults, bookmarkedWords, allWords, userVocab, settings } = useApp();

  const isDark = settings.theme === 'dark';
  const colors = getColors(isDark);

  const getWordStatus = (wordId) => {
    const result = wordResults[wordId];
    if (result === 'know') return 'mastered';
    if (result === 'fuzzy') return 'reviewing';
    if (result === 'dontKnow') return 'completed';
    return 'notStarted';
  };

  const learningWords = allWords.filter(w => userVocab[w.id]);
  const bookmarkedWordList = allWords.filter(w => bookmarkedWords.includes(w.id));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>学习内容</Text>

        {/* Learning Progress */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              // Navigate to learning words
            }}
          >
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>📖</Text>
              <Text style={[styles.menuLabel, { color: colors.text }]}>
                正在学习的单词
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>🕒</Text>
              <Text style={[styles.menuLabel, { color: colors.text }]}>最近学习</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>📚</Text>
              <Text style={[styles.menuLabel, { color: colors.text }]}>
                全部学习 ({learningWords.length})
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Collection */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              // Navigate to wordbook
            }}
          >
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>📒</Text>
              <Text style={[styles.menuLabel, { color: colors.text }]}>
                单词本 ({bookmarkedWordList.length})
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>📝</Text>
              <Text style={[styles.menuLabel, { color: colors.text }]}>例句库</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>✏️</Text>
              <Text style={[styles.menuLabel, { color: colors.text }]}>笔记</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginLeft: 48,
  },
});
