import { EMOJI_MAP as EMOJI_MAP_LOOKUP } from "@/components/ui/emoji-icon-picker";
import {
  Wrench,
  Thermometer,
  Zap,
  Droplet,
  Sparkles,
  Leaf,
  Package,
  Home,
  Wifi,
  Hammer,
  Paintbrush,
  Refrigerator,
  Waves,
  Bath,
  CookingPot,
  Layers,
  DoorOpen,
  Droplets,
  Flame,
  Fence,
  HardHat,
  Car,
  Bike,
  Truck,
  CarFront,
  Fuel,
  Gauge,
  KeyRound,
  CircleParking,
  Stethoscope,
  Heart,
  HeartPulse,
  Syringe,
  Pill,
  Activity,
  Ambulance,
  Cross,
  Hospital,
  Baby,
  Plug,
  Cable,
  Lightbulb,
  Power,
  BatteryCharging,
  CircuitBoard,
  Cpu,
  Monitor,
  Tv,
  Sofa,
  Bed,
  Armchair,
  Lamp,
  Fan,
  AirVent,
  WashingMachine,
  Microwave,
  ChefHat,
  UtensilsCrossed,
  Lock,
  Key,
  Shield,
  Camera,
  Cctv,
  Bell,
  Dog,
  Cat,
  Bird,
  Fish,
  Rabbit,
  PawPrint,
  Bug,
  Trees,
  Flower2,
  Church,
  Music,
  CandlestickChart,
  Star,
  Moon,
  CloudMoon,
  Sunrise,
  Building2,
  Factory,
  Warehouse,
  Mountain,
  TreePine,
  Shovel,
  Axe,
  Scissors,
  Ruler,
  PenTool,
  Sparkle,
  Trash,
  Recycle,
  SprayCan,
  ShoppingBag,
  ShoppingCart,
  Box,
  PackageCheck,
  ClipboardList,
  FileText,
  Calculator,
  Briefcase,
  GraduationCap,
  Settings,
  Cog,
  Laptop,
  Smartphone,
  Tablet,
  Server,
  HardDrive,
  Printer,
  Clock,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  Users,
  UserCog,
  Award,
  Trophy,
  Gift,
  PartyPopper,
  Cake,
  Wine,
  Coffee,
  Pizza,
  Apple,
  Carrot,
  Salad,
  Dumbbell,
  Medal,
  Target,
  Gamepad2,
  MapPin,
  type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  // Herramientas / General
  wrench: Wrench,
  hammer: Hammer,
  "hard-hat": HardHat,
  settings: Settings,
  cog: Cog,
  tool: Wrench,
  
  // Hogar
  home: Home,
  sofa: Sofa,
  bed: Bed,
  armchair: Armchair,
  lamp: Lamp,
  "door-open": DoorOpen,
  lock: Lock,
  key: Key,
  
  // Climatización
  thermometer: Thermometer,
  flame: Flame,
  fan: Fan,
  "air-vent": AirVent,
  
  // Electrodomésticos
  refrigerator: Refrigerator,
  "washing-machine": WashingMachine,
  microwave: Microwave,
  "cooking-pot": CookingPot,
  "chef-hat": ChefHat,
  "utensils-crossed": UtensilsCrossed,
  
  // Eléctrico
  zap: Zap,
  plug: Plug,
  cable: Cable,
  lightbulb: Lightbulb,
  power: Power,
  "battery-charging": BatteryCharging,
  "circuit-board": CircuitBoard,
  
  // Plomería / Agua
  droplet: Droplet,
  droplets: Droplets,
  waves: Waves,
  bath: Bath,
  
  // Limpieza
  sparkles: Sparkles,
  sparkle: Sparkle,
  "spray-can": SprayCan,
  trash: Trash,
  recycle: Recycle,
  
  // Jardinería / Exterior
  leaf: Leaf,
  trees: Trees,
  "tree-pine": TreePine,
  fence: Fence,
  shovel: Shovel,
  axe: Axe,
  mountain: Mountain,
  
  // Pintura / Decoración
  paintbrush: Paintbrush,
  scissors: Scissors,
  ruler: Ruler,
  "pen-tool": PenTool,
  layers: Layers,
  
  // Vehicular
  car: Car,
  bike: Bike,
  truck: Truck,
  "car-front": CarFront,
  fuel: Fuel,
  gauge: Gauge,
  "key-round": KeyRound,
  "circle-parking": CircleParking,
  
  // Médico / Salud
  stethoscope: Stethoscope,
  heart: Heart,
  "heart-pulse": HeartPulse,
  syringe: Syringe,
  pill: Pill,
  activity: Activity,
  ambulance: Ambulance,
  cross: Cross,
  hospital: Hospital,
  baby: Baby,
  
  // Veterinario / Mascotas
  dog: Dog,
  cat: Cat,
  bird: Bird,
  fish: Fish,
  rabbit: Rabbit,
  "paw-print": PawPrint,
  bug: Bug,
  
  // Funerario / Ceremonial
  flower: Flower2,
  church: Church,
  music: Music,
  candle: CandlestickChart,
  star: Star,
  moon: Moon,
  "cloud-moon": CloudMoon,
  sunrise: Sunrise,
  
  // Seguridad
  shield: Shield,
  camera: Camera,
  cctv: Cctv,
  bell: Bell,
  
  // Construcción
  "building-2": Building2,
  factory: Factory,
  warehouse: Warehouse,
  
  // Tecnología / IT
  wifi: Wifi,
  laptop: Laptop,
  smartphone: Smartphone,
  tablet: Tablet,
  monitor: Monitor,
  tv: Tv,
  cpu: Cpu,
  server: Server,
  "hard-drive": HardDrive,
  printer: Printer,
  
  // Paquetería / Logística
  package: Package,
  box: Box,
  "package-check": PackageCheck,
  "shopping-bag": ShoppingBag,
  "shopping-cart": ShoppingCart,
  
  // Oficina / Administrativo
  briefcase: Briefcase,
  "clipboard-list": ClipboardList,
  "file-text": FileText,
  calculator: Calculator,
  "graduation-cap": GraduationCap,
  
  // Comunicación
  phone: Phone,
  mail: Mail,
  "message-circle": MessageCircle,
  
  // Tiempo
  clock: Clock,
  calendar: Calendar,
  
  // Personas
  users: Users,
  "user-cog": UserCog,
  
  // Celebraciones / Eventos
  award: Award,
  trophy: Trophy,
  medal: Medal,
  gift: Gift,
  "party-popper": PartyPopper,
  cake: Cake,
  
  // Comida y Bebida
  wine: Wine,
  coffee: Coffee,
  pizza: Pizza,
  apple: Apple,
  carrot: Carrot,
  salad: Salad,
  
  // Deportes / Fitness
  dumbbell: Dumbbell,
  target: Target,
  gamepad: Gamepad2,
  
  // Default
  "map-pin": MapPin,
};

// Color mapping for categories
export const colorMap: Record<string, { bg: string; text: string; hex: string }> = {
  // Verdes
  mint: { bg: "bg-emerald-100", text: "text-emerald-700", hex: "#10b981" },
  emerald: { bg: "bg-emerald-200", text: "text-emerald-800", hex: "#059669" },
  green: { bg: "bg-green-100", text: "text-green-700", hex: "#22c55e" },
  lime: { bg: "bg-lime-100", text: "text-lime-700", hex: "#84cc16" },
  teal: { bg: "bg-teal-100", text: "text-teal-700", hex: "#14b8a6" },
  
  // Azules
  sky: { bg: "bg-sky-100", text: "text-sky-700", hex: "#0ea5e9" },
  blue: { bg: "bg-blue-100", text: "text-blue-700", hex: "#3b82f6" },
  cyan: { bg: "bg-cyan-100", text: "text-cyan-700", hex: "#06b6d4" },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-700", hex: "#6366f1" },
  
  // Violetas / Púrpuras
  lavender: { bg: "bg-purple-100", text: "text-purple-700", hex: "#a855f7" },
  purple: { bg: "bg-purple-200", text: "text-purple-800", hex: "#9333ea" },
  violet: { bg: "bg-violet-100", text: "text-violet-700", hex: "#8b5cf6" },
  fuchsia: { bg: "bg-fuchsia-100", text: "text-fuchsia-700", hex: "#d946ef" },
  
  // Rosas / Rojos
  rose: { bg: "bg-rose-100", text: "text-rose-700", hex: "#f43f5e" },
  pink: { bg: "bg-pink-100", text: "text-pink-700", hex: "#ec4899" },
  red: { bg: "bg-red-100", text: "text-red-700", hex: "#ef4444" },
  
  // Naranjas / Amarillos
  amber: { bg: "bg-amber-100", text: "text-amber-700", hex: "#f59e0b" },
  peach: { bg: "bg-orange-100", text: "text-orange-700", hex: "#fb923c" },
  orange: { bg: "bg-orange-200", text: "text-orange-800", hex: "#f97316" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-700", hex: "#eab308" },
  cream: { bg: "bg-amber-50", text: "text-amber-700", hex: "#fbbf24" },
  
  // Neutros
  slate: { bg: "bg-slate-100", text: "text-slate-700", hex: "#64748b" },
  gray: { bg: "bg-gray-100", text: "text-gray-700", hex: "#6b7280" },
  zinc: { bg: "bg-zinc-100", text: "text-zinc-700", hex: "#71717a" },
  stone: { bg: "bg-stone-100", text: "text-stone-700", hex: "#78716c" },
  neutral: { bg: "bg-neutral-100", text: "text-neutral-700", hex: "#737373" },
};

// Detect if a string is an emoji
export const isEmoji = (str: string) => /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(str);

export const getCategoryIcon = (iconName: string | null | undefined): LucideIcon | null => {
  if (!iconName) return Wrench;
  if (isEmoji(iconName)) return null; // Emoji, not a Lucide icon
  return iconMap[iconName] || Wrench;
};

export const getCategoryColor = (colorName: string | null | undefined): { bg: string; text: string; hex: string } => {
  if (!colorName) return colorMap.gray;
  return colorMap[colorName] || colorMap.gray;
};

// Default fallback emoji used when an icon key has no matching emoji.
// Enforces a unified colorful 3D-style icon look across the app — never a
// monochrome outline / lucide vector.
export const DEFAULT_CATEGORY_EMOJI = "🔧";

/**
 * Resolve a category icon to a colorful emoji glyph, regardless of whether
 * the stored value is already an emoji, a known lucide key, or unknown.
 * Always returns a printable emoji — never null — so UI can render a
 * single, consistent visual format.
 */
export const getCategoryEmoji = (iconName: string | null | undefined): string => {
  if (!iconName) return DEFAULT_CATEGORY_EMOJI;
  if (isEmoji(iconName)) return iconName;
  return EMOJI_MAP_LOOKUP[iconName] || DEFAULT_CATEGORY_EMOJI;
};

export const normalizeCategoryIconValue = (iconName: string | null | undefined): string => {
  return getCategoryEmoji(iconName);
};
