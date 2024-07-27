import * as fs from 'fs';
import * as path from 'path';

export const setupDir = (kind: string): string => {
  const date = new Date();
  const dateStr = `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`;
  const artifactsDir = path.join(__dirname, '../artifacts');
  const cardsDir = path.join(artifactsDir, kind);
  const outputDir = path.join(cardsDir, dateStr);

  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir);
  }

  if (!fs.existsSync(cardsDir)) {
    fs.mkdirSync(cardsDir);
  }

  if (fs.existsSync(outputDir)) {
    fs.rmdirSync(outputDir, { recursive: true });
  }

  fs.mkdirSync(outputDir);

  return outputDir;
};
