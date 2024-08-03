"use server";

import { createOpenAI, openai } from '@ai-sdk/openai';
import { generateText } from 'ai';


if(!process.env.GROQ_API_KEY) {
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
        GIVEN THE TEXT, GENERATE A JSON WITH THE MOST IMPORTANT INFORMATION SUCH AS:
        - The main idea of the text
        - If is a story, the characters and the relations between them, the most important concepts of the location, the main events, things like the technology or the magic of the world, etc.
        - If is a scientific text, the main concepts, the most important formulas, etc.
        - If is a news article, the main events, the people involved, the location, etc.
        
        STRUCTURE OF THE JSON:
        {
            "text_structure": [
                {
                    "title": "The title of the text it could be the name of the book, the article, a chapter, a character, any type of concept relevant to the text", 
                    "description": "A brief description of the text",
                    "keywords": ["keyword1", "keyword2", "keyword3"],
                    "content": [
                        "A small resume of the text",
                        "Data about the character, the location, the event, etc.",
                    ],
                    "children": [
                        ...
                        ]
                }
            ]
        }
        ${data}
        `,
    });

    return text;

}