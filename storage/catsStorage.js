// storage/catsStorage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

// Inserir um novo gato
export const insertCat = async (cat) => {
  try {
    const catsJson = await AsyncStorage.getItem("cats");
    const cats = catsJson ? JSON.parse(catsJson) : [];
    
    if (!cat.id) cat.id = Date.now();

    cats.push(cat);
    await AsyncStorage.setItem("cats", JSON.stringify(cats));
    console.log(`Gato ${cat.nome} inserido com sucesso`);
  } catch (error) {
    console.log("Erro ao inserir gato:", error);
    throw error;
  }
};

// Buscar todos os gatos
export const getAllCats = async () => {
  try {
    const catsJson = await AsyncStorage.getItem("cats");
    return catsJson ? JSON.parse(catsJson) : [];
  } catch (error) {
    console.log("Erro ao buscar gatos:", error);
    return [];
  }
};

// Atualizar um gato
export const updateCat = async (updatedCat) => {
  try {
    const cats = await getAllCats();
    const newCats = cats.map((cat) => (cat.id === updatedCat.id ? updatedCat : cat));
    await AsyncStorage.setItem("cats", JSON.stringify(newCats));
    console.log(`Gato ${updatedCat.nome} atualizado`);
  } catch (error) {
    console.log("Erro ao atualizar gato:", error);
    throw error;
  }
};

// Deletar um gato
export const deleteCat = async (id) => {
  try {
    const cats = await getAllCats();
    const newCats = cats.filter((cat) => cat.id !== id);
    await AsyncStorage.setItem("cats", JSON.stringify(newCats));
    console.log(`Gato ${id} deletado`);
  } catch (error) {
    console.log("Erro ao deletar gato:", error);
    throw error;
  }
};
