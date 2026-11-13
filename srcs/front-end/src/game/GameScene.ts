
import Phaser from 'phaser';
import type { GameControls } from './Controls';

export default class GameScene extends Phaser.Scene {
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

    private player!: Phaser.GameObjects.Rectangle;
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private obstacles!: Phaser.Physics.Arcade.StaticGroup;

    private controls: GameControls;

    private keys!: {
        left: Phaser.Input.Keyboard.Key[];
        right: Phaser.Input.Keyboard.Key[];
        jump: Phaser.Input.Keyboard.Key[];
        down: Phaser.Input.Keyboard.Key[];
        dash: Phaser.Input.Keyboard.Key[];
    };

    constructor(controls: GameControls) {
        super('GameScene');
        this.controls = controls;
    }

    create() {
        // World
        this.physics.world.setBounds(0, 0, 3000, 500);

        // Background
        this.cameras.main.setBackgroundColor('#171923');

        // Platforms
        this.platforms = this.physics.add.staticGroup();

        // Main ground
        const ground = this.add.rectangle(
            1500, 480, 3000, 40, 0x444466
        );

        this.physics.add.existing(ground, true);
        this.platforms.add(ground);

        // Floating platforms
        const platform1 = this.add.rectangle(
            250, 350, 180, 20, 0x666688
        );

        this.physics.add.existing(platform1, true);
        this.platforms.add(platform1);

        const platform2 = this.add.rectangle(
            550, 250, 180, 20, 0x666688
        );

        this.physics.add.existing(platform2, true);
        this.platforms.add(platform2);

        // Player
        this.player = this.add.rectangle(
            100, 100, 32, 48, 0x48a9ff
        );

        this.physics.add.existing(this.player);

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);

        // Obstacles
        this.obstacles = this.physics.add.staticGroup();

        this.generateObstacles();

        // Collisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.obstacles);

        // Camera
        this.cameras.main.setBounds(0, 0, 3000, 500);
        this.cameras.main.startFollow(this.player, true, 0.08, 0);

        // Controls
        const keyboard = this.input.keyboard!;

        this.keys = {
            left: this.controls.left.map(
                key => keyboard.addKey(key)
            ),

            right: this.controls.right.map(
                key => keyboard.addKey(key)
            ),

            jump: this.controls.jump.map(
                key => keyboard.addKey(key)
            ),

            down: this.controls.down.map(
                key => keyboard.addKey(key)
            ),

            dash: this.controls.dash.map(
                key => keyboard.addKey(key)
            )
        };
    }

    private generateObstacles() {
        let x = 500;

        while (x < 2900) {
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

    // Check if at least one key is held
    private isAnyKeyDown(
        keys: Phaser.Input.Keyboard.Key[]
    ): boolean {
        return keys.some(key => key.isDown);
    }

    // Check if at least one key was just pressed
    private isAnyKeyJustDown(
        keys: Phaser.Input.Keyboard.Key[]
    ): boolean {
        let pressed = false;

        keys.forEach(key => {
            if (Phaser.Input.Keyboard.JustDown(key)) {
                pressed = true;
            }
        });

        return pressed;
    }

    update() {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const delta = this.game.loop.delta;

        // Ground detection + recharge
        if (body.onFloor()) {
            this.has_double_jump = true;
            this.has_air_dash = true;
            this.coyoteTimer = this.coyoteTime;
        } else {
            this.coyoteTimer -= delta;
        }

        // Dash cooldown
        if (this.dashCooldownTimer > 0) {
            this.dashCooldownTimer -= delta;
        }

        // End dash
        if (this.isDashing) {
            this.dashTimer -= delta;

            if (this.dashTimer <= 0) {
                this.isDashing = false;
                body.allowGravity = true;
            }
        }

        // Horizontal movement
        const right = this.isAnyKeyDown(this.keys.right);
        const left = this.isAnyKeyDown(this.keys.left);

        // Facing direction
        if (right && !left) {
            this.facingDirection = 1;
        } else if (left && !right) {
            this.facingDirection = -1;
        }

        // Dash
        const dashPressed = this.isAnyKeyJustDown(this.keys.dash);

        if (dashPressed && !this.isDashing) {
            if (body.onFloor() && this.dashCooldownTimer <= 0) {
                // Ground dash
                this.startDash(body);
                this.dashCooldownTimer = this.dashCooldown;
            } else if (!body.onFloor() && this.has_air_dash) {
                // Air dash
                this.startDash(body);
                this.has_air_dash = false;
            }
        }

        // Horizontal movement
        if (!this.isDashing) {
            if (right && !left) {
                body.setVelocityX(400);
            } else if (left && !right) {
                body.setVelocityX(-400);
            } else {
                body.setVelocityX(0);
            }
        }

        // Jump buffer
        const jumpPressed = this.isAnyKeyJustDown(this.keys.jump);

        if (jumpPressed) {
            this.jumpBufferTimer = this.jumpBufferTime;
        } else {
            this.jumpBufferTimer = Math.max(
                0,
                this.jumpBufferTimer - delta
            );
        }

        // Jump + Coyote time
        if (
            !this.isDashing &&
            this.coyoteTimer > 0 &&
            this.jumpBufferTimer > 0
        ) {
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
        ) {
            this.jumpStartY = body.y;
            this.canFastFall = false;

            body.setVelocityY(-450);

            this.has_double_jump = false;
            this.jumpBufferTimer = 0;
        }

        // Fast fall unlock
        if (!this.isDashing && !this.canFastFall) {
            const jumpHeight = this.jumpStartY - body.y;
            const maxJumpHeight = (450 * 450) / (2 * 1500);

            if (jumpHeight >= maxJumpHeight * this.fastFallStartRatio) {
                this.canFastFall = true;
            }
        }

        // Fast fall
        if (!this.isDashing) {
            if (
                this.canFastFall &&
                this.isAnyKeyDown(this.keys.down)
            ) {
                body.setAccelerationY(this.fastFallAcceleration);
            } else {
                body.setAccelerationY(0);
            }
        }
    }

    // Start horizontal dash
    private startDash(body: Phaser.Physics.Arcade.Body) {
        this.isDashing = true;
        this.dashTimer = this.dashDuration;

        // Last known direction
        this.dashDirection = this.facingDirection;

        // Disable gravity
        body.allowGravity = false;
        body.setAccelerationY(0);

        // Horizontal impulse
        body.setVelocity(
            this.dashDirection * this.dashSpeed,
            0
        );
    }
}
