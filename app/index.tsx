import React, { useLayoutEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter, useNavigation } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  // Ascunde header-ul implicit
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Image source={require('../assets/images/logo3.png')} style={[styles.logo, isLargeScreen && styles.logoLarge]} />
      </View>

      {/* Content */}
      <View style={[styles.content, isLargeScreen && styles.contentRow]}>
        {/* Image Left + Heading/Subtitle */}
        <View style={[styles.imageContainer, isLargeScreen && styles.imageContainerRow]}>
          <Text style={styles.mainHeading}>Old clothes, new stories</Text>
          <Text style={styles.subHeading}>
            <Text style={styles.accentDark}>repurpose</Text>,{' '}
            <Text style={styles.accentWarm}>renew</Text>, and embrace{' '}
            <Text style={styles.accentcream600}>sustainable fashion</Text>
          </Text>
          <Image source={require('../assets/images/photo6.jpeg')} style={styles.featureImage} />
        </View>
        {/* Text Right */}
        <View style={[styles.textContainer, isLargeScreen && styles.textContainerRow]}>
          <Text style={styles.description}>
            With ReWear, organize your wardrobe in a personalized digital space, plan outfits, and find new ways to rewear what you own. Reinvent your style, stay inspired, and make fashion more sustainable —
            <Text style={styles.italic}> in your way</Text>
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
              <Text style={styles.buttonText}>Step into Rewear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efebe2', // --color-lightBeige-400,
  },
  navbar: {
    marginTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  logo: {
    height: 100,
    width: 150,
    resizeMode: 'contain',
    marginRight: 16,

  },
  logoLarge: {
    height: 100,
    width: 80,
  },
  homeTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '600',
    color: '#3c2a21', // --color-darkBrown-600
    fontFamily: 'Helvetica Neue',
    marginRight: 60, // rezervă spațiu pentru logo, ca să fie centrat vizual
  },
  content: {
    marginTop: 10,
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 30,
    marginTop: 10,
  },
  imageContainer: {
    width: '100%',
    maxWidth: 500,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  imageContainerRow: {
    width: '50%',
    marginBottom: 0,
    alignItems: 'flex-start',
  },
  featureImage: {
    width: '90%',
    height: 280,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 0,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
    textAlign: 'center',
    justifyContent: 'center',
  },
  textContainerRow: {
    width: '50%',
    alignItems: 'flex-start',
    paddingLeft: 32,
    textAlign: 'left',
    justifyContent: 'flex-start',
  },
  mainHeading: {
    fontSize: 50,
    color: '#3c2a21', // --color-darkBrown-600
    fontWeight: '500',
    fontFamily: 'Licorice',
    marginBottom: 0,
    lineHeight: 100,
    marginTop: 0,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 20,
    color: '#3c2a21', // --color-darkBrown-600
    marginTop: -40,
    fontWeight: '300',
    marginBottom: 32,
    paddingLeft: 8,
    textAlign: 'center',
  },
  accentDark: {
    color: '#795548', // --color-brown-600
  },
  accentWarm: {
    color: '#d2b48c', // --color-warmTan-500
  },
  accentcream600: {
    color: '#c6ada0', // --color-cream-600
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 24,
  },
  italic: {
    fontStyle: 'italic',
    paddingLeft: 8,
  },
  buttonContainer: {
    marginTop: 10,
    alignItems: 'flex-start',
    width: '100%',
  },
  button: {
    backgroundColor: '#795548', // --color-brown-600
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 9999,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
});