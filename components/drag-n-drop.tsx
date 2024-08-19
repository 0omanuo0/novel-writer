"use client";

import { useEffect, useState } from 'react';
import { DndContext, closestCenter, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Item {
    id: string;
    content: React.ReactNode;
    otherContent: React.ReactNode;
}

function SortableItem({ id, children, otherContent, handleComponent }: { id: string; children: React.ReactNode; otherContent: React.ReactNode, handleComponent?: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id, strategy: verticalListSortingStrategy });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        display: 'flex',
        width: "100%",       
        
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center space-x-2">
            <div className="handle">{handleComponent}</div>
            <div className="content w-full flex justify-between items-center">
                {children}
                {otherContent}
            </div>
        </div>
    );
    
};

export default function DnDList({ initialItems, onChange, className, handleComponent }: { initialItems: Item[]; onChange?: (items: Item[]) => void, className?: string, handleComponent?: React.ReactNode }) {
    const [items, setItems] = useState(initialItems);
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    useEffect(() => {
        onChange && onChange(items);
    }, [items]);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <div className={"list-container w-full" + className}>
                    {items.map((item) => (
                        <SortableItem key={item.id} id={item.id} otherContent={item.otherContent} handleComponent={handleComponent}>
                            {item.content}
                        </SortableItem>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};
