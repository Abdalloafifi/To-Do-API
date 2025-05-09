const Tasks= require('../models/Tasks');
const asyncHandler = require('express-async-handler');
const xss = require('xss');
const Joi = require('joi');

exports.addTask = asyncHandler(async (req, res) => {
    const data = {
        title: xss(req.body.title),
        description: xss(req.body.description),
    };
    const {err} = validateTask(data);
    if (err) {
        return res.status(400).json({ message: err.details[0].message });
    }
    const newTask = new Tasks({
        title: data.title,
        description: data.description,
        userId: req.user._id,
    });
    try {
        const savedTask = await newTask.save();
        res.status(201).json("Task added successfully", savedTask);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


exports.getTasksComplete = asyncHandler(async (req, res) => {
    try {
        const tasks = await Tasks.find({ userId: req.user._id, completed: true });
        if (!tasks) {
            return res.status(404).json({ message: 'No completed tasks found' });
        }
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


exports.getTasksNotComplete = asyncHandler(async (req, res) => {
    try {
        const tasks = await Tasks.find({ userId: req.user._id, completed: false });
        if (!tasks) {
            return res.status(404).json({ message: 'No incomplete tasks found' });
        }
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




exports.completeTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    try {
        const task = await Tasks.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        task.completed = !task.completed;
        await task.save();
        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

exports.getTaskById = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    try {
        const task = await Tasks.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


exports.updateTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const data = {
        title: xss(req.body.title),
        description: xss(req.body.description),
    };
    const { err } = validateTask(data);
    if (err) {
        return res.status(400).json({ message: err.details[0].message });
    }
    try {
        const updatedTask = await Tasks.findByIdAndUpdate(taskId, data, { new: true });
        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(updatedTask);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
function validateTask(data) {
    const schema = Joi.object({
        title: Joi.string().min(3).max(50).required(),
        description: Joi.string().min(5).max(500).required(),
    });
    return schema.validate(data);
}


exports.deleteTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    try {
        const deletedTask = await Tasks.findByIdAndDelete(taskId);
        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
