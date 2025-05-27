import { API_BASE_URL } from '../../config';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Modal, Pressable, TextInput, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

type UserDetails = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password?: string;
  role?: string;
  loginProvider?: string;
  profilePicture?: string;
};

export default function ProfileSettingsScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [showConfirmPasswordModal, setShowConfirmPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);

  // Pentru poza de profil
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Pentru validare username unic
  const [usernameError, setUsernameError] = useState<string>('');

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    fetchUserDetails();
  }, []);

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

  // Validare continuă pentru username (debounce la fiecare tastă)
  useEffect(() => {
  let timeout: ReturnType<typeof setTimeout>;
  if (!showUsernameModal || !editUsername) {
    setUsernameError('');
    return;
  }
  timeout = setTimeout(async () => {
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(
        `${API_BASE_URL}/api/Users/check-existence/${encodeURIComponent(editUsername)}`,
        {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
          },
        }
      );
      if (response.status === 200) {
        setUsernameError('Username is already taken.');
      } else if (response.status === 404) {
        setUsernameError('');
      } else {
        setUsernameError('Could not verify username.');
      }
    } catch {
      setUsernameError('Could not verify username.');
    }
  }, 400);
  return () => clearTimeout(timeout);
}, [editUsername, showUsernameModal]);

  // Deschide modal pentru editare username
  const openUsernameModal = () => {
  setEditUsername('');
  setShowUsernameModal(true);
  setUsernameError('');
};

  // Pasul 1: Doar continuă dacă nu există eroare
  const handleSaveUsernameStep1 = () => {
    if (usernameError) return;
    setShowUsernameModal(false);
    setPendingUsername(editUsername);
    setConfirmPassword('');
    setConfirmPasswordError('');
    setShowConfirmPasswordModal(true);
  };

  // Pasul 2: Introduci parola și faci update
  const handleSaveUsernameStep2 = async () => {
    if (!user || !pendingUsername) return;
    if (!confirmPassword) {
      setConfirmPasswordError('Please enter your password.');
      return;
    }
    const updatedUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      userName: pendingUsername,
      email: user.email,
      password: confirmPassword,
      role: user.role || 'User',
      loginProvider: user.loginProvider || '',
      id: user.id,
      profilePicture: user.profilePicture || '',
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
        setPendingUsername(null);
        Alert.alert('Success', 'Username updated!');
      } else {
        const errorResponse = await response.json();
        setConfirmPasswordError(errorResponse?.message || 'Could not update. Try again.');
      }
    } catch (err) {
      setConfirmPasswordError('Could not update. Try again.');
    }
  };

  // Selectează poza de profil și deschide preview modal
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'You need to allow access to your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPreviewImage(uri);
      setShowPreviewModal(true);
    }
  };

  // Upload imagine la backend și refă fetch la user pentru a afișa poza nouă
  const uploadProfilePicture = async () => {
    if (!user || !previewImage) return;
    setUploading(true);
    try {
      // Citește imaginea ca base64
      const response = await fetch(previewImage);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(',')[1];
        if (!base64data) {
          setUploading(false);
          Alert.alert('Error', 'Could not read image data.');
          return;
        }
        const formData = new FormData();
        formData.append('UserId', user.id);
        formData.append('ProfilePicture', base64data);

        const jwtToken = await AsyncStorage.getItem('jwtToken');
        const uploadResponse = await fetch(`${API_BASE_URL}/api/Users/upload-profile-picture`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
          },
          body: formData,
        });

        if (uploadResponse.ok) {
          setShowPreviewModal(false);
          await fetchUserDetails();
          setUploading(false);
          setPreviewImage(null);
        } else {
          setUploading(false);
          Alert.alert('Error', 'Could not upload image.');
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setUploading(false);
      Alert.alert('Error', 'Could not upload image.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.arrowContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
      </View>
      <Text style={styles.headerTitle}>Profile Settings</Text>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                user?.profilePicture
                  ? { uri: user.profilePicture }
                  : require('../../../assets/images/defaultProfilePicture.png')
              }
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton} onPress={pickImage}>
              <Ionicons name="pencil" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          {/* Username ca în personalInformation.tsx */}
          <TouchableOpacity style={styles.section} onPress={openUsernameModal}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.sectionLabel}>Username</Text>
                <Text style={styles.value}>{user?.userName || ''}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#888" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal preview pentru poza de profil */}
      <Modal
        visible={showPreviewModal}
        animationType="fade"
        transparent
        onRequestClose={() => {
          if (!uploading) {
            setShowPreviewModal(false);
            setPreviewImage(null);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Preview Profile Picture</Text>
            {previewImage && (
              <Image source={{ uri: previewImage }} style={styles.avatar} />
            )}
            <Text style={{ marginVertical: 10, color: '#444', textAlign: 'center' }}>
              This is how your new profile picture will look. 
            </Text>
            {uploading ? (
              <ActivityIndicator size="large" color="#6b5853" style={{ marginVertical: 10 }} />
            ) : (
              <>
                <Pressable style={styles.modalOkButton} onPress={uploadProfilePicture}>
                  <Text style={styles.modalOkButtonText}>Set as Profile Picture</Text>
                </Pressable>
                <Pressable
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowPreviewModal(false);
                    setPreviewImage(null);
                  }}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Username Edit Modal */}
      <Modal
        visible={showUsernameModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowUsernameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="person-circle" size={48} color="#D9B9AB" style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Change Username</Text>
            <TextInput
              style={styles.input}
              value={editUsername}
              onChangeText={setEditUsername}
              placeholder="Enter new username"
              autoFocus
            />
            {usernameError ? (
              <Text style={{ color: '#900909', marginBottom: 8 }}>{usernameError}</Text>
            ) : null}
            <Pressable
              style={[styles.modalOkButton, usernameError ? { opacity: 0.5 } : {}]}
              onPress={handleSaveUsernameStep1}
              disabled={!!usernameError}
            >
              <Text style={styles.modalOkButtonText}>Continue</Text>
            </Pressable>
            <Pressable style={styles.modalCancelButton} onPress={() => setShowUsernameModal(false)}>
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Confirm Password Modal */}
      <Modal
        visible={showConfirmPasswordModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowConfirmPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="lock-closed" size={48} color="#D9B9AB" style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Enter your password to confirm</Text>
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
            <Pressable style={styles.modalOkButton} onPress={handleSaveUsernameStep2}>
              <Text style={styles.modalOkButtonText}>Update</Text>
            </Pressable>
            <Pressable style={styles.modalCancelButton} onPress={() => setShowConfirmPasswordModal(false)}>
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
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
    fontSize: 60,
    color: '#222',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 18,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0d6d0',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6b5853',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 18,
    marginBottom: 0,
    backgroundColor: 'rgb(236, 228, 223)',
    width: 320,
    alignSelf: 'center',
  },
  sectionLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
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
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgb(241, 232, 227)',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '88%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgb(66, 58, 56)',
    textAlign: 'center',
    marginBottom: 10,
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
  modalOkButton: {
    backgroundColor: '#6b5853',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  modalOkButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  modalCancelButtonText: {
    color: 'rgb(6, 59, 57)',
    fontWeight: 'bold',
    fontSize: 16,
  },
});