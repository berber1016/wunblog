#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist

git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:berber1016/wunblog.git master:gh-pages
git push -f git@101.43.181.73:/home/www/website/ts.git master
cd -

git add .
git commit -m 'update'
git push -f git@github.com:berber1016/wunblog.git master