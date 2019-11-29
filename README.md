# Rotten-GameOff2019
## Rotten
### A Browser-based JavaScript Roguelike game using rot.js
Started at approximately 2019-11-29T0916+10 for Game Off 2019

![alt text](https://github.com/IronWill79/Rotten-GameOff2019/raw/master/images/Rotten-GameOff2019v0.01.png "Rotten v0.01 screenshot")
---
The theme is **'Leaps and Bounds'**. Keywords are **'evolve'**, **'leap'**, **'bounds'**, **'changing or moving rapidly'**, **'2020'**.

---
My avatar **'evolves'** by leveling up.

Corridors and rooms may have fall traps that require you to **'jump'** over them once triggered.

**'Bounds'** are the walls.

I'll have some corridors that are covered in ice, so when you move onto them, you **'move rapidly'** until you get off the end of the ice patch, or run into an enemy or NPC.

---
### Story
* You are Rotten, a zombie on the Day of the Dead that has to find a potion to restore their humanity
---
### Installation

1. `git clone https://github.com/IronWill79/Rotten-GameOff2019`
2. In any modern browser, open the `Index.html` file within the `Rotten-GameOff2019` folder
3. Read **Legend** below to know what you're looking at
4. Read **Controls** below to know how to control yourself
5. The aim is to find the **Chest** with the **Winning Item** in it
6. Have fun :)
---
### Legend

* **@** - Player
* **C** - Chest. One of these has the winning item.
* **F** - Foe. They will 'chase' you down.
---
### Controls

* The 8 directions are the numpad keys with NumLock on
* Open a Chest while standing on that tile with Return or Spacebar
---
### TODOs

* Add other directional keys such as `IOP;/.,K` for users without a full sized keyboard  
* Add ability to remap controls  
* Rework into ES2015 modules using `<script type="module" src="https://github.com/ondras/rot.js/raw/master/lib/index.js">`  
* Change to graphical mode after creating some graphics