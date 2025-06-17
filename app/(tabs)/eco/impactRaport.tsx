import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { API_BASE_URL } from '../../config';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const chartColors = [
  '#82756b', '#735E59', '#AB8875', '#6b5853', '#a29086', '#c2b280', '#B1A093', '#A2836E',
  '#C19A6B', '#E5AA70', '#6F4E37', '#B87333', '#A67B5B', '#9D5F38', '#D19C4C', '#BF9B0C',
  '#B79785', '#CDB9A5', '#B99C98', '#8C8E8D', '#A3A893', '#D0BA98', '#D8CAA9', '#8D8079',
  '#B8B6B0', '#AEB2A6'
];

// Dicționar pentru traducerea lunilor din română în engleză
const monthTranslations: { [key: string]: string } = {
  'ianuarie': 'Jan',
  'februarie': 'Feb',
  'martie': 'Mar',
  'aprilie': 'Apr',
  'mai': 'May',
  'iunie': 'Jun',
  'iulie': 'Jul',
  'august': 'Aug',
  'septembrie': 'Sep',
  'octombrie': 'Oct',
  'noiembrie': 'Nov',
  'decembrie': 'Dec',
};

// Icon map pentru fiecare echivalent
const impactIcons: { [key: string]: React.ReactNode } = {
  "Kilometers driven by a gasoline car": <MaterialCommunityIcons name="car" size={24} color="#6b5853" />,
  "Liters of gasoline consumed": <MaterialCommunityIcons name="gas-station" size={24} color="#6b5853" />,
  "Hours of flight (commercial airplane)": <MaterialCommunityIcons name="airplane" size={24} color="#6b5853" />,
  "Kilograms of coal burned": <MaterialCommunityIcons name="fire" size={24} color="#6b5853" />,
  "Trees planted to offset yearly": <MaterialCommunityIcons name="tree" size={24} color="#6b5853" />,
  "60W light bulb usage hours": <MaterialCommunityIcons name="lightbulb-on" size={24} color="#6b5853" />,
  "Laptop usage hours": <MaterialCommunityIcons name="laptop" size={24} color="#6b5853" />,
  "Cups of coffee consumed": <MaterialCommunityIcons name="coffee" size={24} color="#6b5853" />,
  "Kilometers traveled by electric train": <MaterialCommunityIcons name="train" size={24} color="#6b5853" />,
  "Minutes of HD video streaming": <MaterialCommunityIcons name="youtube-tv" size={24} color="#6b5853" />,
  "Smartphone charges": <MaterialCommunityIcons name="cellphone-charging" size={24} color="#6b5853" />,
  "Washing machine cycles": <MaterialCommunityIcons name="washing-machine" size={24} color="#6b5853" />,
  "Showers (10 minutes)": <MaterialCommunityIcons name="shower" size={24} color="#6b5853" />,
  "Plastic bags produced": <MaterialCommunityIcons name="bag-personal" size={24} color="#6b5853" />,
  "Plastic bottles produced (500ml)": <MaterialCommunityIcons name="bottle-soda" size={24} color="#6b5853" />,
  "Emails sent (with attachment)": <MaterialCommunityIcons name="email" size={24} color="#6b5853" />,
  "Reams of paper produced": <MaterialCommunityIcons name="file-document" size={24} color="#6b5853" />,
  "Hours using a microwave oven": <MaterialCommunityIcons name="microwave" size={24} color="#6b5853" />,
  "Light meals prepared with a gas stove": <MaterialCommunityIcons name="stove" size={24} color="#6b5853" />,
  "Dishwasher cycles": <MaterialCommunityIcons name="dishwasher" size={24} color="#6b5853" />,
};

export default function ImpactRaportScreen() {
  const [loading, setLoading] = useState(true);
  const [materialStats, setMaterialStats] = useState<{ [material: string]: number }>({});
  const [monthlyData, setMonthlyData] = useState<{ [month: string]: number }>({});
  const [loadingMonthly, setLoadingMonthly] = useState(true);

  // Carbon footprint state
  const [carbonData, setCarbonData] = useState<{ totalCarbonFootprint: number, totalNumberOfItems: number, countedItems: number } | null>(null);
  const [loadingCarbon, setLoadingCarbon] = useState(true);

  // Impact equivalents state
  const [impactEquivalents, setImpactEquivalents] = useState<{ [key: string]: number } | null>(null);
  const [loadingEquivalents, setLoadingEquivalents] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!userId || !jwtToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/ClothingItem/count-by-material?userId=${userId}`,
          { headers: { Authorization: `Bearer ${jwtToken}` } }
        );
        const data = await res.json();
        setMaterialStats(data);
      } catch (e) {
        setMaterialStats({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMonthly = async () => {
      setLoadingMonthly(true);
      const userId = await AsyncStorage.getItem('userId');
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!userId || !jwtToken) {
        setLoadingMonthly(false);
        return;
      }
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/ClothingItem/monthly-purchase-count?userId=${userId}`,
          { headers: { Authorization: `Bearer ${jwtToken}` } }
        );
        const data = await res.json();
        setMonthlyData(data);
      } catch (e) {
        setMonthlyData({});
      } finally {
        setLoadingMonthly(false);
      }
    };
    fetchMonthly();
  }, []);

  // Fetch carbon footprint
  useEffect(() => {
    const fetchCarbon = async () => {
      setLoadingCarbon(true);
      const userId = await AsyncStorage.getItem('userId');
      const jwtToken = await AsyncStorage.getItem('jwtToken');
      if (!userId || !jwtToken) {
        setLoadingCarbon(false);
        return;
      }
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/ClothingItem/estimate-carbon-footprint?userId=${userId}`,
          { method: 'POST', headers: { Authorization: `Bearer ${jwtToken}` } }
        );
        const data = await res.json();
        setCarbonData(data);
      } catch (e) {
        setCarbonData(null);
      } finally {
        setLoadingCarbon(false);
      }
    };
    fetchCarbon();
  }, []);

  // Fetch carbon equivalents după ce avem carbonData
  useEffect(() => {
    const fetchEquivalents = async () => {
      if (
        carbonData &&
        carbonData.totalCarbonFootprint !== undefined &&
        carbonData.totalCarbonFootprint !== null
      ) {
        setLoadingEquivalents(true);
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/ClothingItem/get-carbon-impact-equivalents?carbonFootprint=${carbonData.totalCarbonFootprint}`,
            { method: 'GET' }
          );
          const data = await res.json();
          setImpactEquivalents(data);
        } catch (e) {
          setImpactEquivalents(null);
        } finally {
          setLoadingEquivalents(false);
        }
      }
    };
    fetchEquivalents();
  }, [carbonData]);

  const pieData = Object.entries(materialStats).map(([material, count], idx) => ({
    name: material,
    population: count,
    color: chartColors[idx % chartColors.length],
    legendFontColor: '#333',
    legendFontSize: 15,
  }));

  // Custom legend in two columns, procent + nume material
  const renderLegend = () => {
    if (pieData.length === 0) return null;
    const total = pieData.reduce((sum, item) => sum + item.population, 0);
    const mid = Math.ceil(pieData.length / 2);
    const col1 = pieData.slice(0, mid);
    const col2 = pieData.slice(mid);

    const formatPercent = (count: number) =>
      total > 0 ? `${Math.round((count / total) * 100)}%` : '0%';

    return (
      <View style={styles.legendBelowContainer}>
        <View style={styles.legendRow}>
          <View style={styles.legendColumn}>
            {col1.map(item => (
              <View style={styles.legendItemBelow} key={item.name}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>
                  {formatPercent(item.population)} {item.name}
                </Text>
              </View>
            ))}
          </View>
          <View style={[styles.legendColumn, { marginLeft: 32 }]}>
            {col2.map(item => (
              <View style={styles.legendItemBelow} key={item.name}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>
                  {formatPercent(item.population)} {item.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  // Line chart data
  const monthsOrder = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  // Traducem lunile din română în engleză pentru axa X
  const translatedMonthlyData: { [key: string]: number } = {};
  Object.entries(monthlyData).forEach(([roMonth, value]) => {
    const enMonth = monthTranslations[roMonth.toLowerCase()] || roMonth;
    translatedMonthlyData[enMonth] = value;
  });

  // Etichete doar din 2 în 2 luni, dar grid-ul și punctele pentru toate lunile
  const monthLabels = monthsOrder.map((m, idx) => (idx % 2 === 0 ? m : ''));
  const monthValues = monthsOrder.map((enMonth) => translatedMonthlyData[enMonth] || 0);

  // Procent analizare pentru bara de progres
  const analyzedPercent = carbonData && carbonData.totalNumberOfItems > 0
    ? Math.round((carbonData.countedItems / carbonData.totalNumberOfItems) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#6b5853" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Impact Report</Text>
        <View style={{ flex: 1 }} />

        {/* Carbon Footprint Progress Bar */}
        <View style={styles.outerMarginContainer}>
          <View style={styles.chartLegendContainer}>
            <Text style={styles.sectionTitle}>Total Carbon Footprint</Text>
            {loadingCarbon ? (
              <ActivityIndicator size="large" color="#6b5853" style={{ marginTop: 40 }} />
            ) : carbonData ? (
              <>
                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${analyzedPercent}%`, backgroundColor: analyzedPercent === 100 ? '#6b5853' : '#C5A494' }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressBarText}>
                    {analyzedPercent}% analyzed ({carbonData.countedItems}/{carbonData.totalNumberOfItems} items)
                  </Text>
                </View>
                {/* Carbon value */}
                <Text style={styles.carbonValueText}>
                  Estimated total carbon footprint:
                </Text>
                <Text style={styles.carbonValueNumber}>
                  {carbonData.totalCarbonFootprint !== undefined && carbonData.totalCarbonFootprint !== null
                    ? carbonData.totalCarbonFootprint.toFixed(2) + ' kg CO₂'
                    : '-'}
                </Text>
                {/* Impact equivalents */}
                <Text style={styles.sectionTitle}>What does this mean?</Text>
                {loadingEquivalents ? (
                  <ActivityIndicator size="large" color="#6b5853" style={{ marginTop: 20 }} />
                ) : impactEquivalents ? (
                  <View style={styles.equivalentsList}>
                    {Object.entries(impactEquivalents).map(([label, value]) => (
                      <View style={styles.equivalentItem} key={label}>
                        <View style={styles.equivalentIcon}>
                          {impactIcons[label] || <MaterialCommunityIcons name="help-circle" size={24} color="#6b5853" />}
                        </View>
                        <Text style={styles.equivalentLabel}>{label}</Text>
                        <Text style={styles.equivalentValue}>{Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No equivalents available.</Text>
                )}
              </>
            ) : (
              <Text style={styles.emptyText}>No carbon data available.</Text>
            )}
          </View>
        </View>

        {/* Pie chart container */}
        <View style={styles.outerMarginContainer}>
          <View style={styles.chartLegendContainer}>
            <Text style={styles.sectionTitle}>Material Distribution</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#6b5853" style={{ marginTop: 40 }} />
            ) : pieData.length === 0 ? (
              <Text style={styles.emptyText}>No material data available.</Text>
            ) : (
              <>
                <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', marginLeft: 180 }}>
                  <PieChart
                    data={pieData}
                    width={screenWidth}
                    height={220}
                    chartConfig={{
                      backgroundGradientFrom: "#fff",
                      backgroundGradientTo: "#fff",
                      color: (opacity = 1) => `rgba(107, 88, 83, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(68, 68, 68, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="0"
                    hasLegend={false}
                    center={[0, 0]}
                    absolute
                  />
                </View>
                {renderLegend()}
              </>
            )}
          </View>
        </View>
        {/* Line chart container */}
        <View style={styles.outerMarginContainer}>
          <View style={styles.chartLegendContainer}>
            <Text style={styles.sectionTitle}>Monthly Purchases</Text>
            {loadingMonthly ? (
              <ActivityIndicator size="large" color="#6b5853" style={{ marginTop: 40 }} />
            ) : (
              <LineChart
                data={{
                  labels: monthLabels,
                  datasets: [{ data: monthValues }]
                }}
                width={screenWidth - 60}
                height={200}
                yAxisLabel=""
                yAxisSuffix=""
                yLabelsOffset={20}
                chartConfig={{
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(107, 88, 83, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(68, 68, 68, ${opacity})`,
                  propsForDots: {
                    r: "3",
                    strokeWidth: "2",
                    stroke: "#6b5853"
                  },
                  style:
                  {
                      borderRadius: 12,
                      marginTop: 8,
                      padding: 0,
                      marginLeft: -40,
                  }
                }}
                bezier
                style={{ borderRadius: 12, marginTop: 8 }}
              />
            )}
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
    paddingTop: 8,
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
  },
  sectionTitle: {
    fontSize: 18,
    color: '#6b5853',
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 18,
  },
  outerMarginContainer: {
    margin: 18,
    width: screenWidth - 24,
    alignSelf: 'center',
  },
  chartLegendContainer: {
    backgroundColor: 'rgb(249, 247, 245)',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  progressBarContainer: {
    width: '100%',
    marginTop: 16,
    marginBottom: 10,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 18,
    backgroundColor: '#e6ded8',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  progressBarText: {
    marginTop: 6,
    color: '#6b5853',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  carbonValueText: {
    marginTop: 18,
    color: '#6b5853',
    fontSize: 16,
    textAlign: 'center',
  },
  carbonValueNumber: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  equivalentsList: {
    marginTop: 18,
    width: '100%',
    paddingHorizontal: 4,
  },
  equivalentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f3edea',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  equivalentIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 10,
  },
  equivalentLabel: {
    flex: 1,
    fontSize: 15,
    color: '#6b5853',
  },
  equivalentValue: {
    fontWeight: 'bold',
    color: '#6b5853',
    fontSize: 15,
    marginLeft: 8,
  },
  legendBelowContainer: {
    marginTop: 18,
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  legendRow: {
    flexDirection: 'row',
    width: '100%',
  },
  legendColumn: {
    flex: 1,
    alignItems: 'flex-start',
  },
  legendItemBelow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    minWidth: 120,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'left',
  },
});