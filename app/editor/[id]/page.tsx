
import Sidebar from "@/components/sidebar";
import { getText, getProject, getProjects } from "@/lib/data";
import EditorComponent from "@/components/editor_component";
import { Project } from "@/lib/types";
import { useSearchParams } from "next/navigation";



async function DefaultPage({ projects, project, children, id }: { projects: Project[], project?:Project, children?: any, id: string }) {
    return (
        <>
            <Sidebar project={project} projects={projects} id={id} />
            <main className=" pl-[348px] h-full min-h-screen py-2">
                {children}
            </main>
        </>
    )
}




export default async function Page({ params }: { params: { id: string } }) {
    const projects = await getProjects(); 

    if (!params.id || params.id === "Home") return (
        <DefaultPage projects={projects} id={params.id}>
            <h1 className="text-3xl">Main page</h1>
            <p className="text-lg">Select a project from the sidebar to start editing</p>
        </DefaultPage>
    );

    const data = await getText(params.id);

    if (!data) return (
        <DefaultPage projects={projects} id={params.id} >
            <h1 className="text-3xl">404 - Text not found</h1>
        </DefaultPage>
    );
    const initialContent = data.content;
    const project = await getProject(data.project_id);

    if (!project) return (
        <DefaultPage projects={projects} id={params.id} >
            <h1 className="text-3xl">404 - Project not found</h1>
        </DefaultPage>
    );

    return (
        <DefaultPage projects={projects} project={project} id={params.id}>
            <EditorComponent data={data} initialContent={initialContent} Title={project.name} />
        </DefaultPage>
    )
}