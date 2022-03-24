let components = []
let characters = []
let player, playerName, playerHP, playerSpeed, playerJumpSpeed, playerNameDisplayer, playerHPDisplayer, playerDirection
let enemy, enemyName, enemyHP, enemySpeed, enemyJumpSpeed, enemyNameDisplayer, enemyHPDisplayer, enemyDirection
let timeLeft, timeLeftDisplayer
let ground
let circle, circleSpeed, circleDirection

function start() {
    document.getElementById('filter').style.display = 'none'
    document.getElementById('play-button').style.display = 'none'
    gameArea.start()
    player = new Character('rect', 0, 200, 60, 60, 'red', true);
    do {
        playerName = prompt('Enter your name')
    }
    while (playerName == '' || !playerName);
    playerNameDisplayer = new Component('text', 0, 0, '20px', 'Consolas', 'red', true)
    playerHP = 10
    playerSpeed = 5
    playerJumpSpeed = 6.5
    playerHPDisplayer = new Component('text', 15, 45, '30px', 'Consolas', 'black', true)
    playerDirection = 'right'
    enemy = new Character('rect', gameArea.canvas.width - 20, 200, 60, 60, 'black', true);
    do {
        enemyName = prompt('Enter your enemy name')
    }
    while (enemyName == '' || !enemyName);
    if (playerName == enemyName) {
        playerName += ' (player)'
        enemyName += ' (enemy)'
    }
    enemyNameDisplayer = new Component('text', 0, 0, '20px', 'Consolas', 'black', true)
    enemyHP = 10
    enemySpeed = 3
    enemyJumpSpeed = 4.5
    enemyHPDisplayer = new Component('text', 15, 95, '30px', 'Consolas', 'black', true)
    enemyDirection = 'left'
    timeLeft = 60
    timeLeftDisplayer = new Component('text', gameArea.canvas.width - 250, 45, '30px', 'Consolas', 'black', true)
    ground = new Component('rect', 0, gameArea.canvas.height - 120, gameArea.canvas.width, 120, 'green', true)
    circle = new Component('circle', 0, 0, 10, undefined, 'black', true)
    circleSpeed = 10
    circleDirection = playerDirection
    active = true
    addComponent(false, ground)
    addComponent(false, playerNameDisplayer)
    addComponent(false, playerHPDisplayer)
    addComponent(false, enemyNameDisplayer)
    addComponent(false, enemyHPDisplayer)
    addComponent(false, timeLeftDisplayer)
    addComponent(true, player)
    addComponent(true, enemy)
}

let gameArea = {
    canvas: document.getElementById('canvas'),
    start: function () {
        this.ctx = this.canvas.getContext('2d')
        this.interval = setInterval(updateGameArea, 10);
        this.timeInterval = setInterval(() => {
            timeLeft--
        }, 1000);
        window.onkeydown = (event) => {
            gameArea.keys = (gameArea.keys || []);
            gameArea.keys[event.keyCode] = true
        }
        window.onkeyup = (event) => {
            gameArea.keys[event.keyCode] = false
        }
        window.addEventListener("visibilitychange", () => {
            if (timeLeft && playerHP && enemyHP) {
                if (document.visibilityState !== "visible")
                    pause()
            }
        });
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
        clearInterval(this.timeInterval);
    },
    continue: function () {
        this.interval = setInterval(updateGameArea, 10);
        this.timeInterval = setInterval(() => {
            timeLeft--
        }, 1000);
        document.getElementById('filter').style.display = 'none'
        document.getElementById('continue-button').style.display = 'none'
    },
}

function addComponent(isCharacter, component) {
    components.push(component)
    if (isCharacter)
        characters.push(component)
}
function deleteComponent(component) {
    if (components.indexOf(component) > -1) {
        components.splice(components.indexOf(component), 1)
        if (characters.indexOf(component) > -1)
            characters.splice(characters.indexOf(component), 1)
    }
}

function isComponent(component) {
    if (components.indexOf(component) > -1) return true
    else return false
}
class Component {
    constructor(type, x, y, width, height, color, fill) {
        this.ctx = gameArea.ctx
        this.type = type
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
        this.fill = fill
    }
    draw() {
        if (this.type == 'rect') {
            this.ctx.strokeStyle = this.color
            this.ctx.strokeRect(this.x, this.y, this.width, this.height);
            if (this.fill) {
                this.ctx.fillStyle = this.color;
                this.ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }
        if (this.type == 'image') {
            let image = new Image()
            image.src = `image/${this.color}`
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
        if (this.type == 'circle') {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI);
            this.height = this.width
            this.ctx.strokeStyle = this.color
            this.ctx.stroke();
            if (this.fill) {
                this.ctx.fillStyle = this.color
                this.ctx.fill();
            }
        }
    }
    clicked() {
        if (components.indexOf(this) > -1) {
            let myleft = this.x;
            let myright = this.x + (this.width);
            let mytop = this.y;
            let mybottom = this.y + (this.height);
            let clicked = false;
            if ((mybottom >= gameArea.mouseY) || (mytop <= gameArea.mouseY) || (myright >= gameArea.mouseX) || (myleft <= gameArea.mouseX)) {
                clicked = true;
            }
            return clicked;
        } else return false
    }
    touchWith(otherobj) {
        if (components.indexOf(this) > -1 && components.indexOf(otherobj) > -1) {
            let touch = true;
            let myleft = this.x;
            let myright = this.x + (this.width);
            let mytop = this.y;
            let mybottom = this.y + (this.height);
            let otherleft = otherobj.x;
            let otherright = otherobj.x + (otherobj.width);
            let othertop = otherobj.y;
            let otherbottom = otherobj.y + (otherobj.height);
            if ((mybottom < othertop) ||
                (mytop > otherbottom) ||
                (myright < otherleft) ||
                (myleft > otherright)) {
                touch = false;
            }
            return touch;
        } else return false
    }
}

class Character extends Component {
    constructor(type, x, y, width, height, color, fill) {
        super(type, x, y, width, height, color, fill)
        this.ctx = gameArea.ctx
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
    let background = new Component(type, 0, 0, gameArea.canvas.width, gameArea.canvas.height, color, true)
    background.draw()
}
function playSound(src, loop, volume) {
    let audio = new Audio(`sound/${src}`)
    audio.volume = volume / 100
    audio.loop == loop
    audio.play()
}
function pause() {
    document.getElementById('filter').style.display = 'flex'
    document.getElementById('continue-button').style.display = 'block'
    gameArea.stop()
}

function enemyAI() {
    if (enemy.x < player.x) {
        enemy.moveRight(enemySpeed)
        enemyDirection = 'right'
    }
    if (enemy.x > player.x) {
        enemy.moveLeft(enemySpeed)
        enemyDirection = 'left'
    }
    if (enemy.y > player.y)
        enemy.moveUp(enemyJumpSpeed)
    if (enemy.y < player.y)
        enemy.moveDown(enemyJumpSpeed)
    if (isComponent(circle)) {
        let distanceFromCircle
        if (enemy.x < circle.x) {
            distanceFromCircle = circle.x - (enemy.x + enemy.width)
        }
        if (enemy.x > circle.x) {
            distanceFromCircle = enemy.x - (circle.x + circle.width)
        }
        if (distanceFromCircle < 200)
            enemy.moveUp(enemyJumpSpeed)
    }
}

function resetStage() {
    player.x = 0
    player.y = 200
    enemy.x = gameArea.canvas.width - 60
    enemy.y = 200
    playerDirection = 'right'
    enemyDirection = 'left'
}

function updateGameArea() {
    if (player.touchWith(enemy)) {
        playSound('diesound.mp3', false, 100)
        resetStage()
        playerHP--
    }
    if (enemy.touchWith(circle)) {
        if (components.indexOf(circle) > -1)
            deleteComponent(circle)
        resetStage()
        enemyHP--
    }
    if (isComponent(circle)) {
        if (circleDirection == 'right')
            circle.x += circleSpeed
        else
            circle.x -= circleSpeed
        if (circle.x > gameArea.canvas.width || circle.x < 0)
            deleteComponent(circle)
    }
    player.speedX = 0;
    player.speedY = 0;
    if (keyDown(37)) {
        player.moveLeft(playerSpeed)
        playerDirection = 'left'
    }
    if (keyDown(39)) {
        player.moveRight(playerSpeed)
        playerDirection = 'right'
    }
    if (keyDown(38)) {
        player.moveUp(playerJumpSpeed)
    }
    if (keyDown(40)) {
        player.moveDown(playerJumpSpeed)
    }
    if (keyDown(27)) {
        pause()
    }
    if (keyDown(32)) {
        if (!isComponent(circle)) {
            circleDirection = playerDirection
            if (circleDirection == 'right')
                circle.x = player.x + player.width
            else
                circle.x = player.x
            circle.y = player.y + player.height / 2
            addComponent(false, circle)
        }
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
    gameArea.clear();
    drawBackground('rect', 'lightblue')
    components.map(component => {
        component.draw()
    })
    characters.map(character => {
        character.newPos()
    })
}
function keyDown(keyCode) {
    if (gameArea.keys && gameArea.keys[keyCode]) return true
    return false
}