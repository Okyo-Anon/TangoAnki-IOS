import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getColors } from '../utils/colors';

export default function LearningSettingsScreen({ navigation }) {
  const { settings, updateSettings } = useApp();
  const isDark = settings.theme === 'dark';
  const colors = getColors(isDark);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalOptions, setModalOptions] = useState([]);
  const [currentValue, setCurrentValue] = useState('');

  const newReviewOptions = [
    { label: '全部次日复习', value: 'all' },
    { label: '错词次日复习', value: 'mistakes' },
  ];

  const groupStudyOptions = [
    { label: '5个', value: 5 },
    { label: '10个', value: 10 },
    { label: '15个', value: 15 },
    { label: '20个', value: 20 },
  ];

  const groupReviewOptions = [
    { label: '10个', value: 10 },
    { label: '20个', value: 20 },
    { label: '30个', value: 30 },
    { label: '50个', value: 50 },
  ];

  const getNewReviewDisplay = () => {
    const option = newReviewOptions.find(o => o.value === settings.firstReviewDelay);
    return option ? option.label : '全部次日复习';
  };

  const getGroupStudyDisplay = () => {
    return `${settings.studyWordsPerSession}个`;
  };

  const getGroupReviewDisplay = () => {
    return `${settings.reviewWordsPerSession}个`;
  };

  const openModal = (title, options, currentVal) => {
    setModalTitle(title);
    setModalOptions(options);
    setCurrentValue(currentVal);
    setModalVisible(true);
  };

  const selectOption = (option) => {
    if (option.value === 'all' || option.value === 'mistakes') {
      updateSettings({ firstReviewDelay: option.value });
    } else if (modalTitle === '每组学习单词量') {
      updateSettings({ studyWordsPerSession: option.value });
    } else if (modalTitle === '每组复习单词量') {
      updateSettings({ reviewWordsPerSession: option.value });
    }
    setModalVisible(false);
  };

  const renderOption = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        { backgroundColor: colors.background },
        item.value === currentValue && { backgroundColor: colors.primaryLight }
      ]}
      onPress={() => selectOption(item)}
    >
      <Text style={[styles.optionText, { color: colors.text }]}>{item.label}</Text>
      {item.value === currentValue && (
        <Ionicons name="checkmark" size={22} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>学习设置</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={[styles.section, { backgroundColor: colors.card }]}
          onPress={() => openModal('新学单词首次复习时间', newReviewOptions, settings.firstReviewDelay)}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>⏰</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>新学单词首次复习时间</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {getNewReviewDisplay()}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </View>
        </TouchableOpacity>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.settingRowTop}
            onPress={() => openModal('每组学习单词量', groupStudyOptions, settings.studyWordsPerSession)}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📚</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>每组学习单词量</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {getGroupStudyDisplay()}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={styles.settingRowBottom}
            onPress={() => openModal('每组复习单词量', groupReviewOptions, settings.reviewWordsPerSession)}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔄</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>每组复习单词量</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {getGroupReviewDisplay()}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.settingRowTop}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔔</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>学习提醒</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.settingRowBottom}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔃</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>同步学习数据</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{modalTitle}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={modalOptions}
              renderItem={renderOption}
              keyExtractor={(item) => item.value.toString()}
              contentContainerStyle={styles.optionsList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingRowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    fontSize: 18,
  },
  settingLabel: {
    fontSize: 15,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValue: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginLeft: 48,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    paddingHorizontal: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginVertical: 2,
  },
  optionText: {
    fontSize: 16,
  },
});
