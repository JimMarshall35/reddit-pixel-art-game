
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

//objec that holds all live game data
let GAME = {
	ready: false,
	app: new PIXI.Application({ 
		width: 640, 
		height: 360,
		roundPixels: true
	}),
	playerCollision: {},
	CollisionTypes: [],
	playerInTeleporterFlag: false
};

GAME.app.stage.scale.set(4)

//add to page
$('.game .view').appendChild(GAME.app.view); 


let elapsed = 0.0;

const SPEED = 1.25;	



function gameLoop (delta) {
	elapsed += delta;

	//initialize speed calculation
	let hspeed=0, vspeed=0, normalizer=1;

	if (!GAME.ready) return;

	//determing direction
	if (INPUT.KeyD) hspeed = 1;
	if (INPUT.KeyA) hspeed = -1;
	if (INPUT.KeyW) vspeed = -1;
	if (INPUT.KeyS) vspeed = 1;

	//determine normalizer (this makes diagonal speed slower to match horizontal/vertical speed)
	if (hspeed !== 0 && vspeed !== 0) normalizer = 0.7071;

	//calculate new player coordinates after moving
	let playerNewX = GAME.player.x + hspeed * SPEED * delta * normalizer;
	let playerNewY = GAME.player.y + vspeed  * SPEED * delta * normalizer;


	//calculate which spot on the grid the player is currently in
	let playerGridX = round(GAME.player.x/TILESIZE);
	let playerGridY = round(GAME.player.y/TILESIZE);
	
	//check if player is okay to move to these new coordinates
	if (isFree(playerNewX,playerNewY)) {
		//move player sprite
		GAME.player.x = playerNewX;
		GAME.player.y = playerNewY;
	}
	//player cannot move to that space
	else {

		//if you're not trying to move diagonally...
		if ((hspeed==0||vspeed==0)) {
			//...and the space in front of you is free
			if (!spaceHasWall(playerGridX+hspeed, playerGridY+vspeed)) {
				console.log('SMOOSHING',playerGridY,);
				//if the space to the left or right is free, smoosh the player vertically
				if (hspeed !== 0) 
					GAME.player.y = round((GAME.player.y + (playerGridY * TILESIZE))/2 ) //SMOOSH (move the player towards the center of the tile they're currently in)
				//if the space to the top or bottom is free, smoosh the player horiztonally
				if (vspeed !== 0) 
					GAME.player.x = round((GAME.player.x + (playerGridX * TILESIZE))/2 ) //SMOOSH (move the player towards the center of the tile they're currently in)
			}
		}

		//you are trying to move diagonally
		else {
			//if the player could still move one of the directions, do that (this makes it so you can go around corners moving diagonally)
			if (isFree(playerNewX,GAME.player.y)) GAME.player.x += hspeed * SPEED * delta ;
			if (isFree(GAME.player.x,playerNewY)) GAME.player.y += vspeed * SPEED * delta ;
		}
	}

	//check for collisions
	updatePlayerCollision();
	GAME.CollisionTypes.find(ct => ct.check());
	
	//if the player isnt moving, snap the players position to a pixel (as long as it wouldn't cause a collission)
	if (hspeed==0 && vspeed ==0) {
		let roundedX = round(GAME.player.x);
		let roundedY = round(GAME.player.y);
		if (isFree(roundedX,roundedY)) {
			GAME.player.x = roundedX;
			GAME.player.y = roundedY;
		}
	}

	//flip sprite based on hspeed 
	if (hspeed < 0 && GAME.player.sprite.scale.x==1) GAME.player.sprite.scale.set(-1,1);
	else if (hspeed > 0 && GAME.player.sprite.scale.x==-1) GAME.player.sprite.scale.set(1,1);

	//make the camera follow the player (smoothing the motion slightly with lerping)
	GAME.level.x = lerp(GAME.level.x, -GAME.player.x + (GAME.app.renderer.width / GAME.app.stage.scale.x / 2), 0.1);
	GAME.level.y = lerp(GAME.level.y, -GAME.player.y + (GAME.app.renderer.height / GAME.app.stage.scale.y / 2), 0.1);
	//TODO: Make camera stop at edges of maps

	//update ui (this could be done only when needed, but it probably doesnt take much to run every frame)
	GAME.tileTypes.forEach(type => type.uiUpdate());
	
	GAME.updateableTileTypes.forEach(type => type.update(delta));

	debug.onLoop();
};



//start game loop
GAME.app.ticker.add(gameLoop);