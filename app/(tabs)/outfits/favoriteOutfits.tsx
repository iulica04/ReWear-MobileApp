import { API_BASE_URL } from '../../config';
import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, Text, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NUM_COLUMNS = 2;
const IMAGE_MARGIN = 8;
const IMAGE_WIDTH = (Dimensions.get('window').width - IMAGE_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;
const PAGE_SIZE = 10;

export default function FavoriteOutfitsScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const router = useRouter();

  const fetchFavorites = async (pageNum = 1) => {
    if ((loading && !refreshing) || (!hasMore && pageNum !== 1)) return;
    if (pageNum === 1) setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!userId || !jwtToken) return;

      const res = await fetch(`${API_BASE_URL}/api/FavoriteOutfit/outfits/user/${userId}?page=${pageNum}&pageSize=${PAGE_SIZE}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      });
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        setFavorites(prev => pageNum === 1 ? data.data : [...prev, ...data.data]);
        setHasMore(data.data.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.log('Could not load favorites.');
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchFavorites(1);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFavorites(nextPage);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchFavorites(1);
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (ids: string[]) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!userId || !jwtToken) return;

      for (const outfitId of ids) {
        await fetch(`${API_BASE_URL}/api/FavoriteOutfit/${userId}/${outfitId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
          },
        });
      }
      setFavorites(prev => prev.filter(item => !ids.includes(item.id)));
      setSelectedIds([]);
      setSelectionMode(false);
    } catch (e) {
      console.log('Could not remove favorite outfits.');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.imageContainer,
          selectionMode && isSelected && { borderColor: '#f76c5e', borderWidth: 2 },
        ]}
        onPress={() =>
          selectionMode
            ? toggleSelect(item.id)
            : router.push({ pathname: '/outfits/OutfitDetails', params: { outfit: JSON.stringify(item) } })
        }
        onLongPress={() => {
          if (!selectionMode) {
            setSelectionMode(true);
            setSelectedIds([item.id]);
          }
        }}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        {selectionMode ? (
          <View style={[styles.selectCircle, isSelected && styles.selectedCircle]}>
            {isSelected && <Ionicons name="checkmark" size={18} color="#fff" />}
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ece4df' }}>
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 60,
          left: 18,
          zIndex: 10,
          backgroundColor: 'rgba(255,255,255,0.85)',
          borderRadius: 16,
          padding: 8,
        }}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={28} color="rgb(75, 56, 49)" />
      </TouchableOpacity>
      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{ padding: IMAGE_MARGIN }}
        columnWrapperStyle={{ gap: IMAGE_MARGIN }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        extraData={selectedIds}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>My Favorites</Text>
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={20} color="#6b5853" style={{ marginRight: 6 }} />
              <Text style={styles.infoText}>
                To remove an item from favorites, long press on it to select.
              </Text>
            </View>
            {selectionMode && (
              <View style={styles.selectionBar}>
                <Text style={{ color: '#6b5853', fontSize: 16 }}>
                  {selectedIds.length} selected
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    if (selectedIds.length === 0) {
                      Alert.alert('Select at least one outfit.');
                      return;
                    }
                    Alert.alert(
                      'Remove from favorites',
                      `Are you sure you want to remove ${selectedIds.length} outfit(s) from favorites?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Remove', style: 'destructive', onPress: () => handleRemoveFavorite(selectedIds) },
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash-outline" size={22} color="#fff" />
                  <Text style={{ color: '#fff', marginLeft: 6 }}>Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setSelectionMode(false);
                    setSelectedIds([]);
                  }}
                >
                  <Text style={{ color: '#f76c5e' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loading
            ? <ActivityIndicator size="large" color="#f76c5e" style={{ marginTop: 40 }} />
            : (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ color: '#6b5853', fontSize: 16 }}>You have no favorite outfits.</Text>
              </View>
            )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 60,
    fontFamily: 'Licorice',
    color: '#6b5853',
    marginTop: 80,
    marginBottom: 16,
    alignSelf: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5edea',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  infoText: {
    color: '#6b5853',
    fontSize: 15,
    flex: 1,
    flexWrap: 'wrap',
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#ece4df',
    justifyContent: 'space-between',
    marginHorizontal:-20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f76c5e',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  imageContainer: {
    marginBottom: IMAGE_MARGIN,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#eee',
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH * 1.3,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectCircle: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#f76c5e',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  selectedCircle: {
    backgroundColor: '#f76c5e',
    borderColor: '#f76c5e',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});