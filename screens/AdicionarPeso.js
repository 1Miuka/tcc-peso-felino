import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdicionarPeso() {
  const navigation = useNavigation();
  const route = useRoute();
  const { catId } = route.params;

  const [peso, setPeso] = useState("");
  const [cat, setCat] = useState(null);

  useEffect(() => {
    const loadCat = async () => {
      try {
        const catsJson = await AsyncStorage.getItem("cats");
        const cats = catsJson ? JSON.parse(catsJson) : [];
        const selectedCat = cats.find(c => c.id === catId);
        if (selectedCat) setCat(selectedCat);
      } catch (error) {
        console.log("Erro ao carregar gato:", error);
      }
    };
    loadCat();
  }, [catId]);

  const salvarPeso = async () => {
    const novoPeso = parseFloat(peso);
    if (isNaN(novoPeso) || novoPeso <= 0) {
      Alert.alert("Atenção", "Informe um peso válido.");
      return;
    }

    try {
      const catsJson = await AsyncStorage.getItem("cats");
      const cats = catsJson ? JSON.parse(catsJson) : [];
      const updatedCats = cats.map(c => {
        if (c.id === catId) {
          const historico = c.historicoPesos ? [...c.historicoPesos] : [];
          historico.push({ peso: novoPeso, data: new Date().toISOString() });
          return { ...c, pesoAtual: novoPeso, historicoPesos: historico };
        }
        return c;
      });
      await AsyncStorage.setItem("cats", JSON.stringify(updatedCats));
      Alert.alert("Sucesso", `Peso atualizado para ${novoPeso} kg!`);
      navigation.goBack();
    } catch (error) {
      console.log("Erro ao salvar peso:", error);
      Alert.alert("Erro", "Não foi possível salvar o peso.");
    }
  };

  if (!cat) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Registrar Peso - {cat.nome}</Text>
      <Text style={styles.subtitle}>Informe o novo peso do gato para atualizar o progresso.</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o peso em kg"
        keyboardType="decimal-pad"
        value={peso}
        onChangeText={setPeso}
      />

      <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={salvarPeso}>
        <Text style={styles.btnText}>Salvar Peso</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => navigation.goBack()}>
        <Text style={styles.btnTextSecondary}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffecd2", padding: 20, justifyContent: "center" },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 10, textAlign: "center", color: "#333" },
  subtitle: { fontSize: 15, color: "#666", marginBottom: 20, textAlign: "center" },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  btn: { padding: 12, borderRadius: 10, alignItems: "center", marginBottom: 10 },
  btnPrimary: { backgroundColor: "#f77f00" },
  btnSecondary: { backgroundColor: "#ddd" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  btnTextSecondary: { color: "#333", fontWeight: "bold", fontSize: 16 },
});
