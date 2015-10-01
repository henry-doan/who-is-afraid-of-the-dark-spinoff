/**************************************************
 * To Do
 *  - Add creatures
 *  - Creature hide from light
 *  - Creatures track player (by sound?)
 *  - Shadows from trees
 *  - Shadows from walls
 *  - Additional lights
 *  - Things to collect
 *  - Torch battery life
 *  - Creepy crawlies, moths
 
 * Done
 *  - Draw background
 *  - Draw shadow
 *  - Move and rotate
 *  - Add map
 *  - Camera lag
 *  - Constrain movement to boundaries
***************************************************/

var GRASS = getImage("cute/GrassBlock");
var DIRT = getImage("cute/DirtBlock");
var DOOR = getImage("cute/DoorTallClosed");
var WALL = getImage("cute/StoneBlockTall");
var MONSTER = getImage("cute/EnemyBug");
MONSTER.width = 50;
MONSTER.height = 85;
var AVATAR = getImage("cute/CharacterHornGirl");

var torchWidth = 20;
var cameraX = 80;
var cameraY = 650;
var cameraSpeed = 0.03;

// Map things
var tiles = {
    '.' : GRASS,
    'w' : WALL,
    'p' : DIRT,
    'd' : DOOR
};
var TILE_SCALE = 1.75;

var map1 = [
    "wwwwdwwwwwwwwwwwww",
    "w...p............w",
    "w...p............w",
    "w...p............w",
    "w...p............w",
    "w...p............w",
    "w...p............w",
    "w...p............w",
    "w...pppppppppppppw",
    "w................w",
    "w................w",
    "w................w",
    "w................w",
    "w................w",
    "w................w",
    "w................w",
    "w................w",
    "d................w",
    "w................w",
    "wwwwwwwwwwwwwwwwww"
];

var tile_size = GRASS.width / TILE_SCALE;
var map_width = (map1[0].length - 1) * tile_size;
var map_height = (map1.length - 4) * tile_size;

// Event handling
var keys = [];
var keyPressed = function() {
    keys[keyCode] = true;
};

var keyReleased = function() {    
    keys[keyCode] = false;
};

var toPolar = function(x, y, theta, d) {
    return [x + d * cos(theta), y - d * sin(theta)];
};

var Person = function(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 5;
    
    this.draw = function() {
        var x = this.x - cameraX + 200;
        var y = this.y - cameraY + 200;
        
        // Shadow
        var d = 600;
        var c0 = toPolar(x, y, this.angle + 180, 25);
        var c1 = toPolar(x, y, this.angle + 90, d);
        var c2 = toPolar(x, y, this.angle - 90, d);
        var c3 = toPolar(c1[0], c1[1], this.angle + 180, d);
        var c4 = toPolar(c2[0], c2[1], this.angle - 180, d);
        var c5 = toPolar(c0[0], c0[1], this.angle + torchWidth, d);
        var c6 = toPolar(c0[0], c0[1], this.angle - torchWidth, d);
        var c7 = toPolar(c5[0], c5[1], this.angle+torchWidth+90, d);
        var c8 = toPolar(c6[0], c6[1], this.angle-torchWidth-90, d);

        stroke(0, 0, 0, 36);
        noFill();
        for (var i=2; i<24; i++) {
            strokeWeight(i);
            line(c0[0], c0[1], c5[0], c5[1]);
            line(c0[0], c0[1], c6[0], c6[1]);
            //strokeWeight(i*5);
            //ellipse(this.x, this.y, 800, 800);
        }

        fill(0, 0, 0);
        stroke(0, 0, 0);
        strokeWeight(1);
        quad(c0[0], c0[1], c1[0],c1[1], c7[0],c7[1], c5[0],c5[1]);
        quad(c0[0], c0[1], c2[0],c2[1], c8[0],c8[1], c6[0],c6[1]);
        quad(c1[0], c1[1], c2[0], c2[1], c4[0], c4[1], c3[0], c3[1]);
        
        // Person
        fill(255, 0, 0);
        noStroke();
        ellipse(x, y, 16, 16);
    };
    
    this.move = function() {
         var c = toPolar(this.x, this.y, this.angle, this.speed);
         if (c[0] > tile_size && c[0] < map_width) {
             this.x = c[0];
         }

         if (c[1] > tile_size && c[1] < map_height) {
             this.y = c[1];
         }
    };
};

var Creature = function(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 4;
    
    this.draw = function() {
        translate(this.x - cameraX + 200, this.y - cameraY + 200);
        rotate(-this.angle);
        image(MONSTER, -30, -55);
        resetMatrix();
    };
    
    this.move = function() {
         var c = toPolar(this.x, this.y, this.angle, this.speed);
         
         if (random() < 0.08) {
             this.angle += 50 * (random() - 0.5);
         }
         
         if (c[0] > tile_size && c[0] < map_width) {
             this.x = c[0];
         } else {
             if (random() < 0.5) {
                 this.angle += 100;
             } else {
                 this.angle += 100;
             }
         }

         if (c[1] > tile_size && c[1] < map_height) {
             this.y = c[1];
         } else {
             if (random() < 0.5) {
                 this.angle += 100;
             } else {
                 this.angle += 100;
             }
         }
    };
};

var drawGround = function() {
    background(0, 0, 0);
    scale(1/TILE_SCALE, 1/TILE_SCALE);
    var dx = GRASS.width;
    var dy = GRASS.height;
    
    var sx = (200 - cameraX) * TILE_SCALE;
    var sy = (200 - cameraY) * TILE_SCALE;
    
    for (var i=0; i<map1.length; i++) {
        var y = i*dy/2 + sy;
        if (y < -dy*TILE_SCALE || y > 400*TILE_SCALE) {
            continue;
        }
        
        for (var j=0; j<map1[0].length; j++) {
            var x = j*dx + sx;
            if (x < -dx*TILE_SCALE || x > 400*TILE_SCALE) {
                continue;
            }
            image(tiles[map1[i][j]], x, y);
        }
    }
    
    resetMatrix();
};

var person = new Person(cameraX, cameraY, 0);
var monsters = [
    new Creature(650, 100, 0),
    new Creature(600, 100, 90),
    new Creature(550, 100, 180)
];

var keyHandling = function() {
    if (keys[UP] || keys[87]) { person.move(); }
    if (keys[LEFT] || keys[65]) { person.angle += 4; }
    if (keys[RIGHT] || keys[68]) { person.angle -= 4; }
    if (keys[DOWN] || keys[83]) {
        person.angle += 180;
        keys[DOWN] = false;
        keys[83] = false;
    }
};

var panCamera = function() {
    var target = toPolar(person.x, person.y, person.angle, 160);
    cameraX += (target[0] - cameraX) * cameraSpeed;
    cameraY += (target[1] - cameraY) * cameraSpeed;
};

var draw = function() {
     drawGround();
     for (var m in monsters) {
         monsters[m].move();
         monsters[m].draw();
     }
     person.draw();
     keyHandling();
     panCamera();
};
