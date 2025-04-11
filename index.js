const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const config = require('./config.json');
const db = new sqlite3.Database('./database.sqlite');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log(`Bot online como ${client.user.tag}`);
    db.run(`CREATE TABLE IF NOT EXISTS keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT,
        used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'verificar') {
        const inputKey = interaction.options.getString('key');
        db.get(`SELECT * FROM keys WHERE key = ?`, [inputKey], (err, row) => {
            if (err) return interaction.reply({ content: 'Erro ao acessar o banco de dados.', ephemeral: true });
            if (!row) return interaction.reply({ content: 'Chave inválida.', ephemeral: true });
            const now = new Date();
            const createdAt = new Date(row.created_at);
            const diffMs = now - createdAt;
            const diffHrs = diffMs / (1000 * 60 * 60);
            if (row.used) return interaction.reply({ content: 'Esta chave já foi usada.', ephemeral: true });
            if (diffHrs > 12) return interaction.reply({ content: 'Chave expirada.', ephemeral: true });
            db.run(`UPDATE keys SET used = 1 WHERE key = ?`, [inputKey]);
            interaction.reply({ content: '✅ Chave verificada com sucesso!', ephemeral: true });
        });
    }
});

// Registra comando
const commands = [
    new SlashCommandBuilder()
        .setName('verificar')
        .setDescription('Verifica uma key')
        .addStringOption(option =>
            option.setName('key')
                .setDescription('A chave de verificação')
                .setRequired(true)),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);
rest.put(Routes.applicationCommands(config.clientId), { body: commands })
    .then(() => console.log('Comando registrado com sucesso!'))
    .catch(console.error);

client.login(config.token);
