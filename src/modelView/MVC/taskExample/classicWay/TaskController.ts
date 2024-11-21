import {TaskModel} from "./TaskModel.ts";
import {TaskView} from "./TaskView.ts";
import * as process from "node:process";
import * as readline from "node:readline";

export class TaskController {

    constructor(private model: TaskModel, private view: TaskView) {
        this.model.addObserver((model) => this.view.render(model))
    }

    addTask(title: string): void {
        this.model.addTask(title);
    }

    toggleTask(id: number): void {
        this.model.toggleTask(id);
    }

    showMenu(): void {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        const showOptions = () => {
            console.log("1. Add Task");
            console.log("2. Toggle Task");
            console.log("3. Exit");
            rl.question("Choose an option: ", (choice: string) => {
                switch (choice) {
                    case "1":
                        rl.question("Enter task title: ", (title: string) => {
                            this.addTask(title);
                            showOptions();
                        });
                        break;
                    case "2":
                        rl.question("Enter task ID: ", (id: string) => {
                            this.toggleTask(parseInt(id, 10));
                            showOptions();
                        });
                        break;
                    case "3":
                        rl.close();
                        break;
                    default:
                        console.log("Invalid choice. Try again.");
                        showOptions();
                        break;
                }
            });
        };
    }
}