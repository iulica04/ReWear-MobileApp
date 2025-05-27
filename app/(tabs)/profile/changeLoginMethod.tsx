import { API_BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChangeLoginMethodScreen() {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Resetare formular la fiecare montare a paginii
  useEffect(() => {
    setPassword('');
    setConfirmPassword('');
    setPasswordVisible(false);
    setConfirmPasswordVisible(false);
    setPasswordError('');
    setConfirmPasswordError('');
  }, []);

  const handleSave = async () => {
    setPasswordError('');
    setConfirmPasswordError('');

    let valid = true;
    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 6 || password.length > 50) {
      setPasswordError('Password must be between 6 and 50 characters.');
      valid = false;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
      valid = false;
    }

    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match.');
      valid = false;
    }

    if (!valid) return;

    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      const userId = await AsyncStorage.getItem('userId');
      if (!userId || !jwtToken) {
        Alert.alert('Error', 'User not authenticated.');
        return;
      }

      // Fetch user details first (to get all required fields)
      const userResp = await fetch(`${API_BASE_URL}/api/Users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      });
      if (!userResp.ok) {
        Alert.alert('Error', 'Could not fetch user data.');
        return;
      }
      const user = await userResp.json();

      const updatedUser = {
        id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        password,
        role: user.role,
        loginProvider: 'local',
      };

      console.log('Updated User:', updatedUser);
      const response = await fetch(`${API_BASE_URL}/api/Users/id?id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        Alert.alert('Success', 'Login method changed! You can now log in with your email and password.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Error', errorData.message || 'Could not update login method.');
      }
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Săgeata sus */}
      <View style={styles.arrowContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
      </View>
      {/* Titlul centrat */}
      <Text style={styles.headerTitle}>Change Of Login Method</Text>
      <View style={styles.content}>
        <Text style={styles.infoText}>
          You can log in with your email instead of previously registered SNS.{"\n"}
          Please set a password to continue.
        </Text>
        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Create a strong password"
              secureTextEntry={!passwordVisible}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity onPress={() => setPasswordVisible(v => !v)}>
              <Ionicons
                name={passwordVisible ? 'eye' : 'eye-off'}
                size={22}
                color="#888"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
        </View>
        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry={!confirmPasswordVisible}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity onPress={() => setConfirmPasswordVisible(v => !v)}>
              <Ionicons
                name={confirmPasswordVisible ? 'eye' : 'eye-off'}
                size={22}
                color="#888"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? <Text style={styles.error}>{confirmPasswordError}</Text> : null}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(236, 228, 223)',
    paddingHorizontal: 18,
  },
  arrowContainer: {
    marginTop: 10,
    marginLeft: 18,
    marginBottom: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: 'Licorice',
    fontSize: 60,
    color: '#222',
    textAlign: 'center',
    marginBottom: 10,
    marginRight: 0,
    marginTop: 0,
    fontWeight: 'bold',
  },
  content: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#4e342e',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    color: '#555',
    fontSize: 14,
  },
  input: {
    padding: 12,
    borderRadius: 9999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  error: {
    color: '#900909',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#6d4c41',
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    alignContent: 'center',
    textAlign: 'center',
  },
});