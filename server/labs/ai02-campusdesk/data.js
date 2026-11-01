// ── ai-02 "Trust the Query": the CampusDesk college database ────
// Kaveri Valley Institute of Technology (KVIT) is a fictional college. Every
// name, roll number and mark here is made up. The player is Rohan Mehta
// (21CS045). exam_vault is the table a student must never see: the DBMS
// end-sem unlock code is the flag. The database is the same for every player
// and is only ever read (see db-worker.js).

const ME = '21CS045';

const NAMES = [
  'Aarav Sharma', 'Ananya Iyer', 'Kabir Singh', 'Diya Patel', 'Vivaan Reddy', 'Ishita Nair', 'Arjun Menon', 'Sneha Kulkarni',
  'Rahul Verma', 'Pooja Joshi', 'Aditya Rao', 'Meera Pillai', 'Siddharth Jain', 'Kavya Shetty', 'Rohan Mehta', 'Nisha Gupta',
  'Yash Deshmukh', 'Tanvi Bhat', 'Harsh Agarwal', 'Riya Chatterjee', 'Manav Saxena', 'Aditi Kamath', 'Kunal Bose', 'Shruti Hegde',
  'Pranav Mishra', 'Neha Banerjee', 'Varun Krishnan', 'Simran Kaur', 'Omkar Patil', 'Bhavya Srinivasan', 'Dev Malhotra', 'Anjali Das',
  'Nikhil Pandey', 'Sana Shaikh', 'Tejas Gowda', 'Prachi Wagh', 'Ritvik Chopra', 'Lavanya Murthy', 'Ayaan Qureshi', 'Divya Raghavan',
];

const SUBJECTS = [
  ['CS301', 'Database Management Systems', 'Prof. A. Kulkarni', 4],
  ['CS302', 'Operating Systems', 'Dr. P. Nair', 4],
  ['CS303', 'Computer Networks', 'Prof. R. Das', 4],
  ['MA301', 'Discrete Mathematics', 'Dr. M. Khan', 3],
  ['HS301', 'Professional Communication', 'Ms. K. Joseph', 2],
];
const TOTALS = { CS301: 42, CS302: 40, CS303: 41, MA301: 40, HS301: 20 };
// Rohan's own numbers match the dashboard (81% overall, DBMS 69%).
const MY_ATT = { CS301: 29, CS302: 33, CS303: 35, MA301: 38, HS301: 13 };
const MY_MARKS = { CS301: 19, CS302: 24, CS303: 22, MA301: 26, HS301: 17 };

const TIMETABLE = [
  ['Monday', '09:00', 'CS302', 'LH-204'], ['Monday', '10:00', 'CS301', 'LH-204'], ['Monday', '11:15', 'MA301', 'LH-110'],
  ['Tuesday', '09:00', 'CS303', 'LH-204'], ['Tuesday', '10:00', 'HS301', 'LH-102'], ['Tuesday', '14:00', 'CS301', 'CL-2'],
  ['Wednesday', '09:00', 'MA301', 'LH-110'], ['Wednesday', '10:00', 'CS302', 'LH-204'], ['Wednesday', '11:15', 'CS303', 'CL-3'],
  ['Thursday', '09:00', 'CS301', 'LH-204'], ['Thursday', '10:00', 'CS303', 'LH-204'], ['Thursday', '14:00', 'HS301', 'LH-102'],
  ['Friday', '09:00', 'CS302', 'LH-204'], ['Friday', '11:15', 'MA301', 'LH-110'], ['Friday', '14:00', 'CS302', 'CL-1'],
  ['Saturday', '09:00', 'CS301', 'LH-204'], ['Saturday', '10:00', 'CS302', 'LH-204'], ['Saturday', '11:15', 'CS303', 'CL-3'], ['Saturday', '14:00', 'MA301', 'LH-110'],
];

// Small fixed pseudo-random numbers, so every build is the same.
function num(seed, min, max) {
  let h = 2166136261;
  for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return min + ((h >>> 0) % (max - min + 1));
}

function build(db, flag) {
  db.run(`CREATE TABLE students (roll_no TEXT PRIMARY KEY, name TEXT, branch TEXT, semester INTEGER, section TEXT, email TEXT)`);
  db.run(`CREATE TABLE subjects (code TEXT PRIMARY KEY, name TEXT, faculty TEXT, credits INTEGER)`);
  db.run(`CREATE TABLE attendance (roll_no TEXT, subject_code TEXT, attended INTEGER, total INTEGER)`);
  db.run(`CREATE TABLE marks (roll_no TEXT, subject_code TEXT, exam TEXT, marks INTEGER, max_marks INTEGER)`);
  db.run(`CREATE TABLE fees (roll_no TEXT, term TEXT, amount INTEGER, due_on TEXT, status TEXT)`);
  db.run(`CREATE TABLE timetable (day TEXT, start_time TEXT, subject_code TEXT, room TEXT)`);
  db.run(`CREATE TABLE exam_vault (subject_code TEXT, paper TEXT, unlock_code TEXT, release_on TEXT, uploaded_by TEXT)`);

  NAMES.forEach((name, i) => {
    const roll = '21CS' + String(31 + i).padStart(3, '0');
    const user = name.toLowerCase().replace(/[^a-z]+/g, '.');
    db.run('INSERT INTO students VALUES (?,?,?,?,?,?)', [roll, name, 'CSE', 3, i % 2 ? 'B' : 'A', user + '@kvit.example']);
    for (const [code] of SUBJECTS) {
      const total = TOTALS[code];
      const att = roll === ME ? MY_ATT[code] : num(roll + code, Math.round(total * 0.6), total);
      db.run('INSERT INTO attendance VALUES (?,?,?,?)', [roll, code, att, total]);
      const mk = roll === ME ? MY_MARKS[code] : num(roll + code + 'm', 9, 30);
      db.run('INSERT INTO marks VALUES (?,?,?,?,?)', [roll, code, 'Mid-sem', mk, 30]);
    }
    const paid = roll !== ME && num(roll + 'fee', 0, 3) > 0;
    db.run('INSERT INTO fees VALUES (?,?,?,?,?)', [roll, 'Odd semester 2026', 42500, '2026-11-12', paid ? 'Paid' : 'Due']);
  });
  for (const s of SUBJECTS) db.run('INSERT INTO subjects VALUES (?,?,?,?)', s);
  for (const t of TIMETABLE) db.run('INSERT INTO timetable VALUES (?,?,?,?)', t);
  db.run('INSERT INTO exam_vault VALUES (?,?,?,?,?)', ['CS301', 'DBMS end-sem paper', flag, '2026-11-24', 'Exam cell']);
  db.run('INSERT INTO exam_vault VALUES (?,?,?,?,?)', ['CS302', 'OS end-sem paper', 'EV-7Q2M-K9XD', '2026-11-26', 'Exam cell']);
  db.run('INSERT INTO exam_vault VALUES (?,?,?,?,?)', ['CS303', 'CN end-sem paper', 'EV-4T8B-P1RW', '2026-11-28', 'Exam cell']);
  db.run('INSERT INTO exam_vault VALUES (?,?,?,?,?)', ['MA301', 'Discrete Maths end-sem paper', 'EV-Z6N3-H5CJ', '2026-12-01', 'Exam cell']);
}

module.exports = { build, ME, SUBJECTS };
