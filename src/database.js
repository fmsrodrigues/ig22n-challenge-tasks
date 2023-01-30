import fs from "node:fs/promises";
import { randomUUID } from 'node:crypto';

const databasePath = new URL('../db.json', import.meta.url);

export class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, 'utf8')
      .then(data => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist()
      })
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database))
  }

  getById(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id);

    if(rowIndex !== -1) {
      return this.#database[table][rowIndex];
    }
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if(search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].includes(value);
        })
      })
    }

    return data;
  }

  insert(table, data) {
    const sanitizedData = { 
      ...data,
      id: randomUUID(),
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString(),
    };

    if(Array.isArray(this.#database[table])) {
      this.#database[table].push(sanitizedData);
    } else {
      this.#database[table] = [sanitizedData]
    }
  
    this.#persist();

    return data;
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id);

    if(rowIndex !== -1) {
      const item = this.#database[table][rowIndex];

      const sanitizedData =  {
        ...item,
        ...data,
        updated_at: new Date().toISOString(), 
        id
      }

      this.#database[table][rowIndex] = sanitizedData;
      this.#persist();
    }
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id);

    if(rowIndex !== -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
    }
  }
}