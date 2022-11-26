
// ПРОБЛЕМЫ. ФУНКЦИИ ПЫТАЮТСЯ ОБРАТИТЬСЯ К КНОПКЕ. А НАДО К ОСЦИЛЛЯТОРУ. СДЕЛАТЬ ЧЕРНОВОЙ ЭСКИЗ

// Глобально
// Задаем атаку, релиз, дикей, тип осциллятора, громкость
var attack = 0.001;
var release = 0.1;
var sustain = 1;
var decay = 1;
var oscType = 'sine';
var volume = 0.1;
// Задаем транспозицию
var transposition = -1;
// Задаем частоту среза фильтра
var filterFreq = 500;
// Задаем ширину стерео панорамы
var stereoWidth = 0;

// Задаем число шагов изменения громкости по атаке, релизу и декея отдельно
// 	Если атака/релиз/декей очень короткие, шагов нужно мало
// 	Если атака/релиз/декей длинные, шагов нужно много
var volumeAttackStepsNum = 10;
var volumeReleaseStepsNum = 10;
var volumeDecayStepsNum = 10;
// Создаем глобальные переменные
var attackTimeStep;
var releaseTimeStep;
var decayTimeStep;
var decayLoudness;
var volumeStepDecay;

// Задаем функции для атаки, релиза и дикея
function setAttackParams() {
    if (attack < 0.1) {
        volumeAttackStepsNum = 1;
    } else { volumeAttackStepsNum = 10; }
    // Считаем время шага атаки по формуле Время атаки / Число шагов атаки
    attackTimeStep = attack * 1000 / volumeAttackStepsNum;
}

function setReleaseParams() {
    if (release < 0.1) {
        volumeReleaseStepsNum = 1;
    } else { volumeReleaseStepsNum = 10; }
    // Считаем время шага релиза по формуле Время релиза / Число шагов релиза
    releaseTimeStep = release * 1000 / volumeReleaseStepsNum;
}

function setDecayParams() {
    if (decay < 0.1) {
        volumeDecayStepsNum = 1;
    } else { volumeDecayStepsNum = 10; }
    // Считаем время шага декея по формуле Время дикея / Число шагов дикей
    decayTimeStep = decay * 1000 / volumeDecayStepsNum;
    // Считаем итоговую громкость для дикея
    decayLoudness = sustain * volume;
    // Высчитываем шаг декея по громкости = громкость минус громкость сустейна / количество шагов декея
    volumeStepDecay = (volume - decayLoudness) / volumeDecayStepsNum;
}

// Вызываем функции для атаки, дикея и релиза
setAttackParams();
setReleaseParams();
setDecayParams();


// Создаем аудио контекст
const context = new AudioContext();


// Создаем класс с музыкой, чтобы присвоить его кнопке
class Music {
    constructor(oscillator, gain, frequency, phase, name, octave, filter, stereoPan) {
        // 	Осциллятор
        this.oscillator = oscillator;
        // 	Гейн
        this.gain = gain;
        // 	Частота
        this.frequency = frequency;
        // Фаза
        this.phase = phase;
        // Имя нот
        this.name = name;
        // Номер октавы
        this.octave = octave;
        // Фильтр
        this.filter = filter;
        // Стерео панорама
        this.stereoPan = stereoPan;
    }
    changePhase(input) {
        this.phase = input;
        if (this.phase === 'attack') {
            this.weAttack();
        }
        if (this.phase === 'decay') {
            this.weDecay();
        }
        if (this.phase === 'release') {
            this.weRelease();
        }
        if (this.phase === 'sustain') {
            this.weSustain();
        }
    }
    weAttack() {
        console.log('HI BABY WE ATTACK!!!');
        let scope = this;
        if (this.phase === 'attack') {
            // Задаем this в переменную, чтобы пользоваться из вложенных функций
            let scope = this;
            let volumeStepAttack;
            // ЕСЛИ ЕСТЬ ОСЦИЛЛЯТОР
            if (typeof this.oscillator !== 'undefined') {
                // Высчитываем шаг атаки по громкости = громкость минус текущий гейн / количество шагов атаки по модулю
                console.log('Осциллятор есть. Текущий гейн: ' + this.gain.gain.value + ' Частота ' + this.frequency);
                volumeStepAttack = Math.abs((this.gain.gain.value - volume) / volumeAttackStepsNum);
                console.log('volume step attack: ' + volumeStepAttack);
            } else {
                // ЕСЛИ НЕТ ОСЦИЛЛЯТОРА
                // Создать осциллятор
                this.oscillator = context.createOscillator();
                // Присвоить ему тип и частоту
                this.oscillator.type = oscType;
                this.oscillator.frequency.setValueAtTime(this.frequency, 0);
                // Задать гейн = 0
                this.gain.gain.value = 0;
                // Включить осциллятор
                this.oscillator.start(0);
                // Присоединить к гейну
                this.oscillator.connect(this.gain);
                // Высчитываем шаг атаки по громкости = громкость / количество шагов атаки
                volumeStepAttack = volume / volumeAttackStepsNum;

            }
            // Каждое время шага атаки выполняем setInterval:
            let intervalAttackId = setInterval(function () {

                // 	Если (значение фазы - атака И громкость меньше заданной минус шаг громкости атаки):
                if (scope.gain.gain.value < volume - volumeStepAttack / 2 && scope.phase === 'attack') { // здесь нужно что-то придумать для короткой атаки, volume-volumeStepAttack дает 0 при одном шаге атаки
                    // 	Выдаем громкость в текущий момент в консоль
                    console.log('This is attack. Loudness is ' + scope.gain.gain.value + ' Частота ' + scope.frequency);
                    // 	Плавно увеличиваем громкость на шаг громкости
                    scope.gain.gain.setTargetAtTime(scope.gain.gain.value + volumeStepAttack, context.currentTime, attackTimeStep / 1000);
                }
                // 	Если (else), то
                else {
                    // 	Прекращаем выполнение setInterval
                    clearInterval(intervalAttackId);
                    // 	Меняем фазу на дикей
                    if (scope.phase === 'attack') {
                        scope.changePhase('decay');
                        console.log('phase set to decay. the phase is ' + scope.phase);
                    }

                }
            }, attackTimeStep);
        }
    }
    weDecay() {
        console.log('HI BABY WE DECAY!!!');
        let scope = this;
        if (this.phase === 'decay') {
            // Идет дикей !!! ДИКЕЙ НЕ РАБОТАЕТ !!! НУЖЕН ОТДЕЛЬНЫЙ ЭВЕНТ НА ЗАПУСК ДИКЕЯ. СОЗДАТЬ ЭВЕНТ ЛИСЕНЕР
            // Если сустейн равен 100%, то:
            if (sustain === 1) {
                // Меняем фазу на сустейн
                this.changePhase('sustain');
                console.log('phase set to sustain. the phase is ' + this.phase);
            }
            // Если меньше 100%, то:
            else {
                console.log('Going into decay');
                // Каждое время шага дикея выполняем setInterval:
                let intervalDecayId = setInterval(function () {
                    // 	Если (значение фазы - декея И громкость больше заданной плюс шаг громкости дикея):
                    if (scope.gain.gain.value > decayLoudness + volumeStepDecay && scope.phase === 'decay') {
                        // 	Выдаем громкость в текущий момент в консоль
                        console.log('This is decay. Loudness is ' + scope.gain.gain.value + ' Частота ' + scope.frequency);
                        // 	Плавно уменьшаем громкость на шаг громкости
                        scope.gain.gain.setTargetAtTime(scope.gain.gain.value - volumeStepDecay, context.currentTime, decayTimeStep / 1000);
                    }
                    // 	Если (else), то
                    else {
                        // 	Прекращаем выполнение setInterval
                        clearInterval(intervalDecayId);
                        if (sustain === 0 && scope.phase === 'decay') {
                            // 	Приравниваем громкость нулю плавно
                            scope.gain.gain.setTargetAtTime(0, context.currentTime, decayTimeStep / 1000);
                            // 	Через короткий промежуток времени останавливаем и удаляем осциллятор
                            setTimeout(function () {
                                scope.oscillator.stop(0);
                                scope.oscillator.disconnect(0);
                                delete scope.oscillator;
                                console.log('WE DELETE OSCILLATOR');
                            }, 2 * decayTimeStep);
                        } else {
                            // 	Если нет, меняем фазу на сустейн
                            if (scope.phase === 'decay') {
                                scope.changePhase('sustain');
                                console.log('phase set to sustain. the phase is ' + scope.phase);
                            }
                        }
                    }
                }, decayTimeStep);
            }

        }
    }
    weRelease() {
        console.log('HI BABY WE RELEASE!!!');
        let scope = this;
        // Каждое время шага релиза выполняем setInterval:
        let intervalReleaseId = setInterval(function () {
            // 	Если (значение фазы - релиз И громкость больше шага громкости релиза):
            if (scope.gain.gain.value > volumeStepRelease && scope.phase === 'release') {
                // 	Выдаем громкость в текущий момент в консоль
                console.log('This is release. Loudness is ' + scope.gain.gain.value + ' Частота ' + scope.frequency);
                // 	Плавно уменьшаем громкость на шаг громкости
                scope.gain.gain.setTargetAtTime(scope.gain.gain.value - volumeStepRelease, context.currentTime, releaseTimeStep / 1000);
            }
            // 	Если (else), то
            else if (scope.phase === 'release') {
                // 	Прекращаем выполнение setInterval
                clearInterval(intervalReleaseId);
                // 	Приравниваем громкость нулю плавно
                scope.gain.gain.setTargetAtTime(0, context.currentTime, releaseTimeStep / 1000);
                // 	Через короткий промежуток времени останавливаем и удаляем осциллятор
                setTimeout(function () {
                    scope.oscillator.stop(0);
                    scope.oscillator.disconnect();
                    delete scope.oscillator;
                    console.log('WE DELETE OSCILLATOR');
                }, 2 * releaseTimeStep);
            }
        }, releaseTimeStep);
    }
    weSustain() {
        console.log('HI BABY WE SUSTAIN!!!');
        console.log('This is sustain. Loudness is ' + this.gain.gain.value + ' Частота ' + this.frequency);
    }

}

// Задаем частоты - вызов функции
setFrequencies();

// Задаем фильтры
function setFilters() {
    for (octave = 1; octave <= 4; octave++) {
        for (i = 1; i <= 12; i++) {
            document.querySelector(`.octave-${octave}`).children[i - 1].music.filter.frequency.value = filterFreq;
        }
}
}

// Задаем стерео панораму
function setStereoWidth() {
    let count = 1;
    for (octave = 1; octave <= 4; octave++) {
        for (i = 1; i <= 12; i++) {
            document.querySelector(`.octave-${octave}`).children[i - 1].music.stereoPan.pan.value = (-1+count/24)*stereoWidth;
            console.log(document.querySelector(`.octave-${octave}`).children[i - 1].music.stereoPan.pan.value);
            count++;
        }
    }
}

// Задание частот - функция
function setFrequencies() {
    let count = 1;
    for (octave = 1; octave <= 4; octave++) {
        for (i = 1; i <= 12; i++) {
            let currentNote = new Music;
            currentNote.octave = octave;
            if (i === 1) { currentNote.name = 'C', currentNote.frequency = 130.81 * Math.pow(2, octave) * Math.pow(2, transposition) }
            else if (i === 2) { currentNote.name = 'C#', currentNote.frequency = 138.59 * Math.pow(2, octave) * Math.pow(2, transposition) }
            else if (i === 3) { currentNote.name = 'D', currentNote.frequency = 146.83 * Math.pow(2, octave) * Math.pow(2, transposition) }
            else if (i === 4) { currentNote.name = 'D#', currentNote.frequency = 155.56 * Math.pow(2, octave) * Math.pow(2, transposition) }
            else if (i === 5) { currentNote.name = 'E', currentNote.frequency = 164.81 * Math.pow(2, octave) * Math.pow(2, transposition) }
            else if (i === 6) { currentNote.name = 'F', currentNote.frequency = 174.61 * Math.pow(2, octave) * Math.pow(2, transposition) }
            else if (i === 7) { currentNote.name = 'F#', currentNote.frequency = 185.00 * Math.pow(2, octave) * Math.pow(2, transposition) }
            else if (i === 8) { currentNote.name = 'G', currentNote.frequency = 196.00 * Math.pow(2, octave) * Math.pow(2, transposition) }
            else if (i === 9) { currentNote.name = 'G#', currentNote.frequency = 207.65 * Math.pow(2, octave) * Math.pow(2, transposition) }
            else if (i === 10) { currentNote.name = 'A', currentNote.frequency = 220 * Math.pow(2, octave) * Math.pow(2, transposition) }
            else if (i === 11) { currentNote.name = 'A#', currentNote.frequency = 233.08 * Math.pow(2, octave) * Math.pow(2, transposition) }
            else if (i === 12) { currentNote.name = 'B', currentNote.frequency = 246.94 * Math.pow(2, octave) * Math.pow(2, transposition) }
            else (console.log('Note out of range WTF???;'));
            console.log(currentNote);
            let button = document.querySelector(`.octave-${octave}`).children[i - 1];
            button.id = 'key' + button.innerText;
            button.music = currentNote;
            // Создаем гейн для кнопки, приравниваем к нулю
            button.music.gain = context.createGain();
            button.music.gain.gain.value = 0;
            // Создаем фильтр для кнопки, приравниваем к заданной частоте
            button.music.filter = context.createBiquadFilter();
            button.music.filter.type = 'lowpass';
            button.music.filter.frequency.value = filterFreq;            
            // Соединяем гейн с фильтром
            button.music.gain.connect(button.music.filter);
            // Создаем паннер
            button.music.stereoPan = context.createStereoPanner();
            button.music.stereoPan.pan.value = (-1+count/24)*stereoWidth;
            console.log('Frequency value is ' + button.music.frequency + '. Pan value is ' + button.music.stereoPan.pan.value + ' Count is ' + count)
            console.log(button.music);
            // Соединяем фильтр с паннером
            button.music.filter.connect(button.music.stereoPan);
            // Соединяем паннер с аудио контекстом
            button.music.stereoPan.connect(context.destination);
            count++;
        }
    }
}

// Выбор осциллятора

$('#oscType').on('change', function () {
    switch (this.value) {
        case "0":
            oscType = "sine";
            $('#oscTypeLabel')[0].innerText = 'Sine';
            break;
        case "33":
            oscType = "triangle";
            $('#oscTypeLabel')[0].innerText = 'Triangle';
            break;
        case "66":
            oscType = "square";
            $('#oscTypeLabel')[0].innerText = 'Square';
            break;
        case "99":
            oscType = "sawtooth";
            $('#oscTypeLabel')[0].innerText = 'Sawtooth';
            break;
        default:
            oscType = "sine";
            $('#oscTypeLabel')[0].innerText = 'Sine';
            break;
    };
});

// Присваиваем значения ползунков
$(document).ready(function () {
    // Присваиваем ползунку значение атаки
    $('#attack').value = attack;
    $('#attackLabel')[0].innerText = attack;
    setAttackParams();
    // Присваиваем ползунку значение дикея
    $('#decay').value = decay;
    $('#decayLabel')[0].innerText = decay;
    setDecayParams();
    // Присваиваем ползунку значение сустейна
    $('#sustain').value = sustain;
    $('#sustainLabel')[0].innerText = sustain;
    setDecayParams();
    // Присваиваем ползунку значение релиза
    $('#release').value = release;
    $('#releaseLabel')[0].innerText = release;
    setReleaseParams();
});

// Выбор атаки
// Если двигается ползунок, меняем атаку
$('#attack').on('change', function () {
    attack = this.value;
    $('#attackLabel')[0].innerText = this.value;
    setAttackParams();
});

// Выбор дикея
// Если двигается ползунок, меняем дикей
$('#decay').on('change', function () {
    decay = this.value;
    $('#decayLabel')[0].innerText = this.value;
    setDecayParams();
});

// Выбор сустейна
// Если двигается ползунок, меняем сустейн
$('#sustain').on('change', function () {
    sustain = this.value;
    $('#sustainLabel')[0].innerText = this.value;
    setDecayParams();
});

// Выбор релиза
// Если двигается ползунок, меняем релиз
$('#release').on('change', function () {
    release = this.value;
    $('#releaseLabel')[0].innerText = this.value;
    setReleaseParams();
});

// Присваиваем ползунку значение частоты фильтра
$('#filter').value = filterFreq;
$('#filterLabel')[0].innerText = filterFreq;
setFilters();
// Выбор фильтра
// Если двигается ползунок, меняем релиз
$('#filter').on('change', function () {
    filterFreq = this.value;
    $('#filterLabel')[0].innerText = this.value;
    setFilters();
});

// Выбор стерео панорамы
$('#stereo').on('change', function () {
    stereoWidth = this.value;
    $('#stereoLabel')[0].innerText = this.value;
    setStereoWidth();
});

// ИГРА МЫШЬЮ: При нажатии на кнопку
$('.key').on('mousedown mouseover', function (event) {
    // Если у нас зажата кнопка
    if (event.buttons == 1 || event.buttons == 3) {
        // Идет атака
        // Задаем значение фазы - атака
        console.log(this.music);
        this.music.changePhase('attack');
        console.log('phase set to attack. the phase is ' + this.music.phase);

        // Идет сустейн
        if (this.music.phase === 'sustain') {
            // Ничего не делаем
            console.log('This is sustain. Loudness is ' + scope.music.gain.gain.value);
        };
        // Красим кнопку
        this.classList.add("pressed");
        console.log(filter.frequency)
    }
});

// ИГРА МЫШЬЮ: При отжатии кнопки
$('.key').on('mouseup mouseout', function (event) {
    // Задаем this в переменную, чтобы пользоваться из вложенных функций
    let scope = this;

    // ЕСЛИ НЕТ ОСЦИЛЛЯТОРА
    if (typeof this.music.oscillator === 'undefined') {
        // Ничего не делаем. Выдаем ошибку в консоль
        console.log('Error. Oscillator does not exist');
    } else {
        // ЕСЛИ ЕСТЬ ОСЦИЛЛЯТОР
        // Если гейн меньше или равен нулю, останавливаем и удаляем осциллятор.
        if (this.music.gain.gain.value <= 0) {
            scope.music.oscillator.stop(0);
            scope.music.oscillator.disconnect();
            delete scope.music.oscillator;
            console.log('WE DELETE OSCILLATOR');
        } else {
            // Иначе:
            // Высчитываем шаг релиза по громкости = текущая громкость / количество шагов релиза
            volumeStepRelease = this.music.gain.gain.value / volumeReleaseStepsNum;
            // Задаем значение фазы - релиз
            this.music.changePhase('release');
            console.log('phase set to release. the phase is ' + this.music.phase);
        }
    }
    // Убираем краску с кнопки
    this.classList.remove("pressed");
});

// ИГРА КЛАВИАТУРОЙ: При нажатии кнопки
$('.key').on('keydown', function (event) {
    // Определяем данную клавишу
    let thisKey = document.querySelector(`#key${event.key.toUpperCase()}`);
    // Получаем частоту сыгранной ноты
    currentFrequency = thisKey.music.frequency;
    // Проверяем, что частота есть, и отсекаем репиты эвента от долго нажатых клавиш
    if (currentFrequency > 0 && event.originalEvent.repeat === false) {
        thisKey.music.changePhase('attack');
        console.log('phase set to attack. the phase is ' + thisKey.music.phase);

        // Идет сустейн
        if (thisKey.music.phase === 'sustain') {
            // Ничего не делаем
            console.log('This is sustain. Loudness is ' + thisKey.music.gain.gain.value);
        };
        // Красим кнопку
        thisKey.classList.add("pressed");
    }
});

// При отжатии кнопки
$('.key').on('keyup', function (event) {
    // Определяем данную клавишу
    let thisKey = document.querySelector(`#key${event.key.toUpperCase()}`);

    // ЕСЛИ НЕТ ОСЦИЛЛЯТОРА
    if (typeof thisKey.music.oscillator === 'undefined') {
        // Ничего не делаем. Выдаем ошибку в консоль
        console.log('Error. Oscillator does not exist');
    } else {
        // ЕСЛИ ЕСТЬ ОСЦИЛЛЯТОР
        // Если гейн меньше или равен нулю, останавливаем и удаляем осциллятор.
        if (thisKey.music.gain.gain.value <= 0) {
            thisKey.music.oscillator.stop(0);
            thisKey.music.oscillator.disconnect();
            delete thisKey.music.oscillator;
            console.log('WE DELETE OSCILLATOR');
        } else {
            // Иначе:
            // Высчитываем шаг релиза по громкости = текущая громкость / количество шагов релиза
            volumeStepRelease = thisKey.music.gain.gain.value / volumeReleaseStepsNum;
            // Задаем значение фазы - релиз
            thisKey.music.changePhase('release');
            console.log('phase set to release. the phase is ' + thisKey.music.phase);
        }
    }
    // Убираем краску с кнопки
    thisKey.classList.remove("pressed");
});
