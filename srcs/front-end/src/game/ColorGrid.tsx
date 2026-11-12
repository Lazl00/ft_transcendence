import './ColorGrid.css';

export type TileCode = 'W' | 'E' | 'G' | 'P' | 'S' | 'F';
export type GameMap = TileCode[][];

export const placeholderMap: GameMap = [
    ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
    ['W', 'W', 'E', 'E', 'W', 'E', 'E', 'E', 'W', 'E', 'E', 'E', 'E', 'W', 'E', 'E', 'W', 'E', 'E', 'W'],
    ['W', 'E', 'E', 'E', 'W', 'G', 'E', 'W', 'W', 'E', 'G', 'E', 'E', 'W', 'W', 'E', 'W', 'E', 'E', 'W'],
    ['W', 'E', 'E', 'E', 'W', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'W', 'E', 'E', 'E', 'E', 'W'],
    ['W', 'E', 'E', 'W', 'W', 'W', 'E', 'E', 'E', 'E', 'E', 'E', 'G', 'E', 'E', 'E', 'E', 'E', 'E', 'W'],
    ['W', 'E', 'E', 'E', 'W', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'F', 'W'],
    ['W', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'P', 'G', 'G', 'E', 'E', 'E', 'E', 'P', 'G', 'E', 'G', 'W'],
    ['W', 'E', 'E', 'E', 'E', 'E', 'G', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'P', 'P', 'E', 'E', 'E', 'W'],
    ['W', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'W', 'E', 'E', 'E', 'G', 'E', 'W'],
    ['W', 'E', 'G', 'G', 'E', 'E', 'P', 'P', 'E', 'E', 'G', 'E', 'W', 'W', 'E', 'E', 'G', 'E', 'E', 'W'],
    ['W', 'S', 'E', 'E', 'P', 'E', 'E', 'E', 'E', 'P', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'W'],
    ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W']
];

const tileColors: Record<TileCode, string> = {
    W: '#705740',
    E: '#929394',
    G: '#272626',
    P: '#f05454',
    S: '#4e4ec8',
    F: '#17d05b',
};

function ColorGrid({ map }: { map: GameMap }) {
    const columnCount = map[0]?.length ?? 0;
    return (
        <div
            className="color-grid"
            style={{
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                width: `min(100%, 75vw, 133.33vh)`,
            }}
        >
            {map.map((row, rowIndex) => row.map((tile, columnIndex) => (
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