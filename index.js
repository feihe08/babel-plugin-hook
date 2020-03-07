const cache = {};

function getHook(key) {
  if (cache[key]) {
    return cache[key];
  } else {
    const hook = [key.slice(1), `set_${key.slice(1)}`];
    cache[key] = hook;
    return hook;
  }
}

function shouleApply(key) {
  return key.startsWith("$");
}


module.exports = function({ types }) {
  return {
    visitor: {
      VariableDeclaration(path, state) {
        const first = path.node.declarations[0];
        if (
          first.type === "VariableDeclarator" &&
          first.id &&
          first.id.type === "Identifier" &&
          shouleApply(first.id.name)
        ) {
          const hook = getHook(first.id.name);
          path.node.declarations = [
            {
              type: "VariableDeclarator",
              id: {
                type: "ArrayPattern",
                elements: [
                  {
                    type: "Identifier",
                    name: hook[0]
                  },
                  {
                    type: "Identifier",
                    name: hook[1]
                  }
                ]
              },
              init: {
                type: "CallExpression",
                callee: {
                  type: "Identifier",
                  name: "useState"
                },
                arguments: [
                  {
                    type: first.init.type,
                    value: first.init.value,
                    raw: first.init.raw
                  }
                ]
              }
            }
          ];
        }
      },
      ExpressionStatement(path, state) {
        const expression = path.node.expression;
        const leftName = expression.left ? expression.left.name : "-";
        if (
          expression.type === "AssignmentExpression" &&
          expression.operator === "=" &&
          shouleApply(leftName) &&
          cache[leftName]
        ) {
          const hook = getHook(leftName)
          function walk(node) {
            if (!node) {
              return
            }
            if (node.type === 'Identifier' && node.name === leftName) {
              node.name = hook[0]
              return
            }
            walk(node.left)
            walk(node.right)
          }
          
          
          walk(expression.right)

          console.log(expression.right);
          path.node.expression = {
            type: "CallExpression",
            callee: {
              type: "Identifier",
              name: hook[1]
            },
            arguments: [
              expression.right
            ]
          };
        }
      }
    }
  };
};
