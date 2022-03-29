
const UP = {x : 0, y : 1};
const DOWN = {x : 0, y : -1};
const LEFT = {x : -1, y : 0};
const RIGHT = {x : 1, y : 0};;

new UpdateableTileType('horizontalMovingKillTiles', [255,174,200], {
	onLoad: (kt) => {
		let sprite = PIXI.Sprite.from('images/enemys.png');
		sprite.x = TILESIZE * kt.x;
		sprite.y = TILESIZE * kt.y;
		GAME.level.addChild(sprite);

		return {
			x: kt.x * TILESIZE,
			y: kt.y * TILESIZE,
			sprite: sprite,
			
			Direction : RIGHT,
			Speed : 0.35
		};
	},
	uiInit: ()=> {
		//lives number text
		GAME.ui.lives = new PIXI.Text('3',{fontFamily :"Press Start 2P", fontSize: 8, fill : 0xffffff, align : 'left'});
		GAME.ui.addChild(GAME.ui.lives);
		GAME.currentMap.lives = 3;
	},
	uiUpdate: ()=> {
		GAME.ui.lives.text = GAME.currentMap.lives;
	},
	onUpdate: (obj, delta)=> {
		const newXpos = obj.sprite.x + (delta * obj.Direction.x * obj.Speed);
		if(isFree(newXpos, obj.y)){
			obj.x = newXpos;
			obj.sprite.x = newXpos;
		}
		else{
			obj.Direction.x *= -1;
		}
	}
});

new CollisionType('horizontalMovingKillTiles', 'rect', OnKillTileCollision);
