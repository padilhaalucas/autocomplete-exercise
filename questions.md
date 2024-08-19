# React Interview Questions and Answers

## 1. What is the difference between Component and PureComponent? Give an example where it might break my app.

Component and PureComponent are both base classes for creating React components, but they differ in how they handle re-renders:

- **Component**: Re-renders whenever the parent re-renders, no matter whether the props or state have changed.
- **PureComponent**: Uses the shallow comparison technique to do the equality check of props/state with nextProps/nextState in the `shouldComponentUpdate()` fn. Then, it only re-renders if there's a shallow difference in props or state.

**nit obs.: (maybe to discuss later with you guys)** <br/>
_This touches some js stuff, since it'll compare non-primitive types by reference (which'll be different)_

Example where PureComponent might break the app:

```javascript
import React, { PureComponent } from 'react';

class Fruits extends React.Component {
  state = {
    data: ['Apple', 'Banana', 'Orange']
  };

  handleClick = () => {
    const newData = this.state.data;
    newData.push('Lemon');
    this.setState({ data: newData });
  };

  render() {
    return (
      <div>
        <button onClick={this.handleClick}>Add fruit</button>
        <FruitsList data={this.state.data} />
      </div>
    );
  }
}

class FruitsList extends PureComponent {
  render() {
    return (
      <div>
        {this.props.data.map((item, index) => (
          <p key={index}>{item}</p>
        ))}
      </div>
    );
  }
}
```

In this example, the `FruitsList` is a PureComponent. When the `Fruits`' handleClick method is called, it mutates the existing data array and sets it back to the state. And then, because PureComponent does the mentioned shallow comparison, it doesn't detect that the array has changed **_(since it's the same array reference)_**, and the `FruitsList` doesn't re-render even though its content has changed.

To fix this, I could create a new array when calling handleClick:

```javascript
handleClick = () => {
  this.setState(prevState => ({ data: [...prevState.data, 'Lemon'] }));
};
```

## 2. Context + ShouldComponentUpdate might be dangerous. Why is that?

Trying to summarize, is because`shouldComponentUpdate` can prevent components from re-rendering even when the context value changes.

We know that 👇
1. Context updates trigger re-renders on all components that consume that context.
2. `shouldComponentUpdate` is commonly used to optimize performance by preventing unnecessary re-renders.
 
**Then, to conclude:** If a component implements `shouldComponentUpdate` fn and doesn't account for context changes, it might prevent updates from propagating to its children, even if those children depend on the changed context.


Example:

```javascript
import React, { createContext, Component } from 'react';

const ThemeContext = createContext('light');

class App extends Component {
  state = { theme: 'light' };

  toggleTheme = () => {
    this.setState(prevState => ({
      theme: prevState.theme === 'light' ? 'dark' : 'light'
    }));
  };

  render() {
    return (
      <ThemeContext.Provider value={this.state.theme}>
        <button onClick={this.toggleTheme}>Toggle Theme</button>
        <ParentComponent />
      </ThemeContext.Provider>
    );
  }
}

class ParentComponent extends Component {
  shouldComponentUpdate() {
    return false; // Always returning false to mock prevention for re-renders
  }

  render() {
    return <ChildComponent />;
  }
}

class ChildComponent extends Component {
  static contextType = ThemeContext;

  render() {
    return <div>Current theme: {this.context}</div>;
  }
}
```

In this example, even though the theme context changes when the button is clicked, the ChildComponent won't update because ParentComponent's shouldComponentUpdate always returns false, blocking the context update from reaching the child.

To fix this, I could think in three solutions:
1. Remove `shouldComponentUpdate` from `ParentComponent`. (basic)
2. Implement `shouldComponentUpdate` to check for context changes: (fine-grained, since with this approach we could optimize re-renders for prop and state changes with more control)
```javascript
shouldComponentUpdate(nextProps, nextState, nextContext) {
   return JSON.stringify(this.context) !== JSON.stringify(nextContext);
}
```
3. Using functional components:
```javascript
const MyComponent = React.memo(({ children }) => {
  const context = useContext(MyContext);
  // Any component logic here
}, (prevProps, nextProps) => {
  // Custom comparison logic here
  return JSON.stringify(prevProps) !== JSON.stringify(nextProps)
});
```

## 3. Describe 3 ways to pass information from a component to its PARENT.

1. **Callback functions:**
The parent component passing a callback fn to the child as a prop. Then, child component can call this function and pass data as arguments.

```javascript
function Parent() {
  const handleChildData = (data) => {
    console.log('Data from child:', data);
  };

  return <Child onDataUpdate={handleChildData} />;
}

function Child({ onDataUpdate }) {
  const sendDataToParent = () => {
    onDataUpdate('Hello from child');
  };

  return <button onClick={sendDataToParent}>Send data to parent</button>;
}
```

2. **Lifting State Up:**
Moving the state to the parent component and pass it down to the child as props. The child component can then update this state using functions passed from the parent.

```javascript
function Parent() {
  const [data, setData] = useState('');

  return (
    <div>
      <p>Data from child: {data}</p>
      <Child updateData={setData} />
    </div>
  );
}

function Child({ updateData }) {
  return <button onClick={() => updateData('Updated in child')}>Update parent data</button>;
}
```

3. **Context API:**
Using the Context API to make data available to all components in a tree without explicitly passing props. (which I prefer for more complex cases, then if it gets even more complex, normally I move to redux management)
```javascript
const DataContext = React.createContext();

function Parent() {
  const [data, setData] = useState('');

  return (
    <DataContext.Provider value={{ data, setData }}>
      <div>
        <p>Data: {data}</p>
        <Child />
      </div>
    </DataContext.Provider>
  );
}

function Child() {
  const { setData } = useContext(DataContext);

  return <button onClick={() => setData('Updated via context')}>Update data</button>;
}
```

## 4. Give 2 ways to prevent components from re-rendering.

1. Using `memo` for functional components:
The React `memo` is a hoc that memoizes the result of a function component.

```javascript
import { memo } from 'React';

const MyComponent = memo((props) => {
  /* component code */
});
```
2. Implement `shouldComponentUpdate` for class components:
This lifecycle (for oop implementations) method allows you to control whether the component should re-render.

```javascript
class MyComponent extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    // Example: Only re-render if title changes
    return this.props.title !== nextProps.title;
  }

  render() {
    return <h1>{this.props.title}</h1>;
  }
}
```

## 5. What is a fragment and why do we need it? Give an example where it might break my app.

They are useful to allow "grouping" multiple elements without adding an extra DOM node. For instance, when some rendering logic is present and just one of three possible components will be rendered and they don't have a wrapper.

**Why fragments:**
1. To return multiple elements from a component without wrapping them in a parent div.
2. To avoid unnecessary DOM nodes, which can interfere with CSS flexbox and grid layouts.
3. To improve performance slightly by reducing the number of DOM nodes. _(lastly important)_

**Example:**

```javascript
import { Fragment } from 'React';

function MyComponent() {
  return (
    <Fragment>
      <h1>Title</h1>
      <p>Paragraph 1</p>
      <p>Paragraph 2</p>
    </Fragment>
  );
}
```

_Short syntax:_
```javascript
function MyComponent() {
  return (
    <>
      <h1>Title</h1>
      <p>Paragraph 1</p>
      <p>Paragraph 2</p>
    </>
  );
}
```

An example where fragments might break your app:

```javascript
function TableRows({ items }) {
  return (
    <>
      {items.map(item => (
        <tr key={item.id}>
          <td>{item.name}</td>
          <td>{item.value}</td>
        </tr>
      ))}
    </>
  );
}

function Table({ data }) {
  return (
    <table>
      <tbody>
        <TableRows items={data} />
      </tbody>
    </table>
  );
}
```

In this example, using a fragment in the TableRows component might break the table structure. The `<tr>` elements need to be direct children of `<tbody>` for the table to render correctly in all browsers. The `<></>`|`<Fragment></Fragment>` doesn't provide this guarantee.

To fix this, you could either:
1. Return the array directly without a fragment:

```javascript
function TableRows({ items }) {
  return items.map(item => (
    <tr key={item.id}>
      <td>{item.name}</td>
      <td>{item.value}</td>
    </tr>
  ));
}
```

## 6. Give 3 examples of the HOC pattern.

1. withLoading:
This HOC adds a loading state to a component.

```javascript
import React, { useState, useEffect } from 'react';

function withLoading(WrappedComponent) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return <WrappedComponent {...props} />;
  };
}

// Usage
function MyComponent({ data }) {
  return <div>{data}</div>;
}

const MyComponentWithLoading = withLoading(MyComponent);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulating an API call
    setTimeout(() => {
      setData('Data loaded');
      setIsLoading(false);
    }, 2000);
  }, []);

  return <MyComponentWithLoading isLoading={isLoading} data={data} />;
}
```

2. withAuth:
This one adds authentication checks to a component.

```javascript
import React, { useState, useEffect } from 'react';

function withAuth(WrappedComponent) {
   return function WithAuthComponent(props) {
      const [isAuthenticated, setIsAuthenticated] = useState(false);
      const [isChecking, setIsChecking] = useState(true);

      useEffect(() => {
         checkAuth();
      }, []);

      function checkAuth() {
         // Simulating a dumb auth check
         const token = localStorage.getItem('token');
         setIsAuthenticated(!!token);
         setIsChecking(false);
      }

      useEffect(() => {
         if (!isChecking && !isAuthenticated) {
            window.location.href = '/login';
         }
      }, [isChecking, isAuthenticated]);

      if (isChecking) {
         return <div>Checking authentication...</div>; // Or any loading indicator
      }

      if (!isAuthenticated) {
         return null; // Component will unmount and redirect will happen
      }

      return <WrappedComponent {...props} />;
   };
}

// Usage
function PrivateComponent() {
   return <div>This is a private component</div>;
}

const PrivateComponentWithAuth = withAuth(PrivateComponent);

export default PrivateComponentWithAuth;
```

3. withTheme:
This adds theming capabilities to a component.

```javascript
import React from 'react';

const themes = {
  light: {
    foreground: '#000000',
    background: '#ffffff',
  },
  dark: {
    foreground: '#ffffff',
    background: '#222222',
  },
};

function withTheme(WrappedComponent) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        theme: 'light',
      };
    }

    toggleTheme = () => {
      this.setState(prevState => ({
        theme: prevState.theme === 'light' ? 'dark' : 'light',
      }));
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          theme={themes[this.state.theme]}
          toggleTheme={this.toggleTheme}
        />
      );
    }
  };
}

// Usage
function ThemedComponent({ theme, toggleTheme }) {
  return (
    <div style={{ background: theme.background, color: theme.foreground }}>
      <h1>Themed Component</h1>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}

const ThemedComponentWithTheme = withTheme(ThemedComponent);
```

## 7. What's the difference in handling exceptions in promises, callbacks and async...await?

1. `Promises`:
By using .catch() method to handle the errors in the promise chain.

```javascript
fetchData()
  .then(data => processData(data))
  .catch(error => console.error('Error:', error));
```

2. Callbacks:
Pass an error as the first argument to the callback function.

```javascript
const fs = require('fs');

function fetchData(callback) {
   fs.readFile('data.json', 'utf8', (err, data) => {
      if (err) {
         callback(err, null);
         return;
      }
      try {
         const parsedData = JSON.parse(data);
         callback(null, parsedData);
      } catch (parseError) {
         callback(new Error('Error parsing JSON'), null);
      }
   });
}

fetchData((error, data) => {
  if (error) {
    console.error('Error:', error);
    return; // or throw the error, for instance
  }
  console.log('Data:', data);
});
```

3. Async/Await:
Use `try/catch` blocks to handle exceptions.

```javascript
async function fetchDataAndProcess() {
  try {
    const data = await fetchData();
    const processedData = await processData(data);
    return processedData;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

## 8. How many arguments does setState take and why is it async.

`setState` takes two arguments:
1. An object or a function that returns an object to update the state.
2. An optional callback function that runs after the state has been updated.

```javascript
this.setState({ count: this.state.count + 1 }, () => {
  console.log('State updated');
});

// or

this.setState((prevState) => ({ count: prevState.count + 1 }), () => {
  console.log('State updated');
});
```

`setState` is asynchronous for several reasons:

1. **Performance:** React can batch multiple `setState` calls into a single update for better performance.
2. **Consistency:** It ensures that components have consistent behavior and prevent race conditions.
3. **Reconciliation:** It allows React to optimize rendering by delaying updates and avoiding unnecessary recalculations.

And for this very reason, we shouldn't rely on the current state when calling `setState`, as it may lead to unexpected behavior. Instead, we can use the function form of it, when you need to compute the new state based on the previous one:
```javascript
// Wrong
this.setState({ count: this.state.count + 1 });

// Correct
this.setState((prevState) => ({ count: prevState.count + 1 }));
```

## 9. List the steps needed to migrate a Class to Function Component.

1. Change the component declaration:
```javascript
// From:
class MyComponent extends React.Component;

// To:
function MyComponent(props);
```

2. Remove the `render()` method, but keep its return statement in the function body.

3. Convert all methods to regular functions inside the component or move them outside if they don't use `this`.

4. Replace `this.state` with the `useState` hook:
```javascript
// From:
this.state = { count: 0 };

// To:
const [count, setCount] = useState(0);
```

5. Replace lifecycle methods with `useEffect`:
```javascript
// From:
componentDidMount;
// To:
useEffect(() => {}, []);

// From:
componentDidUpdate;
// To:
useEffect(() => {});

// From:
componentWillUnmount;
// To:
useEffect(() => { return () => {} }, []);
```

6. Replace `this.setState` calls:
```javascript
// From:
this.setState({ count: this.state.count + 1 });
// To:
setCount(prevCount => prevCount + 1);

```

7. Update all `this.props` to just `props`

8. If using context, replace `static contextType` with the `useContext` hook

9. For refs, replace `createRef` with `useRef`

10. If the component needs to forward refs, use `forwardRef` from `React`

11. For optimizing re-renders, replace `shouldComponentUpdate` with `memo` from `React`

Example of before and after:

```javascript
// Before
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  componentDidMount() {
    console.log('Mounted');
  }

  incrementCount = () => {
    this.setState(prevState => ({ count: prevState.count + 1 }));
  }

  render() {
    return (
      <div>
        Count: {this.state.count}
        <button onClick={this.incrementCount}>Increment</button>
      </div>
    );
  }
}

// After
function Counter(props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Mounted');
  }, []);

  const incrementCount = () => {
    setCount(prevCount => prevCount + 1);
  };

  return (
    <div>
      Count: {count}
      <button onClick={incrementCount}>Increment</button>
    </div>
  );
}
```

## 10. List a few ways styles can be used with components.

1. Inline styles:
   ```jsx
   <div style={{ color: 'blue', fontSize: '14px' }}>Hello</div>
   ```

2. CSS normal stylesheets:
   ```jsx
   import './MyComponent.css';
   
   function MyComponent() {
     return <div className="my-component">Hello</div>;
   }
   ```

3. CSS Modules:
   ```jsx
   import styles from './MyComponent.module.css';
   
   function MyComponent() {
     return <div className={styles.myComponent}>Hello</div>;
   }
   ```

4. Styled-components (CSS-in-JS):
   ```jsx
   import styled from 'styled-components';
   
   const StyledDiv = styled.div`
     color: blue;
     font-size: 14px;
   `;
   
   function MyComponent() {
     return <StyledDiv>Hello</StyledDiv>;
   }
   ```

5. Sass/SCSS: (one of my favorites)
   ```jsx
   import './MyComponent.scss';
   
   function MyComponent() {
     return <div className="my-component">Hello</div>;
   }
   ```

6. Tailwind CSS: (other one of my favorites)
   ```jsx
   function MyComponent() {
     return <div className="text-blue-500 text-sm">Hello</div>;
   }
   ```

8. Material-UI's makeStyles (for class components): (already used, because the company had it)
   ```jsx
   import { makeStyles } from '@material-ui/core/styles';
   
   const useStyles = makeStyles({
     root: {
       color: 'blue',
       fontSize: '14px',
     },
   });
   
   function MyComponent() {
     const classes = useStyles();
     return <div className={classes.root}>Hello</div>;
   }
   ```

## 11. How to render an HTML string coming from the server.

We can use the `dangerouslySetInnerHTML` prop. However, it's important to note that this should be used with caution as it can expose the app to xss attacks if the HTML is not properly sanitized.

Here's how we could use it:

```jsx
function MyComponent({ htmlString }) {
  return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
}
```

But, it's crucial to ensure that the HTML string is sanitized before rendering it. We can use libraries like `DOMPurify` to do this, for example:

```jsx
import DOMPurify from 'dompurify';

function MyComponent({ htmlString }) {
  const sanitizedHtml = DOMPurify.sanitize(htmlString);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}
```

Side alternative is whether we only need to render text with line breaks, the combination of `white-space: pre-wrap` CSS and `{htmlString}` can be fair enough:

```jsx
function MyComponent({ htmlString }) {
  return <div style={{ whiteSpace: 'pre-wrap' }}>{htmlString}</div>;
}
```

This method is safer as it doesn't interpret the string as HTML, but it won't render actual HTML elements or attributes.

## Final Note: Thanks for giving me this opportunity, I hope to discuss this kind of stuff when working with you guys! :)