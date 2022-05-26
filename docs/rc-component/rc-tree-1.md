# antd Design tree下层组件 rc-tree 组件源码解析
## 前言
近一年看了很多 [ant Design](https://ant.design/index-cn) 及其下层组件的源码，学习到了一些知识，现在打算把这些知识梳理一下，所以输出了以下有关 [react-component](https://github.com/react-component) 组件的一些文章。本文基于 [rc-tree](https://github.com/react-component/tree) 组件进行分析。

## 源码目录结构及简析

我个人读组件源码大概分为这几个步骤。
1. 粗览一遍大部分代码，大概知道每个文件是起什么作用的，比如说: `index.ts`文件负责导出组件及组件相关的一些东西， `interface.tsx` 负责导出一些类型定义，`contextType.ts`负责`context`类型，`motionTreeNode`、`TreeNode` 负责树节点部分，`Tree.tsx`主要是`Tree`组件的代码实现，`nodeList.tsx`负责虚拟列表及渲染列表等等，大致知道文件的目录结构及文件作用后，再开始进行下一步。
2. 按照文件目录，来进行进一步的查看，先去看一些辅助(指辅助函数或者类型定义)比如说：看`utils`里实现了哪些辅助函数，这些函数分别大概是做什么的，`interface`里定义了哪些类型，再从组件的主要实现开始。
3. 确定主要入口文件,通读整个文件，遇到不会的或者不明白的地方，先跳过，继续往下读。读完整个文件后，将文件里的内容划分模块，按照模块来进行阅读。
4. 按照模块阅读，逐个模块来读，争取弄明白整个模块是做什么的。
5. 仔细阅读完成之后，再次浏览大致浏览整个代码。
6. 如果还没有明白某一块内容是做什么的时候，请重复4，5 。

基本上经过以上几个步骤之后，相信你可以对源码有了一个全方位的了解，根据自己的认知，结合代码，再次体会为什么要如此设计代码。我理解这种组件级别的源码学习，主要是学习代码如何设计，如何组织自己的代码，让上下层结构更为清晰、让代码更为简洁。而不是为了读源码而读源码，本质上读源码并不会有什么收货，而是你想真的想从源码中学习什么。

无论是上层的组件库`ant Design`还是下层的组件库 `react-component`，从文件命名上、结构目录上、代码组织上、甚至函数的命名，都有值得学习的地方，我相信大家在跟随我看完这个系列之后(不鸽的情况下)， 都可以有所收获，可以自己去尝试读一些源码，尝试提commit或者issue，甚至创造出自己设计的组件，去了解源码背后的知识。

#### 源码目录结构
```js
// src
├── DropIndicator.tsx
├── Indent.tsx // 缩进组件
├── MotionTreeNode.tsx // 带动画的树节点组件
├── NodeList.tsx // 节点列表
├── Tree.tsx // index
├── TreeNode.tsx
├── contextTypes.ts // context类型
├── index.ts // 导出
├── interface.tsx // 接口
├── util.tsx
└── utils
    ├── conductUtil.ts
    ├── diffUtil.ts
    └── treeUtil.ts
```

#### rc-tree主要内容

![rc-tree2.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dd1df0136e224d13963f0339f2eae737~tplv-k3u1fbpfcp-watermark.image?)

## props处理

```ts
// src/Tree.tsx
 static getDerivedStateFromProps(props: TreeProps, prevState: TreeState) {
    const { prevProps } = prevState;
    const newState: Partial<TreeState> = {
      prevProps: props,
    };
    // ...
    // ...
    // some code
    return newState;
  }
```
props处理主要集中在 `getDerivedStateFromProps` 这个函数中，来看一下有关这个函数的介绍。

>`getDerivedStateFromProps` 会在调用 **render 方法之前**调用，并且在**初始挂载**及**后续更新时**都会被调用。它应**返回一个对象来更新 state**，如果返回 `null` 则不更新任何内容。

通过解读官网中的这句话可以了解到，该函数会在 render 之前、初始挂在之后、后续更新时 调用，像这样，返回一个 `newState` 来更新 `state`、

```js
// src/Tree.tsx
static getDerivedStateFromProps(props,state) {
    const newState = merged(props,state); // merged用来合并 props和state
    return newState
}
```
大致了解这个函数后，继续来看 `getDerivedStateFromProps` 中的内容，也就是我的上面伪代码中的merged 部分。

```ts
// src/Tree.tsx
    const { prevProps } = prevState;
    const newState: Partial<TreeState> = {
      prevProps: props,
    };
    function needSync(name: string) {
      return (!prevProps && name in props) || (prevProps && prevProps[name] !== props[name]);
    }
```
获取上一次的(也就是 props 更新前的，来自 prevState.prevProps ) `prevProps`，创建一个`newState`，设置 newState.prevProps = props(当前的props)。 这样，既拥有了当前的 props，也拥有了上一次的props。接来下有个辅助函数 `needSync` 用来判断 是否需要同步新的props中的属性到 newState中。分为两种情况
1. `!prevProps && name in props` 首次更新时，prevProps 这时候还为 `null`；
2. `prevProps && prevProps[name] !== props[name]` 更新时，prevProps 对应的属性发生了变化时。

接下来就到了 `treeNode` 部分，也就是各式各样列表中的 data、options、dataSource、数据源，大家命名方式不一样，本质上都是一样的。用来渲染 `nodeList`。

```js
// src/Tree.ts
    let treeData: DataNode[];
    let { fieldNames } = prevState;
    if (needSync('fieldNames')) {
      fieldNames = fillFieldNames(props.fieldNames);
      newState.fieldNames = fieldNames;
    }
```
一部分一部分来看，首先创建一个新的变量 `treeData`，获取上一次的 `fieldNames`，同时判断是否需要同步 `fieldNames`， 若需要，则执行 `fillFieldNames(props.fieldNames)` 来更新 `fieldNames`。我理解该函数主要是来做，keyMapping 映射关系，来看一下这个函数。

```ts
// src/Tree.tsx
export interface FieldNames {
  title?: string;
  key?: string;
  children?: string;
}
function fillFieldNames(fieldNames?: FieldNames): Required<FieldNames> {
  const { title, key, children } = fieldNames || {};
  const mergedTitle = title || 'title';
  return {
    title: mergedTitle,
    key: key || 'key',
    children: children || 'children',
  };
}
```
该函数可以将 `title`、`key`、`children` 映射为其他字段。比如说:
```js
{
title:'name',
key:'value'
children:'childs'
}
```
可以通过该函数，将 `title`、`key`、`children` 作为实际使用的字段在 `treeData`中。


```ts
// src/Tree.tsx
    if (needSync('treeData')) {
      ({ treeData } = props)
    } else if (needSync('children')) {
      warning(false, '`children` of Tree is deprecated. Please use `treeData` instead.');
      treeData = convertTreeToData(props.children);
    }
```
再往下，若 `treeData` 需要更新则更新 `treeData`，或者是否需要更新 `children`，这里需要注意一下这段代码。

```js
warning(false, '`children` of Tree is deprecated. Please use `treeData` instead.');
```
这里报了一个 `waring`， 提示采用 `JSX` 形式是被(deprecated)废弃的，请使用`treeData`来代替，为什么这么提示呢？先来看一下这个 `convertTreeToData` 函数，

```js
//src/utils/treeUtil.ts
// 删掉了一些无用代码
// Convert `children` of Tree into `treeData` structure.
export function convertTreeToData(rootNodes: React.ReactNode): DataNode[] {
  function dig(node: React.ReactNode): DataNode[] {
    const treeNodes = toArray(node); // React.toArray()
    return treeNodes
      .map(treeNode => {
        const { key } = treeNode;
        const { children, ...rest } = treeNode.props;
        const dataNode: DataNode = {
          key,
          ...rest,
        };
        const parsedChildren = dig(children);
        if (parsedChildren.length) {
          dataNode.children = parsedChildren;
        }
        return dataNode;
      });
  }
  return dig(rootNodes);
}
```
该函数会将 `JSX` 转化为 `treeData`，具体转化的过程就不细看了，在这个过程中，因为是递归调用，我理解出于以下一些情况选择废弃了该场景的使用。
1. 存在一些不必要的性能损耗，完全可以使用 `treeData` 来替代。
2. 边界条件判断繁琐，某个不是`treeNode`的结构也有可能被转化
3. 所见不是所得，比如说用`propover`或者`tooltip`组件包装了 `treeNode`，但是在转化过程中，`propover`或者`tooltip`就被丢弃掉了。

```js
// example
<Tree>
    <Tooltip title='提示'>
        <TreeNode title='测试' key='test' />
    </Tooltip>
</Tree>
```
继续往下看

```ts
//src/Tree.tsx
    // Save flatten nodes info and convert `treeData` into keyEntities
    if (treeData) {
      newState.treeData = treeData;
      const entitiesMap = convertDataToEntities(treeData, { fieldNames });
      newState.keyEntities = {
        [MOTION_KEY]: MotionEntity,
        ...entitiesMap.keyEntities,
      };

      // Warning if treeNode not provide key
      if (process.env.NODE_ENV !== 'production') {
        warningWithoutKey(treeData, fieldNames);
      }
    }
```
这里有一行注释，解释了该部分的作用，将`treeData:DataNode[]`转化成为 `{[key]:DataNode}`的形式，通俗一点讲就是转为`Map`结构，不再用数组这种形式进行表达，具体有什么作用呢？可以先这里记录下来，等再次用到这个地方的时候，再来看这里。

继续往下看

```ts
//src/Tree.tsx
// ================ expandedKeys =================
    if (needSync('expandedKeys') || (prevProps && needSync('autoExpandParent'))) {
      newState.expandedKeys =
        props.autoExpandParent || (!prevProps && props.defaultExpandParent)
          ? conductExpandParent(props.expandedKeys, keyEntities)
          : props.expandedKeys;
    } else if (!prevProps && props.defaultExpandAll) {
      const cloneKeyEntities = { ...keyEntities };
      delete cloneKeyEntities[MOTION_KEY];
      newState.expandedKeys = Object.keys(cloneKeyEntities).map(key => cloneKeyEntities[key].key);
    } else if (!prevProps && props.defaultExpandedKeys) {
      newState.expandedKeys =
        props.autoExpandParent || props.defaultExpandParent
          ? conductExpandParent(props.defaultExpandedKeys, keyEntities)
          : props.defaultExpandedKeys;
    }
```
这里就到了另外props处理中的其他部分 `expandedKeys`，判断如果`expandedKeys`或者`autoExpandParent` 需要更新，则执行。首先，设置新的`expandedKeys`，有`autoExpandParent`或者`defaultExpandParent`为 `true`，则执行`conductExpandParent(props.expandedKeys, keyEntities)`，否则使用传入的参数`expandedKeys`。来看一下`conductExpandParent`这个函数，该函数传入了`props`参数 `expandedKeys`和上一步得到的`keyEntities`，看一下具体函数实现
```ts
/**
 * If user use `autoExpandParent` we should get the list of parent node
 * @param keyList
 * @param keyEntities
 */
export function conductExpandParent(keyList: Key[], keyEntities: Record<Key, DataEntity>): Key[] {
  const expandedKeys = new Set<Key>();
  function conductUp(key: Key) {
    // some code
  }
  (keyList || []).forEach(key => {
    conductUp(key);
  });
  return [...expandedKeys];
}

```
该函数注释内容也做出了解释，如果使用`autoExpandParent`参数的话，获取list的父节点，`keyList` 参数是需要展开的节点，`keyEntities` 参数是上一部分生成的`{[key]:DataNode}`结构的对象。遍历`KeyList` 执行 `conductUp` 函数，

```ts
//src/Tree.tsx
  function conductUp(key: Key) {
    if (expandedKeys.has(key)) return;

    const entity = keyEntities[key];
    if (!entity) return;

    expandedKeys.add(key);

    const { parent, node } = entity;

    if (node.disabled) return;

    if (parent) {
      conductUp(parent.key);
    }
  }
```
`conductUp` 这个函数也比较简单，在 `keyEntities` 中获取 `entity`。 首先：如果有 `entity`，直接返回，表示了该Key就是父节点，不需要展开。如果没有则在 `expandedKeys` (Set结构)增加该Key，若当前Key对应的节点是 `disabled` 状态，则返回，若有 `parent`节点，递归执行 `conductUp`。相信大家都知道为什么要递归执行吧，假设当前Key为第三级，这时取到的 `parent` 为第二级，还要打开第二级，所以递归执行该函数。

到这里也明白了在上一步生成的 `keyEntities` 对象在这里起到的作用，利用空间换时间的方式，可以在O(1)的时间内取到对应的Key。

继续往下看

```js
//src/Tree.tsx
// ================ flattenNodes =================
    if (treeData || newState.expandedKeys) {
      const flattenNodes: FlattenNode[] = flattenTreeData(
        treeData || prevState.treeData,
        newState.expandedKeys || prevState.expandedKeys,
        fieldNames,
      );
      newState.flattenNodes = flattenNodes;
    }
```
`flattenNodes`模块，若有 `treeData` 或有新的需要展开的Key，则利用 `flattenTreeData` 重新生成 `flattenNodes` 该方法会将数组扁平化处理，`flattenTreeData` 这个方法留到 `nodeList` 部分再细说，在这里先放一放。


继续往下看

```ts
//src/Tree.tsx
// ================ selectedKeys =================
    if (props.selectable) {
      if (needSync('selectedKeys')) {
        newState.selectedKeys = calcSelectedKeys(props.selectedKeys, props);
      } else if (!prevProps && props.defaultSelectedKeys) {
        newState.selectedKeys = calcSelectedKeys(props.defaultSelectedKeys, props);
      }
    }
```
该模块是用来计算选中的Keys，若`selectable`且`selectedKeys`有变化时，计算`selectedKeys`。
```ts
//src/util.tsx
export function calcSelectedKeys(selectedKeys: Key[], props: TreeProps) {
  if (!selectedKeys) return undefined;

  const { multiple } = props;
  if (multiple) {
    return selectedKeys.slice();
  }

  if (selectedKeys.length) {
    return [selectedKeys[0]];
  }
  return selectedKeys;
}
```
`calcSelectedKeys`这个函数也比较简单，不过需要注意的是，如果是(multiple)多选状态，则返回一个新的引用(浅拷贝)，如果不是(multiple)多选状态，且 `selectedKeys` 是个数组，则会取数组中的第一位(也是一个新的引用)。否则直接返回 `selectedKeys`。多说一点有过`slice()`的执行方式，来看一下[ECMAScript](https://tc39.es/ecma262)的文档

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a6a945b22b964420ab7ae44124f8bb66~tplv-k3u1fbpfcp-watermark.image?)
解释一下1、2、3....就是官方文档定义了`slice`函数执行的步骤，可以根据该步骤来实现`slice`函数,
核心关注这几步:

3. Let `relativeStart` be ? [ToIntegerOrInfinity](https://tc39.es/ecma262/#sec-tointegerorinfinity)(`start`). 这段话大约等于下面代码(下面同理)
```js
function ToNumber(argument){
    if(typeof argument === 'undefined'){
        return NaN;
    }
    //some code 
}
function ToInterOrInfinity(argument){
    return ToNumber(argument)
    //some code 
}
let relativeStart = ToIntegerOrInfinity(start) // 0
```
6. Else, let `k` be [min](https://tc39.es/ecma262/#eqn-min)(`relativeStart`, `len`).
```js
let k = Math.min(relativeStart,length); // relativeStart;
```
7. If `end` is undefined, let `relativeEnd` be `len`; else let `relativeEnd` be? [ToIntegerOrInfinity](https://tc39.es/ecma262/#sec-tointegerorinfinity)(`end`).
```js
let relativeEnd
if(typeof end === 'undefined') {
    relativeEnd = length
} 
relativeEnd = ToIntegerOrInfinity(end);
```

10. Else, let `final` be [min](https://tc39.es/ecma262/#eqn-min)(`relativeEnd`, `len`).
11. Let `count` be [max](https://tc39.es/ecma262/#eqn-max)(`final` - `k`, 0).
12. Let `A` be ? [ArraySpeciesCreate](https://tc39.es/ecma262/#sec-arrayspeciescreate)(`O`, `count`).
13. Let `n` be 0.

```js
let final = Math.min(relativeEnd,len) // relativeEnd;
let count = Math.max(final - k,,0) // final - k === final
let A = new Array(final) // new Array(length)
```

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a68f84c2a275433c9e04649fd5e2c3b0~tplv-k3u1fbpfcp-watermark.image?)
```js
// k = 0;
// final = length;
while(k < final){
    let Pk = k.toString();
    let kPresent = O.hasProperty(Pk);
    if(kPresent){
    let kValue = O.get(Pk);
    // 如果该步骤失败，则 throw a TypeError exception
    try{
    A[n] = kValue; 
    } catch(err) {
        throw(`TypeError ${err}`)
    }
    }
    k++;
    n++;
}
```

15. Perform ? [Set](https://tc39.es/ecma262/#sec-set-o-p-v-throw)(`A`, "length", [𝔽](https://tc39.es/ecma262/#%F0%9D%94%BD)(`n`), true).
16. Return `A`.
```js
A.length = n;
return A;
```
一些其他跟 `slice()` 不太相关的我就不贴了，可以看出来当 `slice` 函数不传参数时，会默认设置start和end，然后创建一个`Array(length)`,循环赋值，最后返回这个`Array`。 相信经过这样分析后，对于 `Array.prototype.slice` 函数都有了新的认知~。

到这里，关于 props的处理就已经完成了。总的来看的话，分析了`getDerivedStateFromProps`函数的作用，将`getDerivedStateFromProps`中的代码拆分成对应的小的模块来进行梳理。

## event事件

在 `rc-tree` 组件中，event事件大致分为以下几种类型
1. Drag
2. Check
`drag`和 `check` 操作都比较复杂，计划系统的说明一下，应该会在下一篇中进行说明。

3. select
```ts
onNodeSelect = (e, treeNode) => {
    let { selectedKeys } = this.state;
    const { keyEntities, fieldNames } = this.state;
    const { onSelect, multiple } = this.props;
    const { selected } = treeNode;
    const key = treeNode[fieldNames.key];
    const targetSelected = !selected;

    // Update selected keys
    if (!targetSelected) {
      selectedKeys = arrDel(selectedKeys, key);
    } else if (!multiple) {
      selectedKeys = [key];
    } else {
      selectedKeys = arrAdd(selectedKeys, key);
    }
    const info = {
        event: 'select',
        selected: targetSelected,
        node: treeNode,
        selectedNodes:selectedKeys.map(selectedKey => {
        if (!keyEntities[selectedKey]) return null;
        return keyEntities[selectedKey].node;
      })
      .filter(node => node),
        nativeEvent: e.nativeEvent,
      }

    this.setUncontrolledState({ selectedKeys });

    if (onSelect) {
      onSelect(selectedKeys, info);
    }
  };
```
来看一下跟`onSelect` 相关的代码。先获取了一些必要的参数，判断当前执行`onSelect`的 `Node`，根据是否被选中来更新 `selectedKeys`,然后构建一个 `selectedNodes`，执行传入的 `props.onSelect` 方法。
4. ### click、doubleclick、mouseLeave、focus、blur等

这些原生的事件没什么好说的，都十分简单，自己看相应的源码即可。

## context和render

熟悉 `React` 的同学大概都知道 `Context` 怎么使用吧，`Context` 提供了一种在组件之间共享此类值的方式，而不必显式地通过组件树的逐层传递 `props`。当有大量参数需要隔组件传递时，可以使用 `Context`来进行参数的共享。

```jsx
 <TreeContext.Provider>
    <NodeList />
 </TreeContext.Provider>
```


参考资料

[ECMAScript文档](https://tc39.es/ecma262)

[react-component](https://github.com/react-component)

[rc-tree](https://github.com/react-component/tree)

