import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [cats, setCats] = useState([]);

  useEffect(() => {
    loadCats();
  }, [isFocused]);

  const loadCats = async () => {
    try {
      const catsJson = await AsyncStorage.getItem("cats");
      const storedCats = catsJson ? JSON.parse(catsJson) : [];
      setCats(storedCats);
    } catch (error) {
      console.log("Erro ao carregar gatos:", error);
    }
  };

  const deleteCat = async (id) => {
    try {
      const filteredCats = cats.filter(cat => cat.id !== id);
      await AsyncStorage.setItem("cats", JSON.stringify(filteredCats));
      setCats(filteredCats);
    } catch (error) {
      console.log("Erro ao deletar gato:", error);
    }
  };

  const getPesoRange = (cat) => {
    if (!cat.porte || !cat.sexo) return { min: 0, max: 0 };
    if (cat.porte === "medio") return { min: 3.6, max: 4.5 };
    if (cat.porte === "grande") {
      if (cat.sexo === "femea") return { min: 4.5, max: 5.8 };
      if (cat.sexo === "macho") return { min: 6.8, max: 11.3 };
    }
    return { min: 0, max: 0 };
  };

  const renderCat = ({ item }) => {
    const { min, max } = getPesoRange(item);
    const peso = item.pesoAtual || 0;

    let pct = 0;
    let cor = "green";

    if (peso < min) {
      pct = (peso / min) * 100;
      cor = "yellow";
    } else if (peso > max) {
      pct = (peso / max) * 100;
      cor = "red";
    } else {
      pct = 100;
      cor = "green";
    }

    return (
      <View style={styles.petCard}>
        <View style={styles.petHeader}>
          <Text style={styles.petName}>🐱 {item.nome}</Text>
          <TouchableOpacity onPress={() => deleteCat(item.id)}>
            <Text style={styles.deleteText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pillsContainer}>
          <Text style={[styles.pill, styles.portePill]}>Porte: {item.porte}</Text>
          <Text style={[styles.pill, styles.pesoPill]}>
            Peso: {peso.toFixed(2)} kg
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${Math.min(pct, 150)}%`, backgroundColor: cor === "green" ? "#4CAF50" : cor === "yellow" ? "#FFC107" : "#F44336" }]}>
            <Text style={styles.progressText}>{Math.round(pct)}%</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btnVer} onPress={() => navigation.navigate("AcompanharGato", { catId: item.id })}>
          <Text style={styles.btnText}>Ver Mais</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cats}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCat}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum gato cadastrado ainda 🐱</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity style={styles.btnAdd} onPress={() => navigation.navigate("AdicionarGato")}>
        <Text style={styles.btnAddText}>+ Adicionar Novo Gato</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fdf6fb" },
  petCard: { backgroundColor: "#fff", padding: 20, borderRadius: 20, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  petHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  petName: { fontSize: 20, fontWeight: "700" },
  deleteText: { fontSize: 20 },
  pillsContainer: { flexDirection: "row", marginBottom: 10, flexWrap: "wrap" },
  pill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 50, fontWeight: "600", marginRight: 8, marginBottom: 4, color: "#fff", fontSize: 14 },
  portePill: { backgroundColor: "#2196F3" },
  pesoPill: { backgroundColor: "#ff7eb9" },
  progressBar: { width: "100%", height: 18, backgroundColor: "#eee", borderRadius: 12, overflow: "hidden", marginBottom: 10 },
  progress: { height: "100%", justifyContent: "center", alignItems: "flex-start", paddingLeft: 10 },
  progressText: { color: "white", fontWeight: "600", fontSize: 12 },
  btnVer: { backgroundColor: "#ff65a3", padding: 10, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  btnAdd: { backgroundColor: "#ff7eb9", padding: 16, borderRadius: 16, alignItems: "center", marginTop: 10 },
  btnAddText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  emptyText: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#666" },
});
