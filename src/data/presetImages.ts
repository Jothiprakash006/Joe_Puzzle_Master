export interface PresetImage {
  id: string;
  title: string;
  category: 'Cyberpunk' | 'Nature' | 'Sci-Fi' | 'Gaming' | 'Abstract';
  url: string;
  author: string;
}

export const PRESET_IMAGES: PresetImage[] = [
  {
    id: 'cyber-city',
    title: 'Neon Cyber Metropolis',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
    author: 'Eleni Afiontzi',
  },
  {
    id: 'deep-space',
    title: 'Cosmic Nebula Galaxy',
    category: 'Sci-Fi',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1000&auto=format&fit=crop',
    author: 'Bryan Goff',
  },
  {
    id: 'neon-samurai',
    title: 'Cyberpunk Alleyway',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
    author: 'Alex Knight',
  },
  {
    id: 'enchanted-forest',
    title: 'Mystic Aurora Mountain',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
    author: 'Jonatan Pie',
  },
  {
    id: 'retrowave-grid',
    title: 'Synthwave Sunset Highway',
    category: 'Gaming',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop', // fallback to another reliable if needed
    author: 'Retro Synth',
  },
  {
    id: 'sakura-temple',
    title: 'Golden Sunset Pagoda',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop',
    author: 'Sorasak',
  },
  {
    id: 'abstract-neon',
    title: 'Prismatic Fluid Geometry',
    category: 'Abstract',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
    author: 'Michael Dziedzic',
  },
  {
    id: 'mecha-core',
    title: 'Futuristic Sci-Fi Reactor',
    category: 'Sci-Fi',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
    author: 'Sci-Fi Lab',
  },
  {
    id: 'gaming-setup',
    title: 'Ultimate RGB Battle Station',
    category: 'Gaming',
    url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000&auto=format&fit=crop',
    author: 'Carl Raw',
  },
  {
    id: 'geometric-fractal',
    title: 'Neon Matrix Fractals',
    category: 'Abstract',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop',
    author: 'Fakurian Design',
  }
];

export const CATEGORIES = ['All', 'Cyberpunk', 'Sci-Fi', 'Gaming', 'Nature', 'Abstract'] as const;

// Helper to generate a procedural fallback image if offline or CORS blocks canvas
export function generateProceduralImage(title: string): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    // Rich dark gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 800);
    grad.addColorStop(0, '#090514');
    grad.addColorStop(0.5, '#1e0c38');
    grad.addColorStop(1, '#051329');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 800);

    // Draw glowing cyber geometric patterns
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${(i * 18) % 360}, 85%, 60%, 0.4)`;
      ctx.lineWidth = Math.random() * 8 + 2;
      ctx.arc(400 + (Math.random() - 0.5) * 600, 400 + (Math.random() - 0.5) * 600, Math.random() * 250 + 20, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.lineWidth = 2;
    for (let x = 0; x < 800; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 800); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, x); ctx.lineTo(800, x); ctx.stroke();
    }

    // Title badge in center
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(150, 320, 500, 160);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 4;
    ctx.strokeRect(150, 320, 500, 160);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 36px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title.toUpperCase(), 400, 410);

    resolve(canvas.toDataURL('image/png'));
  });
}
