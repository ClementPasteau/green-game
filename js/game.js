var BootScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function BootScene() {
    Phaser.Scene.call(this, { key: "BootScene" });
  },

  preload: function() {
    // map tiles
    this.load.image("tiles", "assets/map/spritesheet.png");

    // map in json format
    this.load.tilemapTiledJSON("map", "assets/map/map.json");

    // our two characters
    this.load.spritesheet("player", "assets/move.png", {
      frameWidth: 26,
      frameHeight: 27
    });
    this.load.spritesheet("spell", "assets/spell.png", {
      frameWidth: 26,
      frameHeight: 27
    });
  },

  create: function() {
    // start the WorldScene
    this.scene.start("WorldScene");
  }
});

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

    // creating the layers
    var grass = map.createStaticLayer("Grass", tiles, 0, 0);
    var obstacles = map.createStaticLayer("Obstacles", tiles, 0, 0);

    // make all tiles in obstacles collidable
    obstacles.setCollisionByExclusion([-1]);

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
      key: "space",
      frames: this.anims.generateFrameNumbers("spell", {
        frames: [13, 14, 15, 16, 17, 18, 19]
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
    this.physics.add.collider(this.player, obstacles);

    // limit camera to map
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.roundPixels = true; // avoid tile bleed

    // user input
    this.cursors = this.input.keyboard.createCursorKeys();
    //addKeys( {'space' : Phaser.KeyCode.SPACEBAR } );
  },
  update: function(time, delta) {
    //    this.controls.update(delta);

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
    } else {
      this.player.anims.stop();
    }
  }
});

var config = {
  type: Phaser.AUTO,
  parent: "content",
  width: 320,
  height: 240,
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
