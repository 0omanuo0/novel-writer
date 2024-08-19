"use client";

import DnDList from "@/components/drag-n-drop";
import { createProject, createText, removeProject, removeText, updateProject } from "@/lib/actions";
import { Content, Project } from "@/lib/types";
import { ArchiveBoxXMarkIcon, PencilSquareIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import ReactDOMServer from "react-dom/server";

function LinkPage({ title, id }: { title: string, id: string }) {
    return (
        <Link href={`/editor/${id}`} className="hover:text-purple-300 hover:px-2 px-0 transition-all duration-300 ease-in-out truncate">{title}</Link>
    )
}

function EditContent({ block, contentProjects, project }: { block: Content, contentProjects: Content[], project: Project }) {
    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={() => {
                    const input = window.prompt("Enter new title: ");
                    if (input) {
                        const updater = async (newTitle: string) => {
                            const updated_list = contentProjects.map((item) => {
                                return item.id === block.id ? { id: item.id, title: newTitle } : item;
                            });
                            await updateProject(project.id, JSON.stringify({ content: updated_list }));
                        };
                        updater(input);
                    }
                }}
            >
                <PencilSquareIcon
                    className="h-5 text-gray-600 hover:text-purple-300 transition-colors duration-300"
                />
            </button>
            <button
                onClick={async () => {
                    await removeText(block.id, project.id);
                    window.location.reload();
                }}
            >
                <XMarkIcon
                    className="h-5 text-gray-600 hover:text-red-500 transition-colors duration-300"
                />
            </button>
        </div>
    )
}

function LoadingSkeleton({ project }: { project: Project }) {
    return (
        <div className="fixed top-0 left-0 h-full w-[300px] p-4">
            <nav className="h-full bg-gradient-to-br from-gray-800 to-gray-700 text-white p-6 rounded-xl shadow-lg relative">
                <h1 className="text-3xl font-light pb-6 text-left w-full tracking-widest">
                    {project.name}
                </h1>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-600 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-600 rounded w-5/6"></div>
                    <div className="h-6 bg-gray-600 rounded w-4/6"></div>
                    <div className="h-6 bg-gray-600 rounded w-full"></div>
                    <div className="h-6 bg-gray-600 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-600 rounded w-5/6"></div>
                    <div className="h-6 bg-gray-600 rounded w-4/6"></div>
                </div>
            </nav>
        </div>
    );
}

function scrollHandler(e: React.UIEvent<HTMLDivElement, UIEvent>) {
    const el = e.target as HTMLDivElement;
    if (el.scrollTop === 0) {
        el.classList.add("top-scroll");
        el.classList.remove("middle-scroll");
        el.classList.remove("end-scroll");
    }
    else if (el.scrollTop + el.clientHeight === el.scrollHeight) {
        el.classList.add("end-scroll");
        el.classList.remove("middle-scroll");
        el.classList.remove("top-scroll");
    }
    else {
        el.classList.add("middle-scroll");
        el.classList.remove("top-scroll");
        el.classList.remove("end-scroll");

    }
}

async function onChangeDnDList(e: any, project: Project) {
    const updated_list = e.map((item: any) => {
        const c = item.content;
        const c1 = ReactDOMServer.renderToStaticMarkup(c);
        const parser = new DOMParser();
        const c2 = parser?.parseFromString(c1, 'text/html').body.textContent;
        return { id: item.id, title: c2 }
    });
    await updateProject(project.id, JSON.stringify({ content: updated_list }));
}

async function newPage(project_id: string) {
    const input = window.prompt("Enter new title: ");
    if (input) {
        const targetid = await createText(project_id, input);
        window.location.href = `/editor/${targetid}`;
    }
}




export default function Sidebar({ project, projects }: { project?: Project, projects: Project[] }) {
    const [loading, setLoading] = useState(true);
    let contentProjects: Content[] = [];
    if (project)
        contentProjects = JSON.parse(project.content as string).content;

    const initialItemsDef = project ? contentProjects.map((block: Content, index: number) => ({
        id: block.id,
        content: <LinkPage title={block.title} id={block.id} />,
        otherContent: <EditContent block={block} contentProjects={contentProjects} project={project} />

    })) : [];

    const [showitemsList, setShowItemsList] = useState(false);
    const [showOtherProjects, setShowOtherProjects] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);

    if (loading) return <LoadingSkeleton project={project || { name: "" } as Project} />;


    return (
        <div className="fixed top-0 left-0 h-full w-[316px] p-4">
            <nav id="nav-bar" className="h-full bg-gradient-to-br from-gray-800 to-gray-700 text-white p-6 rounded-xl shadow-lg relative">
                <h1 className="text-3xl font-light text-left w-full tracking-widest">
                    {project ? project.name : ""}
                </h1>
                <style jsx>{`
                        .show-items-list {
                            height: ${showitemsList ? "0px" : 40 * (initialItemsDef.length + 1) + "px"};
                            max-height: ${showitemsList ? "0px" : 300 + "px"};
                            overflow: scroll;
                        }
                        .show-project-list {
                            height: ${showOtherProjects ? "0px" : 28 * projects.length + "px"};
                            max-height: ${showOtherProjects ? "0px" : 300 + "px"};
                            overflow: scroll;
                        }
                    `}
                </style>
                <div className="w-full mt-4">
                    <h2
                        onClick={() => { setShowItemsList(!showitemsList) }}
                        className="text-lg pb-4 px-2 w-full uppercase tracking-wide cursor-pointer hover:text-purple-300 transition-colors duration-300"
                    >Pages</h2>
                    {project &&
                        <div
                            className={" show-items-list top-scroll -mx-6 px-6 overflow-hidden transition-all duration-300 ease-in-out"}
                            onScroll={(e) => scrollHandler(e)}
                        >
                            <DnDList
                                className={"text-sm space-y-2 tracking-wider"}
                                initialItems={initialItemsDef}
                                onChange={async (e) => onChangeDnDList(e, project)}
                                handleComponent={
                                    <div
                                        className="cursor-grab active:cursor-grabbing select-none px-2 rounded-full h-4 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 shadow-md"
                                    >
                                        <div className="h-1 w-1 bg-white rounded-full"></div>
                                        <div className="h-1 w-1 bg-white rounded-full ml-1"></div>
                                    </div>
                                }
                            />
                            <button
                                className="w-full text-right text-sm hover:text-purple-300 transition-colors duration-500 tracking-widest mt-2"
                                onClick={async () => newPage(project.id)}
                            >Add new...</button>
                        </div>
                    }
                </div>
                <div className="w-full mt-4">
                    <h2
                        onClick={() => { setShowOtherProjects(!showOtherProjects) }}
                        className="text-lg pb-4 px-2 w-full uppercase tracking-wide cursor-pointer hover:text-purple-300 transition-colors duration-300"
                    >Other Projects</h2>
                    <div className="text-sm space-y-2 tracking-wider show-project-list top-scroll transition-all duration-300 ease-in-out">
                        {projects.map((item: any) => (
                            <div className="flex justify-between">
                                <Link href={`/editor/${item.content.content[0].id}`} key={item.id} className="hover:text-purple-300 block hover:border-l-2 pl-2 border-l-0 transition-all">{item.name}</Link>
                                <button
                                    onClick={async () => {
                                        await removeProject(item.id);
                                        window.location.reload();
                                    }}
                                >
                                    <XMarkIcon
                                        className="h-5 text-gray-600 hover:text-red-500 transition-colors duration-300"
                                    />
                                </button>
                            </div>

                        ))}
                    </div>
                    <button
                        className="w-full text-right text-sm hover:text-purple-300 transition-colors duration-500 tracking-widest mt-2"
                        onClick={async () => {
                            const input = window.prompt("Enter new project name: ");
                            if (input) {
                                await createProject(input, "");
                                window.location.reload();
                            }
                        }}
                    >Add new...</button>

                </div>
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gray-600 bg-opacity-50 rounded-b-xl ">
                    <div className="text-center hover:text-purple-300 transition-colors duration-300 cursor-pointer">
                        Back to Projects
                    </div>
                </div>
            </nav>
        </div >
    )
}
