/**
 * Violating DIP
 */

// Direct dependency on implementation
const LoggerComp = () => {
    console.log("Component rendered!");
    return <div>Check the console!</div>;
};

// Here, the App component directly depends on the Logger component. If the logging mechanism changes, both Logger and App may need updates.
const App = () => (
    <div>
        <LoggerComp/>
    </div>
);

/**
 * Complying with DIP
 */

interface Logger {
    log(message: string): void;
}


// High-level component depends on abstraction
const LoggerComponent = ({logger, msg}: { logger: Logger, msg: string }) => {
    logger.log(msg);
    return <div>Check the console!</div>;
};

// Low-level implementation
class ConsoleLogger implements Logger {
    log(message: string) {
        console.log(message);
    }
}

// Using Dependency Injection
const App2 = () => {
    const logger = new ConsoleLogger();
    return <LoggerComponent msg={'msg log'} logger={logger}/>;
};
