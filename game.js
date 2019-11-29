const width = 160;
const height = 50;
const dungeonTile = ".";
const chestTile = "C";
const foeTile = "F";
const playerTile = "@";
const defaultColor = "#EEE";
const dungeonColor = "#FFF";
const chestColor = "#0BB5FF";
const foeColor = "#ffc0cb";
const playerColor = "#FF0";
const chestNumber = 10;
const foeNumber = 10;
const noChestMessage = "There is no chest here!";
const winItemMessage = "Hooray! You found the winning chest!";
const emptyChestMessage = "This chest is empty :-(";

var Game = {
    display: null,
    engine: null,
    init: function() {
        this.display = new ROT.Display({width: width, height: height});
        document.body.appendChild(this.display.getContainer());
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
    foe: null
};

Game._generateMap = function() {
    var digger = new ROT.Map.Rogue(width, height);
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

    this.player = this._createPlayer(freeCells);

    this.foe = this._createNPC(Foe, freeCells);
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
    for (var i = 0; i < chestNumber; i++) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        this.map[key] = chestTile;
        if (!i) { this.winItem = key; }
    }
};

Game._createPlayer = function(freeCells) {
    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var key = freeCells.splice(index, 1)[0];
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    this.player = new Player(x, y);
};

Game._createNPC = function(what, freeCells) {
    var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var key = freeCells.splice(index, 1)[0];
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    return new what(x, y);
};

var Player = function(x, y) {
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
    keyMap[ROT.KEYS.VK_NUMPAD8] = 0;
    keyMap[ROT.KEYS.VK_NUMPAD9] = 1;
    keyMap[ROT.KEYS.VK_NUMPAD6] = 2;
    keyMap[ROT.KEYS.VK_NUMPAD3] = 3;
    keyMap[ROT.KEYS.VK_NUMPAD2] = 4;
    keyMap[ROT.KEYS.VK_NUMPAD1] = 5;
    keyMap[ROT.KEYS.VK_NUMPAD4] = 6;
    keyMap[ROT.KEYS.VK_NUMPAD7] = 7;

    var code = e.keyCode;

    if (code == ROT.KEYS.VK_RETURN || code == ROT.KEYS.VK_SPACE) {
        this._checkChest();
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
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
};

Player.prototype._checkChest = function() {
    var key = this._x + "," + this._y;
    if (Game.map[key] != chestTile) {
        alert(noChestMessage);
    } else if (key == Game.winItem) {
        alert(winItemMessage);
        Game.engine.lock();
        window.removeEventListener("keydown", this);
    } else {
        alert(emptyChestMessage);
    }
};

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
