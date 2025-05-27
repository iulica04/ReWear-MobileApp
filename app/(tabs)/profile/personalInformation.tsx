
import { API_BASE_URL } from '../../config';import React, { useLayoutEffect, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Modal, Pressable, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';

type UserDetails = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  loginProvider?: string;
};

export default function PersonalInformationScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSNSModal, setShowSNSModal] = useState(false);

  // Pentru pop-up editare nume/prenume
  const [showNameModal, setShowNameModal] = useState(false);
  const [editField, setEditField] = useState<'firstName' | 'lastName' | null>(null);
  const [editValue, setEditValue] = useState('');

  // Pentru confirmare parola la schimbare nume/prenume
  const [showConfirmPasswordModal, setShowConfirmPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Pentru pop-up schimbare parolă
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = await AsyncStorage.getItem('userId');
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!userId || !jwtToken) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/Users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (err) {
        // handle error if needed
      }
    };

    fetchUserDetails();
  }, []);

  // Functie pentru butonul Change din modalul de email
  const handleChangeEmail = () => {
    if (user?.loginProvider && user.loginProvider !== 'Local' && user.loginProvider !== 'Email & Password') {
      setShowEmailModal(false);
      setTimeout(() => setShowSNSModal(true), 300);
    } else {
      setShowEmailModal(false);
      // Redirectioneaza spre pagina de schimbare email
      router.push('/');
    }
  };

  // Deschide modal pentru editare nume/prenume
  const openNameModal = (field: 'firstName' | 'lastName') => {
    setEditField(field);
    setEditValue(user?.[field] || '');
    setShowNameModal(true);
  };

  // Pasul 1: Închide modalul de editare și deschide confirmare parolă
  const handleSaveNameStep1 = () => {
    setShowNameModal(false);
    setConfirmPassword('');
    setConfirmPasswordError('');
    setShowConfirmPasswordModal(true);
  };

  // Pasul 2: Confirmă parola și face update la nume/prenume
  const handleSaveNameStep2 = async () => {
    if (!user || !editField) return;
    if (!confirmPassword) {
      setConfirmPasswordError('Please enter your password.');
      return;
    }
    const updatedUser = {
      firstName: editField === 'firstName' ? editValue : user.firstName,
      lastName: editField === 'lastName' ? editValue : user.lastName,
      userName: user.userName,
      email: user.email,
      loginProvider: user.loginProvider || '',
      id: user.id,
      password: confirmPassword,
    };

    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`${API_BASE_URL}/api/Users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(updatedUser),
      });
      if (response.ok) {
        setUser({ ...user, ...updatedUser });
        setShowConfirmPasswordModal(false);
      } else {
        const errorResponse = await response.text();
        if (errorResponse.includes('Invalid password') || errorResponse.includes('Password')) {
          setConfirmPasswordError('Invalid password.');
        } else {
          setConfirmPasswordError('Could not update. Try again.');
        }
        
      }
    } catch (err) {
      setConfirmPasswordError('Could not update. Try again.');
    }
  };

  // Deschide modal pentru schimbare parolă
  const handleChangePassword = () => {
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordError('');
    setShowPasswordModal(true);
  };

  // Validare parolă (ca în register.tsx)
  const validatePassword = (password: string, confirmPassword: string): string | null => {
    if (!password) {
      return 'Password is required.';
    }
    if (password.length < 6 || password.length > 50) {
      return 'Password must be between 6 and 50 characters.';
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  // Salvează noua parolă
  const handleSavePassword = async () => {
    const validationError = validatePassword(newPassword, confirmNewPassword);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }
    if (!user) return;

    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      const updatedUser = {
        id : user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        loginProvider: user.loginProvider,
        password: newPassword,
      };
      const response = await fetch(`${API_BASE_URL}/api/Users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(updatedUser),
      });
      if (response.ok) {
        setShowPasswordModal(false);
        Alert.alert('Success', 'Password changed successfully!');
      } else {
   
        setPasswordError('Could not update password. Try again.');
      }
    } catch (err) {
      setPasswordError('Could not update password. Try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Săgeata sus, complet separată și cât mai sus */}
      <View style={styles.arrowContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
      </View>
      {/* Titlul centrat, separat */}
      <Text style={styles.headerTitle}>Personal Information</Text>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Login Method */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Login Method</Text>
          <View style={styles.loginRow}>
            <MaterialCommunityIcons
              name={
                user?.loginProvider === 'Google'
                  ? 'google'
                  : user?.loginProvider === 'Facebook'
                  ? 'facebook'
                  : user?.loginProvider === 'Apple'
                  ? 'apple'
                  : 'email'
              }
              size={22}
              color="#222"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.loginValue}>
              {user?.loginProvider || 'Email & Password'}
            </Text>
            {/* Butonul apare doar dacă loginProvider NU este 'local' sau 'Email & Password' */}
            {user?.loginProvider !== 'Local' && user?.loginProvider !== 'Email & Password' && (
              <TouchableOpacity style={styles.changeButton} onPress={() => router.push('/profile/changeLoginMethod')}>
                <Text style={styles.changeButtonText}>Change Login Method</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Email */}
        <TouchableOpacity style={styles.section} onPress={() => setShowEmailModal(true)}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.sectionLabel}>Email</Text>
              <Text style={styles.value}>{user?.email || ''}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#888" />
          </View>
        </TouchableOpacity>

        {/* First Name */}
        <TouchableOpacity style={styles.section} onPress={() => openNameModal('firstName')}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.sectionLabel}>First Name</Text>
              <Text style={styles.value}>{user?.firstName || ''}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#888" />
          </View>
        </TouchableOpacity>

        {/* Last Name */}
        <TouchableOpacity style={styles.section} onPress={() => openNameModal('lastName')}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.sectionLabel}>Last Name</Text>
              <Text style={styles.value}>{user?.lastName || ''}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#888" />
          </View>
        </TouchableOpacity>

        {/* Change Password - doar dacă loginProvider este 'local' sau 'Email & Password' */}
        {(user?.loginProvider === 'Local' || user?.loginProvider === 'Email & Password' || !user?.loginProvider) && (
          <TouchableOpacity style={styles.section} onPress={handleChangePassword}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.sectionLabel}>Change Password</Text>
                <Text style={styles.value}>********</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#888" />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Email Modal */}
      <Modal
        visible={showEmailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEmailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBg} onPress={() => setShowEmailModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalBar} />
            <Text style={styles.modalTitle}>Email</Text>
            <Text style={styles.modalEmail}>{user?.email || ''}</Text>
            <View style={styles.modalButtonRow}>
              <Pressable style={styles.modalButton} onPress={handleChangeEmail}>
                <Text style={styles.modalButtonText}>Change</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Name Edit Modal */}
      <Modal
        visible={showNameModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.snsModalOverlay}>
          <View style={styles.snsModalContent}>
            <View style={styles.snsModalIconContainer}>
              <Ionicons name="person-circle" size={48} color="#D9B9AB" />
            </View>
            <Text style={styles.snsModalTitle}>
              {editField === 'firstName' ? 'Change First Name' : 'Change Last Name'}
            </Text>
            <TextInput
              style={styles.input}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={editField === 'firstName' ? 'Enter new first name' : 'Enter new last name'}
              autoFocus
            />
            <View style={{ height: 16 }} />
            <Pressable style={styles.snsModalOkButton} onPress={handleSaveNameStep1}>
              <Text style={styles.snsModalOkButtonText}>Change</Text>
            </Pressable>
            <Pressable style={styles.snsModalChangeButton} onPress={() => setShowNameModal(false)}>
              <Text style={styles.snsModalChangeButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Confirm Password Modal pentru schimbare nume/prenume */}
      <Modal
        visible={showConfirmPasswordModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowConfirmPasswordModal(false)}
      >
        <View style={styles.snsModalOverlay}>
          <View style={styles.snsModalContent}>
            <View style={styles.snsModalIconContainer}>
              <Ionicons name="lock-closed" size={48} color="#D9B9AB" />
            </View>
            <Text style={styles.snsModalTitle}>Enter your password to confirm</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Password"
              secureTextEntry
            />
            {confirmPasswordError ? (
              <Text style={{ color: '#900909', marginBottom: 8 }}>{confirmPasswordError}</Text>
            ) : null}
            <Pressable style={styles.snsModalOkButton} onPress={handleSaveNameStep2}>
              <Text style={styles.snsModalOkButtonText}>Update</Text>
            </Pressable>
            <Pressable style={styles.snsModalChangeButton} onPress={() => setShowConfirmPasswordModal(false)}>
              <Text style={styles.snsModalChangeButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.snsModalOverlay}>
          <View style={styles.snsModalContent}>
            <View style={styles.snsModalIconContainer}>
              <Ionicons name="lock-closed" size={48} color="#D9B9AB" />
            </View>
            <Text style={styles.snsModalTitle}>Change Password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password"
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder="Confirm new password"
              secureTextEntry
            />
            {passwordError ? (
              <Text style={{ color: '#900909', marginBottom: 8 }}>{passwordError}</Text>
            ) : null}
            <Pressable style={styles.snsModalOkButton} onPress={handleSavePassword}>
              <Text style={styles.snsModalOkButtonText}>Change</Text>
            </Pressable>
            <Pressable style={styles.snsModalChangeButton} onPress={() => setShowPasswordModal(false)}>
              <Text style={styles.snsModalChangeButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* SNS Modal */}
      <Modal
        visible={showSNSModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSNSModal(false)}
      >
        <View style={styles.snsModalOverlay}>
          <View style={styles.snsModalContent}>
            <View style={styles.snsModalIconContainer}>
              <Ionicons name="information-circle" size={48} color="#D9B9AB" />
            </View>
            <Text style={styles.snsModalTitle}>
              If you signed up with SNS,{'\n'}you can’t change your email
            </Text>
            <Text style={styles.snsModalText}>
              To change your email, switch your login method to email first
            </Text>
            <Pressable style={styles.snsModalOkButton} onPress={() => setShowSNSModal(false)}>
              <Text style={styles.snsModalOkButtonText}>OK</Text>
            </Pressable>
            <Pressable
              style={styles.snsModalChangeButton}
              onPress={() => {
                setShowSNSModal(false);
                router.push('/profile/changeLoginMethod');
              }}
            >
              <Text style={styles.snsModalChangeButtonText}>Change login method</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    fontSize: 80,
    color: '#222',
    textAlign: 'center',
    marginBottom: 10,
    marginRight: 0,
    marginTop: 0,
    fontWeight: 'bold',
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 18,
    marginBottom: 0,
    backgroundColor: 'rgb(236, 228, 223)',
  },
  sectionLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  loginValue: {
    fontSize: 17,
    color: '#222',
    fontWeight: '500',
    marginRight: 10,
  },
  changeButton: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgb(207, 193, 186)',
  },
  changeButtonText: {
    color: '#222',
    fontSize: 13,
    fontWeight: '500',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    fontSize: 17,
    color: '#222',
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  modalContent: {
    backgroundColor: 'rgb(206, 198, 194)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 24,
    alignItems: 'center',
    minHeight: 220,
    zIndex: 2,
  },
  modalBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
  modalEmail: {
    fontSize: 17,
    color: '#222',
    marginBottom: 24,
  },
  modalButtonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: 'rgb(188, 176, 170)',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  modalBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // SNS Modal styles
  snsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  snsModalContent: {
    backgroundColor: 'rgb(241, 232, 227)',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '88%',
    maxWidth: 400,
  },
  snsModalIconContainer: {
    backgroundColor: '#82756b',
    borderRadius: 50,
    padding: 16,
    marginBottom: 18,
  },
  snsModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgb(66, 58, 56)',
    textAlign: 'center',
    marginBottom: 10,
  },
  snsModalText: {
    fontSize: 15,
    color: ' #rgb(90, 83, 81)',
    textAlign: 'center',
    marginBottom: 24,
  },
  snsModalOkButton: {
    backgroundColor: '#6b5853',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  snsModalOkButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  snsModalChangeButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  snsModalChangeButtonText: {
    color: 'rgb(6, 59, 57)',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
});