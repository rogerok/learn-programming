import {TaskModel} from "./TaskModel.ts";

export class TaskView {
    render(model: TaskModel): void {
        console.log("\n=== Task List ===");
        model.getTasks().forEach(task => {
            const status = task.completed ? "✔" : "✖";
            console.log(`${task.id}: ${task.title} [${status}]`);
        });
        console.log("=================\n");
    }
}