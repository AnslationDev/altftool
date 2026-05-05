export const ASPECT_RATIOS = [
  { name: '1:1', value: 1, type:'Instagram', label: 'Square' },
  { name: '3:4', value: 3 / 4, label: 'Portrait' },
  { name: '4:3', value: 4 / 3, label: 'Landscape' },
  { name: '9:16', value: 9 / 16, type:'story',label: 'Mobile Story' },
  { name: 'Free', value: undefined, label: 'Free Select' },
  { name: '4:1', value: 4 / 1,type:'LinkedIn', label: 'Rectangular' },
  { name: '16:9', value: 16 / 9,type:'youtube', label: 'Rectangular' },
];
 
export const MAX_OUTPUT_WIDTH = 1000;
export const MAX_OUTPUT_HEIGHT = 1000;
export const JPEG_QUALITY = 0.8;