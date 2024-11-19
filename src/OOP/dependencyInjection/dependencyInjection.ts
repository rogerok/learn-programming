interface User {
    name: string;
    age: number
}

interface UserRepo {
    getUsers(): User[];
}


class MongoUserRepo implements UserRepo {
    getUsers() {
        console.log('getting and returning data from mongo db')
        return [{name: 'Mongo DB', age: 15}];
    }
}

class SqlUserRepo implements UserRepo {
    getUsers() {
        console.log('getting and returning data from mysql db')
        return [{name: 'SQL DB', age: 18}];
    }
}

class UserService {
    userRepo: UserRepo;

    constructor(userRepo: UserRepo) {
        this.userRepo = userRepo;
    }

    filterUsersByAge(age: number): User[] {
        const users = this.userRepo.getUsers();
        return users.filter((val) => val.age === age)
    }
}

const userSqlService = new UserService(new SqlUserRepo());
console.log(userSqlService.filterUsersByAge(18));

const userMongoService = new UserService(new MongoUserRepo());
console.log(userMongoService.filterUsersByAge(15));
