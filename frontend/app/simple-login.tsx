import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';

const SimpleLogin = ({ onLogin }) => {
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
      const response = await fetch('http://localhost:8001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Login erfolgreich:', data);
        onLogin(data);
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
};

export default SimpleLogin;