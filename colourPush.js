const EPSILON = 1;
const PUSH_MULTIPLIER = 1e2;

class Colour {

  constructor(r, g, b, fixed = false) {
    this.initial = { r, g, b };
    this.r = r;
    this.g = g;
    this.b = b;
    this.fixed = fixed;
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
    if (d > EPSILON) {
      this.r = clamp(this.r + PUSH_MULTIPLIER * (deltaR / d) / sqD, 0, 255);
      this.g = clamp(this.g + PUSH_MULTIPLIER * (deltaG / d) / sqD, 0, 255);
      this.b = clamp(this.b + PUSH_MULTIPLIER * (deltaB / d) / sqD, 0, 255);
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

}

$( document ).ready(() => {
  setUpButtons();
  let colourScheme = setUpColourScheme();

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
  ];
  let displayColours = [
    // new Colour(  0,   0,   0, true),
    // new Colour(128, 97, 84),
    // new Colour(134, 169, 103),
    // new Colour(196, 179, 126),
    // new Colour(115, 122, 114),
    // new Colour(214, 222, 209),
  ];

  for (let i = 0; i < 24; i++) {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    displayColours.push(new Colour(r, g, b));
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
  pushColours(colourScheme);
  for (let i = 0; i < colourScheme.displayColours.length; i++) {
    $(`#colour-box-current-${i}`).css('background-color', colourScheme.displayColours[i].rgb);
    $(`#colour-box-initial-${i}`).css('background-color', colourScheme.displayColours[i].initialRgb);
  }
}

function pushColours({ avoidColours, displayColours }) {
  if (!$('#button-push').hasClass('active')) { return; }

  for (let i = 0; i < displayColours.length; i++) {
    for (let j = 0; j < displayColours.length; j++) {
      if (i !== j) {
        displayColours[i].pushFrom(displayColours[j]);
        // TODO: all pushes should happen at once; make temp array for new values rather
        //       than changing actual array. Same applies to loop for avoid colours below.
      }
    }
    for (let j = 0; j < avoidColours.length; j++) {
      displayColours[i].pushFrom(avoidColours[j]);
    }
    displayColours[i].pushFrom(new Colour(displayColours[i].r, displayColours[i].g,   0));
    displayColours[i].pushFrom(new Colour(displayColours[i].r, displayColours[i].g, 255));
    displayColours[i].pushFrom(new Colour(displayColours[i].r,   0, displayColours[i].b));
    displayColours[i].pushFrom(new Colour(displayColours[i].r, 255, displayColours[i].b));
    displayColours[i].pushFrom(new Colour(  0, displayColours[i].g, displayColours[i].b));
    displayColours[i].pushFrom(new Colour(255, displayColours[i].g, displayColours[i].b));
  }

  displayColours.sort((colA, colB) => colA.luminance - colB.luminance);
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