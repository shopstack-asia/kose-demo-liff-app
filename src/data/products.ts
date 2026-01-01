/**
 * Mock Product Data
 */

export interface Product {
  id: string;
  name: string;
  sku: string;
  image_url: string;
}

export const mockProducts: Product[] = [
  {
    id: 'prod_001',
    name: 'Sekkisei Clear Wellness Lotion',
    sku: 'SEK-CWL-200',
    image_url: '/products/sekkisei-lotion.jpg',
  },
  {
    id: 'prod_002',
    name: 'Sekkisei Clear Wellness Emulsion',
    sku: 'SEK-CWE-200',
    image_url: '/products/sekkisei-emulsion.jpg',
  },
  {
    id: 'prod_003',
    name: 'Sekkisei Clear Wellness Wash',
    sku: 'SEK-CWW-200',
    image_url: '/products/sekkisei-wash.jpg',
  },
  {
    id: 'prod_004',
    name: 'Decorte AQ Meliority Cream',
    sku: 'DEC-AQMC-30',
    image_url: '/products/decorte-cream.jpg',
  },
  {
    id: 'prod_005',
    name: 'Decorte AQ Meliority Serum',
    sku: 'DEC-AQMS-40',
    image_url: '/products/decorte-serum.jpg',
  },
  {
    id: 'prod_006',
    name: 'Infinity Pure Moisture Lotion',
    sku: 'INF-PML-200',
    image_url: '/products/infinity-lotion.jpg',
  },
  {
    id: 'prod_007',
    name: 'Infinity Pure Moisture Emulsion',
    sku: 'INF-PME-200',
    image_url: '/products/infinity-emulsion.jpg',
  },
  {
    id: 'prod_008',
    name: 'Esprique Precious Rich Cream',
    sku: 'ESP-PRC-30',
    image_url: '/products/esprique-cream.jpg',
  },
  {
    id: 'prod_009',
    name: 'One by Kose Clear Turn Mask',
    sku: 'OBK-CTM-30',
    image_url: '/products/onebykose-mask.jpg',
  },
  {
    id: 'prod_010',
    name: 'Sekkisei White Powder Wash',
    sku: 'SEK-WPW-100',
    image_url: '/products/sekkisei-powder-wash.jpg',
  },
];

