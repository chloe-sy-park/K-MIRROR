export interface CelebProfile {
  id: string;
  name: string;
  group: string;
  genre: 'K-Pop' | 'K-Drama' | 'K-Beauty' | 'K-Film';
  mood: 'Natural' | 'Elegant' | 'Powerful' | 'Cute';
  imageUrl?: string;
  signatureLook: string;
  popularityScore: number; // 1-100
}

export const CELEB_GALLERY: CelebProfile[] = [
  {
    id: 'wonyoung',
    name: 'Wonyoung',
    group: 'IVE',
    genre: 'K-Pop',
    mood: 'Elegant',
    signatureLook: 'Strawberry Moon Glass Skin',
    popularityScore: 98,
  },
  {
    id: 'jennie',
    name: 'Jennie',
    group: 'BLACKPINK',
    genre: 'K-Pop',
    mood: 'Powerful',
    signatureLook: 'Cool-Tone Smoky Cat Eye',
    popularityScore: 99,
  },
  {
    id: 'iu',
    name: 'IU',
    group: 'Solo',
    genre: 'K-Pop',
    mood: 'Natural',
    signatureLook: 'Soft Dewy Natural Gradient Lip',
    popularityScore: 97,
  },
  {
    id: 'suzy',
    name: 'Suzy',
    group: 'Solo',
    genre: 'K-Drama',
    mood: 'Natural',
    signatureLook: 'Clean Girl No-Makeup Makeup',
    popularityScore: 95,
  },
  {
    id: 'lisa',
    name: 'Lisa',
    group: 'BLACKPINK',
    genre: 'K-Pop',
    mood: 'Powerful',
    signatureLook: 'Sharp Wing Liner + Bold Lip',
    popularityScore: 98,
  },
  {
    id: 'winter',
    name: 'Winter',
    group: 'aespa',
    genre: 'K-Pop',
    mood: 'Cute',
    signatureLook: 'Cyber Y2K Glitter Eye',
    popularityScore: 93,
  },
  {
    id: 'han-sohee',
    name: 'Han So-hee',
    group: 'Solo',
    genre: 'K-Drama',
    mood: 'Elegant',
    signatureLook: 'Minimal Chic Muted Rose',
    popularityScore: 94,
  },
  {
    id: 'jisoo',
    name: 'Jisoo',
    group: 'BLACKPINK',
    genre: 'K-Pop',
    mood: 'Elegant',
    signatureLook: 'Classic Korean Beauty Radiant Base',
    popularityScore: 96,
  },
  {
    id: 'sullyoon',
    name: 'Sullyoon',
    group: 'NMIXX',
    genre: 'K-Pop',
    mood: 'Natural',
    signatureLook: 'Fresh Peach Tone No-Contour',
    popularityScore: 90,
  },
  {
    id: 'song-hyekyo',
    name: 'Song Hye-kyo',
    group: 'Solo',
    genre: 'K-Drama',
    mood: 'Elegant',
    signatureLook: 'Timeless K-Beauty Glow',
    popularityScore: 92,
  },
  {
    id: 'karina',
    name: 'Karina',
    group: 'aespa',
    genre: 'K-Pop',
    mood: 'Powerful',
    signatureLook: 'AI Doll Sharp Contour',
    popularityScore: 95,
  },
  {
    id: 'pony',
    name: 'PONY (Park Hye-min)',
    group: 'Solo',
    genre: 'K-Beauty',
    mood: 'Elegant',
    signatureLook: 'Professional Editorial Transformation',
    popularityScore: 91,
  },
];
