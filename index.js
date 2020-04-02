const cache = {};

function createKey(name, scopeUid) {
  const key = `scope_${scopeUid}_${name}`;
  return key;
}

function getHook(name, scopeUid) {
  const key = createKey(name, scopeUid);
  return cache[key] || [];
}

function setHook(name, scopeUid) {
  const key = createKey(name, scopeUid);
  const hook = [key, `set_${key}`];
  cache[key] = hook;
  return hook
}

function getScopeUid(path) {
  return path.scope.uid;
}

function shouleApply(key, options) {
  const prefix = options && options.prefix || '$'
  return key.startsWith(prefix);
}

module.exports = function(api, opotions, filePath) {
  return {
    visitor: {
      VariableDeclaration(path) {
        const scopeUid = getScopeUid(path);
        const first = path.node.declarations[0];
        if (
          first.type === "VariableDeclarator" &&
          first.id &&
          first.id.type === "Identifier" &&
          shouleApply(first.id.name, opotions)
        ) {
          const hook = setHook(first.id.name, scopeUid);
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
        const scopeUid = getScopeUid(path);
        const expression = path.node.expression;
        const leftName = expression.left ? expression.left.name : "-";
        const hook = getHook(leftName, scopeUid)
        if (
          expression.type === "AssignmentExpression" &&
          expression.operator === "=" &&
          shouleApply(leftName, opotions) &&
          hook.length
        ) {
          function walk(node) {
            if (!node) {
              return;
            }
            if (node.type === "Identifier" && node.name === leftName) {
              node.name = hook[0];
              return;
            }
            walk(node.left);
            walk(node.right);
          }

          walk(expression.right);
          path.node.expression = {
            type: "CallExpression",
            callee: {
              type: "Identifier",
              name: hook[1]
            },
            arguments: [expression.right]
          };
        }
      }
    }
  };
};
