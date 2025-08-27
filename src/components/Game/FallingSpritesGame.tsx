import Phaser from "phaser";

export default class FallingSpritesGame extends Phaser.Scene {
  private catcher!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private coins!: Phaser.Physics.Arcade.Group;
  private falling_sprites_1!: Phaser.Physics.Arcade.Group;
  private falling_sprites_2!: Phaser.Physics.Arcade.Group;
  private falling_sprites_3!: Phaser.Physics.Arcade.Group;
  private meteor!: Phaser.Physics.Arcade.Group;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private timeLeft: number = 60;
  private timerText!: Phaser.GameObjects.Text;
  private timers: Phaser.Time.TimerEvent[] = [];
  private inputState = { left: false, right: false };

  private coinDelay: number = 1000;
  private sprite1Delay: number = 2000;
  private sprite2Delay: number = 500;
  private sprite3Delay: number = 800;
  private meteorDelay: number = 2500;
  private hasIncreasedSpawn: boolean = false;

  constructor() {
    super({ key: "falling-sprites" });
  }

  preload() {
    this.load.image("background", "/assets/bg.webp");
    this.load.image("coin", "/assets/coin.png");
    this.load.image("catcher", "/assets/catcher_sprites.png");
    this.load.image("falling_sprites_1", "/assets/falling_sprites_1.png");
    this.load.image("falling_sprites_2", "/assets/falling_sprites_2.png");
    this.load.image("falling_sprites_3", "/assets/falling_sprites_3.png");
    this.load.image("meteor", "/assets/meteor.png");
    this.load.audio("collect-sound", "/audio/collect.mp3");
    this.load.audio("wrong-sound", "/audio/wrong.MP3");
  }

  create() {
    // Background
    const image = this.add.image(0, 0, "background").setOrigin(0.5, 0.5);

    image.setPosition(
      this.scale.gameSize.width / 2,
      this.scale.gameSize.height / 2
    );

    // Get ratio of the image to scale it properly
    const scaleX = this.scale.gameSize.width / image.width;
    const scaleY = this.scale.gameSize.height / image.height;
    const scale = Math.max(scaleX, scaleY); // "Cover" effect

    image.setScale(scale);

    image.setDepth(-1); // Set depth to -1 to render behind other objects
    this.hasIncreasedSpawn = false;

    this.cameras.main.setSize(
      this.scale.gameSize.width,
      this.scale.gameSize.height
    );
    this.cameras.main.setBounds(
      0,
      0,
      this.scale.gameSize.width,
      this.scale.gameSize.height
    );
    this.physics.world.setBounds(
      0,
      0,
      this.scale.gameSize.width,
      this.scale.gameSize.height
    );

    // Add Catcher
    this.catcher = this.physics.add.sprite(
      this.scale.width / 2,
      this.scale.height - 100,
      "catcher"
    );

    // create condition to check if it's mobile or not
    if (this.scale.gameSize.width < 800) {
      this.catcher.setScale(0.2);
    } else {
      this.catcher.setScale(0.3);
    }

    this.catcher.setCollideWorldBounds(true); // Biar tidak keluar layar
    this.catcher.setImmovable(true);

    this.coins = this.physics.add.group();
    this.falling_sprites_1 = this.physics.add.group();
    this.falling_sprites_2 = this.physics.add.group();
    this.falling_sprites_3 = this.physics.add.group();
    this.meteor = this.physics.add.group();

    // Keyboard control
    const cursors = this.input.keyboard?.createCursorKeys();
    if (!cursors) throw new Error("Keyboard input not available");
    this.cursors = cursors;

    // Buat state touch
    this.inputState = { left: false, right: false };

    const width = Number(this.game.config.width);

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      // reset dulu
      this.inputState.left = false;
      this.inputState.right = false;

      if (pointer.x < width / 2) {
        this.inputState.left = true;
      } else {
        this.inputState.right = true;
      }
    });

    this.input.on("pointerup", () => {
      this.inputState.left = false;
      this.inputState.right = false;
    });

    this.input.on("pointerout", () => {
      this.inputState.left = false;
      this.inputState.right = false;
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return;

      this.inputState.left = false;
      this.inputState.right = false;

      if (pointer.x < width / 2) {
        this.inputState.left = true;
      } else {
        this.inputState.right = true;
      }
    });

    this.timers.push(
      this.time.addEvent({
        delay: this.coinDelay,
        callback: this.createCoin,
        callbackScope: this,
        loop: true,
      })
    );

    this.timers.push(
      this.time.addEvent({
        delay: this.sprite1Delay,
        callback: this.createFallingSprites1,
        callbackScope: this,
        loop: true,
      })
    );

    this.timers.push(
      this.time.addEvent({
        delay: this.sprite2Delay,
        callback: this.createFallingSprite2,
        callbackScope: this,
        loop: true,
      })
    );

    this.timers.push(
      this.time.addEvent({
        delay: this.sprite3Delay,
        callback: this.createFallingSprite3,
        callbackScope: this,
        loop: true,
      })
    );

    this.timers.push(
      this.time.addEvent({
        delay: this.meteorDelay,
        callback: this.createMeteor,
        callbackScope: this,
        loop: true,
      })
    );

    this.timers.push(
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          this.timeLeft--;
          this.timerText.setText(`Time: ${this.timeLeft}`);
          if (this.timeLeft <= 0) {
            this.gameOver();
          }
        },
        callbackScope: this,
        loop: true,
      })
    );

    // Menambahkan collider untuk mendeteksi tabrakan antara keranjang dan coin
    this.physics.add.overlap(
      this.catcher,
      this.coins,
      (catcher, coin) =>
        this.catchCoin(
          catcher as Phaser.Physics.Arcade.Sprite,
          coin as Phaser.Physics.Arcade.Sprite
        ),
      undefined,
      this
    );

    this.physics.add.overlap(
      this.catcher,
      this.falling_sprites_1,
      (catcher, falling_sprites_1) =>
        this.catchFallingSprite1(
          catcher as Phaser.Physics.Arcade.Sprite,
          falling_sprites_1 as Phaser.Physics.Arcade.Sprite
        ),
      undefined,
      this
    );

    this.physics.add.overlap(
      this.catcher,
      this.falling_sprites_2,
      (catcher, falling_sprites_2) =>
        this.catchFallingSprite2(
          catcher as Phaser.Physics.Arcade.Sprite,
          falling_sprites_2 as Phaser.Physics.Arcade.Sprite
        ),
      undefined,
      this
    );

    this.physics.add.overlap(
      this.catcher,
      this.falling_sprites_3,
      (catcher, falling_sprites_3) =>
        this.catchFallingSprite2(
          catcher as Phaser.Physics.Arcade.Sprite,
          falling_sprites_3 as Phaser.Physics.Arcade.Sprite
        ),
      undefined,
      this
    );

    this.physics.add.overlap(
      this.catcher,
      this.meteor,
      (catcher, meteor) =>
        this.catchMeteor(
          catcher as Phaser.Physics.Arcade.Sprite,
          meteor as Phaser.Physics.Arcade.Sprite
        ),
      undefined,
      this
    );

    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontStyle: "bold",
      fontSize: "32px",
      color: "#000000",
    });

    if (this.scale.gameSize.width < 800) {
      this.timerText = this.add.text(16, 48, "Time: 60", {
        fontStyle: "bold",
        fontSize: "32px",
        color: "#000000",
      });
    } else {
      this.timerText = this.add.text(600, 16, "Time: 60", {
        fontStyle: "bold",
        fontSize: "32px",
        color: "#000000",
      });
    }

    this.game.events.emit("ready");
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }

  moveLeft() {
    this.catcher.setVelocityX(-300);
  }
  moveRight() {
    this.catcher.setVelocityX(300);
  }

  update() {
    const speed = 450;

    // Keyboard
    if (this.cursors.left?.isDown) {
      this.catcher.setVelocityX(-speed);
    } else if (this.cursors.right?.isDown) {
      this.catcher.setVelocityX(speed);
    }
    // Touch
    else if (this.inputState.left) {
      this.catcher.setVelocityX(-speed);
    } else if (this.inputState.right) {
      this.catcher.setVelocityX(speed);
    } else {
      this.catcher.setVelocityX(0);
    }

    [
      this.falling_sprites_2,
      this.coins,
      this.falling_sprites_1,
      this.falling_sprites_3,
    ].forEach((group) => {
      group.getChildren().forEach((item) => {
        if ((item as Phaser.Physics.Arcade.Sprite).y > window.innerHeight) {
          const sprite = item as Phaser.Physics.Arcade.Sprite;

          if (sprite.texture.key !== "coin") {
            // score minus effect
            const penalty = -2;

            const wrongSound = this.sound.add("wrong-sound");
            wrongSound.setVolume(0.2);
            wrongSound.play();

            const pointText = this.add
              .text(sprite.x, sprite.y, `${penalty}`, {
                fontStyle: "bold",
                fontSize: "32px",
                color: "#ff0000",
              })
              .setOrigin(0.5);

            this.tweens.add({
              targets: pointText,
              y: sprite.y - 50,
              alpha: 0,
              duration: 500,
              ease: "Power1",
              onComplete: () => pointText.destroy(),
            });

            this.score += penalty;
            this.scoreText.setText(`Score: ${this.score}`);
          }

          sprite.destroy();
        }
      });
    });

    if (this.timeLeft === 30 && !this.hasIncreasedSpawn) {
      this.hasIncreasedSpawn = true;

      // Add new timers with increased spawn rates
      this.timers.push(
        this.time.addEvent({
          delay: this.coinDelay * 0.5,
          callback: this.createCoin,
          callbackScope: this,
          loop: true,
        })
      );
      this.timers.push(
        this.time.addEvent({
          delay: this.sprite1Delay * 0.5,
          callback: this.createFallingSprites1,
          callbackScope: this,
          loop: true,
        })
      );
      this.timers.push(
        this.time.addEvent({
          delay: this.sprite2Delay * 0.5,
          callback: this.createFallingSprite2,
          callbackScope: this,
          loop: true,
        })
      );
      this.timers.push(
        this.time.addEvent({
          delay: this.sprite3Delay * 0.5,
          callback: this.createFallingSprite3,
          callbackScope: this,
          loop: true,
        })
      );
    }
  }

  createFallingSprites1() {
    const falling_sprites_1 = this.falling_sprites_1.create(
      Phaser.Math.Between(100, Math.min(700, this.scale.width)),
      0,
      "falling_sprites_1"
    ) as Phaser.Physics.Arcade.Sprite;

    // create condition to check if it's mobile or not
    if (this.scale.gameSize.width < 800) {
      falling_sprites_1.setScale(0.15);
    } else {
      falling_sprites_1.setScale(0.2);
    }

    falling_sprites_1.setAngularVelocity(50);
    const speed = 100 + (60 - this.timeLeft) * 10; // Increase speed as time decreases
    falling_sprites_1.setVelocityY(speed);
  }

  createCoin() {
    const coin = this.coins.create(
      Phaser.Math.Between(100, Math.min(700, this.scale.width)),
      0,
      "coin"
    ) as Phaser.Physics.Arcade.Sprite;

    // create condition to check if it's mobile or not
    if (this.scale.gameSize.width < 800) {
      coin.setScale(0.08);
    } else {
      coin.setScale(0.1);
    }
    coin.setAngularVelocity(50);
    const speed = 100 + (60 - this.timeLeft) * 10; // Kecepatan meningkat seiring waktu
    coin.setVelocityY(speed);
  }

  createFallingSprite2() {
    const falling_sprites_2 = this.falling_sprites_2.create(
      Phaser.Math.Between(100, Math.min(700, this.scale.width)),
      0,
      "falling_sprites_2"
    ) as Phaser.Physics.Arcade.Sprite;

    // create condition to check if it's mobile or not
    if (this.scale.gameSize.width < 800) {
      falling_sprites_2.setScale(0.15);
    } else {
      falling_sprites_2.setScale(0.2);
    }

    const speed = 100 + (60 - this.timeLeft) * 10; // Kecepatan meningkat seiring waktu
    falling_sprites_2.setVelocityY(speed);
  }

  createFallingSprite3() {
    const falling_sprites_3 = this.falling_sprites_3.create(
      Phaser.Math.Between(100, Math.min(700, this.scale.width)),
      0,
      "falling_sprites_3"
    ) as Phaser.Physics.Arcade.Sprite;

    // create condition to check if it's mobile or not
    if (this.scale.gameSize.width < 800) {
      falling_sprites_3.setScale(0.25);
    } else {
      falling_sprites_3.setScale(0.3);
    }

    const speed = 100 + (60 - this.timeLeft) * 10; // Kecepatan meningkat seiring waktu
    falling_sprites_3.setVelocityY(speed);
  }

  createMeteor() {
    const meteor = this.meteor.create(
      Phaser.Math.Between(100, Math.min(700, this.scale.width)),
      0,
      "meteor"
    ) as Phaser.Physics.Arcade.Sprite;

    // create condition to check if it's mobile or not
    if (this.scale.gameSize.width < 800) {
      meteor.setScale(0.2);
    } else {
      meteor.setScale(0.3);
    }

    const speedY = 100 + (60 - this.timeLeft) * 10;
    const speedX = Phaser.Math.Between(-80, 80);

    meteor.setVelocity(speedX, speedY);
  }

  catchCoin(
    _catcher: Phaser.Physics.Arcade.Sprite,
    coin: Phaser.Physics.Arcade.Sprite
  ) {
    const collectSound = this.sound.add("collect-sound");
    collectSound.play();

    // Tampilkan teks poin di posisi coin
    const points = 5; // Poin yang didapatkan dari coin
    const pointText = this.add
      .text(coin.x, coin.y, `+${points}`, {
        fontStyle: "bold",
        fontSize: "32px",
        color: "#2bab00",
      })
      .setOrigin(0.5);

    // Animasi teks naik dan menghilang
    this.tweens.add({
      targets: pointText,
      y: coin.y - 50, // Gerakkan ke atas
      alpha: 0, // Ubah transparansi menjadi 0
      duration: 500, // Durasi animasi
      ease: "Power1", // Jenis easing
      onComplete: () => {
        pointText.destroy(); // Hancurkan teks setelah animasi selesai
      },
    });

    coin.destroy();
    this.score += 5;
    this.scoreText.setText(`Score: ${this.score}`);
    console.log("Coin caught!");
  }

  catchFallingSprite1(
    _catcher: Phaser.Physics.Arcade.Sprite,
    falling_sprites_1: Phaser.Physics.Arcade.Sprite
  ) {
    const collectSound = this.sound.add("collect-sound");
    collectSound.play();

    // Sprite 1 Catcher
    const points = 5; // Score gotten from sprite 1
    const pointText = this.add
      .text(falling_sprites_1.x, falling_sprites_1.y, `+${points}`, {
        fontStyle: "bold",
        fontSize: "32px",
        color: "#2bab00",
      })
      .setOrigin(0.5);

    // text faded
    this.tweens.add({
      targets: pointText,
      y: falling_sprites_1.y - 50, // Gerakkan ke atas
      alpha: 0, // Ubah transparansi menjadi 0
      duration: 500, // Durasi animasi
      ease: "Power1", // Jenis easing
      onComplete: () => {
        pointText.destroy(); // Hancurkan teks setelah animasi selesai
      },
    });

    falling_sprites_1.destroy();
    this.score += 5;
    this.scoreText.setText(`Score: ${this.score}`);
    console.log("Sprite1 caught!");
  }

  catchFallingSprite2(
    _catcher: Phaser.Physics.Arcade.Sprite,
    falling_sprite_2: Phaser.Physics.Arcade.Sprite
  ) {
    const collectSound = this.sound.add("collect-sound");
    collectSound.play();

    // Tampilkan teks poin di posisi coin
    const points = 4; // Poin yang didapatkan dari coin
    const pointText = this.add
      .text(falling_sprite_2.x, falling_sprite_2.y, `+${points}`, {
        fontStyle: "bold",
        fontSize: "32px",
        color: "#2bab00",
      })
      .setOrigin(0.5);

    // Animasi teks naik dan menghilang
    this.tweens.add({
      targets: pointText,
      y: falling_sprite_2.y - 50, // Gerakkan ke atas
      alpha: 0, // Ubah transparansi menjadi 0
      duration: 500, // Durasi animasi
      ease: "Power1", // Jenis easing
      onComplete: () => {
        pointText.destroy(); // Hancurkan teks setelah animasi selesai
      },
    });

    falling_sprite_2.destroy();
    this.score += 4;
    this.scoreText.setText(`Score: ${this.score}`);
    console.log("Sprite2 caught!");
  }

  catchFallingSprite3(
    _catcher: Phaser.Physics.Arcade.Sprite,
    falling_sprite_3: Phaser.Physics.Arcade.Sprite
  ) {
    const collectSound = this.sound.add("collect-sound");
    collectSound.play();

    // Tampilkan teks poin di posisi coin
    const points = 3; // Poin yang didapatkan dari coin
    const pointText = this.add
      .text(falling_sprite_3.x, falling_sprite_3.y, `+${points}`, {
        fontStyle: "bold",
        fontSize: "32px",
        color: "#2bab00",
      })
      .setOrigin(0.5);

    // Animasi teks naik dan menghilang
    this.tweens.add({
      targets: pointText,
      y: falling_sprite_3.y - 50, // Gerakkan ke atas
      alpha: 0, // Ubah transparansi menjadi 0
      duration: 500, // Durasi animasi
      ease: "Power1", // Jenis easing
      onComplete: () => {
        pointText.destroy(); // Hancurkan teks setelah animasi selesai
      },
    });

    falling_sprite_3.destroy();
    this.score += 3;
    this.scoreText.setText(`Score: ${this.score}`);
    console.log("Sprite3 caught!");
  }

  catchMeteor(
    _catcher: Phaser.Physics.Arcade.Sprite,
    meteor: Phaser.Physics.Arcade.Sprite
  ) {
    const wrongSound = this.sound.add("wrong-sound");
    wrongSound.setVolume(0.2);
    wrongSound.play();

    const points = -20;
    const pointText = this.add
      .text(meteor.x, meteor.y, `${points}`, {
        fontStyle: "bold",
        fontSize: "32px",
        color: "#ff0000",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: pointText,
      y: meteor.y - 50,
      alpha: 0,
      duration: 500,
      ease: "Power1",
      onComplete: () => {
        pointText.destroy();
      },
    });

    meteor.destroy();
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
    console.log("Meteor caught!");
  }

  private gameOver() {
    this.physics.pause();

    // Hentikan semua timer
    this.timers.forEach((timer) => timer.remove());
    this.timers = [];

    this.coins.clear(true, true);
    this.falling_sprites_1.clear(true, true);
    this.falling_sprites_2.clear(true, true);
    this.falling_sprites_3.clear(true, true);
    this.meteor.clear(true, true);

    // if (this.game.scale.gameSize.width < 800) {
    //   this.add.text(100, 250, "Game Over", {
    //     fontStyle: "bold",
    //     fontSize: "48px",
    //     color: "#ff0000",
    //     fontFamily: "Anton, sans-serif",
    //   });
    //   this.add.text(100, 320, `Final Score: ${this.score}`, {
    //     fontStyle: "bold",
    //     fontSize: "32px",
    //     color: "#ff0000",
    //     fontFamily: "Anton, sans-serif",
    //   });
    // } else {
    //   this.add.text(300, 250, "Game Over", {
    //     fontStyle: "bold",
    //     fontSize: "48px",
    //     color: "#ff0000",
    //     fontFamily: "Anton, sans-serif",
    //   });
    //   this.add.text(300, 320, `Final Score: ${this.score}`, {
    //     fontStyle: "bold",
    //     fontSize: "32px",
    //     color: "#ff0000",
    //     fontFamily: "Anton, sans-serif",
    //   });
    // }

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Teks Game Over
    this.add
      .text(centerX, centerY - 50, "Game Over", {
        fontStyle: "bold",
        fontSize: "48px",
        color: "#ff0000",
        fontFamily: "Anton, sans-serif",
      })
      .setOrigin(0.5); // biar titik anchor di tengah

    // Teks Final Score
    this.add
      .text(centerX, centerY + 20, `Final Score: ${this.score}`, {
        fontStyle: "bold",
        fontSize: "32px",
        color: "#ff0000",
        fontFamily: "Anton, sans-serif",
      })
      .setOrigin(0.5);

    this.events.emit("gameover", { score: this.score });
  }

  shutdown() {
    // Hentikan semua timer jika belum dihentikan
    this.timers.forEach((timer) => timer.remove());
    this.timers = [];

    // Hancurkan semua grup objek
    this.coins.clear(true, true);
    this.falling_sprites_1.clear(true, true);
    this.falling_sprites_2.clear(true, true);
    this.falling_sprites_3.clear(true, true);

    // Hancurkan objek teks jika masih ada
    this.scoreText?.destroy();
    this.timerText?.destroy();

    // Hancurkan keranjang jika masih ada
    this.catcher?.destroy();
  }
}
