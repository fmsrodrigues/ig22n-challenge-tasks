import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

const task = {
  id: 0,
  title: "complete challenge",
  description: "complete the challenge by yourself",
  completed_at: null,
  created_at: new Date(),
  updated_at: new Date(),
}

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    async handler(req, res) {
      const { search } = req.query;

      let searchOptions;
      if(search) {
        searchOptions = {
          title: search,
          description: search
        }
      }

      const tasks = database.select("tasks", searchOptions);

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: "POST",
    path: buildRoutePath('/tasks'),
    async handler(req, res) {
      const { title, description } = req.body;
      if(!title || !description) {
        return res.writeHead(400).end(JSON.stringify({ message: "You must provide a title and a description to create a task" }))
      }

      const task = {
        title,
        description,
        completed_at: null,
      }

      database.insert('tasks', task);

      return res.writeHead(201).end()
    }
  },
  {
    method: "PATCH",
    path: buildRoutePath('/tasks/:id/complete'),
    async handler(req, res) {
      const { id } = req.params;

      const task = database.getById('tasks', id);
      if(!task) {
        return res.writeHead(400).end(JSON.stringify({ message: "Task id not found" }))
      }

      if(task) {
        database.update('tasks', id, {
          ...task,
          completed_at: task.completed_at ? null : new Date().toISOString()
        });
      }

      return res.writeHead(204).end()
    }
  },
  {
    method: "PUT",
    path: buildRoutePath('/tasks/:id'),
    async handler(req, res) {
      const { id } = req.params;
      const { title, description } = req.body;

      if(!title && !description) {
        return res.writeHead(400).end(JSON.stringify({ message: "You must provide a new title and/or a new description to update a task" }))
      }

      const task = database.getById('tasks', id);
      if(!task) {
        return res.writeHead(400).end(JSON.stringify({ message: "Task id not found" }))
      }

      database.update('tasks', id, {
        title: title ?? task.title,
        description: description ?? task.description
      });

      return res.writeHead(204).end()
    }
  },
  {
    method: "DELETE",
    path: buildRoutePath('/tasks/:id'),
    async handler(req, res) {
      const { id } = req.params;

      const task = database.getById('tasks', id);
      if(!task) {
        return res.writeHead(400).end(JSON.stringify({ message: "Task id not found" }))
      }

      database.delete('tasks', id);

      return res.writeHead(204).end()
    }
  }
]