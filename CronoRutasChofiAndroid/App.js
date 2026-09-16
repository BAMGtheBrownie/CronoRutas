import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";

function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require("./src/images/logo.png")} />
      <Text style={styles.secundario}>¡Inicia sesión conductor! </Text>
      <TextInput placeholder="ejemplo@email.com" style={styles.insertartexto} />
      <TextInput placeholder="contraseña" style={styles.insertartexto} secureTextEntry= {true}/>
      <StatusBar style="auto" />
      <TouchableOpacity onPress={() => navigation.navigate("MainChofer")}>
        <LinearGradient
          colors={["#969798", "#5F3693", "#481786"]}
          style={styles.Boton}
        >
          <Text style={styles.text}> Iniciar sesión </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function MainScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require("./src/images/logo.png")} />
      <Text style={styles.principal}>¡Bienvenido Conductor! </Text>
      <TouchableOpacity onPress={() => navigation.navigate("MainChoferDrive")}>
        <LinearGradient
          colors={["#969798", "#5F3693", "#481786"]}
          style={styles.Boton2}
        >
          <Text style={styles.text2}> Empezar recorrido </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function MainScreenDrive({ navigation }) {
  return(
    <View style={styles.container2}>
      <Image style={styles.image} source={require("./src/images/logo.png")} />
      <TouchableOpacity onPress={() => navigation.navigate("MainChofer")}>
        <LinearGradient
          colors={["#969798", "#5F3693", "#481786"]}
          style={styles.Boton2}
        >
          <Text style={styles.text2}> Finalizar recorrido </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  const Stack = createNativeStackNavigator();

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, [location]);

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }
  console.log(text);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainChofer" component={MainScreen} />
        <Stack.Screen name="MainChoferDrive" component={MainScreenDrive} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAEEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  container2: {
    flex: 1,
    backgroundColor: "FAEEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    marginBottom: "10%",
    resizeMode: "contain",
    width: "90%",
    height: 50,
  },
  principal: {
    fontSize: 20,
    color: "#82680F",
    fontWeight: "bold",
  },
  secundario: {
    fontSize: 15,
    color: "red",
    fontWeight: "bold",
  },
  insertartexto: {
    textAlign: "center",
    width: "80%",
    height: 40,
    marginTop: "4%",
    borderRadius: 15,
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
    color: "white",
  },
  Boton: {
    marginTop: "10%",
    width: "41%",
    borderRadius: 30,
  },
  text2: {
    fontSize: 20,
    color: "white",
  },
  Boton2: {
    height: "20%",
    width: "100%",
    borderRadius: 30,
  },
});
