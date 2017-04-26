var Sweeper = function (elementId) {
  this.setDomElement(elementId);
  this.createField(16, 30);
  // this.spawnMines(99);
}

Sweeper.prototype.createField = function (rows, cols) {
  this.rows = rows;
  this.cols = cols;
  this.field = [];
  this.slots = [];

  for (var y = 0; y < rows; y++) {
    var row = [];
    for (var x = 0; x < cols; x++) {
      row.push({mine: false, revealed: false, marked: false, neighbourMines: 0});
      this.slots.push({x: x, y: y});
    }
    this.field.push(row);
  }
};

Sweeper.prototype.setStartField = function (x, y) {
  var that = this;
  this.doForNeighbours(x, y, function (_x, _y) {
    var index = that.slots.findIndex(function (value) {
      return value.x === _x && value.y === _y;
    });
    that.slots.splice(index, 1);
  });
};

Sweeper.prototype.spawnMines = function (count) {
  for (var i = 0; i < count; i++) {
    var index = Math.floor(Math.random() * this.slots.length);
    var coord = this.slots.splice(index, 1)[0];
    this.field[coord.y][coord.x].mine = true;
    this.updateNeighbourMineCount(coord.x, coord.y);
  }
};

Sweeper.prototype.doForNeighbours = function (x, y, callback, exclude = false) {
  for (var offsetY = -1; offsetY < 2; offsetY++) {
    for (var offsetX = -1; offsetX < 2; offsetX++) {
      var currY = y + offsetY;
      var currX = x + offsetX;
      if (currX >= 0 && currY >= 0 && currY < this.field.length && currX < this.field[currY].length) {
        if (!(exclude && offsetY === 0 && offsetX === 0)) {
          callback(currX, currY);
        }
      }
    }
  }
};

Sweeper.prototype.handleClick = function (x, y) {
  if (!this.running) {
    this.createField(this.rows, this.cols);
    this.setStartField(x, y);
    this.spawnMines(99);
    this.running = true;
  }
  this.reveal(x, y);
  this.display();
};

Sweeper.prototype.handleRightClick = function (x, y) {
  var slot = this.field[y][x];
  if (!slot.revealed) {
    slot.marked = !slot.marked;
    this.display();
  }
}

Sweeper.prototype.reveal = function (x, y) {
  var slot = this.field[y][x];
  if (!slot.revealed && !slot.marked) {
    slot.revealed = true;
    if (slot.mine) {
      alert('kaboom');
      this.running = false;
    } else if (slot.neighbourMines === 0) {
      var that = this;
      this.doForNeighbours(x, y, function (_x, _y) {
        that.reveal(_x, _y);
      }, true);
    }
  }
};

Sweeper.prototype.updateNeighbourMineCount = function (x, y) {
  var that = this;
  this.doForNeighbours(x, y, function (_x, _y) {
    that.field[_y][_x].neighbourMines++;
  });
};


Sweeper.prototype.setDomElement = function (elementId) {
  this.domElement = document.getElementById(elementId);
};

Sweeper.prototype.display = function (elementId) {
  this.domElement.innerHTML = this.generateHtml();

  var elements = document.getElementsByClassName('cell');

  var getCoordinates = function (cellId) {
    var parts = cellId.split(':');
    var x = parseInt(parts[1]);
    var y = parseInt(parts[2]);
    return {x: x, y: y};
  };

  var that = this;
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', function (event) {
      var coords = getCoordinates(event.target.id);
      that.handleClick(coords.x, coords.y);
      return false;
    });
    elements[i].addEventListener('contextmenu', function (event) {
      event.preventDefault();
      var coords = getCoordinates(event.target.id);
      that.handleRightClick(coords.x, coords.y);
      return false;
    });
  }
};

Sweeper.prototype.generateHtml = function () {
  var html = '';

  for (var y = 0; y < this.field.length; y++) {
    html += '<div class="row">';
    for (var x = 0; x < this.field[y].length; x++) {
      var id = 'sweepercell:' + x + ':' + y;
      var properties = this.getCellProperties(x, y);
      var value = this.field[y][x] === 0 ? '&nbsp;' : this.field[y][x];
      html += '<div class="cell ' + properties.className + '" id="' + id + '">' + properties.value + '</div>';
    }
    html += '</div>'
  }

  return html;
};

Sweeper.prototype.getCellProperties = function (x, y) {
  var slot = this.field[y][x];

  var value = slot.mine ? '*' : slot.neighbourMines;
  if (!slot.revealed || slot.neighbourMines === 0) {
    value = '&nbsp;';
  }
  if (slot.marked) {
    value = '!';
  }

  var className = slot.revealed ? 'revealed' : 'hidden';

  return { value: value, className: className };
};
