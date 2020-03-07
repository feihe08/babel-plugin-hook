# babel-plugin-hook

**not ready yet**

easy use for useState,

## how to use

```jsx
...
const $count = 0

<div>
  count: {${count}} <button onClick={() => {$count = $count + 1}} >add</button>
</div>


```

## todo
1. support declaration like this: `let $count = 1, name = 2`
2. identify the same key declaration
4. unit test