/**
 * Code without single-responsibility principle
 */

class Student {
    public createStudentAccount() {
        console.log(`Create Student Account`);
    }

    public calculateStudentGrade() {
        console.log(`Calculate Student Grade`);

    }

    public generateStudentData() {
        console.log(`Generate Student Data`);
    }
}

/**
 * According to SOLID, we can separate logic in three classes
 */

class StudentAccount {
    public createStudentAccount() {
        console.log(`Create Student Account`);
    }
}

class StudentGrade {
    public calculateStudentGrade() {
        console.log(`Calculate Student Grade`);

    }
}

class StudentData {
    public generateStudentData() {
        console.log(`Generate Student Data`);
    }
}