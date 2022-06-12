module.exports = {
    title: 'wun blog',
    description: 'berber/胜利 博客',
    base: '/',
    theme: 'reco',
    head: [
        ['meta', { name: 'keywords', content: '博客 berber1016的博客' }]
    ],
    locales: {
        '/': {
            lang: 'zh-CN'
        }
    },
    themeConfig: {
        noFoundPageByTencent: false,
        nav: [
            { text: '首页', link: '/' },
            { text: 'github', link: 'https://github.com/berber1016' },
            { text: '掘金', link: 'https://juejin.cn/user/1714893868770846' }
        ],
        lastUpdated: '上次更新', // string | boolean
        subSidebar: 'auto',
        sidebar: [
            // {
            //     title: 'wun blog',
            //     path: '/',
            //     collapsable: false, // 不折叠
            // },
            {
                title: "rc-component",
                path: '/rc-component/index',
                // collapsable: false, // 不折叠
                children: [
                    { title: "rc-tree", path: "/rc-component/rc-tree-1" },
                    // { title: "rc-select", path: "/rc-component/rc-select" },
                ],
            },
            {
                title: "popper源码",
                path: '/popper/index',
                // collapsable: false, // 不折叠
                children: [
                    { title: "2.x", path: "/popper/2x" },
                    // { title: "rc-select", path: "/rc-component/rc-select" },
                ],
            },
            {
                title: '随笔',
                path: '/blog/index',
                children: [{
                    title: 'facking @ in all config',
                    path: '/blog/facking-@-in-all-config'
                }]
            },
            {
                title: "一些译文",
                path: "/translation/index",
                // collapsable: false, // 不折叠
                children: [
                    // { title: "说明", path: "/translation/index" },
                    { title: "Cookies Having Independent Partitioned State", path: "/translation/CHIPS" },
                    { title: "build your own react", path: "/translation/build-your-own-react" },
                ],
            }
        ]
    },
    externalLinks: { target: '_blank', rel: 'nofollow noopener noreferrer' },
    plugins: [
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