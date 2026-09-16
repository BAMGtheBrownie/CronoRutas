import { useEffect, useState } from "react";
import { StyleSheet, Keyboard, View, Image, Alert } from "react-native";
import { Button, Icon, Searchbar } from "react-native-paper";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import { Marker } from "react-native-maps";
import { NavigationContainer } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import data from "./image/drivers.json";

export default function App() {
  const [location, setLocation] = useState({
    latitudeCurrent: 20.656422,
    longitudeCurrent: -103.325396,
    latitudeDelta: 0.009,
    longitudeDelta: 0.004,
  });

  const [errorMsg, setErrorMsg] = useState(null);
  const [routeSelected, setRouteSelected] = useState(null);
  const [favorite, setFavorites] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      let locationInitial = await Location.getCurrentPositionAsync({});
      if (locationInitial !== location) {
        setLocation({
          latitudeCurrent: locationInitial.coords.latitude,
          longitudeCurrent: locationInitial.coords.longitude,
          longitudeDelta: 0.01,
          latitudeDelta: 0.01,
        });
      }
    })();
  }, [location]);

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  const [searchQuery, setSearchQuery] = useState("");
  const onChangeSearch = (query) => setSearchQuery(query);

  data.map((item) => {
    if (searchQuery == item.route) {
      console.log("encontrado");
      Alert.alert(
        (title = "Encontrada"),
        (message = "Fue encontrada la ruta!"),
        [{ text: "OK", onPress: () => Keyboard.dismiss() }],
        setRouteSelected(searchQuery)
      );
      setSearchQuery("");
    }
  });

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <Animatable.View
          animation="flipInY"
          style={styles.container}
          duration={2000}
        >
          <Searchbar
            style={styles.searchbar}
            mode="view"
            placeholder="Ingrese una ruta"
            onChangeText={onChangeSearch}
            value={searchQuery}
          />
          <Button
            icon="map-marker-star"
            mode="contained"
            onPress={() => {
              console.log(searchQuery)
              if (searchQuery != "") {
                console.log("Agregado a favoritos"),
                  setFavorites(favorite + searchQuery);
              }else if(searchQuery == ""){
                console.log(favorite)
              }
            }}
          >
            Favoritos
          </Button>
        </Animatable.View>
        <MapView
          onRegionChange={this.onRegionChange}
          style={styles.map}
          region={{
            latitude: location.latitudeCurrent,
            longitude: location.longitudeCurrent,
            latitudeDelta: location.latitudeDelta,
            longitudeDelta: location.longitudeDelta,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.latitudeCurrent,
              longitude: location.longitudeCurrent,
            }}
            title={"Aqui estas"}
          />
        </MapView>
        <Animatable.View
          animation="fadeInUp"
          style={styles.container}
          duration={2500}
        >
          <Image style={styles.img} source={require("./assets/logo.png")} />
        </Animatable.View>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAEEFC",
  },
  map: {
    width: "100%",
    height: "60%",
  },
  img: {
    flex: 2,
    resizeMode: "contain",
    marginTop: "2%",
    marginLeft: "1%",
  },
  searchbar: {
    flex: 3,
    paddingStart: 1,
  },
  principal: {
    fontSize: 30,
    color: "#A701D4",
    fontWeight: "bold",
    textAlign: "center",
  },
  favorite: {
    flex: 4
  }
});
