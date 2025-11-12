import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import AdicionarGato from "../screens/AdicionarGato";
import AdicionarPeso from "../screens/AdicionarPeso";
import AcompanharGato from "../screens/AcompanharGato";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#ff7eb9" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Início" }}
      />
      <Stack.Screen
        name="AdicionarGato"
        component={AdicionarGato}
        options={{ title: "Adicionar Novo Gato" }}
      />
      <Stack.Screen
        name="AdicionarPeso"
        component={AdicionarPeso}
        options={{ title: "Registrar Peso" }}
      />
      <Stack.Screen
        name="AcompanharGato"
        component={AcompanharGato}
        options={{ title: "Progresso do Gato" }}
      />
    </Stack.Navigator>
  );
}
