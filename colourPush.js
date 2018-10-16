class Colour {

  constructor(r, g, b) {
    this.initial = { r, g, b };
    this.r = r;
    this.g = g;
    this.b = b;
  }

  get rgb() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

}

$( document ).ready(() => {
  let colourScheme = [
    new Colour(128, 97, 84),
    new Colour(134, 169, 103),
    new Colour(196, 179, 126),
    new Colour(115, 122, 114),
    new Colour(214, 222, 209),
  ];

  for (let colour of colourScheme) {
    let $square = $('<div>').css('background-color', colour.rgb);
    $('.colourGrid').append($square);
  }
});