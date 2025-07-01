require('dotenv').config();
const mongoose = require('mongoose');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({ authStrategy: new LocalAuth() });

const MessageSchema = new mongoose.Schema({
  number: String,
  message: String,
  date: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Erro MongoDB:', error);
    process.exit(1);
  }
}

client.on('qr', qr => {
  console.log('📱 Escaneie o QR Code:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp conectado');
});

client.on('message', async msg => {
  if (!msg.from.endsWith('@c.us')) return; // ignorar grupos

  try {
    await Message.create({ number: msg.from, message: msg.body });
    console.log(`💾 Mensagem salva: ${msg.from} -> ${msg.body}`);
  } catch (err) {
    console.error('❌ Erro ao salvar mensagem:', err);
  }

  // Aqui você pode colocar seu fluxo de respostas...
});

async function start() {
  await connectMongo();
  client.initialize();
}

start();
