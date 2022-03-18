let components = []
let characters = []
let player, playerName, playerHP, playerSpeed, playerJumpSpeed, playerNameDisplayer, playerHPDisplayer
let enemy, enemyName, enemyHP, enemySpeed, enemyJumpSpeed, enemyNameDisplayer, enemyHPDisplayer
let timeLeft, timeLeftDisplayer
let ground

function start() {
    gameArea.start()
    player = new Character('rect', 0, 200, 60, 60, 'red', 'player');
    do {
        playerName = prompt('Enter your name')
    }
    while (playerName == '' || !playerName);
    playerNameDisplayer = new Component('text', 0, 0, '20px', 'Consolas', 'red')
    playerHP = 10
    playerSpeed = 5
    playerJumpSpeed = 6.5
    playerHPDisplayer = new Component('text', 15, 45, '30px', 'Consolas', 'black')
    enemy = new Character('rect', gameArea.canvas.width - 20, 200, 60, 60, 'black');
    do {
        enemyName = prompt('Enter your enemy name')
    }
    while (enemyName == '' || !enemyName);
    if (playerName == enemyName) {
        playerName += ' (player)'
        enemyName += ' (enemy)'
    }
    enemyNameDisplayer = new Component('text', 0, 0, '20px', 'Consolas', 'black')
    enemyHP = 10
    enemySpeed = 3
    enemyJumpSpeed = 4.5
    enemyHPDisplayer = new Component('text', 15, 95, '30px', 'Consolas', 'black')
    timeLeft = 60
    timeLeftDisplayer = new Component('text', gameArea.canvas.width - 250, 45, '30px', 'Consolas', 'black')
    ground = new Component('rect', 0, gameArea.canvas.height - 120, gameArea.canvas.width, 120, 'green')
    components.push(ground)
    components.push(playerNameDisplayer)
    components.push(playerHPDisplayer)
    components.push(enemyNameDisplayer)
    components.push(enemyHPDisplayer)
    components.push(timeLeftDisplayer)
    characters.push(player)
    characters.push(enemy)
    playSound('gametheme.mp3',true)
}

let gameArea = {
    canvas: document.getElementById('canvas'),
    start: function () {
        document.getElementById('filter').style.display = 'none'
        this.canvas.width = 1280
        this.canvas.height = 577
        this.ctx = this.canvas.getContext('2d')
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
        this.canvas.onmousedown = (event) => {
            gameArea.mouseX = event.clientX - gameArea.canvas.offsetLeft
            gameArea.mouseY = event.clientY - gameArea.canvas.offsetTop
        }
        this.canvas.onmouseup = () => {
            gameArea.mouseX = undefined
            gameArea.mouseY = undefined
        }
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
            if (this.width !== undefined && this.height !== undefined) {
                image.onload = () => {
                    this.ctx.drawImage(image, this.x, this.y, this.width, this.height);
                }
            } else {
                image.onload = () => {
                    this.ctx.drawImage(image, this.x, this.y);
                }
            }
        }
        if (this.type == 'text') {
            this.ctx.font = this.width + " " + this.height;
            this.ctx.fillStyle = this.color;
            this.ctx.fillText(this.text, this.x, this.y);
        }
    }
    clicked() {
        let myleft = this.x;
        let myright = this.x + (this.width);
        let mytop = this.y;
        let mybottom = this.y + (this.height);
        let clicked = false;
        if ((mybottom >= gameArea.mouseY) || (mytop <= gameArea.mouseY) || (myright >= gameArea.mouseX) || (myleft <= gameArea.mouseX)) {
            clicked = true;
        }
        return clicked;
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

class Character extends Component {
    constructor(type, x, y, width, height, color, name) {
        super(type, x, y, width, height, color)
        this.ctx = gameArea.ctx
        this.name = name
        this.speedX = 0
        this.speedY = 0
        this.gravity = 0.1;
        this.gravitySpeed = 0;
    }
    newPos() {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom()
        this.hitLeftSide()
        this.hitRightSide()
        enemyAI()
    }
    hitBottom() {
        if (this.y > ground.y - 30) {
            this.y = ground.y - 30;
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
        if (right > gameArea.canvas.width) {
            this.x = gameArea.canvas.width - this.width
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
}

function drawBackground(type, color) {
    let background = new Component(type, 0, 0, gameArea.canvas.width, gameArea.canvas.height, color)
    background.draw()
}
function playSound(src, loop) {
    let audio = new Audio(src)
    audio.play()
    audio.loop == loop
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
        playSound('diesound.mp3', false)
        player.x = 0
        player.y = 200
        enemy.x = gameArea.canvas.width - 20
        enemy.y = 200
        playerHP--
    }
    gameArea.clear();
    drawBackground('rect', 'lightblue')
    player.speedX = 0;
    player.speedY = 0;
    if (gameArea.keys && gameArea.keys[37]) {
        player.moveLeft(playerSpeed)
    }
    if (gameArea.keys && gameArea.keys[39]) {
        player.moveRight(playerSpeed)
    }
    if (gameArea.keys && gameArea.keys[38]) {
        player.moveUp(playerJumpSpeed)
    }
    if (gameArea.keys && gameArea.keys[40]) {
        player.moveDown(playerJumpSpeed)
    }
    timeLeftDisplayer.text = `time left: ${timeLeft}`
    playerNameDisplayer.text = playerName
    playerHPDisplayer.text = `${playerName} HP: ${playerHP}`
    enemyNameDisplayer.text = enemyName
    enemyHPDisplayer.text = `${enemyName} HP: ${enemyHP}`
    if (!timeLeft || !playerHP || !enemyHP)
        gameArea.stop()
    playerNameDisplayer.x = player.x
    playerNameDisplayer.y = player.y - 15
    enemyNameDisplayer.x = enemy.x
    enemyNameDisplayer.y = enemy.y - 15
    components.map(component => {
        component.draw()
    })
    characters.map(character => {
        character.newPos()
        character.draw()
    })
}