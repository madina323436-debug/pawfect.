require('dotenv').config()
const express = require('express')
const path = require('path')
const Database = require('better-sqlite3')
const app = express()
const db = new Database('./db.sqlite3')

// Create tables
db.exec(`
CREATE TABLE IF NOT EXISTS pets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, type TEXT, breed TEXT, age TEXT, gender TEXT, size TEXT, color TEXT,
  vaccinated TEXT, health TEXT, temperament TEXT, photo TEXT, description TEXT,
  adopted INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS adoptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pet_id INTEGER, fullName TEXT, phone TEXT, email TEXT, reason TEXT, agree INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, email TEXT, message TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`)

app.use(express.json())
app.use(express.static(path.join(__dirname,'public')))

// API: get pets
app.get('/api/pets', (req,res)=>{
  const rows = db.prepare('SELECT * FROM pets WHERE adopted=0 ORDER BY id DESC').all()
  res.json(rows)
})

// API: add pet
app.post('/api/pets', (req,res)=>{
  const p=req.body
  const stmt=db.prepare(`INSERT INTO pets (name,type,breed,age,gender,size,color,vaccinated,health,temperament,photo,description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
  const info=stmt.run(p.name,p.type,p.breed,p.age,p.gender,p.size,p.color,p.vaccinated,p.health,p.temperament,p.photo,p.description)
  res.json({id:info.lastInsertRowid})
})

// API: adopt
app.post('/api/adopt', (req,res)=>{
  const d=req.body
  db.prepare('INSERT INTO adoptions (pet_id,fullName,phone,email,reason,agree) VALUES (?,?,?,?,?,?)')
    .run(d.pet_id,d.fullName,d.phone,d.email,d.reason,d.agree?1:0)
  res.status(201).json({ok:true})
})

// API: contact
app.post('/api/contact',(req,res)=>{
  const m=req.body
  db.prepare('INSERT INTO messages (name,email,message) VALUES (?,?,?)').run(m.name,m.email,m.message)
  res.status(201).json({ok:true})
})

const PORT=process.env.PORT||3000
app.listen(PORT, ()=>console.log('Server running on port', PORT))
