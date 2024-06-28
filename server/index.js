
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors())
// BodyParser Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Task Model
const Task = mongoose.model('Task', new mongoose.Schema({
    entityName: String,
    date: Date,
    time: Date,
    phoneNumber: String,
    contactPerson: String,
    note: String,
    taskType: String,
    status: { type: String, default: 'Open' }
}));

app.get('/', (req, res) => {
    res.send('Hello from the server');
  });
// POST endpoint for adding a new task
app.post('/api/tasks', (req, res) => {
  const newTask = new Task(req.body);
  newTask.save()
    .then(task => res.json(task))
    .catch(err => res.status(400).json({ error: 'Unable to save task' }));
});

// GET endpoint for fetching all tasks
app.get('/api/list', (req, res) => {
  Task.find()
    .then(tasks => res.json(tasks))
    .catch(err => res.status(400).json({ error: 'Failed to fetch tasks' }));
});

// PUT endpoint for updating a task's note
app.put('/api/task/:taskId', (req, res) => {
  const { taskId } = req.params;
  const { note } = req.body;

  Task.findByIdAndUpdate(taskId, { note }, { new: true })
    .then(updatedTask => {
      if (!updatedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(updatedTask);
    })
    .catch(err => res.status(400).json({ error: 'Failed to update task note' }));
});

// PUT endpoint for updating a task's status
app.put('/api/task/status/:taskId', (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  Task.findByIdAndUpdate(taskId, { status }, { new: true })
    .then(updatedTask => {
      if (!updatedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(updatedTask);
    })
    .catch(err => res.status(400).json({ error: 'Failed to update task status' }));
});

// PUT endpoint for updating a task
app.put('/api/tasks/:taskId', (req, res) => {
  const { taskId } = req.params;

  Task.findByIdAndUpdate(taskId, req.body, { new: true })
    .then(updatedTask => {
      if (!updatedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(updatedTask);
    })
    .catch(err => res.status(400).json({ error: 'Failed to update task' }));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
