const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
// Render автоматически назначает порт через переменные окружения, локально используем 3000
const PORT = process.env.PORT || 3000;

app.use(express.json());

const dbPath = path.join(__dirname, 'database.json');

const readDatabase = () => {
  if (!fs.existsSync(dbPath)) {
    return { contacts: [] };
  }
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
};

const writeDatabase = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
};

// --- API ДЛЯ КОНТАКТОВ ---

// 1. GET: Получить все контакты
app.get('/contacts', (req, res) => {
  const db = readDatabase();
  res.json(db.contacts);
});

// 2. GET: Получить контакт по ID
app.get('/contacts/:id', (req, res) => {
  const db = readDatabase();
  const contactId = parseInt(req.params.id);
  const contact = db.contacts.find(c => c.id === contactId);
  
  if (!contact) {
    return res.status(404).json({ error: 'Контакт не найден' });
  }
  res.json(contact);
});

// 3. POST: Добавить новый контакт
app.post('/contacts', (req, res) => {
  const db = readDatabase();
  const newContact = {
    id: db.contacts.length > 0 ? db.contacts[db.contacts.length - 1].id + 1 : 1,
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email
  };

  db.contacts.push(newContact);
  writeDatabase(db);
  
  res.status(201).json(newContact);
});

// 4. PUT: Обновить контакт
app.put('/contacts/:id', (req, res) => {
  const db = readDatabase();
  const contactId = parseInt(req.params.id);
  const index = db.contacts.findIndex(c => c.id === contactId);

  if (index === -1) {
    return res.status(404).json({ error: 'Контакт не найден' });
  }

  db.contacts[index] = {
    id: contactId,
    name: req.body.name || db.contacts[index].name,
    phone: req.body.phone || db.contacts[index].phone,
    email: req.body.email || db.contacts[index].email
  };

  writeDatabase(db);
  res.json(db.contacts[index]);
});

// 5. DELETE: Удалить контакт
app.delete('/contacts/:id', (req, res) => {
  const db = readDatabase();
  const contactId = parseInt(req.params.id);
  const index = db.contacts.findIndex(c => c.id === contactId);

  if (index === -1) {
    return res.status(404).json({ error: 'Контакт не найден' });
  }

  const deleted = db.contacts.splice(index, 1);
  writeDatabase(db);

  res.json({ message: 'Контакт успешно удален', contact: deleted[0] });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});