/**
 * 1つの情報パネル（タブ＋コンテンツ＋認証）を管理するクラス
 */
class InfoPanel {
  constructor(data, switchCallback, onUnlockCallback) {
    this.id = data.id;
    this.title = data.title;
    this.expectedPassword = data.password;
    this.placeholder = data.placeholder;
    this.text = data.text;
    
    this.isUnlocked = false; // ロック解除状態
    this.switchCallback = switchCallback; // タブ切り替え時の処理
    this.onUnlockCallback = onUnlockCallback

    // DOM要素の参照を保持
    this.navBtnElement = null;
    this.sectionElement = null;
  }

  // ① 上部のタブボタンを生成するメソッド
  renderNavButton() {
    this.navBtnElement = document.createElement('button');
    this.navBtnElement.className = 'nav-btn';
    this.navBtnElement.textContent = this.title;
    
    // ボタンが押されたら、マネージャー(App)にIDを伝えて表示を切り替える
    this.navBtnElement.addEventListener('click', () => {
      this.switchCallback(this.id);
    });

    return this.navBtnElement;
  }

  // ② 下部のコンテンツ領域（入力フォーム＆情報カード）を生成するメソッド
  renderSection() {
    this.sectionElement = document.createElement('div');
    this.sectionElement.className = 'info-section';

    // HTMLテンプレートを展開
    this.sectionElement.innerHTML = `
      <!-- パスワード認証ボックス -->
      <div class="auth-box">
        <div class="guide-title">合言葉を入力してください。</div>
        <form class="pwd-form">
          <div class="pwd-wrapper">
            <div class="input-row">
              <input type="text" class="pwd-input" placeholder="${this.placeholder}" required autocomplete="off">
              <button type="submit" class="submit-btn">確認</button>
            </div>
            <div class="state-error">パスワードが違います！</div>
          </div>
        </form>
      </div>

      <!-- ロック解除後に表示される情報カード -->
      <div class="content-display">
        <div class="card-frame">
          <div class="card-header-badge">${this.title}</div>
          <div class="card-body-text">${this.text}</div>
        </div>
      </div>
    `;

    // フォームのイベントリスナー（判定処理）を設定
    const form = this.sectionElement.querySelector('.pwd-form');
    const input = this.sectionElement.querySelector('.pwd-input');
    const errorMsg = this.sectionElement.querySelector('.state-error');

    form.addEventListener('submit', (e) => {
      e.preventDefault(); // フォーム送信による画面リロードを防ぐ
      
      // パスワード判定 (大文字小文字を区別せずに判定)
      if (input.value.toLowerCase() === this.expectedPassword.toLowerCase()) {
        this.unlock();
        errorMsg.classList.remove('show');
      } else {
        errorMsg.classList.add('show');
      }
    });

    // 入力し直したらエラーメッセージを消す
    input.addEventListener('input', () => {
      errorMsg.classList.remove('show');
    });

    return this.sectionElement;
  }

  // ロックを解除するメソッド
  unlock() {
    this.isUnlocked = true;
    this.sectionElement.classList.add('unlocked');

    if (this.onUnlockCallback) {
      this.onUnlockCallback();
    }
  }

  // このタブをアクティブ(表示)または非アクティブにするメソッド
  setActive(isActive) {
    if (isActive) {
      this.navBtnElement.classList.add('active');
      this.sectionElement.classList.add('active');
    } else {
      this.navBtnElement.classList.remove('active');
      this.sectionElement.classList.remove('active');
    }
  }
}

/**
 * アプリケーション全体を管理するクラス
 */
class App {
  constructor(panelsData, containerId) {
    this.container = document.getElementById(containerId);
    this.panels = [];
    this.panelsData = panelsData;
  }

  init() {
    // ボタンをまとめるコンテナを作成
    const btnGroup = document.createElement('div');
    btnGroup.className = 'button-group';
    this.container.appendChild(btnGroup);

    // データの配列から InfoPanel オブジェクトを量産
    this.panelsData.forEach((data, index) => {
      // 変更: idが3のときだけモーダルを表示する関数を定義
      let onUnlock = null;
      if (data.id === 3) {
        onUnlock = () => this.showModal();
      }

      // 変更: 第3引数に onUnlock を渡す
      const panel = new InfoPanel(data, (id) => this.switchTab(id), onUnlock);
      this.panels.push(panel);

      // // インスタンス化 (タブ切り替えメソッドをコールバックとして渡す)
      // const panel = new InfoPanel(data, (id) => this.switchTab(id));
      // this.panels.push(panel);
      
      // ボタンとセクションをDOMに追加
      btnGroup.appendChild(panel.renderNavButton());
      this.container.appendChild(panel.renderSection());
      
      // 最初のタブだけ初期表示する
      if (index === 0) {
        panel.setActive(true);
      }
    });

    this.setupModal();
  }

  // 選択されたIDのタブだけをActiveにする
  switchTab(id) {
    this.panels.forEach(panel => {
      panel.setActive(panel.id === id);
    });
  }

  setupModal() {
    this.modal = document.getElementById('congrats-modal');
    this.closeBtn = document.getElementById('modal-close-btn');
    
    // 閉じるボタンが押されたら .show を外して非表示にする
    this.closeBtn.addEventListener('click', () => {
      this.modal.classList.remove('show');
    });
  }

  showModal() {
    this.modal.classList.add('show');
  }
}

// ==========================================
// データの定義とアプリケーションの起動
// ==========================================
const data = [
  { id: 1, title: '1つ目の情報', password: 'circle', placeholder: 'パスワードを入力...', text: 'ある方向から見ると円形をしている。' },
  { id: 2, title: '2つ目の情報', password: 'park', placeholder: '4文字の英単語を入力', text: 'ある方向から見ると四角形に見える。' },
  { id: 3, title: '3つ目の情報', password: 'star', placeholder: '4文字の英単語を入力', text: '棒状の細長い形をしている。' }
];

// 初期化実行
document.addEventListener('DOMContentLoaded', () => {
  const app = new App(data, 'app');
  app.init();
});