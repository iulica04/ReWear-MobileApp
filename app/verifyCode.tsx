import { API_BASE_URL } from './config'; 
import React, { useRef, useState, useLayoutEffect  } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [codeError, setCodeError] = useState('');
  const [codeInputFocused, setCodeInputFocused] = useState(-1);
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleCodeChange = (value: string, idx: number) => {
    // Acceptă doar o literă sau cifră, maxim 1 caracter
    if (!/^[A-Za-z0-9]?$/.test(value)) return;
    const newCode = [...code];
    newCode[idx] = value.toUpperCase();
    setCode(newCode);

    if (value && idx < 5) {
      inputRefs[idx + 1].current?.focus();
    }
    if (!value && idx > 0) {
      inputRefs[idx - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    if (!email) {
      Alert.alert('Eroare', 'Emailul lipsește.');
      return;
    }
    if (code.some(c => c === '')) {
      setCodeError('Introduceți toate cele 6 caractere.');
      return;
    }
    setCodeError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/ResetPassword/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: code.join('') }),
      });

      if (response.ok) {
        Alert.alert(
          'Cod validat!',
          'Codul a fost verificat cu succes.',
          [{ text: 'OK', onPress: () => router.push({ pathname: '/resetPassword', params: { email } }) }]
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Eroare', errorData.message || response.statusText);
      }
    } catch (error) {
      Alert.alert('Eroare', String(error));
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
          <Text style={styles.title}>Verify Code</Text>
          <Text style={styles.subtitle}>Enter the 6-character code sent to your email</Text>
          <View style={styles.codeContainer}>
            {code.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={inputRefs[idx]}
                style={[
                  styles.codeInput,
                  codeInputFocused === idx && styles.codeInputFocused,
                ]}
                keyboardType="default"
                autoCapitalize="characters"
                maxLength={1}
                value={digit}
                onChangeText={val => handleCodeChange(val, idx)}
                returnKeyType={idx === 5 ? 'done' : 'next'}
                onSubmitEditing={() => idx === 5 && handleVerify()}
                autoFocus={idx === 0}
                onFocus={() => setCodeInputFocused(idx)}
                onBlur={() => setCodeInputFocused(-1)}
              />
            ))}
          </View>
          {codeError ? <Text style={styles.error}>{codeError}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleVerify}>
            <Text style={styles.buttonText}>Verify Code</Text>
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
    backgroundColor: '#a29086',
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
    marginBottom: 40,
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 1,
  },
  codeInput: {
    width: 44,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    fontSize: 24,
    marginHorizontal: 4,
  },
  codeInputFocused: {
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