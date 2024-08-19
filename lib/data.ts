"use server";

import { unstable_noStore as noStore } from 'next/cache';

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { Content, Project, TextContent } from './types';


sqlite3.verbose();

export async function openDb() {
    return open({
        filename: './database.db',
        driver: sqlite3.Database
    });
}


export async function closeDB(db: any) {
    return db.close();
}

export async function getProject(id:string) : Promise<Project> {
    noStore();
    const db = await openDb();
    const items = await db.all('SELECT * FROM projects WHERE id = ?', id);
    await closeDB(db);
    return items[0];
}

export async function getText(id:string) : Promise<TextContent> {
    noStore();
    const db = await openDb();
    const items = await db.all('SELECT * FROM content_texts WHERE id = ?', id);
    await closeDB(db);
    return items[0];
}

export async function getProjects() : Promise<Project[]> {
    noStore();
    const db = await openDb();
    const items = await db.all('SELECT * FROM projects');
    try{
        items.forEach((item: Project) => {
            item.content = JSON.parse(item.content as string )as Content[];
        });
    }
    catch(e){
        console.log("Error parsing content: ", e);
    }
    await closeDB(db);
    return items;
}