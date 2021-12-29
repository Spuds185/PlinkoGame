/*
    Micah Richard
    9/21/2021
    PlinkoMain.js
*/

/*
 * Setting the Canvas size
 */
//This file will be generating the game
const canvas = document.querySelector('canvas');

//make the canvas as big as the window it is in
canvas.width = 800;
canvas.height = 750;

//context for what goes on the canvas
const context = canvas.getContext('2d');

//functions for random colors and random ranges
function randomIntFromRange(min, max){
    return Math.floor(Math.random() * (max - min + 1 ) + min);
}

function randomColor(colors){
    return colors[Math.floor(Math.random() * colors.length)];
}

const colors = [
    '#0062ff',
    '#00fbff',
    '#00ff6a',
    '#40ff00',
    '#bbff00',
    '#fbff00',
    '#ff9500',
    '#ff4000',
    '#ff00dd'
];

var PlayerHP = 100;
var MonsterHP = 100;
var damage = 0;
var game;
var gravity = 1;
var frictoin = 0.90;
var ballx = undefined;
var bally = undefined;
/********Make a goalarea
 * and a start possision*********/
/********Goal Object*********/
function Goal(x,y,w,h,color){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.velocity = {
        x: 0,
        y: 0
    };
    this.color = color;

    this.draw = function(){
        context.beginPath();
        context.fillStyle = color;
        context.fillRect(this.x, this.y,this.w,this.h);  
        context.fill();
        context.stroke();
        context.closePath();
    };

    this.update = function(){
        this.draw();
    };

}
/****Start Position Object*****/
function StartPos(x,y,w,h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.draw = function(){
        context.beginPath();
        context.fillStyle = "#376299";
        context.fillRect(this.x, this.y,this.w,this.h);
        context.fill();
        context.stroke();
        context.closePath();
    };

    this.update = function(){
        this.draw();
    };

}

/******Score Object for damage and HP*******/
function Score(x,y,text){
    this.x = x;
    this.y = y;
    this.text = text;

    this.draw = function(){
        context.font = "20px Verdana";
        
        if(this.text == "damage"){
            gameover();
            context.fillStyle = '#ff1100';
            if(PlayerHP !== 0 || MonsterHP !== 0) {
                context.fillText("DAMAGE: " + Math.round(damage/3),this.x,this.y, 500);
            }
        }
        if(this.text == "player"){
            context.fillStyle = "#32a852";
            context.fillText("PlayerHP: " + PlayerHP,this.x,this.y, 500);   
        }
        if(this.text == "monster"){
            context.fillStyle = '#ff0051';
            context.fillText("MonsterHP: " + MonsterHP,this.x,this.y, 500);
        }
        if(this.text == "Game"){
            context.fillStyle = '#00f7be';
            if(PlayerHP <= 0 || MonsterHP <= 0){
                context.fillText(game,this.x,this.y,500);
            }
            else{
                context.fillText("",this.x,this.y,500);
            }
        }
    };
    this.update = function(){
        this.draw();
    }

}


/*********Peg Object**********/
function Peg(x,y,r,color){
    this.x = x;
    this.y = y;
    this.r = r;
    this.mass = 1;
    this.velocity = {
        x: 0,
        y: 0
    };
    this.color = color;

    this.draw = function(){
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(this.x, this.y,this.r,0,Math.PI * 2,false);
        context.fill();
        context.stroke();
        context.closePath();
    };

    this.update = function(){
        this.draw();
    };

}



/*creating a ball object. this is for many balls on screen with easier code*/
function Ball(x,y,velocity ,radius, color){
    this.x = x;
    this.y = y;
    //putting x and y into velocity calculations
    this.velocity = {
        x: randomIntFromRange(-3,3),
        y: randomIntFromRange(-3,3)
    };
    this.radius = radius;
    this.mass = 1;
    this.color = color;

    this.draw = function(){
        //starts a new shape
        context.beginPath();
        //makes shape a circle
        context.arc(this.x,this.y,this.radius,0,Math.PI * 2 , false);
        //gives a color to the shape
        context.fillStyle = this.color;
        //fills the shape with the color
        context.fill();
        // stroke outlines the object
        context.stroke();
        //draws a L shape and then finishes the shape as a tiangle. this is used for distance I think
        context.closePath();
    };
    //ball to wall colosion
    this.wallhit = walls =>{
        for(var i = 0; i < walls.length; i++){
            for(var j = walls[i].y; j < walls[i].y + 1000; j++){  
                if(getDistance(this.x,this.y, walls[i].x,j) - (this.radius * 2) <= 0 && this.x - this.radius <= walls[i].x ){
                    this.velocity.x = -this.velocity.x * frictoin; 
                 }
            }

        }
    };

    /*******************this finds which goal you landed in and deals damage*********************/
    this.goalhitgood = goalgood =>{
        gameover();
        for(var i = 0; i < goalgood.length; i++){
            if(this.x >= goalgood[i].x && this.x <= goalgood[i].x + goalgood[i].w && this.y > goalgood[i].y){
                if(MonsterHP != 0){
                    MonsterHP = MonsterHP - (Math.round(damage/3));
                    damage = 0;
                }
                else
                    ballAmount = 100;   
            }
        }
    }
    this.goalhitbad = goalbad => {
        gameover();
        for(var i = 0; i < goalbad.length; i++){
            if(this.x >= goalbad[i].x && this.x <= goalbad[i].x + goalbad[i].w && this.y > goalgood[i].y){
                if(PlayerHP != 0){
                    PlayerHP = PlayerHP - (Math.round(damage/3));
                    damage = 0;
                }
                else
                    ballAmount = 100;
            }
        }
    }
    //physics are being done with this function
    this.update = pegs => {
        //keeps the ball from falling off the bottom or out the top
        if(this.y + this.radius + this.velocity.y > canvas.height || this.y - this.radius <= 0){
            this.velocity.y = -this.velocity.y * frictoin;
        }
        else{
            this.velocity.y += gravity;
        }
        //keeps the balls from falling off the sides
        if(this.x + this.radius + this.velocity.x > canvas.width || this.x - this.radius <= 2){
            this.velocity.x = -this.velocity.x * frictoin;
        }
        //this is to set up new spawn and goal tracking
        getBallLocation(this.y);
        // this for loop checks distance from ball to peg
        for(var i = 0; i < pegs.length; i++){
            //if the ball tougches a peg physics happens
            if(getDistance(this.x,this.y,pegs[i].x,pegs[i].y) - (this.radius * 2) + (pegs[i].r * 2) <= 0){
                resolveCollision(this, pegs[i]);
                this.color = randomColor(colors);
                this.velocity.y -= 0.05;
                damage++;
            }
        }
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.draw();
    };
}

/*******************end screen for when a player or monster HP is 0*********************/
function gameover(){
    if(PlayerHP <= 0){
        game = "GAME OVER";
        PlayerHP = 0;
    }
    if(MonsterHP <= 0){
        game = "YOU WIN!";
        MonsterHP = 0;
    }
}

/**
 * Rotates coordinate system for velocities
 *
 * Takes velocities and alters them as if the coordinate system they're on was rotated
 *
 * @param  Object | velocity | The velocity of an individual particle
 * @param  Float  | angle    | The angle of collision between two objects in radians
 * @return Object | The altered x and y velocities after the coordinate system has been rotated
 */

 function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}
/**
 * Swaps out two colliding particles' x and y velocities after running through
 * an elastic collision reaction equation
 *
 * @param  Object | particle      | A particle object with x and y coordinates, plus velocity
 * @param  Object | otherParticle | A particle object with x and y coordinates, plus velocity
 * @return Null | Does not return a value
 */

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}
/***************************getting the distance from objects to create colision********************************/

function getDistance(x1,y1,x2,y2){
    let xDistance = x2 - x1;
    let yDistance = y2 - y1;

    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

//get's the balls location to check if the user can spawn a new ball or not
function getBallLocation(y){
    if(y > goalarea.y){
        ballAmount = 0;
        return true;
    }
    else{
        return false;
    }
}
//*******************creating a ball when clicking*************************/
var ballAmount = 0;
//This function get where the user clicked
function getClickPos(event){
    // grab the users canvas so the size matches
    var rect = canvas.getBoundingClientRect();
    ballx = event.clientX - rect.left; //location on user window based on X cords
    bally = event.clientY - rect.top; //lcation on user window based on Y cords
}

//click event
$("#canvas").click(function(e){
    getClickPos(e);
});

//click event that only lets the player click in the startPos and won't let you click again until your ball reaches the bottom of the screen
addEventListener("click" , function(){
    if(ballx > (canvas.width / 2) - 150 && ballx < 650 && bally <= 100 && bally > 15 ){
        if(ballAmount < 1){
            ballAmount++;
            damage = 0;
            init();
        }
    }
});

//************************under this will be physics added to the ball**********************/
// init starts off the animations and physics as the game goes
var goalarea;
var goalgood;
var goalbad;
var walls;
var pegs;
var pegx = 50;
var pegy = 150;
var startpos;
var ballArray;
var RenDamage;
var RenPlayerHP;
var RenMonsterHP;
var RenGame;
var wallarray;

function init() {
    //making a damage score render on canvas
    RenGame = new Score((canvas.width/2),(canvas.height/2),"Game");
    RenDamage = new Score((canvas.width/2)/1.5,130,"damage");
    RenPlayerHP = new Score(10,50,"player");
    RenMonsterHP = new Score((canvas.width - 230), 50,"monster");
    //making a ball
    ballArray = [];
    for(var i = 0; i < 1; i++){
        var x = ballx;
        var y = bally;
        var size = 15;
        var color = randomColor(colors);
        ballArray.push(new Ball(x, y, undefined, size, color));
    }   
    //making a start possition
    startpos = new StartPos((canvas.width / 2) - 150, 0, 300,100, "#376299");
    //making the pegs array
    pegs = [];
    for(var i = 0; i < 10; i++){
        pegy += 50;
        pegx = 50;
        pegs.push(new Peg(pegx, pegy, 5,"#e6b83c"));
        for(var j = 0; j < 11; j++){
            pegx += 70;
            pegs.push(new Peg(pegx, pegy, 5,"#e6b83c"));
        }
    }
    pegy = 125;
    pegx = 15;
    for(var i = 0; i < 10; i++){
        pegy += 50;
        pegx = 15;
        pegs.push(new Peg(pegx, pegy, 5,"#00ff44"));
        for(var j = 0; j < 11; j++){
            pegx += 70;
            pegs.push(new Peg(pegx, pegy, 5, "#00ff44"));
        }
    }
    pegy = 150;
    //making the goals and walls
    goalgood = [];
    goalbad = [];
    walls = [];
    //wall layout
    walls.push(new Goal(48,canvas.height - 100,3,100,'#373838'));
    walls.push(new Goal(118,canvas.height - 100,3,100,'#373838'));
    walls.push(new Goal(188,canvas.height - 100,3,100,'#373838'));
    walls.push(new Goal((canvas.width/2)-71,canvas.height - 100,3,100,'#373838'));
    walls.push(new Goal((canvas.width/2) + 71,canvas.height - 100,3,100,'#373838'));
    walls.push(new Goal(609,canvas.height - 100,3,100,'#373838'));
    walls.push(new Goal(679,canvas.height - 100,3,100,'#373838'));
    walls.push(new Goal(749,canvas.height - 100,3,100,'#373838'));
    //goals that are good for the player
    goalgood.push(new Goal(0,canvas.height - 100,50,100,'#00fff7'));
    goalgood.push(new Goal(120,canvas.height - 100,70,100,'#00fff7'));
    goalgood.push(new Goal((canvas.width/2)-71,canvas.height - 100,142,100,'#00fff7'));
    goalgood.push(new Goal(610,canvas.height - 100,70,100,'#00fff7'));
    goalgood.push(new Goal(750,canvas.height - 100,70,100,'#00fff7'));
    //goals that are bad for the player
    goalbad.push(new Goal(680,canvas.height - 100,70,100,'#eb4034'));
    goalbad.push(new Goal(470,canvas.height - 100,142,100,'#eb4034'));
    goalbad.push(new Goal(190,canvas.height - 100,142,100,'#eb4034'));
    goalbad.push(new Goal(50,canvas.height - 100,70,100,'#eb4034'));

    goalarea = new Goal(0, canvas.height - 100, canvas.width,100,'#37ba23');
}

//Animation
function animation() {
    //gets next frame
    requestAnimationFrame(animation);
    //this gets a fresh frame. stops smearing
    context.clearRect(0,0, canvas.width, canvas.height);
        //this for loop handles every ball that gets made inside of the ball array
        RenDamage.update();
        RenPlayerHP.update();
        RenMonsterHP.update();
        
        goalarea.update();
        startpos.update();    
        for(var i = 0; i < goalgood.length; i++){
            goalgood[i].update();
        }
        for(var i = 0; i < goalbad.length; i++){
            goalbad[i].update();
        }
        for(var i = 0; i < walls.length; i++){
            walls[i].update();
        }  
        for(var i = 0; i < pegs.length; i++){
            pegs[i].update();
        }
        for(var i = 0; i < ballArray.length; i++){
            ballArray[i].update(pegs);
            ballArray[i].wallhit(walls);
            ballArray[i].goalhitgood(goalgood);
            ballArray[i].goalhitbad(goalbad);
        }
        RenGame.update();
}
init();
animation();