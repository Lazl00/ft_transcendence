import type { GameMap } from './ColorGrid';

const SOLID = ['W', 'R', 'G'];

// Hors de la map = solide, pour que les bords ne soient pas vus comme "ouverts".
function solidAt(map: GameMap, r: number, c: number): boolean
{
    if (r < 0 || r >= map.length || c < 0 || c >= map[0].length)
    {
        return true;
    }
    return SOLID.includes(map[r][c]);
}

// Attention : la ligne 0 de la matrice est le BAS du niveau, donc "au-dessus" = r + 1.
export function getVariant(map: GameMap, r: number, c: number): string
{
    const up = solidAt(map, r + 1, c);
    const down = solidAt(map, r - 1, c);
    const left = solidAt(map, r, c - 1);
    const right = solidAt(map, r, c + 1);

    // Aucun voisin
    if (!up && !down && !left && !right) return 'alone';

    // Un seul voisin : bout de pilier ou de poutre
    if (!up && !left && !right && down) return 'pillar_top';
    if (up && !down && !left && !right) return 'pillar_bottom';
    if (!up && !down && !left && right) return 'beam_left';
    if (!up && !down && left && !right) return 'beam_right';

    // Deux voisins opposés : bande fine
    if (!up && !down && left && right) return 'horizontal';
    if (up && down && !left && !right) return 'vertical';

    // Deux voisins en angle : coin extérieur
    if (!up && !left && down && right) return 'top_left';
    if (!up && !right && down && left) return 'top_right';
    if (!down && !left && up && right) return 'bottom_left';
    if (!down && !right && up && left) return 'bottom_right';

    // Trois voisins : un seul côté ouvert
    if (!up) return 'top';
    if (!down) return 'bottom';
    if (!left) return 'left';
    if (!right) return 'right';

    // Entouré des 4 côtés : on regarde les diagonales (coin intérieur)
    if (!solidAt(map, r + 1, c - 1)) return 'inner_top_left';
    if (!solidAt(map, r + 1, c + 1)) return 'inner_top_right';
    if (!solidAt(map, r - 1, c - 1)) return 'inner_bottom_left';
    if (!solidAt(map, r - 1, c + 1)) return 'inner_bottom_right';

    return 'center';
}

// Donne la première texture qui existe : G_top_left -> G_center -> G
export function pickTexture(
    exists: (key: string) => boolean,
    type: string,
    variant: string
): string | undefined
{
    return [`${type}_${variant}`, `${type}_center`, type].find(exists);
}