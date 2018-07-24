# 说明
1. `script` 文件夹下新建 `setting.js` 文件，保存登录 ndp 的用户名和密码，内容格式如下

        module.exports = {

            name: 'xxx',

            password: 'xxx',

        }

2. `npm run launch` 执行部署脚本，默认部署 `test` 环境 `dev` 分支，也可传入环境和分支参数，例如 `npm run launch --env=dev --branch=cross` 即为部署 `dev` 环境 `cross` 分支

# 运行过程

1. 登录部署地址，自动输入用户名和密码，如用户名和密码错误则部署中止

2. 选择相应的工程、部署环境，配置部署分支

3. 一键发布，如构建失败自动点击取消构建

4. 完成发布