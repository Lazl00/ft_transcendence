import Phaser from 'phaser';
import { tileTextures } from './tileTextures';
import { getVariant, pickTexture } from './tileVariants';
import { map_gen } from './map_gen/map_gen.js';
import type { GameMap } from './ColorGrid.js';

// Size (in px) of one matrix cell. Player is 32x48, so 1 cell = player height.
const TILE = 48;

// Solid cells of the matrix and their colour
//  W = border walls / floor, R = roof, G = ground / platforms
const SOLID_COLORS: Record<string, number> = {
    W: 0x444466,
    R: 0x3b3b5a,
    G: 0x666688
};

type CellRect = { col: number; row: number; width: number; height: number };

// Merges neighbouring cells that pass `test` into as few rectangles as possible.
// (One big static body instead of many small ones avoids the player snagging on tile seams.)
function mergeCells(map: GameMap, test: (cell: string) => boolean): CellRect[]
{
    const rows = map.length;
    const cols = map[0].length;
    const used: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
    const rects: CellRect[] = [];

    for (let r = 0; r < rows; r++)
    {
        for (let c = 0; c < cols; c++)
        {
            if (used[r][c] || !test(map[r][c]))
            {
                continue;
            }

            let width = 1;
            while (c + width < cols && !used[r][c + width] && test(map[r][c + width]))
            {
                width++;
            }

            let height = 1;
            let canGrow = true;
            while (canGrow && r + height < rows)
            {
                for (let k = 0; k < width; k++)
                {
                    if (used[r + height][c + k] || !test(map[r + height][c + k]))
                    {
                        canGrow = false;
                        break;
                    }
                }
                if (canGrow)
                {
                    height++;
                }
            }

            for (let dr = 0; dr < height; dr++)
            {
                for (let dc = 0; dc < width; dc++)
                {
                    used[r + dr][c + dc] = true;
                }
            }

            rects.push({ col: c, row: r, width, height });
        }
    }

    return rects;
}

export default class GameScene extends Phaser.Scene
{
    private coyoteTime = 100;
    private jumpBufferTime = 120;

    private dashCooldown = 500;
    private dashDuration = 150;
    private dashSpeed = 650;

    private jumpStartY = 0;
    private fastFallStartRatio = 0.66;
    private canFastFall = false;
    private fastFallAcceleration = 3500;

    private coyoteTimer = 0;
    private jumpBufferTimer = 0;
    private dashCooldownTimer = 0;
    private dashTimer = 0;

    private has_double_jump = true;
    private has_air_dash = true;
    private isDashing = false;

    private facingDirection = 1;
    private dashDirection = 1;

    // Chronomètre
    private timerText!: Phaser.GameObjects.Text;
    private elapsedTime = 0;

    // Finish Line
    private finishLine!: Phaser.GameObjects.Zone;
    private hasFinished = false;
    private readonly playerId: number;
    private readonly onResultSaved: () => void;

    private player!: Phaser.GameObjects.Rectangle;
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private hazards: Phaser.GameObjects.Zone[] = [];

    // Spawn point (cell 'S' of the matrix)
    private startX = 0;
    private startY = 0;

    // AZERTY : ZQSD
    private keys!: {
        up: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
    };

    // Flèches directionnelles
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    // Touche de dash : SHIFT
    private dashKey!: Phaser.Input.Keyboard.Key;

    constructor(playerId: number, onResultSaved: () => void)
    {
        super('GameScene');
        this.playerId = playerId;
        this.onResultSaved = onResultSaved;
    }

    preload()
    {
        for (const [key, url] of Object.entries(tileTextures))
        {
            this.load.image(key, url);
        }
    }

    create()
    {
        const map = map_gen();
        const worldWidth = map[0].length * TILE;
        const worldHeight = map.length * TILE;

        // World
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // Background
        this.cameras.main.setBackgroundColor('#171923');

        // Level generated from the matrix (platforms, spikes, start, finish)
        this.platforms = this.physics.add.staticGroup();
        this.hazards = [];
        this.buildLevel(map);

        // Player
        this.player = this.add.rectangle(this.startX, this.startY, 32, 48, 0x48a9ff);
        this.physics.add.existing(this.player);

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);

        
        // Collisions
        this.physics.add.collider(this.player, this.platforms);

        // Finish Line detection
        this.physics.add.overlap(
            this.player,
            this.finishLine,
            () => this.finishGame()
        );

        // Spikes
        this.physics.add.overlap(
            this.player,
            this.hazards,
            () => this.die()
        );

        // Camera (follows the player on both axes: the map is taller than the screen)
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.centerOn(this.startX, this.startY);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // Timer UI
        this.timerText = this.add.text(
            this.cameras.main.width / 2,
            30,
            '00:00.00',
            {
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#171923',
                strokeThickness: 5
            }
        );

        this.timerText.setOrigin(0.5, 0);
        this.timerText.setScrollFactor(0);
        this.timerText.setDepth(1000);

        // Controls

        // AZERTY : ZQSD
        this.keys = this.input.keyboard!.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.Z,
            left: Phaser.Input.Keyboard.KeyCodes.Q,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            right: Phaser.Input.Keyboard.KeyCodes.D
        }) as typeof this.keys;

        // Flèches directionnelles
        this.cursors = this.input.keyboard!.createCursorKeys();

        // Dash : SHIFT
        this.dashKey = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.SHIFT
        );
    }

    // Builds the level from the matrix returned by map_gen()
    // Legend: W wall, R roof, G ground, P spike, S start, F finish, E empty
    // Row 0 of the matrix is the BOTTOM of the level (y goes up)
    private buildLevel(map: GameMap)
    {
        const rows = map.length;
        const cols = map[0].length;

        const cellLeft = (col: number) => col * TILE;
        const cellTop = (row: number) => (rows - 1 - row) * TILE;

        // Start + Finish
        for (let r = 0; r < rows; r++)
        {
            for (let c = 0; c < cols; c++)
            {
                const cell = map[r][c];

                if (cell === 'S')
                {
                    this.startX = cellLeft(c) + TILE / 2;
                    this.startY = cellTop(r) + TILE / 2 - 1;
                }
                else if (cell === 'F')
                {
                    // Zone covers the F cell and the one above it
                    const x = cellLeft(c) + TILE / 2;
                    const y = cellTop(r + 1) + TILE;

                    this.add.rectangle(x, y, TILE, TILE * 2, 0x55ff88, 0.3);

                    this.finishLine = this.add.zone(x, y, TILE, TILE * 2);
                    this.physics.add.existing(this.finishLine, true);
                }
            }
        }
        
        // Solid blocks: visuel, un sprite par cellule selon ses voisins
        for (let r = 0; r < rows; r++)
        {
            for (let c = 0; c < cols; c++)
            {
                const cell = map[r][c];

                if (!(cell in SOLID_COLORS))
                {
                    continue;
                }

                const x = cellLeft(c) + TILE / 2;
                const y = cellTop(r) + TILE / 2;
                const key = pickTexture((k) => this.textures.exists(k), cell, getVariant(map, r, c));

                if (key)
                {
                    this.add.image(x, y, key).setDisplaySize(TILE, TILE);
                }
                else
                {
                    this.add.rectangle(x, y, TILE, TILE, SOLID_COLORS[cell]);
                }
            }
        }

        // Solid blocks: physique (rectangles fusionnés, invisibles)
        for (const type of Object.keys(SOLID_COLORS))
        {
            for (const rect of mergeCells(map, (cell) => cell === type))
            {
                const w = rect.width * TILE;
                const h = rect.height * TILE;
                const x = rect.col * TILE;
                const y = (rows - rect.row - rect.height) * TILE;

                const block = this.add.rectangle(x + w / 2, y + h / 2, w, h).setVisible(false);
                this.physics.add.existing(block, true);
                this.platforms.add(block);
            }
        }

        // Spikes: drawing (2 teeth per cell)
        const spikes = this.add.graphics();
        spikes.fillStyle(0xff5555, 1);

        for (let r = 0; r < rows; r++)
        {
            for (let c = 0; c < cols; c++)
            {
                if (map[r][c] !== 'P')
                {
                    continue;
                }

                const left = cellLeft(c);
                const top = cellTop(r);
                const half = TILE / 2;

                for (let k = 0; k < 2; k++)
                {
                    spikes.fillTriangle(
                        left + k * half, top + TILE,
                        left + (k + 1) * half, top + TILE,
                        left + k * half + half / 2, top + 4
                    );
                }
            }
        }

        // Spikes: hitboxes (a bit smaller than the drawing so it stays fair)
        for (const rect of mergeCells(map, (cell) => cell === 'P'))
        {
            const inset = 6;
            const tipMargin = TILE * 0.35;

            const w = rect.width * TILE - inset * 2;
            const h = rect.height * TILE - tipMargin;
            const x = rect.col * TILE + inset;
            const y = (rows - rect.row - rect.height) * TILE + tipMargin;

            const zone = this.add.zone(x + w / 2, y + h / 2, w, h);
            this.physics.add.existing(zone, true);
            this.hazards.push(zone);
        }
    }

    // Touching a spike: back to the start (the timer keeps running)
    private die()
    {
        if (this.hasFinished)
        {
            return;
        }

        const body = this.player.body as Phaser.Physics.Arcade.Body;

        body.reset(this.startX, this.startY);
        body.allowGravity = true;

        this.isDashing = false;
        this.dashTimer = 0;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.canFastFall = false;
        this.has_double_jump = true;
        this.has_air_dash = true;

        this.cameras.main.centerOn(this.startX, this.startY);
        this.cameras.main.flash(150, 255, 85, 85);
    }

    update()
    {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const delta = this.game.loop.delta;

        // Chronomètre
        if (!this.hasFinished)
        {
            this.elapsedTime += delta;
        }

        const totalCentiseconds = Math.floor(this.elapsedTime / 10);

        const minutes = Math.floor(totalCentiseconds / 6000);
        const seconds = Math.floor((totalCentiseconds % 6000) / 100);
        const centiseconds = totalCentiseconds % 100;

        this.timerText.setText(
            `${String(minutes).padStart(2, '0')}:` +
            `${String(seconds).padStart(2, '0')}.` +
            `${String(centiseconds).padStart(2, '0')}`
        );

        // Ne plus gérer les mouvements après la fin
        if (this.hasFinished)
        {
            return;
        }

        // Ground detection + recharge des capacités aériennes
        if (body.onFloor())
        {
            this.has_double_jump = true;
            this.has_air_dash = true;
            this.coyoteTimer = this.coyoteTime;
        }
        else
        {
            this.coyoteTimer -= delta;
        }

        // Recharge du dash au sol
        if (this.dashCooldownTimer > 0)
        {
            this.dashCooldownTimer -= delta;
        }

        // Fin du dash
        if (this.isDashing)
        {
            this.dashTimer -= delta;

            if (this.dashTimer <= 0)
            {
                this.isDashing = false;
                body.allowGravity = true;
            }
        }

        // Horizontal movement : ZQSD OU flèches
        const right = this.keys.right.isDown || this.cursors.right.isDown;
        const left = this.keys.left.isDown || this.cursors.left.isDown;

        // Mémorisation de la direction
        if (right && !left)
        {
            this.facingDirection = 1;
        }
        else if (left && !right)
        {
            this.facingDirection = -1;
        }

        // Dash : SHIFT
        if (Phaser.Input.Keyboard.JustDown(this.dashKey) && !this.isDashing)
        {
            if (body.onFloor() && this.dashCooldownTimer <= 0)
            {
                // Dash au sol
                this.startDash(body);
                this.dashCooldownTimer = this.dashCooldown;
            }
            else if (!body.onFloor() && this.has_air_dash)
            {
                // Air dash
                this.startDash(body);
                this.has_air_dash = false;
            }
        }

        // Horizontal movement (désactivé pendant le dash)
        if (!this.isDashing)
        {
            if (right && !left)
            {
                body.setVelocityX(400);
            }
            else if (left && !right)
            {
                body.setVelocityX(-400);
            }
            else
            {
                body.setVelocityX(0);
            }
        }

        // Jump buffer : Z OU flèche du haut OU ESPACE
        if (
            Phaser.Input.Keyboard.JustDown(this.keys.up) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.space)
        )
        {
            this.jumpBufferTimer = this.jumpBufferTime;
        }
        else
        {
            this.jumpBufferTimer = Math.max(
                0,
                this.jumpBufferTimer - delta
            );
        }

        // Jump + Coyote time
        if (!this.isDashing && this.coyoteTimer > 0 && this.jumpBufferTimer > 0)
        {
            this.jumpStartY = body.y;
            this.canFastFall = false;

            body.setVelocityY(-450);

            this.coyoteTimer = 0;
            this.jumpBufferTimer = 0;
            this.has_double_jump = true;
        }
        // Double jump
        else if (
            !this.isDashing &&
            this.jumpBufferTimer > 0 &&
            !body.onFloor() &&
            this.has_double_jump
        )
        {
            this.jumpStartY = body.y;
            this.canFastFall = false;

            body.setVelocityY(-450);

            this.has_double_jump = false;
            this.jumpBufferTimer = 0;
        }

        // Fast fall
        if (!this.isDashing && !this.canFastFall)
        {
            const jumpHeight = this.jumpStartY - body.y;
            const maxJumpHeight = (450 * 450) / (2 * 1500);

            if (jumpHeight >= maxJumpHeight * this.fastFallStartRatio)
            {
                this.canFastFall = true;
            }
        }

        // Application du Fast Fall
        if (!this.isDashing)
        {
            if (this.canFastFall && (this.keys.down.isDown || this.cursors.down.isDown))
            {
                body.setAccelerationY(this.fastFallAcceleration);
            }
            else
            {
                body.setAccelerationY(0);
            }
        }
    }

    // Démarre un dash horizontal
    private startDash(body: Phaser.Physics.Arcade.Body)
    {
        this.isDashing = true;
        this.dashTimer = this.dashDuration;

        // Conserve la dernière direction connue
        this.dashDirection = this.facingDirection;

        // Désactive temporairement la gravité
        body.allowGravity = false;
        body.setAccelerationY(0);

        // Impulsion horizontale
        body.setVelocity(
            this.dashDirection * this.dashSpeed,
            0
        );
    }

    // Fin de la partie
    private finishGame()
    {
        if (this.hasFinished)
        {
            return;
        }

        this.hasFinished = true;

        const body = this.player.body as Phaser.Physics.Arcade.Body;

        // Arrête le joueur
        body.setVelocity(0, 0);
        body.setAcceleration(0, 0);
        body.allowGravity = false;

        this.isDashing = false;

        // Message de fin
        this.add.text(
            this.cameras.main.width / 2,
            100,
            'FINISH !',
            {
                fontSize: '48px',
                color: '#55ff88',
                fontStyle: 'bold',
                stroke: '#171923',
                strokeThickness: 6
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1001);

        void this.recordMatchResult();
    }

    private async recordMatchResult()
    {
        const statusText = this.add.text(
            this.cameras.main.width / 2,
            155,
            'Saving result...',
            {
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#171923',
                strokeThickness: 4
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1001);

        try
        {
            const response = await fetch(`/api/players/${this.playerId}/matches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gamemode: 'CLASSIC',
                    duration_ms: Math.round(this.elapsedTime),
                    is_winner: true
                })
            });
            if (!response.ok)
            {
                throw new Error(`Request failed (HTTP ${response.status}).`);
            }
            statusText.setText('Result saved');
            this.onResultSaved();
        }
        catch (error)
        {
            console.error('Could not save the completed match result', error);
            const detail = error instanceof Error ? error.message : 'Unknown error';
            statusText.setText(`Could not save result: ${detail}`);
            statusText.setColor('#ff8888');
        }
    }
}