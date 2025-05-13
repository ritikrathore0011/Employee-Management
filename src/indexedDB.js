// src/indexedDB.js
import { openDB } from 'idb';
// import { deleteDB } from 'idb';


const DB_NAME = 'MyDatabase';
const DB_VERSION = 1;
const USER_STORE = 'userStore';
const CHECKIN_STORE = 'checkinStore';

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(USER_STORE)) {
        db.createObjectStore(USER_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CHECKIN_STORE)) {
        db.createObjectStore(CHECKIN_STORE, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

// ==== USER STORE FUNCTIONS ====

export async function addUser(user) {
  const db = await initDB();
  await db.add(USER_STORE, user);  
}

export async function getUser(id) {
  const db = await initDB();
  return db.get(USER_STORE, id);
}

export async function deleteUser(id) {
  const db = await initDB();
  return db.delete(USER_STORE, id);
}

// export async function getAllUsers() {
//   const db = await initDB();
//   return db.getAll(USER_STORE);
// }

// ==== CHECKIN STORE FUNCTIONS ====

// export async function addCheckin() {
//   const db = await initDB();
//   await db.add(CHECKIN_STORE, checkin); // add checkin records (auto increment ID)
// }

// export async function getAllCheckins() {
//   const db = await initDB();
//   return db.getAll(CHECKIN_STORE);
// }

// export async function deleteCheckin(id) {
//   const db = await initDB();
//   return db.delete(CHECKIN_STORE, id);
// }

// export async function deleteEntireIndexedDB() {
//   await deleteDB('MyDatabase');
// }
export async function clearUserStore() {
  const db = await initDB();
  await db.clear(USER_STORE);
}
