import { API_BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddClothesScreen() {
  const navigation = useNavigation();
  const [images, setImages] = useState<(string | null)[]>([null, null]);
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Pentru editare rezultat
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editFields, setEditFields] = useState<any>(null);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(80);

  // Iconițe animate pentru overlay
  const icons = [
    { name: 'shirt-outline', color: '#6b5853' },
    { name: 'pricetag-outline', color: '#c5a494' },
    { name: 'cloud-upload-outline', color: '#6b5853' },
    { name: 'color-palette-outline', color: '#c5a494' },
  ];
  const [iconIndex, setIconIndex] = useState(0);

  useEffect(() => {
    if (!addLoading) return;
    const interval = setInterval(() => {
      setIconIndex(i => (i + 1) % icons.length);
    }, 500);
    return () => clearInterval(interval);
  }, [addLoading]);

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
      Alert.alert('Permission required', 'Access is needed!');
      setModalVisible(false);
      return;
    }
    let result;
    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [4, 5],
        quality: 0.4,
        base64: true,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        aspect: [4, 5],
        quality: 0.4,
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

  // Trimite la API pentru analiză
  const handleAnalyze = async () => {
    if (!images[0]) {
      Alert.alert('Photo required', 'Please add at least a front photo.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ClothingItem/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ImageFront: images[0] || "",
          ImageBack: images[1] || "",
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setEditFields({
          name:
            data.name === 'unknown' || data.name === null
              ? 'unknown'
              : data.name || '',
          category:
            data.category === 'unknown' || data.category === null
              ? 'unknown'
              : data.category || '',
          tags: Array.isArray(data.tags)
            ? data.tags.map((t: string) =>
                t === 'unknown' || t === null ? 'unknown' : t
              )
            : [],
          color:
            data.color === 'unknown' || data.color === null
              ? 'unknown'
              : data.color || '',
          brand:
            data.brand === 'unknown' || data.brand === null
              ? 'unknown'
              : data.brand || '',
          material:
            data.material === 'unknown' || data.material === null
              ? 'unknown'
              : data.material || '',
          printType:
            data.printType === 'unknown' || data.printType === null
              ? 'unknown'
              : data.printType || '',
          printDescription:
            data.printDescription === 'unknown' || data.printDescription === null
              ? 'unknown'
              : data.printDescription || '',
          description:
            data.description === 'unknown' || data.description === null
              ? 'unknown'
              : data.description || '',
        });
        setEditModalVisible(true);
      } else {
        Alert.alert('Error', 'Could not analyze item.');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server.');
    }
    setLoading(false);
  };

  // Actualizează câmpurile editabile
  const handleFieldChange = (field: string, value: string) => {
    if (field === 'tags') {
      setEditFields({ ...editFields, tags: value.split(',').map((t: string) => t.trim()) });
    } else {
      setEditFields({ ...editFields, [field]: value });
    }
  };

  // Trimite datele finale (userId din local storage)
  const handleAddInCloset = async () => {
    setAddLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User not logged in.');
        setAddLoading(false);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/ClothingItem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: editFields?.name || "",
          category: editFields?.category || "",
          tags: editFields?.tags || [],
          color: editFields?.color || "",
          brand: editFields?.brand || "",
          material: editFields?.material || "",
          printType: editFields?.printType || "",
          printDescription: editFields?.printDescription || "",
          description: editFields?.description || "",
          imageFront: images[0] ? String(images[0]) : "",
          imageBack: images[1] ? String(images[1]) : "",
        }),
      });
      if (response.ok) {
        Alert.alert('Added!', 'Item added in closet.');
        setEditModalVisible(false);
        setResult(null);
        setImages([null, null]);
      } else {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          Alert.alert('Error', errorData.error);
        } else {
          Alert.alert('Error', 'Could not add item in closet.');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server.');
    }
    setAddLoading(false);
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

  return (
    <View style={styles.container}>
      {/* Săgeată back */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 60, left: 18, zIndex: 10 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="#222" />
      </TouchableOpacity>

      {/* Header */}
      <Text style={styles.headerTitle}>Add Clothes</Text>
      <View style={[styles.instructionsBox, { flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 24, marginTop: 0, marginBottom: 10 }]}>
        <Ionicons name="information-circle-outline" size={22} color="#6b5853" style={{ marginRight: 8, marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.instructionsText}>
            Add a clothing item by uploading a photo of the{' '}
            <Text style={{ fontWeight: 'bold' }}>front</Text>. If it has a distinctive{' '}
            <Text style={{ fontWeight: 'bold' }}>back</Text>, include that too. A{' '}
            <Text style={{ fontWeight: 'bold' }}>description</Text> will be generated — you can{' '}
            <Text style={{ fontWeight: 'bold' }}>edit</Text> and{' '}
            <Text style={{ fontWeight: 'bold' }}>approve</Text> it before it's added to your{' '}
            <Text style={{ fontWeight: 'bold' }}>wardrobe</Text>.
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
            <Text style={styles.analyzeButtonText}>Analyze Item</Text>
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

      {/* Modal pentru editare rezultat și adăugare în closet */}
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
                    style={[styles.input, { height: "auto", textAlignVertical: 'top' }]}
                    value={editFields?.description}
                    onChangeText={text => handleFieldChange('description', text)}
                    placeholder="Description"
                    multiline
                    scrollEnabled={false}
                    onContentSizeChange={e => setDescriptionHeight(Math.max(80, e.nativeEvent.contentSize.height))}
                  />
                  <TouchableOpacity
                    style={[styles.analyzeButton2, { marginTop: 20 }]}
                    onPress={() => {
                      setEditModalVisible(false); // Închide modalul de editare
                      setTimeout(() => {
                        handleAddInCloset();      // Apoi pornește loading-ul și request-ul
                      }, 300); // Dă un mic delay ca să se închidă frumos modalul
                    }}
                  >
                    <Text style={styles.analyzeButtonText}>Add in Closet</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Overlay loading animat cu mai multe iconițe */}
      {addLoading && (
        <Modal visible transparent animationType="fade">
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.85)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
          }}>
            <Ionicons name={icons[iconIndex].name as any} size={64} color={icons[iconIndex].color} />
            <Text style={{ marginTop: 24, color: '#6b5853', fontSize: 18, fontWeight: 'bold' }}>
              Uploading...
            </Text>
          </View>
        </Modal>
      )}
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
    height: 180,
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
  analyzeButton2: {
    marginTop: 30,
    backgroundColor: '#6b5853',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  resultBox: {
    marginTop: 30,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    width: '90%',
    alignSelf: 'center',
    elevation: 2,
  },
  resultTitle: {
    fontSize: 50,
    fontFamily: 'Licorice',
    textAlign: 'center',
    marginBottom: 10,
    color: '#222',
  },
  resultField: {
    fontSize: 15,
    color: '#444',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
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
    alignSelf: 'center',
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
    paddingVertical: 4, // mai inalt decat celelalte chip-uri
    paddingHorizontal: 8,
    marginBottom: 6,
    fontSize: 16,
    backgroundColor: '#e6ded8',
    color: '#6b5853',
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
  instructionsBox2: {
    marginHorizontal: 24,
    marginBottom: 10,
    marginTop: 0,
    backgroundColor: '#f8f4f1',
    borderRadius: 12,
    padding: 14,
    alignSelf: 'center',
    width: '100%',
  },
  instructionsText: {
    color: '#6b5853',
    fontSize: 15,
    marginBottom: 2,
    lineHeight: 21,
    textAlign: 'justify',
  
  },
  cancelButton: {
    marginTop: 10,
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
  },
});