export class MyBoardsTutorialStepsClass {
    constructor(tour) {
        return [{
            title: '新增分類',
            text: `
                    <ul>
                        <li>點擊<span class="highlight">加號</span>，開始新增分類</li>
                        <li>輸入<span class="highlight">分類標題</span></li>
                        <li>按下<span class="highlight">新增</span>，太好了你已經完成了第一個分類。</li>
                    </ul>
                `,
            attachTo: {
                element: '.btn-virtual-add-board',
                on: 'bottom'
            },
            buttons: [{
                text: '我自己逛逛就好',
                action: tour.cancel
            }, {
                text: '下一步',
                action: tour.next
            }]
        }, {
            title: '修改分類權限',
            text: `分類權限包含
                    <span class="highlight">公開</span>、
                    <span class="highlight">隱私</span>
                    兩種狀態，當你的分類設定為公開，任何人只要有網址都能瀏覽你在這個分類底下建立的筆記，反之就只有你自己看得喔!
                `,
            attachTo: {
                element: '.board-card:not(.template) .btn-toggle-permission',
                on: 'bottom'
            },
            buttons: [{
                text: '我自己逛逛就好',
                action: tour.cancel
            }, {
                text: '下一步',
                action: tour.next
            }]
        }, {
            title: '修改分類標題',
            text: `
                <ul>
                    <li>
                        按下左下方 <span class="highlight-coral"><i class="fa fa-edit"></i></span>，切換成編輯模式
                    </li>
                    <li>
                        點擊輸入框，修改你想要改的文字。
                    </li>
                    <li>
                        按下<span class="highlight">更新</span>就完成修改標題了。
                    </li>
                </ul>
            `,
            attachTo: {
                element: '.board-card:not(.template)',
                on: 'bottom'
            },
            buttons: [{
                text: '我自己逛逛就好',
                action: tour.cancel
            }, {
                text: '下一步',
                action: tour.next
            }]
        }, {
            title: '刪除分類',
            text: `
                <ul>
                    <li>
                        按下左下方 <span class="highlight-coral"><i class="fa fa-edit"></i></span>切換成編輯模式
                    </li>
                    <li>
                        在右下方點擊 <span class="btn-delete fa fa-trash" style="
                        transform: scale(0.5);
                        border: none;
                        text-align: center;
                        vertical-align: middle;
                        line-height: 2.0em;
                        font-size: 21px;
                    "></span>
                    </li>
                    <li>
                        這時候會跳出輸入框請輸入 <span class="highlight">DELETE</span>，分類就會刪除了，為了避免誤刪所以會稍稍麻煩，但不用太擔心，系統如果發現你在短時間內做兩次刪除，就會略過這個步驟。
                    </li>
                </ul>
            `,
            attachTo: {
                element: '.board-card:not(.template)',
                on: 'bottom'
            },
            buttons: [{
                text: '我自己逛逛就好',
                action: tour.cancel
            }, {
                text: '下一步',
                action: tour.next
            }]
        }];
    }
}