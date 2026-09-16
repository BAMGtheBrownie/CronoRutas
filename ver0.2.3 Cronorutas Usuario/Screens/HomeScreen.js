import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Modal,
  Image,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { MarkerAnimated, AnimatedRegion } from "react-native-maps";
import * as Location from "expo-location";
import { Searchbar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Accelerometer } from "expo-sensors";

/* 🔥 FIREBASE */
import { db } from "../firebase";
import { auth } from "../firebase";

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [favVisible, setFavVisible] = useState(false);

  const [conductores, setConductores] = useState({});
  const [search, setSearch] = useState("");
  const [favoritos, setFavoritos] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [ultimoToque, setUltimoToque] = useState(null);

  const mapRef = useRef(null);

  // 🔥 posiciones animadas
  const animaciones = useRef({}).current;

  /* 📍 UBICACIÓN */
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  /* 🔐 SESIÓN */

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(
    async (user) => {
      if (!user) {
        setUsuarioActual(null);
        setFavoritos([]);
        return;
      }

      setUsuarioActual(user);

      try {
        const snapshot = await db
          .ref(`CronoRutas/Usuarios/${user.uid}`)
          .once("value");

        if (snapshot.exists()) {
          const datos = snapshot.val();

          setFavoritos(
            datos.favoritos || []
          );
        }
      } catch (error) {
        console.log(error);
      }
    }
  );

  return unsubscribe;
}, []);

  /* 🔥 FIREBASE */
  useEffect(() => {
    const refDB = db.ref("CronoRutas/Conductores");

    refDB.on("value", (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.val();
      setConductores(data);

      // 🚍 animar cada conductor
      Object.keys(data).forEach((id) => {
        const chofer = data[id];
        if (!chofer.gps || !chofer.activo) return;

        const { lat, lng } = chofer.gps;

        if (!animaciones[id]) {
          animaciones[id] = new AnimatedRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        } else {
          animaciones[id].timing({
            latitude: lat,
            longitude: lng,
            duration: 3000, // 🔥 SUAVIDAD 3 SEGUNDOS
            useNativeDriver: false,
          }).start();
        }
      });
    });

    return () => refDB.off();
  }, []);

  /* 🔎 ZOOM AUTOMÁTICO */
  useEffect(() => {
    if (!location || !mapRef.current) return;

    mapRef.current.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: search ? 0.08 : 0.01,
      longitudeDelta: search ? 0.08 : 0.01,
    });
  }, [search]);

  /* 📍 CENTRAR */
  const centerMap = () => {
    if (!location || !mapRef.current) return;

    mapRef.current.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  /* 📱 AGITAR */
  useEffect(() => {
    Accelerometer.setUpdateInterval(400);

    const sub = Accelerometer.addListener((data) => {
      const total = Math.abs(data.x) + Math.abs(data.y) + Math.abs(data.z);
      if (total > 2.5) centerMap();
    });

    return () => sub.remove();
  }, [location]);

  /* 🔎 FILTRO */
  const conductoresFiltrados = Object.keys(conductores).filter((id) => {
    const c = conductores[id];
    if (!c.gps || !c.activo) return false;

    return (c.Ruta || "")
      .toLowerCase()
      .includes(search.toLowerCase());
  });

/* 🔎 RESULTADOS DE BÚSQUEDA */
const rutasEncontradas =
  search.trim().length > 0
    ? conductoresFiltrados.map((id) => ({
        id,
        ruta: conductores[id].Ruta,
        nombre: conductores[id].nombre,
      }))
    : [];

  /* ⭐ FAVORITOS */
  const agregarFavorito = async (ruta) => {
    if (!usuarioActual) {
      alert("Inicia sesión primero");
      return;
    }

    if (favoritos.includes(ruta)) {
      alert("Ya está en favoritos");
      return;
    }

    const nuevosFavoritos = [
      ...favoritos,
      ruta,
    ];

    setFavoritos(nuevosFavoritos);

    try {
      await db
        .ref(
          `CronoRutas/Usuarios/${usuarioActual.uid}/favoritos`
        )
        .set(nuevosFavoritos);

      alert("⭐ Agregado a favoritos");
    } catch (error) {
      console.log(error);
    }
  };

  const eliminarFavorito = async (ruta) => {
  const nuevosFavoritos =
    favoritos.filter((f) => f !== ruta);

  setFavoritos(nuevosFavoritos);

  try {
    await db
      .ref(
        `CronoRutas/Usuarios/${usuarioActual.uid}/favoritos`
      )
      .set(nuevosFavoritos);
  } catch (error) {
    console.log(error);
  }
};

const cerrarSesion = async () => {
  try {
    await auth.signOut();

    setMenuVisible(false);

    alert("Sesión cerrada");
  } catch (error) {
    console.log(error);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      {/* TOP */}
      <View style={styles.topBar}>
        <View style={styles.titleContainer}>
          <Image source={require("../assets/golo.png")} style={styles.logo} />
          <Text style={styles.appTitle}>CronoRutas</Text>
        </View>
      </View>

      <Searchbar
        placeholder="Buscar ruta..."
        style={styles.searchbar}
        value={search}
        onChangeText={setSearch}
      />

      {search.length > 0 && (
  <View
    style={{
      backgroundColor: "#fff",
      marginHorizontal: 10,
      borderRadius: 10,
      elevation: 5,
      maxHeight: 180,
      marginBottom: 5,
    }}
  >
    {rutasEncontradas.length > 0 ? (
      rutasEncontradas.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={{
            padding: 12,
            borderBottomWidth: 0.5,
            borderColor: "#ddd",
          }}
          onPress={() => {
            const chofer = conductores[item.id];

            if (!chofer?.gps || !location) return;

            mapRef.current?.animateToRegion(
              {
                latitude:
                  (location.latitude + chofer.gps.lat) / 2,

                longitude:
                  (location.longitude + chofer.gps.lng) / 2,

                latitudeDelta: Math.abs(
                  location.latitude - chofer.gps.lat
                ) + 0.1,

                longitudeDelta: Math.abs(
                  location.longitude - chofer.gps.lng
                ) + 0.1,
              },
              1500
            );

            setTimeout(() => {
              mapRef.current?.animateToRegion(
                {
                  latitude: chofer.gps.lat,
                  longitude: chofer.gps.lng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                1200
              );
            }, 1500);

            setSearch("");
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
            }}
          >
            🚌 Ruta {item.ruta}
          </Text>

          <Text>
            {item.nombre}
          </Text>
        </TouchableOpacity>
      ))
    ) : (
      <Text style={{ padding: 12 }}>
        No hay rutas activas con ese nombre
      </Text>
    )}
  </View>
)}

      {/* MAPA */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          showsUserLocation
          initialRegion={{
            latitude: 20.6597,
            longitude: -103.3496,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {/* USUARIO */}
          

          {/* 🚍 BUSES ANIMADOS */}
          {conductoresFiltrados.map((id) => {
            if (!animaciones[id]) return null;

            const chofer = conductores[id];

            return (
              <MarkerAnimated
                key={id}
                coordinate={animaciones[id]}
                title={`Ruta ${chofer.Ruta}`}
                description={chofer.nombre}
                onPress={() => {
                  if (ultimoToque === id) {
                    agregarFavorito(chofer.Ruta);
                    setUltimoToque(null);
                  } else {
                    setUltimoToque(id);
                    alert(`Ruta ${chofer.Ruta}`);
                  }
                }}
              />
            );
          })}
        </MapView>

        <TouchableOpacity style={styles.locateButton} onPress={centerMap}>
          <Ionicons name="locate" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* BOTTOM */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => setFavVisible(true)}>
          <Ionicons name="star" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="person" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* PERFIL */}
      <Modal transparent visible={menuVisible} animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menu}>
  {usuarioActual ? (
    <>
      <Text
        style={{
          fontWeight: "bold",
          marginBottom: 15,
        }}
      >
        {usuarioActual.email}
      </Text>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={cerrarSesion}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
        />

        <Text style={styles.menuText}>
          Cerrar sesión
        </Text>
      </TouchableOpacity>
    </>
  ) : (
    <>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          navigation.navigate("Login")
        }
      >
        <Ionicons
          name="log-in-outline"
          size={20}
        />

        <Text style={styles.menuText}>
          Iniciar sesión
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          navigation.navigate("Register")
        }
      >
        <Ionicons
          name="person-add-outline"
          size={20}
        />

        <Text style={styles.menuText}>
          Registrarse
        </Text>
      </TouchableOpacity>
    </>
  )}
</View>
        </TouchableOpacity>
      </Modal>

      {/* ⭐ FAVORITOS */}
      <Modal transparent visible={favVisible} animationType="slide">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setFavVisible(false)}
        >
          <View style={styles.favMenu}>
            <Text style={styles.favTitle}>Rutas favoritas</Text>

            {favoritos.length === 0 ? (
              <Text>No tienes favoritas aún</Text>
            ) : (
              favoritos.map((ruta, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text>⭐ Ruta {ruta}</Text>

                  <TouchableOpacity
                    onPress={() => eliminarFavorito(ruta)
                    }
                  >
                    <Text style={{ color: "red" }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
/* 🔥 ESTILOS (SIN CAMBIOS) */
const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
  },

  titleContainer: { flexDirection: "row", alignItems: "center" },

  logo: { width: 30, height: 30, marginRight: 8 },

  appTitle: { fontSize: 18, fontWeight: "bold" },

  searchbar: { margin: 10 },

  mapContainer: { flex: 1, margin: 10, borderRadius: 15, overflow: "hidden" },

  map: { flex: 1 },

  locateButton: {
    position: "absolute",
    bottom: 100,
    right: 15,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 30,
  },

  bottomBar: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
    gap: 20,
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 40,
    elevation: 10,
  },

  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  menu: {
    backgroundColor: "#fff",
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  favMenu: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  favTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },

  menuItem: { flexDirection: "row", padding: 12, alignItems: "center" },

  menuText: { marginLeft: 8 },
});