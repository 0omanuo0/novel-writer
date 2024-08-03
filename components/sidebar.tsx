"use client";

import DnDList from "@/components/drag-n-drop";
import { createText, removeText, updateProject } from "@/lib/actions";
import { Content, Project } from "@/lib/types";
import Link from "next/link";
import React from "react";
import ReactDOMServer from "react-dom/server";



export default function Sidebar({ project }: { project: Project }) {
    // const initialItemsDef = Array.from({ length: 10 }, (_, index) => ({
    //     id: `item-${index}`,
    //     content: <a href={`/${index}`}>Item {index}</a>,
    //     otherContent : <button onClick={()=>{alert("clicked: " + index)}}>✏️</button>
    // }));

    const contentProjects: Content[] = JSON.parse(project.content).content;

    const initialItemsDef = contentProjects.map((block: Content, index: number) => ({
        id: block.id,
        content: <Link href={`/editor/${block.id}`} className=" ">{block.title}</Link>,
        otherContent:
            <div className="w-fit space-x-2">
                <button
                    onClick={() => {
                        //input dialog html
                        const input = window.prompt("Enter new title: ");
                        if (input) {
                            //update the title
                            const updater = async (newTitle: string) => {
                                const updated_list = contentProjects.map((item) => {
                                    return item.id === block.id ? { id: item.id, title: newTitle } : item;
                                });
                                // Update the project in the backend
                                await updateProject(project.id, JSON.stringify({ content: updated_list }));
                            };
                            updater(input);

                            // reload the page
                            // window.location.reload();
                        }
                    }}
                >✏️</button>
                <button
                    onClick={async () => {
                        await removeText(block.id, project.id);
                        // reload the page
                        window.location.reload();
                    }
                    }
                >❌</button>
            </div>
    }));


    return (
        <div
            className=" fixed top-0 left-0 h-full w-[300px] bg-gray-800 text-white p-4"
        >
            <h1 className="text-3xl p-4 text-center w-full">
                {project.name}
            </h1>
            <div className="w-full">
                <DnDList
                    initialItems={initialItemsDef}
                    onChange={async (e) => {
                        const updated_list = e.map((item) => {
                            const c = item.content;
                            // get the children of the anchor tag
                            const c1 = ReactDOMServer.renderToStaticMarkup(c);
                            // convert to html and get the text content
                            const parser = new DOMParser();
                            const c2 = parser?.parseFromString(c1, 'text/html').body.textContent;
                            return { id: item.id, title: c2 }
                        });
                        await updateProject(project.id, JSON.stringify({ content: updated_list }));
                    }} />
                <button className="" onClick={async () => {
                    const input = window.prompt("Enter new title: ");
                    if (input) {
                        const targetid = await createText(project.id, input);
                        // redirect to the new page
                        window.location.href = `/editor/${targetid}`;
                    }
                }}>
                    Add new...
                </button>
            </div>
        </div>
    )
}