
// Создать аудио контекст
const audioCtx = new AudioContext();

// Создать гейн
let gain = audioCtx.createGain();
console.log(gain);
console.log(gain.gain.value);

// Создать осциллятор, задать тип
const oscillator = audioCtx.createOscillator();
oscillator.frequency.setValueAtTime(220, 0);
oscillator.type = 'square';

// Задать подключение осциллятора к гейну
oscillator.connect(gain);

// Задать подключение гейна к выходу звуковой карты
gain.connect(audioCtx.destination);

// Задаем октавный сдвиг
let transposition = -1;

// Создать класс ноты
class Note {
    constructor(name, octave, frequency) {
      this.name = name;
      this.octave = octave;
      this.frequency = frequency;
    }
}

// Запускаем синтезатор
function launchSynth() {
    oscillator.start(0);
    gain.gain.value = 0;
    $('.launchButton').off();
}

// Синтезатор играет
function playKey() {
    oscillator.frequency.setValueAtTime(this.note.frequency*Math.pow(2, transposition), 0);
    gain.gain.value = 1;
}

// Синтезатор перестал играть
function stopKey() {
    gain.gain.value = 0;
    console.log('HUI');
}

// Расположить белую клавишу
function placeButtonWhite(currentButton, keysCount) {
    startingPosition = keysCount*4;
    endPosition = 4 +  keysCount*4;
    currentButton.style.gridColumnStart = `${startingPosition}`;
    currentButton.style.gridColumnStart = `${endPosition}`;
    console.log(startingPosition);
    console.log(endPosition);
}

// Создание клавиатуры в DOM
function loadKeyboard() {
    let whiteKeysCount = 0;
    let blackKeysCount = 0;
    for (octave=1; octave<=4; octave++) {
        for (i=1; i<=12; i++) {
            let currentNote = new Note;
            currentNote.octave = octave;
            if (i===1) {currentNote.name='C', currentNote.frequency = 130.81*octave}
            else if (i===2) {currentNote.name='C#', currentNote.frequency = 138.59*octave}
            else if (i===3) {currentNote.name='D', currentNote.frequency = 146.83*octave}
            else if (i===4) {currentNote.name='D#', currentNote.frequency = 155.56*octave} 
            else if (i===5) {currentNote.name='E', currentNote.frequency = 164.81*octave} 
            else if (i===6) {currentNote.name='F', currentNote.frequency = 174.61*octave} 
            else if (i===7) {currentNote.name='F#', currentNote.frequency = 185.00*octave} 
            else if (i===8) {currentNote.name='G', currentNote.frequency = 196.00*octave} 
            else if (i===9) {currentNote.name='G#', currentNote.frequency = 207.65*octave} 
            else if (i===10) {currentNote.name='A', currentNote.frequency = 220*octave}
            else if (i===11) {currentNote.name='A#', currentNote.frequency = 233.08*octave} 
            else if (i===12) {currentNote.name='B', currentNote.frequency = 246.94*octave}
            else (console.log('Note out of range WTF???;'));
            console.log(currentNote);
            let button = document.createElement("button");
            button.innerHTML = `${currentNote.name}${currentNote.octave}`;
            if (currentNote.name.includes('#')) {
                button.className = 'key key-black';
                placeButtonWhite(button, whiteKeysCount);
                whiteKeysCount++;
            } else {
                button.className = 'key key-white';
                // placeButtonBlack(button, blackKeysCount);
                blackKeysCount++;
            }
            button.note = currentNote;
            $('.keyboard')[0].appendChild(button);
        }
    }
}

// Действия вне функций
loadKeyboard();
$('.launchButton').on('click', launchSynth);
$('.key').on('mousedown', playKey);
$('.key').on('mouseup', stopKey);
