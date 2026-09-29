import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmojiIconOption {
  value: string;
  emoji: string;
  label: string;
  label_en: string;
  group: string;
}

const EMOJI_ICONS: EmojiIconOption[] = [
  // Herramientas / General
  { value: 'wrench', emoji: '🔧', label: 'Llave', label_en: 'Wrench', group: 'tools' },
  { value: 'hammer', emoji: '🔨', label: 'Martillo', label_en: 'Hammer', group: 'tools' },
  { value: 'hard-hat', emoji: '👷', label: 'Casco', label_en: 'Hard Hat', group: 'tools' },
  { value: 'settings', emoji: '⚙️', label: 'Ajustes', label_en: 'Settings', group: 'tools' },
  { value: 'cog', emoji: '🔩', label: 'Engranaje', label_en: 'Gear', group: 'tools' },
  { value: 'tool', emoji: '🛠️', label: 'Herramienta', label_en: 'Tool', group: 'tools' },
  { value: 'screwdriver', emoji: '🪛', label: 'Destornillador', label_en: 'Screwdriver', group: 'tools' },
  { value: 'drill', emoji: '🔩', label: 'Taladro', label_en: 'Drill', group: 'tools' },
  { value: 'pickaxe', emoji: '⛏️', label: 'Pico', label_en: 'Pickaxe', group: 'tools' },
  { value: 'nut', emoji: '🔩', label: 'Tuerca', label_en: 'Nut', group: 'tools' },
  { value: 'bolt', emoji: '🔩', label: 'Perno', label_en: 'Bolt', group: 'tools' },

  // Hogar
  { value: 'home', emoji: '🏠', label: 'Hogar', label_en: 'Home', group: 'home' },
  { value: 'house', emoji: '🏡', label: 'Casa', label_en: 'House', group: 'home' },
  { value: 'building', emoji: '🏢', label: 'Edificio', label_en: 'Building', group: 'home' },
  { value: 'sofa', emoji: '🛋️', label: 'Sofá', label_en: 'Sofa', group: 'home' },
  { value: 'bed', emoji: '🛏️', label: 'Cama', label_en: 'Bed', group: 'home' },
  { value: 'armchair', emoji: '💺', label: 'Sillón', label_en: 'Armchair', group: 'home' },
  { value: 'lamp', emoji: '💡', label: 'Lámpara', label_en: 'Lamp', group: 'home' },
  { value: 'door-open', emoji: '🚪', label: 'Puerta', label_en: 'Door', group: 'home' },
  { value: 'window', emoji: '🪟', label: 'Ventana', label_en: 'Window', group: 'home' },
  { value: 'lock', emoji: '🔒', label: 'Candado', label_en: 'Lock', group: 'home' },
  { value: 'key', emoji: '🔑', label: 'Llave', label_en: 'Key', group: 'home' },
  { value: 'mirror', emoji: '🪞', label: 'Espejo', label_en: 'Mirror', group: 'home' },
  { value: 'curtains', emoji: '🪟', label: 'Cortinas', label_en: 'Curtains', group: 'home' },
  { value: 'chair', emoji: '🪑', label: 'Silla', label_en: 'Chair', group: 'home' },
  { value: 'table', emoji: '🪑', label: 'Mesa', label_en: 'Table', group: 'home' },

  // Climatización
  { value: 'thermometer', emoji: '🌡️', label: 'Termómetro', label_en: 'Thermometer', group: 'climate' },
  { value: 'flame', emoji: '🔥', label: 'Llama', label_en: 'Flame', group: 'climate' },
  { value: 'fan', emoji: '🌀', label: 'Ventilador', label_en: 'Fan', group: 'climate' },
  { value: 'air-vent', emoji: '❄️', label: 'Aire Acond.', label_en: 'AC', group: 'climate' },
  { value: 'snowflake', emoji: '❄️', label: 'Copo', label_en: 'Snowflake', group: 'climate' },
  { value: 'heater', emoji: '🔥', label: 'Calentador', label_en: 'Heater', group: 'climate' },
  { value: 'radiator', emoji: '🔥', label: 'Radiador', label_en: 'Radiator', group: 'climate' },

  // Electrodomésticos
  { value: 'refrigerator', emoji: '🧊', label: 'Refrigerador', label_en: 'Fridge', group: 'appliances' },
  { value: 'washing-machine', emoji: '🧺', label: 'Lavadora', label_en: 'Washer', group: 'appliances' },
  { value: 'dryer', emoji: '🧺', label: 'Secadora', label_en: 'Dryer', group: 'appliances' },
  { value: 'microwave', emoji: '📻', label: 'Microondas', label_en: 'Microwave', group: 'appliances' },
  { value: 'oven', emoji: '🔥', label: 'Horno', label_en: 'Oven', group: 'appliances' },
  { value: 'stove', emoji: '🍳', label: 'Estufa', label_en: 'Stove', group: 'appliances' },
  { value: 'cooking-pot', emoji: '🍳', label: 'Olla', label_en: 'Pot', group: 'appliances' },
  { value: 'chef-hat', emoji: '👨‍🍳', label: 'Chef', label_en: 'Chef', group: 'appliances' },
  { value: 'utensils-crossed', emoji: '🍴', label: 'Utensilios', label_en: 'Utensils', group: 'appliances' },
  { value: 'blender', emoji: '🥤', label: 'Licuadora', label_en: 'Blender', group: 'appliances' },
  { value: 'toaster', emoji: '🍞', label: 'Tostadora', label_en: 'Toaster', group: 'appliances' },
  { value: 'dishwasher', emoji: '🧽', label: 'Lavavajillas', label_en: 'Dishwasher', group: 'appliances' },

  // Eléctrico
  { value: 'zap', emoji: '⚡', label: 'Eléctrico', label_en: 'Electric', group: 'electrical' },
  { value: 'plug', emoji: '🔌', label: 'Enchufe', label_en: 'Plug', group: 'electrical' },
  { value: 'cable', emoji: '🔗', label: 'Cable', label_en: 'Cable', group: 'electrical' },
  { value: 'lightbulb', emoji: '💡', label: 'Bombilla', label_en: 'Bulb', group: 'electrical' },
  { value: 'power', emoji: '⏻', label: 'Energía', label_en: 'Power', group: 'electrical' },
  { value: 'battery-charging', emoji: '🔋', label: 'Batería', label_en: 'Battery', group: 'electrical' },
  { value: 'battery', emoji: '🔋', label: 'Pila', label_en: 'Battery', group: 'electrical' },
  { value: 'circuit-board', emoji: '🖥️', label: 'Circuito', label_en: 'Circuit', group: 'electrical' },
  { value: 'electric-plug', emoji: '🔌', label: 'Enchufe', label_en: 'Plug', group: 'electrical' },
  { value: 'flashlight', emoji: '🔦', label: 'Linterna', label_en: 'Flashlight', group: 'electrical' },
  { value: 'switch', emoji: '🔘', label: 'Interruptor', label_en: 'Switch', group: 'electrical' },

  // Plomería / Agua
  { value: 'droplet', emoji: '💧', label: 'Gota', label_en: 'Drop', group: 'plumbing' },
  { value: 'droplets', emoji: '💦', label: 'Gotas', label_en: 'Drops', group: 'plumbing' },
  { value: 'waves', emoji: '🌊', label: 'Ondas', label_en: 'Waves', group: 'plumbing' },
  { value: 'bath', emoji: '🛁', label: 'Bañera', label_en: 'Bath', group: 'plumbing' },
  { value: 'shower', emoji: '🚿', label: 'Ducha', label_en: 'Shower', group: 'plumbing' },
  { value: 'toilet', emoji: '🚽', label: 'Inodoro', label_en: 'Toilet', group: 'plumbing' },
  { value: 'sink', emoji: '🚰', label: 'Lavabo', label_en: 'Sink', group: 'plumbing' },
  { value: 'faucet', emoji: '🚰', label: 'Grifo', label_en: 'Faucet', group: 'plumbing' },
  { value: 'pipe', emoji: '🔧', label: 'Tubería', label_en: 'Pipe', group: 'plumbing' },

  // Limpieza
  { value: 'sparkles', emoji: '✨', label: 'Brillos', label_en: 'Sparkles', group: 'cleaning' },
  { value: 'sparkle', emoji: '⭐', label: 'Brillo', label_en: 'Sparkle', group: 'cleaning' },
  { value: 'spray-can', emoji: '🧴', label: 'Spray', label_en: 'Spray', group: 'cleaning' },
  { value: 'trash', emoji: '🗑️', label: 'Basura', label_en: 'Trash', group: 'cleaning' },
  { value: 'recycle', emoji: '♻️', label: 'Reciclaje', label_en: 'Recycle', group: 'cleaning' },
  { value: 'broom', emoji: '🧹', label: 'Escoba', label_en: 'Broom', group: 'cleaning' },
  { value: 'mop', emoji: '🧽', label: 'Trapeador', label_en: 'Mop', group: 'cleaning' },
  { value: 'soap', emoji: '🧼', label: 'Jabón', label_en: 'Soap', group: 'cleaning' },
  { value: 'sponge', emoji: '🧽', label: 'Esponja', label_en: 'Sponge', group: 'cleaning' },
  { value: 'bucket', emoji: '🪣', label: 'Cubo', label_en: 'Bucket', group: 'cleaning' },
  { value: 'vacuum', emoji: '🧹', label: 'Aspiradora', label_en: 'Vacuum', group: 'cleaning' },

  // Jardinería / Exterior
  { value: 'leaf', emoji: '🌿', label: 'Hoja', label_en: 'Leaf', group: 'garden' },
  { value: 'leaves', emoji: '🍃', label: 'Hojas', label_en: 'Leaves', group: 'garden' },
  { value: 'trees', emoji: '🌳', label: 'Árboles', label_en: 'Trees', group: 'garden' },
  { value: 'tree-pine', emoji: '🌲', label: 'Pino', label_en: 'Pine', group: 'garden' },
  { value: 'fence', emoji: '🏗️', label: 'Cerca', label_en: 'Fence', group: 'garden' },
  { value: 'shovel', emoji: '⛏️', label: 'Pala', label_en: 'Shovel', group: 'garden' },
  { value: 'axe', emoji: '🪓', label: 'Hacha', label_en: 'Axe', group: 'garden' },
  { value: 'mountain', emoji: '🏔️', label: 'Montaña', label_en: 'Mountain', group: 'garden' },
  { value: 'flower', emoji: '🌸', label: 'Flor', label_en: 'Flower', group: 'garden' },
  { value: 'rose', emoji: '🌹', label: 'Rosa', label_en: 'Rose', group: 'garden' },
  { value: 'sunflower', emoji: '🌻', label: 'Girasol', label_en: 'Sunflower', group: 'garden' },
  { value: 'tulip', emoji: '🌷', label: 'Tulipán', label_en: 'Tulip', group: 'garden' },
  { value: 'potted-plant', emoji: '🪴', label: 'Planta', label_en: 'Plant', group: 'garden' },
  { value: 'watering-can', emoji: '🪴', label: 'Regadera', label_en: 'Watering Can', group: 'garden' },
  { value: 'seedling', emoji: '🌱', label: 'Brote', label_en: 'Seedling', group: 'garden' },
  { value: 'cactus', emoji: '🌵', label: 'Cactus', label_en: 'Cactus', group: 'garden' },

  // Pintura / Decoración
  { value: 'paintbrush', emoji: '🖌️', label: 'Brocha', label_en: 'Brush', group: 'decor' },
  { value: 'paint-bucket', emoji: '🪣', label: 'Balde', label_en: 'Paint Bucket', group: 'decor' },
  { value: 'scissors', emoji: '✂️', label: 'Tijeras', label_en: 'Scissors', group: 'decor' },
  { value: 'ruler', emoji: '📏', label: 'Regla', label_en: 'Ruler', group: 'decor' },
  { value: 'pen-tool', emoji: '✏️', label: 'Lápiz', label_en: 'Pen', group: 'decor' },
  { value: 'layers', emoji: '📚', label: 'Capas', label_en: 'Layers', group: 'decor' },
  { value: 'palette', emoji: '🎨', label: 'Paleta', label_en: 'Palette', group: 'decor' },
  { value: 'roller', emoji: '🖌️', label: 'Rodillo', label_en: 'Roller', group: 'decor' },
  { value: 'frame', emoji: '🖼️', label: 'Marco', label_en: 'Frame', group: 'decor' },

  // Vehicular
  { value: 'car', emoji: '🚗', label: 'Auto', label_en: 'Car', group: 'vehicle' },
  { value: 'bike', emoji: '🏍️', label: 'Moto', label_en: 'Bike', group: 'vehicle' },
  { value: 'bicycle', emoji: '🚲', label: 'Bicicleta', label_en: 'Bicycle', group: 'vehicle' },
  { value: 'truck', emoji: '🚚', label: 'Camión', label_en: 'Truck', group: 'vehicle' },
  { value: 'car-front', emoji: '🚙', label: 'Vehículo', label_en: 'Vehicle', group: 'vehicle' },
  { value: 'bus', emoji: '🚌', label: 'Autobús', label_en: 'Bus', group: 'vehicle' },
  { value: 'taxi', emoji: '🚕', label: 'Taxi', label_en: 'Taxi', group: 'vehicle' },
  { value: 'van', emoji: '🚐', label: 'Camioneta', label_en: 'Van', group: 'vehicle' },
  { value: 'fuel', emoji: '⛽', label: 'Combustible', label_en: 'Fuel', group: 'vehicle' },
  { value: 'gauge', emoji: '🎛️', label: 'Medidor', label_en: 'Gauge', group: 'vehicle' },
  { value: 'key-round', emoji: '🔑', label: 'Llave Auto', label_en: 'Car Key', group: 'vehicle' },
  { value: 'circle-parking', emoji: '🅿️', label: 'Parking', label_en: 'Parking', group: 'vehicle' },
  { value: 'tire', emoji: '🛞', label: 'Llanta', label_en: 'Tire', group: 'vehicle' },
  { value: 'engine', emoji: '⚙️', label: 'Motor', label_en: 'Engine', group: 'vehicle' },
  { value: 'oil', emoji: '🛢️', label: 'Aceite', label_en: 'Oil', group: 'vehicle' },

  // Médico / Salud
  { value: 'stethoscope', emoji: '🩺', label: 'Estetoscopio', label_en: 'Stethoscope', group: 'medical' },
  { value: 'heart', emoji: '❤️', label: 'Corazón', label_en: 'Heart', group: 'medical' },
  { value: 'heart-pulse', emoji: '💓', label: 'Pulso', label_en: 'Pulse', group: 'medical' },
  { value: 'syringe', emoji: '💉', label: 'Jeringa', label_en: 'Syringe', group: 'medical' },
  { value: 'pill', emoji: '💊', label: 'Pastilla', label_en: 'Pill', group: 'medical' },
  { value: 'activity', emoji: '📈', label: 'Actividad', label_en: 'Activity', group: 'medical' },
  { value: 'ambulance', emoji: '🚑', label: 'Ambulancia', label_en: 'Ambulance', group: 'medical' },
  { value: 'cross', emoji: '➕', label: 'Cruz', label_en: 'Cross', group: 'medical' },
  { value: 'hospital', emoji: '🏥', label: 'Hospital', label_en: 'Hospital', group: 'medical' },
  { value: 'baby', emoji: '👶', label: 'Bebé', label_en: 'Baby', group: 'medical' },
  { value: 'thermometer', emoji: '🌡️', label: 'Termómetro', label_en: 'Thermometer', group: 'medical' },
  { value: 'bandage', emoji: '🩹', label: 'Venda', label_en: 'Bandage', group: 'medical' },
  { value: 'crutch', emoji: '🩽', label: 'Muleta', label_en: 'Crutch', group: 'medical' },
  { value: 'x-ray', emoji: '🩻', label: 'Rayos X', label_en: 'X-Ray', group: 'medical' },

  // Veterinario / Mascotas
  { value: 'dog', emoji: '🐕', label: 'Perro', label_en: 'Dog', group: 'pets' },
  { value: 'cat', emoji: '🐈', label: 'Gato', label_en: 'Cat', group: 'pets' },
  { value: 'bird', emoji: '🐦', label: 'Pájaro', label_en: 'Bird', group: 'pets' },
  { value: 'fish', emoji: '🐟', label: 'Pez', label_en: 'Fish', group: 'pets' },
  { value: 'rabbit', emoji: '🐰', label: 'Conejo', label_en: 'Rabbit', group: 'pets' },
  { value: 'hamster', emoji: '🐹', label: 'Hámster', label_en: 'Hamster', group: 'pets' },
  { value: 'turtle', emoji: '🐢', label: 'Tortuga', label_en: 'Turtle', group: 'pets' },
  { value: 'snake', emoji: '🐍', label: 'Serpiente', label_en: 'Snake', group: 'pets' },
  { value: 'lizard', emoji: '🦎', label: 'Lagarto', label_en: 'Lizard', group: 'pets' },
  { value: 'paw-print', emoji: '🐾', label: 'Huella', label_en: 'Paw', group: 'pets' },
  { value: 'bone', emoji: '🦴', label: 'Hueso', label_en: 'Bone', group: 'pets' },
  { value: 'bug', emoji: '🐛', label: 'Insecto', label_en: 'Bug', group: 'pets' },
  { value: 'butterfly', emoji: '🦋', label: 'Mariposa', label_en: 'Butterfly', group: 'pets' },
  { value: 'spider', emoji: '🕷️', label: 'Araña', label_en: 'Spider', group: 'pets' },

  // Funerario / Ceremonial
  { value: 'church', emoji: '⛪', label: 'Iglesia', label_en: 'Church', group: 'ceremony' },
  { value: 'music', emoji: '🎵', label: 'Música', label_en: 'Music', group: 'ceremony' },
  { value: 'candle', emoji: '🕯️', label: 'Vela', label_en: 'Candle', group: 'ceremony' },
  { value: 'star', emoji: '⭐', label: 'Estrella', label_en: 'Star', group: 'ceremony' },
  { value: 'moon', emoji: '🌙', label: 'Luna', label_en: 'Moon', group: 'ceremony' },
  { value: 'cloud-moon', emoji: '☁️', label: 'Noche', label_en: 'Night', group: 'ceremony' },
  { value: 'sunrise', emoji: '🌅', label: 'Amanecer', label_en: 'Sunrise', group: 'ceremony' },
  { value: 'sunset', emoji: '🌇', label: 'Atardecer', label_en: 'Sunset', group: 'ceremony' },
  { value: 'dove', emoji: '🕊️', label: 'Paloma', label_en: 'Dove', group: 'ceremony' },
  { value: 'prayer', emoji: '🙏', label: 'Oración', label_en: 'Prayer', group: 'ceremony' },

  // Seguridad
  { value: 'shield', emoji: '🛡️', label: 'Escudo', label_en: 'Shield', group: 'security' },
  { value: 'camera', emoji: '📷', label: 'Cámara', label_en: 'Camera', group: 'security' },
  { value: 'cctv', emoji: '📹', label: 'CCTV', label_en: 'CCTV', group: 'security' },
  { value: 'bell', emoji: '🔔', label: 'Campana', label_en: 'Bell', group: 'security' },
  { value: 'alarm', emoji: '🚨', label: 'Alarma', label_en: 'Alarm', group: 'security' },
  { value: 'guard', emoji: '💂', label: 'Guardia', label_en: 'Guard', group: 'security' },
  { value: 'fingerprint', emoji: '👆', label: 'Huella', label_en: 'Fingerprint', group: 'security' },

  // Construcción
  { value: 'building-2', emoji: '🏢', label: 'Edificio', label_en: 'Building', group: 'construction' },
  { value: 'factory', emoji: '🏭', label: 'Fábrica', label_en: 'Factory', group: 'construction' },
  { value: 'warehouse', emoji: '🏪', label: 'Bodega', label_en: 'Warehouse', group: 'construction' },
  { value: 'crane', emoji: '🏗️', label: 'Grúa', label_en: 'Crane', group: 'construction' },
  { value: 'brick', emoji: '🧱', label: 'Ladrillo', label_en: 'Brick', group: 'construction' },
  { value: 'concrete', emoji: '🏗️', label: 'Concreto', label_en: 'Concrete', group: 'construction' },

  // Tecnología / IT
  { value: 'wifi', emoji: '📶', label: 'Wifi', label_en: 'Wifi', group: 'tech' },
  { value: 'laptop', emoji: '💻', label: 'Laptop', label_en: 'Laptop', group: 'tech' },
  { value: 'smartphone', emoji: '📱', label: 'Celular', label_en: 'Phone', group: 'tech' },
  { value: 'tablet', emoji: '📲', label: 'Tablet', label_en: 'Tablet', group: 'tech' },
  { value: 'monitor', emoji: '🖥️', label: 'Monitor', label_en: 'Monitor', group: 'tech' },
  { value: 'tv', emoji: '📺', label: 'TV', label_en: 'TV', group: 'tech' },
  { value: 'cpu', emoji: '💽', label: 'CPU', label_en: 'CPU', group: 'tech' },
  { value: 'server', emoji: '🗄️', label: 'Servidor', label_en: 'Server', group: 'tech' },
  { value: 'hard-drive', emoji: '💾', label: 'Disco', label_en: 'Drive', group: 'tech' },
  { value: 'printer', emoji: '🖨️', label: 'Impresora', label_en: 'Printer', group: 'tech' },
  { value: 'keyboard', emoji: '⌨️', label: 'Teclado', label_en: 'Keyboard', group: 'tech' },
  { value: 'mouse', emoji: '🖱️', label: 'Ratón', label_en: 'Mouse', group: 'tech' },
  { value: 'cd', emoji: '💿', label: 'CD', label_en: 'CD', group: 'tech' },
  { value: 'dvd', emoji: '📀', label: 'DVD', label_en: 'DVD', group: 'tech' },
  { value: 'usb', emoji: '💾', label: 'USB', label_en: 'USB', group: 'tech' },
  { value: 'router', emoji: '📡', label: 'Router', label_en: 'Router', group: 'tech' },

  // Paquetería / Logística
  { value: 'package', emoji: '📦', label: 'Paquete', label_en: 'Package', group: 'logistics' },
  { value: 'box', emoji: '📦', label: 'Caja', label_en: 'Box', group: 'logistics' },
  { value: 'package-check', emoji: '✅', label: 'Entregado', label_en: 'Delivered', group: 'logistics' },
  { value: 'shopping-bag', emoji: '🛍️', label: 'Bolsa', label_en: 'Bag', group: 'logistics' },
  { value: 'shopping-cart', emoji: '🛒', label: 'Carrito', label_en: 'Cart', group: 'logistics' },
  { value: 'scale', emoji: '⚖️', label: 'Balanza', label_en: 'Scale', group: 'logistics' },
  { value: 'barcode', emoji: '📊', label: 'Código', label_en: 'Barcode', group: 'logistics' },

  // Oficina / Administrativo
  { value: 'briefcase', emoji: '💼', label: 'Maletín', label_en: 'Briefcase', group: 'office' },
  { value: 'clipboard-list', emoji: '📋', label: 'Lista', label_en: 'List', group: 'office' },
  { value: 'file-text', emoji: '📄', label: 'Documento', label_en: 'Document', group: 'office' },
  { value: 'calculator', emoji: '🧮', label: 'Calculadora', label_en: 'Calculator', group: 'office' },
  { value: 'graduation-cap', emoji: '🎓', label: 'Educación', label_en: 'Education', group: 'office' },
  { value: 'pen', emoji: '🖊️', label: 'Pluma', label_en: 'Pen', group: 'office' },
  { value: 'pencil', emoji: '✏️', label: 'Lápiz', label_en: 'Pencil', group: 'office' },
  { value: 'notebook', emoji: '📓', label: 'Cuaderno', label_en: 'Notebook', group: 'office' },
  { value: 'bookmark', emoji: '🔖', label: 'Marcador', label_en: 'Bookmark', group: 'office' },

  // Comunicación
  { value: 'phone', emoji: '📞', label: 'Teléfono', label_en: 'Phone', group: 'comm' },
  { value: 'mail', emoji: '✉️', label: 'Correo', label_en: 'Mail', group: 'comm' },
  { value: 'message-circle', emoji: '💬', label: 'Mensaje', label_en: 'Message', group: 'comm' },
  { value: 'fax', emoji: '📠', label: 'Fax', label_en: 'Fax', group: 'comm' },
  { value: 'radio', emoji: '📻', label: 'Radio', label_en: 'Radio', group: 'comm' },
  { value: 'megaphone', emoji: '📢', label: 'Megáfono', label_en: 'Megaphone', group: 'comm' },

  // Tiempo
  { value: 'clock', emoji: '🕐', label: 'Reloj', label_en: 'Clock', group: 'time' },
  { value: 'calendar', emoji: '📅', label: 'Calendario', label_en: 'Calendar', group: 'time' },
  { value: 'stopwatch', emoji: '⏱️', label: 'Cronómetro', label_en: 'Stopwatch', group: 'time' },
  { value: 'timer', emoji: '⏲️', label: 'Temporizador', label_en: 'Timer', group: 'time' },
  { value: 'hourglass', emoji: '⏳', label: 'Reloj Arena', label_en: 'Hourglass', group: 'time' },

  // Personas
  { value: 'users', emoji: '👥', label: 'Usuarios', label_en: 'Users', group: 'people' },
  { value: 'user-cog', emoji: '👤', label: 'Usuario', label_en: 'User', group: 'people' },
  { value: 'person', emoji: '👤', label: 'Persona', label_en: 'Person', group: 'people' },
  { value: 'team', emoji: '👥', label: 'Equipo', label_en: 'Team', group: 'people' },
  { value: 'family', emoji: '👪', label: 'Familia', label_en: 'Family', group: 'people' },
  { value: 'worker', emoji: '👷', label: 'Trabajador', label_en: 'Worker', group: 'people' },

  // Celebraciones / Eventos
  { value: 'award', emoji: '🏆', label: 'Premio', label_en: 'Award', group: 'events' },
  { value: 'trophy', emoji: '🏅', label: 'Trofeo', label_en: 'Trophy', group: 'events' },
  { value: 'medal', emoji: '🥇', label: 'Medalla', label_en: 'Medal', group: 'events' },
  { value: 'gift', emoji: '🎁', label: 'Regalo', label_en: 'Gift', group: 'events' },
  { value: 'party-popper', emoji: '🎉', label: 'Fiesta', label_en: 'Party', group: 'events' },
  { value: 'cake', emoji: '🎂', label: 'Pastel', label_en: 'Cake', group: 'events' },
  { value: 'balloon', emoji: '🎈', label: 'Globo', label_en: 'Balloon', group: 'events' },
  { value: 'confetti', emoji: '🎊', label: 'Confeti', label_en: 'Confetti', group: 'events' },
  { value: 'fireworks', emoji: '🎆', label: 'Fuegos', label_en: 'Fireworks', group: 'events' },

  // Comida y Bebida
  { value: 'wine', emoji: '🍷', label: 'Vino', label_en: 'Wine', group: 'food' },
  { value: 'coffee', emoji: '☕', label: 'Café', label_en: 'Coffee', group: 'food' },
  { value: 'pizza', emoji: '🍕', label: 'Pizza', label_en: 'Pizza', group: 'food' },
  { value: 'apple', emoji: '🍎', label: 'Manzana', label_en: 'Apple', group: 'food' },
  { value: 'carrot', emoji: '🥕', label: 'Zanahoria', label_en: 'Carrot', group: 'food' },
  { value: 'salad', emoji: '🥗', label: 'Ensalada', label_en: 'Salad', group: 'food' },
  { value: 'burger', emoji: '🍔', label: 'Hamburguesa', label_en: 'Burger', group: 'food' },
  { value: 'bread', emoji: '🍞', label: 'Pan', label_en: 'Bread', group: 'food' },
  { value: 'cheese', emoji: '🧀', label: 'Queso', label_en: 'Cheese', group: 'food' },
  { value: 'milk', emoji: '🥛', label: 'Leche', label_en: 'Milk', group: 'food' },

  // Deportes / Fitness
  { value: 'dumbbell', emoji: '🏋️', label: 'Pesas', label_en: 'Gym', group: 'sports' },
  { value: 'target', emoji: '🎯', label: 'Objetivo', label_en: 'Target', group: 'sports' },
  { value: 'gamepad', emoji: '🎮', label: 'Juegos', label_en: 'Games', group: 'sports' },
  { value: 'football', emoji: '⚽', label: 'Fútbol', label_en: 'Football', group: 'sports' },
  { value: 'basketball', emoji: '🏀', label: 'Baloncesto', label_en: 'Basketball', group: 'sports' },
  { value: 'tennis', emoji: '🎾', label: 'Tenis', label_en: 'Tennis', group: 'sports' },
  { value: 'swimming', emoji: '🏊', label: 'Natación', label_en: 'Swimming', group: 'sports' },

  // Música / Entretenimiento
  { value: 'musical-note', emoji: '🎵', label: 'Nota Musical', label_en: 'Music Note', group: 'music' },
  { value: 'guitar', emoji: '🎸', label: 'Guitarra', label_en: 'Guitar', group: 'music' },
  { value: 'piano', emoji: '🎹', label: 'Piano', label_en: 'Piano', group: 'music' },
  { value: 'microphone', emoji: '🎤', label: 'Micrófono', label_en: 'Microphone', group: 'music' },
  { value: 'headphones', emoji: '🎧', label: 'Audífonos', label_en: 'Headphones', group: 'music' },
  { value: 'speaker', emoji: '🔊', label: 'Altavoz', label_en: 'Speaker', group: 'music' },

  // Finanzas
  { value: 'money', emoji: '💰', label: 'Dinero', label_en: 'Money', group: 'finance' },
  { value: 'credit-card', emoji: '💳', label: 'Tarjeta', label_en: 'Credit Card', group: 'finance' },
  { value: 'bank', emoji: '🏦', label: 'Banco', label_en: 'Bank', group: 'finance' },
  { value: 'atm', emoji: '🏧', label: 'Cajero', label_en: 'ATM', group: 'finance' },
  { value: 'chart', emoji: '📊', label: 'Gráfico', label_en: 'Chart', group: 'finance' },

  // Ubicación / Transporte
  { value: 'map-pin', emoji: '📍', label: 'Ubicación', label_en: 'Location', group: 'location' },
  { value: 'compass', emoji: '🧭', label: 'Brújula', label_en: 'Compass', group: 'location' },
  { value: 'globe', emoji: '🌍', label: 'Globo', label_en: 'Globe', group: 'location' },
  { value: 'airplane', emoji: '✈️', label: 'Avión', label_en: 'Airplane', group: 'location' },
  { value: 'train', emoji: '🚂', label: 'Tren', label_en: 'Train', group: 'location' },
  { value: 'ship', emoji: '🚢', label: 'Barco', label_en: 'Ship', group: 'location' },

  // Otros
  { value: 'bookmark-plus', emoji: '🔖', label: 'Marcador+', label_en: 'Bookmark+', group: 'other' },
  { value: 'check', emoji: '✅', label: 'Check', label_en: 'Check', group: 'other' },
  { value: 'x', emoji: '❌', label: 'X', label_en: 'X', group: 'other' },
  { value: 'info', emoji: 'ℹ️', label: 'Info', label_en: 'Info', group: 'other' },
  { value: 'warning', emoji: '⚠️', label: 'Advertencia', label_en: 'Warning', group: 'other' },
  { value: 'question', emoji: '❓', label: 'Pregunta', label_en: 'Question', group: 'other' },
  { value: 'exclamation', emoji: '❗', label: 'Exclamación', label_en: 'Exclamation', group: 'other' },
];

export const EMOJI_MAP: Record<string, string> = {};
EMOJI_ICONS.forEach(icon => { EMOJI_MAP[icon.value] = icon.emoji; });

const GROUP_LABELS: Record<string, { es: string; en: string }> = {
  tools: { es: 'Herramientas', en: 'Tools' },
  home: { es: 'Hogar', en: 'Home' },
  climate: { es: 'Climatización', en: 'Climate' },
  appliances: { es: 'Electrodomésticos', en: 'Appliances' },
  electrical: { es: 'Eléctrico', en: 'Electrical' },
  plumbing: { es: 'Plomería', en: 'Plumbing' },
  cleaning: { es: 'Limpieza', en: 'Cleaning' },
  garden: { es: 'Jardinería', en: 'Garden' },
  decor: { es: 'Decoración', en: 'Decor' },
  vehicle: { es: 'Vehicular', en: 'Vehicle' },
  medical: { es: 'Médico', en: 'Medical' },
  pets: { es: 'Mascotas', en: 'Pets' },
  ceremony: { es: 'Ceremonial', en: 'Ceremony' },
  security: { es: 'Seguridad', en: 'Security' },
  construction: { es: 'Construcción', en: 'Construction' },
  tech: { es: 'Tecnología', en: 'Technology' },
  logistics: { es: 'Logística', en: 'Logistics' },
  office: { es: 'Oficina', en: 'Office' },
  comm: { es: 'Comunicación', en: 'Communication' },
  time: { es: 'Tiempo', en: 'Time' },
  people: { es: 'Personas', en: 'People' },
  events: { es: 'Eventos', en: 'Events' },
  food: { es: 'Comida', en: 'Food' },
  sports: { es: 'Deportes', en: 'Sports' },
  music: { es: 'Música', en: 'Music' },
  finance: { es: 'Finanzas', en: 'Finance' },
  location: { es: 'Ubicación', en: 'Location' },
  other: { es: 'Otros', en: 'Other' },
};

const isEmojiGlyph = (value: string) => /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(value);

interface EmojiIconPickerProps {
  value: string;
  onChange: (value: string) => void;
  lang?: 'es' | 'en';
  className?: string;
}

export function EmojiIconPicker({ value, onChange, lang = 'es', className }: EmojiIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedIcon = EMOJI_ICONS.find(i => i.value === value || i.emoji === value);
  const displayEmoji = selectedIcon?.emoji || EMOJI_MAP[value] || (isEmojiGlyph(value) ? value : '🔧');

  const filtered = useMemo(() => {
    if (!search) return EMOJI_ICONS;
    const q = search.toLowerCase();
    return EMOJI_ICONS.filter(i =>
      i.label.toLowerCase().includes(q) ||
      i.label_en.toLowerCase().includes(q) ||
      i.value.includes(q) ||
      i.emoji.includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const groups: Record<string, EmojiIconOption[]> = {};
    filtered.forEach(icon => {
      if (!groups[icon.group]) groups[icon.group] = [];
      groups[icon.group].push(icon);
    });
    return groups;
  }, [filtered]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('h-10 w-full justify-start gap-2 font-normal', className)}
        >
          <span className="text-xl">{displayEmoji}</span>
          <span className="text-sm text-muted-foreground truncate">
            {selectedIcon ? (lang === 'en' ? selectedIcon.label_en : selectedIcon.label) : value || 'Seleccionar ícono'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'en' ? 'Search icons...' : 'Buscar íconos...'}
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto p-2 space-y-2">
          {Object.entries(grouped).map(([group, icons]) => (
            <div key={group}>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">
                {GROUP_LABELS[group]?.[lang] || group}
              </p>
              <div className="grid grid-cols-7 gap-0.5">
                {icons.map(icon => (
                  <button
                    key={icon.value}
                    type="button"
                    onClick={() => { onChange(icon.value); setOpen(false); setSearch(''); }}
                    className={cn(
                      'w-9 h-9 rounded-md flex items-center justify-center text-lg hover:bg-accent transition-colors',
                      value === icon.value && 'bg-primary/10 ring-1 ring-primary'
                    )}
                    title={lang === 'en' ? icon.label_en : icon.label}
                  >
                    {icon.emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {lang === 'en' ? 'No icons found' : 'No se encontraron íconos'}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { EMOJI_ICONS };
export default EmojiIconPicker;
