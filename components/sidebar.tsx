"use client";

import DnDList from "@/components/drag-n-drop";
import { createProject, createText, removeProject, removeText, updateProject } from "@/lib/actions";
import { Content, Project } from "@/lib/types";
import { DocumentTextIcon, ArchiveBoxXMarkIcon, ChatBubbleLeftRightIcon, ChevronDoubleRightIcon, PencilSquareIcon, XCircleIcon, XMarkIcon, Cog6ToothIcon, PresentationChartBarIcon, ChevronRightIcon, UserIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
        <nav className="h-full bg-gradient-to-br from-gray-800 to-gray-700 text-white p-6 rounded-xl shadow-lg relative w-[286px]">
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

function ProjectSection({ project, projects }: { project: Project, projects: Project[] }) {
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
        }, 300);
    }, []);

    if (loading) return <LoadingSkeleton project={project || { name: "" } as Project} />;

    return (
        <nav id="nav-bar" className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 text-white p-6 rounded-xl shadow-lg relative">
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

            <section className="w-full mt-4">
                <h2
                    onClick={() => { setShowItemsList(!showitemsList) }}
                    className="text-lg pb-4 px-2 w-full uppercase tracking-wide cursor-pointer hover:text-purple-300 transition-colors duration-300"
                > Pages</h2>
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
                                    className="cursor-grab active:cursor-grabbing grayscale-[0.5] hover:grayscale-0 active:scale-125 select-none px-2 rounded-full h-4 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 shadow-md"
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
            </section>


            <section className="w-full mt-4">
                <h2
                    onClick={() => { setShowOtherProjects(!showOtherProjects) }}
                    className="text-lg pb-4 px-2 w-full uppercase tracking-wide cursor-pointer hover:text-purple-300 transition-colors duration-300"
                >Projects</h2>
                <div className="text-sm space-y-2 tracking-wider show-project-list top-scroll transition-all duration-300 ease-in-out">
                    {projects.map((item: any, index:number) => (
                        <div key={index} className="flex justify-between">
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

            </section>
            <section className="absolute bottom-0 left-0 w-full p-4 bg-gray-600 bg-opacity-50 rounded-b-xl ">
                <Link
                    href="/editor/Home"
                    className="text-center w-full block hover:scale-110 hover:text-purple-300 transition-all duration-300 cursor-pointer"
                >
                    Back to Projects
                </Link>
            </section>
        </nav>
    );
}

function ChatSection({ project }: { project: Project }) {

    useEffect(() => {
        const input = document.getElementById("chat-input");

        const adjustHeight = (e: Event) => {
            const target = e.target as HTMLTextAreaElement;
            if (target.scrollHeight < 100) {
                target.style.height = "auto"; // Resetea la altura
                target.style.height = target.scrollHeight + "px"; // Ajusta la altura según el contenido
            }
            else {
                // set class to resize-none and scroll-y-auto, also set max-height
                input?.classList.add("resize-none", "scroll-y-auto", "max-h-[100px]", "overflow-y-auto");
            }
        };

        input?.addEventListener("input", adjustHeight);

        return () => {
            // Limpiamos el event listener cuando el componente se desmonte
            input?.removeEventListener("input", adjustHeight);
        };
    }, []);

    return (
        <nav className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 text-white p-4 rounded-xl shadow-lg relative">
            <h1 className="text-3xl font-light text-left w-full tracking-widest mb-3">
                Chat
            </h1>
            <div className=" rounded-xl h-[75%] overflow-auto p-2">
                {/* example of chat */}
                <div className="flex space-x-2 mb-4 flex-col bg-gray-600 rounded-md p-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gray-500 rounded-full">
                            <UserIcon className="h-5 w-5 mx-[10px] my-[10px]" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm">User</p>
                            <p className="text-xs text-gray-400">12:00</p>
                        </div>
                    </div>
                    <p className="text-sm">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae, voluptate.</p>
                </div>
                <div className="flex space-x-2 mb-4 flex-col bg-gray-600 rounded-md p-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gray-500 rounded-full">
                            <UserIcon className="h-5 w-5 mx-[10px] my-[10px]" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm">User</p>
                            <p className="text-xs text-gray-400">12:00</p>
                        </div>
                    </div>
                    <p className="text-sm">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae, voluptate.</p>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gray-600 bg-opacity-50 rounded-b-xl flex">
                <textarea
                    id="chat-input"
                    placeholder="Type a message"
                    rows={1}
                    // style the trackbar
                    style={{ scrollbarColor: "gray transparent" }}
                    className="w-full bg-gray-700 text-white p-2 rounded-lg outline-none resize-none overflow-hidden focus:bg-gray-800/60 transition-colors duration-300"
                />
                <button className="bg-gray-700 text-white px-2 py-1 rounded-lg ml-2 hover:bg-gray-800/60 transition-colors duration-300">
                    <ChevronRightIcon className="h-5 w-5" />
                </button>
            </div>
        </nav>
    );
}


export default function Sidebar({ project, projects, id }: { project?: Project, projects: Project[], id: string }) {
    const query = useSearchParams();
    const router = useRouter();
    const section = query.get("section");

    const [sectionPart, setSectionPart] = useState("project");

    useEffect(() => {
        if (section) {
            setSectionPart(section);
        }
        else {
            setSectionPart("project");
        }
    }, [section]);


    return (
        <div className="fixed top-0 left-0 h-full w-[356px] py-4 px-2 flex space-x-2">
            <aside
                className="h-full bg-gradient-to-br from-gray-800 to-gray-700 text-white py-6 px-3 rounded-xl shadow-lg relative space-y-4 flex flex-col"
            >
                <button onClick={() => {
                    setSectionPart("project");
                    router.push("/editor/" + (id !== undefined && id !== "" ? id : "Home") + "?section=project");
                }}>
                    <DocumentTextIcon className={"left-icons " + (sectionPart === "project" ? "" : "no-active")} />
                </button>
                <button onClick={() => {
                    setSectionPart("chat");
                    router.push("/editor/" + (id !== undefined && id !== "" ? id : "Home") + "?section=chat");
                }}>
                    <ChatBubbleLeftRightIcon className={"left-icons " + (sectionPart === "chat" ? "" : "no-active")} />
                </button>
                <button onClick={() => {
                    setSectionPart("other");
                    router.push("/editor/" + (id !== undefined && id !== "" ? id : "Home") + "?section=other");
                }}>
                    <PresentationChartBarIcon className={"left-icons " + (sectionPart === "other" ? "" : "no-active")} />
                </button>
                <Cog6ToothIcon className="h-10 w-10 mx-auto p-1 bg-gray-600/30 rounded-md absolute bottom-4 left-3" />
            </aside>
            {
                sectionPart === "project" &&
                <ProjectSection project={project as Project} projects={projects} />
            }
            {
                sectionPart === "chat" &&
                <ChatSection project={project as Project} />
            }
            {
                sectionPart === "other" &&
                <nav className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 text-white p-6 rounded-xl shadow-lg relative">
                    <h1 className="text-3xl font-light text-left w-full tracking-widest">
                        Other
                    </h1>
                    <div className="h-full w-full bg-gray-600 bg-opacity-50 rounded-xl shadow-inner">
                        <p className="text-center text-lg">Other section</p>
                    </div>
                </nav>
            }
        </div >
    )
}
