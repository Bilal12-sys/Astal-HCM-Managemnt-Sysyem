# Style Guide

Observed conventions in the existing project:

- Use ES modules for backend imports and exports: `import express from "express";`
- Use double quotes in backend JavaScript: `const PORT = process.env.PORT || 2000;`
- End backend statements with semicolons: `app.use(express.json());`
- Use two-space indentation in the client configuration: `  plugins: [react()],`
- Existing middleware uses four-space indentation inside functions: `const authorization = req.headers.authorization;`
- Name files in lowercase and separate related parts with dots: `task.route.js`
- Name folders by responsibility: `controllers`, `routes`, `middleware`
- Put controller handlers in separate files: `controllers/task/createtask.controller.js`
- Put database work in service files: `const Create_task_service = (data) => Tasks.create(data);`
- Keep Mongoose schemas in model files: `new mongoose.Schema(...)`
- Use object literals for response bodies: `success: false,`
- Use `async`/`await` for asynchronous controller and service work: `const data = await Login_service(...);`
- Handle controller failures with `try`/`catch`: `} catch (err) {`
- Send HTTP responses with Express `res.status(...).send(...)`: `res.status(200).send({`
- Return early when a request cannot continue: `return res.status(400).send({`
- Use `const` for values that are not reassigned: `const secret = process.env.JWT_SECRET;`
- Use arrow functions for handlers and small service functions: `const Get_tasks_service = () => Tasks.find();`
- Use camelCase for schema fields and local data: `dueDate`, `createdAt`
- Use Mongoose timestamps for created and updated dates: `timestamps: true`
- Use schema validation for constrained fields: `enum: ["pending", "in-progress", "completed"]`
- Use `.js` extensions on relative ES module imports: `import { Tasks } from "../../model/task.model.js";`

The server code has inconsistent capitalization and indentation between files; new backend code will retain its module/file organization while using consistent camelCase names and two-space indentation.
