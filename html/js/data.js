/* tools/build_html.py が作ったファイル。直接直さず、Django 版のデータを直してから作り直す */
window.SagiSim = window.SagiSim || {};
window.SagiSim.data = {
 "scenes": {
  "phishing": {
   "number": "①",
   "title": "フィッシング",
   "scene_title": "宅配の不在通知が届いたら",
   "summary": "SMSに届いた再配達の案内。どこから荷物を確かめますか。",
   "photo": "parcel.jpg"
  },
  "fake-shop": {
   "number": "②",
   "title": "偽通販",
   "scene_title": "欲しかった靴が安くなっていたら",
   "summary": "検索で見つけたスニーカー。注文する前に、店の情報を確認します。",
   "photo": "sneaker-red.jpg"
  },
  "support-scam": {
   "number": "③",
   "title": "サポート詐欺",
   "scene_title": "レシピを見ていて警告が出たら",
   "summary": "料理の記事を読んでいると、突然パソコンに警告が表示されます。",
   "photo": "teriyaki.jpg"
  }
 },
 "questions": [
  {
   "id": "q1",
   "text": "宅配業者を名乗るSMSに「お荷物をお届けにあがりましたが不在のため持ち帰りました」とリンクが付いていました。いちばん安全な行動はどれですか。",
   "explanation": "SMSやメールのリンクは押さず、公式アプリやブックマークなど、自分で調べた入口から確かめます。",
   "choices": [
    {
     "id": "q1c0",
     "text": "SMSのリンクを開いて、再配達を申し込む",
     "correct": false
    },
    {
     "id": "q1c1",
     "text": "宅配業者の公式アプリや、前に登録したブックマークから荷物を確かめる",
     "correct": true
    },
    {
     "id": "q1c2",
     "text": "SMSに返信して、本物かどうか聞く",
     "correct": false
    },
    {
     "id": "q1c3",
     "text": "SMSに書かれた電話番号に電話する",
     "correct": false
    }
   ]
  },
  {
   "id": "q2",
   "text": "「https://hashire-unyu.redelivery-info.example/login」というアドレスで、サイトの持ち主を表す部分（登録ドメイン）はどれですか。",
   "explanation": "登録ドメインは、いちばん右の「.example」とその左の1つです。前に「hashire-unyu.」が付いていても、持ち主は別の人です。",
   "choices": [
    {
     "id": "q2c0",
     "text": "hashire-unyu",
     "correct": false
    },
    {
     "id": "q2c1",
     "text": "redelivery-info.example",
     "correct": true
    },
    {
     "id": "q2c2",
     "text": "login",
     "correct": false
    },
    {
     "id": "q2c3",
     "text": "https",
     "correct": false
    }
   ]
  },
  {
   "id": "q3",
   "text": "再配達の手続きの画面で、手数料のためにカード番号とセキュリティコードの入力を求められました。正しい考え方はどれですか。",
   "explanation": "宅配業者は再配達に手数料を取らず、SMSから支払いを求めることもありません。ロゴは簡単にまねできます。",
   "choices": [
    {
     "id": "q3c0",
     "text": "少しの金額なので入力してよい",
     "correct": false
    },
    {
     "id": "q3c1",
     "text": "宅配業者は再配達でカードの情報を求めないので、入力しない",
     "correct": true
    },
    {
     "id": "q3c2",
     "text": "セキュリティコードだけなら入力してよい",
     "correct": false
    },
    {
     "id": "q3c3",
     "text": "画面に会社のロゴがあれば入力してよい",
     "correct": false
    }
   ]
  },
  {
   "id": "q4",
   "text": "偽のサイトにカード番号を入力してしまいました。まずすることはどれですか。",
   "explanation": "すぐにカード会社に連絡して、カードを止めてもらいます。連絡先は、カードの裏や公式アプリで確かめます。",
   "choices": [
    {
     "id": "q4c0",
     "text": "SMSを消して、忘れる",
     "correct": false
    },
    {
     "id": "q4c1",
     "text": "カードの裏の電話番号からカード会社に連絡し、カードを止めてもらう",
     "correct": true
    },
    {
     "id": "q4c2",
     "text": "偽のサイトの問い合わせ先に連絡する",
     "correct": false
    },
    {
     "id": "q4c3",
     "text": "請求が来るまで様子を見る",
     "correct": false
    }
   ]
  },
  {
   "id": "q5",
   "text": "ネット通販のサイトで、とくに注意したほうがよい組み合わせはどれですか。",
   "explanation": "極端に安い値段、前払いの銀行振込だけ、会社の情報がない、は偽の通販サイトによくある特徴です。",
   "choices": [
    {
     "id": "q5c0",
     "text": "値段が極端に安い・支払いが銀行振込だけ・会社の住所や電話番号がない",
     "correct": true
    },
    {
     "id": "q5c1",
     "text": "送料が無料・ポイントがたまる・レビューがある",
     "correct": false
    },
    {
     "id": "q5c2",
     "text": "クレジットカードが使える・電話番号がのっている・返品ができる",
     "correct": false
    },
    {
     "id": "q5c3",
     "text": "会員登録ができる・メールマガジンがある・セールがある",
     "correct": false
    }
   ]
  },
  {
   "id": "q6",
   "text": "通販サイトの「特定商取引法に基づく表記」で確かめるとよいことはどれですか。",
   "explanation": "住所が番地まであるか、電話番号があるか、会社のメールアドレスか、支払い方法は何か、を確かめます。",
   "choices": [
    {
     "id": "q6c0",
     "text": "商品の色の数",
     "correct": false
    },
    {
     "id": "q6c1",
     "text": "住所・電話番号・メールアドレス・支払い方法",
     "correct": true
    },
    {
     "id": "q6c2",
     "text": "セールの残り時間",
     "correct": false
    },
    {
     "id": "q6c3",
     "text": "サイトの写真の数",
     "correct": false
    }
   ]
  },
  {
   "id": "q7",
   "text": "注文したあと、振込先の口座の名前が店の名前ではなく、個人の名前でした。どうしますか。",
   "explanation": "個人の名前の口座への振込は、偽の通販サイトでよくある手口です。振り込むと取り戻すのは難しくなります。",
   "choices": [
    {
     "id": "q7c0",
     "text": "急いでいるので、すぐに振り込む",
     "correct": false
    },
    {
     "id": "q7c1",
     "text": "振り込まずに、店の名前で評判を検索したり、家族や消費生活センターに相談したりする",
     "correct": true
    },
    {
     "id": "q7c2",
     "text": "半分だけ振り込む",
     "correct": false
    },
    {
     "id": "q7c3",
     "text": "ATMで現金で振り込めば安全なので、そうする",
     "correct": false
    }
   ]
  },
  {
   "id": "q8",
   "text": "パソコンで、突然「ウイルスに感染しました。今すぐお電話ください」という全画面の警告が出て、警告音が鳴り続けています。どうしますか。",
   "explanation": "ブラウザに電話番号を出して電話させる警告は、サポート詐欺です。閉じられないときは、パソコンを再起動します。",
   "choices": [
    {
     "id": "q8c0",
     "text": "画面に出ている番号に、すぐに電話する",
     "correct": false
    },
    {
     "id": "q8c1",
     "text": "電話はせず、Escキーを長押しして全画面を終わらせ、ブラウザやタブを閉じる",
     "correct": true
    },
    {
     "id": "q8c2",
     "text": "画面の指示どおりに、アプリをダウンロードする",
     "correct": false
    },
    {
     "id": "q8c3",
     "text": "パソコンの電源を入れたまま、そのままにしておく",
     "correct": false
    }
   ]
  },
  {
   "id": "q9",
   "text": "電話の相手に「遠隔操作のアプリを入れてください」「修理代はコンビニで電子マネーを買って、番号を読み上げてください」と言われました。どうしますか。",
   "explanation": "知らない人にパソコンを操作させたり、電子マネーの番号を伝えたりしてはいけません。迷ったら電話を切って相談します。",
   "choices": [
    {
     "id": "q9c0",
     "text": "相手は専門家なので、言われたとおりにする",
     "correct": false
    },
    {
     "id": "q9c1",
     "text": "電話を切る（電子マネーの番号を伝えさせるのは、詐欺の決まった手口）",
     "correct": true
    },
    {
     "id": "q9c2",
     "text": "電子マネーを半分だけ買う",
     "correct": false
    },
    {
     "id": "q9c3",
     "text": "家族に相談せず、自分だけで対応する",
     "correct": false
    }
   ]
  },
  {
   "id": "q10",
   "text": "お金のトラブルにあったとき、近くの消費生活センターなどにつながる電話番号はどれですか。",
   "explanation": "消費者ホットラインは188です。警察に相談したいとき（緊急でないとき）は、警察相談専用電話の#9110を使います。",
   "choices": [
    {
     "id": "q10c0",
     "text": "110",
     "correct": false
    },
    {
     "id": "q10c1",
     "text": "119",
     "correct": false
    },
    {
     "id": "q10c2",
     "text": "188",
     "correct": true
    },
    {
     "id": "q10c3",
     "text": "177",
     "correct": false
    }
   ]
  }
 ]
};
