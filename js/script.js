var App = App || {};

App.Mine = function () {
    var self = this;

    this.size = 0;
    this.mineCount = 0;
    this.mainElements = {};
    this.timerId = null;

    this.render = function () {
        self.initHandlers();

    }

    this.initHandlers = function () {
        var generateButton = document.getElementById('generete-button');
        generateButton.addEventListener('click', function () {
            self.openField = 1;

            //cach DOM Element
            self.mainElements.table = document.querySelector('#table');
            self.mainElements.genereteForm = document.querySelector('#generete-form');
            self.mainElements.countField = document.getElementById('mine-counter');
            self.mainElements.clock = document.getElementById('clock');
            self.generateField();

            self.mainElements.tbody = document.querySelector('#tbody');
            var cells = document.querySelectorAll('#tbody td');

            self.calculeteNumberBesideMine(cells);
            self.mainElements.tbody.addEventListener('click', self.clickOnField);
            self.mainElements.tbody.addEventListener('contextmenu', self.demine);
        });

        var newGameButton = document.getElementById('new-game-button');
        newGameButton.addEventListener('click', function () {
            self.mainElements.tbody.remove();
            self.mainElements.table.hidden = true;
            self.mainElements.genereteForm.hidden = false;
            self.mainElements.clock.value = 0;
            self.stopTimer();

        });
    }

    this.demine = function (e) {
        e.preventDefault();
        var countField = self.mainElements.countField;
        var targetElement = e.target;
        if (targetElement.className != 'open-field') {
            if (targetElement.className != 'isMine') {
                targetElement.classList.add('isMine');
                countField.value = parseInt(countField.value) - 1;
            } else {
                targetElement.classList.remove('isMine');
                countField.value = parseInt(countField.value) + 1;
            }
        }
    }

    this.clickOnField = function (e) {
        if (parseInt(document.getElementById('clock').value) == 0) {
            self.startTimer();
        }
        self.mainElements.countField.disabled;
        var targetElement = e.target;
        if (targetElement.className != 'isMine') {
            if (targetElement.getAttribute('data-mine') == 1) {
                targetElement.classList.add('show-mine');
                self.showAllMineEndGame();
                self.endGame();
                setTimeout(function () {
                    alert('Boooom... Вы проиграли!');
                }, 100);
            } else {
                if (targetElement.className != 'isMine') {
                    var bombCount = parseInt(targetElement.getAttribute('data-bomb-count'));
                    if (bombCount != 0) {
                        targetElement.innerText = bombCount;
                    }
                }

                if (targetElement.classList != 'open-field') {
                    if (self.openField == (Math.pow(self.size, 2) - self.mineCount)) {
                        self.showAllMineEndGame();
                        self.endGame();
                        setTimeout(function () {
                            alert('Поздравляем! Вы победили!!!');
                        }, 100);
                    }

                    if (parseInt(targetElement.getAttribute('data-bomb-count')) != 0) {
                        self.openField++;
                        targetElement.classList.add('open-field');
                    } else {
                        var coord = targetElement.getAttribute('coord');
                        self.getAllEmptyField(coord);
                    }
                }
            }
        }
    }

    this.endGame = function () {
        self.mainElements.tbody.removeEventListener("contextmenu", self.demine);
        self.mainElements.tbody.removeEventListener('click', self.clickOnField);
        self.mainElements.clock.value = 0;
        self.stopTimer();
    }

    this.generateField = function () {
        self.mainElements.genereteForm.hidden = true;
        self.mainElements.table.hidden = false;
        var tbody = document.createElement('tbody');
        tbody.setAttribute('id', 'tbody');
        self.mainElements.table.appendChild(tbody);

        var radioData = document.querySelectorAll('input[type="radio"]:checked')[0];
        var size = parseInt(radioData.defaultValue);
        this.size = size;
        var mineCount = parseInt(radioData.getAttribute('data-mine-count'));
        this.mineCount = mineCount;

        var count = 0;
        var mineArr = this.generateMinePosition(size, mineCount);

        for (var i = 0; i < size; i++) {
            var tr = document.createElement('tr');
            for (var j = 0; j < size; j++) {
                var td = document.createElement('td');
                td.setAttribute('x', i);
                td.setAttribute('y', j);
                td.setAttribute('coord', i + '-' + j)

                if (mineArr.indexOf(count) != -1) {
                    td.setAttribute('data-mine', "1")
                }

                tr.appendChild(td);
                tbody.appendChild(tr);
                count++;
            }
        }
        var newGameButton = document.createElement('button');
        newGameButton.innerText = 'Новая игра';
        var thead = table.querySelector('thead');
        thead.hidden = false;
        var mineCounterField = document.getElementById('mine-counter');
        mineCounterField.value = mineCount;
    }

    this.generateMinePosition = function (size, mineCount) {
        var mineArr = [];
        var count = 0, maxValue = Math.pow(size, 2);

        while (count < mineCount) {
            var position = this.randomMinePosition(maxValue);
            if (mineArr.indexOf(position) == -1) {
                mineArr.push(position);
                count++;
            }
        }
        return mineArr;
    }

    this.randomMinePosition = function (max) {
        var rand = Math.random() * (max + 1);
        rand = Math.floor(rand);
        return rand;
    }

    this.calculeteNumberBesideMine = function (cells) {
        for (var i = 0; i < cells.length; i++) {
            if (!cells[i].getAttribute('data-mine')) {
                var coord = cells[i].getAttribute('coord');
                this.getMineCountForCell(coord);
            }
        }
    }

    this.getMineCountForCell = function (coord, flag) {
        var maxSize = this.size - 1;
        var coordXY = coord.split('-');
        x = parseInt(coordXY[0]);
        y = parseInt(coordXY[1]);

        points = [[x - 1, y - 1], [x - 1, y], [x - 1, y + 1],
            [x, y - 1], [x, y + 1],
            [x + 1, y - 1], [x + 1, y], [x + 1, y + 1]];
        boombCount = 0;

        for (var j = 0; j < 8; j++) {
            if (points[j][0] >= 0 && points[j][1] >= 0 && points[j][0] <= maxSize && points[j][1] <= maxSize) {
                var dataValue = points[j].join('-');
                element = document.querySelector('td[coord="' + dataValue + '"]');

                if (element.getAttribute('data-mine')) {
                    boombCount++;
                }

                if (flag) {
                    if (parseInt(element.getAttribute('data-bomb-count')) > 0 && element.className != 'open-field') {
                        element.classList.add('open-field');
                        element.innerText = element.getAttribute('data-bomb-count');
                        this.openField++;
                    }
                }
            }
        }
        var cell = document.querySelector('td[coord="' + coord + '"]');
        cell.setAttribute('data-bomb-count', boombCount);
    }

    this.showAllMineEndGame = function () {
        var mineField = document.querySelectorAll('td[data-mine="1"]');
        for (var i = 0; i < mineField.length; i++) {
            mineField[i].classList.add('show-mine');
        }
    }

    this.getAllEmptyField = function (coord) {
        this.openField++;

        var element = document.querySelector('td[coord="' + coord + '"]');
        var coordXY = coord.split('-');
        var x = parseInt(coordXY[0]);
        var y = parseInt(coordXY[1]);
        var maxSize = this.size - 1;
        element.classList.add('open-field');

        this.getMineCountForCell(coord, true);

        var points = [[x - 1, y],
            [x, y - 1], [x, y + 1],
            [x + 1, y]];

        for (var j = 0; j < 4; j++) {
            if (points[j][0] >= 0 && points[j][1] >= 0 && points[j][0] <= maxSize && points[j][1] <= maxSize) {
                var nextCoord = points[j].join('-');
                var nextElement = document.querySelector('td[coord="' + nextCoord + '"]');
                var countMineInCell = parseInt(nextElement.getAttribute('data-bomb-count'));
                var nextCellClass = nextElement.className;
                if (countMineInCell == 0 && nextCellClass != 'open-field') {
                    this.getAllEmptyField(nextCoord);
                }
            }
        }
    }

    this.startTimer = function () {
        self.timerId = setInterval(function () {
            self.mainElements.clock.value = parseInt(self.mainElements.clock.value) + 1
        }, 1000);
    }

    this.stopTimer = function () {
        clearInterval(self.timerId);
    }
};

window.onload = function () {
    (new App.Mine({}).render());
};

