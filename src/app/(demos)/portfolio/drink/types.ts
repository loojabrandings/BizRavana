export interface DrinkProduct {
  name: string;
  flavor: string;
  tagline: string;
  src: string;
  bg: string;
  panel: string;
  ghostWord?: string;
  bgArtwork?: string;
}

export type CarouselRole = 'center' | 'left' | 'right' | 'back';
