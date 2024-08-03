


export interface Project {
    id: string;
    name: string;
    description: string;
    creation_date: string;
    last_updated_date: string;
    content: string;
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