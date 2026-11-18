import Fastify, { FastifyInstance } from "fastify";
import fastifyPostgres from "@fastify/postgres";

// Initiate a Fastify instance
const app: FastifyInstance = Fastify({
    logger: true,
});

// The string used to connect to our PostgreSQL database
// "database" is the service name in docker-compose.yml (containers reach each other by service name)
const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@database:5432/${process.env.DB_NAME}`;

// Register the module
app.register(fastifyPostgres, {
    connectionString: connectionString,
});

// Get all players profiles
app.get('/api/get/players', async (req, reply) => {
    const { rows } = await app.pg.query('SELECT * FROM players');
    return rows;
});

// Get all items from the shop
app.get('/api/get/shop', async (req, reply) => {
    const { rows } = await app.pg.query('SELECT * FROM shop_items');
    return rows;
});

// Get user friendlist (Friends, invite sent, invite received)
app.get<{ Params: { id: number } }>('/api/get/players/:id/friends', {
    schema: {
        params: {
            type: 'object',
            properties:
                { id: { type: 'integer', minimum: 1, maximum: 2147483647} },
            required: ['id'],
            additionalProperties: false,
        },
    },
}, async (req, reply) => {

    const player = await app.pg.query('SELECT 1 FROM players WHERE id = $1', [req.params.id]);
    if (player.rows.length === 0){
        return reply.code(404).send({ error: 'Player not found' });
    }

    const { rows } = await app.pg.query(
        `SELECT p.id, p.username, p.level, p.avatar_path, f.invite_status, (f.player1 = $1) AS sent_by_me FROM friendlist f
         JOIN players p ON p.id = CASE WHEN f.player1 = $1 THEN f.player2 ELSE f.player1 END
         WHERE (f.player1 = $1 OR f.player2 = $1)`,
        [req.params.id]
    );

    return rows;
});

// Get all the achievements
app.get('/api/get/achievements', async (req, reply) => {
    const { rows } = await app.pg.query('SELECT * FROM achievements');
    return rows;
});

// Get player unlocked achievements
app.get<{ Params: { id: string } }>('/api/get/players/:id/achievements', async (req, reply) => {
    const { rows } = await app.pg.query(
        `SELECT a.id, a.name, a.unlock_condition, pa.acquired_at FROM players_achievements pa
         JOIN achievements a ON a.id = pa.achievement_id WHERE pa.player_id = $1
         ORDER BY pa.acquired_at DESC`,
        [req.params.id]
    );
    return rows;
});

// Get all the matches played
app.get('/api/get/match_history', async (req, reply) => {
    const { rows } = await app.pg.query('SELECT * FROM match_history');
    return rows;
});

// Get player history matches
app.get<{ Params: { id: string } }>('/api/get/players/:id/matches', async (req, reply) => {
    const { rows } = await app.pg.query(
        `SELECT match_id, is_winner, gamemode, status, started_at, finished_at FROM player_history
         JOIN match_history ON id = match_id WHERE player_id = $1
         ORDER BY finished_at DESC`,
        [req.params.id]
    );
    return rows;
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
