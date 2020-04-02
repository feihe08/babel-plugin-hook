import React, { useState, useEffect } from "react";
import ReactDom from "react-dom";

const App = () => {
    let $count = 1
    return <div>
        <div>count: {count}</div>
        <button onClick={() => {
            $count = $count + 1
        }}>add</button>
    </div>
}
ReactDom.render(<App></App>, document.querySelector('#root') )