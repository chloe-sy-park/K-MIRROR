export interface Expert {
  id: string;
  name: string;
  nameKo: string;
  role: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  bio: string;
  priceRange: string;
  languages: string[];
  melaninExpertise: string;
  contactUrl: string;
  contactType: 'instagram' | 'kakao' | 'calendly' | 'email';
}

export const EXPERTS: Expert[] = [
  {
    id: 'director-kim',
    name: 'Director Kim',
    nameKo: '김 디렉터',
    role: 'Editorial Lead Stylist',
    specialty: 'K-Drama Red Carpet',
    rating: 4.9,
    reviewCount: 342,
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    bio: 'Former head stylist at YG Entertainment. 15 years of editorial and red carpet experience. Specialized in creating "glass skin" looks that work across all skin tones.',
    priceRange: '$120 — $200 / session',
    languages: ['Korean', 'English', 'Japanese'],
    melaninExpertise: 'L1-L4 (Fair to Medium-Deep)',
    contactUrl: 'https://www.instagram.com',
    contactType: 'instagram',
  },
  {
    id: 'stylist-han',
    name: 'Stylist Han',
    nameKo: '한 스타일리스트',
    role: 'Idol Visual Director',
    specialty: 'Stage & Performance Makeup',
    rating: 5.0,
    reviewCount: 218,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    bio: 'Creative director behind trending K-Pop idol looks. Expert in camera-optimized, high-impact makeup designed for stage lighting and HD broadcasting.',
    priceRange: '$150 — $280 / session',
    languages: ['Korean', 'English'],
    melaninExpertise: 'L1-L6 (All Tones)',
    contactUrl: 'https://www.instagram.com',
    contactType: 'instagram',
  },
  {
    id: 'master-park',
    name: 'Master Park',
    nameKo: '박 마스터',
    role: 'Osteo-Aesthetics Specialist',
    specialty: 'Bone Structure Contouring',
    rating: 4.8,
    reviewCount: 156,
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    bio: 'Pioneer of the "Sherlock Method" for facial proportion analysis. Develops personalized contouring strategies based on individual bone structure, not trends.',
    priceRange: '$100 — $180 / session',
    languages: ['Korean', 'English', 'Mandarin'],
    melaninExpertise: 'L3-L6 (Medium to Deep)',
    contactUrl: 'https://www.instagram.com',
    contactType: 'instagram',
  },
  {
    id: 'artist-lee',
    name: 'Artist Lee',
    nameKo: '이 아티스트',
    role: 'Global Beauty Consultant',
    specialty: 'Inclusive K-Beauty Adaptation',
    rating: 4.9,
    reviewCount: 289,
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    bio: 'Specializes in adapting Korean beauty techniques for diverse skin tones and facial structures. International workshop instructor with clients in 30+ countries.',
    priceRange: '$90 — $160 / session',
    languages: ['Korean', 'English', 'French', 'Spanish'],
    melaninExpertise: 'L1-L6 (All Tones)',
    contactUrl: 'https://www.instagram.com',
    contactType: 'instagram',
  },
];
