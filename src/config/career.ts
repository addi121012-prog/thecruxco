// The Crux Career: products shown on /career/.
//
// The page lists nothing until you add a product here. When a product is uploaded
// (Topmate / Gumroad / etc.), add an entry and it appears as a card with a buy button.
// Example:
//   { title: 'Class 10 · Science', blurb: 'One-line description.', url: 'https://topmate.io/...' }

export interface Product {
  title: string;
  blurb: string;
  url: string;
}

export const PRODUCTS: Product[] = [];

// Board exam start, used for the countdown on the home page (CBSE date sheet, released 6 Nov 2026).
export const BOARD = {
  start: '2027-02-16T00:00:00+05:30',
  startLabel: '16 Feb 2027',
} as const;
