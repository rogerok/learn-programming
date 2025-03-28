## Error Handling

### Types of Errors

In “Domain Modeling Made Functional,” Scott Wlaschin divides errors into three types:

- _Domain errors_. Errors expected in business workflows, their cause lies in the application domain, and we know how
  to handle them. (For example, dividing by 0 in a calculator app is a domain error because this operation constraint is
  a part of the maths domain.)
- _Infrastructural errors_. These are also expected, and we know how to handle them, but they're related to the
  infrastructure,
  not the business logic. (For example,a failed network request.)
- _Panics_. These are unexpected errors. We don't know how to handle them and recover the app after they happen. For
  example getting `null` where we shouldn't have a panic, because we don't know how to make the application state valid
  again.

---

### Handling Techniques

- Throwing panics;
- Using result containers;
- Combining panics and containers;
- Combining containers and functional binding;

---

### Throwing panics

Most common way to deal with panics in JS is a `throw new Error()` statement.

The main problem is that panics are more suitable for unexpected errors than expected ones.
They describe situations that lead the program to an inconsistent state that _can't be recovered from_.

Expected errors, however, are recoverable, and we know how to handle them.
In business logic, for example, most of the errors are recoverable.
It's even recommended to avoid panics in the business logic because it should work event after removing all the panics.

In practice, however, this separation isn't always maintained. There are projects there are panics and errors are mixed.
But even in such projects, we can still improve the code.

Let’s say we have a function `getUser` that calls the backend API to fetch data about a user. Once it gets a response,
it parses it and stores the result in the storage.

```javascript
const getUser = async (id) => {
    const dto = await fetchUser(id);
    const user = dto ? parseUser(dto) : null;
    if (user) {
        storage.setUser(user);
    } else {
        storage.setError("Something went wrong");
    }
}
```

The `fetchUser` function requests the network and returns the DTO from server or null.

```javascript
async function fetchUser(url) {
    const response = await fetch(url);
    const {value, error} = await response.json();
    if (error) return null;
    return value;
}
```

The `parseUser` function parses the server response and returns the user object or null if the DTO is invalid.

```typescript
function parseUser(dto: UserDto): User | null {
    if (!dto || !dto.firstName || !dto.lastName) {
        return null;
    }
    return {...dto, fullName: `${dto.firstName} ${dto.lastName}`}
}
```

To understand how to start refactoring this code, let's first identify the problems in it:

- There's no error handling as such. We return null from the functions when something goes wrong, but we swallow the
  error reasons and don't handle them in any way.
- Because of null in the results of `fetchUser` and `parseUser`, we lose the context of the error. So we have to _check
  the data for the same errors again_ at the level above.
- The `fetchUser` function addresses _only some_ problems, and there's no explicit delegation of unexpected errors to
  other modules.It makes the code "unsafe" because of the app can crash anytime.
- We don't distinguish between infrastructural and domain errors. We might need this information to find bugs in the app
  faster when analyzing issues and bug reports.

#### Unexpected errors and missing context

In example above, we don't know what type of errors we will catch. If we miss an error it might crash the app when we
don't expect it to happen.

If an unexpected error occurs inside `fetchUser` function, the application will crash:

```javascript
async function fetchUser(url) {
    const response = await fetch(url);

    // Let's say, after unpacking JSON, we got `null` instead of an object.
    // The next line will then throw `null is not an object`:
    const {value, error} = await response.json();
    // ...
}
```

We can solve this by adding try-catch at the level above. Then the `getUser` function will catch the thrown error, and
we'll be able to handle it:

```javascript
async function getUser(id) {
    try {
        const dto = await fetchUser(id);
        const user = dto ? parseUser(dto) : null;
        if (user) storage.setUser(user);
        else storage.setError("Something went wrong.");
    } catch (error) {
        storage.setError("Couldn't fetch the data.");
    }
}
```

However, if we throw panics to handle _all_ errors, we can accidentally mix expected and unexpected errors.For example,
if we also handle validation errors of `parseUser` this way:

```typescript
function parseUser(dto: UserDto): User {
    if (!dto) {
        throw new Error("Missing user DTO.")
    }
    const {firstName, lastName} = dto;
    if (!firstName || !lastName) trow
    new Error("Invalid user DTO.")

    return {...dto, fullName: `${firstName} ${lastName}`}
}
```

Then `try-catch` at the level above will catch them, but we won’t be able to distinguish between network errors and
validation errors:

```javascript
async function getUser(id) {
    try {
        // ...
    } catch (error) {
        // Is `error` a network error or a validation error?
        // Is it expected or not?
        //
        // We can distinguish errors by the message
        // that was passed to the `Error` constructor,
        // but this is unreliable.
    }
}
```

#### Different Error Types

In javascript error type is separate class that extends `Error`.
We can extend it and specify the name and kind of the error, and some additional information.

For example:

```javascript
// Validation errors:
class InvalidUserDto extends Error {
    constructor(message) {
        super(message ?? "The given User DTO is invalid.");
        this.name = this.constructor.name;
    }
}

// API errors:
class NetworkError extends Error {
    constructor(message, status, traceId) {
        super(message ?? messageFromStatus(status));
        this.name = this.constructor.name;

        // We can extend the type with additional fields for logging:
        this.status = status;
        this.traceId = traceId;
    }
}
```

> ********************
> **If we need to throw several errors, we can use `AggregateError`**
> ********************

Then we can understand what exactly happens:

```javascript
async function getUser(id) {
    try {
        // ...
    } catch (error) {
        if (error instanceof InvalidUserDto) {
        } else if (error instanceof NetworkError) {
        } else throw error;
    }
}
```

#### Fail fast

This way has disadvantages:

- it uses panics in the business logic code and violates LSP inside the catch block.

advantages:

- when error occurs, we don't try to continue working, but go on to handle it.

#### Rethrow

We use it as a mechanism that helps us not to swallow errors that we can’t handle.

If the current error handler checked the error for all known types and couldn’t determine what to do with it, it can
rethrow it to a level above

After refactoring functions start looking linear, and the number of checks for null decreases:

```javascript
async function getUser(id) {
    try {
        const dto = await fetchUser(id);
        const user = parseUser(dto);
        storage.setUser(user);
    } catch (error) {
        if (error instanceof InvalidUserDto || error instanceof NetworkError) {
            storage.setError(error.message);
        } else throw error;
    }
}
```

#### Advantages

- Execution has become more _linear_. We stopped re-checking data for errors.
- Code moves to error handling as soon as _normal execution_ becomes impossible.
- _Context of errors is saved_.

#### Disadvantages

- A thrown error crash app at the run time if it isn't handled.
- It's easy to skip handling errors.
- There's almost no syntactic difference between errors and panics. It can make to separate them from each other.
- Using panics in domain code is a smell, because domain errors aren't panics.
- Checking for all potential errors is possible, but it looks ugly because of instanceof.
- We can avoid the use of instanceof with error subclasses for each “application layer,” but this makes the error model
  more complex.
- It isn’t clear who should handle a thrown error.
- Performance may suffer because each Error object collects stack and other information.

---

### Result containers

A result container is a type that lives in one or two states: result of successful operation or the error.

```typescript
// The container is a “box” that can be in 1 of 2 states:
// - `Success`, for returning a result
// - `Failure`, for returning an error

type Result<TOk, TErr> = Success<TOk> | Failure<TErr>;
type Success<T> = { ok: true; value: T };
type Failure<E> = { ok: false; error: E };
```

Using a container, we could rewrite the parseUser function something like this:

```typescript
type MissingDtoError = "MissingDTO";
type InvalidDtoError = "Invalid DTO";
type ValidationErr0r = MissingDtoError | InvalidDtoError;

const parseUser = (dto: UserDto): Result<User, ValidationError> => {
    if (!dto) {
        return Result.failure("MissingDTO")
    }

    const {firstName, lastName} = dto;

    if (!firstName || !lastName) {
        return Result.failure("InvalidDtoError");
    }

    return Result.success({...dto, fullName: `${firstName} ${lastName}`})
}
```

The function now returns a "box" with either result or error.

#### More Accurate Signature

With a container, we see possible errors in function signature, don't need to examine the source code.
_All expected outcomes_ of the operation are reflected in the returned type.

But containers has downside.
To use data from result we need to "unpack" the container:

```typescript
async function getUser(id) {
    try {
        const {value: dto, error: networkError} = await fetchUser(id);
        const {value: user, error: parseError} = parseUser(dto);
        storage.setUser(user);
    } catch (error) {
        // ...
    }
}
```

If there is an error, the `value` field will be empty when unpacking.That way, passing the data to the next function
won't be possible.
This way, the container signature forces us to remember potential errors and handle them:

```typescript
async function getUser(id) {
    try {
        const {value: dto, error: networkError} = await fetchUser(id);
        // Handle the `networkError`...

        const {value: user, error: parseError} = parseUser(dto);
        // Handle the `parseError`...

        storage.setUser(user);
    } catch (error) {
        // Handle unexpected situations...
    }
}
```

#### Explicit Handling

When unpacking containers, we can set up error handling. So we can stop "normal" execution of program and handle the
error:

```typescript
async function getUser(id) {
    try {
        const {value: dto, error: networkError} = await fetchUser(id);
        if (networkError) return handleError(networkError);
        // Or `throw new Error(networkError)` and handle it later.

        const {value: user, error: parseError} = parseUser(dto);
        if (parseError) return handleError(parseError);

        storage.setUser(user);
    } catch (error) {
        // ...
    }
}
```

#### Centralized Handling

Despite the need to handle errors explicitly, we can still set up centralized error handling. We can use a separate
function for handling use case errors like this:

```typescript
type ValidationError = MissingDtoError | InvalidDtoError;
type NetworkError = BadRequest | NotFound | ServerErrror;
type UseCaseError = ValidationError | NetworkError;

// The `handleGetUserErrors` function handles errors in the `getUser` use case:

function handleGetUserErrors(error: UseCaseError): void {
    const messages: Record<UseCaseError, ErrorMessage> = {
        MissingDTO: "The user DTO is required.",
        InvalidDTO: "The given DTO is invalid.",
    }
    // `Record<UseCaseError, ErrorMessage>` will make sure
    // we've covered all the expected errors.

    // If the error is unexpected, rethrow:

    const message = messages[error]
    if (!message) {
        throw new Error("Unexpected error");
    }

    // If we expect it, we handle it

    storage.setError(message);
    // If necessary, we can add some infrastructure stuff: 
    logger.logError(error)
    analytics.captureUserActions();
}
```

#### Panics are separated

Since the low-level code doesn't return the container but throws panics, we need to wrap such operations in `try-catch`
to return rhe container in case of a problem:

```typescript
type NetworkError = BadRequest | NotFound | InternalError;

async function fetchUser(url) {
    try {
        const response = await fetch(url);
        const {value, error} = await response.json();
        return error ? Result.failure("BadRequest") : Result.success(value);
    } catch (error) {
        //
        // If we expected the problem, wrap it in the container:

        const reason = errorFromStatus(error);
        if (reason) {
            return Result.failure(reason);
        } else {
            // If not, rethrow:
            throw new Error("Unexpected error when fetching user data.");
        }
    }
}
```

We would need to wrap every call to the "low-level" API.
It may increase the amount of code.
If the schema of working with these APis is the same, we can use decorators:

```typescript
// The decorator will accept the "unsafe" function,
// and call it inside `try-catch`.
// When an error occurs, it will check,
// if the error is expected and returns the container
// or rethrow the error

function robustRequest(request) {
    return async function perform(...args) {
        try {
            return await request(...args)
        } catch (error) {
            const reason = errorFromStatus(error);
            if (reason) {
                return Result.failure(reason)
            } else {
                throw new Error("Unexpected error when making request")
            }
        }
    }

}
```

___

### Cross-cutting concerns

When error handling is consistent throughout the project, it’s easier for us to track down the bugs in the code by, for
example, a bug report. But apart from that, centralized error handling allows us to compose cross-cutting concerns like
logging conveniently.

if error handlers are isolated, they can be _decorated_ with additional functionality.
For example, we can add logging to error handlers with decorators:

```typescript
// services/logger.js
// Logging service provides a function
// for sending a new event:

const logEvent = (entry: LogEntry) => {
}

// infrastructure/logger.js
// To avoid adding logs to each handler separatyle,
// we can create a decorator that takes a function,
// calls it and logs the result of the call:


const withLogger = (fn) => (...args) => {
    const result = fn(...args);
    const entry = createEntry({args, resutl});
    logEvent(entry)
}


// networks.js
// To use it, it'll be enough to wrap the handler with the logging decorator:


const handleNetworkError = (error: NetworkError) => {
}

const errorHandler = withLogger(handleNetworkError);
```

---
