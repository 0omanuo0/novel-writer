
const sqlite3 = require('sqlite3').verbose();
const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');
const { title } = require('process');


function openDatabase(callback) {
    let db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error(err.message);
            return callback(err, null);
        }
        console.log('Conectado a la base de datos SQLite.');
        callback(null, db);
    });
}


function callback(err, db) {
    // Create table if not exists projects with columns id, name, description, creation_date, last_updated_date, content
    db.run(`CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    creation_date TEXT NOT NULL,
    last_updated_date TEXT NOT NULL,
    content TEXT NOT NULL
)`, (err) => {
        if (err) {
            console.error(err.message);
        }
    });

    // create table content-texts with columns id, project_id, name, type, content-texts
    db.run(`CREATE TABLE IF NOT EXISTS content_texts (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL
)`, (err) => {
        if (err) {
            console.error(err.message);
        }
    });

    // populate the projects table with some data
    const contentIDs = Array.from({ length: 5 }, (_, i) => i + 1).map((i) => randomUUID());

    const content1 = contentIDs.slice(0, 3).map((id, index) => {
        return {
            id,
            title: `Title ${index}`,
        };
    });
    const p1 = {
        id: randomUUID(),
        name: 'Project 1',
        description: 'This is project 1',
        creation_date: new Date().toISOString(),
        last_updated_date: new Date().toISOString(),
        content: JSON.stringify({ content: content1 })

    };

    const content2 = contentIDs.slice(3).map((id, index) => {
        return {
            id,
            title: `Title ${index}`,
        };
    });
    const p2 = {
        id: randomUUID(),
        name: 'Project 2',
        description: 'This is project 2',
        creation_date: new Date().toISOString(),
        last_updated_date: new Date().toISOString(),
        content: JSON.stringify({ content: content2 })
    };

    db.run(
        `INSERT INTO projects 
    (id, name, description, creation_date, last_updated_date, content) 
    VALUES (?, ?, ?, ?, ?, ?)
`,
        [p1.id, p1.name, p1.description, p1.creation_date, p1.last_updated_date, p1.content], (err) => {
            if (err) {
                console.error(err.message);
            }
        });

    db.run(
        `INSERT INTO projects 
    (id, name, description, creation_date, last_updated_date, content) 
    VALUES (?, ?, ?, ?, ?, ?)
`,
        [p2.id, p2.name, p2.description, p2.creation_date, p2.last_updated_date, p2.content], (err) => {
            if (err) {
                console.error(err.message);
            }
        });

    // populate the content_texts table with some data
    const listContents = Array.from({ length: 5 }, (_, i) => i + 1).map((i) => {
        return {
            id: contentIDs[i - 1],
            project_id: i <= 3 ? p1.id : p2.id,
            name: `Content ${i}`,
            type: 'text',
            content: {
                root: {
                    children: [
                        {
                            type: "paragraph",
                            children: [
                                {
                                    text: "This is the initial content of the editor." + i,
                                    type: "text",
                                },
                            ],
                        },
                    ],
                    type: "root",
                },
            }
        };
    });

    listContents.forEach((content) => {
        db.run(
            `INSERT INTO content_texts 
        (id, project_id, name, type, content) 
        VALUES (?, ?, ?, ?, ?)
    `,
            [content.id, content.project_id, content.name, content.type, JSON.stringify(content.content)], (err) => {
                if (err) {
                    console.error(err.message);
                }
            });
    });




}

openDatabase(callback);