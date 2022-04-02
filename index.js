// Import stylesheets
import './style.css';

// Write Javascript code!
const appDiv = document.getElementById('app');
appDiv.innerHTML = `<h1>JS Starter</h1>`;
function createRenderer(options) {
  // 通过options得到操作dom的api
  const {
    createElement,
    SetElementText,
    createText,
    setText,
    insert,
    patchProps,
  } = options;

  function render(vnode, container) {
    if (vnode) {
      // 新的vnode存在，将与其就vnode一起传递给pathc函数，进行打补丁
      patch(container._vnode, vnode, container);
    } else {
      if (container._vnode) {
        // 旧vnode存在，且新vnode不存在，说明是卸载unmount操作
        // 获取其旧vnode的真实dom元素
        // const el = container._vnode.el;
        // 获取其父元素
        // const parent = el.parentNode;
        // 调用removeChild移除元素
        // if (parent) parent.removeChild(el);
        unmount(container._vnode);
        // container.innerHTML = "";
      }
    }
    container._vnode = vnode;
  }
  //   卸载
  function unmount(vnode) {
    if (vnode.type === Fragment) {
      vnode.children.forEach((c) => unmount(c));
      return;
    }
    const parent = vnode.el.parentNode;
    if (parent) parent.removeChild(vnode.el);
  }
  //   patch函数
  function patch(n1, n2, container, anchor) {
    //n1 旧vnode n2 新vnode  container 容器
    // 将n1和n2类型进行比较
    if (n1 && n1.type !== n2.type) {
      // 当类型不同时，需要先将旧节点卸载，在进行接下来新节点的挂载
      unmount(n1);
      n1 = null;
    }
    const { type } = n2;
    // 如果n2是字符串则代表为普通标签
    if (typeof type === 'string') {
      if (!n1) {
        // 如果n1不存在，意味着挂载则调用mountElement 函数完成挂载
        mountElement(n2, container, anchor);
      } else {
        // n1存在，意味着打补丁
        patchElement(n1, n2);
      }
    }
    // 文本节点处理
    else if (typeof type === 'Text') {
      if (!n1) {
        // 如果旧节点不存在文本节点
        const el = (n2.el = createText(n2.children));
        insert(el, container);
      } else {
        // 如果旧节点存在文本节点就打补丁，更新文本内容
        const el = (n2.el = n1.el);
        if (n2.children !== n1.children) {
          setText(el, n2.children);
          // el.nodeValue = n2.children;
        }
      }
    }
    // 可能为组件或者Fragment
    else if (type === Fragment) {
      if (!n1) {
        n2.children.forEach((c) => {
          patch(null, c, container);
        });
      } else {
        patchChildren(n1, n2, children);
      }
    } else if (typeof type === 'object') {
      // 如果n2.type的值的类型是对象，则他描述的是组件
    }
  }
  // patchElement函数 处理对子节点打补丁
  function patchElement(n1, n2) {
    const el = (n2.el = n1.el);
    const oldProps = n1.props;
    const newProps = n2.props;
    // 第一步 更新props
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        patchProps(el, key, oldProps[key], newProps[key]);
      }
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        patchProps(el, key, oldProps[key], null);
      }
    }
    // 更新children
    patchChildren(n1, n2, el);
  }
  // patchChildren更新children
  function patchChildren(n1, n2, container) {
    // 判断新子节点的类型是否是文本节点
    if (typeof n2.children === 'string') {
      /* 旧子节点的类型有三种可能：没有子节点；文本子节点；以及一组子节点
          只有当旧子节点为一组子节点是，才需要逐个卸载，其他情况下什么都不需要做
      */
      if (Array.isArray(n1.children)) {
        n1.children.forEach((c) => {
          unmount(c);
        });
      }
      // 将新的文本子节点内容设置给容器元素
      SetElementText(container, n2.children);
    } else if (Array.isArray(n2.children)) {
      patchKeyChildren(n1, n2, container);
      /* if (Array.isArray(n1.children)) {
        // 新旧子节点都是一组子节点（数组的形式存储），这里涉及diff算法
        // 暂时以旧子节点全部卸载，新子节点全部装载来写
        n1.forEach((c) => {
          unmount(c);
        });
        n2.forEach((c) => {
          patch(null, c, container);
        });
      } else {
        // 此时 旧子节点要么不存在要么为文本节点只需要清空再将新子节点挂载即可
        SetElementText(container, "");
        n2.children.forEach((c) => {
          patch(null, c, container);
        });
      } */
      // 重新实现两组子节点的更新方式
      const oldChildren = n1.children;
      const newChildren = n2.children;
      /* const oldLen = oldChildren.length;
      const newLen = newChildren.length;
      const commonLen = Math.min(oldLen, newLen);
      // 遍历common次
      for (let i = 0; i < commonLen; i++) {
        patch(oldChildren[i], newChildren[i]);
      }
      // 如果newLen大于oldLen则更新
      if (newLen > oldLen) {
        for (let i = commonLen; i < newLen; i++) {
          patch(null, newChildren[i], container);
        }
        // 如果小于则卸载多余的
      } else if (newLen < oldLen) {
        for (let i = commonLen; i < oldLen; i++) {
          unmount(oldChildren[i]);
        }
      } */
      // 加上key后遍历新的children
      // 用来存储寻找过程中遇到的最大索引值
      /* let lastIndex = 0;
      for (let i = 0; i < newChildren.length; i++) {
        const newVnode = newChildren[i];
        // 遍历旧的children
        let j = 0;
        // 表示是否在旧的一组子节点中找到可复用的节点 初始为false
        let find = false;
        for (j; j < oldChildren.length; j++) {
          const oldVnode = oldChildren[j];
          // 移除多余的旧节点
          const has = newChildren.find((vnode) => vnode.key === oldVnode.key);
          if (!has) {
            unmount(oldVnode);
          }
          if (newVnode.key === oldVnode.key) {
            find = true;
            patch(oldVnode, newVnode, container);
            if (j < lastIndex) {
              // 说明当前找到的节点在旧children中的索引小于最大的索引值lastIndex
              // 说明该节点对应的真实dom需要移动
              const preVnode = newChildren[i - 1];
              // 如果preVnode不存在则说明当前newVnode是第一个节点，无需移动
              if (preVnode) {
                // 由于我们要将newVnode对应的真实dom移动到preVnode所对应真实dom后面

                const anchor = preVnode.el.nextSibling;
                insert(newVnode.el, container, anchor);
              }
            } else {
              // 如果当前找到的节点在旧children中的索引不小于最大索引值
              // 则更新lastIndex的值
              lastIndex = j;
            }
            break;
          }
        }
        // 当此时还没找到的话更需要新增节点，进行挂载
        if (!find) {
          const preVnode = newChildren[i - 1];
          let anchor = null;
          if (preVnode) {
            anchor = preVnode.el.nextSibling;
          } else {
            anchor = container.firstChild;
          }
          patch(null, newVnode, container, anchor);
        }
      } */
    } else {
      /* 新子节点不存在 */
      if (Array.isArray(n1.children)) {
        n1.children.forEach((c) => {
          unmount(c);
        });
      } else {
        SetElementText(container, '');
      }
    }
  }

  // 双端diff
  function patchKeyChildren(n1, n2, container) {
    const oldChildren = n1.children;
    const newChildren = n2.children;
    // 四个索引值
    let oldStartIndex = 0;
    let oldEndIndex = oldChildren.length - 1;
    let newStartIndex = 0;
    let newEndIndex = newChildren.length - 1;
    // 四个索引指向的Vnode节点
    let oldStartVnode = oldChildren[oldStartIndex];
    let oldEndVnode = oldChildren[oldEndIndex];
    let newStartVnode = newChildren[newStartIndex];
    let newEndVnode = newChildren[newEndIndex];
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      // 增加两个判断分支，如果头尾节点为undefined，则说明节点已经被处理过了，直接跳到下一个位置
      if (!oldStartVnode) {
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex];
      } else if (oldStartVnode.key === newStartVnode.key) {
        // 第一步 oldS和newS比较
        // 打补丁
        patch(oldStartVnode, newStartVnode, container);
        // 更新索引
        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else if (oldEndVnode === newEndVnode) {
        // 第二步 oldE 与 newE
        // 节点在新的顺序中仍然处于尾部，无需移动，只需要打补丁
        patch(oldEndVnode, newEndVnode, container);
        // 更新索引和尾部节点
        oldEndIndex = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex];
      } else if (oldStartVnode === newEndVnode) {
        // 第三步 oldS 与 newE
        // 调用patch打补丁
        patch(oldStartVnode, newEndVnode, container);
        // 移动dom
        insert(oldStartVnode.el, container, oldEndVnode.el);
        // 更新索引值
        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = newChildren[--newEndIndex];
      } else if (oldEndVnode === newStartVnode) {
        // 第四步 oldE 与 newS
        // 需要打补丁
        patch(oldEndVnode, newStartVnode, container);
        // 移动dom
        // 需要将oldEndVnode移动到oldStartVnode.el前面
        insert(oldEndVnode.el, container, oldStartVnode.el);
        // 移动完成后。更新索引值，并指向下一位
        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else {
        // 遍历旧的一组子节点，找到与newStartVnode有相同key的节点
        // indexOld 就是新的一组子节点的头部节点在旧的一组子节点中的索引
        const indexOld = oldChildren.findIndex(
          (node) => node.key === newStartVnode.key
        );
        // 如果indexOld大于0，则说明找到了可复用节点，且需要将其对应的真实dom移动到头部
        if (indexOld > 0) {
          // indexOld 位置对应的vnode就是需要移动的节点
          const vnodeToMove = oldChildren[indexOld];
          // patch打补丁
          patch(vnodeToMove, newStartVnode, container);
          // 将vnodeToMove.el移动到头部节点oldStartVnode.el之前，因此使用后者作为锚点
          insert(vnodeToMove.el, container, oldStartVnode.el);
          // 由于indexOld处的节点所对应的真实dom已经到了别处，需要将其设置为undefined
          oldChildren[indexOld] = undefined;
          // 更新一下newStartIndex
          newStartVnode = newChildren[++newStartIndex];
        } else {
          // 将newStartVnode作为新节点挂载到头部，使用当前头部节点，oldStartVnode.el作为锚点
          patch(null, newStartVnode, container, oldStartVnode.el);
        }
        newStartVnode = newChildren[++newStartIndex];
      }
    }
    // 循环检查结束后检查索引值情况
    if (oldEndIndex < oldStartIndex && newStartIndex <= newEndIndex) {
      // 如果满足条件，这说明有新的节点遗留，需要挂载他们
      for (let i = newStartIndex; i <= newEndIndex; i++) {
        patch(null, newChildren[i], container, oldStartVnode.el);
      }
    } else if (newEndIndex < newStartIndex && oldStartIndex <= oldEndIndex) {
      // 移除
      for (let i = oldStartIndex; i <= oldEndIndex; i++) {
        unmount(oldChildren[i]);
      }
    }
  }
  // 特殊属性处理
  function shouldSetAsProps(el, key, value) {
    if (key === 'from' && el.tagName === 'INPUT') return false;
    return key in el;
  }

  //   mountElement函数
  function mountElement(vnode, container, anchor) {
    // 创建dom元素
    // const el = document.createElement(vnode.type);
    // 给vnode绑定el属性对应的其自身真实dom节点
    const el = (vnode.el = createElement(vnode.type));
    // 处理子节点，如果子节点是字符串，代表元素具有文本节点
    if (typeof vnode.children === 'string') {
      //   el.textContent = vnode.children;
      SetElementText(el, vnode.children);
    } else if (Array.isArray(vnode.children)) {
      // 如果children是数组，则遍历每一个子节点，并调用patch函数挂载他们
      vnode.children.forEach((child) => {
        patch(null, child, el);
      });
    }

    // 处理props
    if (vnode.props) {
      // 遍历vnode。props
      for (const key in vnode.props) {
        patchProps(el, key, null, vnode.props[key]);
      }
    }
    // 将元素添加到容器中
    // container.appendChild(el);
    insert(el, container, anchor);
  }

  return {
    render,
  };
}

// 当children是string时
const vnode1 = {
  type: 'h1',
  children: 'hello',
};

const rednerer = createRenderer({
  // 用于创建元素
  createElement(tag) {
    return document.createElement(tag);
  },
  // 用于设置元素的文本节点
  SetElementText(el, text) {
    el.textContent = text;
  },
  //   用于在给定的parent下添加元素
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor);
  },
  // 创建文本节点
  createText(text) {
    return document.createTextNode(text);
  },
  // 设置文本节点
  setText(el, text) {
    el.nodeValue = text;
  },
  //   更新props
  patchProps(el, key, preValue, nextValue) {
    if (/^on/.test(key)) {
      // 根据属性名称得到对应的事件名称，例如onClick ==== click
      // 获取为该元素伪造的事件处理函数 invokers 使用一个对象是为了当一个dom绑定了多个事件时可以使用key-value来处理
      const invokers = el._vei || (el._vei = {});
      let invoker = invokers[key];
      const name = key.slice(2).toLowerCase();
      if (nextValue) {
        if (!invoker) {
          // 如果没有invoker，将一个伪造的invoker缓存到el._vei中
          // evi 是 vue event invoker的首字母缩写
          invoker = el._vei[key] = (e) => {
            // 如果invoker.value是一个数组,则遍历它并逐个调用事件处理函数
            // 为了处理当一个dom节点某一个点击事件绑定了多个回调函数时
            /* const vnode = {
              type: "p",
              props: {
                onClick: [
                  () => {
                    alert("child1");
                  },
                  () => {
                    alert("child2");
                  },
                ],
              },
            }; */
            // e.timeStamp 是指事件发生的时间
            // 如果事件发生的事件早于时间处理函数绑定的时间，则不执行事件处理函数
            if (e.timeStamp < invoker.attached) return;
            if (Array.isArray(invoker.value)) {
              invoker.value.forEach((fn) => fn(e));
            } else {
              // 当伪造的时间处理函数执行时，会执行真正的事件处理函数
              invoker.value(e);
            }
          };
          // 将真正的事件处理函数赋值给 invoker.value
          invoker.value = nextValue;
          // 添加invoker.attached属性，存储时间处理函数被绑定的时间
          invoker.attached = performance.now(); //高精时间
          // 绑定invoker作为事件处理函数
          el.addEventListener(key, invoker);
        } else {
          // 如果invoker存在 意味着更新
          invoker.value = nextValue;
        }
      } else if (invoker) {
        // 如果新的事件处理函数不存在，且之前绑定的invoker存在，则移除绑定
        el.removeEventListener(key, invoker);
      }
      // 先移除上一次绑定的事件处理函数
      preValue && el.removeEventListener(name, preValue);
      // 绑定新的事件处理 nextValue为时间处理函数
      el.addEventListener(name, nextValue);
    }
    //   对class的处理
    else if (key === 'class') {
      el.className = nextValue || '';
    }
    // 对属性绑定的处理
    else if (shouldSetAsProps(el, key, nextValue)) {
      /* 这里主要是对一些dom节点的属性进行兼容例如button中的disable */
      //   获取该domProps的类型
      const type = typeof el[key];
      // 如果是布尔类型，并且value是空字符串，则讲值矫正为true
      if (type === 'boolean' && nextValue === '') {
        el[key] = true;
      } else {
        el[key] = nextValue;
      }
    } else {
      // 调用setAttribute将属性设置到元素上
      el.setAttribute(key, nextValue);
    }
  },
});

rednerer.render(vnode1, document.querySelector('#app'));

// 挂载子节点和元素属性
const vnode2 = {
  type: 'div',
  props: {
    id: 'foo',
  },
  children: [
    {
      type: 'p',
      children: 'hello',
    },
  ],
};

// class的处理
// 方式一 字符串
<div class="foo bar"></div>;
const vnode3 = {
  type: 'div',
  props: {
    class: 'foo bar',
  },
};

// 方式二对象
/* <div :class='cls'></div> */
const cls = { foo: true, bar: false };
const vnode4 = {
  type: 'div',
  props: {
    class: { foo: true, bar: false },
  },
};

// 方式三 两种结合
/* <div :class='arr'></div> */
const arr = [
  // 字符串
  'foo bar',
  // 对象
  {
    baz: true,
  },
];
const vnode5 = {
  type: 'div',
  props: {
    // class: normalizeClass(["foo bar", { baz: true }]),
    class: 'foo bar baz',
  },
};
/* 处理上面的两种组合型class 可以使用内置封装的normalizeClass函数 */

/* 处理文本节点和注释节点 */
// 文本节点
const Text = Symbol();
const newVnode = {
  type: Text,
  children: '我是文本节点',
};
// 注释节点
const comment = Symbol();
const newV = {
  type: comment,
  children: '我是注释节点',
};
