import React, { useEffect, useState } from 'react';


export default function PositionSelector() {
    const [position, setPosition] = useState(0);
    const [dragging, setDragging] = useState(false);
    const pxToMm = 880;

    useEffect(() => {
        // get the position from the local storage
        const storedPosition = localStorage.getItem('position');
        if (storedPosition) {
            setPosition(parseFloat(storedPosition));
            const editorParagraphs = document.querySelectorAll('.editor-paragraph');
            editorParagraphs.forEach((el: any) => {
                el.style.textIndent = `${parseFloat(storedPosition)}px`;
            });
        }
    }, []);

    const handleDrag = (event: any) => {
        if (!dragging) return;
        const ruler = event.target.closest(".ruler");
        const rulerRect = ruler.getBoundingClientRect();
        const newPosition = event.clientX - rulerRect.left;

        if (newPosition >= 0 && newPosition <= rulerRect.width) {
            setPosition(newPosition);
            // get the style ".editor-paragraph" and set the indent to the position
            const editorParagraphs = document.querySelectorAll('.editor-paragraph');
            editorParagraphs.forEach((el: any) => {
                el.style.textIndent = `${newPosition}px`;
            });
        }
    };

    return (
        <div className="ruler-container">
            <div className="ruler" onMouseMove={handleDrag} onMouseDown={() => setDragging(true)} onMouseUp={() => {
                setDragging(false)
                // store the position in the local storage
                localStorage.setItem('position', position.toString());
            }}>
                <div className="indicator" style={{ left: `${position}px` }}></div>
                <div className="ticks">
                    {[...Array(100)].map((_, i) => (
                        <div key={i} className="tick">
                            {(i * pxToMm / 100) % 10 === 0 && <span className="label">{i * pxToMm / 100}</span>}
                        </div>
                    ))}
                </div>
            </div>
            {/* <div className="position-display">Position: {position.toFixed(2)} mm</div> */}
        </div>
    );
}