
import Phaser from 'phaser';

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

    private player!: Phaser.GameObjects.Rectangle;
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private obstacles!: Phaser.Physics.Arcade.StaticGroup;

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

    constructor()
    {
        super('GameScene');
    }

    create()
    {
        // World
        this.physics.world.setBounds(0, 0, 3000, 500);

        // Background
        this.cameras.main.setBackgroundColor('#171923');

        // Platforms
        this.platforms = this.physics.add.staticGroup();

        // Main ground
        const ground = this.add.rectangle(1500, 480, 3000, 40, 0x444466);
        this.physics.add.existing(ground, true);
        this.platforms.add(ground);

        // Floating platforms
        const platform1 = this.add.rectangle(250, 350, 180, 20, 0x666688);
        this.physics.add.existing(platform1, true);
        this.platforms.add(platform1);

        const platform2 = this.add.rectangle(550, 250, 180, 20, 0x666688);
        this.physics.add.existing(platform2, true);
        this.platforms.add(platform2);

        // Player
        this.player = this.add.rectangle(100, 100, 32, 48, 0x48a9ff);
        this.physics.add.existing(this.player);

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);

        // Obstacles
        this.obstacles = this.physics.add.staticGroup();
        this.generateObstacles();

        // Finish Line
        this.finishLine = this.add.zone(2850, 400, 40, 160);
        this.physics.add.existing(this.finishLine, true);

        // Finish Line detection
        this.physics.add.overlap(
            this.player,
            this.finishLine,
            () => this.finishGame()
        );

        // Collisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.obstacles);

        // Camera
        this.cameras.main.setBounds(0, 0, 3000, 500);
        this.cameras.main.startFollow(this.player, true, 0.08, 0);

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

    private generateObstacles()
    {
        let x = 500;

        while (x < 2900)
        {
            const width = Phaser.Math.Between(25, 60);
            const height = Phaser.Math.Between(30, 70);

            const obstacle = this.add.rectangle(
                x,
                460 - height / 2,
                width,
                height,
                0xff5555
            );

            this.physics.add.existing(obstacle, true);
            this.obstacles.add(obstacle);

            x += Phaser.Math.Between(250, 500);
        }
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
    }
}
