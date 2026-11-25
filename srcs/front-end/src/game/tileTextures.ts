const files = import.meta.glob('../assets/tiles/*.png', {
    eager: true,
    query: '?url',
    import: 'default',
}) as Record<string, string>;

// La clé est le nom du fichier sans ".png" (ex: "G_top_left")
export const tileTextures: Record<string, string> = {};

for (const [path, url] of Object.entries(files))
{
    const name = path.split('/').pop()!.replace('.png', '');
    tileTextures[name] = url;
}