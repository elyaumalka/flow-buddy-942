import { HDate }   from '@hebcal/hdate';
const hd = new HDate(new Date('2025-06-01'));
console.log('render he:', hd.render('he'));
console.log('render en:', hd.render('en'));
console.log('getFullYear:', hd.getFullYear());
console.log('getMonth:', hd.getMonth());
console.log('getDate:', hd.getDate());
