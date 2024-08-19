"use server";

import { createOpenAI, openai } from '@ai-sdk/openai';
import { generateText } from 'ai';


if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not defined');
}



const groq = createOpenAI({
    apiKey: process.env.GROQ_API_KEY as string,
    baseURL: 'https://api.groq.com/openai/v1',
});



export async function getAnswer(data: string) {

    const { text } = await generateText({
        model: groq('llama3-groq-70b-8192-tool-use-preview'),
        prompt: `
Objective: Generate a JSON structure that captures the essential details of a novel, including the main idea, characters, their personalities, relationships, significant events, locations, and any relevant concepts such as technology or magic systems.

Instructions:

    Identify the main idea of the novel.
    Extract relevant information including:
        Characters: Each character should have a dedicated section under a specific "characters" node, detailing their description, personality, relationships, and any significant actions or roles they play in the story.
        Locations: Important places within the novel.
        Events: Key events that drive the plot.
        Concepts: Any relevant world-building elements like technology, magic, or political systems.

JSON Structure:

    title: The title of the novel, which could be the name of the book or a significant concept within it.
    description: A brief description of the novel summarizing its primary focus or theme.
    keywords: A list of keywords capturing the essence of the novel.
    content: A detailed breakdown of the novel, including summaries of the plot, descriptions of locations, events, and relevant concepts.
    characters: A specific section dedicated to characters, each represented as a separate node under this section.
        name: The name of the character.
        description: A physical and role-based description of the character within the story.
        personality: A detailed description of the character's personality traits.
        relationships: Describes the relationships this character has with others, including allies, enemies, and love interests.
    children: Use this section for further breakdowns of subplots, specific events, or related concepts within the novel.

{
    "text_structure": [
        {
            "title": "Title of the Novel",
            "description": "Brief description of the novel's main idea or focus.",
            "keywords": ["keyword1", "keyword2", "keyword3"],
            "content": [
                "Summary of the novel's plot.",
                "Details about locations, events, or world-building concepts."
            ],
            "characters": [
                {
                    "name": "Character Name",
                    "description": "Physical and role-based description of the character.",
                    "personality": "Description of the character's personality traits.",
                    "relationships": [
                        "Relationship with Character A",
                        "Relationship with Character B"
                    ]
                },
                {
                    "name": "Another Character Name",
                    "description": "Physical and role-based description of the character.",
                    "personality": "Description of the character's personality traits.",
                    "relationships": [
                        "Relationship with Character C",
                        "Relationship with Character D"
                    ]
                }
            ],
            "children": [
                {
                    "title": "Subplot or Significant Event Title",
                    "description": "Description of this subplot or event.",
                    "keywords": ["subkeyword1", "subkeyword2"],
                    "content": [
                        "Summary and detailed information about this subplot or event."
                    ],
                    "children": [
                        // Further nested structure if necessary
                    ]
                }
            ]
        }
    ]
}

This prompt is tailored for novels, ensuring that characters are given a detailed and structured representation within the JSON, including their descriptions, personalities, and relationships. This format allows for a comprehensive analysis and breakdown of the novel's key elements.
        ${data}
        `,
    });

    return text;

}