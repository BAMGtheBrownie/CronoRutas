import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";

/* FIREBASE */
import { ref, get, set, update, onValue } from "firebase/database";
import { db } from "./firebase";

/* GPS SERVICE */
import { iniciarGPS, detenerGPS } from "./gpsService";

/* ===================== SPLASH ===================== */
function AnimatedSplash({ onFinish }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(onFinish);
    }, 1800);
  }, []);

  return (
    <Animated.View style={[styles.splashContainer, { opacity }]}>
      <Image
        source={require("./assets/logo.png")}
        style={{ width: 180, height: 180 }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

/* ===================== LOGIN ===================== */
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const iniciarSesion = async () => {
    try {
      const snapshot = await get(ref(db, "CronoRutas/Conductores"));

      if (snapshot.exists()) {
        const conductores = snapshot.val();

        for (let id in conductores) {
          const chofer = conductores[id];

          if (
            chofer.chofiuser === email &&
            String(chofer.contraseñauser) === password
          ) {
            // ----- SESIÓN ACTIVA EN OTRO DISPOSITIVO -----
            if (chofer.loginActivo === true) {
              Alert.alert(
                "Sesión activa",
                "Esta cuenta ya está en uso en otro dispositivo. ¿Deseas cerrar esa sesión y continuar?",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Forzar cierre",
                    onPress: async () => {

                        const nuevaSesion = Date.now().toString();

                        await update(
                            ref(db, `CronoRutas/Conductores/${id}`),
                            {
                                loginActivo: true,
                                sessionId: nuevaSesion
                            }
                        );

                        navigation.replace("MainChofer",{
                            choferID:id,
                            sessionId:nuevaSesion
                        });

                    },
                  },
                ]
              );
              return;
            }
            // ---------------------------------------------

            // Si no está activa, la activamos y continuamos
            const nuevaSesion = Date.now().toString();

            await update(
                ref(db, `CronoRutas/Conductores/${id}`),
                {
                    loginActivo: true,
                    sessionId: nuevaSesion
                }
            );

            navigation.replace("MainChofer",{
                choferID:id,
                sessionId:nuevaSesion
            });

            return;
          }
        }

        Alert.alert("Error", "Correo o contraseña incorrectos");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Error de conexión con Firebase");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.secundario}>¡Inicia sesión conductor!</Text>

      <TextInput
        placeholder="Correo"
        style={styles.insertartexto}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        style={styles.insertartexto}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity onPress={iniciarSesion}>
        <LinearGradient
          colors={["#969798", "#5F3693", "#481786"]}
          style={styles.Boton}
        >
          <Text style={styles.text}>Iniciar sesión</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Register")}
        style={{ marginTop: 15 }}
      >
        <Text style={styles.logoutText}>Registrarme</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ===================== REGISTRO ===================== */
function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [licencia, setLicencia] = useState("");
  const [ruta, setRuta] = useState("");

  const registrarChofer = async () => {
    try {
      if (!nombre || !usuario || !password || !licencia || !ruta) {
        Alert.alert("Error", "Completa todos los campos");
        return;
      }

      const idChofer = nombre.replace(/\s+/g, "_");

      await set(ref(db, `CronoRutas/Conductores/${idChofer}`), {
        Ruta: ruta,
        activo: false,
        loginActivo: false,
        sessionId: "",
        chofiuser: usuario,
        contraseñauser: password,
        licencia: licencia,
        nombre: nombre,
        gps: {
          lat: 0,
          lng: 0,
          timestamp: 0,
        },
      });

      Alert.alert("Éxito", "Chofer registrado correctamente");
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Error al registrar");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.secundario}>Registrar conductor</Text>

      <TextInput
        placeholder="Nombre"
        style={styles.insertartexto}
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        placeholder="Usuario (Correo)"
        style={styles.insertartexto}
        value={usuario}
        onChangeText={setUsuario}
      />

      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        style={styles.insertartexto}
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        placeholder="Licencia"
        style={styles.insertartexto}
        value={licencia}
        onChangeText={setLicencia}
      />

      <TextInput
        placeholder="Ruta"
        style={styles.insertartexto}
        value={ruta}
        onChangeText={setRuta}
      />

      <TouchableOpacity onPress={registrarChofer}>
        <LinearGradient
          colors={["#969798", "#5F3693", "#481786"]}
          style={styles.Boton}
        >
          <Text style={styles.text}>Registrarme</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginTop: 15 }}
      >
        <Text style={styles.logoutText}>Volver al inicio de sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ===================== MAIN CONDUCTOR ===================== */
function MainScreen({ navigation, route }) {
  const choferID = route?.params?.choferID;
  const [starting, setStarting] = useState(false);

  const sessionId = route?.params?.sessionId;
const alertaMostrada = useRef(false);

useEffect(() => {

    if (!sessionId) return;

    const conductorRef = ref(
        db,
        `CronoRutas/Conductores/${choferID}/sessionId`
    );

    const unsubscribe = onValue(conductorRef, (snapshot) => {

        const nuevaSesion = snapshot.val();

        if (
            !alertaMostrada.current &&
            nuevaSesion &&
            nuevaSesion !== sessionId
        ) {

            alertaMostrada.current = true;

            detenerGPS();

            Alert.alert(
                "Sesión cerrada",
                "Se inició sesión desde otro dispositivo.",
                [
                    {
                        text: "Aceptar",
                        onPress: () => {

                            navigation.reset({
                                index:0,
                                routes:[{name:"Login"}]
                            });

                        }
                    }
                ]
            );

        }

    });

    return () => unsubscribe();

}, [choferID, sessionId]);

  const iniciarRecorrido = async () => {

    setStarting(true);

    await update(
        ref(db, `CronoRutas/Conductores/${choferID}`),
        {
            activo:true
        }
    );

    iniciarGPS(choferID);

    setTimeout(() => {

        navigation.replace("MainChoferDrive",{
            choferID,
            sessionId
        });

        setStarting(false);

    },2000);

};

  const cerrarSesion = async () => {

    try{

        detenerGPS();

        await update(
            ref(db,`CronoRutas/Conductores/${choferID}`),
            {
                loginActivo:false,
                sessionId:"",
                activo:false
            }
        );

        navigation.replace("Login");

    }catch(error){

        console.log(error);

    }

};

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={cerrarSesion} style={{ marginBottom: 20 }}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <Text style={styles.principal}>¡Bienvenido Conductor!</Text>

      <TouchableOpacity disabled={starting} onPress={iniciarRecorrido}>
        <LinearGradient
          colors={["#969798", "#5F3693", "#481786"]}
          style={styles.Boton2}
        >
          {starting ? (
            <View style={styles.row}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.text2}> Iniciando...</Text>
            </View>
          ) : (
            <Text style={styles.text2}>Empezar recorrido</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

/* ===================== RECORRIDO ===================== */
function MainScreenDrive({ navigation, route }) {
  const choferID = route?.params?.choferID;
  const [finalizando, setFinalizando] = useState(false);

const sessionId = route?.params?.sessionId;
const alertaMostrada = useRef(false);

useEffect(() => {

    if (!sessionId) return;

    const conductorRef = ref(
        db,
        `CronoRutas/Conductores/${choferID}/sessionId`
    );

    const unsubscribe = onValue(conductorRef, (snapshot) => {

        const nuevaSesion = snapshot.val();

        if (
            !alertaMostrada.current &&
            nuevaSesion &&
            nuevaSesion !== sessionId
        ) {

            alertaMostrada.current = true;

            detenerGPS();

            Alert.alert(
                "Sesión cerrada",
                "Se inició sesión desde otro dispositivo.",
                [
                    {
                        text:"Aceptar",
                        onPress:()=>{

                            navigation.reset({
                                index:0,
                                routes:[{name:"Login"}]
                            });

                        }
                    }
                ]
            );

        }

    });

    return ()=>unsubscribe();

}, [choferID, sessionId]);

  // Escuchar ubicación
  useEffect(() => {
    let subscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (loc) => {
          if (!finalizando) {
            console.log("📍 Ubicación detectada:", loc.coords);
          }
        }
      );
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [finalizando]);

  const finalizarRecorrido = async () => {

    setFinalizando(true);

    detenerGPS();

    try{

        await update(
            ref(db,`CronoRutas/Conductores/${choferID}`),
            {
                activo:false
            }
        );

    }catch(error){

        console.log(error);

    }

    setTimeout(()=>{

        navigation.replace("MainChofer",{
            choferID,
            sessionId
        });

        setFinalizando(false);

    },15000);

};

  return (
    <View style={styles.container2}>
      <Text style={styles.principal}>Recorrido en curso...</Text>

      <TouchableOpacity disabled={finalizando} onPress={finalizarRecorrido}>
        <LinearGradient
          colors={["#969798", "#5F3693", "#481786"]}
          style={styles.Boton2}
        >
          {finalizando ? (
            <View style={styles.row}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.text2}> Finalizando...</Text>
            </View>
          ) : (
            <Text style={styles.text2}>Finalizar recorrido</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

/* ===================== APP ===================== */
export default function App() {
  const Stack = createNativeStackNavigator();
  const [ready, setReady] = useState(false);

  if (!ready) return <AnimatedSplash onFinish={() => setReady(true)} />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainChofer" component={MainScreen} />
        <Stack.Screen name="MainChoferDrive" component={MainScreenDrive} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#FAEEFC",
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#FAEEFC",
    alignItems: "center",
    justifyContent: "center",
  },

  container2: {
    flex: 1,
    backgroundColor: "#FAEEFC",
    alignItems: "center",
    justifyContent: "center",
  },

  principal: {
    fontSize: 20,
    color: "#82680F",
    fontWeight: "bold",
    marginBottom: 20,
  },

  secundario: {
    fontSize: 15,
    color: "red",
    fontWeight: "bold",
    marginBottom: 20,
  },

  insertartexto: {
    width: "80%",
    height: 40,
    borderRadius: 15,
    backgroundColor: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },

  Boton: {
    marginTop: 15,
    width: 160,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
  },

  Boton2: {
    width: 230,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },

  text: {
    fontSize: 18,
    color: "white",
  },

  text2: {
    fontSize: 18,
    color: "white",
  },

  logoutText: {
    color: "#5F3693",
    fontSize: 14,
    textDecorationLine: "underline",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});