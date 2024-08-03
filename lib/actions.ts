"use server";
import { openDb, closeDB, getProject} from "./data";
import { Content } from "./types";
import { randomUUID } from "crypto";

const default_content = {"root":{"children":[{"type":"paragraph","children":[{"text":"This is the initial content of the editor.4","type":"text"}]}],"type":"root"}};

export async function createText( project_id: string, name: string) {
    const db = await openDb();
    const id = randomUUID();
    // console.log("createText: ", id, project_id, name);
    await db.run(
        'INSERT INTO content_texts (id, project_id, name, type, content) VALUES (?, ?, ?, ?, ?)', 
        id, project_id, name, 'text', JSON.stringify(default_content));
    // append to the project
    const project = await getProject(project_id);
    const content = JSON.parse(project.content);
    content.content.push({id: id, title: name});
    await db.run('UPDATE projects SET content = ? WHERE id = ?', JSON.stringify(content), project_id);

    await closeDB(db);

    return id;
}

export async function removeText(id: string, project_id: string) {
    const db = await openDb();
    await db.run('DELETE FROM content_texts WHERE id = ?', id);
    await closeDB(db);

    console.log("removeText: ", id, project_id);
    // update the project
    const project = await getProject(project_id);
    const content = JSON.parse(project.content);
    const index = content.content.findIndex((item:Content) => item.id === id);
    content.content.splice(index, 1);
    console.log("removeText: ", id, content);
    await updateProject(project.id, JSON.stringify(content));
}

export async function updateText(id: string, content: any) {
    // console.log("updateText: ", id, content.root.children[0].children);

    const db = await openDb();
    await db.run('UPDATE content_texts SET content = ? WHERE id = ?', JSON.stringify(content), id);
    await closeDB(db);
}

export async function updateTextTitle(id: string, name: string) {
    const db = await openDb();
    await db.run('UPDATE content_texts SET name = ? WHERE id = ?', name, id);
    await closeDB(db);
}

export async function updateProject(id: string, content: string) {
    // console.log("updateProject: ", id, content);
    // update titles also if they are changed
    const contentProjectsNew : Content[] = JSON.parse(content).content;
    const contentProjectsOld : Content[] = JSON.parse((await getProject(id)).content).content;

    // update the titles (comparing the ids, not the index position)
    contentProjectsOld.map((item:Content) => {
        const newItem = contentProjectsNew.find((i:Content) => i.id === item.id);
        if(newItem){
            if(newItem.title !== item.title){
                updateTextTitle(item.id, newItem.title);
            }
        }
    });



    const db = await openDb();
    await db.run('UPDATE projects SET content = ? WHERE id = ?', content, id);
    await closeDB(db);
}