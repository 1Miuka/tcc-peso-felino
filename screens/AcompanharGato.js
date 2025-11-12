import React, { useEffect, useState } from "react";
import { View,  Text,  TouchableOpacity,  FlatList,  StyleSheet,  Dimensions,  TextInput,  Modal, } from "react-native"; import {  useRoute,  useNavigation, useIsFocused,} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit";

export default function AcompanharGato() {
  const route = useRoute();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { catId } = route.params;

  const [cat, setCat] = useState(null);
  const [pesos, setPesos] = useState([]);
  const [pesoRange, setPesoRange] = useState({ min: 0, max: 0 });

  const [modalVisible, setModalVisible] = useState(false);
  const [pesoEdit, setPesoEdit] = useState("");
  const [indexEdit, setIndexEdit] = useState(null);

  useEffect(() => {
    const loadCat = async () => {
      try {
        const catsJson = await AsyncStorage.getItem("cats");
        const cats = catsJson ? JSON.parse(catsJson) : [];
        const selectedCat = cats.find((c) => c.id === catId);

        if (!selectedCat) {
          alert("Gato não encontrado!");
          navigation.goBack();
          return;
        }

        if (!selectedCat.pesoInicial) {
          selectedCat.pesoInicial = selectedCat.pesoAtual;

          const gIndex = cats.findIndex((c) => c.id === catId);
          if (gIndex > -1) {
            cats[gIndex].pesoInicial = selectedCat.pesoInicial;
            await AsyncStorage.setItem("cats", JSON.stringify(cats));
          }
        }

        setCat(selectedCat);

        const range = getPesoRange(selectedCat);
        setPesoRange(range);

        const historico = Array.isArray(selectedCat.historicoPesos)
          ? selectedCat.historicoPesos
          : [];
        const listaPesos = [
          { peso: selectedCat.pesoInicial, data: "Ini" },
          ...historico,
        ];
        setPesos(listaPesos);
      } catch (error) {
        console.log("Erro ao carregar gato:", error);
      }
    };

    if (isFocused) loadCat();
  }, [catId, isFocused]);

  const getPesoRange = (cat) => {
    if (!cat.porte || !cat.sexo) return { min: 0, max: 0 };
    if (cat.porte === "medio") return { min: 3.6, max: 4.5 };
    if (cat.porte === "grande") {
      return cat.sexo === "femea"
        ? { min: 4.5, max: 5.8 }
        : { min: 6.8, max: 11.3 };
    }
    return { min: 0, max: 0 };
  };

  if (!cat) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  // Barra de progresso
  const ultimoPeso = pesos.length ? Number(pesos[pesos.length - 1].peso) : 0;
  let progressoPct = 0;
  if (ultimoPeso < pesoRange.min)
    progressoPct = (ultimoPeso / pesoRange.min) * 100;
  else if (ultimoPeso > pesoRange.max)
    progressoPct = (ultimoPeso / pesoRange.max) * 100;
  else progressoPct = 100;

  const labels = pesos.map((p) => {
    if (!p.data) return "Ini";
    if (p.data === "Ini") return "Ini";
    const d = new Date(p.data);
    return !isNaN(d) ? `${d.getDate()}/${d.getMonth() + 1}` : p.data;
  });

  const dataPesos = pesos.map((p) => Number(p.peso) || 0);
  const dataIdeal = dataPesos.map(() => pesoRange.max);

  // Funções de editar e deletar
  const openEditModal = (index, valorAtual) => {
    setIndexEdit(index);
    setPesoEdit(valorAtual.toString());
    setModalVisible(true);
  };

  const confirmEditPeso = async () => {
    const novoPeso = parseFloat(pesoEdit);
    if (isNaN(novoPeso) || novoPeso <= 0) {
      alert("Valor inválido!");
      return;
    }

    const novaLista = [...pesos];
    novaLista[indexEdit].peso = novoPeso;
    setPesos(novaLista);

    const catsJson = await AsyncStorage.getItem("cats");
    const cats = catsJson ? JSON.parse(catsJson) : [];
    const gIndex = cats.findIndex((c) => c.id === catId);
    if (gIndex > -1) {
      cats[gIndex].historicoPesos = novaLista.slice(1);
      await AsyncStorage.setItem("cats", JSON.stringify(cats));
    }

    setModalVisible(false);
  };

  const deletePeso = async (index) => {
    if (index === 0) {
      alert("Não é possível deletar o peso inicial!");
      return;
    }

    const novaLista = [...pesos];
    novaLista.splice(index, 1);
    setPesos(novaLista);

    const catsJson = await AsyncStorage.getItem("cats");
    const cats = catsJson ? JSON.parse(catsJson) : [];
    const gIndex = cats.findIndex((c) => c.id === catId);
    if (gIndex > -1) {
      cats[gIndex].historicoPesos = novaLista.slice(1);
      await AsyncStorage.setItem("cats", JSON.stringify(cats));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🐱 {cat.nome} - Progresso</Text>

      <View style={styles.progressoContainer}>
        <View
          style={[
            styles.progressoBar,
            {
              width: `${Math.min(progressoPct, 150)}%`,
              backgroundColor:
                progressoPct === 100
                  ? "#4CAF50"
                  : progressoPct < 100
                  ? "#FFC107"
                  : "#F44336",
            },
          ]}
        >
          <Text style={styles.progressoText}>{Math.round(progressoPct)}%</Text>
        </View>
      </View>

      {pesos.length > 0 ? (
        <LineChart
          data={{
            labels,
            datasets: [
              { data: dataPesos, color: () => "#ff7eb9", strokeWidth: 2 },
              { data: dataIdeal, color: () => "#6bc5ff", strokeWidth: 2 },
            ],
          }}
          width={Dimensions.get("window").width - 40}
          height={220}
          yAxisSuffix="kg"
          chartConfig={{
            backgroundGradientFrom: "#fdf6fb",
            backgroundGradientTo: "#e0f7fa",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 126, 185, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: "5", strokeWidth: "2", stroke: "#ff65a3" },
          }}
          style={{ marginVertical: 10, borderRadius: 16 }}
        />
      ) : (
        <Text style={{ textAlign: "center", marginVertical: 10 }}>
          Nenhum dado disponível
        </Text>
      )}

      <TouchableOpacity
        style={[styles.btn, styles.btnAdd]}
        onPress={() => navigation.navigate("AdicionarPeso", { catId })}
      >
        <Text style={styles.btnText}>+ Registrar Novo Peso</Text>
      </TouchableOpacity>

      <FlatList
        style={styles.listaPesos}
        contentContainerStyle={{ paddingBottom: 20 }}
        data={pesos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          const dataFormatada =
            item.data === "Ini"
              ? "Registro inicial"
              : `${new Date(item.data).getDate()}/${
                  new Date(item.data).getMonth() + 1
                }`;
          return (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <Text>
                {dataFormatada}: {Number(item.peso).toFixed(2)} kg
              </Text>
              <View style={{ flexDirection: "row" }}>
                {index !== 0 && (
                  <>
                    <TouchableOpacity
                      onPress={() => openEditModal(index, item.peso)}
                      style={{
                        backgroundColor: "#FFC107",
                        padding: 4,
                        borderRadius: 6,
                        marginRight: 4,
                      }}
                    >
                      <Text style={{ color: "#fff" }}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deletePeso(index)}
                      style={{
                        backgroundColor: "#F44336",
                        padding: 4,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: "#fff" }}>Deletar</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          );
        }}
      />

      {}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 16,
              width: "80%",
            }}
          >
            <Text>Digite o novo valor do peso (kg):</Text>
            <TextInput
              value={pesoEdit}
              onChangeText={setPesoEdit}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                marginVertical: 12,
                padding: 8,
                borderRadius: 8,
              }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ padding: 10 }}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmEditPeso}
                style={{
                  backgroundColor: "#4CAF50",
                  padding: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#fff" }}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={[styles.btn, styles.btnBack]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.btnTextBack}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdf6fb", padding: 20 },
  header: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  progressoContainer: {
    width: "100%",
    backgroundColor: "#eee",
    borderRadius: 12,
    overflow: "hidden",
    height: 20,
    marginBottom: 12,
  },
  progressoBar: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  progressoText: { color: "white", fontWeight: "600" },
  btn: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  btnAdd: { backgroundColor: "#ff7eb9" },
  btnBack: { backgroundColor: "#ccc", marginTop: 20 },
  btnText: { color: "white", fontWeight: "700", fontSize: 16 },
  btnTextBack: { color: "#333", fontWeight: "700", fontSize: 16 },
  listaPesos: {
    marginTop: 10,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
  },
});