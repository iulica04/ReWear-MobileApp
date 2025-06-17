import { API_BASE_URL } from '../../config';
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Modal, TextInput, FlatList, ActivityIndicator, Dimensions, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import { Alert } from 'react-native';
import {useRouter } from 'expo-router';


const CARD_WIDTH = (Dimensions.get('window').width - 18 * 2 - 16) / 2;

function FlipCard({
  item,
  onLongPress,
}: {
  item: any;
  onLongPress: (item: any) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: flipped ? 180 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 10,
    }).start();
  }, [flipped]);

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setFlipped(f => !f)}
      onLongPress={() => onLongPress(item)}
      style={styles.cardTouchable}
    >
      <View>
        {/* Front */}
        <Animated.View
          style={[
            styles.card,
            { transform: [{ rotateY: frontInterpolate }] },
            flipped && styles.cardHidden,
          ]}
        >
          <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
          <Image
            source={{ uri: item.frontImageUrl || item.image }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </Animated.View>
        {/* Back */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            { transform: [{ rotateY: backInterpolate }] },
            !flipped && styles.cardHidden,
          ]}
        >
          <Text style={styles.cardDescTitle}>Description</Text>
          <Text style={styles.cardDescText} numberOfLines={6}>
            {item.description || 'No description'}
          </Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

function ClosetHeader({
  user,
  weather,
  activeTab,
  setActiveTab,
  setLocationModal,
  setShowHelpModal,
}: {
  user: any;
  weather: { today: string; tomorrow: string };
  activeTab: 'closet' | 'outfit';
  setActiveTab: (tab: 'closet' | 'outfit') => void;
  setLocationModal: (v: boolean) => void;
  setShowHelpModal: (v: boolean) => void;
}) {
  return (
    <>
      {/* Logo 
      <View style={{ marginTop: 20, marginBottom: 0, alignItems: 'flex-end', marginRight: 18 }}>
        <Image source={require('../../../assets/images/logo4.png')} style={{ width: 120, height: 45, resizeMode: 'contain' }} />
      </View> */}
      {/* User info */}
      <View style={styles.profileRow}>
  {/* Avatar + username + location */}
  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
    <View style={styles.avatarCircle}>
      {user.avatar ? (
        <Image source={{ uri: user.avatar }} style={{ width: 54, height: 54, borderRadius: 27 }} />
      ) : (
        <Ionicons name="person" size={38} color="#bbb" />
      )}
    </View>
    <View style={{ flex: 1, marginLeft: 10 }}>
      <Text style={styles.username}>{user.username}</Text>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}
        onPress={() => setLocationModal(true)}
      >
        <Ionicons name="location-outline" size={15} color="#888" style={{ marginRight: 4 }} />
        <Text style={[styles.location, { textDecorationLine: 'underline' }]} numberOfLines={1}>
          {user.location}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#888" style={{ marginLeft: 2 }} />
      </TouchableOpacity>
    </View>
  </View>
  {/* Iconul cu semnul întrebării la dreapta extremă */}
  <TouchableOpacity
    style={{ marginLeft: 10 }}
    onPress={() => {
      setShowHelpModal(true);
    }}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  >
    <Ionicons name="help-circle-outline" size={28} color="#6b5853" />
  </TouchableOpacity>
</View>
      {/* Weather */}
      <View style={[styles.calendarWeatherRow, { gap: 12 }]}>
         <View style={[styles.calendarWeatherBox, { width: '48%' }]}>
          <Text style={styles.calendarWeatherDate}>Today</Text>
          <Text style={styles.calendarWeatherTemp}>
            {weather.today || '...'} <Ionicons name="sunny-outline" size={16} color="#f7c948" />
          </Text>
        </View>
        <View style={[styles.calendarWeatherBox, { width: '48%' }]}>
          <Text style={styles.calendarWeatherDate}>Tomorrow</Text>
          <Text style={styles.calendarWeatherTemp}>
            {weather.tomorrow || '...'} <Ionicons name="partly-sunny-outline" size={16} color="#f7c948" />
          </Text>
        </View>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabButton]}
          onPress={() => setActiveTab('closet')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tab, activeTab === 'closet' && styles.tabActive]}>Closet</Text>
          {activeTab === 'closet' && (
            <View style={styles.tabUnderline} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton]}
          onPress={() => setActiveTab('outfit')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tab, activeTab === 'outfit' && styles.tabActive]}>Outfit</Text>
          {activeTab === 'outfit' && (
            <View style={styles.tabUnderline} />
          )}
        </TouchableOpacity>
      </View>
      <View style={{ height: 16 }} />
    </>
  );
}

export default function ClosetScreen() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [user, setUser] = useState({
    username: '',
    location: '',
    avatar: null as string | null,
    lat: 47.1,
    lon: 27.6,
  });
  const router = useRouter();


  const [outfitSortOrder, setOutfitSortOrder] = useState<'desc' | 'asc'>('desc');
  function getSortedOutfits() {
  return [...outfits].sort((a, b) =>
    outfitSortOrder === 'desc'
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  }

  const [clothes, setClothes] = useState<any[]>([]);
  const [clothesPage, setClothesPage] = useState(1);
  const [clothesLoading, setClothesLoading] = useState(false);
  const [clothesHasMore, setClothesHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'wears-asc' | 'wears-desc' | null>(null);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newBrand, setNewBrand] = useState('');
  const [newColor, setNewColor] = useState('');
  


  const colorOptions = [
  'Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Pink', 'Gray', 'Purple', 'Brown',
  'Orange', 'Beige', 'Navy', 'Turquoise', 'Teal', 'Cyan', 'Maroon', 'Olive', 'Lime', 'Indigo',
  'Coral', 'Ivory', 'Gold', 'Silver', 'Charcoal', 'Mint', 'Peach', 'Lavender', 'Magenta', 'Aqua'
];
  const brandOptions = [
  'Nike', 'Adidas', 'Zara', 'H&M', 'Bershka', 'Pull&Bear', 'Stradivarius', 'Levi\'s', 'Gucci', 'Prada',
  'Chanel', 'Dolce & Gabbana', 'Armani', 'Tommy Hilfiger', 'Calvin Klein', 'Puma', 'Reebok', 'New Balance',
  'Lacoste', 'Under Armour', 'Balenciaga', 'Off-White', 'Givenchy', 'Versace', 'Moncler', 'Supreme', 'Asos',
  'Uniqlo', 'Mango', 'Massimo Dutti', 'Other'
];

  const CategoryOptions = [
    'Casual', 'Sport', 'Elegant', 'Office', 'Party', 'Vintage', 'Street', 'Basic', 'Other'
  ];
  const materialOptions = [
    'Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Leather', 'Denim', 'Viscose', 'Other'
  ];
  const tagOptions = [
    'New', 'Sale', 'Favorite', 'Gift', 'Limited', 'Eco', 'Handmade', 'Imported', 'Other'
  ];

  const [tempColorOptions, setColorOptions] = useState<string[]>(colorOptions);
  const [tempBrandOptions, setTempBrandOptions] = useState<string[]>(brandOptions);
  const [tempCategoryOptions, setTempCategoryOptions] = useState(CategoryOptions);
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tempTagOptions, setTempTagOptions] = useState(tagOptions);
  const [tempMaterialOptions, setTempMaterialOptions] = useState(materialOptions);
  const [newMaterial, setNewMaterial] = useState('');


  const [locationModal, setLocationModal] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ name: string; lat: number; lon: number }[]>([]);
  const [weather, setWeather] = useState<{ today: string; tomorrow: string }>({ today: '', tomorrow: '' });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const [activeTab, setActiveTab] = useState<'closet' | 'outfit'>('closet');
  const [locationInitialized, setLocationInitialized] = useState(false);

  const [outfits, setOutfits] = useState<any[]>([]);
  const [outfitsLoading, setOutfitsLoading] = useState(false);
  const [outfitsInitialLoaded, setOutfitsInitialLoaded] = useState(false);

  const [detailModal, setDetailModal] = useState(false);
  const [detailItem, setDetailItem] = useState<any>(null);

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const [searchClothingModalVisible, setSearchClothingModalVisible] = useState(false);
  const [searchClothingText, setSearchClothingText] = useState('');
  const [searchClothingResults, setSearchClothingResults] = useState<any[]>([]);  
  const [searchClothingLoading, setSearchClothingLoading] = useState(false);

  // 2. Modifică funcția de sortare:
function getSortedClothes() {
  if (!sortBy) return clothes;
  const sorted = [...clothes];
  if (sortBy === 'wears-asc') {
    sorted.sort((a, b) => (a.numberOfWears ?? 0) - (b.numberOfWears ?? 0));
  } else if (sortBy === 'wears-desc') {
    sorted.sort((a, b) => (b.numberOfWears ?? 0) - (a.numberOfWears ?? 0));
  }
  return sorted;
}


  useEffect(() => {
  if (!searchClothingModalVisible) return;
  if (searchClothingText.length < 2) {
    setSearchClothingResults([]);
    setSearchClothingLoading(false);
    return;
  }
  setSearchClothingLoading(true);
  const timeout = setTimeout(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!userId || !jwtToken) return;
      const res = await fetch(
        `${API_BASE_URL}/api/ClothingItem/get-by-name?UserId=${userId}&Name=${encodeURIComponent(searchClothingText)}`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      const data = await res.json();
      setSearchClothingResults(Array.isArray(data) ? data : data.items || []);
    } catch {
      setSearchClothingResults([]);
    }
    setSearchClothingLoading(false);
  }, 400);
  return () => clearTimeout(timeout);
  }, [searchClothingText, searchClothingModalVisible]);

  const toggleColor = (color: string) => {
  setSelectedColors(prev =>
    prev.includes(color)
      ? prev.filter(c => c !== color)
      : [...prev, color]
  );
};

const toggleBrand = (brand: string) => {
  setSelectedBrands(prev =>
    prev.includes(brand)
      ? prev.filter(b => b !== brand)
      : [...prev, brand]
  );
};
const toggleCategory = (label: string) => {
  setSelectedCategory(prev =>
    prev.includes(label)
      ? prev.filter(l => l !== label)
      : [...prev, label]
  );
};

const toggleMaterial = (material: string) => {
  setSelectedMaterials(prev =>
    prev.includes(material)
      ? prev.filter(m => m !== material)
      : [...prev, material]
  );
};

const toggleTag = (tag: string) => {
  setSelectedTags(prev =>
    prev.includes(tag)
      ? prev.filter(t => t !== tag)
      : [...prev, tag]
  );
};

useEffect(() => {
  if (filterModalVisible) {
    setTempBrandOptions(brandOptions);
    setTempMaterialOptions(materialOptions);
    setTempTagOptions(tagOptions);
    setTempCategoryOptions(CategoryOptions); 
  }
}, [filterModalVisible]);

const handleApplyFilter = async () => {
  const userId = await AsyncStorage.getItem('userId');
  if (!userId) return;
  let url = `${API_BASE_URL}/api/ClothingItem/paginated?page=1&pageSize=10&userId=${userId}`;
  selectedColors.forEach(color => {
    url += `&colors=${encodeURIComponent(color)}`;
  });
  selectedBrands.forEach(brand => {
    url += `&brands=${encodeURIComponent(brand)}`;
  });
  selectedCategory.forEach(category => {
    url += `&categories=${encodeURIComponent(category)}`;
  });
  selectedMaterials.forEach(material => {
    url += `&materials=${encodeURIComponent(material)}`;
  });
  selectedTags.forEach(tag => {
    url += `&tags=${encodeURIComponent(tag)}`;
  });
  // Adaugă și alte filtre aici dacă vrei (brand, label, etc)
  // Exemplu: if (brandFilter) url += `&brands=${encodeURIComponent(brandFilter)}`;
  setClothesLoading(true);
  try {
    const jwtToken = await AsyncStorage.getItem('jwtToken');
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${jwtToken}` }
    });
    const data = await res.json();
    console.log('Filtered data:', data);
    let items: any[] = [];
    if (Array.isArray(data)) {
      items = data;
    } else if (Array.isArray(data.data)) {
      items = data.data;
    } else if (Array.isArray(data.items)) {
      items = data.items;
    }
    setClothes(items);
    setFilterModalVisible(false);
    setExpandedFilter(null); 
    setClothesPage(1);
    setClothesHasMore((data.items?.length ?? 0) === 10);
    setTotalCount(data.totalCount ?? (data.items?.length ?? 0));
  } catch (e) {}
  setClothesLoading(false);
};



  const fetchUser = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!userId || !jwtToken) return;
      const res = await fetch(`${API_BASE_URL}/api/Users/${userId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      setUser(u => ({
        ...u,
        username: data.userName || '',
        avatar: data.profilePicture || null,
      }));
    } catch (e) {}
  }, []);

  const pickImage = async (type: 'front' | 'back') => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.4,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets[0].base64) {
      setEditData((d: any) => ({
        ...d,
        [`${type}ImageBase64`]: result.assets[0].base64,
        [`${type}ImageUrl`]: result.assets[0].uri, // pentru preview local
      }));
    }
  };

  const takePhoto = async (type: 'front' | 'back') => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets[0].base64) {
      setEditData((d: any) => ({
        ...d,
        [`${type}ImageBase64`]: result.assets[0].base64,
        [`${type}ImageUrl`]: result.assets[0].uri,
      }));
    }
  };

  useEffect(() => {
    if (locationInitialized) return;
    const getInitialLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        let location = await Location.getCurrentPositionAsync({});
        let geo = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        let name =
          geo[0]?.city ||
          geo[0]?.region ||
          geo[0]?.name ||
          `${location.coords.latitude}, ${location.coords.longitude}`;
        setUser(u => ({
          ...u,
          location: name,
          lat: location.coords.latitude,
          lon: location.coords.longitude,
        }));
        setLocationInitialized(true);
      } catch (e) {
        setLocationInitialized(true);
      }
    };
    getInitialLocation();
  }, [locationInitialized]);

  useFocusEffect(
  useCallback(() => {
    fetchUser();
  }, [fetchUser])
);



  useEffect(() => {
    if (!user.lat || !user.lon) return;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${user.lat}&longitude=${user.lon}&daily=temperature_2m_max,temperature_2m_min&forecast_days=2&timezone=auto`
    )
      .then(res => res.json())
      .then(data => {
        if (data && data.daily) {
          setWeather({
            today: `${data.daily.temperature_2m_max[0]} / ${data.daily.temperature_2m_min[0]}°C`,
            tomorrow: `${data.daily.temperature_2m_max[1]} / ${data.daily.temperature_2m_min[1]}°C`,
          });
        }
      })
      .catch(() => {
        setWeather({
          today: '21 / 6°C',
          tomorrow: '21 / 10°C',
        });
      });
  }, [user.lat, user.lon]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (search.length < 2) {
        setSearchResults([]);
        setSearchError('');
        setSearchLoading(false);
        return;
      }
      setSearchLoading(true);
      setSearchError('');
      try {
        let res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&countrycodes=ro&format=json&limit=10`
        );
        let data = await res.json();
        if (!data || data.length === 0) {
          res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=10`
          );
          data = await res.json();
        }
        const filtered = (data || []).filter((item: any) =>
          item.lat && item.lon && (
            item.type === 'city' ||
            item.type === 'town' ||
            item.type === 'village' ||
            item.type === 'municipality' ||
            item.type === 'county' ||
            item.type === 'state' ||
            item.class === 'place'
          )
        );
        setSearchResults(
          filtered.map((item: any) => ({
            name: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
          }))
        );
        if (filtered.length === 0) setSearchError('No results');
      } catch {
        setSearchResults([]);
        setSearchError('Error searching location');
      }
      setSearchLoading(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleGetCurrentLocation = async () => {
    setGettingLocation(true);
    setSearchError('');
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setSearchError('Location permission denied');
        setGettingLocation(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      let geo = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      let name =
        geo[0]?.city ||
        geo[0]?.region ||
        geo[0]?.name ||
        `${location.coords.latitude}, ${location.coords.longitude}`;
      setUser(u => ({
        ...u,
        location: name,
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      }));
      setLocationModal(false);
      setSearch('');
      setSearchResults([]);
    } catch (e) {
      setSearchError('Could not get location');
    }
    setGettingLocation(false);
  };

  const [clothesInitialLoaded, setClothesInitialLoaded] = useState(false);

  const fetchClothes = useCallback(
    async (page = 1, append = false) => {
      setClothesLoading(true);
      try {
        const userId = await AsyncStorage.getItem('userId');
        const jwtToken = await AsyncStorage.getItem('jwtToken');
        if (!userId || !jwtToken) return;
        const res = await fetch(
          `${API_BASE_URL}/api/ClothingItem/paginated?page=${page}&pageSize=10&userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        if (!res.ok) throw new Error('Failed to fetch clothes');

        const data = await res.json();

        let items: any[] = [];
        let total = 0;
        if (Array.isArray(data)) {
          items = data;
          total = data.length;
        } else if (Array.isArray(data.data)) {
          items = data.data;
          total = data.totalCount ?? items.length;
        } else if (Array.isArray(data.items)) {
          items = data.items;
          total = data.totalCount ?? items.length;
        }
        setClothes(prev =>
          append ? [...prev, ...items] : items
        );
        setClothesHasMore(items.length === 10);
        setClothesPage(page);
        setTotalCount(total);
      } catch (e) {}
      setClothesLoading(false);
    },
    []
  );

  useEffect(() => {
    if (activeTab === 'closet') {
      setClothes([]);
      setClothesPage(1);
      setClothesHasMore(true);
      fetchClothes(1, false);
      setClothesInitialLoaded(true);
    }
  }, [activeTab, fetchClothes]);

  const handleLoadMoreClothes = () => {
    if (!clothesLoading && clothesHasMore) {
      fetchClothes(clothesPage + 1, true);
    }
  };

  const fetchOutfits = useCallback(async () => {
    setOutfitsLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!userId || !jwtToken) return;
      const res = await fetch(
       `${API_BASE_URL}/api/Outfit?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch outfits');
      const data = await res.json();
      let items: any[] = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (Array.isArray(data.data)) {
        items = data.data;
      }

      setOutfits(items);
    } catch (e) {
      setOutfits([]);
    }
    setOutfitsLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'outfit' && !outfitsInitialLoaded) {
      fetchOutfits();
      setOutfitsInitialLoaded(true);
    }
    if (activeTab === 'closet') {
      setOutfitsInitialLoaded(false);
    }
  }, [activeTab, fetchOutfits, outfitsInitialLoaded]);

  const handleLongPressCard = (item: any) => {
    setDetailItem(item);
    setDetailModal(true);
  };

  useFocusEffect(
  useCallback(() => {
    if (activeTab === 'closet') {
      setClothes([]);
      setClothesPage(1);
      setClothesHasMore(true);
      fetchClothes(1, false);
      setClothesInitialLoaded(true);
    } else if (activeTab === 'outfit') {
      fetchOutfits();
      setOutfitsInitialLoaded(true);
    }
    // Nu returna nimic, vrei doar să se execute la fiecare focus
  }, [activeTab, fetchClothes, fetchOutfits])
);

  const renderHeader = () => (
    <ClosetHeader
      user={user}
      weather={weather}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      setLocationModal={setLocationModal}
      setShowHelpModal={setShowHelpModal}
    />
  );

  const handleMarkAsSold = async () => {
    if (!detailItem) return;
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!jwtToken) return;
      await fetch(`${API_BASE_URL}/api/ClothingItem/mark-as-sold/${detailItem.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      Alert.alert('Success', 'Articolul a fost marcat ca vândut!');
      setDetailModal(false);
      fetchClothes(1, false); // reîncarcă lista
    } catch (e) {
      Alert.alert('Eroare', 'Nu s-a putut marca articolul ca vândut.');
    }
  };

  // Open edit mode
  const handleEdit = useCallback(() => {
  setEditData({ ...detailItem });
  setEditMode(true);
  }, [detailItem]);

  const handleSaveEdit = async () => {
  if (!editData) return;
  try {
    const jwtToken = await AsyncStorage.getItem('jwtToken');
    const userId = await AsyncStorage.getItem('userId');
    if (!jwtToken || !userId) return;

    if (detailItem && Object.prototype.hasOwnProperty.call(detailItem, 'clothingItems')) {
      // Outfit update
      const payload = {
        id: editData.id,
        userId,
        name: editData.name,
        clothingItemIds: editData.clothingItems?.map((ci: any) => ci.id) || [],
        season: editData.season,
        description: editData.description,
        imageFront: editData.frontImageBase64 || null,
      };

      await fetch(`${API_BASE_URL}/api/Outfit/${editData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(payload),
      });
      setDetailItem(editData);
      setEditMode(false);
      fetchOutfits(); // Refresh outfit list
    } else {
      // Clothing item update (vechiul cod)
      const payload = {
        id: editData.id,
        userId,
        name: editData.name,
        category: editData.category,
        tags: typeof editData.tags === 'string'
          ? editData.tags.split(',').map((t: string) => t.trim())
          : editData.tags,
        color: editData.color,
        brand: editData.brand,
        material: editData.material,
        printType: editData.printType,
        printDescription: editData.printDescription,
        description: editData.description,
        imageFront: editData.frontImageBase64 || null,
        imageBack: editData.backImageBase64 || null,
      };

      await fetch(`${API_BASE_URL}/api/ClothingItem/${editData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(payload),
      });
      setDetailItem(editData);
      setEditMode(false);
      fetchClothes(1, false); // Refresh list
    }
  } catch (e) {
    // Optionally show error
  }
};

  const handleDeleteItem = async () => {
  if (!detailItem) return;
  try {
    const jwtToken = await AsyncStorage.getItem('jwtToken');
    if (!jwtToken) return;

    if (detailItem && Object.prototype.hasOwnProperty.call(detailItem, 'clothingItems')) {
      // Outfit delete
      await fetch(`${API_BASE_URL}/api/Outfit/${detailItem.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      setDetailModal(false);
      setEditMode(false);
      fetchOutfits(); // Refresh outfit list
    } else {
      // Clothing item delete (vechiul cod)
      await fetch(`${API_BASE_URL}/api/ClothingItem/${detailItem.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      setDetailModal(false);
      setEditMode(false);
      fetchClothes(1, false); // Refresh list
    }
  } catch (e) {
    // Optionally show error
  }
};

const confirmDelete = () => {
  Alert.alert(
    'Delete item',
    'Are you sure you want to delete this item?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: handleDeleteItem },
    ]
  );
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ece4df' }}>
      <ClosetHeader
      user={user}
      weather={weather}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      setLocationModal={setLocationModal}
      setShowHelpModal={setShowHelpModal}
    />
    
      {activeTab === 'closet' && (
        <>
        
        <FlatList
        initialNumToRender={6}
          windowSize={7}
          data={getSortedClothes()}
          removeClippedSubviews={true}
          keyExtractor={item => item.id}
          style={{ marginTop: 0, marginHorizontal: 18 }}
          numColumns={2}
          columnWrapperStyle={{ gap: 16, marginBottom: 18 }}
          renderItem={({ item }) => (
            <FlipCard item={item} onLongPress={handleLongPressCard} />
          )}
          ListHeaderComponent={
           <> 
           <View style={{
            marginHorizontal: 2,
            marginBottom: 16,
            marginTop: 10,
            backgroundColor: '#f8f4f1',
            borderRadius: 14,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#8c916C',
                borderRadius: 8,
                padding: 10,
                marginRight: 12,
              }}
             onPress={() => router.push('/eco/ecoImpact')}
            >
              <Ionicons name="leaf-outline" size={24} color="#fff" /> 
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#6b5853', fontWeight: 'bold', fontSize: 16 }}>
                Eco impact of your closet
              </Text>
              <Text style={{ color: '#a68b7b', fontSize: 13, marginTop: 2, textAlign: 'justify' }}>
                Discover how your clothes affect the planet and get eco-friendly tips.
              </Text>
            </View>
            
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 12 }}>
            {/* Sortare după număr de purtări */}
            <TouchableOpacity
              onPress={() => setSortBy(sortBy === 'wears-asc' ? 'wears-desc' : 'wears-asc')}
              style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}
            >
              <Ionicons name="repeat-outline" size={22} color="#6b5853" style={{ marginRight: 6 }} />
              <Text style={{ color: '#6b5853', fontWeight: 'bold', fontSize: 16 }}>
                Sort Wears {sortBy === 'wears-asc' ? '↓' : sortBy === 'wears-desc' ? '↑' : ''}
              </Text>
            </TouchableOpacity>
            {/* Filter icon & text */}
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}
              onPress={() => setFilterModalVisible(true)}>
              <Text style={{ color: '#6b5853', fontWeight: 'bold', fontSize: 16, marginRight: 6 }}>Filter</Text>
              <Ionicons name="filter-outline" size={22} color="#6b5853" />
            </TouchableOpacity>
          </View>
          </>
        }
          ListEmptyComponent={
            clothesLoading ? (
              <ActivityIndicator size="large" color="#6b5853" style={{ marginTop: 30 }} />
            ) : (
              totalCount === 0 ? (
                <Text style={{ color: '#888', textAlign: 'center', marginTop: 30 }}>No clothes found.</Text>
              ) : null
            )
          }
          onEndReached={handleLoadMoreClothes}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            clothesLoading && clothes.length > 0 ? (
              <ActivityIndicator size="small" color="#6b5853" style={{ marginVertical: 10 }} />
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false} 
        />
         {/* Modal pentru filtre */}
          <Modal
            visible={filterModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setFilterModalVisible(false)}
          >
            <View
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }}>
                <KeyboardAvoidingView
                style={{ flex: 1, justifyContent: 'center' }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
              >
                <ScrollView
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                  }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
              <View style={{
                backgroundColor: '#fff',
                borderRadius: 18,
                padding: 20,
                margin: 30,
                marginTop: 80,
                elevation: 8,
                minHeight: 300,
              }}>
                <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 18, color: '#6b5853' }}>Filters</Text>
                {/* Brand Filter */}
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#ece4df' }}
                  onPress={() => setExpandedFilter(expandedFilter === 'brand' ? null : 'brand')}
                  activeOpacity={0.7}
                >
                  <Text style={{ flex: 1, color: '#222', fontSize: 16 }}>Brand</Text>
                  <MaterialIcons name={expandedFilter === 'brand' ? 'keyboard-arrow-down' : 'keyboard-arrow-right'} size={26} color="#6b5853" />
                </TouchableOpacity>
                {expandedFilter === 'brand' && (
                  <View style={{ paddingVertical: 8, paddingLeft: 8 }}>
                    {tempBrandOptions.map(brand => (
                      <TouchableOpacity
                        key={brand}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 8,
                        }}
                        onPress={() => toggleBrand(brand)}
                      >
                        <Ionicons
                          name={selectedBrands.includes(brand) ? 'checkbox-outline' : 'square-outline'}
                          size={22}
                          color="#6b5853"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={{ color: '#222', fontSize: 16 }}>{brand}</Text>
                      </TouchableOpacity>
                    ))}
                    {/* Input pentru brand nou */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                      <TextInput
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: '#ece4df',
                          borderRadius: 8,
                          padding: 8,
                          backgroundColor: '#f8f4f1',
                          color: '#222',
                          fontSize: 15,
                        }}
                        placeholder="Add new brand"
                        value={newBrand}
                        onChangeText={setNewBrand}
                      />
                      <TouchableOpacity
                        style={{
                          marginLeft: 8,
                          backgroundColor: '#6b5853',
                          borderRadius: 8,
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                        }}
                        onPress={() => {
                          if (
                            newBrand.trim() &&
                            !tempBrandOptions.includes(newBrand.trim())
                          ) {
                            setTempBrandOptions(prev => [...prev, newBrand.trim()]);
                            toggleBrand(newBrand.trim());
                            setNewBrand('');
                          }
                        }}
                      >
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {/* Color Filter */}
                   <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#ece4df' }}
                    onPress={() => setExpandedFilter(expandedFilter === 'color' ? null : 'color')}
                    activeOpacity={0.7}
                  >
                    <Text style={{ flex: 1, color: '#222', fontSize: 16 }}>Color</Text>
                    <MaterialIcons name={expandedFilter === 'color' ? 'keyboard-arrow-down' : 'keyboard-arrow-right'} size={26} color="#6b5853" />
                  </TouchableOpacity>
                  {expandedFilter === 'color' && (
                    <View style={{ paddingVertical: 8, paddingLeft: 8 }}>
                      {colorOptions.map(color => (
                        <TouchableOpacity
                          key={color}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 8,
                          }}
                          onPress={() => toggleColor(color)}
                        >
                          <Ionicons
                            name={selectedColors.includes(color) ? 'checkbox-outline' : 'square-outline'}
                            size={22}
                            color="#6b5853"
                            style={{ marginRight: 8 }}
                          />
                          <Text style={{ color: '#222', fontSize: 16 }}>{color}</Text>
                        </TouchableOpacity>
                      ))}
                      {/* Input pentru culoare nouă */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <TextInput
                          style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: '#ece4df',
                            borderRadius: 8,
                            padding: 8,
                            backgroundColor: '#f8f4f1',
                            color: '#222',
                            fontSize: 15,
                          }}
                          placeholder="Add new color"
                          value={newColor}
                          onChangeText={setNewColor}
                        />
                        <TouchableOpacity
                          style={{
                            marginLeft: 8,
                            backgroundColor: '#6b5853',
                            borderRadius: 8,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                          }}
                          onPress={() => {
                            if (
                              newColor.trim() &&
                              !colorOptions.includes(newColor.trim())
                            ) {
                              setColorOptions(prev => [...prev, newColor.trim()]);
                              toggleColor(newColor.trim());
                              setNewColor('');
                            }
                          }}
                        >
                          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                {/* Materials Filter */}
                  <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#ece4df' }}
                  onPress={() => setExpandedFilter(expandedFilter === 'material' ? null : 'material')}
                  activeOpacity={0.7}
                >
                  <Text style={{ flex: 1, color: '#222', fontSize: 16 }}>Material</Text>
                  <MaterialIcons name={expandedFilter === 'material' ? 'keyboard-arrow-down' : 'keyboard-arrow-right'} size={26} color="#6b5853" />
                </TouchableOpacity>
                  {expandedFilter === 'material' && (
                    <View style={{ paddingVertical: 8, paddingLeft: 8 }}>
                      {tempMaterialOptions.map(material => (
                        <TouchableOpacity
                          key={material}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 8,
                          }}
                          onPress={() => toggleMaterial(material)}
                        >
                          <Ionicons
                            name={selectedMaterials.includes(material) ? 'checkbox-outline' : 'square-outline'}
                            size={22}
                            color="#6b5853"
                            style={{ marginRight: 8 }}
                          />
                          <Text style={{ color: '#222', fontSize: 16 }}>{material}</Text>
                        </TouchableOpacity>
                      ))}
                      {/* Input pentru material nou */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <TextInput
                          style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: '#ece4df',
                            borderRadius: 8,
                            padding: 8,
                            backgroundColor: '#f8f4f1',
                            color: '#222',
                            fontSize: 15,
                          }}
                          placeholder="Add new material"
                          value={newMaterial}
                          onChangeText={setNewMaterial}
                        />
                        <TouchableOpacity
                          style={{
                            marginLeft: 8,
                            backgroundColor: '#6b5853',
                            borderRadius: 8,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                          }}
                          onPress={() => {
                            if (
                              newMaterial.trim() &&
                              !tempMaterialOptions.includes(newMaterial.trim())
                            ) {
                              setTempMaterialOptions(prev => [...prev, newMaterial.trim()]);
                              toggleMaterial(newMaterial.trim());
                              setNewMaterial('');
                            }
                          }}
                        >
                          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                {/* Tags Filter */}
                  <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#ece4df' }}
                  onPress={() => setExpandedFilter(expandedFilter === 'tags' ? null : 'tags')}
                  activeOpacity={0.7}
                >
                  <Text style={{ flex: 1, color: '#222', fontSize: 16 }}>Tags</Text>
                  <MaterialIcons name={expandedFilter === 'tags' ? 'keyboard-arrow-down' : 'keyboard-arrow-right'} size={26} color="#6b5853" />
                </TouchableOpacity>
                 {expandedFilter === 'tags' && (
                    <View style={{ paddingVertical: 8, paddingLeft: 8 }}>
                      {tempTagOptions.map(tag => (
                        <TouchableOpacity
                          key={tag}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 8,
                          }}
                          onPress={() => toggleTag(tag)}
                        >
                          <Ionicons
                            name={selectedTags.includes(tag) ? 'checkbox-outline' : 'square-outline'}
                            size={22}
                            color="#6b5853"
                            style={{ marginRight: 8 }}
                          />
                          <Text style={{ color: '#222', fontSize: 16 }}>{tag}</Text>
                        </TouchableOpacity>
                      ))}
                      {/* Input pentru tag nou */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <TextInput
                          style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: '#ece4df',
                            borderRadius: 8,
                            padding: 8,
                            backgroundColor: '#f8f4f1',
                            color: '#222',
                            fontSize: 15,
                          }}
                          placeholder="Add new tag"
                          value={newTag}
                          onChangeText={setNewTag}
                        />
                        <TouchableOpacity
                          style={{
                            marginLeft: 8,
                            backgroundColor: '#6b5853',
                            borderRadius: 8,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                          }}
                          onPress={() => {
                            if (
                              newTag.trim() &&
                              !tempTagOptions.includes(newTag.trim())
                            ) {
                              setTempTagOptions(prev => [...prev, newTag.trim()]);
                              toggleTag(newTag.trim());
                              setNewTag('');
                            }
                          }}
                        >
                          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
          )}
                {/* Categories Filter */}
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#ece4df' }}
                  onPress={() => setExpandedFilter(expandedFilter === 'category' ? null : 'category')}
                  activeOpacity={0.7}
                >
                  <Text style={{ flex: 1, color: '#222', fontSize: 16 }}>Category</Text>
                  <MaterialIcons name={expandedFilter === 'category' ? 'keyboard-arrow-down' : 'keyboard-arrow-right'} size={26} color="#6b5853" />
                </TouchableOpacity>
                {expandedFilter === 'category' && (
                  <View style={{ paddingVertical: 8, paddingLeft: 8 }}>
                    {tempCategoryOptions.map(category => (
                      <TouchableOpacity
                        key={category}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 8,
                        }}
                        onPress={() => toggleCategory(category)}
                      >
                        <Ionicons
                          name={selectedCategory.includes(category) ? 'checkbox-outline' : 'square-outline'}
                          size={22}
                          color="#6b5853"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={{ color: '#222', fontSize: 16 }}>{category}</Text>
                      </TouchableOpacity>
                    ))}
                    {/* Input pentru categorie nouă */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                      <TextInput
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: '#ece4df',
                          borderRadius: 8,
                          padding: 8,
                          backgroundColor: '#f8f4f1',
                          color: '#222',
                          fontSize: 15,
                        }}
                        placeholder="Add new category"
                        value={newCategory}
                        onChangeText={setNewCategory}
                      />
                      <TouchableOpacity
                        style={{
                          marginLeft: 8,
                          backgroundColor: '#6b5853',
                          borderRadius: 8,
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                        }}
                        onPress={() => {
                          if (
                            newCategory.trim() &&
                            !tempCategoryOptions.includes(newCategory.trim())
                          ) {
                            setTempCategoryOptions(prev => [...prev, newCategory.trim()]);
                            toggleCategory(newCategory.trim());
                            setNewCategory('');
                          }
                        }}
                      >
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {/* Apply button */}
                <TouchableOpacity
                style={{
                  marginTop: 24,
                  alignSelf: 'center',
                  padding: 12,
                  backgroundColor: '#6b5853',
                  borderRadius: 8,
                  minWidth: 120,
                  alignItems: 'center',
                  width: '100%',
                }}
                onPress={handleApplyFilter}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Apply Filter</Text>
              </TouchableOpacity>
                {/* Close button */}
                <TouchableOpacity
                  style={{ marginTop: 24,
                  alignSelf: 'center',
                  padding: 12,
                  backgroundColor: '#C5A494',
                  borderRadius: 8,
                  minWidth: 120,
                  alignItems: 'center',
                  width: '100%', }}
                  onPress={() => setFilterModalVisible(false)}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
                </TouchableOpacity>
              </View>
              </ScrollView>
              </KeyboardAvoidingView>
            </View>
          </Modal>

        </>
      )}

      {activeTab === 'outfit' && (
      <>
        
        <FlatList
        data={getSortedOutfits()}
        keyExtractor={item => item.id}
        style={{ marginTop: 0, marginHorizontal: 18 }}
        numColumns={2}
        columnWrapperStyle={{ gap: 16, marginBottom: 18 }}
        renderItem={({ item }) => (
            <FlipCard
              item={{
                ...item,
                name: item.name || 'Outfit',
                frontImageUrl: item.imageUrl,
                description: item.description,
                clothingItems: item.clothingItemDTOs,
              }}
              onLongPress={handleLongPressCard}
            />
          )}
           ListHeaderComponent={
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8, marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => setOutfitSortOrder(o => (o === 'desc' ? 'asc' : 'desc'))}
            style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
          >
            <Ionicons
              name={outfitSortOrder === 'desc' ? 'arrow-down-outline' : 'arrow-up-outline'}
              size={22}
              color="#6b5853"
              style={{ marginRight: 6 }}
            />
            <Text style={{ color: '#6b5853', fontWeight: 'bold', fontSize: 16 }}>
              {outfitSortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </Text>
          </TouchableOpacity>
        </View>
      }
          ListEmptyComponent={
            outfitsLoading ? (
              <ActivityIndicator size="large" color="#6b5853" style={{ marginTop: 30 }} />
            ) : (
              <Text style={{ color: '#888', textAlign: 'center', marginTop: 30 }}>No outfits found.</Text>
            )
          }
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false} 
        />
      </>
      )}

      {/* Modal for item details */}
      <Modal
  visible={detailModal}
  transparent
  animationType="fade"
  onRequestClose={() => {
    setDetailModal(false);
    setEditMode(false);
  }}
>
  <View style={styles.detailModalOverlay}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ width: '100%', alignItems: 'center' }}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.detailModalContent]}>
        <ScrollView
          contentContainerStyle={{ alignItems: 'stretch', paddingBottom: 24, width: '100%' }}
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 8 }}>
            {detailItem && !detailItem.clothingItems && (
            <TouchableOpacity style={{ marginRight: 12 }} onPress={handleMarkAsSold}>
              <Image
                source={require('../../../assets/images/sell.png')}
                style={{ width: 26, height: 26, tintColor: '#6b5853' }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
            {!editMode && (
              <TouchableOpacity style={{ marginRight: 12 }} onPress={handleEdit}>
                <Ionicons name="create-outline" size={26} color="#6b5853" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={{ marginRight: 12 }} onPress={confirmDelete}>
              <Ionicons name="trash-outline" size={26} color="#c0392b" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              setDetailModal(false);
              setEditMode(false);
            }}>
              <Ionicons name="close" size={28} color="#222" />
            </TouchableOpacity>
          </View>
          <Text style={styles.detailTitle}>{editMode ? 'Edit Item' : detailItem?.name}</Text>
          <View style={styles.detailImagesRow}>
            {/* Front image */}
            {editMode ? (
              <View style={{ alignItems: 'center', marginRight: 8 }}>
                <TouchableOpacity
                  style={[styles.detailImagePlaceholder, { width: 110, height: 110, marginBottom: 4 }]}
                  onPress={() => pickImage('front')}
                  onLongPress={() => takePhoto('front')}
                >
                  {editData?.frontImageUrl || editData?.frontImageBase64 ? (
                    <Image
                      source={
                        editData?.frontImageBase64
                          ? { uri: `data:image/jpeg;base64,${editData.frontImageBase64}` }
                          : { uri: editData.frontImageUrl }
                      }
                      style={{ width: 110, height: 110, borderRadius: 14 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.detailImagePlaceholderText}>Alege sau fă poză</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : detailItem?.frontImageUrl ? (
              <Image
                source={{ uri: detailItem.frontImageUrl }}
                style={styles.detailImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.detailImagePlaceholder}>
                <Text style={styles.detailImagePlaceholderText}>No front photo</Text>
              </View>
            )}
            {/* Back image */}
            {editMode ? (
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity
                  style={[styles.detailImagePlaceholder, { width: 110, height: 110, marginBottom: 4 }]}
                  onPress={() => pickImage('back')}
                  onLongPress={() => takePhoto('back')}
                >
                  {editData?.backImageUrl || editData?.backImageBase64 ? (
                    <Image
                      source={
                        editData?.backImageBase64
                          ? { uri: `data:image/jpeg;base64,${editData.backImageBase64}` }
                          : { uri: editData.backImageUrl }
                      }
                      style={{ width: 110, height: 110, borderRadius: 14 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.detailImagePlaceholderText}>Alege sau fă poză</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : detailItem?.backImageUrl ? (
              <Image
                source={{ uri: detailItem.backImageUrl }}
                style={styles.detailImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.detailImagePlaceholder}>
                <Text style={styles.detailImagePlaceholderText}>No back photo</Text>
              </View>
            )}
          </View>
          {/* Info message - wrap and center */}
          {editMode && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 8,
            marginBottom: 2,
            marginLeft: 0,
            flexWrap: 'wrap',
            flex: 1,
          }}>
            <Ionicons name="information-circle-outline" size={16} color="#6b5853" style={{ marginRight: 4 }} />
            <Text style={{
              fontSize: 13,
              color: '#6b5853',
              flex: 1,
              flexWrap: 'wrap',
              
            }}>
              To change photos, <Text style={{ fontWeight: 'bold' }}>tap</Text> for gallery or <Text style={{ fontWeight: 'bold' }}>hold</Text> for camera.
            </Text>
          </View>
        )}
          <View style={styles.detailInfoGrid}>
          {detailItem?.clothingItems ? (
            // --- OUTFIT DETAILS ---
            <>
              {/* Name */}
                <View style={styles.detailInfoRow}>
                  <Ionicons name="shirt-outline" size={18} color="#6b5853" style={{ marginRight: 8 }} />
                  <Text style={styles.detailInfoLabel}>Name:</Text>
                  {editMode ? (
                    <TextInput
                      style={[styles.detailInfoValue, { borderBottomWidth: 1, borderColor: '#ece4df', minWidth: 80 }]}
                      value={editData?.name}
                      onChangeText={v => setEditData((d: any) => ({ ...d, name: v }))}
                      placeholder="Name"
                    />
                  ) : (
                    <Text style={styles.detailInfoValue}>{detailItem.name}</Text>
                  )}
                </View>
               {/* CreatedAt */}
                <View style={styles.detailInfoRow}>
                  <Ionicons name="calendar-outline" size={18} color="#6b5853" style={{ marginRight: 8 }} />
                  <Text style={styles.detailInfoLabel}>Created:</Text>
                  <Text style={styles.detailInfoValue}>
                    {new Date(detailItem.createdAt).toLocaleString()}
                  </Text>
                </View>
                
                  {/* Season */}
                  <View style={[styles.detailInfoRow, { alignItems: 'center', flexWrap: 'wrap' }]}>
                    <Ionicons name="cloud-outline" size={18} color="#6b5853" style={{ marginRight: 8 }} />
                    <Text style={styles.detailInfoLabel}>Season:</Text>
                    {editMode ? (
                      // Scoate View-ul suplimentar!
                      <>
                        {['spring', 'summer', 'autumn', 'winter'].map((season) => (
                          <TouchableOpacity
                            key={season}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 8,
                              backgroundColor: editData?.season === season ? '#6b5853' : '#ece4df',
                              borderWidth: 1,
                              borderColor: '#d2c1b7',
                              marginRight: 8,
                              marginBottom: 6,
                            }}
                            onPress={() => setEditData((d: any) => ({ ...d, season }))}
                          >
                            <Text style={{
                              color: editData?.season === season ? '#fff' : '#6b5853',
                              fontWeight: editData?.season === season ? 'bold' : 'normal'
                            }}>
                              {season}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </>
                    ) : (
                      <Text style={styles.detailInfoValue}>{detailItem.season || 'N/A'}</Text>
                    )}
                  </View>
              {/* Description */}
                <View style={[styles.detailInfoRow, { alignItems: 'flex-start' }]}>
                <Ionicons name="document-text-outline" size={18} color="#6b5853" style={{ marginRight: 8, marginTop: 0 }} />
                <Text style={[styles.detailInfoLabel, { marginTop: 0 }]}>Description:</Text>
                {editMode ? (
                  <TextInput
                    style={[
                      styles.detailInfoValue,
                      { borderBottomWidth: 1, borderColor: '#ece4df', minWidth: 80, minHeight: 40, textAlignVertical: 'top', textAlign: 'justify' }
                    ]}
                    value={editData?.description}
                    onChangeText={v => setEditData((d: any) => ({ ...d, description: v }))}
                    placeholder="Description"
                    multiline
                  />
                ) : (
                  <Text style={styles.detailInfoValue}>{detailItem.description || 'No description'}</Text>
                )}
              </View>
              {/* ClothingItems */}
              <View style={[styles.detailInfoRow, { flexDirection: 'column', alignItems: 'flex-start', marginBottom: 14 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="list-outline" size={20} color="#6b5853" style={{ marginRight: 8 }} />
                    <Text style={[styles.detailInfoLabel, { fontSize: 17 }]}>Clothing Items:</Text>
                  </View>
                  {editMode ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                      {editData?.clothingItems && editData.clothingItems.length > 0 && editData.clothingItems.map((ci: any, idx: number) => (
                        <View
                          key={ci.id}
                          style={{
                            width: '22%',
                            aspectRatio: 0.8,
                            backgroundColor: '#f8f4f1',
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            marginBottom: 12,
                            padding: 6,
                            marginRight: 8,
                            elevation: 2,
                            shadowColor: '#000',
                            shadowOpacity: 0.06,
                            shadowRadius: 4,
                            shadowOffset: { width: 0, height: 1 },
                            position: 'relative',
                          }}
                        >
                          <Image
                            source={{ uri: ci.frontImageThumbUrl || ci.frontImageUrl || ci.image }}
                            style={{
                              width: '100%',
                              height: 64,
                              borderRadius: 8,
                              backgroundColor: '#eee',
                              marginBottom: 6,
                            }}
                            resizeMode="cover"
                          />
                          <Text style={{ color: '#6b5853', fontSize: 13, textAlign: 'center' }} numberOfLines={2}>
                            {ci.name}
                          </Text>
                          <TouchableOpacity
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: '#fff',
                              borderRadius: 10,
                              padding: 2,
                              elevation: 2,
                            }}
                            onPress={() => {
                              setEditData((d: any) => ({
                                ...d,
                                clothingItems: d.clothingItems.filter((_: any, i: number) => i !== idx),
                              }));
                            }}
                          >
                            <Ionicons name="close" size={16} color="#c0392b" />
                          </TouchableOpacity>
                        </View>
                      ))}
                      {/* Buton de adăugare */}
                      <TouchableOpacity
                        style={{
                          width: '22%',
                          aspectRatio: 0.8,
                          backgroundColor: '#ece4df',
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 12,
                          marginRight: 8,
                          borderWidth: 1,
                          borderColor: '#d2c1b7',
                          borderStyle: 'dashed',
                        }}
                        onPress={() => {
                            setDetailModal(false);
                            setSearchClothingModalVisible(true)
  }}
                      >
                        <Ionicons name="add" size={32} color="#6b5853" />
                        <Text style={{ color: '#6b5853', fontSize: 13, textAlign: 'center', marginTop: 4 }}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    detailItem.clothingItems && detailItem.clothingItems.length > 0 ? (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                        {detailItem.clothingItems.map((ci: any) => (
                          <View
                            key={ci.id}
                            style={{
                              width: '22%',
                              aspectRatio: 0.8,
                              backgroundColor: '#f8f4f1',
                              borderRadius: 12,
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              marginBottom: 12,
                              padding: 6,
                              marginRight: 8,
                              elevation: 2,
                              shadowColor: '#000',
                              shadowOpacity: 0.06,
                              shadowRadius: 4,
                              shadowOffset: { width: 0, height: 1 },
                            }}
                          >
                            <Image
                              source={{ uri: ci.frontImageThumbUrl || ci.frontImageUrl || ci.image }}
                              style={{
                                width: '100%',
                                height: 64,
                                borderRadius: 8,
                                backgroundColor: '#eee',
                                marginBottom: 6,
                              }}
                              resizeMode="cover"
                            />
                            <Text style={{ color: '#6b5853', fontSize: 13, textAlign: 'center' }} numberOfLines={2}>
                              {ci.name}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={{ color: '#bbb', marginLeft: 8 }}>No items</Text>
                    )
                  )}
                </View>
            </>
          ) : (
            // --- CLOTHING ITEM DETAILS (default, deja implementat) ---
            <>
              {/* Description */}
              <View style={[styles.detailInfoRow, { alignItems: 'flex-start' }]}>
              <Ionicons name="document-text-outline" size={18} color="#6b5853" style={{ marginRight: 8, marginTop: 0 }} />
              <Text style={[styles.detailInfoLabel, { marginTop: 0 }]}>Description:</Text>
              {editMode ? (
                <View
                  style={{
                    
                    borderBottomWidth: 1,
                    borderColor: '#ece4df',
                    marginLeft: 4,
                  }}
                >
                  <TextInput
                    style={[
                      styles.detailInfoValue,
                      {
                        paddingVertical: 0,
                        paddingHorizontal: 0,
                        textAlignVertical: 'top',
                        borderBottomWidth: 0,
                      },
                    ]}
                    value={editData?.description}
                    onChangeText={v => setEditData((d: any) => ({ ...d, description: v }))}
                    placeholder="Description"
                    multiline
                    numberOfLines={3}
                    underlineColorAndroid="transparent"
                  />
                </View>
              ) : (
                <Text style={styles.detailInfoValue}>{detailItem?.description || 'No description'}</Text>
              )}
            </View>
            {/* Brand */}
            <View style={styles.detailInfoRow}>
              <Ionicons name="pricetag-outline" size={18} color="#6b5853" style={{ marginRight: 8 }} />
              <Text style={styles.detailInfoLabel}>Brand:</Text>
              {editMode ? (
                <TextInput
                  style={[styles.detailInfoValue, { borderBottomWidth: 1, borderColor: '#ece4df', minWidth: 80 }]}
                  value={editData?.brand}
                  onChangeText={v => setEditData((d: any) => ({ ...d, brand: v }))}
                  placeholder="Brand"
                />
              ) : (
                <Text style={styles.detailInfoValue}>{detailItem?.brand}</Text>
              )}
            </View>
            {/* Category */}
            <View style={styles.detailInfoRow}>
              <Ionicons name="albums-outline" size={18} color="#6b5853" style={{ marginRight: 8 }} />
              <Text style={styles.detailInfoLabel}>Category:</Text>
              {editMode ? (
                <TextInput
                  style={[styles.detailInfoValue, { borderBottomWidth: 1, borderColor: '#ece4df', minWidth: 80 }]}
                  value={editData?.category}
                  onChangeText={v => setEditData((d: any) => ({ ...d, category: v }))}
                  placeholder="Category"
                />
              ) : (
                <Text style={styles.detailInfoValue}>{detailItem?.category}</Text>
              )}
            </View>
            {/* Color */}
            <View style={styles.detailInfoRow}>
              <Ionicons name="color-palette-outline" size={18} color="#6b5853" style={{ marginRight: 8 }} />
              <Text style={styles.detailInfoLabel}>Color:</Text>
              {editMode ? (
                <TextInput
                  style={[styles.detailInfoValue, { borderBottomWidth: 1, borderColor: '#ece4df', minWidth: 80 }]}
                  value={editData?.color}
                  onChangeText={v => setEditData((d: any) => ({ ...d, color: v }))}
                  placeholder="Color"
                />
              ) : (
                <Text style={styles.detailInfoValue}>{detailItem?.color}</Text>
              )}
            </View>
            {/* Material */}
            <View style={styles.detailInfoRow}>
              <Ionicons name="layers-outline" size={18} color="#6b5853" style={{ marginRight: 8 }} />
              <Text style={styles.detailInfoLabel}>Material:</Text>
              {editMode ? (
                <TextInput
                  style={[styles.detailInfoValue, { borderBottomWidth: 1, borderColor: '#ece4df', minWidth: 80 }]}
                  value={editData?.material}
                  onChangeText={v => setEditData((d: any) => ({ ...d, material: v }))}
                  placeholder="Material"
                />
              ) : (
                <Text style={styles.detailInfoValue}>{detailItem?.material}</Text>
              )}
            </View>
            {/* Tags */}
            <View style={[styles.detailInfoRow, { alignItems: 'flex-start' }]}>
              <Ionicons name="pricetags-outline" size={18} color="#6b5853" style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={styles.detailInfoLabel}>Tags:</Text>
              {editMode ? (
                <TextInput
                  style={[styles.detailInfoValue, { borderBottomWidth: 1, borderColor: '#ece4df', minWidth: 80, flex: 1 }]}
                  value={Array.isArray(editData?.tags) ? editData.tags.join(', ') : editData?.tags}
                  onChangeText={v => setEditData((d: any) => ({ ...d, tags: v }))}
                  placeholder="tag1, tag2"
                />
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 1 }}>
                  {detailItem?.tags && detailItem.tags.map((tag: string, idx: number) => (
                    <View key={idx} style={{
                      backgroundColor: '#ece4df',
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      marginRight: 6,
                      marginBottom: 4,
                    }}>
                      <Text style={{ color: '#6b5853', fontSize: 13 }}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            {/* Print type */}
            <View style={styles.detailInfoRow}>
              <Ionicons name="print-outline" size={18} color="#6b5853" style={{ marginRight: 8 }} />
              <Text style={styles.detailInfoLabel}>Print type:</Text>
              {editMode ? (
                <TextInput
                  style={[styles.detailInfoValue, { borderBottomWidth: 1, borderColor: '#ece4df', minWidth: 80 }]}
                  value={editData?.printType}
                  onChangeText={v => setEditData((d: any) => ({ ...d, printType: v }))}
                  placeholder="Print type"
                />
              ) : (
                <Text style={styles.detailInfoValue}>{detailItem?.printType}</Text>
              )}
            </View>
            {/* Print description */}
            <View style={styles.detailInfoRow}>
              <Ionicons name="information-circle-outline" size={18} color="#6b5853" style={{ marginRight: 8 }} />
              <Text style={styles.detailInfoLabel}>Print details:</Text>
              {editMode ? (
                <TextInput
                  style={[
                    styles.detailInfoValue,
                    {
                      borderBottomWidth: 1,
                      borderColor: '#ece4df',
                      minWidth: 80,
                    //  minHeight: 48,
                      textAlignVertical: 'top',
                    },
                  ]}
                  value={editData?.printDescription}
                  onChangeText={v => setEditData((d: any) => ({ ...d, printDescription: v }))}
                  placeholder="Print details"
                  multiline
                  numberOfLines={0}
                />
              ) : (
                <Text style={styles.detailInfoValue}>{detailItem?.printDescription}</Text>
              )}
            </View>
            {/* Number of wears (not editable) */}
            {typeof detailItem?.numberOfWears === 'number' && !editMode && (
              <View style={styles.detailInfoRow}>
                <Ionicons name="repeat-outline" size={18} color="#6b5853" style={{ marginRight: 8 }} />
                <Text style={styles.detailInfoLabel}>Worn:</Text>
                <Text style={styles.detailInfoValue}>{detailItem.numberOfWears} times</Text>
              </View>
            )}
            </>
          )}
        </View>
          {editMode && (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#ece4df',
                  borderRadius: 10,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  marginRight: 10,
                }}
                onPress={() => setEditMode(false)}
                
              >
                <Text style={{ color: '#6b5853', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#6b5853',
                  borderRadius: 10,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
                onPress={handleSaveEdit}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  </View>
</Modal>

      {/* Search clothing modal */}
      <Modal
  visible={searchClothingModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setSearchClothingModalVisible(false)}
>
  <View style={styles.detailModalOverlay}>
    <KeyboardAvoidingView
      style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.detailModalContent, { padding: 20 }]}>
        <Text style={styles.detailTitle}>Search clothing item</Text>
        <TextInput
          style={[styles.detailInfoValue, { borderWidth: 1, borderColor: '#d2c1b7', borderRadius: 8, marginBottom: 12, backgroundColor: '#f3ece8', padding: 10 }]}
          placeholder="Enter item name"
          value={searchClothingText}
          onChangeText={setSearchClothingText}
          autoFocus
        />
        {searchClothingLoading ? (
          <ActivityIndicator size="large" color="#6b5853" />
        ) : (
          <ScrollView
            style={{ maxHeight: 220, width: '100%' }}
            contentContainerStyle={{ alignItems: 'center', paddingBottom: 10 }}
            keyboardShouldPersistTaps="handled"
          >
            {searchClothingResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={{
                  width: '100%',
                  backgroundColor: '#f3ece8',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: '#d2c1b7',
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 10,
                }}
                onPress={() => {
                  setEditData((d: any) => ({
                    ...d,
                    clothingItems: d.clothingItems
                      ? [...d.clothingItems, item]
                      : [item],
                  }));
                  setSearchClothingModalVisible(false);
                  setSearchClothingText('');
                  setSearchClothingResults([]);
                  setDetailModal(true);
                }}
              >
                <Image
                  source={{ uri: item.frontImageUrl || item.frontImageThumbUrl || item.image }}
                  style={{ width: 60, height: 60, borderRadius: 8, marginRight: 12 }}
                />
                <Text style={{ color: '#6b5853', fontWeight: 'bold', fontSize: 16, flex: 1 }}>
                  {item.name || item.category || 'Item'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <TouchableOpacity
          style={{ marginTop: 10, alignSelf: 'center', padding: 10 }}
          onPress={() => setSearchClothingModalVisible(false)}
        >
          <Text style={{ color: '#c0392b', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  </View>
</Modal>

      {/* Location modal */}
      <Modal visible={locationModal} transparent animationType="fade" onRequestClose={() => setLocationModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLocationModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose location</Text>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f3ece8',
                borderRadius: 8,
                padding: 8,
                marginBottom: 10,
                width: 200,
                justifyContent: 'center',
              }}
              onPress={handleGetCurrentLocation}
              disabled={gettingLocation}
            >
              <Ionicons name="locate" size={18} color="#6b5853" style={{ marginRight: 6 }} />
              <Text style={{ color: '#6b5853', fontWeight: 'bold' }}>
                {gettingLocation ? 'Detecting...' : 'Use current location'}
              </Text>
              {gettingLocation && <ActivityIndicator size="small" color="#6b5853" style={{ marginLeft: 8 }} />}
            </TouchableOpacity>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#d2c1b7',
                borderRadius: 8,
                padding: 8,
                marginBottom: 12,
                width: 200,
                backgroundColor: '#f3ece8',
              }}
              placeholder="Search city, village, county"
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            {searchLoading && <ActivityIndicator size="small" color="#6b5853" style={{ marginBottom: 10 }} />}
            <FlatList
              data={searchResults}
              keyExtractor={item => item.name + item.lat}
              style={{ maxHeight: 180, width: 220 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ paddingVertical: 10, alignItems: 'flex-start' }}
                  onPress={() => {
                    setUser(u => ({
                      ...u,
                      location: item.name,
                      lat: item.lat,
                      lon: item.lon,
                    }));
                    setLocationModal(false);
                    setSearch('');
                    setSearchResults([]);
                  }}
                >
                  <Text style={{ fontSize: 15, color: '#222' }}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                search.length > 1 && !searchLoading && searchError ? (
                  <Text style={{ color: '#888', textAlign: 'center', marginTop: 10 }}>{searchError}</Text>
                ) : null
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showHelpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.helpModalContent}>
            <Text style={styles.helpModalTitle}>How to use your Closet</Text>
            <View style={styles.helpModalDivider} />
            <Text style={styles.helpModalText}>
              <Ionicons name="hand-left-outline" size={18} color="#6b5853" />{' '}
              <Text style={{ fontWeight: 'bold' }}>Long press</Text> a card to edit or delete it.
            </Text>
            <Text style={styles.helpModalText}>
              <Ionicons name="finger-print-outline" size={18} color="#6b5853" />{' '}
              <Text style={{ fontWeight: 'bold' }}>Tap</Text> a card to flip and see its description.
            </Text>
            <Text style={styles.helpModalText}>
              <Ionicons name="save-outline" size={18} color="#6b5853" />{' '}
              <Text style={{ fontWeight: 'bold' }}>Save</Text> your changes by pressing the <Text style={{ fontWeight: 'bold' }}>Save</Text> button after editing.
            </Text>
            <Text style={styles.helpModalText}>
              <Ionicons name="close-outline" size={18} color="#6b5853" />{' '}
              <Text style={{ fontWeight: 'bold' }}>Cancel</Text> editing anytime by pressing <Text style={{ fontWeight: 'bold' }}>Cancel</Text>.
            </Text>
            <TouchableOpacity style={styles.helpModalButton} onPress={() => setShowHelpModal(false)}>
              <Text style={styles.helpModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 10,
    marginTop: 20,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  location: {
    color: '#888',
    fontSize: 13,
    maxWidth: 170,
  },
  calendarWeatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 10,
  },
  calendarWeatherBox: {
    backgroundColor: '#f8f4f1',
    borderRadius: 12,
    padding: 12,
    flex: 1,
  },
  calendarWeatherDate: {
    color: '#6b5853',
    fontSize: 14,
    marginBottom: 2,
  },
  calendarWeatherTemp: {
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabsRow: {
    marginTop: -20,
    flexDirection: 'row',
    marginHorizontal: 18,
    marginBottom: 0,
    borderBottomWidth: 0,
    borderColor: '#eee',
    backgroundColor: 'transparent',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 0,
    height: 44,
    position: 'relative',
  },
  tab: {
    fontSize: 17,
    color: '#bbb',
    fontWeight: 'bold',
    paddingBottom: 0,
  },
  tabActive: {
    color: '#222',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -10,
    left: '0%',
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: '#222',
  },
  cardTouchable: {
    flex: 1,
    minHeight: 260,
  },
  card: {
    width: CARD_WIDTH,
   // minHeight: 220,
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardHidden: {
    opacity: 0,
  },
  cardBack: {
    backgroundColor: '#f8f4f1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    minHeight: 260,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#6b5853',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
    minHeight: 40,
    paddingHorizontal: 6,
  },
  cardImage: {
    width: CARD_WIDTH - 24,
    height: 220 - 24,
    borderRadius: 12,
    backgroundColor: '#eee',
    marginBottom: 12,
  },
  cardDescTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#6b5853',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
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
    padding: 24,
    width: 260,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModalContent: {
      backgroundColor: '#fff',
  borderRadius: 20,
  padding: 18,
  width: '94%',         // sau '100%' dacă vrei să folosești doar marginHorizontal
  maxWidth: 420,        // opțional, pentru tablete
  elevation: 8,
  marginHorizontal: 20, // sau mai mare pentru margini mai late
  marginTop: 50,
  maxHeight: '90%',
  alignItems: 'stretch',
  },
  detailTitle: {
    fontSize: 60,
    fontFamily: 'Licorice',
    color: '#6b5853',
    marginBottom: 12,
    marginTop: 0,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  detailImagesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  detailImage: {
    width: 110,
    height: 110,
    borderRadius: 14,
    backgroundColor: '#eee',
  },
  detailImagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 14,
    backgroundColor: '#f3ece8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d2c1b7',
  },
  detailImagePlaceholderText: {
    color: '#bbb',
    fontSize: 14,
    textAlign: 'center',
  },
  detailInfoGrid: {
    marginTop: 8,
    width: '100%',
    gap: 0,
  },
  detailInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
    flexWrap: 'wrap',
  },
  detailInfoLabel: {
    fontWeight: '600',
    color: '#6b5853',
    fontSize: 15,
    marginRight: 4,
    minWidth: 80,
  },
  detailInfoValue: {
    color: '#444',
    fontSize: 15,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  helpModalContent: {
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
  helpModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6b5853',
    marginBottom: 10,
    textAlign: 'center',
  },
  helpModalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#ece4df',
    marginBottom: 16,
  },
  helpModalText: {
    fontSize: 16,
    color: '#6b5853',
    marginBottom: 12,
    textAlign: 'left',
    width: '100%',
  },
  helpModalButton: {
    marginTop: 18,
    backgroundColor: '#6b5853',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  helpModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});