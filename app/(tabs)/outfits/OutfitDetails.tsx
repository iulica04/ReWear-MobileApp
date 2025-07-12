import { API_BASE_URL } from '../../config';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Animated, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PAGE_SIZE = 10;
const IMAGE_MARGIN = 8;
const IMAGE_WIDTH = (Dimensions.get('window').width - IMAGE_MARGIN * 3) / 2;

export default function OutfitDetails() {
  const { outfit } = useLocalSearchParams<{ outfit?: string }>();
  const router = useRouter();

  let parsedOutfit: any;
  try {
    parsedOutfit = typeof outfit === 'string' ? JSON.parse(outfit) : outfit;
  } catch {
    parsedOutfit = null;
  }

  if (!parsedOutfit || !parsedOutfit.id) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Outfit not found.</Text>
      </View>
    );
  }

  const [similar, setSimilar] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Pentru animatie fade
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const fetchSimilar = async (pageNum = 1) => {
    if (!hasMore) return;
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      const url = `${API_BASE_URL}/api/Outfit/similar?Id=${parsedOutfit.id}&Page=${pageNum}&PageSize=${PAGE_SIZE}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'
          , Authorization: `Bearer ${jwtToken}`  // Include JWT token for authentication
         },
      });
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        setSimilar(prev => pageNum === 1 ? data.data : [...prev, ...data.data]);
        setHasMore(data.data.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      setHasMore(false);
    }
  };

  // Favorite logic
  const handleFavorite = async (outfitId: string) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!userId || !jwtToken) return;

      const response = await fetch(`${API_BASE_URL}/api/FavoriteOutfit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          userId,
          outfitId,
        }),
      });

      if (response.status === 400) {
        const text = await response.text();
        if (text.includes('already added')) {
          Alert.alert('Info', 'Outfit-ul este deja la favorite.');
        } else {
          Alert.alert('Eroare', text);
        }
        return;
      }

      if (!response.ok) {
        Alert.alert('Eroare', 'A apărut o eroare la adăugarea la favorite.');
        return;
      }

      setFavoriteIds(prev => [...prev, outfitId]);
    } catch (e) {
      Alert.alert('Eroare', 'A apărut o eroare la adăugarea la favorite.');
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchSimilar(1);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setFavoriteIds([]); // Resetăm favoritele la schimbarea outfitului
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedOutfit.id]);

  const loadMore = () => {
    if (hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSimilar(nextPage);
    }
  };

  const handleSimilarPress = (item: any) => {
    setLoading(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      router.replace({
        pathname: '/outfits/OutfitDetails',
        params: { outfit: JSON.stringify(item) },
      });
      setTimeout(() => setLoading(false), 500); // fallback pentru loader
    });
  };

  return (
    <View style={{ backgroundColor: '#ece4df', flex: 1 }}>
      <TouchableOpacity
        style={styles.fixedBackButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={28} color="rgb(75, 56, 49)" />
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#f76c5e" />
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            ListHeaderComponent={
              <>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: parsedOutfit.imageUrl }} style={styles.mainImage} />
                </View>
                <Text style={styles.desc}>{parsedOutfit.description}</Text>
                <Text style={styles.similarTitle}>Similar outfits</Text>
              </>
            }
            data={similar}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const isFavorite = favoriteIds.includes(item.id);
              return (
                <View>
                  <TouchableOpacity
                    onPress={() => handleSimilarPress(item)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: item.imageUrl }} style={styles.similarImage} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.heartContainer}
                    onPress={async e => {
                      e.stopPropagation();
                      if (!isFavorite) await handleFavorite(item.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color="#f76c5e" />
                  </TouchableOpacity>
                </View>
              );
            }}
            numColumns={2}
            contentContainerStyle={{ padding: IMAGE_MARGIN }}
            columnWrapperStyle={{ gap: IMAGE_MARGIN }}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fixedBackButton: {
    position: 'absolute',
    top: 60,
    left: 18,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    padding: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginTop: 47,
    marginHorizontal: 4,
    borderRadius: 18,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 8,
  },
  mainImage: {
    width: '100%',
    height: 500,
    resizeMode: 'cover',
    backgroundColor: '#eee',
  },
  desc: {
    fontSize: 16,
    color: '#444',
    margin: 16,
    marginBottom: 0,
  },
  similarTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    margin: 16,
    marginBottom: 8,
    color: '#6b5853',
  },
  similarImage: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH * 1.3,
    borderRadius: 16,
    marginBottom: IMAGE_MARGIN,
    backgroundColor: '#eee',
  },
  heartContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 8,
    padding: 4,
    zIndex: 2,
    marginBottom:8,
  },
});