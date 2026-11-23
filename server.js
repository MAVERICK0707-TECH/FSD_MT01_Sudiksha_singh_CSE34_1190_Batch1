const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

// ---------- In-memory data store ----------
let students = [
  { id: 201, rollNumber: 'CSE2401', name: 'Aarav Sharma', branch: 'CSE', semester: 3, email: 'aarav@example.com' },
  { id: 202, rollNumber: 'ECE2402', name: 'Diya Verma',   branch: 'ECE', semester: 3, email: 'diya@example.com' },
  { id: 203, rollNumber: 'CSE2403', name: 'Kabir Singh',  branch: 'CSE', semester: 3, email: 'kabir@example.com' },
];
let nextId = 204;

// ---------- Helpers ----------
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStudent(body) {
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['Request body must be a JSON object'];
  }
  if (!isNonEmptyString(body.rollNumber)) errors.push('rollNumber is required and must be a non-empty string');
  if (!isNonEmptyString(body.name)) errors.push('name is required and must be a non-empty string');
  if (!isNonEmptyString(body.branch)) errors.push('branch is required and must be a non-empty string');
  if (!Number.isInteger(body.semester) || body.semester < 1 || body.semester > 12) {
    errors.push('semester is required and must be an integer between 1 and 12');
  }
  if (!isNonEmptyString(body.email) || !EMAIL_RE.test(body.email.trim())) {
    errors.push('email is required and must be a valid email address');
  }
  return errors;
}

const clean = (b) => ({
  rollNumber: b.rollNumber.trim(),
  name: b.name.trim(),
  branch: b.branch.trim(),
  semester: b.semester,
  email: b.email.trim(),
});

const findIndexById = (idParam) => {
  const id = Number(idParam);
  if (!Number.isInteger(id)) return -1;
  return students.findIndex((s) => s.id === id);
};

const rollTaken = (roll, ignoreId) =>
  students.some((s) => s.rollNumber.toLowerCase() === roll.toLowerCase() && s.id !== ignoreId);

// ---------- Routes ----------

// 1. GET all
app.get('/api/students', (req, res) => {
  res.status(200).json(students);
});

// 6. Filter by branch (declared BEFORE /:id so "filter" isn't treated as an id)
app.get('/api/students/filter', (req, res) => {
  const { branch } = req.query;
  if (typeof branch !== 'string' || branch.trim() === '') {
    return res.status(400).json({ error: 'branch query parameter is required' });
  }
  const result = students.filter((s) => s.branch.toLowerCase() === branch.trim().toLowerCase());
  res.status(200).json(result);
});

// 3. GET by id
app.get('/api/students/:id', (req, res) => {
  const i = findIndexById(req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Student not found' });
  res.status(200).json(students[i]);
});

// 2. POST
app.post('/api/students', (req, res) => {
  const errors = validateStudent(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  const data = clean(req.body);
  if (rollTaken(data.rollNumber)) {
    return res.status(409).json({ error: `rollNumber ${data.rollNumber} already exists` });
  }

  const student = { id: nextId++, ...data };
  students.push(student);
  res.status(201).json(student);
});

// 4. PUT
app.put('/api/students/:id', (req, res) => {
  const i = findIndexById(req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Student not found' });

  const errors = validateStudent(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  const data = clean(req.body);
  if (rollTaken(data.rollNumber, students[i].id)) {
    return res.status(409).json({ error: `rollNumber ${data.rollNumber} already exists` });
  }

  students[i] = { id: students[i].id, ...data };
  res.status(200).json(students[i]);
});

// 5. DELETE
app.delete('/api/students/:id', (req, res) => {
  const i = findIndexById(req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Student not found' });
  const [removed] = students.splice(i, 1);
  res.status(200).json({ message: 'Student deleted successfully', student: removed });
});

// ---------- Error handling ----------
// Malformed JSON body -> 400
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Unknown routes -> 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(PORT, () => {
  console.log(`Student Management API running at http://localhost:${PORT}`);
});
