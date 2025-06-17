import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';

export default function AIStylingScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.arrowContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
      </View>
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <Text style={styles.headerTitleAI}>ReStylo</Text>
        <Text style={styles.headerTitleRest}>your daily style{'        '}assistant</Text>
      </View>
      <View style={styles.imageWrapper}>
        <Image
          source={require('../../../assets/images/photo9.jpg')}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.fieldsContainer}>
        <TouchableOpacity style={styles.field} onPress={() => router.push('../AIStyling/generateOutfit')}>
          <View>
            <Text style={styles.fieldLabel}>Generate Outfit</Text>
            <Text style={styles.fieldDesc}>Generate an outfit with the help of AI</Text>
          </View>
          <MaterialIcons name="chevron-right" size={28} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.field} onPress={() => router.push('/(tabs)/aiStyling/reviewOutfit')}>
          <View>
            <Text style={styles.fieldLabel}>Analyze Outfit</Text>
            <Text style={styles.fieldDesc}>Analyze an existing outfit using AI</Text>
          </View>
          <MaterialIcons name="chevron-right" size={28} color="#888" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'hsl(23, 25.50%, 90.00%)',
    paddingHorizontal: 18,
    justifyContent: 'flex-start',
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
  headerTitleAI: {
    fontFamily: 'Licorice',
    fontSize: 70,
    color: '#222',
    textAlign: 'center',
    marginBottom: 0,
    marginTop: -30,
  },
  headerTitleRest: {
    fontFamily: 'Lora',
    fontSize: 22,
    color: '#6b5853',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: -24,
  },
  imageWrapper: {
    width: '90%',
    height: 320,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 20,
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fieldsContainer: {
    marginTop: 10,
  },
  field: {
    backgroundColor: 'rgb(236, 228, 223)',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 22,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 18,
    color: '#222',
    fontWeight: 'bold',
  },
  fieldDesc: {
    fontSize: 13,
    color: '#888', 
    marginTop: 2,
  },
});