import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getColors } from '../utils/colors';
import { speakJapanese, normalizeKana } from '../utils/helpers';

export default function SpellingScreen({ route, navigation }) {
  const { words = [], title = '拼写测试' } = route.params;
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';
  const colors = getColors(isDark);

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [inputError, setInputError] = useState(false);

  const currentWord = words[index];
  const total = words.length;
  const progress = total > 0 ? ((index) / total) * 100 : 0;

  const handleSubmit = () => {
    if (!currentWord) return;
    if (!input.trim()) return;

    const userInput = normalizeKana(input);
    const correctKana = normalizeKana(currentWord.kana);

    if (userInput === correctKana) {
      const newCorrect = correctCount + 1;
      if (index + 1 < total) {
        setIndex(index + 1);
        setInput('');
        setError('');
        setSubmitted(false);
        setInputError(false);
        setCorrectCount(newCorrect);
      } else {
        setCorrectCount(newCorrect);
        setSubmitted(true);
      }
    } else {
      setError(`正确答案是：${currentWord.kana}`);
      setInputError(true);
    }
  };

  const handleInputChange = (text) => {
    setInput(text);
    if (inputError) {
      setInputError(false);
      setError('');
    }
  };

  const handleFinish = () => {
    navigation.replace('Result', {
      total,
      know: correctCount,
      fuzzy: 0,
      dontKnow: total - correctCount,
    });
  };

  const handleSpeak = () => {
    if (currentWord) {
      speakJapanese(currentWord.word);
    }
  };

  if (!currentWord && total === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: colors.text }]}>没有单词可测试</Text>
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary, marginTop: 24 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.submitText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (submitted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <View style={[styles.resultIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          </View>
          <Text style={[styles.completeText, { color: colors.text }]}>测试完成</Text>
          <View style={[styles.scoreCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.scoreNumber, { color: colors.primary }]}>{correctCount}</Text>
            <Text style={[styles.scoreDivider, { color: colors.textSecondary }]}>/</Text>
            <Text style={[styles.scoreNumber, { color: colors.textSecondary }]}>{total}</Text>
          </View>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>正确率</Text>
          <Text style={[styles.percentText, { color: colors.text }]}>
            {total > 0 ? Math.round((correctCount / total) * 100) : 0}%
          </Text>
          <TouchableOpacity
            style={[styles.finishButton, { backgroundColor: colors.primary }]}
            onPress={handleFinish}
          >
            <Text style={styles.finishButtonText}>返回首页</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>拼写测试</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress}%` }]} />
      </View>

      {/* Progress Text */}
      <Text style={[styles.progressText, { color: colors.textSecondary }]}>
        第 {index + 1} / {total} 个
      </Text>

      {/* Content */}
      <View style={styles.content}>
        {/* Meaning Display */}
        <View style={[styles.meaningCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.meaningLabel, { color: colors.textSecondary }]}>中文释义</Text>
          <Text style={[styles.meaningText, { color: colors.text }]}>{currentWord?.meaning}</Text>
          {currentWord?.meaning2 ? (
            <Text style={[styles.meaning2Text, { color: colors.textSecondary }]}>
              {currentWord.meaning2}
            </Text>
          ) : null}
        </View>

        {/* Input Area */}
        <View style={styles.inputArea}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: inputError ? colors.danger : colors.border,
              },
            ]}
            value={input}
            onChangeText={handleInputChange}
            placeholder="输入假名"
            placeholderTextColor={colors.textTertiary || '#9ca3af'}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
          {error ? (
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          ) : null}
        </View>

        {/* Speak Button */}
        <TouchableOpacity style={styles.speakButton} onPress={handleSpeak}>
          <Ionicons name="volume-high-outline" size={20} color={colors.primary} />
          <Text style={[styles.speakText, { color: colors.primary }]}>发音提示</Text>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: input.trim() ? colors.primary : colors.border },
          ]}
          onPress={handleSubmit}
          disabled={!input.trim()}
        >
          <Text style={[styles.submitText, { color: input.trim() ? '#fff' : colors.textTertiary }]}>
            确认
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  meaningCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  meaningLabel: {
    fontSize: 12,
    marginBottom: 12,
  },
  meaningText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  meaning2Text: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  inputArea: {
    marginBottom: 16,
  },
  input: {
    height: 52,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  speakText: {
    fontSize: 14,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  finishButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  completeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    padding: 20,
    borderRadius: 16,
    gap: 4,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreDivider: {
    fontSize: 32,
    marginHorizontal: 4,
  },
  scoreLabel: {
    fontSize: 14,
    marginTop: 12,
  },
  percentText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
  },
});