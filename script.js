let followWindow;

function openFollowPrompt() {
    followWindow = window.open('https://twitter.com/intent/follow?screen_name=ICN_Protocol', '', 'width=600,height=600');

    // Action-Button sichtbar machen
    document.getElementById('actionButton').style.display = 'inline-block';
    
    // Event Listener hinzufügen, um den Follow-Status zu überprüfen
    window.addEventListener('focus', checkFollowStatus);
}

function checkFollowStatus() {
    window.removeEventListener('focus', checkFollowStatus);

    if (followWindow && !followWindow.closed) {
        followWindow.close();
    }

    // Aktualisiere den Text des Action-Buttons
    document.getElementById('actionButton').innerText = 'Danke fürs Folgen!';
}

function showGame() {
    document.getElementById('game').style.display = 'block';
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('followSection').style.display = 'none'; // Verstecke den Follow-Bereich

    // Hier kannst du die Spiel-Logik initialisieren
    startGame();
}

// Spiel-Logik beginnt hier
const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

// Hier kannst du die Bilder laden und die Spiel-Initialisierung vornehmen
const doodlerImageLeft = new Image();
const doodlerImageRight = new Image();
const platformImage = new Image();
const backgroundImage = new Image();
const bulletImage = new Image();
doodlerImageLeft.src = 'pics/doodler-left.png';
doodlerImageRight.src = 'pics/doodler-right.png';
platformImage.src = 'pics/platform.png';
backgroundImage.src = 'pics/doodlejumpbg.png';
bulletImage.src = 'pics/bitcoin.png';

// Restliche Spiel-Logik hier...

// Restliche Spiel-Logik hier...


// Plattform und Spieler Physik
const platformWidth = 65;
const platformHeight = 20;
const platformStart = canvas.height - 50;
const gravity = 0.33;
const drag = 0.3;
const bounceVelocity = -12.5;
let minPlatformSpace = 15;
let maxPlatformSpace = 20;
let platforms = [{ x: canvas.width / 2 - platformWidth / 2, y: platformStart }];
let bullets = [];

// Zufallszahl-Generator
function random(min, max) {
    return Math.random() * (min - max) + max;
}

// Fülle den Bildschirm mit Plattformen
let y = platformStart;
while (y > 0) {
    y -= platformHeight + random(minPlatformSpace, maxPlatformSpace);

    let x;
    do {
        x = random(25, canvas.width - 25 - platformWidth);
    } while (
        y > canvas.height / 2 &&
        x > canvas.width / 2 - platformWidth * 1.5 &&
        x < canvas.width / 2 + platformWidth / 2
    );

    platforms.push({ x, y });
}

const doodle = {
    width: 40,
    height: 60,
    x: canvas.width / 2 - 20,
    y: platformStart - 60,
    dx: 0,
    dy: 0,
    currentImage: doodlerImageLeft
};

// Bullet Klasse
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 20;
        this.dy = -10;
    }

    update() {
        this.y += this.dy;
    }

    draw() {
        context.drawImage(bulletImage, this.x, this.y, this.width, this.height);
    }
}

let playerDir = 0;
let keydown = false;
let prevDoodleY = doodle.y;

function loop() {
    requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Hintergrund zeichnen
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Schwerkraft
    doodle.dy += gravity;

    if (doodle.y < canvas.height / 2 && doodle.dy < 0) {
        platforms.forEach(function (platform) {
            platform.y += -doodle.dy;
        });

        while (platforms[platforms.length - 1].y > 0) {
            platforms.push({
                x: random(25, canvas.width - 25 - platformWidth),
                y: platforms[platforms.length - 1].y - (platformHeight + random(minPlatformSpace, maxPlatformSpace))
            });

            minPlatformSpace += 0.5;
            maxPlatformSpace += 0.5;
            maxPlatformSpace = Math.min(maxPlatformSpace, canvas.height / 2);
        }
    } else {
        doodle.y += doodle.dy;
    }

    if (!keydown) {
        if (playerDir < 0) {
            doodle.dx += drag;
            if (doodle.dx > 0) {
                doodle.dx = 0;
                playerDir = 0;
            }
        } else if (playerDir > 0) {
            doodle.dx -= drag;
            if (doodle.dx < 0) {
                doodle.dx = 0;
                playerDir = 0;
            }
        }
    }

    doodle.x += doodle.dx;

    if (doodle.x + doodle.width < 0) {
        doodle.x = canvas.width;
    } else if (doodle.x > canvas.width) {
        doodle.x = -doodle.width;
    }

    // Plattformen zeichnen
    platforms.forEach(function (platform) {
        context.drawImage(platformImage, platform.x, platform.y, platformWidth, platformHeight);

        if (
            doodle.dy > 0 &&
            prevDoodleY + doodle.height <= platform.y &&
            doodle.x < platform.x + platformWidth &&
            doodle.x + doodle.width > platform.x &&
            doodle.y < platform.y + platformHeight &&
            doodle.y + doodle.height > platform.y
        ) {
            doodle.y = platform.y - doodle.height;
            doodle.dy = bounceVelocity;
        }
    });

    // Doodle zeichnen
    context.drawImage(doodle.currentImage, doodle.x, doodle.y, doodle.width, doodle.height);

    prevDoodleY = doodle.y;

    // Kugeln aktualisieren und zeichnen
    bullets.forEach(function (bullet, index) {
        bullet.update();
        bullet.draw();

        if (bullet.y + bullet.height < 0) {
            bullets.splice(index, 1);
        }
    });

    platforms = platforms.filter(function (platform) {
        return platform.y < canvas.height;
    });
}

document.addEventListener('keydown', function (e) {
    if (e.which === 37) { // Links
        keydown = true;
        playerDir = -1;
        doodle.dx = -3;
        doodle.currentImage = doodlerImageLeft;
    } else if (e.which === 39) { // Rechts
        keydown = true;
        playerDir = 1;
        doodle.dx = 3;
        doodle.currentImage = doodlerImageRight;
    } else if (e.which === 38) { // Oben (Schuss)
        bullets.push(new Bullet(doodle.x + doodle.width / 2 - 5, doodle.y));
    }
});

document.addEventListener('keyup', function () {
    keydown = false;
});

requestAnimationFrame(loop);
