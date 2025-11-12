import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform,} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";
import { insertCat } from "../storage/catsStorage";

export default function AdicionarGato() {
  const navigation = useNavigation();

  const [nome, setNome] = useState("");
  const [pesoAtual, setPesoAtual] = useState("");

  const [sexo, setSexo] = useState(null);
  const [porte, setPorte] = useState(null);
  const [castrado, setCastrado] = useState(null);

  const [sexoOpen, setSexoOpen] = useState(false);
  const [porteOpen, setPorteOpen] = useState(false);
  const [castradoOpen, setCastradoOpen] = useState(false);

  const [sexoItems, setSexoItems] = useState([
    { label: "Macho", value: "macho" },
    { label: "Fêmea", value: "femea" },
  ]);
  const [porteItems, setPorteItems] = useState([
    { label: "Médio", value: "medio" },
    { label: "Grande", value: "grande" },
  ]);
  const [castradoItems, setCastradoItems] = useState([
    { label: "Sim", value: "sim" },
    { label: "Não", value: "nao" },
  ]);

  const closeAll = () => {
    setSexoOpen(false);
    setPorteOpen(false);
    setCastradoOpen(false);
  };

  const calcularPesoIdeal = () => {
    if (!porte || !sexo) return "";

    let min = 0,
      max = 0;

    if (porte === "medio") {
      min = 3.6;
      max = 4.5;
    } else if (porte === "grande") {
      if (sexo === "femea") {
        min = 4.5;
        max = 5.8;
      } else if (sexo === "macho") {
        min = 6.8;
        max = 11.3;
      }
    }

    if (castrado === "sim") {
      min = +(min * 0.9).toFixed(2);
      max = +(max * 0.9).toFixed(2);
    }

    return `${min} - ${max} kg`;
  };

  const salvarGato = async () => {
    const peso = parseFloat(pesoAtual);
    if (!nome || !sexo || !porte || !castrado || isNaN(peso) || peso <= 0) {
      Alert.alert("Atenção", "Preencha todos os campos corretamente.");
      return;
    }

    const novoGato = {
      id: Date.now(),
      nome,
      sexo,
      porte,
      castrado: castrado === "sim",
      pesoAtual: peso,
      pesoIdeal: calcularPesoIdeal(),
    };

    try {
      await insertCat(novoGato);
      Alert.alert("Sucesso", `Gato "${nome}" salvo com sucesso!`);
      navigation.goBack();
    } catch (error) {
      console.log("Erro ao salvar gato:", error);
      Alert.alert("Erro", "Não foi possível salvar o gato.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Adicionar Gato</Text>

        <Text style={styles.label}>Nome do gato</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: Mimi"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Sexo</Text>
        <DropDownPicker
          open={sexoOpen}
          value={sexo}
          items={sexoItems}
          setOpen={(o) => {
            closeAll();
            setSexoOpen(o);
          }}
          setValue={setSexo}
          setItems={setSexoItems}
          placeholder="Selecione"
          style={styles.dropdown}
          zIndex={3000}
        />

        <Text style={styles.label}>Porte</Text>
        <DropDownPicker
          open={porteOpen}
          value={porte}
          items={porteItems}
          setOpen={(o) => {
            closeAll();
            setPorteOpen(o);
          }}
          setValue={setPorte}
          setItems={setPorteItems}
          placeholder="Selecione"
          style={styles.dropdown}
          zIndex={2000}
        />

        <Text style={styles.hint}>
          Médio: Gatos domésticos - Grande: Raça Maine Coon
        </Text>

        <Text style={styles.label}>Castrado</Text>
        <DropDownPicker
          open={castradoOpen}
          value={castrado}
          items={castradoItems}
          setOpen={(o) => {
            closeAll();
            setCastradoOpen(o);
          }}
          setValue={setCastrado}
          setItems={setCastradoItems}
          placeholder="Selecione"
          style={styles.dropdown}
          zIndex={1000}
        />

        <Text style={styles.label}>Peso atual (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: 4.2"
          keyboardType="decimal-pad"
          value={pesoAtual}
          onChangeText={setPesoAtual}
        />

        <Text style={styles.pesoIdeal}>
          Peso ideal: {pesoAtual ? calcularPesoIdeal() : "--"}
        </Text>

        <TouchableOpacity style={styles.btn} onPress={salvarGato}>
          <Text style={styles.btnText}>Salvar Gato</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdf6fb", padding: 20 },
  header: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  label: { fontSize: 16, fontWeight: "600", marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    backgroundColor: "#fff",
  },
  dropdown: {
    borderColor: "#ccc",
    borderRadius: 12,
    marginTop: 6,
    backgroundColor: "#fff",
  },
  pesoIdeal: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  btn: {
    backgroundColor: "#ff7eb9",
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  hint: { color: "#6c757d", fontSize: 12, marginTop: 4 },
});
