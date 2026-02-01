# Named Return Values
Named return values are best thought of as a way to document the purpose of the returned values.



`A return statement without arguments returns the named return values. This is known as a "naked" return. Naked return statements should be used only in short functions. They can harm readability in longer functions.`

Use naked returns if it's obvious what the purpose of the returned values is. Otherwise, use named returns for clarity.

```go
func getCoords() (x, y int) {
	// x and y are initialized with zero values

	return // automatically returns x and y
}
```

Is the same as:

```go
func getCoords() (int, int) {
	var x int
	var y int
	return x, y
}
```

## The Benefits of Named Returns

Good for Documentation (Understanding)
Named return parameters are great for documenting a function. We know what the function is returning directly from its signature, no need for a comment.

Named return parameters are particularly important in longer functions with many return values.

```go
func calculator(a, b int) (mul, div int, err error) {
    if b == 0 {
      return 0, 0, errors.New("can't divide by zero")
    }
    mul = a * b
    div = a / b
    return mul, div, nil
}
```

Which is easier to understand than:

```go
func calculator(a, b int) (int, int, error) {
    if b == 0 {
      return 0, 0, errors.New("can't divide by zero")
    }
    mul := a * b
    div := a / b
    return mul, div, nil
}
```

# Explicit Returns

Even though a function has named return values, we can still explicitly return values if we want to.

```go
func getCoords() (x, y int) {
	return x, y // this is explicit

```

Using this explicit pattern we can even overwrite the return values:

```go
func getCoords() (x, y int) {
    return 5, 6 // this is explicit, x and y are NOT returned
}
```

Otherwise, if we want to return the values defined in the function signature we can just use a naked return (blank return):

```go
func getCoords() (x, y int) {
    return // implicitly returns x and y
}
```