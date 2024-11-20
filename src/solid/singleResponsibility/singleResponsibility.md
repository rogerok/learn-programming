### Single-responsibility principle

According to single-responsibility principle, a class should be responsible for only one activity and only have one
cause to change.
This rule also includes modules and functions.

#### Example without single-responsibility principle

```typescript
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
}class Student {

}
```


#### Example with single-responsibility principle

```typescript
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
```
