require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// 📦 Esquema e modelo do MongoDB
const MessageSchema = new mongoose.Schema({
  number: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// 📡 Conexão com o MongoDB
async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI não definida nas variáveis de ambiente.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Conectado ao MongoDB');
  } catch (err) {
    console.error('❌ Erro ao conectar no MongoDB:', err.message);
    process.exit(1);
  }
}

// 🤖 Instância do bot
const client = new Client({
  authStrategy: new LocalAuth()
});

// 📱 Geração de QR Code
client.on('qr', (qr) => {
  console.log('📱 Escaneie o QR Code abaixo para logar no WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('🤖 Bot conectado ao WhatsApp!');
});

// 🧠 Chatbot Simples
const delay = ms => new Promise(res => setTimeout(res, ms));

client.on('message', async msg => {
  if (msg.fromMe || !msg.from.endsWith('@c.us')) return;

  const chat = await msg.getChat();
  const contact = await msg.getContact();
  const name = contact.pushname?.split(" ")[0] || 'usuário';

  try {
    await Message.create({ number: msg.from, message: msg.body });

    // Menu inicial
    if (/^(oi|olá|ola|menu|1)$/i.test(msg.body)) {
      await delay(1000);
      await chat.sendStateTyping();
      await delay(2000);
      await client.sendMessage(msg.from,
        `Olá, ${name}! 👋\nSou a assistente virtual da Assessoria Villani.\nEscolha uma opção:\n\n` +
        `1️⃣ Cidadania Italiana\n2️⃣ Cidadania Portuguesa\n3️⃣ Conversão de CNH\n4️⃣ Tradução juramentada\n5️⃣ Outros`
      );
      return;
    }

    // Respostas para opções
    const respostas = {
      '1': 'Por favor, digite uma das opções abaixo:\n1 - Busca de documentos\n2 - Emissão de Certidões\n3 - Cidadania Judicial\n4 - Outros',
      '2': 'Aguarde, um de nossos atendentes entrará em contato. Obrigado!',
      '3': 'Aguarde, um de nossos atendentes entrará em contato. Obrigado!',
      '4': 'Poderia nos dizer como podemos te ajudar com tradução juramentada?',
      '5': 'Por favor, nos diga como podemos te ajudar.'
    };

    if (respostas[msg.body.trim()]) {
      await delay(1000);
      await chat.sendStateTyping();
      await delay(2000);
      await client.sendMessage(msg.from, respostas[msg.body.trim()]);
    }

  } catch (err) {
    console.error('❌ Erro ao processar mensagem:', err.message);
  }
});

// 🌐 Endpoint básico para testar servidor
app.get('/', (req, res) => {
  res.send('🤖 Bot WhatsApp está online!');
});

// 🚀 Inicialização
async function start() {
  await connectMongo();
  client.initialize();

  app.listen(PORT, () => {
    console.log(`🌐 Servidor HTTP escutando na porta ${PORT}`);
  });
}

start();
