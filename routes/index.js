var express = require('express');
var router = express.Router();
const { verifyToken } = require('../middlewares/verifytoken');
const  {addTask,updateTask,deleteTask,completeTask,getTasksComplete,getTasksNotComplete ,getTaskById} = require('../controllers/tasks');

router.post("/add", verifyToken, addTask);
router.put("/update/:id", verifyToken, updateTask);
router.delete("/delete/:id", verifyToken, deleteTask);
router.patch("/complete/:id", verifyToken, completeTask);
router.get("/completed", verifyToken, getTasksComplete);
router.get("/not-completed", verifyToken, getTasksNotComplete);
router.get("/tasks/:id", verifyToken, getTaskById);

module.exports = router;
