function foo() {
  const [scope_1_$name, set_scope_1_$name] = useState("foo");
  set_scope_1_$name(scope_1_$name + '111');
}

function bar() {
  const [scope_2_$name, set_scope_2_$name] = useState("bar");
  set_scope_2_$name('bar1');
}
