import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, Linking, Dimensions, Image, Modal, Pressable, Clipboard, ToastAndroid, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

const ITEM_MARGIN = 10;
const CARD_HEIGHT = 280;
const ITEM_WIDTH = (Dimensions.get('window').width - ITEM_MARGIN * 3) / 2;

interface ClothingItem {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  lastWornDate?: string;
  frontImageUrl?: string;
  numberOfWears?: number;
  description?: string;
}

function copyToClipboard(text: string) {
  if (Platform.OS === 'web') {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  } else {
    Clipboard.setString(text);
    ToastAndroid.show('Copied!', ToastAndroid.SHORT);
  }
}

function CardModal({
  visible,
  onClose,
  description,
  imageUrl,
}: {
  visible: boolean;
  onClose: () => void;
  description: string;
  imageUrl?: string;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!imageUrl) return;
    if (!FileSystem.cacheDirectory) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Cache directory unavailable', ToastAndroid.SHORT);
      } else {
        alert('Cache directory unavailable');
      }
      return;
    }
    try {
      setDownloading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Permission denied', ToastAndroid.SHORT);
        } else {
          alert('Permission denied');
        }
        setDownloading(false);
        return;
      }
      const fileUri = FileSystem.cacheDirectory + imageUrl.split('/').pop();
      const downloadResumable = FileSystem.createDownloadResumable(imageUrl, fileUri);
      const downloadResult = await downloadResumable.downloadAsync();
      const uri = downloadResult?.uri ?? fileUri;
      await MediaLibrary.saveToLibraryAsync(uri);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Image saved to gallery!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', 'Image saved to gallery!');
      }
    } catch (e) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Download failed', ToastAndroid.SHORT);
      } else {
        alert('Download failed');
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.descModalContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={styles.modalTitle}>Description</Text>
            <Pressable style={{ marginLeft: 'auto' }} onPress={onClose}>
              <Ionicons name="close" size={28} color="#6b5853" />
            </Pressable>
          </View>
          <Text style={{ color: '#444', fontSize: 15, marginBottom: 18, textAlign: 'justify' }}>
            {description}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ece4df',
                borderRadius: 8,
                paddingVertical: 8,
                paddingHorizontal: 18,
                marginRight: 8,
              }}
              onPress={() => copyToClipboard(description)}
            >
              <Ionicons name="copy-outline" size={18} color="#6b5853" style={{ marginRight: 6 }} />
              <Text style={{ color: '#6b5853', fontWeight: 'bold' }}>Copy</Text>
            </TouchableOpacity>
            {imageUrl ? (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#ece4df',
                  borderRadius: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 18,
                  opacity: downloading ? 0.6 : 1,
                }}
                onPress={handleDownload}
                disabled={downloading}
              >
                <Ionicons name="download-outline" size={18} color="#6b5853" style={{ marginRight: 6 }} />
                <Text style={{ color: '#6b5853', fontWeight: 'bold' }}>
                  {downloading ? 'Downloading...' : 'Download'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Card({ item }: { item: ClothingItem }) {
  const [modalVisible, setModalVisible] = useState(false);

  // Compose description for front
  const frontDescription = [
    item.brand ? `Brand: ${item.brand}` : null,
    item.category ? `Category: ${item.category}` : null,
    item.lastWornDate ? `Last worn: ${item.lastWornDate}` : 'Never worn',
    `Number of wears: ${item.numberOfWears ?? 0}`,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setModalVisible(true)}
        style={{ width: ITEM_WIDTH, height: CARD_HEIGHT, marginBottom: ITEM_MARGIN }}
      >
        <View style={[styles.itemBox, { width: ITEM_WIDTH, height: CARD_HEIGHT }]}>
          {item.frontImageUrl ? (
            <Image source={{ uri: item.frontImageUrl }} style={styles.itemImage} />
          ) : (
            <View style={[styles.itemImage, { backgroundColor: '#ece4df', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="shirt-outline" size={36} color="#bdbdbd" />
            </View>
          )}
          <View style={{ padding: 8 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.brand ? <Text style={styles.itemDesc}>Brand: {item.brand}</Text> : null}
            {item.category ? <Text style={styles.itemDesc}>Category: {item.category}</Text> : null}
            <Text style={styles.itemDesc}>{item.lastWornDate ? `Last worn: ${item.lastWornDate}` : 'Never worn'}</Text>
            <Text style={styles.itemDesc}>Number of wears: {item.numberOfWears ?? 0}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <CardModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        description={item.description || 'No description available.'}
        imageUrl={item.frontImageUrl}
      />
    </>
  );
}

export default function SellClothesScreen() {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const uid = await AsyncStorage.getItem('userId');
      const jwt = await AsyncStorage.getItem('jwtToken');
      setUserId(uid);
      setJwtToken(jwt);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId || !jwtToken) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/ClothingItem/available-for-sale?userId=${userId}`, {
      headers: { Authorization: `Bearer ${jwtToken}` }
    })
      .then(res => res.json())
      .then(data => setClothes(data))
      .catch(() => setClothes([]))
      .finally(() => setLoading(false));
  }, [userId, jwtToken]);

  const openVinted = () => {
    Linking.openURL('https://www.vinted.com/');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Modal pentru ghid */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={styles.modalTitle}>How to sell on Vinted</Text>
              <Pressable style={{ marginLeft: 'auto' }} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#6b5853" />
              </Pressable>
            </View>
            <View style={styles.guideBox}>
              <Text style={styles.guideStep}>1. Create a Vinted account or log in.</Text>
              <Text style={styles.guideStep}>2. Take clear photos of your item (front, back, label, and any flaws).</Text>
              <Text style={styles.guideStep}>3. Add a detailed description: brand, size, condition, and any special details.</Text>
              <Text style={styles.guideStep}>4. Set a fair price based on condition and brand.</Text>
              <Text style={styles.guideStep}>5. Choose shipping options and publish your listing.</Text>
              <Text style={styles.guideStep}>6. Respond quickly to messages and ship promptly after a sale.</Text>
            </View>
            <TouchableOpacity style={styles.vintedBtn} onPress={openVinted}>
              <Ionicons name="open-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.vintedBtnText}>Go to Vinted</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FlatList
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={28} color="#6b5853" />
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
            </View>
            <Text style={styles.headerTitle}>Sell Your Unworn Clothes</Text>
            <Text style={styles.introText}>
              Here are the clothes you haven't worn in the last 6 months. Give them a <Text style={{ fontWeight: 'bold' }}>second life</Text> by selling them on <Text style={{ fontWeight: 'bold' }}>Vinted</Text>!
            </Text>
            <TouchableOpacity style={styles.guideBtn} onPress={() => setModalVisible(true)}>
              <Ionicons name="information-circle-outline" size={18} color="#6b5853" style={{ marginRight: 6 }} />
              <Text style={styles.guideBtnText}>How to sell on Vinted</Text>
            </TouchableOpacity>
            <View style={{backgroundColor: '#f8f4f1', borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#6b5853', fontSize: 15, textAlign: 'justify', marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold' }}>After you have sold an item</Text>, go to your <Text style={{ fontWeight: 'bold' }}>Closet</Text>. Find the item you sold, <Text style={{ fontWeight: 'bold' }}>long press</Text> on it to open its details. In the top right corner, you will see this icon:
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Image
                  source={require('../../../assets/images/sell.png')}
                  style={{ width: 26, height: 26, marginRight: 8 }}
                  resizeMode="contain"
                />
                <Text style={{ color: '#6b5853', fontSize: 15 , textAlign: 'justify'}}>
                  Tap this icon to mark your item as sold.
                </Text>
              </View>
              <Text style={{ color: '#6b5853', fontSize: 15, marginTop: 8, textAlign: 'justify' }}>
                This helps you keep your closet organized and track which items have found a new home!
              </Text>
            </View>
          </View>
            <Text style={styles.sectionTitle}>Your clothes available for sale:</Text>
          </View>
        }
        data={clothes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <Card item={item} />}
        numColumns={2}
        columnWrapperStyle={{ gap: ITEM_MARGIN, marginBottom: ITEM_MARGIN }}
        contentContainerStyle={{ padding: ITEM_MARGIN, paddingBottom: 40 }}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#6b5853" style={{ marginTop: 20 }} />
          ) : (
            <Text style={styles.emptyText}>No clothes available for sale right now.</Text>
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(236, 228, 223)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 10,
    paddingHorizontal: 8,
    justifyContent: 'flex-start',
  },
  iconButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 70,
    fontFamily: 'Licorice',
    color: '#6b5853',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: -30,
  },
  introText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 18,
    textAlign: 'justify',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8f4f1',
    borderRadius: 12,

  },
  guideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#f8f4f1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  guideBtnText: {
    color: '#6b5853',
    fontWeight: 'bold',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#6b5853',
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
  },
  guideBox: {
    backgroundColor: '#f8f4f1',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  guideStep: {
    fontSize: 15,
    color: '#444',
    marginBottom: 6,
  },
  vintedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8c916C',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  vintedBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
  },
  descModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    width: '90%',
    maxWidth: 400,
    elevation: 6,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b5853',
    flex: 1,
  },
  itemBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 0,
    width: ITEM_WIDTH,
    minHeight: CARD_HEIGHT,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemBoxBack: {
    backgroundColor: '#f8f4f1',
  },
  itemImage: {
    width: '100%',
    height: 170,
    resizeMode: 'cover',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#6b5853',
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 14,
    color: '#888',
    marginBottom: 1,
  },
  emptyText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 18,
  },
});