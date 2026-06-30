import orangeKnot from "@/assets/bags/orange-knot.jpg";
import yellowKnot from "@/assets/bags/yellow-knot.jpg";
import crystalOmbre from "@/assets/bags/crystal-ombre.jpg";
import pearlFeather from "@/assets/bags/pearl-feather.jpg";
import blackBucket from "@/assets/bags/black-bucket.jpg";
import floralShoulder from "@/assets/bags/floral-shoulder.jpg";
import pinkOrangeCrystal from "@/assets/bags/pink-orange-crystal.jpg";
import pinkBucket from "@/assets/bags/pink-bucket.jpg";
import pinkKnotFeather from "@/assets/bags/pink-knot-feather.jpg";
import purpleKnotFeather from "@/assets/bags/purple-knot-feather.jpg";
import greenKnotFeather from "@/assets/bags/green-knot-feather.jpg";
import pinkBowPearl from "@/assets/bags/pink-bow-pearl.jpg";
import redFloralSpike from "@/assets/bags/red-floral-spike.jpg";
import purpleFloralSpike from "@/assets/bags/purple-floral-spike.jpg";
import blackFloralCharm from "@/assets/bags/black-floral-charm.jpg";
import crystalSpikeClear from "@/assets/bags/crystal-spike-clear.jpg";
import redKnotBow from "@/assets/bags/red-knot-bow.jpg";
import brownKnotBow from "@/assets/bags/brown-knot-bow.jpg";
import crystalSpikePair from "@/assets/bags/crystal-spike-pair.jpg";
import greenOrangeTop from "@/assets/tops/green-orange-top.jpg";
import pinkBraletteTop from "@/assets/tops/pink-bralette-top.jpg";

export type Variant = {
  id: string;
  color: string;
  swatch: string;
  image: string;
};

export type Product = {
  id: string;
  name: string;
  category: "knot" | "crystal" | "bucket" | "floral" | "tops";
  categoryLabel: string;
  price: number;
  tagline: string;
  description: string;
  variants: Variant[];
};

export const products: Product[] = [
  {
    id: "knot-mini",
    name: "Knot Mini",
    category: "knot",
    categoryLabel: "Knot Top-Handle",
    price: 89,
    tagline: "A sculpted bead bow on a structured frame.",
    description:
      "Handwoven from glossy acrylic beads, the Knot Mini features a signature sculpted bow at the handle. Perfect for evenings or curated daytime moments.",
    variants: [
      { id: "knot-orange", color: "Tangerine", swatch: "#ff7a1a", image: orangeKnot },
      { id: "knot-yellow", color: "Butter", swatch: "#f5e58a", image: yellowKnot },
      { id: "knot-bow-red", color: "Crimson", swatch: "#d8211a", image: redKnotBow },
      { id: "knot-bow-brown", color: "Cocoa", swatch: "#4a2418", image: brownKnotBow },
    ],
  },
  {
    id: "feather-knot",
    name: "Feather Knot",
    category: "knot",
    categoryLabel: "Knot Top-Handle",
    price: 110,
    tagline: "Crystal handle with silk feather plumes.",
    description:
      "A delicate crystal-bead ring handle finished with cascading silk feather plumes. Hand-strung and dreamy — made for entrances.",
    variants: [
      { id: "feather-pink", color: "Fuchsia", swatch: "#e8259a", image: pinkKnotFeather },
      { id: "feather-purple", color: "Amethyst", swatch: "#8a52d4", image: purpleKnotFeather },
      { id: "feather-green", color: "Lime", swatch: "#8ccf2f", image: greenKnotFeather },
    ],
  },
  {
    id: "bow-pearl",
    name: "Bow Pearl",
    category: "knot",
    categoryLabel: "Knot Top-Handle",
    price: 135,
    tagline: "Pearl-beaded body crowned with a satin bow.",
    description:
      "A pillowy satin bow sits atop a pearl-woven body. Romantic, playful, unmistakably Vivify.",
    variants: [
      { id: "bow-pink", color: "Hot Pink", swatch: "#ff3da5", image: pinkBowPearl },
    ],
  },
  {
    id: "crystal-ombre",
    name: "Crystal Spike",
    category: "crystal",
    categoryLabel: "Crystal Statement",
    price: 145,
    tagline: "Faceted crystal beads in vivid ombré.",
    description:
      "An architectural mini bag covered in faceted crystal beads. Each piece is hand-strung — light catches every facet for a constant shimmer.",
    variants: [
      { id: "crystal-pink-orange", color: "Sunset", swatch: "#ff3d8a", image: crystalOmbre },
      { id: "crystal-orange-pink", color: "Coral Glow", swatch: "#ff7a4a", image: pinkOrangeCrystal },
    ],
  },
  {
    id: "crystal-ice",
    name: "Crystal Ice",
    category: "crystal",
    categoryLabel: "Crystal Statement",
    price: 165,
    tagline: "All-clear faceted crystal — pure light.",
    description:
      "Spiked, faceted, and entirely clear — a sculptural mini that catches every flash of light. The Crystal Ice is our most photographed piece.",
    variants: [
      { id: "ice-clear", color: "Clear", swatch: "#ecf3f8", image: crystalSpikeClear },
      { id: "ice-red", color: "Ruby", swatch: "#d8211a", image: crystalSpikePair },
    ],
  },
  {
    id: "garden-spike",
    name: "Garden Spike",
    category: "floral",
    categoryLabel: "Floral Crystal",
    price: 195,
    tagline: "Crystal leaves and spikes in jewel tones.",
    description:
      "A wild bouquet of faceted crystal leaves and spikes hand-wired into a sculptural mini. Statement-only.",
    variants: [
      { id: "garden-red", color: "Ember", swatch: "#d9381a", image: redFloralSpike },
      { id: "garden-purple", color: "Orchid", swatch: "#a64ad9", image: purpleFloralSpike },
    ],
  },
  {
    id: "pearl-bucket",
    name: "Pearl Bucket",
    category: "bucket",
    categoryLabel: "Bucket",
    price: 125,
    tagline: "Pearls and feathers — pure romance.",
    description:
      "A dreamy bucket silhouette wrapped in glass pearls and finished with a marabou feather trim. Drawstring satin closure inside.",
    variants: [
      { id: "bucket-pearl", color: "Pearl & Blush", swatch: "#fde8ef", image: pearlFeather },
      { id: "bucket-pink", color: "Hot Pink", swatch: "#ff2d8a", image: pinkBucket },
      { id: "bucket-black", color: "Onyx & Gold", swatch: "#0f0f10", image: blackBucket },
    ],
  },
  {
    id: "floral-shoulder",
    name: "Garden Shoulder",
    category: "floral",
    categoryLabel: "Floral Shoulder",
    price: 165,
    tagline: "Bead-embroidered florals on a curved silhouette.",
    description:
      "A shoulder-skimming silhouette in jet beads, embellished with hand-wired flower appliqués in jewel tones. A wearable garden.",
    variants: [
      { id: "floral-jet", color: "Jet Multi", swatch: "#1a1a1a", image: floralShoulder },
    ],
  },
  {
    id: "charm-noir",
    name: "Charm Noir",
    category: "floral",
    categoryLabel: "Floral Charm",
    price: 175,
    tagline: "Obsidian beads layered with silver charms.",
    description:
      "Jet black pearl base layered with butterflies, roses and iridescent charms in soft pink and silver. Gothic romance.",
    variants: [
      { id: "charm-black", color: "Noir & Rose", swatch: "#141414", image: blackFloralCharm },
    ],
  },
  {
    id: "citrus-grove-top",
    name: "Citrus Grove Bralette",
    category: "tops",
    categoryLabel: "Beaded Top",
    price: 245,
    tagline: "Hand-strung agate and crystal bralette.",
    description:
      "A multi-strand beaded bralette in citrus greens, ambers and corals — finished with cascading body chains and a centerpiece stone.",
    variants: [
      { id: "top-citrus", color: "Citrus Grove", swatch: "#7fb84a", image: greenOrangeTop },
    ],
  },
  {
    id: "rose-quartz-top",
    name: "Rose Quartz Bralette",
    category: "tops",
    categoryLabel: "Beaded Top",
    price: 245,
    tagline: "Layered pink quartz and pearl body piece.",
    description:
      "A romantic blush bralette layered with rose quartz, pearls and gold beads. Body chains drape across the waist for a couture finish.",
    variants: [
      { id: "top-rose", color: "Rose Quartz", swatch: "#ff8ab8", image: pinkBraletteTop },
    ],
  },
];

export const categories = [
  { id: "knot", label: "Knot Handle", desc: "Sculpted bow tops" },
  { id: "crystal", label: "Crystal", desc: "Faceted statement minis" },
  { id: "bucket", label: "Bucket", desc: "Pearls, feathers, drama" },
  { id: "floral", label: "Floral", desc: "Bead-embroidered blooms" },
  { id: "tops", label: "Beaded Tops", desc: "Couture body pieces" },
] as const;

export const findProduct = (id: string) => products.find((p) => p.id === id);
