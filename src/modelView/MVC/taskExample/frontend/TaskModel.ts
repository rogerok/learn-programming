import {makeObservable} from "mobx";

export class TaskModel {
    id: string;
    title: string;
    completed: boolean;

    constructor(id: string, title: string, completed: boolean = false) {
        this.id = id;
        this.title = title;
        this.completed = completed;
        makeObservable(this);
    }

    toggleCompletion = (): void => {
        this.completed = !this.completed;
    }
}