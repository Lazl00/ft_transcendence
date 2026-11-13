import './ColorGrid.css';
import { map_gen } from "./map_gen/map_gen.js";

// Defining the types for the tile codes and the game map
export type TileCode = 'W' | 'E' | 'G' | 'P' | 'S' | 'F';
export type GameMap = TileCode[][];


export const placeholderMap: GameMap = map_gen();
// Placeholder map for testing purposes
// export const placeholderMap: GameMap = [
//     ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
//     ['W', 'W', 'E', 'E', 'W', 'E', 'E', 'E', 'W', 'E', 'E', 'E', 'E', 'W', 'E', 'E', 'W', 'E', 'E', 'W'],
//     ['W', 'E', 'E', 'E', 'W', 'G', 'E', 'W', 'W', 'E', 'G', 'E', 'E', 'W', 'W', 'E', 'W', 'E', 'E', 'W'],
//     ['W', 'E', 'E', 'E', 'W', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'W', 'E', 'E', 'E', 'E', 'W'],
//     ['W', 'E', 'E', 'W', 'W', 'W', 'E', 'E', 'E', 'E', 'E', 'E', 'G', 'E', 'E', 'E', 'E', 'E', 'E', 'W'],
//     ['W', 'E', 'E', 'E', 'W', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'F', 'W'],
//     ['W', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'P', 'G', 'G', 'E', 'E', 'E', 'E', 'P', 'G', 'E', 'G', 'W'],
//     ['W', 'E', 'E', 'E', 'E', 'E', 'G', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'P', 'P', 'E', 'E', 'E', 'W'],
//     ['W', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'W', 'E', 'E', 'E', 'G', 'E', 'W'],
//     ['W', 'E', 'G', 'G', 'E', 'E', 'P', 'P', 'E', 'E', 'G', 'E', 'W', 'W', 'E', 'E', 'G', 'E', 'E', 'W'],
//     ['W', 'S', 'E', 'E', 'P', 'E', 'E', 'E', 'E', 'P', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'W'],
//     ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W']
// ];

// Mapping tile codes to their corresponding colors
const tileColors: Record<TileCode, string> = {
    W: '#705740',
    E: '#929394',
    G: '#272626',
    P: '#f05454',
    S: '#4e4ec8',
    F: '#17d05b',
};

// The ColorGrid component renders a grid of colored cells based on the provided game map.
function ColorGrid({ map }: { map: GameMap }) {
    // Calculate the number of columns in the grid based on the first row of the map
    const columnCount = map[0]?.length ?? 0;

    return (
        // The grid container with dynamic column count and responsive width
        <div
            className="color-grid"
            style={{
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                width: `min(100%, 75vw, 133.33vh)`,
            }}
        >
            {/* Mapping over the game map to create individual colored cells for each tile */}
            {[...map].reverse().map((row, rowIndex) => row.map((tile, columnIndex) => (
                <div
                    key={`${rowIndex}-${columnIndex}`}
                    className="color-cell"
                    style={{ backgroundColor: tileColors[tile] }}
                />
            )))}
        </div>
    );
}

export default ColorGrid;
