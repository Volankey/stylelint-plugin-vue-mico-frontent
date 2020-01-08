/*
 * @Author: Volankey@gmail.com
 * @Company: Tusimple
 * @Date: 2019-10-31 16:21:44
 * @LastEditors: Jiwen.bai
 * @LastEditTime: 2019-11-01 10:25:40
 */
// Abbreviated example
var stylelint = require('stylelint')

var ruleName = 'plugin/nimbus-css-check'

const ERROR_TEXT = 'Global styles should must have a namespace'

const replaceSpace = str => {
  return str.replace(/^[\s\n]+|[\n\s]+$/g, '')
}
const startedWith = (str, substr) => {
  str = replaceSpace(str)
  return str.indexOf(substr) >= 0
}

module.exports = stylelint.createPlugin(ruleName, function(
  primaryOption,
  secondaryOptionObject,
  context
) {
  if (
    !primaryOption.namespace ||
    replaceSpace(primaryOption.namespace).length === 0
  ) {
    throw new Error('namespace can not e empty!')
  }

  const namespace = primaryOption.namespace
  const handleNode = handleNodeFn(namespace, context)

  return function(postcssRoot, postcssResult) {
    // console.log("TCL: postcssRoot", postcssRoot.__proto__.__proto__)
    let matches = null

    if (!postcssRoot.raws.beforeStart && postcssRoot.nodes.length) {
      handleNode(postcssRoot, postcssResult)
    } else {
      matches = postcssRoot.raws.beforeStart.match(/<\/?style.*>/)
    }
    // 非scoped样式
    if (matches && matches.length && !/scoped/g.test(matches[0])) {
      handleNode(postcssRoot, postcssResult)
    }
  }
})

function handleNodeFn(namespace, context) {
  return function _handleNode(root, result) {
    let hasFixed = false
    root.walkRules(rule => {
      //console.log('TCL: returnfunction_handleNode -> root', root)
      const _selector = rule.selector
      const selectors = _selector.split(',')

      selectors.forEach((selector, idx) => {
        //console.log('TCL: returnfunction_handleNode -> selector', selector)
        const preLength = idx > 0 ? selectors[idx - 1].length + 1 : 0
        // selector = replaceSpace(selector);
        // 不含有命名空间要做处理
        if (!startedWith(selector, namespace)) {
          // run lint:style --fix
          if (context.fix === true) {
            selectors[idx] = namespace + ' ' + selector
            hasFixed = true
            return
          }
          // 获取 \s\n的长度
          const spaceOrWrapMatches = selector.match(/^[\s\n]+/g) || ''
          stylelint.utils.report({
            ruleName: ruleName,
            result: result,
            node: rule,
            index: preLength + (idx === 0 ? 0 : spaceOrWrapMatches.length),
            message: ERROR_TEXT + `"${namespace}"` + ` (${ruleName})`
          })
        }
      })
      if (hasFixed) {
        rule.selector = selectors.join(',')
      }
    })
  }
}
module.exports.ruleName = ruleName
