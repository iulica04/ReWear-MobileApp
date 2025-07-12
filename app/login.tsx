import { API_BASE_URL } from './config'; // ajustează calea dacă e nevoie
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from './appSetings'; 
import React, { useState, useLayoutEffect  } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useRouter, useNavigation } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export default function LoginScreen() {
  WebBrowser.maybeCompleteAuthSession();

  const router = useRouter();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [backendError, setBackendError] = useState(''); // <-- adăugat

  const redirectUri =
    Constants.appOwnership === 'expo'
      ? 'https://auth.expo.io/@iulica/rewear'
      : AuthSession.getRedirectUrl();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri,
  });

  React.useEffect(() => {
    if (
      response?.type === 'success' &&
      response.authentication &&
      response.authentication.accessToken
    ) {
      console.log('Google login response:', response);
      (async () => {
        try {
          const backendResponse = await fetch(`${API_BASE_URL}/api/Users/login-with-google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: response.params!.id_token }),
          });
          if (backendResponse.ok) {
            const data  = await backendResponse.json();
            console.log('Google login response:', data);
            await AsyncStorage.setItem('jwtToken', data.token);
            await AsyncStorage.setItem('userId', data.userId);
            router.replace('/(tabs)/profile/profile');
          } else {
            const data = await backendResponse.text();
            setBackendError(data);
          }
        } catch (err) {
          console.error('Error during Google login:', err);
          setBackendError(String(err));
        }
      })();
    }
  }, [response]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const validateEmail = () => {
    const isValid = /\S+@\S+\.\S+/.test(email);
    setEmailError(isValid ? '' : 'Please enter a valid email address.');
  };

  const validatePassword = () => {
    setPasswordError(password.length >= 6 ? '' : 'Password must be at least 6 characters.');
  };

  const handleLogin = async () => {
    setBackendError(''); // resetăm eroarea de backend la fiecare încercare
    validateEmail();
    validatePassword();

    if (!emailError && !passwordError && email && password) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          AsyncStorage.setItem('jwtToken', data.token);
          AsyncStorage.setItem('userId', data.userId);
          router.push('/(tabs)/profile/profile');
        } else {
          const errorData = await response.text();
          setBackendError(errorData);
        }
      } catch (error) {
        setBackendError(String(error));
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.wrapper} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Video header */}
        <View style={styles.videoContainer}>
          <Video
            source={require('../assets/videos/video1.mp4')}
            rate={1.0}
            volume={1.0}
            isMuted
            shouldPlay
            isLooping
            resizeMode={ResizeMode.COVER}
            style={styles.video}
          />
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back to</Text>
          <Text style={styles.brand}>ReWear</Text>
          <Text style={styles.subtitle}>Login to Your Account</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onBlur={validateEmail}
              placeholder="Enter your email"
              placeholderTextColor="#aaa"
            />
            {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onBlur={validatePassword}
              placeholder="Enter your password"
              placeholderTextColor="#aaa"
            />
            {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
          </View>

          {/* Afișare eroare de backend deasupra butonului de login */}
          {backendError ? (
            <Text style={[styles.error, { textAlign: 'center', marginBottom: 8 }]}>{backendError}</Text>
          ) : null}

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.signupText}>
             Forgot your password?{' '}
            <Text style={styles.signupLink} onPress={() => router.push('/sendRestPasswordCode')}>
              Reset Password
            </Text>
          </Text>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or using</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={() => promptAsync()}>
            <Image source={require('../assets/images/icons8-google-48.png')} style={styles.googleIcon} />
            <Text style={styles.googleText}>Login with Google</Text>
          </TouchableOpacity>

          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signupLink} onPress={() => router.push('/register')}>
              Sign up here
            </Text>
          </Text>
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
    justifyContent: 'flex-start',
    paddingBottom: 40,
    marginTop: 100,
  },
  videoContainer: {
    width: '100%',
    height: 320,
    backgroundColor: '#fdf6ee',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  video: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  formContainer: {
    backgroundColor: '#fdf6ee',
    padding: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    marginTop:0,
  },
  title: {
    fontSize: 26,
    color: '#4e342e',
    fontWeight: '600',
  },
  brand: {
    fontSize: 60,
    fontFamily: 'Licorice-Regular',
    color: '#4e342e',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6e5c4f',
    marginBottom: 20,
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
    color: 'rgb(198, 29, 29)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgb(174, 167, 161)',
  },
  dividerText: {
    marginHorizontal: 12,
    color: 'rgb(174, 167, 161)',
    fontSize: 12,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8d6e63',
    padding: 12,
    borderRadius: 9999,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 16,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleText: {
    color: '#fff',
    fontSize: 14,
  },
  signupText: {
    fontSize: 13,
    color: ' rgb(174, 167, 161)',
    marginTop: 10,
  },
  signupLink: {
    color: 'rgb(174, 167, 161)',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});