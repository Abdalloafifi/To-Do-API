const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const Tasks = require('../models/Tasks');
const { verifyTokenGrpc } = require('../middlewares/verifytoken');
const { withSecurity } = require('../middlewares/grpcSecurity');

const PROTO_PATH = path.join(__dirname, '../proto/tasks.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const tasksProto = grpc.loadPackageDefinition(packageDefinition).tasks;

async function getTasks(call, callback) {
    console.log(`[gRPC]  called from ${call.getPeer()} with metadata:`, call.metadata.getMap());

  try {
    const user = await verifyTokenGrpc(call.metadata);
    const { completed } = call.request;
    const query = { userId: user._id };
    
    if (completed !== undefined) {
      query.completed = completed;
    }

    const tasks = await Tasks.find(query);
    callback(null, { tasks });
  } catch (err) {
    callback({
      code: grpc.status.UNAUTHENTICATED,
      message: err.message
    });
  }
}

async function getTaskById(call, callback) {
    console.log(`[gRPC]  called from ${call.getPeer()} with metadata:`, call.metadata.getMap());
  try {
    const user = await verifyTokenGrpc(call.metadata);
    const task = await Tasks.findOne({ _id: call.request.id, userId: user._id });
    
    if (!task) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Task not found'
      });
    }
    
    callback(null, task.toObject());
  } catch (err) {
    callback({
      code: grpc.status.INTERNAL,
      message: err.message
    });
  }
}

async function addTask(call, callback) {
    console.log(`[gRPC]  called from ${call.getPeer()} with metadata:`, call.metadata.getMap());
  try {
    const user = await verifyTokenGrpc(call.metadata);
    const { title, description } = call.request;
    
    const newTask = new Tasks({
      title,
      description,
      userId: user._id
    });
    
    const savedTask = await newTask.save();
    callback(null, savedTask.toObject());
  } catch (err) {
    callback({
      code: grpc.status.INTERNAL,
      message: err.message
    });
  }
}

async function updateTask(call, callback) {
    console.log(`[gRPC]  called from ${call.getPeer()} with metadata:`, call.metadata.getMap());
  try {
    const user = await verifyTokenGrpc(call.metadata);
    const { id, title, description } = call.request;
    
    const updatedTask = await Tasks.findOneAndUpdate(
      { _id: id, userId: user._id },
      { title, description },
      { new: true }
    );
    
    if (!updatedTask) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Task not found'
      });
    }
    
    callback(null, updatedTask.toObject());
  } catch (err) {
    callback({
      code: grpc.status.INTERNAL,
      message: err.message
    });
  }
}

async function toggleTask(call, callback) {
    console.log(`[gRPC]  called from ${call.getPeer()} with metadata:`, call.metadata.getMap());
  try {
    const user = await verifyTokenGrpc(call.metadata);
    const task = await Tasks.findOne({ _id: call.request.id, userId: user._id });
    
    if (!task) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Task not found'
      });
    }
    
    task.completed = !task.completed;
    const toggledTask = await task.save();
    callback(null, toggledTask.toObject());
  } catch (err) {
    callback({
      code: grpc.status.INTERNAL,
      message: err.message
    });
  }
}

async function deleteTask(call, callback) {
    console.log(`[gRPC]  called from ${call.getPeer()} with metadata:`, call.metadata.getMap());
  try {
    const user = await verifyTokenGrpc(call.metadata);
    const result = await Tasks.findOneAndDelete({ _id: call.request.id, userId: user._id });
    
    if (!result) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Task not found'
      });
    }
    
    callback(null, { success: true });
  } catch (err) {
    callback({
      code: grpc.status.INTERNAL,
      message: err.message
    });
  }
}


function startServer() {
  const server = new grpc.Server();
server.addService(tasksProto.TaskService.service, {
  GetTasks: withSecurity(getTasks),
  GetTaskById: withSecurity(getTaskById),
  AddTask: withSecurity(addTask),
  UpdateTask: withSecurity(updateTask),
  ToggleTask: withSecurity(toggleTask),
  DeleteTask: withSecurity(deleteTask)
});
  
 const port = process.env.PORT || '50051';

server.bindAsync(
  `0.0.0.0:${port}`,   // مهم جدا هنا
  grpc.ServerCredentials.createInsecure(),
  (err, boundPort) => {
    if (err) {
      console.error('Failed to start gRPC server:', err);
      return;
    }
    console.log(`gRPC server running on port ${boundPort}`);
  }
);

  
  return server;
}

module.exports = { startServer };