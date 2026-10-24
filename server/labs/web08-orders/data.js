// web-08 Other People's Orders: the fake store data of one lab instance.
// Every instance gets its own run of order numbers, so an answer like
// "open order 10418" from someone else's writeup does not work.
const crypto = require('crypto');

const ORDER_COUNT = 40;

// The practice account (shown on the login page).
const RAHUL = {
  email: 'rahul.s@gharkart.test',
  password: 'Gharkart@123',
  name: 'Rahul Sharma',
  first: 'Rahul',
  address: ['Flat 302, Sai Residency, Vijay Nagar', 'Indore, Madhya Pradesh 452010'],
  phone: '+91 98260 1XXXX',
};

const OWNER = {
  name: 'Meera Joshi (Gharkart)',
  address: ['14, Old Palasia, near Geeta Bhawan', 'Indore, Madhya Pradesh 452001'],
  phone: '+91 99260 4XXXX',
};

const CUSTOMERS = [
  ['Ananya Verma', 'B-17, Scheme 78, Part 2', '452010'],
  ['Mohit Agrawal', '56, Sudama Nagar, Sector D', '452009'],
  ['Pooja Rathore', '9, Annapurna Road, near Usha Nagar', '452009'],
  ['Imran Qureshi', '211, Khajrana Main Road', '452016'],
  ['Sneha Patidar', 'House 4, Nipania, Shalimar Township', '452010'],
  ['Arjun Mehta', '33, Rajendra Nagar, Rau Road', '452012'],
  ['Kavita Solanki', 'Flat 104, Silicon City', '452012'],
  ['Deepak Yadav', '18, Bhawarkua, near Holkar College', '452001'],
  ['Fatima Sheikh', '72, Bengali Square, Kanadia Road', '452016'],
  ['Rohit Chouhan', 'C-5, Saket Nagar', '452018'],
  ['Neha Jain', '120, Sapna Sangeeta Road', '452001'],
  ['Vikram Singh Tomar', 'Flat 6, Tilak Nagar', '452018'],
];

const PRODUCTS = [
  ['Whole wheat atta, 5 kg', 245], ['Toor dal, 1 kg', 162], ['Fresh paneer, 200 g', 90], ['Tomato, 1 kg', 48],
  ['Onion, 2 kg', 70], ['Potato, 2 kg', 64], ['Basmati rice, 1 kg', 138], ['Mustard oil, 1 l', 175],
  ['Toned milk, 1 l', 58], ['Brown bread, 400 g', 50], ['Curd, 400 g', 42], ['Moong dal, 1 kg', 148],
  ['Sugar, 1 kg', 48], ['Iodised salt, 1 kg', 28], ['Tea leaves, 250 g', 140], ['Bananas, 1 dozen', 60],
  ['Coriander leaves, 100 g', 15], ['Groundnut oil, 1 l', 190], ['Poha, 500 g', 38], ['Dish wash bar, 3 pcs', 45],
];

const NOTES = [
  'Please call before coming.', 'Leave with the security guard.', 'Ring the bell twice.', '',
  'Gate 3, tower B.', 'Do not ring the bell, baby is sleeping.', '', 'Deliver after 6 pm.',
];

const RAHUL_ORDERS = [
  { pos: ORDER_COUNT - 1, items: [[0, 1], [1, 1], [2, 1], [3, 1]], note: 'Please call before coming. Gate 2.', status: 'delivered' },
  { pos: 24, items: [[6, 2], [7, 1], [11, 2], [14, 1], [12, 1]], note: 'Please call before coming. Gate 2.', status: 'delivered' },
  { pos: 9, items: [[4, 1], [5, 1], [9, 2], [10, 2], [16, 1]], note: '', status: 'cancelled' },
];

function rng(seed) { // mulberry32: same instance, same data
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lines(rand, picks) {
  return picks.map(([i, qty]) => ({ name: PRODUCTS[i][0], qty, price: PRODUCTS[i][1] * qty }));
}

function fees(items) {
  const itemTotal = items.reduce((s, x) => s + x.price, 0);
  const delivery = itemTotal >= 999 ? 0 : 49;
  return { itemTotal, delivery, handling: 18, total: itemTotal + delivery + 18 };
}

/** A new store for one instance. `flag` goes only into the owner's order. */
function buildStore(flag) {
  const rand = rng(crypto.randomInt(1, 2 ** 31));
  const start = crypto.randomInt(10000, 89000);
  const now = Date.now();
  const rahulPos = new Set(RAHUL_ORDERS.map((o