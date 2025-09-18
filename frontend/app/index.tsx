import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('admin@test.de');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte E-Mail und Passwort eingeben');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Login erfolgreich:', data);
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        const error = await response.json();
        Alert.alert('Login Fehler', error.detail || 'Anmeldung fehlgeschlagen');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Fehler', 'Netzwerkfehler beim Anmelden');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
          
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 50 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#3B82F6',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <Text style={{ fontSize: 40, color: 'white' }}>🚓</Text>
            </View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
              Stadtwache
            </Text>
            <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 5 }}>
              Polizei Management System
            </Text>
          </View>

          {/* Login Form */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              E-Mail
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: 'white',
                marginBottom: 20
              }}
              value={email}
              onChangeText={setEmail}
              placeholder="admin@test.de"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Passwort
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: 'white',
                marginBottom: 30
              }}
              value={password}
              onChangeText={setPassword}
              placeholder="Passwort eingeben"
              secureTextEntry
            />

            <TouchableOpacity
              style={{
                backgroundColor: loading ? '#9ca3af' : '#3B82F6',
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: 'center'
              }}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                  Anmelden
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Test Credentials */}
          <View style={{
            backgroundColor: '#fef3c7',
            padding: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#f59e0b'
          }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#92400e', marginBottom: 8 }}>
              Test-Zugangsdaten:
            </Text>
            <Text style={{ fontSize: 14, color: '#92400e' }}>
              E-Mail: admin@test.de
            </Text>
            <Text style={{ fontSize: 14, color: '#92400e' }}>
              Passwort: admin123
            </Text>
          </View>

        </View>
      </SafeAreaView>
    );
  }

  // Main App Screen
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Header */}
      <View style={{
        backgroundColor: '#3B82F6',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <View>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
            Stadtwache
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
            Willkommen, {user?.username || 'Admin'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6
          }}
        >
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
            Abmelden
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        
        {/* Dashboard Cards */}
        <View style={{ gap: 16 }}>
          
          {/* Übersicht Card */}
          <TouchableOpacity style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>🏠</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>
                Übersicht
              </Text>
            </View>
            <Text style={{ color: '#6b7280', fontSize: 14 }}>
              Dashboard und aktuelle Einsätze
            </Text>
          </TouchableOpacity>

          {/* Team Card */}
          <TouchableOpacity style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>👥</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>
                Team
              </Text>
            </View>
            <Text style={{ color: '#6b7280', fontSize: 14 }}>
              Team-Verwaltung und Anwesenheit
            </Text>
          </TouchableOpacity>

          {/* Schichtverwaltung Card */}
          <TouchableOpacity style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>⏰</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>
                Schichtverwaltung  
              </Text>
            </View>
            <Text style={{ color: '#6b7280', fontSize: 14 }}>
              Schichten und Dienstpläne
            </Text>
          </TouchableOpacity>

          {/* Admin Dashboard Card */}
          {user?.role === 'admin' && (
            <TouchableOpacity style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              borderLeftWidth: 4,
              borderLeftColor: '#f59e0b'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>⚙️</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>
                  Admin-Dashboard
                </Text>
              </View>
              <Text style={{ color: '#6b7280', fontSize: 14 }}>
                Benutzerverwaltung und Systemeinstellungen
              </Text>
            </TouchableOpacity>
          )}

          {/* Success Message */}
          <View style={{
            backgroundColor: '#dcfce7',
            borderRadius: 12,
            padding: 20,
            borderWidth: 1,
            borderColor: '#16a34a',
            marginTop: 20
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#15803d', marginBottom: 8 }}>
              ✅ Stadtwache App funktioniert!
            </Text>
            <Text style={{ fontSize: 14, color: '#15803d' }}>
              Login erfolgreich. Alle Grundfunktionen sind verfügbar.
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
