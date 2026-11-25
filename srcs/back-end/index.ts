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
const playerParamsSchema = {
    params: {
        type: 'object',
        properties:
            { id: { type: 'integer', minimum: 1, maximum: 2147483647 } },
        required: ['id'],
        additionalProperties: false,
    },
};

// Shared schema for player creation
const createPlayerSchema = {
    body: {
        type: 'object',
        properties: {
            username: {type: 'string', minLength: 1, maxLength: 32}},
        required: ['username'],
        additionalProperties: false,
    }
};

// Schema for achievements creation
const createAchievementsSchema = {
    body: {
        type: 'object',
        properties: {
            name: {type: 'string', minLength: 1, maxLength: 64},
            unlock_condition: {type: 'string', minLength: 1, maxLength: 255},
        },
        required: ['name', 'unlock_condition'],
        additionalProperties: false,
    }
};

// Schema for unlocking an achievement for a player
// Player id in the URL, achievement id in the body, both within the Postgres INT range
const unlockPlayerAchievementSchema = {
    params: {
        type: 'object',
        properties: {
            playerID: {type: 'integer', minimum: 1, maximum: 2147483647},
        },
        required: ['playerID'],
        additionalProperties: false,
    },
    body: {
        type: 'object',
        properties: {
            achievementID: {type: 'integer', minimum: 1, maximum: 2147483647},
        },
        required: ['achievementID'],
        additionalProperties: false,
    }
};

// Schema to add a match to history
const addMatchHistorySchema = {
    body: {
        type: 'object',
        properties: {
            gamemode: {type: 'string', enum: ['CLASSIC']},
        },
        required: ['gamemode'],
        additionalProperties: false,
    }
};

// Schema for shop item creation
const createShopItem = {
    body: {
        type: 'object',
        properties: {
            name: {type: 'string', minLength: 1, maxLength: 64},
            type: {type: 'string', enum: ['SKIN', 'ANIMATION', 'EMOTE', 'BANNER']},
            price: {type: 'integer', minimum: 0, maximum: 999999},
            asset_path: {type: 'string', minLength: 1, maxLength: 255},
        },
        required: ['name', 'type', 'price', 'asset_path'],
        additionalProperties: false,
    }
};

// Schema for a player buying a shop item
// Player id in the URL, item id in the body, both within the Postgres INT range
const buyItemSchema = {
    params: {
        type: 'object',
        properties: {
            id: {type: 'integer', minimum: 1, maximum: 2147483647},
        },
        required: ['id'],
        additionalProperties: false,
    },
    body: {
        type: 'object',
        properties: {
            itemID: {type: 'integer', minimum: 1, maximum: 2147483647},
        },
        required: ['itemID'],
        additionalProperties: false,
    }
};

// Schema for match info update
const updateMatchSchema = {
    params: {
        type: 'object',
        properties: {
            id: {type: 'integer', minimum: 1, maximum: 2147483647},
        },
        required: ['id'],
        additionalProperties: false,
    },
    body: {
        type: 'object',
        properties: {
            finished_at: {type: 'string', format: 'date-time'},
            status: {type: 'string', enum: ['FINISHED', 'ABANDONED']},
        },
        required: ['finished_at', 'status'],
        additionalProperties: false,
    }
}

// Schema for recording a completed player's match result
const recordPlayerMatchSchema = {
    params: playerParamsSchema.params,
    body: {
        type: 'object',
        properties: {
            gamemode: {type: 'string', enum: ['CLASSIC']},
            duration_ms: {type: 'integer', minimum: 0, maximum: 2147483647},
            is_winner: {type: 'boolean'},
        },
        required: ['gamemode', 'duration_ms', 'is_winner'],
        additionalProperties: false,
    },
};

// GET all players profiles
app.get('/api/players', async (req, reply) => {
    const { rows } = await app.pg.query(
        'SELECT p.id, p.username, p.level, p.xp, p.money, p.avatar_path FROM players p ORDER BY p.id ASC');
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
            return reply.code(409).send({ statusCode: 409, error: 'Conflict', message: 'Username already taken' });
        throw err;
    }
});

// GET single player profile
app.get<{ Params: { id: number } }>('/api/players/:id', { schema: playerParamsSchema }, async (req, reply) => {
    const { rows } = await app.pg.query(
        'SELECT id, username, level, xp, money, avatar_path FROM players WHERE id = $1',
        [req.params.id]
    );
    if (rows.length === 0) {
        return (reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Player not found' }));
    }
    return (rows[0]);
});

// GET all items from the shop
app.get('/api/shop', async (req, reply) => {
    const { rows } = await app.pg.query('SELECT * FROM shop_items');
    return (rows);
});

// POST add new shop item
app.post<{ Body: { name: string, type: string, price: number, asset_path: string } }>( '/api/shop', { schema: createShopItem }, async (req, reply) => {
    try {
        const { rows } = await app.pg.query(
            `INSERT INTO shop_items (name, type, price, asset_path)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, type, price, asset_path`,
             [req.body.name, req.body.type, req.body.price, req.body.asset_path]
        )
        return reply.code(201).send(rows[0]);
    } catch (err: any) {
        if (err.code === '23505')
            return reply.code(409).send({ statusCode: 409, error: 'Conflict', message: 'Item name already used'});
        throw err;
    }
});

// POST player buy item from shop
app.post<{ Params: { id: number }, Body: { itemID: number } }>(
  '/api/players/:id/inventory', { schema: buyItemSchema }, async (req, reply) => {
    try {
        const item = await app.pg.transact(async (client) => {
            const { rows: [item] } = await client.query(
                'SELECT id, price FROM shop_items WHERE id = $1', [req.body.itemID]);
            if (!item) throw { statusCode: 404, error: '',  message: 'Item not found' };

            const upd = await client.query(
                'UPDATE players SET money = money - $1 WHERE id = $2 RETURNING money',
                [item.price, req.params.id]);
            if (upd.rowCount === 0) throw { statusCode: 404, error: '', message: 'Player not found' };

            await client.query(
                'INSERT INTO players_items (player_id, item_id) VALUES ($1, $2)',
                [req.params.id, item.id]);

            return { ...item, money_left: upd.rows[0].money };
        });
        return reply.code(201).send(item);
    } catch (err: any) {
        if (err.statusCode === 404)
            return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: err.message });
        if (err.code === '23514') // CHECK (money >= 0)
            return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: 'Not enough money' });
        if (err.code === '23505') // PK violation
            return reply.code(409).send({ statusCode: 409, error: 'Conflict', message: 'Item already owned' });
        throw err;
    }
});

// GET user items/inventory
app.get<{ Params: { id: number } }>('/api/players/:id/inventory', { schema: playerParamsSchema }, async (req, reply) => {

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

// GET user friendlist (Friends, invite sent, invite received)
app.get<{ Params: { id: number } }>('/api/players/:id/friends', { schema: playerParamsSchema }, async (req, reply) => {

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

// GET all the achievements
app.get('/api/achievements', async (req, reply) => {
    const { rows } = await app.pg.query('SELECT * FROM achievements');
    return (rows);
});

// POST add new achievements
app.post<{ Body: { name: string, unlock_condition: string } }>( '/api/achievements', { schema: createAchievementsSchema }, async (req, reply) => {
    try {
        const { rows } = await app.pg.query(
            `INSERT INTO achievements (name, unlock_condition)
             VALUES ($1, $2)
             RETURNING id, name, unlock_condition`,
             [req.body.name, req.body.unlock_condition]
        );
        return reply.code(201).send(rows[0]);
    } catch (err: any) {
        if (err.code === '23505')
            return reply.code(409).send({ statusCode: 409, error: 'Conflict', message: 'Achievement name already used'});
        throw err;
    }
}); 

// POST unlock player achievement
app.post<{ Params: { playerID: number }, Body: { achievementID: number } }>('/api/players/:playerID/achievements', { schema: unlockPlayerAchievementSchema }, async (req, reply) => {
    try {
        const { rows } = await app.pg.query(
            'INSERT INTO players_achievements (player_id, achievement_id) VALUES ($1, $2) RETURNING *',
            [req.params.playerID, req.body.achievementID]
        );
        return reply.code(201).send(rows[0]);
    } catch (err: any) {
        if (err.code === '23503') // foreign key violation: the player or achievement doesn't exist
            return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Player or achievement not found' });
        if (err.code === '23505') // unique violation: the player already has this achievement
            return reply.code(409).send({ statusCode: 409, error: 'Conflict', message: 'Achievement already unlocked' });
        throw err;
    }
});

// GET player unlocked achievements
app.get<{ Params: { id: number } }>('/api/players/:id/achievements', { schema: playerParamsSchema }, async (req, reply) => {

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

// GET all the matches played
app.get('/api/matches', async (req, reply) => {
    const { rows } = await app.pg.query('SELECT * FROM match_history');
    return (rows);
});

// GET player history matches
// A player with no matches gets 200 with [] (not an error)
app.get<{ Params: { id: number } }>('/api/players/:id/matches', { schema: playerParamsSchema }, async (req, reply) => {

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

// POST a completed match and its player's result in one transaction
app.post<{
    Params: { id: number },
    Body: { gamemode: 'CLASSIC', duration_ms: number, is_winner: boolean }
}>('/api/players/:id/matches', { schema: recordPlayerMatchSchema }, async (req, reply) => {
    const result = await app.pg.transact(async (client) => {
        const player = await client.query('SELECT id FROM players WHERE id = $1', [req.params.id]);
        if (player.rows.length === 0) return null;

        const { rows: [match] } = await client.query(
            `INSERT INTO match_history (gamemode, status, started_at, finished_at)
             VALUES ($1, 'FINISHED', now() - ($2::double precision * interval '1 millisecond'), now())
             RETURNING id, gamemode, status, started_at, finished_at`,
            [req.body.gamemode, req.body.duration_ms]
        );
        await client.query(
            'INSERT INTO player_history (player_id, match_id, is_winner) VALUES ($1, $2, $3)',
            [req.params.id, match.id, req.body.is_winner]
        );
        await client.query(
            `UPDATE players SET xp = xp + $1, level = level + (xp + $1) / 1000, money = money + $2
             WHERE id = $3`,
            [req.body.is_winner ? 100 : 50, req.body.is_winner ? 250 : 0, req.params.id]
        );

        return {
            match_id: match.id,
            is_winner: req.body.is_winner,
            gamemode: match.gamemode,
            status: match.status,
            started_at: match.started_at,
            finished_at: match.finished_at,
        };
    });

    if (!result) {
        return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Player not found' });
    }
    return reply.code(201).send(result);
});

// POST add new match to history
app.post<{ Body: { gamemode: string } }>( '/api/match_history' , { schema: addMatchHistorySchema }, async (req, reply) => {
    try {
        const { rows } = await app.pg.query(
        `INSERT INTO match_history (gamemode) VALUES ($1)
         RETURNING id, gamemode, status, started_at, finished_at`,
         [req.body.gamemode]
    );
    return (reply.code(201).send(rows[0]));
    } catch (err) {
        req.log.error(err);
        return reply.code(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Could not create match' });
    }
});

// PATCH update match info
app.patch<{Params: { id: number}, Body: {finished_at: string, status: 'FINISHED' | 'ABANDONED'}}>('/api/match_history/:id', { schema: updateMatchSchema }, async (req, reply) => {
    try {
        const { rows } = await app.pg.query(
            `UPDATE match_history SET finished_at = $1, status = $2 WHERE id = $3
             RETURNING id, gamemode, status, started_at, finished_at`,
            [req.body.finished_at, req.body.status, req.params.id]
        );  
        if (rows.length === 0) {
            return (reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Match not found' }));
        }
        return (rows[0]);
    } catch (err: any) {
        // 23514 = check_violation (finished_at < started_at)
        if (err.code === '23514') {
            return (reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: 'finished_at must be after started_at' }));
        }
        req.log.error(err);
        return (reply.code(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Could not update match' }));
    }
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
