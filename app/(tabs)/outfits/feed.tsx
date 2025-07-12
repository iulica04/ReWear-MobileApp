import { API_BASE_URL } from '../../config';
import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, Modal, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const PAGE_SIZE = 15;
const NUM_COLUMNS = 2;
const IMAGE_MARGIN = 8;
const IMAGE_WIDTH = (Dimensions.get('window').width - IMAGE_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export default function FeedScreen() {
  const [outfits, setOutfits] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch userId o singură dată
  useEffect(() => {
    AsyncStorage.getItem('userId').then(setUserId);
  }, []);

  const fetchOutfits = useCallback(async (pageNum = 1) => {
    setLoading(true);
    const jwtToken = await AsyncStorage.getItem('jwtToken');
    try {
      const res = await fetch(`${API_BASE_URL}/api/Outfit/paginated?page=${pageNum}&pageSize=${PAGE_SIZE}`,{
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      });
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        data.data.sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setOutfits(prev => pageNum === 1 ? data.data : [...prev, ...data.data]);
        setHasMore(data.data.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    }
    setLoading(false);
  }, []);

  const fetchFavoriteIds = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!userId || !jwtToken) return;
      const res = await fetch(`${API_BASE_URL}/api/FavoriteOutfit/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setFavoriteIds(data.map((fav: any) => fav.outfitId));
      }
    } catch {}
  }, []);

  // Reload data every time the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setPage(1);
      fetchOutfits(1);
      fetchFavoriteIds();
    }, [fetchOutfits, fetchFavoriteIds])
  );

  useEffect(() => {
    fetchOutfits(1);
    fetchFavoriteIds();
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchOutfits(nextPage);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchOutfits(1);
    await fetchFavoriteIds();
    setRefreshing(false);
  };

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
          // Already favorite, do nothing
        } else {
          // Error, do nothing
        }
        return;
      }

      if (!response.ok) {
        return;
      }

      setFavoriteIds(prev => [...prev, outfitId]);
    } catch (e) {}
  };

  const handleUnfavorite = async (outfitId: string) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!userId || !jwtToken) return;

      const response = await fetch(`${API_BASE_URL}/api/FavoriteOutfit/${userId}/${outfitId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      });

      if (!response.ok) {
        return;
      }

      setFavoriteIds(prev => prev.filter(id => id !== outfitId));
    } catch (e) {}
  };

  // Fără butonul de ștergere!
  const renderItem = ({ item }: { item: any }) => {
    const isFavorite = favoriteIds.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => router.push({ pathname: '/outfits/OutfitDetails', params: { outfit: JSON.stringify(item) } })}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <TouchableOpacity
          style={styles.heartContainer}
          onPress={async e => {
            e.stopPropagation();
            if (!isFavorite) {
              await handleFavorite(item.id);
            } else {
              await handleUnfavorite(item.id);
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color="#6b5853" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ece4df' }}>
      <FlatList
        data={outfits}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{ padding: IMAGE_MARGIN }}
        columnWrapperStyle={{ gap: IMAGE_MARGIN }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton}
               onPress={() => router.push('/outfits/favoriteOutfits')}>
              <FontAwesome name="heart-o" size={24} color="#6b5853" />
            </TouchableOpacity>
            <View style={styles.logoHeaderContainer}>
              <Image source={require('../../../assets/images/logo4.png')} style={styles.logoHeader} />
            </View>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowHelp(true)}
            >
              <Ionicons name="help-circle-outline" size={29} color="#6b5853" />
            </TouchableOpacity>
          </View>
        }
      />
      <Modal
        visible={showHelp}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHelp(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How to use the feed</Text>
            <View style={styles.modalDivider} />
            <Text style={styles.modalText}>• Tap the <Ionicons name="heart-outline" size={16} color="#f76c5e" /> to add or remove an outfit from your favorites.</Text>
            <Text style={styles.modalText}>• Tap on a photo to see more details about that outfit.</Text>
            <Text style={styles.modalText}>• Pull down to refresh the list.</Text>
            <Text style={styles.modalText}>• Tap the <FontAwesome name="heart-o" size={16} color="#f76c5e" /> icon in the header to view all your favorites.</Text>
            <Pressable style={styles.modalButton} onPress={() => setShowHelp(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  logoHeaderContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoHeader: {
    width: 180,
    height: 60,
    resizeMode: 'contain',
  },
  iconButton: {
    padding: 8,
  },
  imageContainer: {
    marginBottom: IMAGE_MARGIN,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#eee',
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH * 1.3,
    position: 'relative',
  },
  heartContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 8,
    padding: 4,
    zIndex: 2,
  },
  // deleteButton: { ... } // Poți șterge acest stil dacă nu-l mai folosești
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    width: '85%',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6b5853',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#ece4df',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: '#6b5853',
    marginBottom: 10,
    textAlign: 'left',
    width: '100%',
  },
  modalButton: {
    marginTop: 18,
    backgroundColor: '#6b5853',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});