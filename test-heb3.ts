import { HDate } from '@hebcal/hdate';
import { gematriya } from '@hebcal/hdate';

const hd = new HDate(new Date('2025-06-01'));
console.log('render he:', hd.render('he'));
console.log('gematriya day:', gematriya(hd.getDate()));
console.log('gematriya year:', gematriya(hd.getFullYear()));

// Try different dates
const hd2 = new HDate(new Date('2025-01-15'));
console.log('jan date:', hd2.render('he'));
const hd3 = new HDate(new Date('2025-12-25'));
console.log('dec date:', hd3.render('he'));
