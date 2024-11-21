import React from "react";
import {observer} from "mobx-react-lite";
import {taskStore} from "./TaskStore";

const TaskListView = observer(() => {
    const {tasks, addTask, removeTask} = taskStore;

    const handleAddTask = () => {
        const title = prompt("Enter task title:");
        if (title) {
            addTask(title);
        }
    };

    return (
        <div>
            <h1>Task List</h1>
            <button onClick={handleAddTask}>Add Task</button>
            <ul>
                {tasks.map(task => (
                    <li key={task.id}>
                        <span
                            style={{
                                textDecoration: task.completed ? "line-through" : "none",
                            }}
                            onClick={() => task.toggleCompletion()}
                        >
                            {task.title}
                        </span>
                        <button onClick={() => removeTask(task.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
});

export default TaskListView;
