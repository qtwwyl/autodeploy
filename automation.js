const puppeteer = require('puppeteer');
const path = require("path");
const set = {
    path: "https://ndp.netease.com", //ndp地址
    firstName: 'security_audit',//内容服务下一级分类(应用名字)
    secondName: 'statics_security_audit_',//二级分类(集群名称)
    online: false,//是否发布线上,目前只能发布测试环境
    evn: [{ id: 1, name: "dev" }, { id: 2, name: "online" }, { id: 3, name: "test" }],
    defaultEvn: 1, //默认为测试环境
    defaultBranch: 'cross', //默认dev分支
    executablePath: path.join(__dirname, '../chrome-win32/chrome.exe'),
    isHeadless: false,
}
const pwdSet = require('./setting.js');
const { isHeadless, executablePath } = set;
const readline = require('readline');
const rlCenter = (() => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    let callBack = () => { };
    function setRlCb(cb) {
        callBack = cb;
    }
    rl.on('SIGINT', function () {
        callBack();
    });

    rl.on('close', function () {
        callBack();
    });
    return {
        setRlCb,
        rl
    }
})()
const { rl } = rlCenter;

const getArgumentsEnv = () => {
    const env = process.env.npm_config_env;
    const {
        evn,
        defaultEvn
    } = set;
    if (evn.find(e => e.name === env)) {
        return evn.find(e => e.name === env).id;
    }
    return defaultEvn;
}
const getArgumentsBranch = () => {
    const branch = process.env.npm_config_branch;
    if (branch) {
        return branch;
    }
    return set.defaultBranch;
}

//唯一标志
const accountId = '#id_corpid';
const passwordId = '#id_corppw';
const loginSubmit = '#corp .icon-user'
const loginError = '.text-error'
const contentService = '[title=内容服务]'
const saveBuildBtn = '[class*="ivu-btn ivu-btn-primary ivu-btn-long"]'
const buildStatus = '.b-name'
const cancelBuildBtn = "[class*='ivu-btn ivu-btn-ghost ivu-btn-small']"
const publishSuccess = '.m-form-u .form-row .content p'

// const getEvn = async (message, defaultData) => {
//     const inputData = await ask(message)
//     if (inputData != 1 && inputData != 2 && inputData != 3) {
//         return defaultData
//     }
//     return inputData
// }

// const getBranch = async (message, defaultData) => {
//     const inputData = await ask(message)
//     if (typeof inputData == 'string' && /[\S]+/.test(inputData)) {
//         return inputData
//     }
//     return defaultData
// }

let fb = async function () {

    try {


        const evnIndex = getArgumentsEnv();
        const environment = set.evn.find(e => e.id === evnIndex).name;
        const curBranch = getArgumentsBranch();
        console.log(`环境：${environment} 分支：${curBranch}`);
        console.log("开始构建");
        
        const browser = await puppeteer.launch(isHeadless ? {
            executablePath,
            headless: !isHeadless
        } : {});
        const page = await browser.newPage();
        isHeadless && page.setViewport({ width: 1200, height: 600 })
        await page.goto(set.path);
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    resolve(1)
                } catch (e) {
                    reject(0)
                }
            }, 3000)
        })
        var loginPhoneOrEmail = await page.$(accountId)
        await loginPhoneOrEmail.click()
        await page.type(accountId, pwdSet.name, { delay: 20 })

        var password = await page.$(passwordId)
        await password.click()
        await page.type(passwordId, pwdSet.password, { delay: 20 })

        var submit = await page.$(loginSubmit)
        await submit.click()
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    resolve(1)
                } catch (e) {
                    reject(0)
                }
            }, 3000)
        })
        try {
            const wrongPassword = await page.$eval(loginError, el => el.innerHTML)
            console.log(wrongPassword); //用户名或者密码错误
            browser.close();
            rl.close();
        } catch (e) {
            // nothing
        }
        //至此完成登录

        try {
            var close = await page.$$('.icon-del-2')
            try { await close[1].click() } catch (e) {
                // console.log(e)
                await new Promise((resolve, reject) => {
                    setTimeout(() => {
                        try {
                            resolve(1)
                        } catch (e) {
                            reject(0)
                        }
                    }, 500)
                })

                var myProduct = await page.$$('.tlt li')
                await myProduct[0].click() //点击 我的产品
            }
            var contentSer = await page.$(contentService)
            await contentSer.click() //点击 内容服务

            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(1)
                    } catch (e) {
                        reject(0)
                    }
                }, 500)
            })
            let title = '[title=' + set.firstName + ']'
            var firstFilter = await page.$(title)
            await firstFilter.click() //点击工程名称
        } catch (e) {
            /* eslint-disable */
        }

        let deployBtn = ''
        await new Promise((resolve) => {
            const findDeployBtn = setInterval(async () => {
                try {
                    deployBtn = await page.$$('.m-link-drop');
                    clearInterval(findDeployBtn)
                    resolve(1)
                } catch (e) { }
            }, 500)
        })
        await deployBtn[evnIndex - 1].hover(); //配置hover
        let builds = ''
        await new Promise((resolve) => {
            const findbuild = setInterval(async () => {
                try {
                    builds = await page.$$('[href*="build"]');
                    clearInterval(findbuild)
                    resolve(1)
                } catch (e) {
                    await deployBtn[evnIndex - 1].hover();
                }
            }, 500)
        })

        // builds = await page.$$('[href*="build"]');
        await builds[evnIndex - 1].click(); //点击 构建配置

        let branch = ''
        await new Promise((resolve) => {
            const findBranchInput = setInterval(async () => {
                try {
                    const formItem1 = await page.$$('.form-item')
                    const formItem2 = await formItem1[1].$$('.form-item')
                    branch = await formItem2[1].$('input')
                    clearInterval(findBranchInput)
                    resolve(1)
                } catch (e) { }
            }, 500)
        })
        await page.evaluate(() => {
            const formItem1 = document.querySelectorAll('.form-item')
            const formItem2 = formItem1[1].querySelectorAll('.form-item')
            formItem2[1].querySelector('input').value = ''
        });
        await branch.type(curBranch, { delay: 20 }); //输入分支名称
        const saveBuild = await page.$(saveBuildBtn);
        await saveBuild.click();

        const secondtitle = '[title=' + set.secondName + environment + ']'
        let secondFilter = ''
        await new Promise((resolve) => {
            const findEvn = setInterval(async () => {
                try {
                    secondFilter = await page.$$(secondtitle)
                    clearInterval(findEvn)
                    resolve(1)
                } catch (e) { }
            }, 500)
        })
        await secondFilter[1].click() //选择部署环境

        let lanch = ''
        await new Promise((resolve) => {
            const findLaunch = setInterval(async () => {
                try {
                    lanch = await page.$$('.item-btn .ivu-btn')
                    clearInterval(findLaunch)
                    resolve(1)
                } catch (e) { }
            }, 500)
        })
        await lanch[2].click() //一键发布

        let final = ''
        await new Promise((resolve) => {
            const findLaunchFinal = setInterval(async () => {
                try {
                    final = await page.$$(".ft [class*='ivu-btn ivu-btn-primary ivu-btn-long']")
                    clearInterval(findLaunchFinal)
                    resolve(1)
                } catch (e) { }
            }, 500)
        })
        await final[0].click() //一键发布

        let buildText = ''
        await new Promise((resolve) => {
            const findBuildStatus = setInterval(async () => {
                try {
                    buildText = await page.$eval(buildStatus, (el) => el.innerHTML)
                    clearInterval(findBuildStatus)
                    resolve(1)
                } catch (e) { }
            }, 500)
        })
        let data1 = new Date(), data2, buildFag = 0
        time = setInterval(async () => {
            try {
                buildText = await page.$eval(buildStatus, (el) => el.innerHTML)
                var check = await page.evaluate((publishSuccess) => {
                    var as1 = document.querySelector(publishSuccess).innerHTML
                    return as1
                }, publishSuccess);
                /* eslint-disable */
            } catch (e) {

            }
            data2 = new Date()
            if (buildText == '构建中' && buildFag != 1) {
                buildFag = 1
                console.log(buildText)
            }
            if (buildText == '构建失败' && buildFag != 2) {
                buildFag = 2;
                console.log(buildText)
                const cancelBuild = await page.$(cancelBuildBtn)
                await cancelBuild.click() //点击 取消构建
                console.log("取消构建")
            }
            if (buildText == '构建成功' && buildFag != 3) {
                buildFag = 3;
                console.log(buildText)
                clearInterval(time);
                setTimeout(()=>{
                    browser.close();
                    console.log('发布完成(*^▽^*)~');
                },3000)
            }
            else if (data2 - data1 > 100000) {
                browser.close();
                console.log('发布失败T T..')
            }
            rl.close();
        }, 500)

    } catch (e) {
        rl.close();
        console.log(e);
    }
}

fb()
