const typingText = document.querySelector('.typing-text p')
const inputField = document.querySelector('.wrapper .input-field')
const time = document.querySelector('.time span b')
const mistakes = document.querySelector('.mistakes span')
const wpm = document.querySelector('.wpm span')
const cpm = document.querySelector('.cpm span')
const tryAgain = document.querySelector('button')

//set value
let timer;
let maxTime = 60;
let timeLeft = maxTime;
let charIndex = 0;
let mistakesCount = 0;
let isTyping = false;


//loads the paragraph to be written
function loadParagraph(){
    const paragraph = [ "The cat sat on the windowsill, enjoying the sunshine.",
        "She loves reading books by the fireplace in winter evenings.",
        "The children played outside until the sun went down completely.",
        "He prepared a delicious dinner for his friends and family.",
        "We watched the fireworks display from our rooftop last night.",
        "The mountains looked beautiful with snow covering their peaks entirely.",
        "She painted a landscape of the valley with vibrant colors.",
        "The puppy chased its tail around the yard all day.",
        "They traveled across Europe, visiting many historical sites and museums.",
        "He plays the guitar beautifully, captivating everyone with his music.",
        "She baked cookies and shared them with her neighbors generously.",
        "The flowers in the garden bloomed brightly in the spring.",
        "He enjoys jogging early in the morning before work starts.",
        "The lake was calm, reflecting the surrounding trees perfectly.",
        "She wore a stunning dress to the gala last night.",
        "They camped in the forest, under a sky full of stars.",
        "He wrote a heartfelt letter to his childhood best friend.",
        "The concert was amazing, with a fantastic performance by the band.",
        "She practices yoga every morning to stay healthy and flexible.",
        "The city lights twinkled like stars in the night sky."];

        const randomIndex = Math.floor(Math.random()*paragraph.length);

        typingText.innerHTML='';

        for (const char of paragraph[randomIndex]) {
            typingText.innerHTML += `<span>${char}</span>`;
        }

        typingText.querySelectorAll('span')[0].classList.add('active');
        document.addEventListener('keydown', ()=>inputField.focus());
        typingText.addEventListener('click', ()=>inputField.focus());
}

//handle user input
function initTyping(){
    const char = typingText.querySelectorAll('span');
    const typedChar = inputField.value.charAt(charIndex);
    if (charIndex < char.length && timeLeft > 0) {

        if (!isTyping) {
            timer = setInterval(initTimer, 1000);
            isTyping = true;
        }

        if (char[charIndex].innerText == typedChar) {
            char[charIndex].classList.add('correct');
        }
        else {
            mistakesCount++;
            char[charIndex].classList.add('incorrect');
        }
        charIndex++;
        mistakes.innerText = mistakesCount;
        char[charIndex].classList.add('active');
        cpm.innerText = charIndex - mistakesCount;
    } 
    else {
        clearInterval(timer);
        inputField.value = '';
    }
}

function initTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        time.innerText = timeLeft;
        const wpmValue = Math.round(((charIndex - mistakesCount)/5)/(maxTime - timeLeft)*60);
        wpm.innerText = wpmValue;
    } 
    else {
        clearInterval(timer);
    }
}

function reset() {
    loadParagraph();
    clearInterval(timer);
    timeLeft = maxTime;
    time.innerText = timeLeft;
    inputField.value = '';
    charIndex = 0;
    mistakesCount = 0;
    isTyping = false;
    wpm.innerText = 0;
    cpm.innerText = 0
    mistakes.innerText = 0;
}

inputField.addEventListener("input", initTyping);
tryAgain.addEventListener('click', reset);
loadParagraph();
