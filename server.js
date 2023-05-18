// server.js

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors= require('cors')

const app = express();
app.use(cors());
// Connect to MongoDB
mongoose
      .connect('mongodb+srv://a6dubey:abhishek@cluster0.up5bxya.mongodb.net/', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
      });

// Create a user schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Create a list schema
const listSchema = new mongoose.Schema({
  title: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const List = mongoose.model('List', listSchema);

// Create a task schema
const taskSchema = new mongoose.Schema({
  title: String,
  completed: { type: Boolean, default: false },
  listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List' },
});

const Task = mongoose.model('Task', taskSchema);


app.use(bodyParser.json());


// Register a new user route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("User already exist")
      return res.json({ success: false, message: 'Username already exists' });
    }

    // Create a new user
    const newUser = new User({ username, password });
    await newUser.save();
    console.log(newUser);
    res.json({ success: true, message: 'User registered successfully', user});
  } catch (error) {
    res.json({ success: false, message: 'Failed to register user' });
  }
});

// User login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    res.json({ success: true, message: 'Login successful' ,user});
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

// Create a new list route
app.post('/lists', async (req, res) => {
  const { title, userId } = req.body;
  console.log(req.body)
  try {
    const newList = new List({ title, userId });
    console.log(newList)
    await newList.save();
    res.json({ success: true, message: 'List created successfully', newList });
  } catch (error) {
    res.json({ success: false, message: 'Failed to create list' });
  }
});


app.get('/lists/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const lists = await List.find({ userId });
    res.json({ success: true, message: 'Lists retrieved successfully', lists });
  } catch (error) {
    res.json({ success: false, message: 'Failed to retrieve lists' });
  }
});


// Create a new task route
app.post('/tasks', async (req, res) => {
  const { title, listId } = req.body;
  try {
    const newTask = new Task({ title, listId });
    await newTask.save();
    res.json({ success: true, message: 'Task created successfully', newTask });
  } catch (error) {
    res.json({ success: false, message: 'Failed to create task' });
  }
});
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json({ success: true, message: 'Tasks retrieved successfully', tasks });
  } catch (error) {
    res.json({ success: false, message: 'Failed to retrieve tasks' });
  }
});


// Move task to another list route
app.put('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { listId } = req.body;
  try {
    const task = await Task.findByIdAndUpdate(
      taskId,
      { listId },
      { new: true }
    );
    res.json({ success: true, message: 'Task updated successfully', task });
  } catch (error) {
    res.json({ success: false, message: 'Failed to update task' });
  }
});

// Mark task as completed route
app.delete('/tasks/:taskId', async (req, res) => {
  try {
    const taskId = req.params.taskId;

    // Find the task by taskId and remove it
    const deletedTask = await Task.findByIdAndRemove(taskId);

    if (!deletedTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

const port = process.env.PORT || 4000; // Use the server allotted port or default to 4000

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});