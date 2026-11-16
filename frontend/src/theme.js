// Paleta "Moon Pop" (dirección de arte del equipo). Se usa en Phaser (números) y en CSS (variables).
export const PALETTE = {
  outline: '#27234C', // Contorno
  sky: '#4D62B9', // Cielo
  mid: '#7C90DF', // Medio tono
  moon: '#C5D2FF', // Luz lunar
  cream: '#FFF3DC', // Fondo claro
  white: '#FFFFFF', // Brillo
  brand: '#FFC145', // Marca
  warm: '#E68A37', // Sombra cálida
  tech: '#44D9E6', // Tecnología
  life: '#7ED65B', // Vida
  alert: '#FF746A', // Alerta
  cool: '#8D6FC1' // Sombra fría
};

export const hex = (c) => parseInt(c.slice(1), 16);

// Número para Phaser: C.outline === 0x27234C
export const C = Object.fromEntries(Object.entries(PALETTE).map(([k, v]) => [k, hex(v)]));
