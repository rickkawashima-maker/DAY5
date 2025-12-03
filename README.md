# 勤怠・課題報告アプリ - セットアップガイド

## 📋 作成したファイル一覧

### フロントエンド（GitHub Pages用）
- `index.html` - メイン画面
- `style.css` - スタイルシート
- `script.js` - JavaScriptロジック
- `manifest.json` - PWAマニフェスト
- `sw.js` - Service Worker
- `icon.png` - アプリアイコン

### バックエンド（Google Apps Script用）
- `code.gs` - GASコード（スプレッドシート記録とLINE通知）

---

## 🚀 セットアップ手順

### 1. Google Spreadsheetの作成

1. 新しいGoogleスプレッドシートを作成
2. 以下の3つのシートを作成：

**シート1: 研修生マスタ**
```
研修生ID | 氏名 | ステータス
user01 | あなたの名前 | 進行中
```

**シート2: 打刻記録**
```
日付 | 研修生ID | 氏名 | 出勤時刻 | 退勤時刻 | 勤務時間
```

**シート3: 課題完了記録**
```
完了日時 | 研修生ID | 氏名 | アプリURL | 判定
```

3. スプレッドシートのURLから **スプレッドシートID** をコピー
   - URL: `https://docs.google.com/spreadsheets/d/【ここがID】/edit`

---

### 2. Google Apps Scriptのデプロイ

1. スプレッドシートで「拡張機能」→「Apps Script」を開く
2. `code.gs` の内容をすべてコピー＆ペースト
3. **6行目**の `SPREADSHEET_ID` を実際のIDに置き換え：
   ```javascript
   const SPREADSHEET_ID = 'あなたのスプレッドシートID';
   ```
4. 保存（💾アイコン）
5. 「デプロイ」→「新しいデプロイ」
   - 種類: **ウェブアプリ**
   - 次のユーザーとして実行: **自分**
   - アクセスできるユーザー: **全員**
6. 「デプロイ」をクリック
7. 発行された **ウェブアプリのURL** をコピー

---

### 3. フロントエンドの設定

1. `script.js` を開く
2. **3行目**の `GAS_WEB_APP_URL` を置き換え：
   ```javascript
   const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/.../exec';
   ```

---

### 4. GitHub Pagesへのデプロイ

```bash
git add .
git commit -m "勤怠アプリ完成"
git push origin main
```

GitHubリポジトリの設定:
1. Settings → Pages
2. Source: `main` ブランチ
3. 公開URLを確認

---

### 5. PWAとしてインストール

スマートフォンで:
1. GitHub PagesのURLにアクセス
2. ブラウザメニューから「ホーム画面に追加」
3. アプリアイコンが表示されます

---

## ✅ 動作確認

1. **出勤ボタン** をタップ
   - LINEグループに通知が届く
   - スプレッドシートの「打刻記録」に記録される

2. **退勤ボタン** をタップ
   - 勤務時間が自動計算される
   - LINEグループに通知が届く

3. **課題完了ボタン** をタップ
   - LINEグループに完了報告が届く
   - スプレッドシートの「課題完了記録」に記録される

---

## 🔧 トラブルシューティング

### LINE通知が届かない
- LINE Channel Access Tokenが正しいか確認
- GASのデプロイ設定が「全員」になっているか確認

### スプレッドシートに記録されない
- `code.gs` の `SPREADSHEET_ID` が正しいか確認
- シート名が正確か確認（「打刻記録」「課題完了記録」）
- GASを再デプロイ（コード変更後は必須）

### ボタンを押してもエラーが出る
- `script.js` の `GAS_WEB_APP_URL` が正しいか確認
- ブラウザのコンソールでエラーメッセージを確認

---

## 📱 使い方

1. アプリを開く
2. 出勤時に「出勤」ボタンをタップ
3. 退勤時に「退勤」ボタンをタップ
4. 課題完了時に「課題完了」ボタンをタップ

すべての操作が自動でLINEとスプレッドシートに記録されます！
