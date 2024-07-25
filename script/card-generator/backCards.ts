import * as fs from 'fs';
import * as path from 'path';
import { SVG, registerWindow, Svg } from '@svgdotjs/svg.js';
import { JSDOM } from 'jsdom';
import { cardConfig } from './config';
import { logo } from './logo';
import { setupDir } from './utils/setupDir';

const { window } = new JSDOM('');
registerWindow(window as any, window.document);

(window.SVGElement.prototype as any).getBBox = () => {
  return { x: 0, y: 0, width: cardConfig.width, height: cardConfig.height };
};

function createCardSvg(): Svg {
  const card = SVG().size(cardConfig.width, cardConfig.height);
  card.rect(cardConfig.width, cardConfig.height).radius(cardConfig.radius).fill('white');
  card
    .rect(cardConfig.width - 2 * cardConfig.back.inner.margin, cardConfig.height - 2 * cardConfig.back.inner.margin)
    .fill('gray')
    .move(cardConfig.back.inner.margin, cardConfig.back.inner.margin)
    .radius(cardConfig.back.inner.radius);
  const svgImageUrl = 'data:image/svg+xml;base64,' + btoa(logo);
  card.image(svgImageUrl).size(60, 60).move(20, 40);

  return card;
}

const outputDir = setupDir('backCards');
const cardSvg = createCardSvg();
const cardSvgStr = cardSvg.svg();
const fileName = 'back.svg';
const filePath = path.join(outputDir, fileName);
fs.writeFileSync(filePath, cardSvgStr);
console.log(`Saved ${fileName}`);
