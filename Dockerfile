# shana-wiki-frontend/Dockerfile

# Node.jsのバージョン指定
FROM node:18-alpine

# 作業ディレクトリ
WORKDIR /app

# 依存関係ファイルのコピーとインストール
COPY package*.json ./
RUN npm install

# ソースコードを全てコピー
COPY . .

# 開発サーバーのポート
EXPOSE 3000

# 起動コマンド
CMD ["npm", "start"]