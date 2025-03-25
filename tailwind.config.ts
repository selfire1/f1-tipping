import type { Config } from 'tailwindcss'

const blackScale = {
  '50': '#F3F3F4',
  '100': '#C5C7CC',
  '200': '#989BA3',
  '300': '#6A6F7B',
  '400': '#3D4353',

  '500': '#0F172A',
  '600': '#0D1323',
  '700': '#0A101D',
  '800': '#080C16',
  '900': '#05080F',
  '950': '#030508',
}

export default <Partial<Config>>{
  content: ['./app/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: blackScale,
        muted: blackScale['300'],
        faint: blackScale['100'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
