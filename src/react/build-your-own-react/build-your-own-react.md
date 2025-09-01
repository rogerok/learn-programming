# [Build your own react](https://pomb.us/build-your-own-react/)

**Steps**

* **Step 1**: The `createElement` Function
* **Step 2**: The `render` Function
* **Step 3**: Concurrent Mode
* **Step 4**: Fibers
* **Step 5**: Render and Commit Phases
* **Step 6**: Reconcilation
* **Step 7**: Function Components
* **Step 8**: Hooks

## Step Zero: Review

Default react app code

```jsx
const element = <h1 title={'foo'}>Hello</h1>;
const root = createRoot(document.getElementById('root'));
root.render(element)
```

**Let's remove all react specific code and replace it with vanilla js**

JSX is transformed by build tools, and tags replaced with a call to `createElement`, passing the tag name, the props and
the children as parameters

```js
const element = createElement('h1', {title: 'foo'}, "Hello");
const container = document.getElementById('root');
const root = createRoot(container);
root.render(element)
```

So, element is an object that has properties: type and props(it has more, but we interested im these two).

```js
const element = {
    type: 'h1',
    props: {
        title: 'foo',
        children: 'Hello'
    }
}
```

`render` is where React changes DOM

```js
const node = document.createElement(element.type);
node['title'] = element.props.title;

const text = document.createTextNode();
text['nodeValue'] = element.props.children;
node.appendChild(text);
container.appendChild(node)
```

## Step 1: The `createElement` Function

Transform JSX to JS so we can see the `createElement` calls.

```js
const element = (
    <div id='foo'>
        <a>bar</a>
        <b/>
    </div>
)

const container = document.getElementById('root');
const root = createRoot(container);
root.render(element)
```

As we saw previously, an element is an object with `type` and `props`. The only thing that our function needs to do is
create that object.

```js
function createElement(type, props, ...children) {
    return {
        type: type,
        props: {
            ...props,
            children
        }
    }
}
```

We use _spread operator_ for the `props` and _rest parameter syntax_ for the `children`, this way the `children` prop
will always be an array.

The `children` array could also contain primitive values like string or number. So anything that isn't an object we'll
wrap in special element  `TEXT_ELEMENT`
_React doesn't wrap like this, we do it to simplify or code_.

```js
function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map((child) => typeof child === "object" ? child : createTextElement(child))
        }
    }
}

function createTextElement(text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: []
        }
    }
}
```

Let's call our library Didact.

```js
const Didact = {
    createElement
};

const element = Didact.createElement("div", {id: 'foo'},
    Didact.createElement("a", null, "bar"),
    Didact.createElement("b")
)
```

But we still want to use JSX here. How do we tell babel to use Didact's `createElement` instead of React's?

```js
/** @jsx Didact.createElement */
const element = (
        <div id='foo'>
            <a>bar</a>
            <b/>
        </div>
    )
```

If we have comment like this, when babel transpiles the JSX it will use function we define.

## Step II: The `render` Function

We start by creating the DOM node using the element type, and then append the new node to the container.
We recursively do the same for each child.

```js
function render(element, container) {
    const dom = document.createElement(element.type);

    element.props.children.forEach((child) => render(child, dom));

    container.appendChild(dom)
}
```

We also need to handle text element.

```js
function render(element, container) {
    const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type);

    element.props.children.forEach((child) => render(child, dom));

    container.appendChild(dom)
}
```

We need to assign the element props to the node.

```js
function render(element, container) {
    const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type);

    const isProperty = (key) => key !== 'children';

    Object.keys(element.props).filter(isProperty).forEach((name) => {
        dom[name] = element.props[name]
    })

    element.props.children.forEach((child) => render(child, dom));

    container.appendChild(dom)
}
```

## Step 3: Concurrent Mode

There's a problem with the recursive call.

Once we start rendering, we won't stop untile we have rendered the complete element tree.
If the element tree is big, it may block the main thread for too long.
And if browser needs to do high priority stuff like handling user input or keeping an animation smooth, it will have to
wait until render finishes.

So we are going to break the work into small units, and after we finish each unit we'll let the browser interrupt the
rendering if there's anything else that needs to be done.

```js
let nextUnitOfWork = null;

function workLoop(deadline) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }
}

requestIdleCallback(workLoop);
```

We use `requestIdleCallback` to make a loop. You can think `requestIdleCallback` as a `setTimeout`, but instead of us
telling it when to run,
thquick sort with random pivote browser will run the callback when the main thread is idle.
_React doesn't suse `requestIdleCallback` anymore.Now it uses the scheduler package. But for this use case it's
conceptually the same._

`requestIdleCallback` also gives us a deadline parameter. We can use it to check how much time we have until the browser
needs to take control again.

To start using the loop we'll need to set the first unit of work, and then write a `performUnitOfWork` function that not
only performs the work, but also returns the next unit of work.

```js
function performUnitOfWork(nextUnitOfWork) {
//     TODO:
}
```

## Step 4: Fibers

To organize the units of work we'll need a data structure: a fiber tree.

We'll have one fiber for each element and each fiber will be a unit of work.

