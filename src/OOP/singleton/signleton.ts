class Database {
    url: number;

    constructor() {
        this.url = Math.random()
    }
}

/**
 * Создаём два экземпляра класса, поэтому url у db1 и db2 будут отличаться
 */
const db1 = new Database();
const db2 = new Database();
console.log(db1.url, db2.url);


/**
 * Создаём синглтон
 */

class DatabaseSingleton {
    url: number;
    private static instance: DatabaseSingleton;

    constructor() {
        if (DatabaseSingleton.instance) {
            return DatabaseSingleton.instance;
        }

        this.url = Math.random();
        DatabaseSingleton.instance = this
    }
}

const dbSingleton1 = new DatabaseSingleton();
const dbSingleton2 = new DatabaseSingleton();
// Значения будут равны
console.log(dbSingleton1.url, dbSingleton2.url)


/**
 * Так же можем создать синглтон используя приватный конструктор, что не позволит нам создавать экземпляры класса.
 */

class DatabaseSingletonPrivate {
    private static instance: DatabaseSingletonPrivate;
    url

    /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
    private constructor() {
        this.url = Math.random();
    }

    /**
     * The static getter that controls access to the singleton instance.
     *
     * This implementation allows you to extend the Singleton class while
     * keeping just one instance of each subclass around.
     */

    public static get getInstance(): DatabaseSingletonPrivate {
        if (!DatabaseSingletonPrivate.instance) {
            DatabaseSingletonPrivate.instance = new DatabaseSingletonPrivate();
        }
        return DatabaseSingletonPrivate.instance
    }


    public someBusinessLogic() {
        console.log('some logic')
    }
}

const privateSingleton = DatabaseSingletonPrivate.getInstance;
const privateSingleton2 = DatabaseSingletonPrivate.getInstance;
privateSingleton.someBusinessLogic()
// Синглтон работает. У переменных общий экземпляр
console.log(privateSingleton === privateSingleton2);