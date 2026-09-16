import * as Location from "expo-location";
import { ref, update } from "firebase/database";
import { db } from "./firebase";

let intervalGPS = null;

export const iniciarGPS = async (choferID) => {

  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    console.log("Permiso de ubicación denegado");
    return;
  }

  intervalGPS = setInterval(async () => {

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });

    const lat = location.coords.latitude;
    const lng = location.coords.longitude;

    update(
      ref(db, "CronoRutas/Conductores/" + choferID + "/gps"),
      {
        lat: lat,
        lng: lng,
        timestamp: Date.now()
      }
    );

    console.log("GPS enviado:", lat, lng);

  }, 5000); // cada 5 segundos
};

export const detenerGPS = () => {

  if (intervalGPS) {
    clearInterval(intervalGPS);
    intervalGPS = null;
  }

};