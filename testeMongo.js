
        
        const { MongoClient } = require("mongodb");

// Substitua pelo seu URI real
const uri = 


async function testarConexao() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Conexão com MongoDB bem-sucedida!");
  } catch (erro) {
    console.error("❌ Erro ao conectar com MongoDB:", erro);
  } finally {
    await client.close();
  }
}

testarConexao();