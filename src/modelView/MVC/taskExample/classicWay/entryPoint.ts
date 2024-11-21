import {TaskModel} from "./TaskModel.ts";
import {TaskView} from "./TaskView.ts";
import {TaskController} from "./TaskController.ts";

const model = new TaskModel();
const view = new TaskView();
const controller = new TaskController(model, view);
controller.addTask('added task');
controller.toggleTask(1)
controller.showMenu();