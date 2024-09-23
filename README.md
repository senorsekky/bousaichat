# BousaiAppのREADME

## artifact registryへのpush方法

### ローカル イメージにタグ付け
 `docker tag {image ID} asia-northeast1-docker.pkg.dev/api-project-241134420732/bousaichatbot/bousaichatbot `

作業用  
 `docker tag a17c58e29890 asia-northeast1-docker.pkg.dev/api-project-241134420732/bousaichatbot/bousaichatbot `

### リポジトリにpush
 `docker push asia-northeast1-docker.pkg.dev/api-project-241134420732/bousaichatbot/bousaichatbot `


## ローカル実行方法
  `npm i`で各種ライブラリをimport  
  `npm run dev`でローカル起動（デフォルトはhttp://localhost:3000/）　　

  ※コンテナ化しているので、適宜dockerを使用して起動するでも可# bousaichat
