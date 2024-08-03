




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



export default function Editor({initialContent, onChange}: {initialContent: string, onChange?: (value: any) => void }) {
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

    

    return (
        <LexicalComposer initialConfig={editorConfig}>
            <div className="editor-container">
                <ToolbarPlugin />
                <div className="editor-inner">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                className="editor-input"
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
                        onChange={(value) => onChange && onChange(value.toJSON())} 
                    />
                </div>
            </div>
        </LexicalComposer>
    );
}