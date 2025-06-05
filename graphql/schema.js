const { gql } = require('apollo-server-express');
const Tasks = require('../models/Tasks');

// 1. تعريف النوع (TypeDefs)
const typeDefs = gql`
  type Task {
    id: ID!
    title: String!
    description: String!
    completed: Boolean!
    userId: ID!
  }

  type Query {
    tasks(completed: Boolean): [Task!]!  # جلب المهام (مكتملة/غير مكتملة)
    task(id: ID!): Task                  # جلب مهمة بواسطة ID
  }

  type Mutation {
    addTask(title: String!, description: String!): Task!
    updateTask(id: ID!, title: String, description: String): Task!
    toggleTask(id: ID!): Task!
    deleteTask(id: ID!): Boolean!
  }
`;

// 2. تعريف المحللين (Resolvers)
const resolvers = {
  Query: {
    tasks: async (_, { completed }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      if (completed !== undefined) {
        return await Tasks.find({ userId: user._id, completed });
      }
      return await Tasks.find({ userId: user._id });
    },
    task: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await Tasks.findOne({ _id: id, userId: user._id });
    },
  },
  Mutation: {
    addTask: async (_, { title, description }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const newTask = new Tasks({ title, description, userId: user._id });
      return await newTask.save();
    },
    updateTask: async (_, { id, title, description }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await Tasks.findOneAndUpdate(
        { _id: id, userId: user._id },
        { title, description },
        { new: true }
      );
    },
    toggleTask: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const task = await Tasks.findOne({ _id: id, userId: user._id });
      if (!task) throw new Error('Task not found');
      task.completed = !task.completed;
      return await task.save();
    },
    deleteTask: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      await Tasks.findOneAndDelete({ _id: id, userId: user._id });
      return true;
    },
  },
};

module.exports = { typeDefs, resolvers };
