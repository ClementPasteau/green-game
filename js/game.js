var BootScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function BootScene() {
    Phaser.Scene.call(this, { key: "BootScene" });
  },

  preload: function() {
    // map tiles
    this.load.image("tiles", "assets/map/spritesheet.png");
    this.load.image("tiles-pokemon", "assets/map/spritesheet-pokemon.png");

    this.load.image("resource", "assets/green-orb.png");
    this.load.image("building", "assets/wind-turbine.png");

    // map in json format
    this.load.tilemapTiledJSON("map", "assets/map/map.json");

    // our two characters
    this.load.spritesheet("player", "assets/move.png", {
      frameWidth: 26,
      frameHeight: 27
    });
    this.load.spritesheet("spell", "assets/spell.png", {
      frameWidth: 24.5,
      frameHeight: 24
    });
  },

  create: function() {
    // start the WorldScene
    this.scene.start("WorldScene");
  }
});

function collectResource(player, resource) {
  resource.disableBody(true, true);
  this.resourcesScore += 10;
  this.resourcesText.setText(`resources: ${this.resourcesScore}`);
}

function calculateScore(score, scoreRatio) {
  return `score: ${score} / ${scoreRatio >= 0 && "+"}${scoreRatio}`;
}

var WorldScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function WorldScene() {
    Phaser.Scene.call(this, { key: "WorldScene" });
  },

  preload: function() {},

  create: function() {
    // create the map
    var map = this.make.tilemap({ key: "map" });

    // first parameter is the name of the tilemap in tiled
    var tiles = map.addTilesetImage("spritesheet", "tiles");
    var tilesPokemon = map.addTilesetImage("pokemon", "tiles-pokemon");

    // creating the layers
    var grass = map.createStaticLayer("Grass", tiles, 0, 0);
    var rocks = map.createStaticLayer("Rocks", tilesPokemon, 0, 0);
    var trees = map.createStaticLayer("Trees", tiles, 0, 0);

    // add resources
    resources = this.physics.add.staticGroup();
    resources.create(70, 312, "resource");
    resources.create(87, 312, "resource");
    resources.create(104, 312, "resource");
    resources.create(121, 312, "resource");
    resources.create(70, 329, "resource");
    resources.create(87, 329, "resource");
    resources.create(104, 329, "resource");
    resources.create(121, 329, "resource");
    resources.create(70, 345, "resource");
    resources.create(87, 345, "resource");
    resources.create(104, 345, "resource");
    resources.create(121, 345, "resource");
    resources.create(70, 361, "resource");
    resources.create(87, 361, "resource");
    resources.create(104, 361, "resource");
    resources.create(121, 361, "resource");
    resources.create(87, 378, "resource");
    resources.create(104, 378, "resource");

    // create buildings group
    this.buildings = this.physics.add.staticGroup();

    // make all tiles in Trees collidable
    trees.setCollisionByExclusion([-1]);

    //  animation with key 'left', we don't need left and right as we will use one and flip the sprite
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [8, 9, 10, 11, 12, 13, 14, 15]
      }),
      frameRate: 10,
      repeat: -1
    });

    // animation with key 'right'
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [8, 9, 10, 11, 12, 13, 14, 15]
      }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
      }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [0, 1, 2, 3, 4, 5, 6, 7]
      }),
      frameRate: 10,
      repeat: -1
    });

    // Anim for spell using
    this.anims.create({
      key: "spellAnim",
      frames: this.anims.generateFrameNumbers("spell", {
        frames: [12, 13, 14, 15, 16, 17]
      }),
      frameRate: 10,
      repeat: -1
    });

    // our player sprite created through the phycis system
    this.player = this.physics.add.sprite(50, 100, "player", 0);

    // don't go out of the map
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;
    this.player.setCollideWorldBounds(true);

    // don't walk on trees
    this.physics.add.collider(this.player, trees);

    // don't walk on buildings
    this.physics.add.collider(this.player, this.buildings);

    // make resources collectable
    this.physics.add.overlap(
      this.player,
      resources,
      collectResource,
      null,
      this
    );

    // limit camera to map
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.roundPixels = true; // avoid tile bleed

    // create the resourcesScore
    this.resourcesScore = 0;
    this.resourcesText = this.add.text(
      8,
      8,
      `resources: ${this.resourcesScore}`,
      {
        fontSize: "12px",
        fill: "#000"
      }
    );
    this.resourcesText.setDepth(1);

    // create the score
    this.score = 0;
    this.scoreRatio = 0;
    this.scoreText = this.add.text(
      this.cameras.main.scrollX + 150,
      this.cameras.main.scrollY + 8,
      calculateScore(this.score, this.scoreRatio),
      {
        fontSize: "12px",
        fill: "#000"
      }
    );
    this.scoreText.setDepth(1);

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.timer > 0) {
          this.score = this.score + this.scoreRatio;
          this.timer = this.timer - 1;
        }
      },
      callbackScope: this,
      loop: true
    });

    // create the timer
    this.timer = 30;
    this.timerText = this.add.text(
      8,
      window.innerHeight / window.devicePixelRatio - 15,
      `time left: ${this.timer}`,
      {
        fontSize: "12px",
        fill: "#000"
      }
    );

    this.timerText.setDepth(1);

    // user input
    this.cursors = this.input.keyboard.createCursorKeys();

    var createBuilding = this.createBuilding.bind(this);
    this.input.keyboard.on("keydown", function(event) {
      // console.log("TCL: event", event.keyCode);
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE) {
        createBuilding();
      }
    });
  },
  update: function(time, delta) {
    // update texts position
    this.resourcesText.x = this.cameras.main.scrollX + 8;
    this.resourcesText.y = this.cameras.main.scrollY + 8;
    this.scoreText.x = this.cameras.main.scrollX + 150;
    this.scoreText.y = this.cameras.main.scrollY + 8;
    this.timerText.x = this.cameras.main.scrollX + 8;
    this.timerText.y =
      this.cameras.main.scrollY +
      window.innerHeight / window.devicePixelRatio -
      15;

    this.player.body.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-80);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(80);
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-80);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(80);
    }

    // Update the animation last and give left/right animations precedence over up/down animations
    if (this.cursors.left.isDown) {
      this.player.anims.play("left", true);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.player.anims.play("right", true);
      this.player.flipX = false;
    } else if (this.cursors.up.isDown) {
      this.player.anims.play("up", true);
    } else if (this.cursors.down.isDown) {
      this.player.anims.play("down", true);
    } else if (this.cursors.shift.isDown) {
      this.player.anims.play("spellAnim", true);
    } else {
      this.player.anims.stop();
    }

    // refresh texts
    this.resourcesText.setText(`resources: ${this.resourcesScore}`);
    this.scoreText.setText(calculateScore(this.score, this.scoreRatio));
    this.timerText.setText(`time left: ${this.timer}`);

    // Update space key state
    this.spaceKeyWasDown = this.cursors.space.isDown;

    // trigger game over if time's up
    if (this.timer === 0) {
      this.player.body.setVelocity(0);
      this.input.keyboard.destroy();
      gameOverText = this.add.text(
        this.cameras.main.scrollX + 180,
        this.cameras.main.scrollY +
          window.innerHeight / window.devicePixelRatio / 2 -
          20,
        `GAME OVER! SCORE: ${this.score}`,
        { fontSize: "32px", fill: "#fff" }
      );
      gameOverText.setDepth(1);
    }
  },
  createBuilding: function() {
    if (this.resourcesScore >= 10) {
      this.buildings.create(this.player.x, this.player.y, "building");
      this.resourcesScore -= 10;
      this.scoreRatio += 1;
    }
  }
});

var config = {
  type: Phaser.AUTO,
  parent: "content",
  width: window.innerWidth / window.devicePixelRatio,
  height: window.innerHeight / window.devicePixelRatio,
  zoom: 2,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false // set to true to view zones
    }
  },
  scene: [BootScene, WorldScene]
};
var game = new Phaser.Game(config);
