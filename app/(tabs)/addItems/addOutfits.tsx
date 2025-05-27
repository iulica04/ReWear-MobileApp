import { API_BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddOutfitsScreen() {
  const navigation = useNavigation();
  const [images, setImages] = useState<(string | null)[]>([null, null]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pentru editare rezultat outfit
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [analyzedItems, setAnalyzedItems] = useState<any[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [editFields, setEditFields] = useState<any>(null);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(80);

  // Pentru matching
  const [matchingModalVisible, setMatchingModalVisible] = useState(false);
  const [matchingResults, setMatchingResults] = useState<any[][]>([]);
  const [matchingIndex, setMatchingIndex] = useState(0);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [selectedMatches, setSelectedMatches] = useState<(any | null)[]>([]);

  // Pentru review și adăugare outfit
  const [outfitReview, setOutfitReview] = useState<null | { name: string; season: string; description: string; style?: string}>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [finalLoading, setFinalLoading] = useState(false);

  // Pentru căutare
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Loading overlay între modale
  const [interModalLoading, setInterModalLoading] = useState(false);
  const icons = [
    { name: 'shirt-outline', color: '#6b5853' },
    { name: 'pricetag-outline', color: '#c5a494' },
    { name: 'woman-outline', color: '#6b5853' },
  ];
  const [iconIndex, setIconIndex] = useState(0);

  useEffect(() => {
    if (!interModalLoading) return;
    const interval = setInterval(() => {
      setIconIndex(i => (i + 1) % icons.length);
    }, 500);
    return () => clearInterval(interval);
  }, [interModalLoading]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (searchModalVisible && searchText.length > 0) {
      setSearchLoading(true);
      timeout = setTimeout(async () => {
        try {
          const userId = await AsyncStorage.getItem('userId');
          const res = await fetch(
            `${API_BASE_URL}/api/ClothingItem/get-by-name?UserId=${userId}&Name=${encodeURIComponent(searchText)}`
          );
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data);
          } else {
            setSearchResults([]);
          }
        } catch {
          setSearchResults([]);
        }
        setSearchLoading(false);
      }, 350);
    } else {
      setSearchResults([]);
    }
    return () => clearTimeout(timeout);
  }, [searchText, searchModalVisible]);

  const handleSelectSearchedItem = (item: any) => {
    const updated = [...selectedMatches];
    updated[matchingIndex] = item;
    setSelectedMatches(updated);

    // Afișează DOAR articolul selectat la matchingIndex
    const newMatchingResults = [...matchingResults];
    newMatchingResults[matchingIndex] = [item];
    setMatchingResults(newMatchingResults);

    setSearchModalVisible(false);
    setTimeout(() => setMatchingModalVisible(true), 300); // redeschide modalul de matching după un scurt delay
  };

  // Deschide modalul pentru a alege sursa imaginii
  const openImagePickerModal = (index: number) => {
    setCurrentIndex(index);
    setModalVisible(true);
  };

  // Selectează imagine din cameră sau galerie
  const pickImage = async (index: number, fromCamera: boolean) => {
    let permission;
    if (fromCamera) {
      permission = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }
    if (!permission.granted) {
      setModalVisible(false);
      return;
    }
    let result;
    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [4, 5],
        quality: 0.7,
        base64: true,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        aspect: [4, 5],
        quality: 0.7,
        base64: true,
      });
    }
    setModalVisible(false);
    if (!result.canceled && result.assets && result.assets[0].base64) {
      const newImages = [...images];
      newImages[index] = result.assets[0].base64;
      setImages(newImages);
    }
  };

  // Șterge imaginea de la indexul dat
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  // Trimite poza front la analyze și deschide modalul pentru editare
  const handleAnalyze = async () => {
    if (!images[0]) {
      Alert.alert('Photo required', 'Please add at least a front photo.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/Outfit/analyze-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ImageFront: images[0],
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setAnalyzedItems(data);
          setCurrentItemIndex(0);
          setEditFields({
            ...data[0],
            tags: Array.isArray(data[0].tags) ? data[0].tags : [],
          });
          setEditModalVisible(true);
        } else {
          Alert.alert('No items detected', 'No outfit items were detected in the image.');
        }
      } else {
        Alert.alert('Error', 'Could not analyze outfit.');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server.');
    }
    setLoading(false);
  };

  // Navigare între itemi
  const goToPrevItem = () => {
    if (currentItemIndex > 0) {
      const idx = currentItemIndex - 1;
      setCurrentItemIndex(idx);
      setEditFields({
        ...analyzedItems[idx],
        tags: Array.isArray(analyzedItems[idx].tags) ? analyzedItems[idx].tags : [],
      });
      setShowTagInput(false);
      setNewTag('');
    }
  };
  const goToNextItem = () => {
    if (currentItemIndex < analyzedItems.length - 1) {
      const idx = currentItemIndex + 1;
      setCurrentItemIndex(idx);
      setEditFields({
        ...analyzedItems[idx],
        tags: Array.isArray(analyzedItems[idx].tags) ? analyzedItems[idx].tags : [],
      });
      setShowTagInput(false);
      setNewTag('');
    }
  };

  // Actualizează câmpurile editabile
  const handleFieldChange = (field: string, value: string) => {
    if (field === 'tags') {
      setEditFields({ ...editFields, tags: value.split(',').map((t: string) => t.trim()) });
    } else {
      setEditFields({ ...editFields, [field]: value });
    }
  };

  // Adaugă tag nou
  const handleAddTag = () => {
    if (newTag.trim()) {
      setEditFields({ ...editFields, tags: [...(editFields?.tags || []), newTag.trim()] });
      setNewTag('');
    }
    setShowTagInput(false);
  };

  // Șterge tag
  const handleRemoveTag = (idx: number) => {
    const newTags = editFields.tags.filter((_: string, i: number) => i !== idx);
    setEditFields({ ...editFields, tags: newTags });
  };

  // Matching logic cu userId din AsyncStorage
  const handleMatchWithWardrobe = async () => {
    setEditModalVisible(false);
    setInterModalLoading(true);
    setMatchingLoading(true);
    const results: any[][] = [];
    const selected: (any | null)[] = [];
    let userId;
    try {
      userId = await AsyncStorage.getItem('userId');
    } catch {}
    for (let i = 0; i < analyzedItems.length; i++) {
      const item = i === currentItemIndex ? editFields : analyzedItems[i];
      const itemWithUser = { ...item, userId };
      try {
        const response = await fetch(`${API_BASE_URL}/api/Outfit/match-items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemWithUser),
        });
        if (response.ok) {
          const data = await response.json();
          results.push(data);
        } else {
          results.push([]);
        }
      } catch {
        results.push([]);
      }
      selected.push(null);
    }
    setMatchingResults(results);
    setMatchingIndex(0);
    setSelectedMatches(selected);
    setMatchingLoading(false);
    setInterModalLoading(false);
    setMatchingModalVisible(true);
  };

  // După ce utilizatorul alege toate hainele, cere detalii outfit și deschide review
  const handleFinishMatching = async () => {
    setMatchingModalVisible(false);
    setInterModalLoading(true);
    setFinalLoading(true);
    try {
      const analyzeRes = await fetch(`${API_BASE_URL}/api/Outfit/analyze-outfit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageFront: images[0] }),
      });
      if (!analyzeRes.ok) throw new Error('Failed to analyze outfit');
      const outfitDetails = await analyzeRes.json();
      setOutfitReview(outfitDetails);
      setReviewModalVisible(true);
    } catch (e) {
      Alert.alert('Error', 'Could not analyze outfit details.');
    }
    setFinalLoading(false);
    setInterModalLoading(false);
  };

  // Selectează un match pentru articolul curent
  const handleSelectMatch = (match: any) => {
    const updated = [...selectedMatches];
    updated[matchingIndex] = match;
    setSelectedMatches(updated);
    if (matchingIndex < analyzedItems.length - 1) {
      setMatchingIndex(matchingIndex + 1);
    } else {
      handleFinishMatching();
    }
  };

  // Adaugă outfitul în baza de date
  const handleAddOutfitToWardrobe = async () => {
    setReviewModalVisible(false);
    setInterModalLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const clothingItemIds = selectedMatches
        .filter(Boolean)
        .map((item: any) => item.id);

      const payload = {
        userId,
        name: outfitReview?.name || '',
        clothingItemIds,
        season: outfitReview?.season || '',
        description: outfitReview?.description || '',
        style: outfitReview?.style || '',
        imageFront: images[0],
      };

      const res = await fetch(`${API_BASE_URL}/api/Outfit/create-outfit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setReviewModalVisible(false);
        Alert.alert('Success', 'Outfit added to your wardrobe!');
        setImages([null, null]);
        setAnalyzedItems([]);
        setCurrentItemIndex(0);
        setEditFields(null);
        setNewTag('');
        setShowTagInput(false);
        setDescriptionHeight(80);
        setMatchingResults([]);
        setMatchingIndex(0);
        setSelectedMatches([]);
        setOutfitReview(null);
        setSearchText('');
        setSearchResults([]);
      } else {
        Alert.alert('Error', 'Could not add outfit.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not connect to server.');
    }
    setInterModalLoading(false);
  };

  // Permite editarea detaliilor outfitului în review
  const handleOutfitFieldChange = (field: string, value: string) => {
    setOutfitReview((prev) =>
      prev ? { ...prev, [field]: value } : prev
    );
  };

  return (
    <View style={styles.container}>
      {/* Overlay loading între modale */}
      {interModalLoading && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.85)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <Ionicons name={icons[iconIndex].name as any} size={64} color={icons[iconIndex].color} />
          <Text style={{ marginTop: 24, color: '#6b5853', fontSize: 18, fontWeight: 'bold' }}>
            Loading...
          </Text>
        </View>
      )}

      {/* Săgeată back */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 60, left: 18, zIndex: 10 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="#222" />
      </TouchableOpacity>

      {/* Header */}
      <Text style={styles.headerTitle}>Add Outfits</Text>
      <View style={[styles.instructionsBox, { flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 24, marginTop: 0, marginBottom: 10 }]}>
        <Ionicons name="information-circle-outline" size={22} color="#6b5853" style={{ marginRight: 8, marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.instructionsText}>
            Add an outfit by uploading a photo of the{' '}
            <Text style={{ fontWeight: 'bold' }}>front</Text>. If it has a distinctive{' '}
            <Text style={{ fontWeight: 'bold' }}>back</Text>, include that too.
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Poze */}
        <View style={styles.imagesRow}>
          {[0, 1].map((idx) => (
            <View key={idx} style={styles.imageBox}>
              {images[idx] ? (
                <>
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${images[idx]}` }}
                    style={styles.image}
                  />
                  <TouchableOpacity
                    style={styles.deleteIcon}
                    onPress={() => removeImage(idx)}
                  >
                    <Ionicons name="close-circle" size={28} color="#c00" />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.addIconBox} onPress={() => openImagePickerModal(idx)}>
                  <Ionicons name="add" size={40} color="#aaa" />
                  <Text style={styles.imageLabel}>{idx === 0 ? 'Front' : 'Back (optional)'}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Buton analiză */}
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.analyzeButtonText}>Analyze Outfit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>


      {/* Modal pentru alegere sursă imagine */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      > 
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose image source</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => pickImage(currentIndex, true)}
            >
              <Ionicons name="camera" size={24} color="#222" />
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => pickImage(currentIndex, false)}
            >
              <Ionicons name="image" size={24} color="#222" />
              <Text style={styles.modalButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal pentru editare fiecare articol din outfit */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.editModalOverlay}>
            <KeyboardAvoidingView
              style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={0}
            >
              <View style={styles.editModalContent}>
                <Text style={styles.resultTitle}>Edit Item Details</Text>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  <Text style={[styles.instructionsText, { marginBottom: 12 }]}>
                    This description was generated <Text style={{ fontWeight: 'bold' }}>automatically</Text> and may not fully reflect <Text style={{ fontWeight: 'bold' }}>reality</Text>.
                    We recommend reviewing and adjusting it where necessary.
                    The <Text style={{ fontWeight: 'bold' }}>"unknown"</Text> label indicates that certain information could not be determined.
                  </Text>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editFields?.name}
                    onChangeText={text => handleFieldChange('name', text)}
                    placeholder="Name"
                  />
                  <Text style={styles.label}>Category</Text>
                  <TextInput
                    style={styles.input}
                    value={editFields?.category}
                    onChangeText={text => handleFieldChange('category', text)}
                    placeholder="Category"
                  />
                  <Text style={styles.label}>Tags</Text>
                  <View style={styles.tagsWrap}>
                    {editFields?.tags?.map((tag: string, idx: number) => (
                      <View key={idx} style={styles.tagChip}>
                        <Text style={styles.tagText}>{tag}</Text>
                        <TouchableOpacity onPress={() => handleRemoveTag(idx)}>
                          <Ionicons name="close" size={16} color="#c00" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {showTagInput ? (
                      <TextInput
                        style={[styles.tagChip, styles.tagInputChip]}
                        value={newTag}
                        autoFocus
                        onChangeText={setNewTag}
                        placeholder="Tag"
                        onBlur={() => {
                          setShowTagInput(false);
                          setNewTag('');
                        }}
                        onSubmitEditing={() => {
                          if (newTag.trim()) {
                            setEditFields({ ...editFields, tags: [...(editFields?.tags || []), newTag.trim()] });
                          }
                          setShowTagInput(false);
                          setNewTag('');
                        }}
                        returnKeyType="done"
                      />
                    ) : (
                      <TouchableOpacity style={styles.tagAddChip} onPress={() => setShowTagInput(true)}>
                        <Ionicons name="add" size={18} color="#6b5853" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.label}>Color</Text>
                  <TextInput
                    style={styles.input}
                    value={editFields?.color}
                    onChangeText={text => handleFieldChange('color', text)}
                    placeholder="Color"
                  />
                  <Text style={styles.label}>Brand</Text>
                  <TextInput
                    style={styles.input}
                    value={editFields?.brand}
                    onChangeText={text => handleFieldChange('brand', text)}
                    placeholder="Brand"
                  />
                  <Text style={styles.label}>Material</Text>
                  <TextInput
                    style={styles.input}
                    value={editFields?.material}
                    onChangeText={text => handleFieldChange('material', text)}
                    placeholder="Material"
                  />
                  <Text style={styles.label}>Print Type</Text>
                  <TextInput
                    style={styles.input}
                    value={editFields?.printType}
                    onChangeText={text => handleFieldChange('printType', text)}
                    placeholder="Print Type"
                  />
                  <Text style={styles.label}>Print Description</Text>
                  <TextInput
                    style={styles.input}
                    value={editFields?.printDescription}
                    onChangeText={text => handleFieldChange('printDescription', text)}
                    placeholder="Print Description"
                  />
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { height: undefined, minHeight: 80, textAlignVertical: 'top' }
                    ]}
                    value={editFields?.description}
                    onChangeText={text => handleFieldChange('description', text)}
                    placeholder="Description"
                    multiline
                    scrollEnabled={false}
                    onContentSizeChange={e => setDescriptionHeight(Math.max(80, e.nativeEvent.contentSize.height))}
                  />
                  {/* Navigare între itemi */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
                    <TouchableOpacity
                      style={[styles.navButton, currentItemIndex === 0 && { opacity: 0.5 }]}
                      onPress={goToPrevItem}
                      disabled={currentItemIndex === 0}
                    >
                      <Ionicons name="arrow-back" size={22} color="#6b5853" />
                      <Text style={{ color: '#6b5853', fontWeight: 'bold', marginLeft: 6 }}>Back</Text>
                    </TouchableOpacity>
                    <Text style={{ alignSelf: 'center', color: '#6b5853', fontWeight: 'bold' }}>
                      {currentItemIndex + 1} / {analyzedItems.length}
                    </Text>
                    <TouchableOpacity
                      style={[styles.navButton, currentItemIndex === analyzedItems.length - 1 && { opacity: 0.5 }]}
                      onPress={goToNextItem}
                      disabled={currentItemIndex === analyzedItems.length - 1}
                    >
                      <Text style={{ color: '#6b5853', fontWeight: 'bold', marginRight: 6 }}>Next</Text>
                      <Ionicons name="arrow-forward" size={22} color="#6b5853" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
  style={[styles.cancelButton, { backgroundColor: '#c00', marginTop: 10 }]}
  onPress={() => {
    // Șterge articolul curent din analyzedItems
    const newAnalyzed = analyzedItems.filter((_, idx) => idx !== currentItemIndex);
    if (newAnalyzed.length === 0) {
      setEditModalVisible(false);
      setAnalyzedItems([]);
      setEditFields(null);
      return;
    }
    setAnalyzedItems(newAnalyzed);
    // Ajustează indexul și câmpurile
    const newIndex = Math.max(0, currentItemIndex - (currentItemIndex === newAnalyzed.length ? 1 : 0));
    setCurrentItemIndex(newIndex);
    setEditFields({
      ...newAnalyzed[newIndex],
      tags: Array.isArray(newAnalyzed[newIndex].tags) ? newAnalyzed[newIndex].tags : [],
    });
  }}
>
  <Text style={[styles.cancelButtonText, { color: '#fff' }]}>Delete item</Text>
</TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cancelButton, { backgroundColor: '#6b5853', marginTop: 10 }]}
                    onPress={handleMatchWithWardrobe}
                  >
                    <Text style={[styles.cancelButtonText, { color: '#fff' }]}>
                      Match with My Wardrobe
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal pentru matching */}
      <Modal
        visible={matchingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMatchingModalVisible(false)}
      >
        <View style={styles.editModalOverlay}>
          <KeyboardAvoidingView
            style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
          >
            <View style={styles.editModalContent}>
              {matchingLoading ? (
                <ActivityIndicator size="large" color="#6b5853" />
              ) : (
                <>
                  <Text style={styles.resultTitle}>
                    Choose the best match for "{analyzedItems[matchingIndex]?.name || ''}"
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
  {matchingResults[matchingIndex]?.map((item, idx) => (
    <TouchableOpacity
      key={item.id}
      style={[
        {
          flex: 1,
          margin: 4,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: selectedMatches[matchingIndex]?.id === item.id ? '#6b5853' : '#d2c1b7',
          backgroundColor: selectedMatches[matchingIndex]?.id === item.id ? '#f5e9e2' : '#f3ece8',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: 110,
          height: 120,
        },
        selectedMatches[matchingIndex]?.id === item.id && {
          shadowColor: '#6b5853',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 6,
        },
      ]}
      onPress={() => handleSelectMatch(item)}
    >
      <Image
        source={{ uri: item.frontImageUrl }}
        style={{ width: 100, height: 120, borderRadius: 10, marginBottom: 4 }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  ))}
</View>
<TouchableOpacity
  style={{
    marginTop: 18,
    backgroundColor: '#e6ded8',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#6b5853',
  }}
  onPress={() => {
    setMatchingModalVisible(false);
    setTimeout(() => setSearchModalVisible(true), 300); // dă un mic delay pentru a evita suprapunerea
  }}
>
  <Text style={{ color: '#6b5853', fontWeight: 'bold', fontSize: 16 }}>
    None match
  </Text>
</TouchableOpacity>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
                    <TouchableOpacity
                      style={[styles.navButton, matchingIndex === 0 && { opacity: 0.5 }]}
                      onPress={() => setMatchingIndex(matchingIndex - 1)}
                      disabled={matchingIndex === 0}
                    >
                      <Ionicons name="arrow-back" size={22} color="#6b5853" />
                      <Text style={{ color: '#6b5853', fontWeight: 'bold', marginLeft: 6 }}>Back</Text>
                    </TouchableOpacity>
                    <Text style={{ alignSelf: 'center', color: '#6b5853', fontWeight: 'bold' }}>
                      {matchingIndex + 1} / {analyzedItems.length}
                    </Text>
                    <TouchableOpacity
                      style={[styles.navButton, matchingIndex === analyzedItems.length - 1 && { opacity: 0.5 }]}
                      onPress={() => setMatchingIndex(matchingIndex + 1)}
                      disabled={matchingIndex === analyzedItems.length - 1}
                    >
                      <Text style={{ color: '#6b5853', fontWeight: 'bold', marginRight: 6 }}>Next</Text>
                      <Ionicons name="arrow-forward" size={22} color="#6b5853" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setMatchingModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Modal pentru review outfit */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.editModalOverlay}>
            <KeyboardAvoidingView
                style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                
                <View style={styles.editModalContent}>
                    
                <ScrollView
                    contentContainerStyle={{ alignItems: 'center', justifyContent: 'flex-start' , padding: 20, }}
                    showsVerticalScrollIndicator={false}
                >
                    {finalLoading ? (
                    <ActivityIndicator size="large" color="#6b5853"/>
                    ) : (
                    <>
                        <Text style={styles.resultTitle}>Review & Edit Outfit</Text>
                        <Image
                        source={{ uri: `data:image/jpeg;base64,${images[0]}` }}
                        style={{
                            width: 160,
                            height: 240,
                            borderRadius: 18,
                            alignSelf: 'center',
                            marginBottom: 16,
                            borderWidth: 2,
                            borderColor: '#d2c1b7',
                        }}
                        />

                        {/* Carduri cu hainele selectate */}
                        <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={true}
                        contentContainerStyle={styles.selectedItemsScroll}
                        style={styles.selectedItemsRow}
                        >
                        {selectedMatches.map(
                            (item, idx) =>
                            item && (
                                <View key={item.id || idx} style={styles.itemCard}>
                                <Image
                                    source={{ uri: item.frontImageUrl }}
                                    style={styles.itemCardImage}
                                    resizeMode="cover"
                                />
                                <Text
                                    style={styles.itemCardText}
                                    numberOfLines={1}
                                >
                                    {item.name || item.category || 'Item'}
                                </Text>
                                </View>
                            )
                        )}
                        </ScrollView>

                        {/* Editable outfit details */}
                        <View style={{ width: '100%', marginTop: 8 }}>
                        {/* Name */}
                        <Text style={[styles.label, { textAlign: 'left', width: '100%', marginLeft: 0 }]}>Name</Text>
                        <TextInput
                            style={[styles.input, { textAlign: 'left', width: '100%', marginLeft: 0 }]}
                            value={outfitReview?.name}
                            onChangeText={(text) => handleOutfitFieldChange('name', text)}
                            placeholder="Outfit name"
                        />

                        {/* Season */}
                        <Text style={[styles.label, { textAlign: 'left', width: '100%', marginLeft: 0 }]}>Season</Text>
                        <View style={styles.seasonGrid}>
                            {['spring', 'summer', 'autumn', 'winter'].map((season) => (
                            <TouchableOpacity
                                key={season}
                                style={[
                                styles.seasonCard,
                                outfitReview?.season?.toLowerCase() === season && styles.seasonCardSelected,
                                ]}
                                onPress={() => handleOutfitFieldChange('season', season)}
                                activeOpacity={0.8}
                            >
                                <Text
                                style={[
                                    styles.seasonCardText,
                                    outfitReview?.season?.toLowerCase() === season && styles.seasonCardTextSelected,
                                ]}
                                >
                                {season.charAt(0).toUpperCase() + season.slice(1)}
                                </Text>
                            </TouchableOpacity>
                            ))}
                        </View>

                        {/* Description */}
                        <Text style={[styles.label, { textAlign: 'left', width: '100%', marginLeft: 0 }]}>Description</Text>
                        <TextInput
                            style={[styles.input, { minHeight: 80, textAlign: 'left', width: '100%', marginLeft: 0 }]}
                            value={outfitReview?.description}
                            onChangeText={(text) => handleOutfitFieldChange('description', text)}
                            placeholder="Description"
                            multiline
                        />
                        </View>

                        {/* Style */}
                        <Text style={[styles.label, { textAlign: 'left', width: '100%', marginLeft: 0 }]}>Style</Text>
                        <TextInput
                          style={[styles.input, { textAlign: 'left', width: '100%', marginLeft: 0 }]}
                          value={outfitReview?.style}
                          onChangeText={(text) => handleOutfitFieldChange('style', text)}
                          placeholder="Style (ex: casual, elegant, sport)"
                        />

                        <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: '#6b5853', marginTop: 18 }]}
                        onPress={handleAddOutfitToWardrobe}
                        >
                        <Text style={[styles.cancelButtonText, { color: '#fff' }]}>
                            Add Outfit to Wardrobe
                        </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setReviewModalVisible(false)}
                        >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </>
                    )}
                </ScrollView>
                </View>

                
            </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
  visible={searchModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setSearchModalVisible(false)}
>
  <View style={styles.editModalOverlay}>
    <KeyboardAvoidingView
      style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.editModalContent, { padding: 20 }]}>
        <Text style={styles.resultTitle}>Search clothing item</Text>
        <TextInput
          style={[styles.input, { marginBottom: 12 }]}
          placeholder="Enter item name"
          value={searchText}
          onChangeText={setSearchText}
          autoFocus
        />
        {searchLoading ? (
          <ActivityIndicator size="large" color="#6b5853" />
        ) : (
          <ScrollView
            style={{ maxHeight: 220, width: '100%' }}
            contentContainerStyle={{ alignItems: 'center', paddingBottom: 10 }}
            keyboardShouldPersistTaps="handled"
          >
            {searchResults.map((item) => (
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
                onPress={() => handleSelectSearchedItem(item)}
              >
                <Image
                  source={{ uri: item.frontImageUrl }}
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
          style={[styles.cancelButton, { marginTop: 10 }]}
          onPress={() => setSearchModalVisible(false)}
        >
          <Text style={styles.cancelButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  </View>
</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(236, 228, 223)',
  },
  headerTitle: {
    fontFamily: 'Licorice',
    fontSize: 60,
    color: '#222',
    textAlign: 'center',
    marginTop: 110,
    marginBottom: 10,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 40,
    justifyContent: 'center',
  },
  imagesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 30,
    marginBottom: 20,
  },
  imageBox: {
    width: 160,
    height: 240,
    borderRadius: 18,
    backgroundColor: '#f3ece8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d2c1b7',
    position: 'relative',
  },
  addIconBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  imageLabel: {
    marginTop: 8,
    color: '#888',
    fontSize: 14,
  },
  deleteIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 14,
    zIndex: 2,
  },
  analyzeButton: {
    marginTop: 30,
    backgroundColor: '#6b5853',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 180,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3ece8',
    borderRadius: 10,
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
    alignItems: 'center',
    width: 280,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
  },
  modalButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  instructionsBox: {
    marginHorizontal: 24,
    marginBottom: 10,
    marginTop: 0,
    backgroundColor: '#f8f4f1',
    borderRadius: 12,
    padding: 14,
    alignSelf: 'center',
    width: '90%',
  },
  instructionsText: {
    color: '#6b5853',
    fontSize: 15,
    marginBottom: 2,
    lineHeight: 21,
    textAlign: 'justify',
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    alignSelf:'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d2c1b7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f3ece8',
  },
  label: {
    fontWeight: 'bold',
    color: '#6b5853',
    marginBottom: 2,
    marginLeft: 2,
    fontSize: 15,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6ded8',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: '#6b5853',
    fontWeight: 'bold',
    marginRight: 4,
  },
  tagAddChip: {
    backgroundColor: '#f3ece8',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d2c1b7',
    marginBottom: 6,
  },
  tagInputChip: {
    minWidth: 60,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 6,
    fontSize: 16,
    backgroundColor: '#e6ded8',
    color: '#6b5853',
  },
  cancelButton: {
    marginTop: 18,
    alignSelf: 'center',
    backgroundColor: '#C5A494',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  resultTitle:{
    fontSize: 40,
    color: '#6b5853',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily : 'Licorice',
    
  },
  selectedItemsRow: {
    width: '100%',
    marginBottom: 18,
    marginTop: 4,
    maxHeight: 120,
  },
  selectedItemsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 0,
    minHeight: 110,
  },
  itemCard: {
    width: 80,
    height: 110,
    backgroundColor: '#f3ece8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d2c1b7',
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  itemCardImage: {
    width: 68,
    height: 68,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#e6ded8',
  },
  itemCardText: {
    fontSize: 13,
    color: '#6b5853',
    textAlign: 'center',
    fontWeight: 'bold',
    flexShrink: 1,
  },
  // Season grid styles
  seasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  seasonCard: {
    width: '47%',
    backgroundColor: '#f3ece8',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#d2c1b7',
  },
  seasonCardSelected: {
    backgroundColor: '#6b5853',
    borderColor: '#6b5853',
  },
  seasonCardText: {
    color: '#6b5853',
    fontWeight: 'bold',
    fontSize: 16,
  },
  seasonCardTextSelected: {
    color: '#fff',
  },
});