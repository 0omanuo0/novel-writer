


export interface Project {
    id: string;
    name: string;
    description: string;
    creation_date: string;
    last_updated_date: string;
    content: string|Content[];
}

export interface Content{
    id: string;
    title: string;
}

export interface TextContent {
    id: string;
    name: string;
    project_id: string;
    type: string;
    content: string;
}


interface Character {
    name: string;
    description: string;
    personality: string;
    relationships: string[];
}

interface TextNode {
    title: string;
    description: string;
    keywords: string[];
    content: string[];
    characters?: Character[];
    children?: TextNode[];
}

export interface Description {
    text_structure: TextNode[];
}