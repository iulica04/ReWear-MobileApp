import { API_BASE_URL } from './config'; 
import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation  } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // Pentru vizibilitate parolă
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password is required.');
      return false;
    }
    if (password.length < 6 || password.length > 50) {
      setPasswordError('Password must be between 6 and 50 characters.');
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{6,}$/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = () => {
    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match.');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleResetPassword = async () => {
    const validPassword = validatePassword();
    const validConfirm = validateConfirmPassword();
    if (!validPassword || !validConfirm) return;

    if (!email) {
      Alert.alert('Error', 'Emailul lipsește.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/ResetPassword/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword: password }),
      });

      if (response.ok) {
        Alert.alert(
          'Password reset!',
          'Your password has been changed successfully.',
          [{ text: 'OK', onPress: () => router.push('/login') }]
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Error', errorData.message || response.statusText);
      }
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.wrapper} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo3.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Set New Password</Text>
          <Text style={styles.subtitle}>Enter your new password below</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={[
                  styles.input,
                  passwordFocused && styles.inputFocused,
                  { flex: 1 }
                ]}
                value={password}
                onChangeText={setPassword}
                onBlur={() => { setPasswordFocused(false); validatePassword(); }}
                onFocus={() => setPasswordFocused(true)}
                placeholder="Enter new password"
                placeholderTextColor="#aaa"
                secureTextEntry={!passwordVisible}
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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={[
                  styles.input,
                  confirmPasswordFocused && styles.inputFocused,
                  { flex: 1 }
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onBlur={() => { setConfirmPasswordFocused(false); validateConfirmPassword(); }}
                onFocus={() => setConfirmPasswordFocused(true)}
                placeholder="Confirm new password"
                placeholderTextColor="#aaa"
                secureTextEntry={!confirmPasswordVisible}
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
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 20,
              justifyContent: 'center',
              alignSelf: 'center',
              height: 24,
            }}
            onPress={() => router.push('/login')}
          >
            <Ionicons name="arrow-back" size={18} color="#4e342e" style={{ marginRight: 4, marginTop: 0 }} />
            <Text style={[styles.signupText, { marginTop: 0 }]}>
              Back to <Text style={styles.signupLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9B9AB',
    paddingHorizontal: 16,
  },
  wrapper: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
    marginTop: 100,
  },
  formContainer: {
    backgroundColor: '#efebe2',
    padding: 24,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 30,
  },
  logo: {
    width: 300,
    height: 120,
  },
  title: {
    fontSize: 26,
    color: '#4e342e',
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6e5c4f',
    marginBottom: 20,
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
  inputFocused: {
    borderColor: '#6d4c41',
    borderWidth: 2,
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
  },
  signupText: {
    fontSize: 14,
    color: '#4e342e',
    marginTop: 20,
  },
  signupLink: {
    color: '#4e342e',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  arrow: {
    marginRight: 5,
    fontSize: 15,
    color: '#4e342e',
    marginBottom: -20,
  },
});