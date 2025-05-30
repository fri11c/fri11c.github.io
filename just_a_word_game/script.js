let SIZE = 500;// = Math.min(windowWidth, windowHeight);
const DESTROYING_TIME = 250;

const LONG_WORDS = [
    "incomprehensibilities", "indisciplinary", "biosignature", "inconsequential", "surreptitious", "hypothetically", "unmanageable", "collaborative", "implementation", "underdeveloped", "unavailingness", "misutilization", "lexicographist", "nontheoretical"
]

//Word types
const WORD_TYPES = {
    FALLING: 0,
    STANDING: 1,
    LONG: 2,
    VERY_LONG: 4,
    FLIP: 8,
    LETTER: 16,
};

let next_words = [];

let FALLING_SPEED = 0.00105; //px/ms
const SHOW_TIME = 1000; //ms
const SECOUND_SHOW_TIME = 500; //ms
let DOWN_TIME = 500; //ms

class Word {
    constructor(type, words) {
        this.text = '';

        if(type == WORD_TYPES.LETTER) {
            this.text = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
        }
        if((type & WORD_TYPES.VERY_LONG) != 0) {
            this.text = LONG_WORDS[Math.floor(Math.random() * LONG_WORDS.length)].toLowerCase();
        }
        else if(type != WORD_TYPES.LETTER) {
            this.text = next_words[0];
            next_words.splice(0, 1);
        }

        this.cur_index = 0;
        
        this.type = type;
        this.textWidth = textWidth(str(this.text));
        
        this.x = Math.random() * (SIZE - this.textWidth);
        //check if the word is in another words
        for(let i = 0; i < words.length; i++) {
            let word = words[i];
            if(this.x + this.textWidth > word.x && this.x < word.x + this.textWidth) {
                this.x = Math.random() * (SIZE - this.textWidth);
                i = -1;
            }
        }
        if(type == WORD_TYPES.LETTER) {
            this.y = SIZE / 10 - SIZE / 25;
        }
        if(type % 2 == WORD_TYPES.FALLING) {
            this.y = SIZE / 10 - SIZE / 25;
        }
        else if(type % 2 == WORD_TYPES.STANDING) {
            this.y = Math.random() * (SIZE / 3) + SIZE / 3;
        }
        
        this.destroyingTimer = -1;
        this.showingTimer = SHOW_TIME

        this.value = (this.type == WORD_TYPES.LETTER)? 2 : 64;
    }
    
    update(deltaTime) {
        this.destroyingTimer -= deltaTime;
        this.showingTimer -= deltaTime;
        if(this.type == WORD_TYPES.LETTER) {
            this.showingTimer = -1;
        }
        if(this.type % 2 == WORD_TYPES.FALLING) {
            this.y += FALLING_SPEED * deltaTime * ((this.destroyingTimer < 0)? 1 : (1 - this.destroyingTimer / DESTROYING_TIME) * 0.75);
        }
        if(this.type == WORD_TYPES.LETTER) {
            let dirx = rocket.x - this.x;
            let diry = rocket.y - this.y;
            let dist = Math.sqrt(dirx * dirx + diry * diry);
            dirx /= dist;
            diry /= dist;

            this.x += dirx * FALLING_SPEED * deltaTime;
            this.y += diry * FALLING_SPEED * deltaTime;
        }
        if(this.type % 2 == WORD_TYPES.STANDING) {
            this.x += Math.sin(millis() / 1000) * 0.06 * deltaTime;
        }
    }

    draw() {
        noStroke();
        fill(255);
        textAlign(LEFT, TOP)
        
        push();
        if(this.showingTimer > 0 && (this.type & WORD_TYPES.FLIP) != 0) {
            translate(this.x + this.textWidth / 2, this.y);
            scale(this.showingTimer / SHOW_TIME * -2 + 1, 1);
            translate(-this.x - this.textWidth / 2, -this.y);
        }
        text(this.text, this.x, this.y);
        pop();

        if(this.showingTimer < 0 && this.type != WORD_TYPES.LETTER) {
            fill(200);
            rect(this.x - 1 + textWidth(this.text.substring(0, this.cur_index)), this.y - 1, textWidth(this.text.substring(this.cur_index)) + 2, textAscent() + textDescent() + 2);
        }

        if(this.destroyingTimer > 0 && this.type != WORD_TYPES.LETTER) {
            fill(200, 200, 200, (this.destroyingTimer / DESTROYING_TIME) * 255);
            rect(this.x + textWidth(this.text.substring(0, this.cur_index - 1)), this.y - 1, textWidth(this.text.at(this.cur_index - 1)) + 2, 2 + (textAscent() + textDescent()));
        }
    }
}

let words = [];

class State {
    constructor(word_types, next_state, veldowm = false) {
        this.word_types = word_types;
        this.next_state = next_state;
        this.veldowm = veldowm;
    }
}

const STATES = [
    new State([], 1), //first
    new State([WORD_TYPES.FALLING, WORD_TYPES.STANDING], 2),
    new State([WORD_TYPES.FALLING, WORD_TYPES.FALLING], 3),
    new State([WORD_TYPES.FALLING, WORD_TYPES.FALLING | WORD_TYPES.LONG], 4),
    new State([WORD_TYPES.FALLING, WORD_TYPES.STANDING | WORD_TYPES.VERY_LONG], 5),
    new State([WORD_TYPES.LETTER, WORD_TYPES.LETTER, WORD_TYPES.LETTER, 
        WORD_TYPES.LETTER, WORD_TYPES.LETTER,], 6, true),

    new State([WORD_TYPES.FALLING, WORD_TYPES.FALLING], 7),
    new State([WORD_TYPES.FALLING, WORD_TYPES.FALLING | WORD_TYPES.FLIP], 8),
    new State([WORD_TYPES.FALLING | WORD_TYPES.LONG, WORD_TYPES.FALLING | WORD_TYPES.FLIP], 9),
    new State([WORD_TYPES.FALLING, WORD_TYPES.FALLING | WORD_TYPES.FLIP], 10),
    new State([WORD_TYPES.FALLING, WORD_TYPES.STANDING | WORD_TYPES.LONG], 11),
    new State([WORD_TYPES.STANDING | WORD_TYPES.VERY_LONG, WORD_TYPES.STANDING | 
        WORD_TYPES.VERY_LONG | WORD_TYPES.FLIP], 12),
    new State([WORD_TYPES.LETTER, WORD_TYPES.LETTER, WORD_TYPES.LETTER, 
        WORD_TYPES.LETTER, WORD_TYPES.LETTER, WORD_TYPES.LETTER, WORD_TYPES.LETTER,], 13, true),
            
    new State([WORD_TYPES.FALLING, WORD_TYPES.FALLING | WORD_TYPES.FLIP], 14),
    new State([WORD_TYPES.FALLING, WORD_TYPES.FALLING | WORD_TYPES.FLIP], 15),
    new State([WORD_TYPES.FALLING | WORD_TYPES.FLIP, WORD_TYPES.FALLING | WORD_TYPES.FLIP], 16),
    new State([WORD_TYPES.FALLING | WORD_TYPES.LONG, WORD_TYPES.FALLING | WORD_TYPES.FLIP], 17),
    new State([WORD_TYPES.STANDING, WORD_TYPES.FALLING | WORD_TYPES.FLIP], 18),
    new State([WORD_TYPES.FALLING | WORD_TYPES.FLIP, WORD_TYPES.FALLING | WORD_TYPES.FLIP], 19),
    new State([WORD_TYPES.LETTER, WORD_TYPES.LETTER, WORD_TYPES.LETTER, 
        WORD_TYPES.LETTER, WORD_TYPES.LETTER, WORD_TYPES.LETTER, WORD_TYPES.LETTER,], 20, true),
            
    new State([WORD_TYPES.VERY_LONG | WORD_TYPES.FALLING, WORD_TYPES.FALLING | WORD_TYPES.LONG], 21),
    new State([WORD_TYPES.VERY_LONG | WORD_TYPES.FALLING, WORD_TYPES.FALLING | WORD_TYPES.LONG], 6),
];

function newState() {
    state = STATES[state].next_state;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `https://random-word-api.vercel.app/api?words=${ STATES[state].word_types.length }`, true);
    xhr.responseType = "json";
    xhr.send(null);
    xhr.onload = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            const data = xhr.response;
            next_words = data.map(word => word.toLowerCase());

            words = [];
            
            STATES.at(state).word_types.forEach(word_type => {
                words.push(new Word(word_type, words));
            });
        } else {
            console.log(`Error: ${xhr.status} ${xhr.readyState}`);
        }
        
    };

    FALLING_SPEED += 0.003;
    if(STATES[state].veldowm) {
        FALLING_SPEED -= 0.00105;
    }
    if(FALLING_SPEED > 1) FALLING_SPEED = 1;
    DOWN_TIME -= 10;
    if(DOWN_TIME < 100) DOWN_TIME = 100;
}

const GAME_STATE = {
    PLAYING: 0,
    GAME_OVER: 1,
    START: 2,
};

let game_state = GAME_STATE.START;


class Rocket {
    constructor() {
        this.SIZE = SIZE / 15;
        this.x = SIZE / 2 - this.SIZE / 2;
        this.y = SIZE - this.SIZE;
        this.letter = '';
        this.letterOld = '';

        this.destroyingTimer = -1;
        this.destroyLineX = [];
        this.destroyLineY = [];

        this.nextWordDestroy = [];
        this.lastWordIndex = [];

        this.downTimer = -1;

        this.score = 0;
        this.lives = 3;
    }

    keydown() {
        if(this.downTimer < 0) {
            this.destroyLineX = [];
            this.destroyLineY = [];

            let destroySomething = false;
            for(let i = 0; i < words.length; i++) {
                let word = words[i];
                if(word.text.at(word.cur_index) == this.letter && word.showingTimer < 0) {
                    destroySomething = true;
                    word.cur_index++;
                    this.lastWordIndex.push(i);
                    this.nextWordDestroy.push(word.cur_index >= word.text.length);
                    this.letterOld = this.letter;

                    this.destroyingTimer = DESTROYING_TIME;
                    word.destroyingTimer = DESTROYING_TIME;
                    this.destroyLineX.push(word.x + textWidth(word.text.substring(0, word.cur_index - 1)) + textWidth(word.text[word.cur_index - 1]) / 2);
                    this.destroyLineY.push(word.y - 1 + (textAscent() + textDescent()));
                
                    if(word.cur_index >= word.text.length) this.score += word.value;
                }
            }
            if(destroySomething) {
                this.letter = '';
            }
            else if(this.letter != '') {
                this.downTimer = DOWN_TIME;
            }
        }
    }

    update(deltaTime) {
        this.destroyingTimer -= deltaTime;
        this.downTimer -= deltaTime;

        for(let i = 0; i < words.length; i++) {
            if(words[i].y > this.y - textAscent() - textDescent()) {
                words.splice(i, 1);
                if(words.length == 0) {
                    newState();
                }
                i--;
                this.lives--;
                if(this.lives <= 0) {
                    game_state = GAME_STATE.GAME_OVER;
                    this.downTimer = -1;
                }
            }
        }

        let numAlreadyDestroyedObj = 0;
        if(this.destroyingTimer < 0) {
            for(let i = 0; i < this.nextWordDestroy.length; i++) {
                if(this.nextWordDestroy[i]) {
                    words.splice(this.lastWordIndex[i] - numAlreadyDestroyedObj, 1);
                    numAlreadyDestroyedObj++;
                    
                    //spane letter
                    if(Math.random() < 0.33) {
                        words.push(new Word(WORD_TYPES.LETTER, words));
                    }
                    
                    if(words.length == 0) {
                        newState();
                    }
                }
                this.letterOld = '';
            }
            
            this.nextWordDestroy = [];
            this.lastWordIndex = [];

        }
    }

    draw() {
        noStroke();
        fill(255);
        rect(this.x, this.y, this.SIZE, this.SIZE);

        if(this.downTimer > 0) {
            //fill(255, 0, 0, (this.downTimer / DOWN_TIME) * 255);
            //rect(this.x, this.y, this.SIZE, this.SIZE);
            fill(255, 0, 0, (this.downTimer / DOWN_TIME) * 50 + 100);
            rect(0, 0, SIZE, SIZE);
        }

        fill(0);
        textAlign(CENTER, CENTER);
        text(this.letterOld, this.x + this.SIZE / 2, this.y + this.SIZE / 2);

        if(this.destroyingTimer > 0) {
            for(let i = 0; i < this.destroyLineX.length; i++) {
                stroke((this.destroyingTimer / DESTROYING_TIME) * 255);
                strokeWeight(2);
                line(this.x + this.SIZE / 2, this.y - 1, this.destroyLineX[i], this.destroyLineY[i]);
            }
        }
        
        noStroke(0);
        fill(0, 0, 0, 200);
        rect(0, 0, SIZE,  SIZE / 10 - SIZE / 25);

        fill(255);
        textAlign(LEFT, CENTER);
        text(this.score, SIZE / 20 - SIZE / 25, SIZE / 20 - SIZE / 50)

        fill(255, 0, 0);
        for(let i = 0; i < this.lives; i++) {
            rect(SIZE - SIZE / 20 * (i + 1), SIZE / 20 - SIZE / 25, SIZE / 25, SIZE / 25);
        }

    }
}

let rocket;
let state = 0;

let lastmillis = 0;

function preload() {

}

function setup() {
    SIZE = 750;
    createCanvas(SIZE,SIZE);

    angleMode(DEGREES);

    textFont('Arial', SIZE / 30);
    textAlign(CENTER, CENTER);

    rocket = new Rocket();

    document.addEventListener('keypress', (event) => {
        if(event.key.length === 1 && game_state == GAME_STATE.PLAYING) {
            rocket.letter = event.key.toLowerCase();
            rocket.letterOld = event.key.toLowerCase();
            rocket.keydown();
        }
        if(event.key === 'Enter' && game_state == GAME_STATE.PLAYING) {
            rocket.letter = '';
            rocket.letterOld = '';
            rocket.destroyingTimer = -1;

            for(let i = 0; i < words.length; i++) {
                if(words[i].type == WORD_TYPES.LETTER) continue;
                words[i].showingTimer = SECOUND_SHOW_TIME * ((words[i].type & WORD_TYPES.FLIP)? 1.5 : 1);
                words[i].destroyingTimer = -1;
                words[i].cur_index = 0;

                words[i].value /= 2;
                if(words[i].value < 1) {
                    words[i].value = 0;
                }
            }
            
        }
        if(event.key === 'Enter' && (game_state == GAME_STATE.GAME_OVER || game_state == GAME_STATE.START)) {
            game_state = GAME_STATE.PLAYING;
            rocket = new Rocket();
            state = 0;
            words = [];
            
            DOWN_TIME = 500;
            FALLING_SPEED = 0.007;

            newState();
        }
    });
}

function draw() {
    background(20);

    deltaTime = millis() - lastmillis;
    lastmillis = millis();

    if(game_state == GAME_STATE.PLAYING) {
        for(let i = 0; i < words.length; i++) {
            words[i].update(deltaTime);
        }
        rocket.update(deltaTime);
    }
    else if(game_state == GAME_STATE.GAME_OVER) {
        fill(255, 255, 0);
        textAlign(CENTER, CENTER);
        textSize(SIZE / 10);
        text("GAME OVER", SIZE / 2, SIZE / 2 - SIZE / 20);
        textSize(SIZE / 20);
        text("Score: " + rocket.score, SIZE / 2, SIZE / 2 + SIZE / 20);
        textSize(SIZE / 30);
        text("Press enter to restart", SIZE / 2, SIZE / 2 + SIZE / 10);
    }
    else if(game_state == GAME_STATE.START) {
        fill(255, 255, 0);
        stroke(255);
        strokeWeight(0.5);
        textAlign(CENTER, CENTER);
        textSize(SIZE / 10);
        text("just_a_word_game", SIZE / 2, SIZE / 2 - SIZE / 20);
        textSize(SIZE / 30);
        text("Press enter to start", SIZE / 2, SIZE / 2 + SIZE / 20);
    }

    if(game_state == GAME_STATE.PLAYING) {
        for(let i = 0; i < words.length; i++) {
            words[i].draw();
        }
    }
    rocket.draw();
}