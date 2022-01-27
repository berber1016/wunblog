module.exports = {
    title: 'wun blog',
    description: 'wunblog/berber/胜利 博客',
    base:'/wunblog/',
    theme: 'reco',
    locales: {
        '/': {
          lang: 'zh-CN'
        }
    },
    lastUpdated: '上次更新', // string | boolean
    themeConfig: {
        nav:[
            {text:'首页',link:'/'},
            {text:'github',link:'https://github.com/berber1016'},
            {text:'掘金',link:'https://juejin.cn/user/1714893868770846'}
        ],
        subSidebar: 'auto',
        sidebar:[
            // {
            //     title: 'wun blog',
            //     path: '/',
            //     collapsable: false, // 不折叠
            // },
            {
              title: "rc-component",
              path: '/rc-component/rc-tree-1',
              collapsable: false, // 不折叠
              children: [
                { title: "rc-tree", path: "/rc-component/rc-tree-1" },
                { title: "rc-select",path: "/rc-component/rc-select" },
              ],
            }
        ]
    },
    plugins:  [
        '@vuepress/last-updated',
        {
          transformer: (timestamp, lang) => {
            // 不要忘了安装 moment
            const moment = require('moment')
            moment.locale(lang)
            return moment(timestamp).fromNow()
          }
        }
      ]
  }