"use client";

import { useState } from "react";



export default function ToggleSwitch({ checked, onChange, className }: { checked: boolean, onChange?: (checked: boolean) => void, className?: string }) {
    const [isChecked, setIsChecked] = useState(checked);

    const handleClick = () => {
        setIsChecked(!isChecked);
        if (onChange)
            onChange(!isChecked);
    }

    return (
        <label className={"switch " + className}>
            <input type="checkbox" checked={isChecked} onChange={handleClick} />
            <span className="slider round"></span>
        </label>
    )
}