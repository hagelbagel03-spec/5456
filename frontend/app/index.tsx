import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView
} from 'react-native';

export default function App() {
  const [email, setEmail] = useState('admin@test.de');
  const [password, setPassword] = useState('admin123');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsLoggedIn(true);
        Alert.alert('Erfolg', 'Anmeldung erfolgreich!');
      } else {
        Alert.alert('Fehler', 'Anmeldung fehlgeschlagen');
      }
    } catch (error) {
      Alert.alert('Fehler', 'Netzwerkfehler');
    }
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <StatusBar barStyle="dark-content" />
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
          <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 50 }}>
            🚓 Stadtwache
          </Text>
          
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 15,
              marginBottom: 20,
              borderRadius: 8,
              fontSize: 16
            }}
            placeholder="E-Mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 15,
              marginBottom: 20,
              borderRadius: 8,
              fontSize: 16
            }}
            placeholder="Passwort"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity
            onPress={handleLogin}
            style={{
              backgroundColor: '#3B82F6',
              padding: 15,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
              Anmelden
            </Text>
          </TouchableOpacity>

          <View style={{
            marginTop: 30,
            padding: 15,
            backgroundColor: '#fef3c7',
            borderRadius: 8
          }}>
            <Text style={{ fontSize: 14, color: '#92400e' }}>
              Test: admin@test.de / admin123
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <StatusBar barStyle="dark-content" />
      
      <View style={{
        backgroundColor: '#3B82F6',
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
          Stadtwache - {user?.username}
        </Text>
        <TouchableOpacity
          onPress={() => setIsLoggedIn(false)}
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 6 }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Abmelden</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ padding: 20 }}>
        <TouchableOpacity style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          marginBottom: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          elevation: 3
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            🏠 Übersicht
          </Text>
          <Text style={{ color: '#666' }}>Dashboard und aktuelle Einsätze</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          marginBottom: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          elevation: 3
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            👥 Team-Verwaltung
          </Text>
          <Text style={{ color: '#666' }}>Team-Zuordnung und Anwesenheit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          marginBottom: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          elevation: 3
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            ⏰ Schichtverwaltung
          </Text>
          <Text style={{ color: '#666' }}>Schichten und Dienstpläne</Text>
        </TouchableOpacity>

        {user?.role === 'admin' && (
          <TouchableOpacity style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            marginBottom: 15,
            borderLeftWidth: 4,
            borderLeftColor: '#f59e0b',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            elevation: 3
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              ⚙️ Admin-Dashboard
            </Text>
            <Text style={{ color: '#666' }}>Benutzerverwaltung und Einstellungen</Text>
          </TouchableOpacity>
        )}

        <View style={{
          backgroundColor: '#dcfce7',
          borderRadius: 12,
          padding: 20,
          marginTop: 20,
          borderWidth: 1,
          borderColor: '#16a34a'
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#15803d', marginBottom: 8 }}>
            ✅ App funktioniert!
          </Text>
          <Text style={{ color: '#15803d' }}>
            Login erfolgreich. Alle Features wurden vereinfacht.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
