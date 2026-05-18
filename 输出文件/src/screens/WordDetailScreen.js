import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getColors } from '../utils/colors';
import { speakJapanese } from '../utils/helpers';

export default function WordDetailScreen({ route, navigation }) {
  const { word } = route.params;
  const { bookmarkedWords, toggleBookmark, settings } = useApp();

  const isDark = settings.theme === 'dark';
  const colors = getColors(isDark);

  const isBookmarked = bookmarkedWords.includes(word.id);

  const handleBookmark = () => {
    toggleBookmark(word.id);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>单词详情</Text>
          <TouchableOpacity onPress={handleBookmark} style={styles.bookmarkButton}>
            <Ionicons
              name={isBookmarked ? 'star' : 'star-outline'}
              size={24}
              color={isBookmarked ? '#fbbf24' : colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Main Word Card */}
          <View style={[styles.mainCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.wordText, { color: colors.text }]}>{word.word}</Text>
            <View style={styles.metaRow}>
              <Text style={[styles.kanaText, { color: colors.textSecondary }]}>
                {word.kana}
              </Text>
              <Text style={[styles.pitchText, { color: colors.primary, backgroundColor: colors.primaryLight }]}>
                {word.pitch}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.speakerButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => speakJapanese(word.word)}
            >
              <Ionicons name="volume-high" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Meaning Card */}
          <View style={[styles.meaningCard, { backgroundColor: colors.card }]}>
            <View style={styles.typeTag}>
              <Text style={[styles.typeText, { color: colors.primary, backgroundColor: colors.primaryLight }]}>
                {word.type}
              </Text>
            </View>
            <Text style={[styles.meaningText, { color: colors.text }]}>
              {word.meaning}
            </Text>
            {word.meaning2 && (
              <Text style={[styles.meaning2Text, { color: colors.textSecondary }]}>
                {word.meaning2}
              </Text>
            )}
          </View>

          {/* Example Card */}
          {word.example && (
            <View style={[styles.exampleCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                例句
              </Text>
              <View style={styles.exampleContent}>
                <Text style={[styles.exampleJp, { color: colors.text }]}>
                  {word.example}
                </Text>
                {word.exampleZh && (
                  <Text style={[styles.exampleZh, { color: colors.textSecondary }]}>
                    {word.exampleZh}
                  </Text>
                )}
                <TouchableOpacity
                  style={[styles.exampleSpeaker, { backgroundColor: colors.primaryLight }]}
                  onPress={() => speakJapanese(word.example)}
                >
                  <Ionicons name="volume-high" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  bookmarkButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  mainCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  wordText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  kanaText: {
    fontSize: 18,
  },
  pitchText: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  speakerButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
  },
  meaningCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  typeTag: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typeText: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  meaningText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  meaning2Text: {
    fontSize: 14,
  },
  exampleCard: {
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  exampleContent: {
    position: 'relative',
  },
  exampleJp: {
    fontSize: 18,
    marginBottom: 8,
  },
  exampleZh: {
    fontSize: 14,
  },
  exampleSpeaker: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
    borderRadius: 15,
  },
});
