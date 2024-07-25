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

  return card;
}

const outputDir = setupDir('frontCards');

suits.forEach(suit => {
  ranks.forEach(rank => {
    const cardSvg = generateCardSvg(rank, suit);
    const svgStr = cardSvg.svg();
    const rankName = rank === '10' ? 'T' : rank;
    const fileName = `${rankName}${suitConfig[suit].symbol}.svg`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, svgStr);
    console.log(`Saved ${fileName}`);
  });
});
