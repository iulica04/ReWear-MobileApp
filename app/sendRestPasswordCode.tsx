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
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SendResetPasswordCodeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const validateEmail = () => {
    const isValid = /\S+@\S+\.\S+/.test(email);
    setEmailError(isValid ? '' : 'Please enter a valid email address.');
    return isValid;
  };

  const handleSendCode = async () => {
    if (!validateEmail()) return;

    try {
      const payload = { email: email.trim() };
      console.log('Payload:', payload);
      const response = await fetch(`${API_BASE_URL}/api/ResetPassword/send-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response:', response);

      if (response.ok) {
        Alert.alert(
          'Email sent',
          'Check your email for the reset code.',
          [{ text: 'OK', onPress: () => router.push({ pathname: '/verifyCode', params: { email } }) }]
        );
      } else {
        console.log('Error response:', response);
        if(response.status === 404) {
          Alert.alert('Error', 'Email not found.');
        }
         else {
          Alert.alert('Error', 'Failed to send reset code. Please try again later.');
         }
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
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email to receive a reset code</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[
                styles.input,
                emailFocused && styles.inputFocused
              ]}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onBlur={() => { setEmailFocused(false); validateEmail(); }}
              onFocus={() => setEmailFocused(true)}
              placeholder="Enter your email"
              placeholderTextColor="#aaa"
            />
            {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSendCode}>
            <Text style={styles.buttonText}>Send Reset Code</Text>
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
    backgroundColor: '#e4cbb2',
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
    marginBottom: 60,
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
    marginTop: 40,
    marginBottom: 40,
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
  button2: {
    backgroundColor: '#a48c7c',
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
    fontSize: 12,
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