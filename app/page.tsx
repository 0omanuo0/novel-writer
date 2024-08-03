"use client";

import { useEffect, useState } from 'react';
// className="w-full p-4 text-xl resize-none text-black rounded-xl min-h-[500px]"


function wrapLine(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(/[\s]/);
    let line = '';
    let lines = [];
    let yf = y;
    let xf = x;

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            context.fillText(line, x, yf);
            line = words[n] + ' ';
            yf += lineHeight;
        } else {
            line = testLine;
        }
        xf = x + testWidth;
    }
    lines.push(line); // Agrega la última línea
    context.fillText(line, x, yf);
    const maxLineWidth = context.measureText(line).width;
    return { xl: x + maxLineWidth, yl: yf, lines: lines };
}

function wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const linesSplitted = text.split(/[\n]/);
    let lines: string[] = [];
    let yf = y;
    let xf = 0;

    for (let i = 0; i < linesSplitted.length; i++) {
        const line = linesSplitted[i];
        const yi = i === 0 ? yf : yf + lineHeight;
        const { xl, yl, lines: linesWrapped } = wrapLine(context, line, x, yi, maxWidth, lineHeight);
        lines.push(...linesWrapped);
        yf = yl;
        xf = xl;
    }

    return { x: xf, y: yf, listLines: lines };
}

export default function Home() {
    const [textStyle, setTextStyle] = useState({fontFamily: 'Arial', fontSize: 16, color: 'black'});
    const [text, setText] = useState("");
    const [cursor, setCursor] = useState(0);
    const [focused, setFocused] = useState(false);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const editorWidth = 800;
    const pxSVG = 20;
    const pySVG = 30;

    useEffect(() => {

        // calculate the coordinates of the cursor line in the text font and size
        // 1. fill the canvas with the text with every block its own style until the cursor
        let canvas = document.getElementById('canvas');
        if (!canvas) return;
        if(!(canvas instanceof HTMLCanvasElement)) return;
        let context = canvas.getContext('2d');
        if (!context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = `${textStyle.fontSize}px ${textStyle.fontFamily}`;
        const substring = text.slice(0, cursor);
        const {x, y} = wrapText(context, substring, 0, 0, editorWidth, textStyle.fontSize);

        // set scroll position to the cursor position witn scrollbehaviour smooth
        document.body.style.scrollBehavior = 'smooth';
        window.scrollTo(0, y - 100);

        setCursorPosition({ x: x, y: y });

    }, [cursor]);

    return (
        <main
            className='flex flex-col items-center justify-center w-full flex-1 px-20 py-10 text-center min-h-screen'
        >
            <canvas id="canvas" style={{display: 'none'}}></canvas>
            <nav>

            </nav>
            <svg
                onFocus={
                    () => {
                        setFocused(true);
                    }
                }
                className='p-4 text-xl resize-none text-black bg-white'
                tabIndex={0} id="myTextEditor"
                width={editorWidth} height={1200}
                // console log selected text
                onSelect={(e) => {
                    const selection = window.getSelection();
                    console.log(selection);
                }}

                onKeyDown={
                    (e) => {
                        e.preventDefault();
                        if (e.key.length === 1) {
                            setText(text.slice(0, cursor) + e.key + text.slice(cursor));
                            setCursor(cursor + 1);
                        } else if (e.key === 'Backspace') {
                            setText(text.slice(0, cursor - 1) + text.slice(cursor));
                            setCursor(cursor - 1);
                        } else if (e.key === 'Enter') {
                            setText(text.slice(0, cursor) + '\n' + text.slice(cursor));
                            setCursor(cursor + 1);
                        }
                        else if (e.key === 'Delete') {
                            setText(text.slice(0, cursor) + text.slice(cursor + 1));
                        }
                        else if (e.key === 'ArrowLeft') {
                            setCursor(cursor !== 0 ? cursor - 1 : 0);
                        }
                        else if (e.key === 'ArrowRight') {
                            setCursor(cursor !== text.length ? cursor + 1 : text.length);
                        }
                        console.log(text);
                    }
                }
            >
                {
                    // set the cursor as a vertical line in the position of the cursor ( NEEDS TO CALCULATE WITH LINES)
                    focused === true ? <line
                        x1={cursorPosition.x + pxSVG -3 } y1={cursorPosition.y + pySVG + 5}
                        x2={cursorPosition.x + pxSVG -3 } y2={cursorPosition.y + pySVG - 20}
                        stroke="black"
                        strokeWidth="2"
                        className='animate-cursor'
                    /> : null 
                }
                {
                    text.split('\n').map((line, index) => {
                        return (
                            <text
                                x={pxSVG} y={index * textStyle.fontSize + pySVG}
                                key={index}
                                // textfont and size
                                fontFamily={textStyle.fontFamily}
                                fontSize={textStyle.fontSize}
                                fill={textStyle.color}
                            >
                                {line}
                            </text>
                        );
                    })
                }
            </svg>
            {/* <p id="textOutput" className='text-white'>
                {text}
            </p> */}

        </main>
    );
};
