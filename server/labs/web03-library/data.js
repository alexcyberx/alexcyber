// web-03 Narmada Valley College library database (all made up). `suffix`
// makes the archive table's name different for every lab instance, so a
// copied writeup ("SELECT * FROM rare_archive_k7q2") does not transfer.
// Book titles and authors are real, well-known books; everything else
// (accession numbers, members, codes) is fictional.
const BOOKS = [
  ['NVC/2004/0112', 'Gitanjali', 'Rabindranath Tagore', 'Available', 'general'],
  ['NVC/2004/0187', 'Godaan', 'Premchand', 'Issued', 'general'],
  ['NVC/2005/0233', 'Malgudi Days', 'R. K. Narayan', 'Available', 'general'],
  ['NVC/2005/0241', 'The Guide', 'R. K. Narayan', 'Available', 'general'],
  ['NVC/2006/0310', 'Wings of Fire', 'A. P. J. Abdul Kalam', 'Issued', 'general'],
  ['NVC/2006/0322', 'The Discovery of India', 'Jawaharlal Nehru', 'Reference only', 'general'],
  ['NVC/2007/0405', 'Train to Pakistan', 'Khushwant Singh', 'Available', 'general'],
  ['NVC/2007/0418', 'Madhushala', 'Harivansh Rai Bachchan', 'Available', 'general'],
  ['NVC/2008/0502', 'Rashmirathi', 'Ramdhari Singh Dinkar', 'Issued', 'general'],
  ['NVC/2008/0519', 'Yayati', 'V. S. Khandekar', 'Available', 'general'],
  ['NVC/2009/0604', 'Chemmeen', 'Thakazhi Sivasankara Pillai', 'Available', 'general'],
  ['NVC/2009/0617', 'Pather Panchali', 'Bibhutibhushan Bandyopadhyay', 'Issued', 'general'],
  ['NVC/2010/0721', 'Ponniyin Selvan', 'Kalki Krishnamurthy', 'Available', 'general'],
  ['NVC/2011/0803', 'Let Us C', 'Yashavant Kanetkar', 'Issued', 'general'],
  ['NVC/2012/0911', 'Computer Networks', 'Andrew S. Tanenbaum', 'Available', 'general'],
  ['NVC/2012/0916', 'Database System Concepts', 'Silberschatz, Korth, Sudarshan', 'Available', 'general'],
  ['NVC/2013/1002', 'Operating System Concepts', 'Silberschatz, Galvin, Gagne', 'Issued', 'general'],
  ['NVC/2013/1009', 'Introduction to Algorithms', 'Cormen, Leiserson, Rivest, Stein', 'Reference only', 'general'],
  ['NVC/2014/1120', 'Discrete Mathematics and Its Applications', 'Kenneth H. Rosen', 'Available', 'general'],
  ['NVC/2014/1131', 'Higher Engineering Mathematics', 'B. S. Grewal', 'Issued', 'general'],
  // Not shown to the public (section = 'restricted'): the "OR 1=1" trap.
  ['NVC/ARC/0007', 'Narmada Valley Survey Maps, 1931', 'Survey of India', 'Restricted', 'restricted'],
  ['NVC/ARC/0012', "College Founders' Letters, 1957", 'Office of the Principal', 'Restricted', 'restricted'],
  ['NVC/ARC/0001', 'Archive Register (staff only)', 'Office of the Librarian', 'Restricted. Archive access codes are not kept in the catalogue.', 'restricted'],
];

const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";

function build(db, flag, suffix) {
  const archive = 'rare_archive_' + suffix;
  const sql = [
    'CREATE TABLE books (accession_no TEXT PRIMARY KEY, title TEXT, author TEXT, status TEXT, section TEXT)',
    'CREATE TABLE members (card_no TEXT PRIMARY KEY, name TEXT, course TEXT, books_issued INTEGER)',
    'CREATE TABLE issue_log (id INTEGER PRIMARY KEY, card_no TEXT, accession_no TEXT, issued_on TEXT, due_on TEXT)',
    `CREATE TABLE ${archive} (id INTEGER PRIMARY KEY, manuscript TEXT, shelf TEXT, access_code TEXT)`,
    ...BOOKS.map((b) => `INSERT INTO books VALUES (${b.map(q).join(',')})`),
    "INSERT INTO members VALUES ('LIB-23-0418','Ananya Rao','B.Sc Physics',2),('LIB-23-0522','Imran Shaikh','B.Com',1),('LIB-24-0107','Kavya Nair','BCA',3),('LIB-24-0233','Harpreet Gill','B.A. English',0)",
    "INSERT INTO issue_log (card_no, accession_no, issued_on, due_on) VALUES ('LIB-24-0107','NVC/2011/0803','2026-10-20','2026-11-03'),('LIB-23-0418','NVC/2004/0187','2026-10-24','2026-11-07'),('LIB-24-0107','NVC/2013/1002','2026-10-27','2026-11-10')",
    `INSERT INTO ${archive} (manuscript, shelf, access_code) VALUES ('Palm leaf manuscript of the Amarakosha, 17th century','Vault A, tray 3','NVC-ARC-4471'),('Copper plate land grant, 11th century','Vault A, tray 1',${q(flag)}),('Hand-drawn map of the Narmada ghats, 1888','Vault B, drawer 2','NVC-ARC-2290')`,
  ];
  for (const s of sql) db.run(s);
  return archive;
}

module.exports = { build };
