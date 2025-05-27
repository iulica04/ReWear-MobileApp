import { API_BASE_URL } from '../../config';
import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

type MenuItemProps = {
  icon: string;
  label: string;
  color?: string;
  iconLib?: 'Feather' | 'MaterialIcons' | 'FontAwesome5';
  onPress?: () => void;
};

type UserDetails = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  profilePicture?: string | null;
};

export default function ProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [user, setUser] = useState<UserDetails | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
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
    }, [])
  );

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!user) return;

    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? All your data will be lost.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const jwtToken = await AsyncStorage.getItem('jwtToken');
              if (!jwtToken) return;

              const response = await fetch(`${API_BASE_URL}/api/Users/${user.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${jwtToken}`,
                },
              });

              if (response.ok) {
                Alert.alert('Account deleted', 'Your account has been deleted.');
                await AsyncStorage.removeItem('userId');
                await AsyncStorage.removeItem('jwtToken');
                router.replace('/');
              } else {
                Alert.alert('Error', 'Failed to delete account.');
              }
            } catch (err) {
              Alert.alert('Error', 'Something went wrong.');
            }
          },
        },
      ]
    );
  };

  // Handle logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('jwtToken');
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <View style={{ width: 28 }} />
      </View>

      {/* Content: Profile Info centered, Menu at bottom */}
      <View style={styles.content}>
        <View style={styles.profileInfo}>
          <Image
            source={
              user?.profilePicture
                ? { uri: user.profilePicture }
                : require('../../../assets/images/defaultProfilePicture.png')
            }
            style={styles.avatar}
          />
          <Text style={styles.name}>
            {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
          </Text>
          <Text style={styles.username}>{user?.email || ''}</Text>
        </View>

        <View style={styles.menuWrapper}>
          <View style={styles.menu}>
            <MenuItem
              icon="person"
              iconLib="MaterialIcons"
              label="Personal Information"
              onPress={() => router.push('/profile/personalInformation')}
            />
            <MenuItem
              icon="manage-accounts"
              iconLib="MaterialIcons"
              label="Profile Settings"
              onPress={() => router.push('/profile/profileSettings')}
            />
            <MenuItem
              icon="support-agent"
              iconLib="MaterialIcons"
              label="Contact"
            />
            <MenuItem
              icon="delete"
              iconLib="MaterialIcons"
              label="Delete Account"
              color="#e74c3c"
              onPress={handleDeleteAccount}
            />
            <MenuItem
              icon="logout"
              iconLib="MaterialIcons"
              label="Log out"
              color="#e74c3c"
              onPress={handleLogout}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function MenuItem({ icon, label, color = "#222", iconLib = "MaterialIcons", onPress }: MenuItemProps) {
  let IconComponent: any = MaterialIcons;
  if (iconLib === "Feather") IconComponent = Feather;
  if (iconLib === "FontAwesome5") IconComponent = FontAwesome5;

  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <IconComponent name={icon as any} size={26} color={color} style={{ width: 28 }} />
      <Text style={[styles.menuLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(236, 228, 223)',
  },
  header: {
    marginTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  profileInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 99,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  username: {
    fontSize: 15,
    color: '#888',
    marginBottom: 10,
  },
  menuWrapper: {
    justifyContent: 'flex-end',
  },
  menu: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    backgroundColor: 'rgb(236, 228, 223)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgb(199, 177, 172)',
  },
  menuLabel: {
    fontSize: 16,
    marginLeft: 10,
  },
});