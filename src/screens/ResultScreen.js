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

export default function ResultScreen({ route, navigation }) {
  const { total, know = 0, fuzzy = 0, dontKnow = 0, words = [] } = route.params || {};
  const { streak, settings } = useApp();

  const isDark = settings.theme === 'dark';
  const colors = getColors(isDark);

  const expGained = know * 3;
  const goldGained = know * 2;

  const handleSpellingTest = () => {
    if (words && words.length > 0) {
      navigation.navigate('Spelling', { words });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryLight }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Celebration */}
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={[styles.congratsText, { color: colors.text }]}>
            学习完成！
          </Text>

          {/* Stats Cards */}
          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <View style={styles.mainStatRow}>
              <View style={styles.mainStat}>
                <Text style={[styles.mainStatNumber, { color: colors.primary }]}>
                  {total}
                </Text>
                <Text style={[styles.mainStatLabel, { color: colors.textSecondary }]}>
                  总计
                </Text>
              </View>
              <View style={styles.mainStat}>
                <Text style={[styles.mainStatNumber, { color: colors.success }]}>
                  {know}
                </Text>
                <Text style={[styles.mainStatLabel, { color: colors.textSecondary }]}>
                  认识
                </Text>
              </View>
              <View style={styles.mainStat}>
                <Text style={[styles.mainStatNumber, { color: colors.warning }]}>
                  {fuzzy}
                </Text>
                <Text style={[styles.mainStatLabel, { color: colors.textSecondary }]}>
                  模糊
                </Text>
              </View>
              <View style={styles.mainStat}>
                <Text style={[styles.mainStatNumber, { color: colors.danger }]}>
                  {dontKnow}
                </Text>
                <Text style={[styles.mainStatLabel, { color: colors.textSecondary }]}>
                  不认识
                </Text>
              </View>
            </View>
          </View>

          {/* Streak Card */}
          <View style={[styles.streakCard, { backgroundColor: colors.card }]}>
            <View style={styles.streakRow}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={[styles.streakText, { color: colors.text }]}>
                连续 {streak} 天
              </Text>
            </View>
          </View>

          {/* Rewards */}
          <View style={[styles.rewardsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.rewardsTitle, { color: colors.text }]}>本次收获</Text>
            <View style={styles.rewardsRow}>
              <View style={styles.rewardItem}>
                <Text style={[styles.rewardNumber, { color: colors.primary }]}>
                  +{expGained}
                </Text>
                <Text style={[styles.rewardLabel, { color: colors.textSecondary }]}>
                  经验
                </Text>
              </View>
              <View style={styles.rewardItem}>
                <Text style={[styles.rewardNumber, { color: colors.warning }]}>
                  +{goldGained}
                </Text>
                <Text style={[styles.rewardLabel, { color: colors.textSecondary }]}>
                  金币
                </Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            {words && words.length > 0 && (
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.primary, marginBottom: 12 }]}
                onPress={handleSpellingTest}
              >
                <Ionicons name="create-outline" size={20} color={colors.primary} />
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>拼写测试</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.primaryButtonText}>返回首页</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  congratsText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  statsCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  mainStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mainStat: {
    alignItems: 'center',
  },
  mainStatNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  mainStatLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  streakCard: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '600',
  },
  rewardsCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  rewardLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  buttons: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 40,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
