"use client";
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

import ExampleTheme from '@/app/ExampleTheme';
import ToolbarPlugin from '@/app/plugins/ToolbarPlugin';
import TreeViewPlugin from '@/app/plugins/TreeViewPlugin';
import "@/app/editor.css"

import { updateDescription, updateText } from "@/lib/actions";
import { useEffect, useRef, useState } from "react";
import { unstable_noStore as noStore } from 'next/cache';
import { parse } from "path";
import { getAnswer } from "@/lib/ai_helper";
import PositionSelector from "@/components/Ruler";
import { Description } from '@/lib/types';
import ToggleSwitch from './toggleSwitch';

function parseLexicalJSON(node?: any) {
    let result = '';
    if (node === undefined) return '';

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

function SaveButton({ onClick, children, className }: { onClick: () => void; children?: any, className?: string }) {
    return (
        <button
            onClick={onClick}
            className={"px-2 py-2 bg-white rounded-md" + (className ? ' ' + className : '')}
        >{children ? children : 'Save'}</button>
    )
}


export default function EditorComponent({ data, initialContent, Title }: { data: any, initialContent: string, Title?: string }) {
    const [editorContent, setEditorContent] = useState(JSON.parse(initialContent));
    const [autoSave, setAutoSave] = useState(false);
    const editorContentRef = useRef(JSON.parse(initialContent));

    const placeholder = 'Enter some rich text...';

    const editorConfig = {
        namespace: 'React.js Demo',
        nodes: [],
        onError(error: Error) {
            throw error;
        },
        theme: ExampleTheme,
        editorState: initialContent, // Set the initial editor state here
    };

    // when page is loaded scroll to the top
    useEffect(() => {
        // wait 1s before scrolling to top
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 1000);
    }, []);

    useEffect(() => {
        console.log(editorContent);
        editorContentRef.current = editorContent;
    }, [editorContent]);

    // loop to save the content every 5 seconds
    useEffect(() => {
        if (autoSave) {
            const interval = setInterval(() => {
                saveAction();
            }, 20000);

            return () => clearInterval(interval);
        }
        return;
    }, []);


    const saveAction = async () => {
        // const root = editorContentRef.current.root;
        const parsed = parseLexicalJSON(editorContentRef.current.root);
        let description: Description | undefined;
        getAnswer(parsed).then((res) => {
            const parsed = JSON.parse(res);
            description = parsed;
        });
        // // console.log(JSON.stringify(root))
        // console.log(root);
        // console.log(parsed)
        await updateText(data.id, editorContentRef.current);
        await updateDescription(data.id, description ? description : { text_structure: [] });
    }

    // detect when scrolled to top
    const [scrolledToTop, setScrolledToTop] = useState(true);
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY === 0) {
                setScrolledToTop(true);
            }
            else {
                setScrolledToTop(false);
            }
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);


    return (
        <div id="editor-container" className='relative '>
            <LexicalComposer initialConfig={editorConfig}>
                <div className="editor-container">
                    <div
                        className={ !scrolledToTop ? 'fixed top-0 right-5 z-[5] w-3/4 px-4 py-4 h-10' : "hidden"}
                        style={
                            !scrolledToTop ? {
                                backdropFilter: 'blur(10px)',
                                mask: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 70%)'
                            } : {}
                        }></div>
                    <div
                        className={
                            "transition-all duration-300 ease-in-out space-y-1 "
                            + (
                                !scrolledToTop ?
                                    'fixed top-0 right-5 z-10 w-3/4 px-4 py-4 '
                                    : 'px-0 py-0 w-auto'
                            )
                        }
                        style={!scrolledToTop ? {
                            maxWidth: 'calc(100% - 2rem)'

                        } : {}}
                    >
                        <div className={!scrolledToTop ? 'rounded-lg bg-white shadow-lg shadow-[#bbbbbb] overflow-hidden' : ''}>
                            <PositionSelector />
                        </div>
                        <div className={!scrolledToTop ? 'rounded-lg bg-white shadow-lg p-1' : ''}>
                            <ToolbarPlugin
                                className=""
                                Title={Title}
                                ActionButtons={
                                    <>
                                        <SaveButton onClick={saveAction} className="hover:bg-[#eee]" />
                                        <ToggleSwitch checked={false} onChange={(e)=>setAutoSave(e)} className='mx-2 mt-[2px]' />
                                    </>
                                }
                            />
                        </div>

                    </div>
                    <div className="editor-inner">
                        <RichTextPlugin
                            contentEditable={
                                <ContentEditable
                                    className="editor-input px-10"
                                    aria-placeholder={placeholder}
                                />
                            }
                            placeholder={
                                <div className="editor-placeholder">{placeholder}</div>
                            }
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <HistoryPlugin />
                        <AutoFocusPlugin />
                        {/* <TreeViewPlugin /> */}
                        <OnChangePlugin
                            onChange={(value) => {
                                const root = value.toJSON();
                                setEditorContent(root);
                            }}
                        />
                    </div>
                </div>
            </LexicalComposer >
        </div >
    )
}