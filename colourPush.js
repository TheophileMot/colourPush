const EPSILON = { pull: Infinity, push: 1};
const PUSH_MULTIPLIER = 1e3;
const WALL_PUSH_DIST = 32;
const FRICTION = 0.99;
const TETHER = 0.03;

class Colour {

  constructor(r, g, b, fixed = false, mass = 1) {
    this.initial = { r, g, b };
    this.r = r;
    this.g = g;
    this.b = b;

    this.fixed = fixed;
    this.mass = mass;
    this.velocity = { r: 0, g: 0, b: 0 };
  }

  get initialRgb() {
    return `rgb(${this.initial.r}, ${this.initial.g}, ${this.initial.b})`;
  }

  get rgb() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  get luminance() {
    return (0.299 * this.r + 0.587 * this.g + 0.114 * this.b) / 255;
  }

  pushFrom(otherColour) {
    if (this.fixed) { return; }

    let deltaR = this.r - otherColour.r;
    let deltaG = this.g - otherColour.g;
    let deltaB = this.b - otherColour.b;
    let sqD = 3 * deltaR * deltaR + 4 * deltaG * deltaG + 2 * deltaB * deltaB;
    let d = Math.sqrt(sqD);
    let massCoeff = this.mass * otherColour.mass;
    let direction = massCoeff > 0 ? 'push' : 'pull';
    if (d > EPSILON[direction]) {
      this.velocity.r += PUSH_MULTIPLIER * massCoeff * (deltaR / d) / sqD;
      this.velocity.g += PUSH_MULTIPLIER * massCoeff * (deltaG / d) / sqD;
      this.velocity.b += PUSH_MULTIPLIER * massCoeff * (deltaB / d) / sqD;
    }
  }

  pushSelf() {
    let deltaR = this.initial.r - this.r;
    let deltaG = this.initial.g - this.g;
    let deltaB = this.initial.b - this.b;
    let sqD = 3 * deltaR * deltaR + 4 * deltaG * deltaG + 2 * deltaB * deltaB;
    let d = Math.sqrt(sqD);
    if (d > 32) {
      this.r = clamp(this.r + PUSH_MULTIPLIER * (deltaR / d) / sqD, 0, 255);
      this.g = clamp(this.g + PUSH_MULTIPLIER * (deltaG / d) / sqD, 0, 255);
      this.b = clamp(this.b + PUSH_MULTIPLIER * (deltaB / d) / sqD, 0, 255);
    }
  }

  moveStep() {
    this.velocity.r *= FRICTION;
    this.velocity.g *= FRICTION;
    this.velocity.b *= FRICTION;

    this.r = clamp(TETHER * this.initial.r + (1 - TETHER) * (this.r + this.velocity.r), 0, 255);
    this.g = clamp(TETHER * this.initial.g + (1 - TETHER) * (this.g + this.velocity.g), 0, 255);
    this.b = clamp(TETHER * this.initial.b + (1 - TETHER) * (this.b + this.velocity.b), 0, 255);
  }

}

$( document ).ready(() => {
  setUpButtons();
  let colourScheme = setUpColourScheme();
  updateCanvas(colourScheme);

  setInterval(() => pushLoop(colourScheme), 10);
});

function setUpButtons() {
  $('.buttons > span').click(function() {
    if (!$(this).hasClass('active')) {
      togglePush();
    }
  });
}

function togglePush() {
  $('.buttons > span').toggleClass('active');
}

function setUpColourScheme() {
  let avoidColours = [
    new Colour(  0,   0,   0, true),
    new Colour(255,   0,   0, true),
    new Colour(  0, 255,   0, true),
    new Colour(  0,   0, 255, true),
    new Colour(255, 255,   0, true),
    new Colour(255,   0, 255, true),
    new Colour(  0, 255, 255, true),
    new Colour(255, 255, 255, true),
    // new Colour(128, 128, 128, true, -1),
    // new Colour(192,   0,   0, true, -1),
  ];
  let displayColours = [
    new Colour(128, 97, 84),
    new Colour(134, 169, 103),
    new Colour(196, 179, 126),
    new Colour(115, 122, 114),
    new Colour(214, 222, 209),
  ];
  // displayColours = [];

  for (let i = 0; i < 0; i++) {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    displayColours.push(new Colour(r, g, b));
    console.log(`${r} ${g} ${b}`);
  }

  for (let i = 0; i < displayColours.length; i++) {
    let colour = displayColours[i];
    let $square = $('<div>')
      .css('background-color', colour.rgb)
      .attr('id', `colour-box-current-${i}`);
    if (displayColours[i].fixed) {
      $square.addClass('fixed');
    } else {
      let $innerSquare = $('<div>')
        .css('background-color', colour.rgb)
        .addClass('inset')
        .attr('id', `colour-box-initial-${i}`);
      $square.append($innerSquare);
    }
    $('.colour-grid').append($square);
  }

  return { avoidColours, displayColours };
}

function pushLoop(colourScheme) {
  if (!$('#button-push').hasClass('active')) { return; }

  pushColours(colourScheme);
  moveColours(colourScheme);
  // colourScheme.displayColours.sort((colourA, colourB) => colourA.luminance - colourB.luminance);
  for (let i = 0; i < colourScheme.displayColours.length; i++) {
    $(`#colour-box-current-${i}`).css('background-color', colourScheme.displayColours[i].rgb);
    $(`#colour-box-initial-${i}`).css('background-color', colourScheme.displayColours[i].initialRgb);
  }
  updateCanvas(colourScheme);
}

function pushColours({ avoidColours, displayColours }) {
  for (let colourA of displayColours) {
    for (let colourB of displayColours) {
      if (colourA !== colourB) {
        colourA.pushFrom(colourB);
        // TODO: all pushes should happen at once; make temp array for new values rather
        //       than changing actual array. Same applies to loop for avoid colours below.
      }
    }
    for (let colourB of avoidColours) {
      colourA.pushFrom(colourB);
    }
    colourA.pushFrom(new Colour(colourA.r, colourA.g, -WALL_PUSH_DIST, true, 0.5));
    colourA.pushFrom(new Colour(colourA.r, colourA.g, 255 + WALL_PUSH_DIST, true, 0.5));
    colourA.pushFrom(new Colour(colourA.r, -WALL_PUSH_DIST, colourA.b, true, 0.5));
    colourA.pushFrom(new Colour(colourA.r, 255 + WALL_PUSH_DIST, colourA.b, true, 0.5));
    colourA.pushFrom(new Colour(-WALL_PUSH_DIST, colourA.g, colourA.b, true, 0.5));
    colourA.pushFrom(new Colour(255 + WALL_PUSH_DIST, colourA.g, colourA.b, true, 0.5));
  }
}

function moveColours({ displayColours }) {
  for (let colour of displayColours) {
    colour.moveStep();
  }
}

function updateCanvas(colourScheme) {
  let canvas = document.getElementById('push-map');
  let ctx = canvas.getContext('2d');

  // Clear canvas.
  ctx.fillStyle = '#aaa';
  ctx.fillRect(1, 1, 400, 240);
  
  // Sort by depth of 3d display.
  let allColours = [...colourScheme.avoidColours, ...colourScheme.displayColours];
  allColours.sort((colourA, colourB) => (colourA.r - colourA.g) - (colourB.r - colourB.g));
  for (let colour of allColours) {
    drawPoint3d(ctx, colour);
  }
}

function drawPoint3d(ctx, colour) {
  let { r, g, b } = colour;
  // Scale to [-50, 50].
  let scaledR = (r / 255 - 0.5) * 100;
  let scaledG = (g / 255 - 0.5) * 100;
  let scaledB = (b / 255 - 0.5) * 100;
  let x = 200 + scaledR + scaledG;
  let y = 120 + 0.5 * scaledR - 0.5 * scaledG - scaledB;

  // let borderColour = colour.luminance < 0.5 ? '#fff' : '#000';
  let reverseLum = 255 * (1 - colour.luminance);
  let borderColour = new Colour(reverseLum, reverseLum, reverseLum).rgb;
  if (colour.fixed ) {
    drawDisc3d(ctx, x, y, colour, 8 + 5 * (r - g) / 255, { borderColour });
  } else {
    drawSquare(ctx, x, y, colour, 8 + 5 * (r - g) / 255, borderColour);
  }
}

function drawDisc3d(ctx, x, y, colour, size, { borderColour = '#000', stroke = true }) {
  if (borderColour && !stroke) {
    ctx.beginPath();
    ctx.fillStyle = borderColour;
    ctx.arc(x, y, size + 1, 0, 2 * Math.PI);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.fillStyle = colour.rgb;
  ctx.strokeStyle = colour.rgb;
  ctx.lineWidth = size / 5;
  ctx.arc(x, y, size, 0, 2 * Math.PI);
  stroke ? ctx.stroke() : ctx.fill();
}

function drawSquare(ctx, x, y, colour, size, borderColour = '#000') {
  if (borderColour) {
    ctx.fillStyle = borderColour;
    ctx.fillRect(x - size, y - size, 2 * size + 1, 2 * size + 1);
  }
  ctx.fillStyle = colour.rgb;
  ctx.fillRect(x + 1 - size, y + 1 - size, 2 * size - 1, 2 * size - 1);
}

function clamp(x, min, max) {
  if (x < min) {
    return min;
  } else if (x > max) {
    return max;
  } else {
    return x;
  }
}