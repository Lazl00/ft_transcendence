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

app.get('/api/get/players', async (req, reply) => {
    // 1. Run the query on the database
    const { rows } = await app.pg.query('SELECT * FROM players');

    // 2. Return the result. Fastify turns it into JSON and sends it to the client
    return rows;
});

// INSERT INTO shop_items (name, type, price, asset_path) VALUES ('Gragas sous Jack D', 'SKIN', 2500, 'skins/gragas/jackd'), ('Dash electrique', 'ANIMATION', 500, '/animation/dashelectrique');
// INSERT INTO players (username, money, level) VALUES ('Lucas', 200, 100), ('Bob', 50, 35), ('Alice', 1532, 7);

app.get('/api/get/shop', async (req, reply) => {
    // 1. Run the query on the database
    const { rows } = await app.pg.query('SELECT * FROM shop_items');

    // 2. Return the result. Fastify turns it into JSON and sends it to the client
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
