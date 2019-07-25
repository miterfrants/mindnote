export class MyBoardTutorialStepsClass {
    constructor(tour) {
        return [{
            title: '展開新增筆記表單',
            text: '點擊<span class="highlight">畫面空白處</span>會彈出新增筆記的表單',
            attachTo: {
                element: '.tutorial-anchor',
                on: 'top'
            },
            buttons: [{
                text: '我自己試試就好',
                action: tour.complete
            }]
        }, {
            title: '新增筆記',
            text: `
                <ul>
                    <li>輸入筆記<span class="highlight">標題</span></li>
                    <li>輸入筆記<span class="highlight">內容</span> (使用 markdonw 語法 <a href="https://markdown.tw/" target="_blank">教學</a>)</li>
                    <li>按下<span class="highlight">新增</span>，太好了，你完成了第一份筆記，在畫面上會留下一個藍色的圓圈。</li>
                </ul>
            `,
            attachTo: {
                element: '.node-form',
                on: 'left'
            },
            buttons: [{
                text: '我自己試試就好',
                action: tour.complete
            }]
        }, {
            title: '展開修改筆記表單',
            text: `
                點擊<sapn class="highlight">藍色</span>圓圈
            `,
            attachTo: {
                element: '.tutorial-anchor',
                on: 'bottom'
            },
            buttons: [{
                text: '我自己試試就好',
                action: tour.complete
            }]
        }, {
            title: '修改筆記',
            text: `
                <ul>
                    <li>修改筆記<span class="highlight">標題</span></li>
                    <li>修改筆記<span class="highlight">內容</span> (使用 markdonw 語法 <a href="https://markdown.tw/" target="_blank">教學</a>)</li>
                    <li>按下<span class="highlight">更新</span>，就會把資料存起來囉 !</li>
                </ul>
            `,
            attachTo: {
                element: '.node-form',
                on: 'left'
            },
            buttons: [{
                text: '我自己試試就好',
                action: tour.complete
            }]
        }, {
            title: '建立連線',
            text: `
                <ul>
                    <li>
                        將滑鼠游標移到藍色圓圈的外圍 <span class="highlight">比較淺色的部分</span> 看起來就像這樣
                        <span class="psudo-circle"><span>
                    </li>
                    <li>
                        接著按下滑鼠左鍵，拖拉會有一條<span class="highlight">橘色的線</span>
                    </li>
                    <li>
                        拖到另外一個藍色的圈圈後放掉，就會看到連線建立。連線如果是
                        <span class="highlight">綠色的代表正在儲存</span>，
                        如果<span class="highlight">儲存成功會變成藍色的線</span>
                    </li>
                </ul>
            `,
            attachTo: {
                element: '.tutorial-anchor',
                on: 'top'
            },
            buttons: [{
                text: '我自己試試就好',
                action: tour.complete
            }]
        }, {
            title: '重新排列',
            text: '點擊重新排列系統會自動幫你把既有的比較做快速的排列，但每一次排列的結果不會一致，所以如果你的排列是有邏輯順序的請不要按這個按鈕。',
            attachTo: {
                element: '.btn-layout',
                on: 'left'
            },
            buttons: [{
                text: '我自己試試就好',
                action: tour.complete
            }]
        }, {
            title: '刪除資料',
            text: `
            <ul>
                <li>
                    點擊按鈕切換成
                    <span class="highlight">刪除模式</span>
                </li>
                <li>
                    選擇要刪除的筆記或是連線，如果選到要刪除的物件會呈現
                    <span class="highlight">半透明狀態</span>
                    。
                </li>
                <li>
                    接著按下橘色的按鈕
                    <span class="highlight">刪除資料</span>
                    如果要取消刪除，直接回到第一步切換成一般模式
                </li>
            </ul>
            `,
            attachTo: {
                element: '.switch-delete-mode',
                on: 'left'
            },
            buttons: [{
                text: '我自己試試就好',
                action: tour.complete
            }]
        }, {
            title: '上傳圖片 - 展開編輯筆記表單',
            text: '點擊藍色的圓圈',
            attachTo: {
                element: '.tutorial-anchor',
                on: 'top'
            },
            buttons: [{
                text: '我自己試試就好',
                action: tour.complete
            }]
        }, {
            title: '上傳圖片',
            text: `
            <ul>
                <li>
                    找一張圖片，拖拉圖片到網頁上面，
                    會出現 <span class="highlight">上傳封面</span> 和 
                    <span class="highlight">上傳圖片到筆記內容</span>
                </li>
                <li>
                    如果把圖片放在<span class="highlight">上傳封面</span>區塊原本藍色的圈圈就會被你所上傳的圖片給填滿，
                    如果把圖片放在下方<span class="highlight">上傳圖片到筆記內容</span>區塊就會在筆記內容塞入一張圖片
                </li>
            </ul>
            `,
            attachTo: {
                element: '.node-form',
                on: 'left'
            },
            buttons: [{
                text: '我自己試試就好',
                action: tour.complete
            }]
        }, {
            title: '預覽筆記內容',
            text: '連點藍色圈圈就可以預覽你剛剛看的筆記內容囉～',
            attachTo: {
                element: '.tutorial-anchor',
                on: 'top'
            },
            buttons: [{
                text: '我自己試試就好',
                action: tour.complete
            }]
        }];
    }
}