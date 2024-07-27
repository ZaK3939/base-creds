import * as fs from 'fs';
import * as path from 'path';
import { SVG, registerWindow, Svg } from '@svgdotjs/svg.js';
import { JSDOM } from 'jsdom';
import { cardConfig } from './config';
import { setupDir } from './utils/setupDir';

const { window } = new JSDOM('');
registerWindow(window as any, window.document);

(window.SVGElement.prototype as any).getBBox = () => {
  return { x: 0, y: 0, width: cardConfig.width, height: cardConfig.height };
};

const suits = ['♠', '♣', '♥', '♦'] as const;
type Suit = (typeof suits)[number];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
type Rank = (typeof ranks)[number];

const RANK_SIZE = {
  CHARACTER: {
    SMALL: 33,
    BIG: 75,
  },
  NUMBER: {
    SMALL: 35,
    BIG: 85,
  },
};
const suitConfig = {
  '♠': { color: '#555', size: 35, symbol: 's' },
  '♣': { color: 'hsl(120, 70%, 25%)', size: 35, symbol: 'c' },
  '♥': { color: 'hsl(0, 70%, 50%)', size: 35, symbol: 'h' },
  '♦': { color: 'hsl(240, 70%, 50%)', size: 35, symbol: 'd' },
};

function generateCardSvg(rank: Rank, suit: Suit): Svg {
  const card = SVG().size(cardConfig.width, cardConfig.height);
  const color = suitConfig[suit].color;

  const gradient = card.gradient('linear', function (add) {
    add.stop(0, color, 1);
    add.stop(1, color, 0.6);
  });
  gradient.from(0, 0).to(0, 1);

  card.rect(cardConfig.width, cardConfig.height).radius(cardConfig.radius).fill('black');
  card
    .rect(cardConfig.width - 2, cardConfig.height - 2)
    .radius(cardConfig.radius)
    .fill('hsl');
  card
    .rect(cardConfig.width - 2 * cardConfig.front.inner.margin, cardConfig.height - 2 * cardConfig.front.inner.margin)
    .fill('black')
    .fill(gradient)
    .move(cardConfig.front.inner.margin, cardConfig.front.inner.margin)
    .radius(cardConfig.front.inner.radius);
  let text;
  if (isNaN(Number(rank))) {
    text = card
      .text(rank)
      .font({ family: cardConfig.fontFamily, size: RANK_SIZE.CHARACTER.SMALL, fill: 'white', weight: 'bold' });
    text.transform({ translate: [57 - text.bbox().width / 2, 33] });
    text = card
      .text(rank)
      .font({ family: cardConfig.fontFamily, size: RANK_SIZE.CHARACTER.BIG, fill: 'white', weight: 'bold' });
    text.transform({ translate: [85 - text.bbox().width / 2, 124] });
  } else if (rank === '10') {
    card
      .text('1')
      .font({ family: cardConfig.fontFamily, size: RANK_SIZE.NUMBER.SMALL, fill: 'white', weight: 'bold' })
      .move(1, 35);
    card
      .text('0')
      .font({ family: cardConfig.fontFamily, size: RANK_SIZE.NUMBER.SMALL, fill: 'white', weight: 'bold' })
      .move(16, 35);
    card
      .text('1')
      .font({ family: cardConfig.fontFamily, size: RANK_SIZE.NUMBER.BIG, fill: 'white', weight: 'bold' })
      .move(18, 124);
    card
      .text('0')
      .font({ family: cardConfig.fontFamily, size: RANK_SIZE.NUMBER.BIG, fill: 'white', weight: 'bold' })
      .move(51, 124);
  } else {
    card
      .text(rank)
      .font({ family: cardConfig.fontFamily, size: RANK_SIZE.NUMBER.SMALL, fill: 'white', weight: 'bold' })
      .move(9, 35);
    card
      .text(rank)
      .font({ family: cardConfig.fontFamily, size: RANK_SIZE.NUMBER.BIG, fill: 'white', weight: 'bold' })
      .move(43, 124);
  }
  card.text(suit).font({ size: suitConfig[suit].size, fill: 'white' }).move(2, 70);

  const logo = `
    <svg width="30" height="17" viewBox="0 0 776 440" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M131 23V46H295H459V64V82H469H479V64V46H610H741V64V82H758.5H776V261V440H645H514V422.5V405H504.5H495V422.5V440H429H363V422.5V405H345.521H328.041L327.771 384.75L327.5 364.5L270.25 364.242L213 363.984V401.992V440H147H81V422.5V405H63.5H46V268V131H23H0V65.5V0H65.5H131V23ZM28 66V104H65.5H103V66V28H65.5H28V66ZM150 112V150H112H74V263.512V377.024L111.75 376.762L149.5 376.5L149.762 338.75L150.024 301H225.512H301V187.5V74H225.5H150V112ZM356 225.5V377H393.5H431V339V301H469H507V339.012V377.024L544.75 376.762L582.5 376.5V225.5V74.5L544.75 74.238L507 73.976V149.488V225H469H431V149.5V74H393.5H356V225.5ZM637 225.5V377H675H713V225.5V74H675H637V225.5ZM225 187.5V225H187.5H150V187.5V150H187.5H225V187.5Z" fill="white"/>
    </svg>
  `;

  card.svg(logo).move(cardConfig.width - 35, 5);
  return card;
}

const outputDir = setupDir('frontCards');

suits.forEach((suit) => {
  ranks.forEach((rank) => {
    const cardSvg = generateCardSvg(rank, suit);
    const svgStr = cardSvg.svg();
    const rankName = rank === '10' ? 'T' : rank;
    const fileName = `${rankName}${suitConfig[suit].symbol}.svg`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, svgStr);
    console.log(`Saved ${fileName}`);
  });
});
