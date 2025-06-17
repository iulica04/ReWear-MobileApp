import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { WebView } from 'react-native-webview';
import  { useRef, useEffect } from 'react';

export default function SustainableTipsScreen() {
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to top when the component mounts
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header fix */}
      <View style={styles.headerWrapper}>
        <View style={styles.arrowContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#222" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Sustainable fashion</Text>
        <Text style={styles.headerSubtitle}>starts with your {'   '}closet</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introBox}>
          <Text style={styles.introTitle}>🌿 Build a Sustainable Wardrobe: Simple Steps for a Conscious Style</Text>
          <Text style={styles.introText}>
            Fast fashion impacts the planet, but your choices matter. A sustainable wardrobe helps reduce your footprint and supports a mindful lifestyle.
            {"\n\n"}
            Here you'll find simple tips to make your closet more eco-friendly: from choosing better materials and shopping second-hand, to caring for your clothes and embracing minimalism.
            {"\n\n"}
            No matter where you start, these ideas will help you build a more responsible and green fashion journey.
          </Text>
        </View>
        <View style={{ width: '95%', height: 200, borderRadius: 18, overflow: 'hidden', marginBottom: 18, marginTop: 6 }}>
          <WebView
            source={{ uri: 'https://www.youtube.com/embed/eeC_9EnUOFQ' }}
            style={{ flex: 1 }}
            allowsFullscreenVideo
          />
        </View>
        <Text style={styles.sectionTitle}>🌿 Tips for a Sustainable Wardrobe</Text>

        <View style={styles.tipBox}>
          <Ionicons name="leaf-outline" size={22} color="#6b5853" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Choose quality over quantity</Text>
            <Text style={styles.tipText}>
              Invest in durable, versatile pieces that last and can be worn in many combinations.
            </Text>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="leaf-outline" size={22} color="#6b5853" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Shop responsibly</Text>
            <Text style={styles.tipText}>
              Support brands with ethical and sustainable practices, using eco-friendly materials and fair labor.
            </Text>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="leaf-outline" size={22} color="#6b5853" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Explore second-hand fashion</Text>
            <Text style={styles.tipText}>
              Thrift or vintage clothes are a great way to refresh your wardrobe without contributing to new production.
            </Text>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="leaf-outline" size={22} color="#6b5853" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Reimagine your wardrobe</Text>
            <Text style={styles.tipText}>
              Before buying new items, check what you already own. You might rediscover forgotten pieces to restyle.
            </Text>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="leaf-outline" size={22} color="#6b5853" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Care for your clothes properly</Text>
            <Text style={styles.tipText}>
              Wash at low temperatures, avoid tumble drying, and use eco-friendly detergents to extend garment life and reduce impact.
            </Text>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="leaf-outline" size={22} color="#6b5853" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Join clothing swaps</Text>
            <Text style={styles.tipText}>
              Organize or join swap events to diversify your wardrobe without buying new items.
            </Text>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="leaf-outline" size={22} color="#6b5853" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Donate or recycle</Text>
            <Text style={styles.tipText}>
              Instead of throwing away old clothes, donate or recycle them to help reduce textile waste.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(236, 228, 223)',
    paddingHorizontal: 0,
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
    fontSize: 55,
    color: '#6b5853',
    textAlign: 'center',
    marginBottom: 0,
    marginTop: -10,
  },
  headerSubtitle: {
    fontSize: 20,
    color: '#8c916C',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '500',
    fontFamily: 'Lora',
    letterSpacing: 1,
    marginTop: -20,
    marginRight: 10,
  },
  introBox: {
    backgroundColor: '#f8f4f1',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 6,
    marginBottom: 18,
    marginTop: 20,
  },
  introTitle: {
    fontSize: 18,
    color: '#6b5853',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  scrollContent: {
    paddingBottom: 30,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#6b5853',
    fontWeight: 'bold',
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f4f1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    width: '100%',
  },
  tipTitle: {
    fontWeight: 'bold',
    color: '#6b5853',
    fontSize: 15,
    marginBottom: 2,
  },
  tipText: {
    color: '#444',
    fontSize: 15,
    flex: 1,
    flexWrap: 'wrap',
  },
});