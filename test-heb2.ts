import { HDate, Locale } from '@hebcal/hdate';
const hd = new HDate(new Date('2025-06-01'));
console.log('render he:', hd.render('he'));

// Check locale
Locale.useLocale('he');
console.log('render after locale:', hd.render('he'));

// Get month name
import { getMonthName } from '@hebcal/hdate';
console.log('month name:', getMonthName(hd.getMonth(), hd.getFullYear(), 'he'));
