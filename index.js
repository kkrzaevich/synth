// Запускаем синтезатор

const context = new AudioContext();
let gain = context.createGain();
gain.gain.value = 0.1;
gain.connect(context.destination);

// Задаем октавный сдвиг
let transposition = -1;

// Создать класс ноты
class Note {
    constructor(name, octave, frequency, oscillator) {
      this.name = name;
      this.octave = octave;
      this.frequency = frequency;
      this.oscillator = oscillator;
    }
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
            button.id = 'key' + button.innerText;
            button.note = currentNote;
        }
    }
}

// Действия вне функций
setFrequencies();

// При игре клавиатурой

$('.key').on('keydown', function(event) {
    // Проверяем, что такая клавиша есть (НЕ РАБОТАЕТ, ПОФИКСИТЬ)
    if (typeof document.querySelector(`#key${event.key.toUpperCase()}`) !== 'undefined') {
        // Получаем частоту сыгранной ноты
        currentFrequency = document.querySelector(`#key${event.key.toUpperCase()}`).note.frequency;
        // Проверяем, что частота есть, и отсекаем репиты эвента от долго нажатых клавиш
        if (currentFrequency > 0 && event.originalEvent.repeat === false) {
            // Проверяем, что осциллятора на данной ноте еще нет (отсекает баги), создаем осциллятор
            if (typeof document.querySelector(`#key${event.key.toUpperCase()}`).note.oscillator === 'undefined') {
                document.querySelector(`#key${event.key.toUpperCase()}`).note.oscillator = context.createOscillator();
                document.querySelector(`#key${event.key.toUpperCase()}`).note.oscillator.connect(gain);
                document.querySelector(`#key${event.key.toUpperCase()}`).note.oscillator.start(0);
                document.querySelector(`#key${event.key.toUpperCase()}`).note.oscillator.frequency.setValueAtTime(currentFrequency, 0);
                document.querySelector(`#key${event.key.toUpperCase()}`).note.oscillator.type = 'sine';
                console.log('adding ' + document.querySelector(`#key${event.key.toUpperCase()}`).note.frequency);
                this.addEventListener('keyup', function(event) {
                    if (typeof document.querySelector(`#key${event.key.toUpperCase()}`).note.oscillator !== 'undefined') {
                        console.log('deleting ' + document.querySelector(`#key${event.key.toUpperCase()}`).note.frequency);
                        document.querySelector(`#key${event.key.toUpperCase()}`).note.oscillator.stop(0);
                        delete document.querySelector(`#key${event.key.toUpperCase()}`).note.oscillator;
                    }
                });
            }
        } 
    } else { console.log('Wrong key')};
});

// При игре мышкой

$('.key').on('mousedown mouseover', function(event) {
    if (event.buttons == 1 || event.buttons == 3) {
        currentFrequency = this.note.frequency;
        this.note.oscillator = context.createOscillator();
        this.note.oscillator.connect(gain);
        this.note.oscillator.start(0);
        this.note.oscillator.frequency.setValueAtTime(currentFrequency, 0);
        this.note.oscillator.type = 'sine';
        console.log(event);
        $('.key').on('mouseup mouseout', function (event) { 
            this.note.oscillator.stop(0);
            delete this.note.oscillator;
        });
    }
})