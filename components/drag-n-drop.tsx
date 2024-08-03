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

function SortableItem({ id, children, otherContent }: { id: string; children: React.ReactNode; otherContent: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id, strategy: verticalListSortingStrategy });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        display: 'flex',
        width: "100%",
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div className="handle cursor-grab active:cursor-grabbing select-none pl-1 pr-2">::</div>
            <div className="content w-full justify-between flex">{children} {otherContent}</div>

        </div>
    );
};

export default function DnDList({ initialItems, onChange }: { initialItems: Item[]; onChange?: (items: Item[]) => void }) {
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
                <div className="list-container w-full">
                    {items.map((item) => (
                        <SortableItem key={item.id} id={item.id} otherContent={item.otherContent}>
                            {item.content}
                        </SortableItem>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};
