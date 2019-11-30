const NUMPAD_PLUS = 107;
const NUMPAD_MINUS = 109;
const defaultFontSize = 16;
const oldSchoolFontSize = 12;
const fontSizes = [
    10, 11, 12, 14, 16, 18, 24
];
const cellWidth = 4;
const cellHeight = 4;
const roomWidthMin = 4;
const roomWidthMax = 8;
const roomWidth = [roomWidthMin, roomWidthMax];
const roomHeightMin = 4;
const roomHeightMax = 8;
const roomHeight = [roomHeightMin, roomHeightMax];
const dungeonWidth = 90;
const dungeonHeight = 48;
const uiWidth = 54;
const uiHeight = 48;
const uiLeftMargin = 0;
const uiCenterPosition = uiWidth / 2;
const uiRightMargin = uiWidth - 2;
const uiCenterJustify = function(text) {
    return uiCenterPosition - (text.length / 2) - 1;
};
const uiRightJustify = function(text) {
    return uiRightMargin - text.length;
};
const titleMargin = 3;
const titleLine = 3;
const statusLine = 6;
const chestLine = 8;
const gameOverLine = 15;
const dungeonTile = ".";
const chestTile = "C";
const foeTile = "V";
const playerTile = "@";
const defaultColor = "white";
const dungeonColor = "goldenrod";
const chestColor = "#4060FE";
const foeColor = "red";
const playerColor = "#40FE5A";
const numChests = 10;
const foeName = "Vision";
const playerHealth = 20;
const noChestMessage = "There is no chest here!";
const winItemMessage = "Hooray! You found the winning chest!";
const emptyChestMessage = "This chest is empty :-(";
const welcomeMessage = "Welcome to Rotten";
const gameOverMessage = `Game over - 'Caught' by ${foeName}`;
const statusMessages = [
    `Please look for the potion, and avoid ${foeName}`,
    `The ${foeName} is in this room`,
    `There is a chest in this room`,
    `There is a chest and ${foeName} in this room`
];
const topologyOption = 4;
let currentFontSize = 2;

var Game = {
    fontSize: defaultFontSize, // 12 is around 1024x768 screen
    display: null,
    mapDisplay: null,
    uiDisplay: null,
    engine: null,
    init: function() {
        this.display = new ROT.Display({ width: dungeonWidth, height: dungeonHeight, fontSize: fontSizes[currentFontSize] });
        document.getElementById('map').appendChild(this.display.getContainer());
        this.uiDisplay = new ROT.Display({ width: uiWidth, height: uiHeight, fontSize: fontSizes[currentFontSize] });
        document.getElementById('ui').appendChild(this.uiDisplay.getContainer());
        this.drawUI();
        this._generateMap();

        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);
        scheduler.add(this.foe, true);
        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
    },
    map: {},
    player: null,
    winItem: null,
    foe: null,
    statusID: 0,
};

Game.drawUI = function() {
    this.uiDisplay.clear();
    this.uiDisplay.drawText(uiCenterJustify(welcomeMessage), titleLine, welcomeMessage);
    this.uiDisplay.drawText(uiCenterJustify(statusMessages[this.statusID]), statusLine, statusMessages[this.statusID]);
};

Game._generateMap = function() {
    var digger = new ROT.Map.Rogue(dungeonWidth, dungeonHeight, {
        cellWidth: cellWidth,
        cellHeight: cellHeight,
        roomWidth: roomWidth,
        roomHeight: roomHeight
    });
    var freeCells = [];

    var digCallback = function(x, y, value) {
        if (value) { return; }      /* Do not store walls */

        var key = x + "," + y;
        freeCells.push(key);
        this.map[key] = dungeonTile;
    }
    digger.create(digCallback.bind(this));

    this._generateChests(freeCells);

    this._drawWholeMap();

    this.player = this._createBeing(Player, freeCells);

    this.foe = this._createBeing(Foe, freeCells);
};

Game._drawWholeMap = function() {
    for (var key in this.map) {
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        this.display.draw(x, y, this.map[key], this._colorizeTile(this.map[key]));
    }
};

Game._colorizeTile = function(c) {
    switch (c) {
        case dungeonTile:
            return dungeonColor;
            break;
        case chestTile:
            return chestColor;
            break;
        case foeTile:
            return foeColor;
            break;
        default:
            return defaultColor;
            break;
    }
};

Game._generateChests = function(freeCells) {
    for (var i = 0; i < numChests; i++) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        this.map[key] = chestTile;
        if (!i) { this.winItem = key; }
    }
};

Game._createBeing = function(what, freeCells) {
    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var key = freeCells.splice(index, 1)[0];
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    return new what(x, y);
};

Game.biggerText = function() {
    if (currentFontSize != 6) {
        currentFontSize++;
    };
    this.display.setOptions({ fontSize: fontSizes[currentFontSize] });
    this.uiDisplay.setOptions({ fontSize: fontSizes[currentFontSize] });
};

Game.smallerText = function() {
    if (currentFontSize != 0) {
        currentFontSize--;
    };
    this.display.setOptions({ fontSize: fontSizes[currentFontSize] });
    this.uiDisplay.setOptions({ fontSize: fontSizes[currentFontSize] });
};

var Player = function(x, y) {
    this.health = playerHealth;
    this.chestMessage = false;
    this._x = x;
    this._y = y;
    this._avatar = playerTile;
    this._color = playerColor;
    this._draw();
};

Player.prototype._draw = function() {
    Game.display.draw(this._x, this._y, this._avatar, this._color);
};

Player.prototype.act = function() {
    Game.engine.lock();
    /* wait for user input; do stuff when user hits a key */
    window.addEventListener("keydown", this);
};

Player.prototype.handleEvent = function(e) {
    /* process user input */
    var keyMap = {};
    keyMap[ROT.KEYS.VK_W] = 0;
    keyMap[ROT.KEYS.VK_NUMPAD8] = 0;
    keyMap[ROT.KEYS.VK_UP] = 0;
    keyMap[ROT.KEYS.VK_E] = 1;
    keyMap[ROT.KEYS.VK_NUMPAD9] = 1;
    keyMap[ROT.KEYS.VK_PAGE_UP] = 1;
    keyMap[ROT.KEYS.VK_D] = 2;
    keyMap[ROT.KEYS.VK_NUMPAD6] = 2;
    keyMap[ROT.KEYS.VK_RIGHT] = 2;
    keyMap[ROT.KEYS.VK_C] = 3;
    keyMap[ROT.KEYS.VK_NUMPAD3] = 3;
    keyMap[ROT.KEYS.VK_PAGE_DOWN] = 3;
    keyMap[ROT.KEYS.VK_X] = 4;
    keyMap[ROT.KEYS.VK_NUMPAD2] = 4;
    keyMap[ROT.KEYS.VK_DOWN] = 4;
    keyMap[ROT.KEYS.VK_Z] = 5;
    keyMap[ROT.KEYS.VK_NUMPAD1] = 5;
    keyMap[ROT.KEYS.VK_END] = 5;
    keyMap[ROT.KEYS.VK_A] = 6;
    keyMap[ROT.KEYS.VK_NUMPAD4] = 6;
    keyMap[ROT.KEYS.VK_LEFT] = 6;
    keyMap[ROT.KEYS.VK_Q] = 7;
    keyMap[ROT.KEYS.VK_NUMPAD7] = 7;
    keyMap[ROT.KEYS.VK_HOME] = 7;

    var code = e.keyCode;

    if (code == ROT.KEYS.VK_RETURN || code == ROT.KEYS.VK_SPACE) {
        this._checkChest();
        return;
    }

    if (code == NUMPAD_PLUS || code == ROT.KEYS.VK_PLUS || code == ROT.KEYS.VK_EQUALS) {
        Game.biggerText();
        return;
    }

    if (code == NUMPAD_MINUS || code == ROT.KEYS.VK_HYPHEN_MINUS) {
        Game.smallerText();
        return;
    }

    if (!(code in keyMap)) { return; }

    var diff = ROT.DIRS[8][keyMap[code]];
    var newX = this._x + diff[0];
    var newY = this._y + diff[1];

    var newKey = newX + "," + newY;
    if (!(newKey in Game.map)) { return; } /* Cannot move in this direction */

    Game.display.draw(this._x, this._y, Game.map[this._x + "," + this._y]);
    this._x = newX;
    this._y = newY;
    this._draw();
    // if (this.chestMessage) {
    //     Game.display.clear();
    //     Game._drawWholeMap();
    //     Game.drawUI();
    //     this._draw();
    // }
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
};

Player.prototype._checkChest = function() {
    var key = this._x + "," + this._y;
    if (Game.map[key] != chestTile) {
        alert(noChestMessage);
        // Game.uiDisplay.drawText(uiLeftMargin, chestLine, noChestMessage);
        // this.chestMessage = true;
    } else if (key == Game.winItem) {
        alert(winItemMessage);
        // Game.uiDisplay.drawText(uiLeftMargin, chestLine, winItemMessage);
        Game.engine.lock();
        window.removeEventListener("keydown", this);
    } else {
        alert(emptyChestMessage);
        // Game.uiDisplay.drawText(uiLeftMargin, chestLine, emptyChestMessage);
        // this.chestMessage = true;
    }
};

Player.prototype.getX = function() { return this._x; };
Player.prototype.getY = function() { return this._y; };

var Foe = function(x, y) {
    this._x = x;
    this._y = y;
    this._foeTile = foeTile;
    this._foeColor = foeColor;
    this._draw();
};

Foe.prototype._draw = function() {
    Game.display.draw(this._x, this._y, this._foeTile, this._foeColor);
};

Foe.prototype.act = function() {
    var x = Game.player.getX();
    var y = Game.player.getY();
    var passableCallback = function(x, y) {
        return (x + "," + y in Game.map);
    };
    var astar = new ROT.Path.AStar(x, y, passableCallback, {topology: topologyOption});

    var path = [];
    var pathCallback = function(x, y) {
        path.push([x, y]);
    };
    astar.compute(this._x, this._y, pathCallback);

    path.shift();   /* remove Foe's position */
    if (path.length <= 1) {
        Game.engine.lock();
        Game.display.drawText(uiLeftMargin, gameOverLine, gameOverMessage);
    } else {
        x = path[0][0];
        y = path[0][1];
        Game.display.draw(this._x, this._y, Game.map[this._x + "," + this._y]);
        this._x = x;
        this._y = y;
        this._draw();
    }
};
