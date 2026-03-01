"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

interface Property {
  id: string;
  title: string;
  priceUsd: number;
  address: string;
  type: string;
  gender: string;
  images: { url: string }[];
  location?: {
    coordinates: [number, number];
  };
}

export default function SearchPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: 10.4806,
    longitude: -66.9036,
  });

  useEffect(() => {
    getCurrentLocation();
    loadProperties();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch (error) {
      console.log("Error getting location:", error);
    }
  };

  const loadProperties = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001"}/api/properties?latitude=${location.latitude}&longitude=${location.longitude}&radiusKm=5`,
      );
      const data = await response.json();
      if (data.success) {
        setProperties(data.data);
      }
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProperties();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6fa5" />
        <Text style={styles.loadingText}>Cargando propiedades...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Buscar Propiedades</Text>
          <Text style={styles.headerSubtitle}>
            {properties.length} propiedades encontradas
          </Text>
        </View>
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === "list" && styles.viewModeActive,
            ]}
            onPress={() => setViewMode("list")}
          >
            <Text
              style={[
                styles.viewModeText,
                viewMode === "list" && styles.viewModeActiveText,
              ]}
            >
              📋
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === "map" && styles.viewModeActive,
            ]}
            onPress={() => setViewMode("map")}
          >
            <Text
              style={[
                styles.viewModeText,
                viewMode === "map" && styles.viewModeActiveText,
              ]}
            >
              🗺️
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido */}
      {viewMode === "list" ? (
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {properties.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>
                No se encontraron propiedades
              </Text>
              <Text style={styles.emptyText}>
                Intenta ajustar los filtros o ampliar el radio de búsqueda
              </Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {properties.map((property) => (
                <TouchableOpacity
                  key={property.id}
                  style={styles.card}
                  onPress={() => router.push(`/properties/${property.id}`)}
                >
                  <View style={styles.cardImage}>
                    {property.images &&
                    property.images.length > 0 &&
                    property.images[0] ? (
                      <Image
                        source={{ uri: property.images[0].url }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.noImage}>
                        <Text style={styles.noImageText}>Sin imágenes</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {property.title}
                      </Text>
                      <Text style={styles.cardPrice}>${property.priceUsd}</Text>
                    </View>
                    <Text style={styles.cardAddress} numberOfLines={1}>
                      {property.address}
                    </Text>
                    <View style={styles.cardBadges}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{property.type}</Text>
                      </View>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{property.gender}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {properties.map((property, index) => {
            if (!property.location) return null;
            return (
              <Marker
                key={property.id}
                coordinate={{
                  latitude: property.location.coordinates[1],
                  longitude: property.location.coordinates[0],
                }}
                onPress={() => router.push(`/properties/${property.id}`)}
              >
                <View style={styles.marker}>
                  <Text style={styles.markerText}>${property.priceUsd}</Text>
                </View>
              </Marker>
            );
          })}
        </MapView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  viewModeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  viewModeActive: {
    backgroundColor: "#4a6fa5",
    borderColor: "#4a6fa5",
  },
  viewModeText: {
    fontSize: 20,
  },
  viewModeActiveText: {
    color: "#fff",
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#e0e0e0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  noImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: "#999",
    fontSize: 14,
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4a6fa5",
    marginLeft: 8,
  },
  cardAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  cardBadges: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  badgeText: {
    fontSize: 12,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  map: {
    flex: 1,
  },
  marker: {
    backgroundColor: "#4a6fa5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  markerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});
