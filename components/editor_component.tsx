"use client";

import Editor from "@/app/editor/[id]/Editor";
import { updateText } from "@/lib/actions";
import { useEffect, useRef, useState } from "react";
import { unstable_noStore as noStore } from 'next/cache';
import { parse } from "path";
import { getAnswer } from "@/lib/ai_helper";

function parseLexicalJSON(node: any) {
    let result = '';

    if (node.type === 'text') {
        result += node.text;
    } else if (node.children && node.children.length > 0) {
        for (let child of node.children) {
            result += parseLexicalJSON(child);
        }
        if (node.type === 'paragraph') {
            result += '\n'; // Add a newline for paragraph separation
        }
    }

    return result;
}


export default function EditorComponent({ data, initialContent }: { data: any, initialContent: string }) {
    const [editorContent, setEditorContent] = useState(JSON.parse(initialContent));
    const editorContentRef = useRef(JSON.parse(initialContent));


    useEffect(() => {
        editorContentRef.current = editorContent;
    }, [editorContent]);

    // loop to save the content every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            saveAction();
        }, 20000);

        return () => clearInterval(interval);
    }, []);


    const saveAction = async () => {
        noStore();
        const root = editorContentRef.current.root;
        const parsed = parseLexicalJSON(root);
        getAnswer(parsed).then((res) => {
            console.log(res);
        });
        // console.log(JSON.stringify(root))
        // console.log(parseLexicalJSON(root));
        await updateText(data.id, editorContentRef.current);
    }



    return (
        <div>
            <nav className="relative mx-10">
                <h1 className="text-3xl p-4 text-center w-full">
                    {data.name}
                </h1>
                <div className="absolute top-0 right-0 h-full items-center flex">
                    <button
                        onClick={saveAction}
                        className=" px-2 py-1 bg-white rounded-md"
                    >Save</button>
                </div>
            </nav>
            {/* {JSON.stringify(data)} */}
            {/* {JSON.stringify(project)} */}
            <Editor
                initialContent={initialContent}
                onChange={(value) => {
                    setEditorContent(value);
                }}
            />
        </div>
    )
}