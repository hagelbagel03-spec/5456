import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const ShiftManagementComponent = ({ user, token, API_URL, colors, isDarkMode, isSmallScreen, isMediumScreen }) => {
  const [checkins, setCheckins] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vacationFormData, setVacationFormData] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  });

  // Bezirke und Teams State
  const [districts] = useState([
    'Innenstadt', 'Nord', 'Süd', 'Ost', 'West', 
    'Industriegebiet', 'Wohngebiet', 'Zentrum'
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      // Load checkins
      try {
        const checkinsResponse = await axios.get(`${API_URL}/api/checkins`, config);
        if (checkinsResponse.data) {
          setCheckins(checkinsResponse.data);
        }
      } catch (error) {
        console.log('Check-ins laden fehlgeschlagen:', error.message);
        setCheckins([]);
      }

      // Load vacations
      try {
        const vacationsResponse = await axios.get(`${API_URL}/api/vacations`, config);
        if (vacationsResponse.data) {
          setVacations(vacationsResponse.data);
        }
      } catch (error) {
        console.log('Urlaubsanträge laden fehlgeschlagen:', error.message);
        setVacations([]);
      }
    } catch (error) {
      console.error('Error loading shift data:', error);
      setCheckins([]);
      setVacations([]);
    } finally {
      setLoading(false);
    }
  };

  const performCheckIn = async (status = 'ok') => {
    try {
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      const checkInData = {
        status: status,
        message: getStatusText(status),
        timestamp: new Date().toISOString()
      };

      await axios.post(`${API_URL}/api/checkin`, checkInData, config);
      
      Alert.alert('✅ Check-In erfolgreich!', `Status: ${getStatusText(status)}`);
      await loadData();
    } catch (error) {
      console.error('Check-in error:', error);
      Alert.alert('❌ Fehler', 'Check-In konnte nicht übertragen werden.');
    }
  };

  const requestVacation = async () => {
    if (!vacationFormData.start_date || !vacationFormData.end_date || !vacationFormData.reason) {
      Alert.alert('❌ Fehler', 'Bitte alle Felder ausfüllen.');
      return;
    }

    try {
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      const vacationData = {
        start_date: vacationFormData.start_date,
        end_date: vacationFormData.end_date,
        reason: vacationFormData.reason
      };

      const response = await axios.post(`${API_URL}/api/vacations`, vacationData, config);
      
      if (response.data) {
        Alert.alert('✅ Erfolg', 'Urlaubsantrag wurde eingereicht!');
        
        setVacationFormData({ start_date: '', end_date: '', reason: '' });
        setShowVacationModal(false);
        
        console.log('🔄 Lade Urlaubsanträge neu...');
        await loadData();
      }
    } catch (error) {
      console.error('❌ Vacation request error:', error);
      Alert.alert('❌ Fehler', 'Urlaubsantrag konnte nicht eingereicht werden.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'rejected': return colors.error;
      case 'pending': return colors.warning;
      case 'ok': return colors.success;
      case 'help_needed': return colors.warning;
      case 'emergency': return colors.error;
      default: return colors.textMuted;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Genehmigt';
      case 'rejected': return 'Abgelehnt';
      case 'pending': return 'Ausstehend';
      case 'ok': return 'Alles OK';
      case 'help_needed': return 'Hilfe benötigt';
      case 'emergency': return 'Notfall';
      default: return status;
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    section: {
      margin: 16,
    },
    
    // Modern Section Headers
    modernSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 16,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    sectionIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    sectionTextContainer: {
      flex: 1,
    },
    modernSectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    modernSectionSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: '500',
    },
    modernQuickButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },

    // District Overview Card
    districtOverviewCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    districtHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    districtIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.warning + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    districtInfo: {
      flex: 1,
    },
    districtTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    districtTeam: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 2,
    },

    // Status Info Cards
    statusInfoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    statusInfoCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      width: '48%',
      marginBottom: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statusInfoIcon: {
      marginBottom: 8,
    },
    statusInfoTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    statusInfoValue: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 4,
    },

    // Status Buttons - Kompakt nebeneinander
    statusButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
      paddingHorizontal: 4,
    },
    statusButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
      minHeight: 44,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    statusButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
      marginLeft: 6,
      textAlign: 'center',
    },

    // Action Buttons
    actionButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      marginLeft: 8,
    },

    // Lists
    listContainer: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 8,
      marginBottom: 16,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '30',
    },
    listItemIcon: {
      marginRight: 16,
    },
    listItemContent: {
      flex: 1,
    },
    listItemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    listItemSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
    },
    listItemBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.primary + '20',
    },
    listItemBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },

    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    modalIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.textMuted + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    // Form Styles
    formGroup: {
      marginBottom: 20,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    formInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
    },
    formTextArea: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      height: 100,
      textAlignVertical: 'top',
    },
    
    // Button Row
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 24,
    },
    cancelButton: {
      backgroundColor: colors.textMuted + '20',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      flex: 1,
      marginRight: 12,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: colors.textMuted,
      fontSize: 16,
      fontWeight: '600',
    },
    submitButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      flex: 1,
      marginLeft: 12,
      alignItems: 'center',
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },

    // Empty State
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textMuted,
      marginTop: 16,
      textAlign: 'center',
    },

    // Loading
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    loadingText: {
      fontSize: 16,
      color: colors.textMuted,
      marginTop: 16,
    },
  });

  return (
    <ScrollView style={dynamicStyles.container}>
      {/* Status Check-In Buttons */}
      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.modernSectionHeader}>
          <View style={dynamicStyles.sectionIconContainer}>
            <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
          </View>
          <View style={dynamicStyles.sectionTextContainer}>
            <Text style={dynamicStyles.modernSectionTitle}>Status Check-In</Text>
            <Text style={dynamicStyles.modernSectionSubtitle}>Aktueller Dienststatus</Text>
          </View>
        </View>
        
        <View style={dynamicStyles.statusButtonsContainer}>
          <TouchableOpacity
            style={[dynamicStyles.statusButton, { backgroundColor: colors.success, flex: 1, marginRight: 4 }]}
            onPress={() => performCheckIn('ok')}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={dynamicStyles.statusButtonText}>✅ OK</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[dynamicStyles.statusButton, { backgroundColor: colors.warning, flex: 1, marginHorizontal: 4 }]}
            onPress={() => performCheckIn('help_needed')}
          >
            <Ionicons name="help-circle" size={20} color="#FFFFFF" />
            <Text style={dynamicStyles.statusButtonText}>🆘 Hilfe</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[dynamicStyles.statusButton, { backgroundColor: colors.error, flex: 1, marginLeft: 4 }]}
            onPress={() => performCheckIn('emergency')}
          >
            <Ionicons name="warning" size={20} color="#FFFFFF" />
            <Text style={dynamicStyles.statusButtonText}>🚨 Notfall</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Check-Ins */}
      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.modernSectionHeader}>
          <View style={dynamicStyles.sectionIconContainer}>
            <Ionicons name="time" size={24} color="#FFFFFF" />
          </View>
          <View style={dynamicStyles.sectionTextContainer}>
            <Text style={dynamicStyles.modernSectionTitle}>Letzte Check-Ins</Text>
            <Text style={[dynamicStyles.modernSectionSubtitle, { color: colors.text, opacity: 0.8 }]}>Aktivitäten und Status</Text>
          </View>
          <TouchableOpacity 
            style={dynamicStyles.modernQuickButton}
            onPress={() => performCheckIn('ok')}
          >
            <Ionicons name="add-circle" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {checkins.length > 0 ? (
          checkins.slice(0, 5).map((checkin) => (
            <View key={checkin.id} style={dynamicStyles.checkinCard}>
              <View style={dynamicStyles.checkinHeader}>
                <Text style={dynamicStyles.checkinTime}>
                  {new Date(checkin.timestamp).toLocaleString('de-DE')}
                </Text>
                <View style={[dynamicStyles.statusBadge, { backgroundColor: getStatusColor(checkin.status) }]}>
                  <Text style={dynamicStyles.statusBadgeText}>{getStatusText(checkin.status)}</Text>
                </View>
              </View>
              {checkin.message && (
                <Text style={dynamicStyles.checkinMessage}>{checkin.message}</Text>
              )}
            </View>
          ))
        ) : (
          <View style={dynamicStyles.emptyCheckins}>
            <Ionicons name="time-outline" size={48} color={colors.textMuted} />
            <Text style={dynamicStyles.emptyText}>Noch keine Check-Ins vorhanden</Text>
            <Text style={dynamicStyles.emptySubtext}>Klicken Sie auf Check-In um zu beginnen</Text>
          </View>
        )}
      </View>

      {/* Vacation Requests */}
      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.modernSectionHeader}>
          <View style={dynamicStyles.sectionIconContainer}>
            <Ionicons name="calendar" size={24} color="#FFFFFF" />
          </View>
          <View style={dynamicStyles.sectionTextContainer}>
            <Text style={dynamicStyles.modernSectionTitle}>Meine Urlaubsanträge</Text>
            <Text style={[dynamicStyles.modernSectionSubtitle, { color: colors.text, opacity: 0.8 }]}>Status und Verwaltung</Text>
          </View>
          <TouchableOpacity 
            style={dynamicStyles.modernQuickButton}
            onPress={() => setShowVacationModal(true)}
          >
            <Ionicons name="add-circle" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {vacations.length === 0 ? (
          <View style={dynamicStyles.emptyCheckins}>
            <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
            <Text style={dynamicStyles.emptyText}>Keine Urlaubsanträge vorhanden</Text>
            <Text style={dynamicStyles.emptySubtext}>Erstellen Sie Ihren ersten Urlaubsantrag</Text>
          </View>
        ) : (
          vacations.map((vacation) => (
            <View key={vacation.id} style={dynamicStyles.vacationCard}>
              <View style={dynamicStyles.vacationHeader}>
                <Text style={dynamicStyles.vacationDates}>
                  {vacation.start_date} - {vacation.end_date}
                </Text>
                <View style={[dynamicStyles.statusBadge, { backgroundColor: getStatusColor(vacation.status) }]}>
                  <Text style={dynamicStyles.statusBadgeText}>{getStatusText(vacation.status)}</Text>
                </View>
              </View>
              <Text style={dynamicStyles.vacationReason}>{vacation.reason}</Text>
            </View>
          ))
        )}
      </View>

      {/* Vacation Request Modal */}
      {showVacationModal && (
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContainer}>
            <Text style={dynamicStyles.modalTitle}>📅 Urlaubsantrag</Text>
            
            <TextInput
              style={dynamicStyles.input}
              value={vacationFormData.start_date}
              onChangeText={(value) => setVacationFormData({...vacationFormData, start_date: value})}
              placeholder="Startdatum (YYYY-MM-DD)"
              placeholderTextColor={colors.textMuted}
            />
            
            <TextInput
              style={dynamicStyles.input}
              value={vacationFormData.end_date}
              onChangeText={(value) => setVacationFormData({...vacationFormData, end_date: value})}
              placeholder="Enddatum (YYYY-MM-DD)"
              placeholderTextColor={colors.textMuted}
            />
            
            <TextInput
              style={[dynamicStyles.input, dynamicStyles.multilineInput]}
              value={vacationFormData.reason}
              onChangeText={(value) => setVacationFormData({...vacationFormData, reason: value})}
              placeholder="Grund für den Urlaubsantrag"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />
            
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity
                style={[dynamicStyles.submitButton, { backgroundColor: colors.textMuted, flex: 1, marginRight: 6 }]}
                onPress={() => setShowVacationModal(false)}
              >
                <Text style={dynamicStyles.submitButtonText}>Abbrechen</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[dynamicStyles.submitButton, { flex: 1, marginLeft: 6 }]}
                onPress={requestVacation}
              >
                <Text style={dynamicStyles.submitButtonText}>Einreichen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ShiftManagementComponent;