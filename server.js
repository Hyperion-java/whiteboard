const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory storage
// Structure: { boards: { [boardId]: { name: string, nodes: { [nodeId]: { text, x, y } } } } }
const boards = {};

// Generate IDs
const genId = () => Math.random().toString(36).substr(2, 9);

// List all boards
app.get('/boards', (req, res) => {
  const list = Object.entries(boards).map(([id, b]) => ({ id, name: b.name }));
  res.json(list);
});

// Create new board
app.post('/boards', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const id = genId();
  boards[id] = { name, nodes: {} };
  res.json({ id, name });
});

// Get board with nodes
app.get('/boards/:id', (req, res) => {
  const board = boards[req.params.id];
  if (!board) return res.status(404).json({ error: 'Board not found' });
  res.json(board);
});

// Add node to board
app.post('/boards/:id/nodes', (req, res) => {
  const board = boards[req.params.id];
  if (!board) return res.status(404).json({ error: 'Board not found' });
  const { text = 'New node', x = 50, y = 50 } = req.body;
  const nodeId = genId();
  board.nodes[nodeId] = { text, x, y };
  res.json({ nodeId, text, x, y });
});

// Update node
app.put('/boards/:boardId/nodes/:nodeId', (req, res) => {
  const board = boards[req.params.boardId];
  if (!board) return res.status(404).json({ error: 'Board not found' });
  const node = board.nodes[req.params.nodeId];
  if (!node) return res.status(404).json({ error: 'Node not found' });
  const { text, x, y } = req.body;
  if (typeof text === 'string') node.text = text;
  if (typeof x === 'number') node.x = x;
  if (typeof y === 'number') node.y = y;
  res.json({ success: true });
});

// Delete node
app.delete('/boards/:boardId/nodes/:nodeId', (req, res) => {
  const board = boards[req.params.boardId];
  if (!board) return res.status(404).json({ error: 'Board not found' });
  const node = board.nodes[req.params.nodeId];
  if (!node) return res.status(404).json({ error: 'Node not found' });
  delete board.nodes[req.params.nodeId];
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
