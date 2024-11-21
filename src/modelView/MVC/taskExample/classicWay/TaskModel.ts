type Observer = (model: TaskModel) => void;

class Task {
    constructor(public id: number, public title: string, public completed: boolean = false,) {
    }
}

export class TaskModel {
    private tasks: Task[] = [];
    private observers: Observer[] = [];


    private notifyObservers(): void {
        this.observers.forEach(observer => observer(this))
    }

    addObserver(observer: Observer): void {
        this.observers.push(observer);
    }

    addTask(title: string,): void {
        const task = new Task(this.tasks.length + 1, title)
        this.tasks.push(task);
        this.notifyObservers();
    }

    toggleTask(id: number): void {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.notifyObservers();
        }
    }

    getTasks(): Task[] {
        return this.tasks;
    }


}