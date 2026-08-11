import { PuzzlePiece, PieceStyle } from '../types/game';
import { generateProceduralImage } from '../data/presetImages';

// Crop and resize any image (File or URL) to a clean 800x800 square for consistent high-performance slicing
export async function prepareSquareImage(imageSource: string | File): Promise<{ dataUrl: string; title: string }> {
  let url = imageSource;
  let title = 'Custom Upload';

  if (imageSource instanceof File) {
    url = URL.createObjectURL(imageSource);
    title = imageSource.name.replace(/\.[^/.]+$/, '');
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 800; // Optimal resolution for retina screens and fast 60fps slicing
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ dataUrl: typeof url === 'string' ? url : '', title });
        return;
      }

      // Center crop square calculation
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;

      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
      const dataUrl = canvas.toDataURL('image/webp', 0.9);
      if (imageSource instanceof File) {
        URL.revokeObjectURL(url as string);
      }
      resolve({ dataUrl, title });
    };

    img.onerror = async () => {
      // Automatic fallback if CORS or network blocks canvas reading
      console.warn('Image load failed or blocked by CORS. Using procedural fallback.');
      const fallbackUrl = await generateProceduralImage(typeof title === 'string' ? title : 'Puzzle Master');
      resolve({ dataUrl: fallbackUrl, title: title + ' (Cyber Edition)' });
    };

    img.src = url as string;
  });
}

// Generate jigsaw tabs matrix: returns grid of tabs [top, right, bottom, left] where 1 is out, -1 is in, 0 is flat
function generateJigsawTabs(gridSize: number): [number, number, number, number][][] {
  const tabs: [number, number, number, number][][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => [0, 0, 0, 0])
  );

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Top tab is opposite of top neighbor's bottom tab
      if (r > 0) {
        tabs[r][c][0] = -tabs[r - 1][c][2];
      }
      // Left tab is opposite of left neighbor's right tab
      if (c > 0) {
        tabs[r][c][3] = -tabs[r][c - 1][1];
      }
      // Right tab random (unless right edge)
      if (c < gridSize - 1) {
        tabs[r][c][1] = Math.random() > 0.5 ? 1 : -1;
      }
      // Bottom tab random (unless bottom edge)
      if (r < gridSize - 1) {
        tabs[r][c][2] = Math.random() > 0.5 ? 1 : -1;
      }
    }
  }
  return tabs;
}

// Draw a jigsaw path on Canvas rendering context
export function drawJigsawPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  tabs: [number, number, number, number]
) {
  const [top, right, bottom, left] = tabs;
  const tabSize = size * 0.22; // Height of tab

  ctx.beginPath();
  ctx.moveTo(x, y);

  // Top edge
  if (top === 0) {
    ctx.lineTo(x + size, y);
  } else {
    const midX = x + size / 2;
    const sign = -top; // -1 points up (outward for top), 1 points down
    ctx.lineTo(midX - size * 0.2, y);
    ctx.bezierCurveTo(
      midX - size * 0.15, y + sign * tabSize,
      midX - size * 0.1,  y + sign * tabSize * 1.3,
      midX,               y + sign * tabSize
    );
    ctx.bezierCurveTo(
      midX + size * 0.1,  y + sign * tabSize * 1.3,
      midX + size * 0.15, y + sign * tabSize,
      midX + size * 0.2,  y
    );
    ctx.lineTo(x + size, y);
  }

  // Right edge
  if (right === 0) {
    ctx.lineTo(x + size, y + size);
  } else {
    const midY = y + size / 2;
    const sign = right; // 1 points right (outward)
    ctx.lineTo(x + size, midY - size * 0.2);
    ctx.bezierCurveTo(
      x + size + sign * tabSize,       midY - size * 0.15,
      x + size + sign * tabSize * 1.3, midY - size * 0.1,
      x + size + sign * tabSize,       midY
    );
    ctx.bezierCurveTo(
      x + size + sign * tabSize * 1.3, midY + size * 0.1,
      x + size + sign * tabSize,       midY + size * 0.15,
      x + size,                        midY + size * 0.2
    );
    ctx.lineTo(x + size, y + size);
  }

  // Bottom edge
  if (bottom === 0) {
    ctx.lineTo(x, y + size);
  } else {
    const midX = x + size / 2;
    const sign = bottom; // 1 points down (outward)
    ctx.lineTo(midX + size * 0.2, y + size);
    ctx.bezierCurveTo(
      midX + size * 0.15, y + size + sign * tabSize,
      midX + size * 0.1,  y + size + sign * tabSize * 1.3,
      midX,               y + size + sign * tabSize
    );
    ctx.bezierCurveTo(
      midX - size * 0.1,  y + size + sign * tabSize * 1.3,
      midX - size * 0.15, y + size + sign * tabSize,
      midX - size * 0.2,  y + size
    );
    ctx.lineTo(x, y + size);
  }

  // Left edge
  if (left === 0) {
    ctx.lineTo(x, y);
  } else {
    const midY = y + size / 2;
    const sign = -left; // -1 points left (outward)
    ctx.lineTo(x, midY + size * 0.2);
    ctx.bezierCurveTo(
      x + sign * tabSize,       midY + size * 0.15,
      x + sign * tabSize * 1.3, midY + size * 0.1,
      x + sign * tabSize,       midY
    );
    ctx.bezierCurveTo(
      x + sign * tabSize * 1.3, midY - size * 0.1,
      x + sign * tabSize,       midY - size * 0.15,
      x,                        midY - size * 0.2
    );
    ctx.lineTo(x, y);
  }

  ctx.closePath();
}

// Slice image into puzzle pieces and shuffle
export async function createPuzzlePieces(
  imageSrc: string,
  gridSize: number,
  style: PieceStyle
): Promise<PuzzlePiece[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      const pieceSize = img.width / gridSize;
      const pieces: PuzzlePiece[] = [];
      const tabsMatrix = style === 'jigsaw' ? generateJigsawTabs(gridSize) : null;

      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const canvas = document.createElement('canvas');
          
          if (style === 'jigsaw' && tabsMatrix) {
            // Need extra margin for jigsaw tabs sticking out
            const margin = pieceSize * 0.3;
            canvas.width = pieceSize + margin * 2;
            canvas.height = pieceSize + margin * 2;
            const ctx = canvas.getContext('2d')!;

            ctx.save();
            drawJigsawPath(ctx, margin, margin, pieceSize, tabsMatrix[r][c]);
            ctx.clip();

            // Draw image chunk offset by margin
            ctx.drawImage(
              img,
              c * pieceSize - margin,
              r * pieceSize - margin,
              pieceSize + margin * 2,
              pieceSize + margin * 2,
              0,
              0,
              pieceSize + margin * 2,
              pieceSize + margin * 2
            );
            ctx.restore();

            // Add sleek 3D bevel / border outline for jigsaw
            ctx.save();
            drawJigsawPath(ctx, margin, margin, pieceSize, tabsMatrix[r][c]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.stroke();
            ctx.restore();

          } else {
            // Modern square card style
            canvas.width = pieceSize;
            canvas.height = pieceSize;
            const ctx = canvas.getContext('2d')!;

            ctx.drawImage(
              img,
              c * pieceSize,
              r * pieceSize,
              pieceSize,
              pieceSize,
              0,
              0,
              pieceSize,
              pieceSize
            );

            // Sleek cyberpunk inner glow / border for modern style
            ctx.lineWidth = Math.max(2, pieceSize * 0.015);
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
            ctx.strokeRect(0, 0, pieceSize, pieceSize);
          }

          const index = r * gridSize + c;
          pieces.push({
            id: `piece-${r}-${c}`,
            index,
            row: r,
            col: c,
            currentPos: { x: 0, y: 0 }, // Will be assigned during tray shuffle
            targetPos: { x: c, y: r },
            isLocked: false,
            isInTray: true,
            dataUrl: canvas.toDataURL('image/webp', 0.85),
            tabs: tabsMatrix ? tabsMatrix[r][c] : undefined,
          });
        }
      }

      // Shuffle pieces randomly
      const shuffled = [...pieces];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Assign initial layout positions in the tray
      shuffled.forEach((piece, idx) => {
        piece.currentPos = { x: idx % gridSize, y: Math.floor(idx / gridSize) };
      });

      resolve(shuffled);
    };

    img.onerror = () => {
      console.error('Failed to slice image. Resolving empty array.');
      resolve([]);
    };
  });
}
