import {openDatabase} from '../src/server.js';
const db=openDatabase();
console.log('Ruta SQLite:',process.env.DATABASE_PATH||'./data/moon-v03.sqlite');
for(const t of ['games','mission_history','purchase_history','audit_events','science_events']){
 console.log(t,db.prepare(`SELECT COUNT(*) AS count FROM ${t}`).get().count);
}
db.close();
