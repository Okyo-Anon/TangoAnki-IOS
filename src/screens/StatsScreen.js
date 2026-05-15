import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getColors } from '../utils/colors';

const { width } = Dimensions.get('window');

export default function StatsScreen({ navigation }) {
  const {
    streak,
    masteredWordIds,
    dailyStudyCount,
    totalStudyMinutes,
    userVocab,
    allWords,
    settings,
  } = useApp();

  const isDark = settings.theme === 'dark';
  const colors = getColors(isDark);

  const todayReviewWords = allWords.filter(w => {
    const vocab = userVocab[w.id];
    const today = new Date().toISOString().split('T')[0];
    return vocab && vocab.nextReviewDate && vocab.nextReviewDate <= today && !vocab.isMastered;
  });

  const newWordsRemaining = allWords.filter(w => !userVocab[w.id]).length;
  const totalDays = Object.keys(dailyStudyCount).length;
  const totalWords = Object.keys(userVocab).length;

  const getWeeklyData = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const weekData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      weekData.push(dailyStudyCount[dateStr] || 0);
    }
    return weekData;
  };

  const weekData = getWeeklyData();
  const maxCount = Math.max(...weekData, 1);

  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>学习统计</Text>

        {/* Main Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.mainStatCard, { backgroundColor: colors.orangeLight }]}>
            <Ionicons name="flame" size={28} color={colors.orange} style={styles.statIcon} />
            <Text style={[styles.mainStatNumber, { color: colors.orange }]}>{streak}</Text>
            <Text style={[styles.mainStatLabel, { color: colors.textSecondary }]}>连续打卡</Text>
          </View>
          <View style={[styles.mainStatCard, { backgroundColor: colors.successLight }]}>
            <Ionicons name="book" size={28} color={colors.success} style={styles.statIcon} />
            <Text style={[styles.mainStatNumber, { color: colors.success }]}>
              {masteredWordIds.length}
            </Text>
            <Text style={[styles.mainStatLabel, { color: colors.textSecondary }]}>累计掌握</Text>
          </View>
          <View style={[styles.mainStatCard, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="document-text" size={28} color={colors.primary} style={styles.statIcon} />
            <Text style={[styles.mainStatNumber, { color: colors.primary }]}>
              {todayReviewWords.length}
            </Text>
            <Text style={[styles.mainStatLabel, { color: colors.textSecondary }]}>今日待复习</Text>
          </View>
          <View style={[styles.mainStatCard, { backgroundColor: colors.purpleLight }]}>
            <Ionicons name="sparkles" size={28} color={colors.purple} style={styles.statIcon} />
            <Text style={[styles.mainStatNumber, { color: colors.purple }]}>
              {newWordsRemaining}
            </Text>
            <Text style={[styles.mainStatLabel, { color: colors.textSecondary }]}>今日新词</Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>本周学习趋势</Text>
          <View style={styles.chartArea}>
            {weekData.map((count, index) => (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (count / maxCount) * 100,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
                <Text style={[styles.dayLabel, { color: colors.textTertiary }]}>
                  {dayNames[index]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Total Stats */}
        <View style={[styles.totalCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>累计学习数据</Text>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>累计学习天数</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>{totalDays} 天</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>累计学习单词</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>{totalWords} 词</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>累计学习时长</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>{totalStudyMinutes} 分钟</Text>
          </View>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mainStatCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  statIcon: {
    marginBottom: 8,
  },
  mainStatNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  mainStatLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  chartCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 10,
    marginTop: 8,
  },
  totalCard: {
    padding: 16,
    borderRadius: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
  },
});
