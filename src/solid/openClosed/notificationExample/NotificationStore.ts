/**
 * Without OCP
 */

type NotificationType = {
    type: "success" | "error"; // Notification types are fixed here, and adding a new type requires modifying this structure.
    message: string;
};

class NotificationStore {
    notifications: NotificationType[] = []; // Stores notifications with a fixed type structure.

    // Adding a new notification type means updating this method with additional logic.
    // This violates the OCP because modifications are required to support extensions.
    addNotification(type: "success" | "error", message: string) {
        this.notifications.push({type, message});
    }
}

/**
 * With OCP - Using Polymorphism
 */

interface Notification {
    render(): string; // Each notification type implements its own rendering logic, adhering to OCP.
}

class SuccessNotification implements Notification {
    constructor(private message: string) {
    }

    render() {
        return `Success: ${this.message}`; // Custom rendering logic for success notifications.
    }
}

class ErrorNotification implements Notification {
    constructor(private message: string) {
    }

    render() {
        return `Error: ${this.message}`; // Custom rendering logic for error notifications.
    }
}

class NotificationStore2 {
    notifications: Notification[] = []; // The store now works with the abstract `Notification` interface.

    // Adding notifications is decoupled from the store's implementation.
    // Any class implementing the `Notification` interface can be added without modifying this method.
    addNotification(notification: Notification) {
        this.notifications.push(notification);
    }
}

// Adding a new type is seamless and doesn't require changes to the existing codebase.
class WarningNotification implements Notification {
    constructor(private message: string) {
    }

    render() {
        return `Warning: ${this.message}`; // Custom rendering logic for warning notifications.
    }
}

// Usage Example:
const store = new NotificationStore2();

// Extending functionality by adding different types of notifications.
store.addNotification(new SuccessNotification("Operation completed!")); // Success notification.
store.addNotification(new WarningNotification("Low disk space!"));      // Warning notification.
