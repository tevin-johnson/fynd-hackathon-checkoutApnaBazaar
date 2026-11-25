// Pure catalog data. Prices are integer paise — never floats.

export type ProductId = 'water-bottle' | 'coffee-mug';

export interface Product {
  id: ProductId;
  name: string;
  tagline: string;
  description: string;
  pricePaise: number;
  sticker: string;
}

export const PRODUCTS: readonly Product[] = [
  {
    id: 'water-bottle',
    name: 'Water Bottle',
    tagline: 'Everyday Carry #01',
    description: 'Steel, 1 litre, leak-proof lid. Keeps your nimbu pani cold for 12 hours.',
    pricePaise: 15000,
    sticker: 'Stays Cold',
  },
  {
    id: 'coffee-mug',
    name: 'Coffee Mug',
    tagline: 'Kitchen Shelf #02',
    description: 'Chunky ceramic mug for filter coffee, chai or anything hot in between.',
    pricePaise: 23900,
    sticker: 'Microwave Safe',
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
