```go
func getCreator(os string) string {
    var creator string
    switch os {
    case "linux":
        creator = "Linus Torvalds"
    case "windows":
        creator = "Bill Gates"
    case "mac":
        creator = "A Steve"
    default:
        creator = "Unknown"
    }
    return creator
}
```

Notice that in Go, the `break` statement is not required at the end of a case to stop it from falling through to the next `case`. The `break` statement is implicit in Go.


If you do want a `case` to fall through to the next case, you can use the `fallthrough` keyword.

```go
func getCreator(os string) string {
    var creator string
    switch os {
    case "linux":
        creator = "Linus Torvalds"
    case "windows":
        creator = "Bill Gates"

    // all three of these cases will set creator to "A Steve"
    case "macOS":
        fallthrough
    case "Mac OS X":
        fallthrough
    case "mac":
        creator = "A Steve"

    default:
        creator = "Unknown"
    }
    return creator
}
```