import { API_BASE_URL } from './config'; 
import React, { useState, useLayoutEffect, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Alert } from 'react-native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useRouter, useNavigation } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';


WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const GOOGLE_CLIENT_ID = '1021086131357-dcmqujb49f6s2ofkd8vbiq1pao0p5d9d.apps.googleusercontent.com'; // înlocuiește cu clientId-ul tău
  const GOOGLE_CLIENT_SECRET = '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'; // înlocuiește cu clientSecret-ul tău
  const redirectUri = 
    Constants.appOwnership === 'expo'
      ? 'https://auth.expo.io/@iulica/rewear'
      : AuthSession.getRedirectUrl();

  // Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    responseType: 'code',
    redirectUri,
  });

  useEffect(() => {
  if (
    response?.type === 'success' &&
    response.authentication &&
    response.authentication.accessToken
  ) {
    (async () => {
      try {
        console.log('Google response:', response);
        const backendResponse = await fetch(`${API_BASE_URL}/api/Users/login-with-google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: response.params!.id_token }),
        });
        if (backendResponse.ok) {
          const data = await backendResponse.json();
          await AsyncStorage.setItem('jwtToken', data.token); // Salvează tokenul în local storage
          await AsyncStorage.setItem('userId', data.userId);
          Alert.alert('Cont creat cu Google!', 'Te-ai autentificat cu succes.', [
            { text: 'OK', onPress: () => router.push('/login') },
          ]);
        } else {
          const errorData = await backendResponse.json().catch(() => ({}));
          Alert.alert('Eroare', errorData.message || backendResponse.statusText);
        }
      } catch (err) {
        Alert.alert('Eroare', String(err));
      }
    })();
  }
}, [response]);

  // Step state
  const [step, setStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Step 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');

  // Step 2
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Step 3
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Step titles
  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Your Name';
      case 2:
        return 'Choose Username & Email';
      case 3:
        return 'Set Password';
      case 4:
        return 'Finish';
      default:
        return '';
    }
  };

  // Backend check for username/email uniqueness
  const checkExistence = async (value: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Users/check-existence/${encodeURIComponent(value)}`,
        { method: 'HEAD' }
      );
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  // Step validation
  const validateStep1 = () => {
    let valid = true;
    if (!firstName.trim()) {
      setFirstNameError('First name is required.');
      valid = false;
    } else setFirstNameError('');
    if (!lastName.trim()) {
      setLastNameError('Last name is required.');
      valid = false;
    } else setLastNameError('');
    if (valid) setStep(2);
  };

  const validateStep2 = async () => {
    let valid = true;

    if (!username.trim()) {
      setUsernameError('Username is required.');
      valid = false;
    } else {
      setUsernameError('');
      const exists = await checkExistence(username.trim());
      if (exists) {
        setUsernameError('Username already exists.');
        valid = false;
      }
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
      const exists = await checkExistence(email.trim());
      if (exists) {
        setEmailError('Email already exists.');
        valid = false;
      }
    }

    if (valid) setStep(3);
  };

  const validateStep3 = () => {
    let valid = true;

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 6 || password.length > 50) {
      setPasswordError('Password must be between 6 and 50 characters.');
      valid = false;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match.');
      valid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (valid) setStep(4);
  };

  const handleRegister = async () => {
    try {
      const payload = {
        firstName,
        lastName,
        userName: username,
        email,
        password,
      };

      const response = await fetch(`${API_BASE_URL}/api/Users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert(
          'Account created successfully!',
          'Welcome to ReWear!',
          [{ text: 'OK', onPress: () => router.push('/login') }]
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert('Registration failed!\n' + (errorData.message || response.statusText));
      }
    } catch (error) {
      alert('Registration failed!\n' + error);
    }
  };

  const clearFirstNameError = () => setFirstNameError('');
  const clearLastNameError = () => setLastNameError('');
  const clearUsernameError = () => setUsernameError('');
  const clearEmailError = () => setEmailError('');
  const clearPasswordError = () => setPasswordError('');
  const clearConfirmPasswordError = () => setConfirmPasswordError('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.wrapper}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Video header */}
        <View style={styles.videoContainer}>
          <View style={styles.videoWrapper}>
            <Video
              source={require('../assets/videos/video3.mp4')}
              rate={1.0}
              volume={1.0}
              isMuted
              shouldPlay
              isLooping
              resizeMode={ResizeMode.COVER}
              style={styles.video}
            />
          </View>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Your Account with</Text>
          <Text style={styles.brand}>ReWear</Text>
          <Text style={styles.subtitle}>{getStepTitle()}</Text>

          {/* Step 1 */}
          {step === 1 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  onFocus={clearFirstNameError}
                  placeholder="Enter your first name"
                  placeholderTextColor="#aaa"
                />
                {firstNameError ? <Text style={styles.error}>{firstNameError}</Text> : null}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  onFocus={clearLastNameError}
                  placeholder="Enter your last name"
                  placeholderTextColor="#aaa"
                />
                {lastNameError ? <Text style={styles.error}>{lastNameError}</Text> : null}
              </View>
              <TouchableOpacity style={styles.button} onPress={validateStep1}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  onFocus={clearUsernameError}
                  placeholder="Choose a unique username"
                  placeholderTextColor="#aaa"
                />
                {usernameError ? <Text style={styles.error}>{usernameError}</Text> : null}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={clearEmailError}
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#aaa"
                />
                {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.buttonSecondary} onPress={() => setStep(1)}>
                  <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonSecondaryNext} onPress={validateStep2}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={clearPasswordError}
                    placeholder="Create a strong password"
                    secureTextEntry={!passwordVisible}
                    placeholderTextColor="#aaa"
                  />
                  <TouchableOpacity onPress={() => setPasswordVisible(v => !v)}>
                    <Icon
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
                <Text style={styles.label}>Confirm Password</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={clearConfirmPasswordError}
                    placeholder="Re-enter your password"
                    secureTextEntry={!confirmPasswordVisible}
                    placeholderTextColor="#aaa"
                  />
                  <TouchableOpacity onPress={() => setConfirmPasswordVisible(v => !v)}>
                    <Icon
                      name={confirmPasswordVisible ? 'eye' : 'eye-off'}
                      size={22}
                      color="#888"
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? <Text style={styles.error}>{confirmPasswordError}</Text> : null}
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.buttonSecondary} onPress={() => setStep(2)}>
                  <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonSecondaryNext} onPress={validateStep3}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <>
              <Text style={styles.finalText}>
                By clicking the button below, you’ll officially become part of the ReWear community — a space where fashion meets sustainability.
              </Text>
              <Text style={styles.finalText}>
                Together, we give clothes a second chance and reduce waste, one outfit at a time.
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.buttonSecondary} onPress={() => setStep(3)}>
                  <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonSecondaryNext} onPress={handleRegister}>
                  <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or using</Text>
            <View style={styles.line} />
          </View>

          {/* Google Sign Up */}
          <TouchableOpacity style={styles.googleButton} onPress={() => promptAsync()}>
            <Image source={require('../assets/images/icons8-google-48.png')} style={styles.googleIcon} />
            <Text style={styles.googleText}>Sign up with Google</Text>
          </TouchableOpacity>

          <Text style={styles.signupText}>
            Already have an account?{' '}
            <Text style={styles.signupLink} onPress={() => router.push('/login')}>
              Click here
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
    backgroundColor: '#B1A093',
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
  videoWrapper: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  formContainer: {
    backgroundColor: '#fdf6ee',
    padding: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    marginTop: 0,
  },
  title: {
    fontSize: 22,
    color: '#4e342e',
    fontWeight: '600',
    marginTop: 10,
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
  buttonSecondary: {
    backgroundColor: '#A29086',
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 10,
    width: '48%',
    alignItems: 'center',
    marginRight: 8,
  },
  buttonSecondaryNext: {
    backgroundColor: '#C5A494',
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 10,
    width: '48%',
    alignItems: 'center',
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    alignContent: 'center',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#6e5c4f',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#6e5c4f',
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
    fontSize: 14,
    color: '#4e342e',
    marginTop: 10,
  },
  signupLink: {
    color: '#4e342e',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  finalText: {
    fontSize: 15,
    color: '#4e342e',
    marginBottom: 10,
    textAlign: 'center',
  },
});