import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';

export default function EcoImpactScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.arrowContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
      </View>
      <Text style={styles.headerTitle}>Eco Impact</Text>
      <View style={styles.imageWrapper}>
        <Image
          source={require('../../../assets/images/ecoCloset.jpg')}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.fieldsContainer}>
        <TouchableOpacity style={styles.field} onPress={() => router.push('../eco/sustainableTips')}>
          <View >
            <Text style={styles.fieldLabel}>Sustainable Tips</Text>
            <Text style={styles.fieldDesc}>Learn how to care for your clothes sustainably</Text>
          </View>
          <MaterialIcons name="chevron-right" size={28} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.field} onPress={() => router.push('../eco/sellClothes')}>
          <View>
            <Text style={styles.fieldLabel}>Sell Clothes</Text>
            <Text style={styles.fieldDesc}>Give your clothes a second life by selling them</Text>
          </View>
          <MaterialIcons name="chevron-right" size={28} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.field} onPress={() => router.push('../eco/impactRaport')}>
          <View>
            <Text style={styles.fieldLabel}>Impact Report</Text>
            <Text style={styles.fieldDesc}>See how your closet affects the environment</Text>
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
    backgroundColor: 'rgb(236, 228, 223)',
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
  headerTitle: {
    fontFamily: 'Licorice',
    fontSize: 60,
    color: '#222',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
    marginTop: -30,
  },
  imageWrapper: {
    width: '90%',
    height: 300,
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
    color: '#595c44',
    fontWeight: 'bold',
  },
  fieldDesc: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
});