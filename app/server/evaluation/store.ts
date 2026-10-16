import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
let instance: DatabaseSync | undefined;
export function store() {
 if(instance)return instance;
 const path=process.env.EVALUATION_DATABASE;
 if(!path || !resolve(path).includes('evaluation') || /legacy|pgdata/i.test(path))throw Error('Dedicated evaluation database required');
 mkdirSync(dirname(resolve(path)),{recursive:true,mode:0o700});
 const db=new DatabaseSync(path);chmodSync(path,0o600);db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS users(sub TEXT PRIMARY KEY,email TEXT NOT NULL,name TEXT NOT NULL,admin INTEGER NOT NULL DEFAULT 0,admitted INTEGER NOT NULL DEFAULT 0,confirmed_at TEXT,confirmed_by TEXT);
 CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,sub TEXT,csrf TEXT NOT NULL,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS oauth(state TEXT PRIMARY KEY,session TEXT NOT NULL,nonce TEXT NOT NULL,verifier TEXT NOT NULL,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS devices(hash TEXT PRIMARY KEY,sub TEXT NOT NULL,label TEXT NOT NULL,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS pairing(hash TEXT PRIMARY KEY,sub TEXT NOT NULL,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY,at TEXT NOT NULL,actor TEXT NOT NULL,subject TEXT NOT NULL,action TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS limits(key TEXT PRIMARY KEY,window INTEGER NOT NULL,count INTEGER NOT NULL);`);
 instance=db;return db;
}
export function closeStore(){instance?.close();instance=undefined;}
export type User={sub:string;email:string;name:string;admin:number;admitted:number;confirmed_at:string|null;confirmed_by:string|null};
export type Session={hash:string;sub:string|null;csrf:string;expires:number};
