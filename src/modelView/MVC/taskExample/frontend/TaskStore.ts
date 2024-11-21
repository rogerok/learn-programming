import {TaskModel} from "./TaskModel.ts";
import {makeObservable} from "mobx";

export class TaskStore {
    tasks: TaskModel[] = [];

    constructor() {
        makeObservable(this)
    }

    addTask(title: string) {
        const newTask = new TaskModel(Date.now().toString(), title);
        this.tasks.push(newTask);
    }

    removeTask(id: string) {
        this.tasks = this.tasks.filter(task => task.id !== id);
    }

    get completedTasks() {
        return this.tasks.filter(task => task.completed);
    }

    get pendingTasks() {
        return this.tasks.filter(task => !task.completed);
    }
}

export const taskStore = new TaskStore();