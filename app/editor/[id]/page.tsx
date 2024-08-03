
import Sidebar from "@/components/sidebar";
import Editor from "./Editor";
import { getText, getProject } from "@/lib/data";
import EditorComponent from "@/components/editor_component";






export default async function Page({ params }: { params: { id: string } }) {
    const data = await getText(params.id);
    
    if (!data) return <div>Not found</div>;
    const initialContent = data.content;
    const project = await getProject(data.project_id);
    // console.log(JSON.parse(project.content));

    return (
        <>
        
            <Sidebar project={project} />
            <main className=" pl-[300px] h-full min-h-screen">
                <EditorComponent data={data} initialContent={initialContent} />
            </main>
        </>
    )
}