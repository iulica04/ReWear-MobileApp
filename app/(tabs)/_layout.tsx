import { Tabs } from 'expo-router';
import { Feather, FontAwesome5, MaterialIcons , Ionicons} from '@expo/vector-icons';
import React, { useState, useLayoutEffect } from 'react';
import { useRouter, useNavigation } from 'expo-router';
import {MaterialCommunityIcons} from '@expo/vector-icons';


export default function TabLayout() {
    const router = useRouter();
    const navigation = useNavigation();

    useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'rgb(83, 67, 63)',
        tabBarInactiveTintColor: '#AA9183',
        tabBarStyle: { backgroundColor: 'rgb(236, 228, 223)',
      borderTopWidth: 0, // elimină border-ul de sus
      elevation: 0,      // pentru Android, elimină umbra
      shadowOpacity: 0,  },
      }}
    >
      <Tabs.Screen
        name="closet/closet"
        
        options={{
          title: 'Closet',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wardrobe" color={color} size={28} />
          ),
        }}
      />


      <Tabs.Screen
        name="add"
        
        options={{
          title: 'Add',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" color={color} size={30} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile/personalInformation"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/changeLoginMethod"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/profileSettings"
        options={{
          href: null,
        }}
      />
      
      <Tabs.Screen
        name="closet/addClothes"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="eco"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="aiStyling/reviewOutfit"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="closet/addOutfits"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="outfits"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="addItems"
        options={{
          title: 'Add Items',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" color={color} size={30} />
          ),
        }}
      />

      <Tabs.Screen
        name="aiStyling"
        options={{
          title: 'AI Stylist',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="robot" color={color} size={28} />
          ),
        }}
      />
 

        <Tabs.Screen
        name="profile"
        
        options={{
          title: ' My Profile',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user-alt" color={color} size={22} />
          ),
        }}
      />

    </Tabs>
  );
}