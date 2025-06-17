import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { API_BASE_URL } from '../../config';

export default function ReviewOutfitScreen() {
  const navigation = useNavigation();
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [userContext, setUserContext] = useState<string>('');

  // Reset state every time the page is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setImage(null);
      setImageBase64(null);
      setReview(null);
      setLoading(false);
      setLocation(null);
      setUserContext('');
    });
    return unsubscribe;
  }, [navigation]);

  // Pick image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets[0].base64) {
      setImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets[0].base64) {
      setImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
    }
  };

  // Get current location
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required for outfit review.');
      return null;
    }
    let loc = await Location.getCurrentPositionAsync({});
    return {
      lat: loc.coords.latitude,
      lon: loc.coords.longitude,
    };
  };

  // Send image and location to API
  const handleReview = async () => {
    if (!imageBase64) {
      Alert.alert('No image', 'Please upload an outfit photo first.');
      return;
    }
    setLoading(true);
    let loc = location;
    if (!loc) {
      loc = await getLocation();
      if (!loc) {
        setLoading(false);
        return;
      }
      setLocation(loc);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/Outfit/review-outfit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lon: String(loc.lon),
          lat: String(loc.lat),
          image: imageBase64,
          userContext: userContext.trim(),
        }),
      });
      const data = await res.json();
      setReview(data);
    } catch (e) {
      setReview({ error: 'Sorry, something went wrong. Please try again.' });
    }
    setLoading(false);
  };

  // Helper to render the review in a structured way
  const renderReview = () => {
    if (!review) {
      return (
        <Text style={[styles.chatText, { color: '#bbb' }]}>
          Your review will appear here after you upload a photo and request feedback.
        </Text>
      );
    }
    if (review.error) {
      return <Text style={[styles.chatText, { color: '#c0392b' }]}>{review.error}</Text>;
    }
    // If review is a string, just show it
    if (typeof review === 'string') {
      try {
        const parsed = JSON.parse(review);
        return renderParsedReview(parsed);
      } catch {
        return <Text style={styles.chatText}>{review}</Text>;
      }
    }
    // If review is an object
    return renderParsedReview(review);
  };

  const renderParsedReview = (parsed: any) => (
    <>
      {parsed.review && (
        <>
          <Text style={{ fontWeight: 'bold', color: '#6b5853', marginBottom: 2 }}>Review:</Text>
          <Text style={styles.chatText}>{parsed.review}</Text>
        </>
      )}
      {parsed.suggestions && (
        <>
          <Text style={{ fontWeight: 'bold', color: '#6b5853', marginTop: 10, marginBottom: 2 }}>Suggestions:</Text>
          <Text style={styles.chatText}>{parsed.suggestions}</Text>
        </>
      )}
      {parsed.overallAdvice && (
        <>
          <Text style={{ fontWeight: 'bold', color: '#6b5853', marginTop: 10, marginBottom: 2 }}>Overall Advice:</Text>
          <Text style={styles.chatText}>{parsed.overallAdvice}</Text>
        </>
      )}
      {!parsed.review && !parsed.suggestions && !parsed.overallAdvice && (
        <Text style={styles.chatText}>{JSON.stringify(parsed)}</Text>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.arrowContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#222" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Outfit AI Review</Text>
        <Text style={styles.headerSubtitle}>Get instant feedback on your look</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Upload section */}
          <View style={styles.uploadBox}>
            <Text style={styles.uploadTitle}>Upload your outfit photo</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
              <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                <Ionicons name="image-outline" size={22} color="#6b5853" style={{ marginRight: 6 }} />
                <Text style={styles.uploadBtnText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadBtn} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={22} color="#6b5853" style={{ marginRight: 6 }} />
                <Text style={styles.uploadBtnText}>Camera</Text>
              </TouchableOpacity>
            </View>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Ionicons name="shirt-outline" size={48} color="#bbb" />
                <Text style={{ color: '#bbb', marginTop: 8 }}>No photo selected</Text>
              </View>
            )}
            {/* User context input */}
            <Text style={{ color: '#6b5853', fontWeight: 'bold', marginTop: 18, marginBottom: 4, alignSelf: 'flex-start' }}>
              Where do you want to wear it? (optional)
            </Text>
            <TextInput
              style={styles.contextInput}
              placeholder="Ex: At a wedding, at the office, casual walk, etc. Add any details for AI..."
              placeholderTextColor="#bdbdbd"
              value={userContext}
              onChangeText={setUserContext}
              multiline
              numberOfLines={2}
              maxLength={200}
            />
          </View>

          {/* Review button */}
          <TouchableOpacity
            style={[styles.reviewBtn, (!imageBase64 || loading) && { opacity: 0.6 }]}
            onPress={handleReview}
            disabled={!imageBase64 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="chatbubbles-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.reviewBtnText}>Get AI Review</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Chat/review area */}
          <View style={styles.chatBox}>
            <Text style={styles.chatTitle}>AI Feedback</Text>
            {renderReview()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(236, 228, 223)',
  },
  headerWrapper: {
    backgroundColor: 'rgb(236, 228, 223)',
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 0,
    zIndex: 10,
  },
  arrowContainer: {
    marginTop: 10,
    marginLeft: 0,
    marginBottom: 0,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: 'Licorice',
    fontSize: 45,
    color: '#6b5853',
    textAlign: 'center',
    marginBottom: 0,
    marginTop: -10,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#8c916C',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '500',
    fontFamily: 'Lora',
    letterSpacing: 1,
    marginTop: -10,
    marginRight: 10,
  },
  scrollContent: {
    paddingBottom: 30,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 0,
  },
  uploadBox: {
    backgroundColor: '#f8f4f1',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 6,
    marginBottom: 18,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 16,
    color: '#6b5853',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ece4df',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
  },
  uploadBtnText: {
    color: '#6b5853',
    fontWeight: 'bold',
    fontSize: 15,
  },
  previewImage: {
    width: 180,
    height: 220,
    borderRadius: 12,
    marginTop: 18,
    resizeMode: 'cover',
  },
  previewPlaceholder: {
    width: 180,
    height: 220,
    borderRadius: 12,
    marginTop: 18,
    backgroundColor: '#ece4df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextInput: {
    width: '100%',
    minHeight: 44,
    borderRadius: 8,
    borderColor: '#ece4df',
    borderWidth: 1,
    backgroundColor: '#fff',
    color: '#6b5853',
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6b5853',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignSelf: 'center',
    marginBottom: 18,
    marginTop: 0,
  },
  reviewBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  chatBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    width: '100%',
    minHeight: 120,
    marginBottom: 18,
    marginTop: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  chatTitle: {
    fontWeight: 'bold',
    color: '#6b5853',
    fontSize: 16,
    marginBottom: 8,
  },
  chatText: {
    color: '#444',
    fontSize: 15,
    textAlign: 'left',
  },
});