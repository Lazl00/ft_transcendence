import { useState } from 'react';
import './ColorGrid.css';

function randomColor() {
    return `hsl(${Math.floor(Math.random() * 360)}, 80%, 55%)`;
}

function ColorGrid() {
    // La fonction passée à useState n'est exécutée qu'une fois :
    // les couleurs ne changent pas à chaque re-render
    const [colors] = useState(() =>
        Array.from({ length: 25 }, randomColor)
    );

    return (
        <div className="color-grid">
            {colors.map((color, index) => (
                <div
                    key={index}
                    className="color-cell"
                    style={{ backgroundColor: color }}
                />
            ))}
        </div>
    );
}

export default ColorGrid;