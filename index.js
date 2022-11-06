
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
    oscillator.frequency.setValueAtTime(this.note.frequency, 0);
    console.log(this.note.frequency + ' ' + this.note.name + ' ' + this.note.octave);
    gain.gain.value = 1;
}

// Запуск с клавиатуры
function playKeyboard(event) {
    console.log(event.key.toUpperCase());
    let keyPlayed = $(`button:contains('${event.key.toUpperCase()}')`)[0];
    console.log(keyPlayed);
    oscillator.frequency.setValueAtTime(keyPlayed.note.frequency, 0);
    gain.gain.value = 1;
}

// Синтезатор перестал играть
function stopKey() {
    gain.gain.value = 0;
    console.log('HUI');
}

// Задание частот
function setFrequencies() {
    for (octave=1; octave<=4; octave++) {
        for (i=1; i<=12; i++) {
            let currentNote = new Note;
            currentNote.octave = octave;
            if (i===1) {currentNote.name='C', currentNote.frequency = 130.81*Math.pow(2, octave)*Math.pow(2, transposition)}
            else if (i===2) {currentNote.name='C#', currentNote.frequency = 138.59*Math.pow(2, octave)*Math.pow(2, transposition)}
            else if (i===3) {currentNote.name='D', currentNote.frequency = 146.83*Math.pow(2, octave)*Math.pow(2, transposition)}
            else if (i===4) {currentNote.name='D#', currentNote.frequency = 155.56*Math.pow(2, octave)*Math.pow(2, transposition)} 
            else if (i===5) {currentNote.name='E', currentNote.frequency = 164.81*Math.pow(2, octave)*Math.pow(2, transposition)} 
            else if (i===6) {currentNote.name='F', currentNote.frequency = 174.61*Math.pow(2, octave)*Math.pow(2, transposition)} 
            else if (i===7) {currentNote.name='F#', currentNote.frequency = 185.00*Math.pow(2, octave)*Math.pow(2, transposition)} 
            else if (i===8) {currentNote.name='G', currentNote.frequency = 196.00*Math.pow(2, octave)*Math.pow(2, transposition)} 
            else if (i===9) {currentNote.name='G#', currentNote.frequency = 207.65*Math.pow(2, octave)*Math.pow(2, transposition)} 
            else if (i===10) {currentNote.name='A', currentNote.frequency = 220*Math.pow(2, octave)*Math.pow(2, transposition)}
            else if (i===11) {currentNote.name='A#', currentNote.frequency = 233.08*Math.pow(2, octave)*Math.pow(2, transposition)} 
            else if (i===12) {currentNote.name='B', currentNote.frequency = 246.94*Math.pow(2, octave)*Math.pow(2, transposition)}
            else (console.log('Note out of range WTF???;'));
            console.log(currentNote);
            let button = document.querySelector(`.octave-${octave}`).children[i-1];
            button.id = `${currentNote.name}${currentNote.octave}`;
            button.note = currentNote;
        }
    }
}

// Действия вне функций
setFrequencies();
$('.launchButton').on('click', launchSynth);
$('.key').on('mousedown', playKey);
$('.key').on('mouseup', stopKey);
$('.key').on('keydown', playKeyboard);
$('.key').on('keyup', stopKey);
