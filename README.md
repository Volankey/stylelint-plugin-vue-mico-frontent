# stylelint-plugin-vue-mico-frontent
stylint-plugin检测vue项目是否有定义的全局css,影响到微前端其他服务

# Install
> npm install -S -D stylelint-nimbus-css-check

# .stylelintrc
```
{
  rules:{
     "plugin/nimbus-css-check": {
      namespace: "." + SERVICE_NAME
    },
  }
}
```
