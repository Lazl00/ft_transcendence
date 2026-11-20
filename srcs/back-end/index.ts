import Fastify, { FastifyInstance } from "fastify";
import fastifyPostgres from "@fastify/postgres";

// Initiate a Fastify instance
const app: FastifyInstance = Fastify({
    logger: true,
});

// The string used to connect to our PostgreSQL database
const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@database:5432/${process.env.DB_NAME}`;

// Register the module
app.register(fastifyPostgres, {
    connectionString: connectionString,
});

// Shared schema for routes with a player :id in the URL
// Rejects non-integer ids and ids outside the Postgres INT range with a 400
const idParams = {
    params: {
        type: 'object',
        properties:
            { id: { type: 'integer', minimum: 1, maximum: 2147483647 } },
        required: ['id'],
        additionalProperties: false,
    },
};

// Shared schema for player
const createPlayerSchema = {
    body: {
        type: 'object',
        properties: {
            username: {type: 'string', minLength: 1, maxLength: 32}},
        required: ['username'],
        additionalProperties: false,
    }
};

// Get all players profiles
app.get('/api/players', async (req, reply) => {
    const { rows } = await app.pg.query(
        'SELECT p.id, p.username, p.level, p.xp, p.money, p.avatar_path FROM players p');
    return (rows);
});

// POST new player
app.post<{ Body: { username: string } }>(
'/api/players', { schema: createPlayerSchema }, async (req, reply) => {
    try {
        const { rows } = await app.pg.query(
            `INSERT INTO players (username) VALUES ($1)
             RETURNING id, username, level, xp, money, avatar_path`,
            [req.body.username]
        );
        return reply.code(201).send(rows[0]);
    } catch (err: any) {
        if (err.code === '23505')
            return reply.code(409).send({ error: 'Username already taken' });
        throw err;
    }
});

// Get single player profile
app.get<{ Params: { id: number } }>('/api/players/:id', { schema: idParams }, async (req, reply) => {
    const { rows } = await app.pg.query(
        'SELECT id, username, level, xp, money, avatar_path FROM players WHERE id = $1',
        [req.params.id]
    );
    if (rows.length === 0) {
        return (reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Player not found' }));
    }
    return (rows[0]);
});

// Get all items from the shop
app.get('/api/shop', async (req, reply) => {
    const { rows } = await app.pg.query('SELECT * FROM shop_items');
    return (rows);
});

// Get user items/inventory
app.get<{ Params: { id: number } }>('/api/players/:id/inventory', { schema: idParams }, async (req, reply) => {

    const player = await app.pg.query('SELECT 1 FROM players WHERE id = $1', [req.params.id]);
    if (player.rows.length === 0) {
        return (reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Player not found' }));
    }

    const { rows } = await app.pg.query(
        `SELECT si.id, si.name, si.type, si.price, si.asset_path, pi.acquired_at FROM players_items pi
        JOIN shop_items si ON si.id = pi.item_id WHERE pi.player_id = $1
        ORDER BY pi.acquired_at DESC`,
        [req.params.id]
    );

    return (rows);
});

// Get user friendlist (Friends, invite sent, invite received)
app.get<{ Params: { id: number } }>('/api/players/:id/friends', { schema: idParams }, async (req, reply) => {

    const player = await app.pg.query('SELECT 1 FROM players WHERE id = $1', [req.params.id]);
    if (player.rows.length === 0) {
        return (reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Player not found' }));
    }

    const { rows } = await app.pg.query(
        `SELECT p.id, p.username, p.level, p.avatar_path, f.invite_status, (f.player1 = $1) AS sent_by_me FROM friendlist f
         JOIN players p ON p.id = CASE WHEN f.player1 = $1 THEN f.player2 ELSE f.player1 END
         WHERE (f.player1 = $1 OR f.player2 = $1)`,
        [req.params.id]
    );

    return (rows);
});

// Get all the achievements
app.get('/api/achievements', async (req, reply) => {
    const { rows } = await app.pg.query('SELECT * FROM achievements');
    return (rows);
});

// Get player unlocked achievements
app.get<{ Params: { id: number } }>('/api/players/:id/achievements', { schema: idParams }, async (req, reply) => {

    const player = await app.pg.query('SELECT 1 FROM players WHERE id = $1', [req.params.id]);
    if (player.rows.length === 0) {
        return (reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Player not found' }));
    }

    const { rows } = await app.pg.query(
        `SELECT a.id, a.name, a.unlock_condition, pa.acquired_at FROM players_achievements pa
         JOIN achievements a ON a.id = pa.achievement_id WHERE pa.player_id = $1
         ORDER BY pa.acquired_at DESC`,
        [req.params.id]
    );

    return (rows);
});

// Get all the matches played
app.get('/api/matches', async (req, reply) => {
    const { rows } = await app.pg.query('SELECT * FROM match_history');
    return (rows);
});

// Get player history matches
// A player with no matches gets 200 with [] (not an error)
app.get<{ Params: { id: number } }>('/api/players/:id/matches', { schema: idParams }, async (req, reply) => {

    const player = await app.pg.query('SELECT 1 FROM players WHERE id = $1', [req.params.id]);
    if (player.rows.length === 0) {
        return (reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Player not found' }));
    }

    const { rows } = await app.pg.query(
        `SELECT match_id, is_winner, gamemode, status, started_at, finished_at FROM player_history
         JOIN match_history ON id = match_id WHERE player_id = $1
         ORDER BY finished_at DESC`,
        [req.params.id]
    );

    return (rows);
});


// Start the server once all routes are declared
const start = async () => {
    try {
        // 0.0.0.0 = listen on all interfaces, required to be reachable from outside the container
        await app.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
