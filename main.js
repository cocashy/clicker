function draw() {
  if (canvas.getContext) {
    const ctx = canvas.getContext('2d');

    function updateBack() {
      Back.h = (Back.h + 0.05) % 360;
    }

    function drawBack() {
      function hsvToRGB(hue, saturation, value) {
        var hi;
        var f;
        var p;
        var q;
        var t;

        while (hue < 0) {
          hue += 360;
        }
        hue = hue % 360;

        saturation = saturation < 0 ? 0 :
          saturation > 1 ? 1 :
          saturation;

        value = value < 0 ? 0 :
          value > 1 ? 1 :
          value;

        value *= 255;
        hi = (hue / 60 | 0) % 6;
        f = hue / 60 - hi;
        p = value * (1 - saturation) | 0;
        q = value * (1 - f * saturation) | 0;
        t = value * (1 - (1 - f) * saturation) | 0;
        value |= 0;

        switch (hi) {
          case 0:
            return [value, t, p];
          case 1:
            return [q, value, p];
          case 2:
            return [p, value, t];
          case 3:
            return [p, q, value];
          case 4:
            return [t, p, value];
          case 5:
            return [value, p, q];
        }

        throw new Error('invalid hue');
      }
      ctx.beginPath();
      const [r, g, b] = hsvToRGB(Back.h, Back.s, Back.v);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    function drawWatt() {
      ctx.beginPath();
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = `${HEIGHT/8}px ${FONT}`;
      const nowWatt = Math.floor(User.watt);
      ctx.fillText(nowWatt + 'W', WIDTH / 2, 0, WIDTH * 3 / 4);
    }

    function updateWattPs() {
      User.wattPs = User.plant.genecon * Game.plantPs.genecon +
        User.plant.hydroPowerPlant * Game.plantPs.hydroPowerPlant;
    }

    function drawWattPs() {
      ctx.beginPath();
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = `${HEIGHT/16}px ${FONT}`;
      ctx.fillText(User.wattPs + 'Ws', WIDTH / 2, HEIGHT / 8, WIDTH / 2);
    }

    function updateMark() {
      Mark.symbol = Game.symbolList[0].symbol;
      if (Mark.isClicked) {
        Mark.size -= Mark.shrinkVelocity;
        Mark.shrinkVelocity -= Mark.expandVelocity;
        if (Mark.size > Mark.sizeDefault) {
          Mark.isClicked = false;
          Mark.size = Mark.sizeDefault
        }
        if (Mark.size < 0) {
          Mark.size = 1;
        }
      }
    }

    function drawMark() {
      ctx.beginPath();
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${Mark.size}px ${FONT}`;
      ctx.fillText(Mark.symbol, WIDTH / 2, HEIGHT / 2);
    }

    function drawRoundedRect(obj) {
      ctx.beginPath();
      ctx.fillStyle = 'white';
      ctx.moveTo(obj.x, obj.y + obj.r);
      ctx.arc(obj.x + obj.r, obj.y + obj.h - obj.r, obj.r, Math.PI, Math.PI * 0.5, true);
      ctx.arc(obj.x + obj.w - obj.r, obj.y + obj.h - obj.r, obj.r, Math.PI * 0.5, 0, 1);
      ctx.arc(obj.x + obj.w - obj.r, obj.y + obj.r, obj.r, 0, Math.PI * 1.5, 1);
      ctx.arc(obj.x + obj.r, obj.y + obj.r, obj.r, Math.PI * 1.5, Math.PI, 1);
      ctx.fill();
    }

    updateBack();
    drawBack();

    updateWattPs();
    drawWatt();

    drawWattPs();

    updateMark();
    drawMark();

    drawRoundedRect(Balloon);

    drawRoundedRect(Menu);
  }
}

const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const isWide = WIDTH > HEIGHT;
const FONT = '??????????????????????????????????????????-08';

const plant = [
  'genecon',
  'hydroPowerPlant'
];

const User = {
  watt: 0,
  wattPs: 0,
  wattPclick: 1,
  plant: {
    genecon: 1,
    hydroPowerPlant: 1
  }
}

const Game = {
  plantPs: {
    genecon: 0.1,
    hydroPowerPlant: 2
  },
  symbolList: [{
      name: '?????????',
      symbol: '???'
    },
    {
      name: '?????????',
      symbol: '???'
    },
    {
      name: '????????????',
      symbol: '???'
    },
    {
      name: '?????????',
      symbol: '???'
    }
  ]
}

const Mark = {
  symbol: '???',
  isClicked: false,
  size: HEIGHT / 3,
  sizeDefault: HEIGHT / 3,
  shrinkVelocityDefault: 8,
  shrinkVelocity: 0,
  expandVelocity: 1
}

const Back = {
  h: 180,
  s: 10,
  v: 100
}

const Balloon = {
  x: isWide ? WIDTH / 2 - 300 : WIDTH / 8,
  y: HEIGHT * 13 / 64,
  w: isWide ? 600 : WIDTH * 3 / 4,
  h: HEIGHT / 8,
  r: 10
}

const Menu = {
  x: isWide ? WIDTH / 2 - 300 : WIDTH / 8,
  highY: HEIGHT * 7 / 10,
  lowY: HEIGHT * 9 / 10,
  y: HEIGHT * 7 / 10,
  w: isWide ? 600 : WIDTH * 3 / 4,
  h: HEIGHT,
  r: 10
}

canvas.addEventListener('click', function(e) {
  User.watt += User.wattPclick;
  Mark.isClicked = true;
  Mark.shrinkVelocity = Mark.shrinkVelocityDefault;
  audio.src = './audio/click.wav';
  audio.play();
}, false);

document.addEventListener("dblclick", function(e) {
  e.preventDefault();
}, {
  passive: false
});

setInterval(function() {
  User.watt += User.wattPs;
}, 1000);

setInterval(draw, 10);
