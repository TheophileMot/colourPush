const EPSILON = 1;
const PUSH_MULTIPLIER = 1e4;

class Colour {

  constructor(r, g, b, fixed = false) {
    this.initial = { r, g, b };
    this.r = r;
    this.g = g;
    this.b = b;
    this.fixed = fixed;
  }

  get rgb() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
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
  let colourScheme = [
    // new Colour(  0,   0,   0, true),
    new Colour(  0,   0,   0, true),
    new Colour(255,   0,   0, true),
    new Colour(  0, 255,   0, true),
    new Colour(  0,   0, 255, true),
    new Colour(255, 255,   0, true),
    new Colour(255,   0, 255, true),
    new Colour(  0, 255, 255, true),
    new Colour(255, 255, 255, true),
    new Colour(128, 97, 84),
    new Colour(134, 169, 103),
    new Colour(196, 179, 126),
    new Colour(115, 122, 114),
    new Colour(214, 222, 209),
  ];

  for (let i = 0; i < colourScheme.length; i++) {
    let colour = colourScheme[i];
    let $square = $('<div>')
      .css('background-color', colour.rgb)
      .attr('id', `colour-box-current-${i}`);
    if (colourScheme[i].fixed) {
      $square.addClass('fixed');
    } else {
      let $innerSquare = $('<div>')
        .css('background-color', colour.rgb)
        .addClass('inset')
        .attr('id', `colour-box-initial-${i}`);
      $square.append($innerSquare);
    }
    $('.colourGrid').append($square);
  }

  return colourScheme;
}

function pushLoop(colourScheme) {
  pushColours(colourScheme);
  for (let i = 0; i < colourScheme.length; i++) {
    $(`#colour-box-current-${i}`).css('background-color', colourScheme[i].rgb);
  }
}

function pushColours(colourScheme) {
  if (!$('#button-push').hasClass('active')) { return; }

  for (let i = 0; i < colourScheme.length; i++) {
    for (let j = 0; j < colourScheme.length; j++) {
      if (i !== j) {
        colourScheme[i].pushFrom(colourScheme[j]);
        // TODO: all pushes should happen at once; make temp array for new values rather
        //       than changing actual array
      }
    }
    colourScheme[i].pushFrom(new Colour(colourScheme[i].r, colourScheme[i].g,   0));
    colourScheme[i].pushFrom(new Colour(colourScheme[i].r, colourScheme[i].g, 255));
    colourScheme[i].pushFrom(new Colour(colourScheme[i].r,   0, colourScheme[i].b));
    colourScheme[i].pushFrom(new Colour(colourScheme[i].r, 255, colourScheme[i].b));
    colourScheme[i].pushFrom(new Colour(  0, colourScheme[i].g, colourScheme[i].b));
    colourScheme[i].pushFrom(new Colour(255, colourScheme[i].g, colourScheme[i].b));
    // colourScheme[i].pushSelf();
  }
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