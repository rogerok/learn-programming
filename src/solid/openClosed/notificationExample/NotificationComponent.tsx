/**
 * Example without OCP
 */
import {CSSProperties, FC} from "react";

type NotificationType = 'success' | 'error';

interface NotificationProps {
    type: NotificationType;
    message: string;
}

// Adding a new notification type requires modifying the existing component.
// This violates the OCP because the class/component is not closed for modification.
const Notification = ({type, message}: NotificationProps) => {
    if (type === "success") {
        return <div style={{color: "green"}}>{message}</div>;
    } else if (type === "error") {
        return <div style={{color: "red"}}>{message}</div>;
    } else {
        // Introducing a new type would require additional logic here.
        throw new Error("Unknown notification type");
    }
};

/**
 * Example with OCP
 */

// Extend by object
// Using a lookup table for styles makes the system extendable without modifying the core logic.
// Adding new notification types involves updating `notificationStyles` but leaves the component logic intact.
const notificationStyles: Record<string, CSSProperties> = {
    success: {color: "green"},
    error: {color: "red"},
    warning: {color: "orange"}, // New types can be added here without changing the core component.
};

interface NotificationProps2 {
    type: keyof typeof notificationStyles;
    message: string;
}

const Notification2 = ({type, message}: NotificationProps2) => {
    const style = notificationStyles[type]; // Fetches style dynamically based on the type.

    // The logic for rendering the notification remains unchanged.
    return <div style={style}>{message}</div>;
};

// Extend by components
// Leveraging a component map promotes encapsulation and extensibility.
// Each notification type is encapsulated within its own component, adhering to OCP principles.
interface NotificationProps3 {
    message: string;
}

// Each type-specific component focuses solely on its rendering logic.
const SuccessNotification = ({message}: NotificationProps3) => (
    <div style={{color: "green"}}>{message}</div>
);

const ErrorNotification = ({message}: NotificationProps3) => (
    <div style={{color: "red"}}>{message}</div>
);

const WarningNotification = ({message}: NotificationProps3) => (
    <div style={{color: "orange"}}>{message}</div>
);

// A registry (or mapping) links notification types to components, allowing for extensibility.
const NotificationMap: Record<string, FC<NotificationProps3>> = {
    success: SuccessNotification,
    error: ErrorNotification,
    warning: WarningNotification, // New types can be added by extending the map, not modifying existing logic.
};

interface NotificationWrapperProps {
    type: keyof typeof NotificationMap;
    message: string;
}

// NotificationWrapper dynamically chooses the correct component based on the type.
// The wrapper adheres to OCP by deferring the logic to the component map.
const NotificationWrapper = ({type, message}: NotificationWrapperProps) => {
    const Component = NotificationMap[type]; // Dynamically fetches the appropriate component.
    return <Component message={message}/>;
};
