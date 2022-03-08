let components = []
let objects = []
let player
let playerHP
let playerSpeed
let playerJumpSpeed
let playerHPDisplayer
let enemy
let enemyHP
let enemySpeed
let enemyJumpSpeed
let enemyHPDisplayer
let timeLeft
let timeLeftDisplayer
let ground

function start() {
    gameArea.start()
    player = new Object('rect', 0, 50, 20, 20, 'red');
    playerHP = 10
    playerSpeed = 2
    playerJumpSpeed = 2.5
    playerHPDisplayer = new Component('text', 5, 15, '10px', 'Consolas', 'black')
    enemy = new Object('rect', 270, 50, 20, 20, 'black');
    enemyHP = 10
    enemySpeed = 1
    enemyJumpSpeed = 1.5
    enemyHPDisplayer = new Component('text', 5, 35, '10px', 'Consolas', 'black')
    timeLeft = 60
    timeLeftDisplayer = new Component('text', 220, 15, '10px', 'Consolas', 'black')
    ground = new Component('rect', 0, 120, 300, 30, 'green')
    components.push(ground)
    components.push(playerHPDisplayer)
    components.push(enemyHPDisplayer)
    components.push(timeLeftDisplayer)
    objects.push(player)
    objects.push(enemy)

}

let gameArea = {
    canvas: document.getElementById('canvas'),
    start: function () {
        document.getElementById('filter').style.display = 'none'
        this.ctx = this.canvas.getContext('2d')
        // this.canvas.width = 300;
        // this.canvas.height = 150;
        this.interval = setInterval(updateGameArea, 10);
        this.timeInterval = setInterval(() => {
            timeLeft--
        }, 1000);
        window.onkeydown = (event) => {
            gameArea.keys = (gameArea.keys || []);
            gameArea.keys[event.keyCode] = (event.type == "keydown");
        }
        window.onkeyup = (event) => {
            gameArea.keys[event.keyCode] = (event.type == "keydown");
        }
        // this.canvas.onmousedown = (event) => {
        //     let rect = gameArea.canvas.getBoundingClientRect();
        //     gameArea.mouseX = event.clientX - rect.left;
        //     gameArea.mouseY = event.clientY - rect.top;
        //     console.log(gameArea.mouseX)
        //     console.log(gameArea.mouseY);;
        // }
    },
    clear: function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function () {
        clearInterval(this.interval);
    }
}

class Component {
    constructor(type, x, y, width, height, color) {
        this.ctx = gameArea.ctx
        this.type = type
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
        this.left = this.x;
        this.right = this.x + (this.width);
        this.top = this.y;
        this.bottom = this.y + (this.height);
    }
    draw() {
        if (this.type == 'rect') {
            this.ctx.fillStyle = this.color;
            this.ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        if (this.type == 'image') {
            let image = new Image()
            image.src = this.color
            image.onload = () => {
                this.ctx.drawImage(image, this.x, this.y, this.width, this.height);
            }
        }
        if (this.type == 'text') {
            this.ctx.font = this.width + " " + this.height;
            this.ctx.fillStyle = this.color;
            this.ctx.fillText(this.text, this.x, this.y);
        }
    }
    // clicked() {
    //     let myleft = this.x;
    //     let myright = this.x + (this.width);
    //     let mytop = this.y;
    //     let mybottom = this.y + (this.height);
    //     let clicked = true;
    //     if ((mybottom < gameArea.mouseY) || (mytop > gameArea.mouseY) || (myright < gameArea.mouseX) || (myleft > gameArea.mouseX)) {
    //         clicked = false;
    //     }
    //     return clicked;
    // }
}

class Object extends Component {
    constructor(type, x, y, width, height, color) {
        super(type, x, y, width, height, color)
        this.ctx = gameArea.ctx
        this.speedX = 0
        this.speedY = 0
        this.gravity = 0.05;
        this.gravitySpeed = 0;
    }
    newPos() {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        // this.y += this.speedY
        this.hitBottom()
        this.hitLeftSide()
        this.hitRightSide()
        enemyAI()
    }
    hitBottom() {
        if (this.y > 105) {
            this.y = 105;
            this.gravitySpeed = 0
        }
    }
    hitLeftSide() {
        let left = this.x
        if (left < 0) {
            this.x = 0
        }
    }
    hitRightSide() {
        let right = this.x + this.width
        if (right > 300) {
            this.x = 300 - this.width
        }
    }
    moveUp(speed) {
        this.speedY = -speed;
    }
    moveDown(speed) {
        this.speedY = speed;
    }
    moveLeft(speed) {
        this.speedX = -speed;
    }
    moveRight(speed) {
        this.speedX = speed;
    }
    touchWith(otherobj) {
        let myleft = this.x;
        let myright = this.x + (this.width);
        let mytop = this.y;
        let mybottom = this.y + (this.height);
        let otherleft = otherobj.x;
        let otherright = otherobj.x + (otherobj.width);
        let othertop = otherobj.y;
        let otherbottom = otherobj.y + (otherobj.height);
        let touch = true;
        if ((mybottom < othertop) ||
            (mytop > otherbottom) ||
            (myright < otherleft) ||
            (myleft > otherright)) {
            touch = false;
        }
        return touch;
    }
}

function drawBackground(type, color) {
    let background = new Component(type, 0, 0, gameArea.canvas.width, gameArea.canvas.height, color)
    background.draw()
}

function enemyAI() {
    if (enemy.x < player.x)
        enemy.moveRight(enemySpeed)
    if (enemy.x > player.x)
        enemy.moveLeft(enemySpeed)
    if (enemy.y > player.y)
        enemy.moveUp(enemyJumpSpeed)
    if (enemy.y < player.y)
        enemy.moveDown(enemyJumpSpeed)
}

function updateGameArea() {
    if (player.touchWith(enemy)) {
        player.x = 0
        player.y = 50
        enemy.x = 270
        enemy.y = 50
        playerHP--
    }
    gameArea.clear();
    drawBackground('rect', 'lightblue')
    player.speedX = 0;
    player.speedY = 0;
    if (gameArea.keys && gameArea.keys[37]) { player.moveLeft(playerSpeed) }
    if (gameArea.keys && gameArea.keys[39]) { player.moveRight(playerSpeed) }
    if (gameArea.keys && gameArea.keys[38]) { player.moveUp(playerJumpSpeed) }
    if (gameArea.keys && gameArea.keys[40]) { player.moveDown(playerJumpSpeed) }
    timeLeftDisplayer.text = `time left: ${timeLeft}`
    playerHPDisplayer.text = `player HP: ${playerHP}`
    enemyHPDisplayer.text = `enemy HP: ${enemyHP}`
    if (!timeLeft || !playerHP || !enemyHP)
        gameArea.stop()
    components.map(component => {
        component.draw()
    })
    objects.map(object => {
        object.newPos()
        object.draw()
    })
}