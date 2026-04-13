import * as fs from 'fs';
import * as path from 'path';

interface FigureItem {
  nameJa: string;
  nameKo: string;
  nameEn: string;
  imageUrl: string;
  date: string;
  time: string;
  sourceUrl: string;
}

// ============================================================
// MASTER DICTIONARY: [Japanese, Korean, English]
// Sorted by length descending within each group to avoid partial matches.
// Applied in a single pass per group.
// ============================================================

const dictionary: [string, string, string][] = [
  // === EXTREMELY LONG / SPECIFIC PHRASES (must match first) ===
  ['冷却プレート搭載マルチハンディファン', '냉각 플레이트 탑재 멀티 핸디 선풍기', 'Multi Handy Fan with Cooling Plate'],
  ['ノイズキャンセリングヘッドホン', '노이즈 캔슬링 헤드폰', 'Noise Cancelling Headphone'],
  ['キャスター付きラウンド3段ワゴン', '캐스터 라운드 3단 왜건', 'Round 3-tier Wagon with Casters'],
  ['真空ステンレスペアタンブラー', '진공 스테인리스 페어 텀블러', 'Vacuum Stainless Pair Tumbler'],
  ['カラフルステンレスタンブラー', '컬러풀 스테인리스 텀블러', 'Colorful Stainless Tumbler'],
  ['取っ手付きステンレスボトル', '손잡이 스테인리스 보틀', 'Stainless Bottle with Handle'],
  ['ボールチェーン付きぬいぐるみ', '볼체인 인형', 'Ball Chain Plush'],
  ['飛び出すセリフ付きクッション', '말풍선 쿠션', 'Pop-up Line Cushion'],
  ['壁掛けオブジェ風ぬいぐるみ', '벽걸이 오브제 인형', 'Wall Hanging Object Plush'],
  ['危機一髪ぬいぐるみバッグ', '위기일발 인형 백', 'Crisis Plush Bag'],
  ['ぷにきゅきゅ窓付き収納ボックス', '푸니큐큐 창문 수납 박스', 'Punikyukyu Window Storage Box'],
  ['トゥインクル★ユニバースドール', '트윙클★유니버스 돌', 'Twinkle Universe Doll'],
  ['ピンキーリボンドールGJ', '핑키 리본 돌 GJ', 'Pinky Ribbon Doll GJ'],
  ['ピンキーリボンドール', '핑키 리본 돌', 'Pinky Ribbon Doll'],
  ['エレガントリボンガジェットケース', '엘레건트 리본 가제트 케이스', 'Elegant Ribbon Gadget Case'],
  ['センサーライトフィギュア', '센서 라이트 피규어', 'Sensor Light Figure'],
  ['メガワールドコレクタブルフィギュア', '메가 월드 콜렉터블 피규어', 'Mega World Collectable Figure'],
  ['馬服コスチュームぬいぐるみ', '말복 코스튬 인형', 'Horse Costume Plush'],
  ['ぬーどるストッパーフィギュア', '누들 스토퍼 피규어', 'Noodle Stopper Figure'],
  ['キャンバスボードコレクション', '캔버스 보드 컬렉션', 'Canvas Board Collection'],
  ['スーパーラージぬいぐるみ おすわりポーズ', '슈퍼 라지 인형 앉은 포즈', 'Super Large Plush Sitting Pose'],
  ['フェイスティッシュボックスカバー', '페이스 티슈 박스 커버', 'Face Tissue Box Cover'],
  ['ビッグ木製ラップトップテーブル', '빅 목제 랩탑 테이블', 'Big Wooden Laptop Table'],
  ['アイスキャンディモチーフクッション', '아이스 캔디 모티프 쿠션', 'Ice Candy Motif Cushion'],
  ['めちゃもふぐっと カラーセレクションぬいぐるみ', '메챠모후 컬러 셀렉션 인형', 'Mecha Mofu Color Selection Plush'],
  ['もふぐっと しっぽみてみて！ぬいぐるみ', '모후 꼬리봐봐! 인형', 'Mofu Look at My Tail! Plush'],
  ['めちゃもふぐっとぬいぐるみ', '메챠모후 인형', 'Mecha Mofu Plush'],
  ['おおきなもこもこぬいぐるみ', '큰 모코모코 인형', 'Big Mokomoko Plush'],
  ['もこもこぬいぐるみ', '모코모코 인형', 'Mokomoko Plush'],
  ['クリアポフィ ぬいぐるみ', '클리어포피 인형', 'Clear Pofi Plush'],

  // === SERIES / FRANCHISE (long to short) ===
  ['お隣の天使様にいつの間にか駄目人間にされていた件', '이웃집 천사님', 'The Angel Next Door Spoils Me Rotten'],
  ['プロジェクトセカイ カラフルステージ！ feat. 初音ミク', '프로젝트 세카이 컬러풀 스테이지! feat. 하츠네 미쿠', 'Project Sekai Colorful Stage! feat. Hatsune Miku'],
  ['無職転生II ～異世界行ったら本気だす～', '무직전생 II ~이세계에 가면 진심이다~', 'Mushoku Tensei II'],
  ['僕のヒーローアカデミア', '나의 히어로 아카데미아', 'My Hero Academia'],
  ['転生したらスライムだった件', '전생슬라임', 'That Time I Got Reincarnated as a Slime'],
  ['その着せ替え人形は恋をする', '그 비스크 돌은 사랑을 한다', 'My Dress-Up Darling'],
  ['ウマ娘 プリティーダービー', '우마무스메 프리티 더비', 'Uma Musume Pretty Derby'],
  ['魔入りました！入間くん', '마입했습니다! 이루마 군', 'Welcome to Demon School! Iruma-kun'],
  ['学園アイドルマスター', '학원 아이돌마스터', 'Gakuen Idolmaster'],
  ['Netflixシリーズ「ONE PIECE」', "Netflix 시리즈 'ONE PIECE'", 'Netflix Series "ONE PIECE"'],
  ['デジモンアドベンチャー', '디지몬 어드벤처', 'Digimon Adventure'],
  ['ジョジョの奇妙な冒険', '죠죠의 기묘한 모험', "JoJo's Bizarre Adventure"],
  ['サンリオキャラクターズ', '산리오 캐릭터즈', 'Sanrio Characters'],
  ['横浜DeNAベイスターズ', '요코하마 DeNA 베이스타즈', 'Yokohama DeNA BayStars'],
  ['勝利の女神：NIKKE', '승리의 여신: 니케', 'GODDESS OF VICTORY: NIKKE'],
  ['ディズニープリンセス', '디즈니 프린세스', 'Disney Princess'],
  ['ディズニーキャラクター', '디즈니 캐릭터', 'Disney Characters'],
  ['ドムドムハンバーガー', '돔돔 햄버거', 'Dom Dom Hamburger'],
  ['サラブレッドコレクション', '서러브레드 컬렉션', 'Thoroughbred Collection'],
  ['ジュースボックスボーイ', '쥬스박스보이', 'Juice Box Boy'],
  ['ポケットモンスター', '포켓몬스터', 'Pokemon'],
  ['塔の上のラプンツェル', '라푼젤', 'Tangled'],
  ['名探偵プリキュア！', '명탐정 프리큐어!', 'Detective PreCure!'],
  ['ドラゴンクエスト', '드래곤 퀘스트', 'Dragon Quest'],
  ['ドラゴンボール超', '드래곤볼 슈퍼', 'Dragon Ball Super'],
  ['ドラゴンボールZ', '드래곤볼 Z', 'Dragon Ball Z'],
  ['ドラゴンボール', '드래곤볼', 'Dragon Ball'],
  ['おぱんちゅうさぎ', '오팡츄우사기', 'Opanchu Usagi'],
  ['ブルーアーカイブ', '블루 아카이브', 'Blue Archive'],
  ['パラッパラッパー', '파라파 더 래퍼', 'PaRappa the Rapper'],
  ['セサミストリート', '세서미 스트리트', 'Sesame Street'],
  ['トイ・ストーリー', '토이 스토리', 'Toy Story'],
  ['パウ・パトロール', '퍼피 구조대', 'PAW Patrol'],
  ['スポンジ・ボブ', '스폰지밥', 'SpongeBob'],
  ['パペットスンスン', '퍼핏순순', 'Puppet Sunsun'],
  ['お文具といっしょ', '오분구와 함께', 'Obungu to Issho'],
  ['モンスターハンター', '몬스터 헌터', 'Monster Hunter'],
  ['ひつじのショーン', '숀 더 쉽', 'Shaun the Sheep'],
  ['おさるのジョージ', '호기심 많은 조지', 'Curious George'],
  ['すみっコぐらし', '스밋코구라시', 'Sumikko Gurashi'],
  ['トムとジェリー', '톰과 제리', 'Tom and Jerry'],
  ['【Aチップ】', '【A 칩】', '【A Chip】'],
  ['【Bデール】', '【B 데일】', '【B Dale】'],
  ['チップ＆デール', '칩&데일', 'Chip & Dale'],
  ['チップ&デール', '칩&데일', 'Chip & Dale'],
  ['デール', '데일', 'Dale'],
  ['チップ', '칩', 'Chip'],
  ['忍たま乱太郎', '닌타마 란타로', 'Nintama Rantaro'],
  ['コウペンちゃん', '코우펜짱', 'Koupen-chan'],
  ['だんでらいおん', '단데라이온', 'Dandelion'],
  ['スーパーマリオ', '슈퍼 마리오', 'Super Mario'],
  ['チェンソーマン', '체인소맨', 'Chainsaw Man'],
  ['チロルチョコ', '치로루 초코', 'Tirol Choco'],
  ['ホラグチカヨ', '호라구치 카요', 'Horaguchi Kayo'],
  ['五等分の花嫁∬', '오등분의 신부∬', 'The Quintessential Quintuplets∬'],
  ['五等分の花嫁', '오등분의 신부', 'The Quintessential Quintuplets'],
  ['「青春ブタ野郎」シリーズ', '「청춘 돼지」 시리즈', 'Rascal Does Not Dream Series'],
  ['青春ブタ野郎', '청춘 돼지', 'Rascal Does Not Dream'],
  ['名探偵コナン', '명탐정 코난', 'Detective Conan'],
  ['テレタビーズ', '텔레토비', 'Teletubbies'],
  ['アークナイツ', '명일방주', 'Arknights'],
  ['夏目友人帳', '나츠메 우인장', "Natsume's Book of Friends"],
  ['東方Project', '동방 프로젝트', 'Touhou Project'],
  ['ハローキティ', '헬로키티', 'Hello Kitty'],
  ['ハイキュー!!', '하이큐!!', 'Haikyu!!'],
  ['リラックマ', '리락쿠마', 'Rilakkuma'],
  ['ブルーロック', '블루록', 'Blue Lock'],
  ['こびとづかん', '난쟁이도감', 'Kobito Zukan'],
  ['太鼓の達人', '태고의 달인', 'Taiko no Tatsujin'],
  ['ビッグカツ', '빅 카츠', 'Big Katsu'],
  ['氷の城壁', '얼음의 성벽', 'The Ice Castle Wall'],
  ['星のカービィ', '별의 커비', 'Kirby'],
  ['ベイマックス', '베이맥스', 'Big Hero 6'],
  ['初音ミク', '하츠네 미쿠', 'Hatsune Miku'],
  ['ワンピース', '원피스', 'One Piece'],
  ['ドラえもん', '도라에몽', 'Doraemon'],
  ['モンチッチ', '몬치치', 'Monchhichi'],
  ['ダンバイン', '던바인', 'Dunbine'],
  ['呪術廻戦', '주술회전', 'Jujutsu Kaisen'],
  ['鬼滅の刃', '귀멸의 칼날', 'Demon Slayer'],
  ['チムたん', '치무탄', 'Chimutan'],
  ['パディントン', '패딩턴', 'Paddington'],
  ['ミッフィー', '미피', 'Miffy'],
  ['ちいかわ', '치이카와', 'Chiikawa'],
  ['ズートピア', '주토피아', 'Zootopia'],
  ['ムーミン', '무민', 'Moomin'],
  ['mofusand', '모푸샌드', 'mofusand'],
  ['HUNTER×HUNTER', '헌터×헌터', 'HUNTER×HUNTER'],
  ['SAKAMOTO DAYS', '사카모토 데이즈', 'SAKAMOTO DAYS'],
  ['NEEDY GIRL OVERDOSE', 'NEEDY GIRL OVERDOSE', 'NEEDY GIRL OVERDOSE'],
  ['Among Us', 'Among Us', 'Among Us'],
  ['SNOOPY', '스누피', 'SNOOPY'],
  ['SHUYA', 'SHUYA', 'SHUYA'],
  ['18TRIP', '18TRIP', '18TRIP'],
  ['SI-VIS', 'SI-VIS', 'SI-VIS'],
  ['FANS', 'FANS', 'FANS'],
  ['Blendy', 'Blendy', 'Blendy'],
  ['Re:ゼロ', '리제로', 'Re:Zero'],
  ['アイカツ!', '아이카츠!', 'Aikatsu!'],

  // === LONG CHARACTER NAMES (before shorter ones) ===
  ['ミス・バッキンガム・ステューシー', '미스 버킹엄 스튜시', 'Miss Buckingham Stussy'],
  ['トニートニー・チョッパー', '토니토니 쵸파', 'Tony Tony Chopper'],
  ['エドワード・ニューゲート', '에드워드 뉴게이트', 'Edward Newgate'],
  ['モンキー・D・ルフィ', '몽키 D 루피', 'Monkey D. Luffy'],
  ['シャーロット・カタクリ', '샤를로트 카타쿠리', 'Charlotte Katakuri'],
  ['ロキシー・ミグルディア', '록시 미그루디아', 'Roxy Migurdia'],
  ['ナベリウス・カルエゴ', '나베리우스 카르에고', 'Naberius Kalego'],
  ['イクス・エリザベッタ', '이크스 엘리자베타', 'Ix Elizabetta'],
  ['ティンカー・ベル', '팅커벨', 'Tinker Bell'],
  ['ティンキー・ウィンキー', '팅키윙키', 'Tinky Winky'],
  ['超絶最かわてんしちゃん', '초절최귀 천사짱', 'Super Cutest Angel-chan'],
  ['超サイヤ人ベジット', '초사이어인 베지토', 'Super Saiyan Vegito'],
  ['マシュマロみたいなふわふわにゃんこ', '마시마로 같은 폭신폭신 냥코', 'Marshmallow-like Fluffy Nyanko'],
  ['アグレッシブ烈子', '어그레시브 레츠코', 'Aggretsuko'],
  ['マイスウィートピアノ', '마이스위트피아노', 'My Sweet Piano'],
  ['コロコロクリリン', '코로코로 크리린', 'Corocorokuririn'],
  ['チャーミーキティ', '차미키티', 'Charmmy Kitty'],
  ['けろけろけろっぴ', '케로케로케롯피', 'Keroppi'],
  ['ポムポムプリン', '폼폼푸린', 'Pompompurin'],
  ['タキシードサム', '턱시도 샘', 'Tuxedo Sam'],
  ['シナモロール', '시나모롤', 'Cinnamoroll'],
  ['マイメロディ', '마이멜로디', 'My Melody'],
  ['バッドばつ丸', '배드바츠마루', 'Badtz-Maru'],
  ['ハンギョドン', '한교동', 'Hangyodon'],
  ['プルソン・ソイ', '프루손 소이', 'Purson Soi'],
  ['ゴクウブラック', '고쿠 블랙', 'Goku Black'],
  ['ネオユニヴァース', '네오 유니버스', 'Neo Universe'],
  ['シュヴァルグラン', '슈발그란', 'Cheval Grand'],
  ['ヴィルシーナ', '비르시나', 'Verxina'],
  ['ナルガクルガ', '나르가쿠루가', 'Nargacuga'],
  ['喜多川海夢', '키타가와 마린', 'Kitagawa Marin'],
  ['チョッパーのリュック', '쵸파의 백팩', "Chopper's Backpack"],

  // Sanrio - lesser known (romanized)
  ['ぺたぺたみにりあん', '페타페타미니리안', 'Petapetaminiryan'],
  ['ウィアーダイナソアーズ！', '위아다이노소아즈!', 'We Are Dinosaurs!'],
  ['ニャニィニュニェニョン', '냐니뉴녜뇽', 'Nyani Nyu Nye Nyon'],
  ['ウィッシュミーメル', '위시미멜', 'Wish Me Mell'],
  ['リトルフォレストフェロォ', '리틀포레스트펠로', 'Little Forest Fellow'],
  ['ミュークルドリーミー', '뮤클드리미', 'Mewkle Dreamy'],
  ['パタパタペッピー', '파타파타펫피', 'Patapata Peppy'],
  ['ウィンキーピンキー', '윙키핑키', 'Winky Pinky'],
  ['アドローザトルマリィ', '아드로자토르마리', 'Adoroza Tolmary'],
  ['まるもふびより', '마루모후비요리', 'Marumofubiyori'],
  ['みんなのたあ坊', '민나노타보', 'Minna no Tabo'],
  ['シュガーバニーズ', '슈가바니즈', 'Sugar Bunnies'],
  ['ルロロマニック', '루로로마닉', 'Ruroro Manic'],
  ['チアリーチャム', '치어리참', 'Cheery Chum'],
  ['あひるのペックル', '아히루노 펙클', 'Pekkle'],
  ['ゴロピカドン', '고로피카동', 'Goropikadon'],
  ['おさるのもんきち', '오사루노몽키치', 'Monkichi'],
  ['マロンクリーム', '마롱크림', 'Marron Cream'],
  ['はなまるおばけ', '하나마루오바케', 'Hanamaru Obake'],
  ['ディアダニエル', '디어다니엘', 'Dear Daniel'],
  ['ぼんぼんりぼん', '봉봉리본', 'Bonbonribon'],
  ['いちごの王さま', '딸기의 왕님', 'Ichigo no Osama'],
  ['かしわんこもち', '카시완코모치', 'Kashiwankomochi'],
  ['ぽこぽん日記', '포코폰 일기', 'Pokopon Nikki'],
  ['がおぱわるぅ', '가오파와루', 'Gaopawaruu'],
  ['ぽっきょくてん', '폿큐쿠텐', 'Pokkyokuten'],
  ['ザ ラナバウツ', '더 라나바우츠', 'The Runabouts'],
  ['メローチューン', '멜로튠', 'Mellow Tune'],
  ['タイニーチャム', '타이니참', 'Tiny Chum'],
  ['てのりくま', '테노리쿠마', 'Tenorikuma'],
  ['こぎみゅん', '코기뮨', 'Kogimyun'],
  ['パウピポ', '파우피포', 'Paupipo'],
  ['歯ぐるまんすたいる', '하구루만스타일', 'Haguruman Style'],
  ['KIRIMIちゃん.', '키리미짱.', 'KIRIMIchan.'],
  // Sanrio sub-character names (in parentheses)
  ['しろうさ', '시로우사', 'Shirousa'],
  ['くろうさ', '쿠로우사', 'Kurousa'],
  ['ぱんくんち', '판쿤치', 'Pankunchi'],
  ['ぱんくん', '판쿤', 'Pankun'],
  ['なおみ', '나오미', 'Naomi'],
  ['るるる学園', '루루루학원', 'Rururu Gakuen'],
  ['パティ', '파티', 'Patty'],
  ['ジミー', '지미', 'Jimmy'],
  ['ザシキブタ', '자시키부타', 'Zashikibuta'],
  ['プワワ', '푸와와', 'Puwawa'],
  ['Yoshikitty', 'Yoshikitty', 'Yoshikitty'],

  // Detective Conan characters (longer first)
  ['江戸川コナン', '에도가와 코난', 'Edogawa Conan'],
  ['萩原千速', '하기와라 치하야', 'Hagiwara Chihaya'],
  ['萩原研二', '하기와라 켄지', 'Hagiwara Kenji'],
  ['松田陣平', '마츠다 진페이', 'Matsuda Jinpei'],
  ['横溝重悟', '요코미조 주고', 'Yokomizo Jugo'],
  ['世良真純', '세라 마스미', 'Sera Masumi'],
  ['怪盗キッド', '괴도 키드', 'Phantom Thief Kid'],
  ['毛利蘭', '모리 란', 'Mouri Ran'],
  // Short names used in quoted strings
  ['コナン', '코난', 'Conan'],
  ['千速', '치하야', 'Chihaya'],
  ['世良', '세라', 'Sera'],
  ['松田', '마츠다', 'Matsuda'],
  ['萩原', '하기와라', 'Hagiwara'],

  // Project Sekai characters
  ['誰もいないセカイの巡音ルカ', '아무도 없는 세카이의 메구리네 루카', "Nobody's SEKAI's Megurine Luka"],
  ['宵崎奏', '요이자키 카나데', 'Yoisaki Kanade'],
  ['朝比奈まふゆ', '아사히나 마후유', 'Asahina Mafuyu'],
  ['東雲絵名', '시노노메 에나', 'Shinonome Ena'],
  ['暁山瑞希', '아키야마 미즈키', 'Akiyama Mizuki'],
  ['巡音ルカ', '메구리네 루카', 'Megurine Luka'],

  // Idolmaster characters
  ['花海咲季', '하나미 사키', 'Hanami Saki'],
  ['月村手毬', '츠키무라 테마리', 'Tsukimura Temari'],
  ['藤田ことね', '후지타 코토네', 'Fujita Kotone'],
  ['有村麻央', '아리무라 마오', 'Arimura Mao'],
  ['葛城リーリヤ', '카츠라기 리리야', 'Katsuragi Lilja'],
  ['倉本千奈', '쿠라모토 치나', 'Kuramoto China'],

  // Haikyu characters
  ['孤爪研磨', '코즈메 켄마', 'Kozume Kenma'],
  ['黒尾鉄朗', '쿠로오 테츠로', 'Kuroo Tetsuro'],
  ['月島蛍', '츠키시마 케이', 'Tsukishima Kei'],

  // Nintama characters
  ['尾浜勘右衛門', '오하마 간에몬', 'Ohama Kanemon'],
  ['斉藤タカ丸', '사이토 타카마루', 'Saito Takamaru'],
  ['黒木庄左エ門', '쿠로키 쇼자에몬', 'Kuroki Shozaemon'],
  ['神崎左門', '칸자키 사몬', 'Kanzaki Samon'],

  // Touhou characters
  ['十六夜咲夜', '이자요이 사쿠야', 'Izayoi Sakuya'],
  ['チルノ', '치르노', 'Cirno'],

  // Ice Castle Wall characters
  ['氷川小雪', '히카와 코유키', 'Hikawa Koyuki'],
  ['雨宮湊', '아메미야 미나토', 'Amemiya Minato'],
  ['安曇美姫', '아즈미 미키', 'Azumi Miki'],
  ['日野陽太', '히노 요타', 'Hino Yota'],

  // Dandelion characters
  ['丹波鉄男', '탄바 테츠오', 'Tanba Tetsuo'],
  ['黒鉄美咲', '쿠로가네 미사키', 'Kurogane Misaki'],
  ['京河正樹', '쿄가 마사키', 'Kyouga Masaki'],
  ['ミニプロト', '미니프로토', 'Mini Proto'],

  // Quintuplets / Aobuta
  ['中野五月', '나카노 이츠키', 'Nakano Itsuki'],
  ['桜島麻衣', '사쿠라지마 마이', 'Sakurajima Mai'],
  ['椎名真昼', '시이나 마히루', 'Shiina Mahiru'],

  // Naruto
  ['うずまきナルト', '우즈마키 나루토', 'Uzumaki Naruto'],
  ['はたけカカシ', '하타케 카카시', 'Hatake Kakashi'],

  // MHA animal characters
  ['ショートキャット', '쇼트캣', 'Short Cat'],
  ['オチャネコ', '오차네코', 'Ochako Cat'],
  ['デクシープ', '데쿠십', 'Deku Sheep'],
  ['バクドッグ', '바쿠독', 'Bakugo Dog'],

  // Pokemon (longer first)
  ['マスカーニャ', '마스카나', 'Meowscarada'],
  ['ラウドボーン', '라우드본', 'Skeledirge'],
  ['ウェーニバル', '웨니발', 'Quaquaval'],
  ['ソウブレイズ', '소울브레이즈', 'Ceruledge'],
  ['グレンアルマ', '그레나르마', 'Armarouge'],
  ['デカヌチャン', '데카뉴찬', 'Tinkaton'],
  ['メタグロス', '메타그로스', 'Metagross'],
  ['ヒノアラシ', '브케인', 'Cyndaquil'],
  ['ミズゴロウ', '물짱이', 'Mudkip'],
  ['ライチュウ', '라이츄', 'Raichu'],
  ['ラティアス', '라티아스', 'Latias'],
  ['ラティオス', '라티오스', 'Latios'],
  ['ピカチュウ', '피카츄', 'Pikachu'],
  ['ジラーチ', '지라치', 'Jirachi'],
  ['カビゴン', '잠만보', 'Snorlax'],
  ['ハッサム', '핫삼', 'Scizor'],
  ['プラスル', '플러시', 'Plusle'],
  ['マイナン', '마이농', 'Minun'],
  ['フォッコ', '푸호꼬', 'Fennekin'],
  ['アチャモ', '아차모', 'Torchic'],
  ['キモリ', '나무지기', 'Treecko'],
  ['マナフィ', '마나피', 'Manaphy'],
  ['ピッピ', '삐삐', 'Clefairy'],
  ['プリン', '푸린', 'Jigglypuff'],
  ['ミュウ', '뮤', 'Mew'],

  // Words containing アル that must be matched BEFORE アル
  ['ビジュアルデザイン', '비주얼 디자인', 'Visual Design'],
  ['ビジュアル', '비주얼', 'Visual'],
  ['メタル', '메탈', 'Metal'],

  // Blue Archive characters
  ['シロコ', '시로코', 'Shiroko'],
  ['ファウスト', '파우스트', 'Faust'],
  ['ムツキ', '무츠키', 'Mutsuki'],
  ['カヨコ', '카요코', 'Kayoko'],
  ['ハルカ', '하루카', 'Haruka'],
  ['アロナ', '아로나', 'Arona'],
  ['プラナ', '프라나', 'Plana'],
  ['チナツ', '치나츠', 'Chinatsu'],
  ['ヒナ', '히나', 'Hina'],
  ['アコ', '아코', 'Ako'],
  ['イオリ', '이오리', 'Iori'],
  ['アル', '아루', 'Aru'],

  // DQ characters (order matters)
  ['はぐれメタル', '메탈슬라임(메탈)', 'Liquid Metal Slime'],
  ['メタルスライム', '메탈슬라임', 'Metal Slime'],
  ['バブルスライム', '버블슬라임', 'Bubble Slime'],
  ['スライム', '슬라임', 'Slime'],

  // One Piece characters
  ['グロリオーサ', '글로리오사', 'Gloriosa'],
  ['ステューシー', '스튜시', 'Stussy'],
  ['カタクリ', '카타쿠리', 'Katakuri'],
  ['ニューゲート', '뉴게이트', 'Newgate'],
  ['パクノダ', '파쿠노다', 'Pakunoda'],
  ['ウボォーギン', '우보긴', 'Uvogin'],
  ['チョッパー', '쵸파', 'Chopper'],
  ['クロロ', '크로로', 'Chrollo'],
  ['ネオン', '네온', 'Neon'],
  ['ルフィ', '루피', 'Luffy'],
  ['サンジ', '상디', 'Sanji'],
  ['ウソップ', '우솝', 'Usopp'],
  ['ブルック', '브룩', 'Brook'],
  ['ナミ', '나미', 'Nami'],
  ['シキ', '시키', 'Shiki'],

  // Other characters
  ['ウオッカ', '보드카', 'Vodka'],
  ['ベジット', '베지토', 'Vegito'],
  ['孫悟空', '손오공', 'Son Goku'],
  ['イギー', '이기', 'Iggy'],
  ['テレサ', '부끄부끄', 'Boo'],
  ['ワドルディ', '웨이들디', 'Waddle Dee'],
  ['カービィ', '커비', 'Kirby'],
  ['アグモン', '아구몬', 'Agumon'],
  ['ポチタ', '포치타', 'Pochita'],
  ['スティッチ', '스티치', 'Stitch'],
  ['トガヒミコ', '토가 히미코', 'Himiko Toga'],
  ['ニャンコ先生', '냥코 선생', 'Nyanko-sensei'],
  ['リムル', '리무루', 'Rimuru'],
  ['ルナマリア', '루나마리아', 'Lunamaria'],
  ['桜ミク', '벚꽃 미쿠', 'Cherry Blossom Miku'],
  ['黒江雫', '쿠로에 시즈쿠', 'Kuroe Shizuku'],
  ['大佛', '대불', 'Daibutsu'],
  ['ポン太', '폰타', 'Ponta'],
  ['リン', '린', 'Rin'],

  // Tom & Jerry / Disney / etc
  ['ミニーマウス', '미니 마우스', 'Minnie Mouse'],
  ['ディズニー マリー', '디즈니 마리', 'Disney Marie'],
  ['ヤングオイスター', '영 오이스터', 'Young Oyster'],
  ['おしゃれキャット', '아리스토캣', 'The Aristocats'],
  ['ベビーショーン', '베이비 숀', 'Baby Shaun'],
  ['ラプンツェル', '라푼젤', 'Rapunzel'],
  ['エンジェル', '엔젤', 'Angel'],
  ['ウッディ', '우디', 'Woody'],
  ['ジェシー', '제시', 'Jessie'],
  ['タフィー', '태피', 'Tuffy'],
  ['オラフ', '올라프', 'Olaf'],
  ['アリエル', '아리엘', 'Ariel'],
  ['チェイス', '체이스', 'Chase'],
  ['スカイ', '스카이', 'Skye'],
  ['ベル', '벨', 'Belle'],

  // Chiikawa characters
  ['くりまんじゅう', '쿠리만주', 'Kurimanju'],
  ['ハチワレねこ', '턱시도 고양이', 'Bicolor Cat'],
  ['シャムねこ', '샴 고양이', 'Siamese Cat'],
  ['ハチワレ', '하치와레', 'Hachiware'],
  ['モモンガ', '모몽가', 'Momonga'],
  ['ラッコ', '랏코', 'Sea Otter'],
  ['シーサー', '시사', 'Shisa'],
  ['古本屋', '헌책방', 'Used Bookstore'],
  ['うさぎ', '우사기', 'Rabbit'],

  // Teletubbies
  ['ラーラ', '라라', 'Laa-Laa'],

  // Moomin characters
  ['ニョロニョロ', '니로니로', 'Hattifatteners'],
  ['リトルミイ', '리틀미이', 'Little My'],
  ['スナフキン', '스나후킨', 'Snufkin'],

  // Puppet Sunsun
  ['スンスン', '순순', 'Sunsun'],
  ['ノンノン', '논논', 'Nonnon'],

  // SI-VIS characters
  ['キョウヤ', '쿄야', 'Kyouya'],
  ['セイレーン', '세이렌', 'Siren'],
  ['ソウジ', '소우지', 'Souji'],

  // SNOOPY characters
  ['スヌーピー', '스누피', 'Snoopy'],

  // Sesame
  ['エルモ', '엘모', 'Elmo'],

  // Miffy/Bruna colors
  ['ブルーナイエロー', '브루나 옐로', 'Bruna Yellow'],
  ['ブルーナレッド', '브루나 레드', 'Bruna Red'],
  ['ブルーナグリーン', '브루나 그린', 'Bruna Green'],
  ['ブルーナブルー', '브루나 블루', 'Bruna Blue'],
  ['ブルーナブラウン', '브루나 브라운', 'Bruna Brown'],
  ['ブルーナグレー', '브루나 그레이', 'Bruna Gray'],

  // Zootopia
  ['ニック', '닉', 'Nick'],

  // BayStars
  ['DB.スターマン単体', 'DB.스타맨 단독', 'DB.Starman Solo'],
  ['DB.スターマン集合', 'DB.스타맨 집합', 'DB.Starman Group'],

  // Other misc characters
  ['しゅうまい', '슈마이', 'Shumai'],
  ['ホトケアカバネ', '호토케아카바네', 'Hotoke Akabane'],
  ['アラシクロバネ', '아라시쿠로바네', 'Arashi Kurobane'],
  ['ぐでたま', '구데타마', 'Gudetama'],
  ['ポチャッコ', '포챠코', 'Pochacco'],
  ['ウサハナ', '우사하나', 'Usahana'],
  ['クロミ', '크로미', 'Kuromi'],
  ['ミミィ', '미미', 'Mimmy'],
  ['トム', '톰', 'Tom'],
  ['ジェリー', '제리', 'Jerry'],
  ['キキ', '키키', 'Kiki'],
  ['ララ', '라라', 'Lala'],
  ['チョコキャット', '초코캣', 'Chococat'],

  // === PRODUCT TYPES (medium length) ===
  ['おおきなSOFVIMATES', '큰 SOFVIMATES', 'Big SOFVIMATES'],
  ['ミルキーボア おやすみピンクBIGぬいぐるみ', '밀키 보아 굿나잇 핑크 BIG 인형', 'Milky Boa Good Night Pink BIG Plush'],
  ['おそろいいちごリボンBIGぬいぐるみ', '매칭 딸기 리본 BIG 인형', 'Matching Strawberry Ribbon BIG Plush'],
  ['カラフルエルモBIGぬいぐるみ', '컬러풀 엘모 BIG 인형', 'Colorful Elmo BIG Plush'],
  ['パステルカラーBIG', '파스텔 컬러 BIG', 'Pastel Color BIG'],
  ['カラフルBIG', '컬러풀 BIG', 'Colorful BIG'],
  ['きゅるまるBIGぬいぐるみ', '큐루마루 BIG 인형', 'Kyurumaru BIG Plush'],
  ['ちょこのせ [PM]フィギュア', '초코노세 [PM] 피규어', 'Chokonose [PM] Figure'],
  ['ふわふわもっとBIG', '폭신폭신 모토 BIG', 'Fluffy More BIG'],
  ['もちぴこマスコット', '모치피코 마스콧', 'Mochipiko Mascot'],
  ['ちゅるぷかチャーム', '츄루푸카 참', 'Churupuka Charm'],
  ['ぽよよん おかおボールマスコット', '포요욘 얼굴 볼 마스콧', 'Poyoyon Face Ball Mascot'],
  ['討伐マスコット', '토벌 마스콧', 'Subjugation Mascot'],
  ['ほぺぴたぬいぐるみ', '호페피타 인형', 'Hopepita Plush'],
  ['アニメロゴライト', '애니메 로고 라이트', 'Anime Logo Light'],
  ['なかよしメモリーズ おうちでリラックスタイム', '사이좋은 메모리즈 집에서 릴랙스 타임', 'Best Friends Memories Relax Time at Home'],
  ['大判タオルケット', '대판 타올 케트', 'Large Towel Blanket'],
  ['大判ラバーマット', '대판 러버 매트', 'Large Rubber Mat'],
  ['ちょこのりング', '쪼코노링', 'Chokonoring'],
  ['フィギュアライト', '피규어 라이트', 'Figure Light'],
  ['ぴかっとフィギュア', '반짝 피규어', 'Sparkle Figure'],
  ['キラキラトランク', '반짝반짝 트렁크', 'Glitter Trunk'],
  ['ちょぴぬいぷち', '쪼비 미니 인형', 'Chopi Plush Petit'],
  ['ちびぐるみ', '치비 인형', 'Chibi Plush'],
  ['寝そべりBIGぬいぐるみ', '누워있는 BIG 인형', 'Lying Down BIG Plush'],
  ['寝そべり ぬいぐるみ', '누워있는 인형', 'Lying Down Plush'],
  ['寝そべりぬいぐるみ', '누워있는 인형', 'Lying Down Plush'],
  ['寝そべりBIG', '누워있는 BIG', 'Lying Down BIG'],
  ['ビッグクッション', '빅 쿠션', 'Big Cushion'],
  ['オーバーオールBIGぬいぐるみ', '오버올 BIG 인형', 'Overall BIG Plush'],
  ['オーバーオール', '오버올', 'Overall'],
  ['部活BIGぬいぐるみ', '동아리 BIG 인형', 'Club Activity BIG Plush'],
  ['部活BIG', '동아리 BIG', 'Club Activity BIG'],
  ['超超BIGぬいぐるみ', '초초 BIG 인형', 'Super Super BIG Plush'],
  ['超超BIG', '초초 BIG', 'Super Super BIG'],
  ['ぬいぐるみXL', '인형 XL', 'Plush XL'],
  ['ウルトラDX', '울트라 DX', 'Ultra DX'],
  ['ふた付きマグカップ', '뚜껑 머그컵', 'Mug with Lid'],
  ['マグカップ', '머그컵', 'Mug Cup'],
  ['保冷保温バッグ', '보냉보온 백', 'Insulated Bag'],
  ['巾着保冷バッグ', '졸라매 보냉 백', 'Drawstring Cooler Bag'],
  ['保冷バッグ', '보냉 백', 'Cooler Bag'],
  ['刺繍バニティポーチ', '자수 배니티 파우치', 'Embroidered Vanity Pouch'],
  ['ウォールポケット', '월 포켓', 'Wall Pocket'],
  ['覆面水着団変身セット', '복면 수영복단 변신 세트', 'Masked Swimsuit Squad Transform Set'],
  ['アクリルキーチェーン', '아크릴 키체인', 'Acrylic Keychain'],
  ['あいぬい ミニぬいぐるみ', '아이누이 미니 인형', 'Ainui Mini Plush'],
  ['みにコレ!ぬいぐるみマスコット', '미니 콜레! 인형 마스콧', 'Mini Colle! Plush Mascot'],
  ['ミニぬいぐるみ', '미니 인형', 'Mini Plush'],
  ['ふわぷち マスコット', '후와쁘치 마스콧', 'Fuwapuchi Mascot'],
  ['ふわぷち　マスコット', '후와쁘치 마스콧', 'Fuwapuchi Mascot'],
  ['ちまっとさん ぬいぐるみ', '치맛토상 인형', 'Chimattosan Plush'],
  ['ボイスマスコット', '보이스 마스콧', 'Voice Mascot'],
  ['くっつき ぬいぐるみ', '착붙 인형', 'Clinging Plush'],
  ['ぷれちゃすぬいぐるみ', '프레셔스 인형', 'Precious Plush'],
  ['[PtZ]ぬいぐるみ帽子', '[PtZ] 인형 모자', '[PtZ] Plush Hat'],
  ['ブーケぬいぐるみ', '부케 인형', 'Bouquet Plush'],
  ['ぴょことも マスコット', '표코토모 마스콧', 'Pyokotomo Mascot'],
  ['とことこ歩いてニャーニャー鳴く子猫たち', '뚜벅뚜벅 걸으며 야옹야옹 우는 새끼고양이들', 'Walking and Meowing Kittens'],
  ['跳び（弁当）箱', '도시락(뜀틀) 상자', 'Lunch Box (Vault Box)'],
  ['公式ライセンス商品エコバッグ', '공식 라이선스 에코백', 'Official Licensed Eco Bag'],
  ['晴雨兼用！折りたたみ傘', '양산겸용 접이식 우산', 'All-weather Folding Umbrella'],
  ['折りたたみ傘', '접이식 우산', 'Folding Umbrella'],
  ['お風呂セット', '목욕 세트', 'Bath Set'],
  ['ティーポット', '티포트', 'Teapot'],
  ['パスタ皿', '파스타 접시', 'Pasta Plate'],
  ['目覚まし時計', '알람 시계', 'Alarm Clock'],
  ['空気砲クッション', '공기포 쿠션', 'Air Cannon Cushion'],
  ['空気砲', '공기포', 'Air Cannon'],
  ['スパイスボトル', '스파이스 보틀', 'Spice Bottle'],
  ['ルームライト', '룸라이트', 'Room Light'],
  ['PCマウス', 'PC 마우스', 'PC Mouse'],
  ['ハンディファン', '핸디 선풍기', 'Handy Fan'],
  ['ソース焼きそばミドルBOX', '소스 야키소바 미들 BOX', 'Sauce Yakisoba Middle BOX'],
  ['よくばりBOX', '욕심쟁이 BOX', 'Greedy BOX'],
  ['キャラクター大賞', '캐릭터 대상', 'Character Grand Prix'],
  ['BIGぬいぐるみ', 'BIG 인형', 'BIG Plush'],
  ['[PtZ]トートバッグ', '[PtZ] 토트백', '[PtZ] Tote Bag'],
  ['[PtZ]ビッグポケットリュック', '[PtZ] 빅 포켓 백팩', '[PtZ] Big Pocket Backpack'],
  ['[PtZ]アートクッション', '[PtZ] 아트 쿠션', '[PtZ] Art Cushion'],
  ['[PtZ]バスタオル', '[PtZ] 배스 타올', '[PtZ] Bath Towel'],
  ['[PtZ]リストウォッチ', '[PtZ] 손목시계', '[PtZ] Wrist Watch'],
  ['[PtZ]レジャーシート', '[PtZ] 레저 시트', '[PtZ] Leisure Sheet'],
  ['[SGZ]クッション', '[SGZ] 쿠션', '[SGZ] Cushion'],
  ['[PtZ]フェイスティッシュボックスカバー', '[PtZ] 페이스 티슈 박스 커버', '[PtZ] Face Tissue Box Cover'],
  ['[PtZ]刺繍バニティポーチ', '[PtZ] 자수 배니티 파우치', '[PtZ] Embroidered Vanity Pouch'],
  ['[PtZ]ウォールポケット', '[PtZ] 월 포켓', '[PtZ] Wall Pocket'],
  ['[PtZ]覆面水着団変身セット', '[PtZ] 복면 수영복단 변신 세트', '[PtZ] Masked Swimsuit Squad Transform Set'],
  ['パンダぬいぐるみXL', '팬더 인형 XL', 'Panda Plush XL'],
  ['Lぬいぐるみ', 'L 인형', 'L Plush'],
  ['エアぐるみ', '에어 인형', 'Air Plush'],
  ['ぬいぐるみ', '인형', 'Plush'],
  ['フィギュア', '피규어', 'Figure'],
  ['クッション', '쿠션', 'Cushion'],
  ['マスコット', '마스콧', 'Mascot'],
  ['ステンレスタンブラー', '스테인리스 텀블러', 'Stainless Tumbler'],
  ['ラグマット', '러그 매트', 'Rug Mat'],
  ['ワゴン', '왜건', 'Wagon'],
  ['スツール', '스툴', 'Stool'],
  ['タオル', '타올', 'Towel'],
  ['グラス', '글라스', 'Glass'],
  ['ポーチ', '파우치', 'Pouch'],

  // === DESCRIPTORS / MISC ===
  ['超サイヤ人ロゼ', '초사이어인 로제', 'Super Saiyan Rose'],
  ['スターダストクルセイダース', '스타더스트 크루세이더즈', 'Stardust Crusaders'],
  ['描き下ろし和風喫茶', '오리지널 일러스트 일본풍 카페', 'Original Illustration Japanese-style Cafe'],
  ['描き下ろしCat room wear', '오리지널 일러스트 Cat room wear', 'Original Illustration Cat room wear'],
  ['描き下ろし', '오리지널 일러스트', 'Original Illustration'],
  ['カーネーション・リコレクション', '카네이션 리콜렉션', 'Carnation Recollection'],
  ['25時、ナイトコードで。', '25시, 나이트코드에서.', 'At 25:00, in Night Code.'],
  ['誰もいないセカイの', '아무도 없는 세카이의', "Nobody's SEKAI's"],
  ['サンフランソーキョー', '산프란소쿄', 'San Fransokyo'],
  ['麦わらの一味', '밀짚모자 일당', 'Straw Hat Crew'],
  ['ゴッドバレー事件', '갓 밸리 사건', 'God Valley Incident'],
  ['黄金の風', '황금의 바람', 'Golden Wind'],
  ['ジョイフルマーチング', '조이풀 마칭', 'Joyful Marching'],
  ['アフタヌーンティーパーティ', '애프터눈 티 파티', 'Afternoon Tea Party'],
  ['ハイウェイの堕天使', '하이웨이의 타천사', 'Highway Fallen Angel'],
  ['腕時計型麻酔銃', '손목시계형 마취총', 'Wristwatch Tranquilizer'],
  ['蝶ネクタイ型変声機', '나비넥타이형 변성기', 'Bow-tie Voice Changer'],
  ['千速と重悟の婚活パーティー', '치하야와 주고의 맞선 파티', "Chihaya and Jugo's Matchmaking Party"],
  ['婚活パーティー', '맞선 파티', 'Matchmaking Party'],
  ['重悟', '주고', 'Jugo'],
  ['劇場版ビジュアルデザイン', '극장판 비주얼 디자인', 'Movie Visual Design'],
  ['青山先生作画Ver.', '아오야마 선생 작화 Ver.', 'Aoyama Illustration Ver.'],
  ['アイスキャンディ', '아이스 캔디', 'Ice Candy'],
  ['コギャルにゃん', '코갸루냥', 'Kogal Nyan'],
  ['おぱサファリ', '오파 사파리', 'Opa Safari'],
  ['ドラム王国', '드럼 왕국', 'Drum Kingdom'],
  ['ホウエン地方', '호연 지방', 'Hoenn Region'],
  ['デジヴァイス', '디지바이스', 'Digivice'],
  ['チャイナ服', '차이나 드레스', 'Chinese Dress'],
  ['バニーVer.', '바니 Ver.', 'Bunny Ver.'],
  ['マリン・C', '마린 C', 'Marine C'],
  ['Queen V', 'Queen V', 'Queen V'],
  ['天使なえびてん', '천사 에비텐', 'Angel Ebiten'],
  ['チュッパチャプス', '츄파춥스', 'Chupa Chups'],
  ['ふわふわニャンコ先生', '폭신폭신 냥코 선생', 'Fluffy Nyanko-sensei'],
  ['おもしろ雑貨', '재미 잡화', 'Fun Goods'],
  ['ポーション', '포션', 'Portion'],
  ['ハンバーガー', '햄버거', 'Hamburger'],
  ['ホットドッグ', '핫도그', 'Hot Dog'],
  ['サンドイッチ', '샌드위치', 'Sandwich'],
  ['アイスキャンディ', '아이스 캔디', 'Ice Candy'],
  ['ティーカップ', '티컵', 'Teacup'],
  ['たこ焼き', '타코야키', 'Takoyaki'],
  ['おにぎり', '오니기리', 'Rice Ball'],
  ['肉まん', '고기만두', 'Meat Bun'],
  ['バーガー', '버거', 'Burger'],
  ['ポテト', '포테토', 'Potato'],
  ['餃子', '교자', 'Gyoza'],
  ['えらい！', '대단해!', 'Amazing!'],
  ['食びるー！', '먹는다!', 'Eating!'],
  ['助けに来たよ～！', '도와주러 왔어~!', 'I came to help~!'],
  ['おまじない～！', '주문~!', 'Spell~!'],
  ['おおきな', '큰', 'Big'],
  ['カラフル', '컬러풀', 'Colorful'],
  ['リュック', '백팩', 'Backpack'],
  ['パンダ', '팬더', 'Panda'],
  ['アニメ', '애니메', 'Anime'],
  ['第四弾', '제4탄', '4th Edition'],
  ['劇場版', '극장판', 'Movie'],
  ['4種', '4종', '4 Types'],
  ['ウィンク', '윙크', 'Wink'],
  ['おすわり', '앉아', 'Sitting'],
  ['立ち姿', '서있는 모습', 'Standing'],
  ['女子高生', '여고생', 'High School Girl'],
  ['スタンダード', '스탠다드', 'Standard'],
  ['にっこり', '생글', 'Smiling'],
  ['バスケ', '농구', 'Basketball'],
  ['サッカー', '축구', 'Soccer'],
  ['野球', '야구', 'Baseball'],
  ['ライオン', '라이온', 'Lion'],
  ['シカ', '사슴', 'Deer'],
  ['ブタ', '돼지', 'Pig'],
  ['ウマ', '말', 'Horse'],
  ['アニマル', '애니멀', 'Animal'],
  ['超超', '초초', 'Super Super'],
  ['クローバー', '클로버', 'Clover'],
  ['ふわふわ', '폭신폭신', 'Fluffy'],
  ['プレミアム', '프리미엄', 'Premium'],
  ['マリン', '마린', 'Marine'],
  ['しゅや', '슈야', 'Shuya'],
  ['とや', '토야', 'Toya'],
  ['～タビーズ～', '~태비즈~', '~Tabbies~'],
  ['〜タビーズ〜', '~태비즈~', '~Tabbies~'],
  ['黒', '검정', 'Black'],

  // === COLORS (after character names to avoid conflicts) ===
  ['ブラック×ピンク', '블랙x핑크', 'Black x Pink'],
  ['ピンク×ブルー', '핑크x블루', 'Pink x Blue'],
  ['ブルー×イエロー', '블루x옐로', 'Blue x Yellow'],
  ['ブラウン×グリーン', '브라운x그린', 'Brown x Green'],
  ['ベージュ×グレー', '베이지x그레이', 'Beige x Gray'],
  ['レッドハイビスカス', '레드 하이비스커스', 'Red Hibiscus'],
  ['オレンジハイビスカス', '오렌지 하이비스커스', 'Orange Hibiscus'],
  ['ハイビスカス', '하이비스커스', 'Hibiscus'],
  ['ピンクリボン', '핑크 리본', 'Pink Ribbon'],
  ['ブルーリボン', '블루 리본', 'Blue Ribbon'],
  ['パステルカラー', '파스텔 컬러', 'Pastel Color'],
  ['メタリックカラー', '메탈릭 컬러', 'Metallic Color'],
  ['パールカラー', '펄 컬러', 'Pearl Color'],
  ['通常カラー', '통상 컬러', 'Normal Color'],
  ['フルーツティー', '프루츠 티', 'Fruit Tea'],
  ['キャラメル', '캬라멜', 'Caramel'],
  ['完熟苺', '완숙 딸기', 'Ripe Strawberry'],
  ['紅茶', '홍차', 'Black Tea'],
  ['オレンジ', '오렌지', 'Orange'],
  ['シルバー', '실버', 'Silver'],
  ['ブラウン', '브라운', 'Brown'],
  ['ブラック', '블랙', 'Black'],
  ['ホワイト', '화이트', 'White'],
  ['イエロー', '옐로', 'Yellow'],
  ['パープル', '퍼플', 'Purple'],
  ['グリーン', '그린', 'Green'],
  ['ベージュ', '베이지', 'Beige'],
  ['ピンク', '핑크', 'Pink'],
  ['ブルー', '블루', 'Blue'],
  ['レッド', '레드', 'Red'],
  ['グレー', '그레이', 'Gray'],
  ['ノーマル', '노멀', 'Normal'],
  ['照れ', '부끄러움', 'Shy'],
  ['デザイン', '디자인', 'Design'],
  ['桜', '벚꽃', 'Cherry Blossom'],
];

// ============================================================
// TRANSLATION LOGIC
// ============================================================

function getCategoryKo(nameJa: string): string {
  const figureKeywords = ['フィギュア', 'Figure', 'Grandista', 'MATCH MAKERS', 'BLOOD OF SAIYANS', 'VIBRATION STARS', 'KING OF ARTIST', 'SOFVIMATES', 'BANPRESTO', 'XrossLink', 'Coreful', 'One-Seventh Carat', 'Desktop Cute', 'BiCute'];
  const plushKeywords = ['ぬいぐるみ', 'クッション', 'マスコット', 'ぬいぷち', 'ちびぐるみ', 'Fluffy Puffy', 'エアぐるみ', 'もこもこ', 'ぐるみ'];
  for (const kw of figureKeywords) {
    if (nameJa.includes(kw)) return '[피규어]';
  }
  for (const kw of plushKeywords) {
    if (nameJa.includes(kw)) return '[인형]';
  }
  return '[기타]';
}

function getCategoryEn(nameJa: string): string {
  const figureKeywords = ['フィギュア', 'Figure', 'Grandista', 'MATCH MAKERS', 'BLOOD OF SAIYANS', 'VIBRATION STARS', 'KING OF ARTIST', 'SOFVIMATES', 'BANPRESTO', 'XrossLink', 'Coreful', 'One-Seventh Carat', 'Desktop Cute', 'BiCute'];
  const plushKeywords = ['ぬいぐるみ', 'クッション', 'マスコット', 'ぬいぷち', 'ちびぐるみ', 'Fluffy Puffy', 'エアぐるみ', 'もこもこ', 'ぐるみ'];
  for (const kw of figureKeywords) {
    if (nameJa.includes(kw)) return '[Figure]';
  }
  for (const kw of plushKeywords) {
    if (nameJa.includes(kw)) return '[Plush]';
  }
  return '[Other]';
}

// Sort dictionary by Japanese key length descending (longer matches first)
const sortedDictionary = [...dictionary].sort((a, b) => b[0].length - a[0].length);

// Short names that should only match inside parentheses （...）
const bracketOnlyNames: [string, string, string][] = [
  ['ベリー', '베리', 'Berry'],
  ['チェリー', '체리', 'Cherry'],
  ['ぱお', '파오', 'Pao'],
  ['スズキ', '스즈키', 'Suzuki'],
  ['ツノ', '츠노', 'Tsuno'],
  ['チャム', '참', 'Chum'],
  ['パム', '팜', 'Pam'],
  ['ムー', '무', 'Moo'],
  ['ゴロ', '고로', 'Goro'],
  ['ピカ', '피카', 'Pika'],
  ['ドン', '동', 'Don'],
  ['ニェ', '녜', 'Nye'],
];

function translateName(nameJa: string, lang: 'ko' | 'en'): string {
  const idx = lang === 'ko' ? 1 : 2;
  let result = nameJa;

  // First pass: replace fullwidth symbols to normalize
  result = result.replace(/　/g, ' ');
  result = result.replace(/＆/g, '&');

  // Apply main dictionary (sorted by length, longest first)
  for (const entry of sortedDictionary) {
    const ja = entry[0];
    const replacement = entry[idx];
    if (result.includes(ja)) {
      result = result.split(ja).join(replacement);
    }
  }

  // Apply bracket-only names: only inside （...） or (...)
  for (const entry of bracketOnlyNames) {
    const ja = entry[0];
    const replacement = entry[idx];
    // Match inside fullwidth or regular parens
    result = result.replace(new RegExp(`（${ja}）`, 'g'), `(${replacement})`);
    result = result.replace(new RegExp(`\\(${ja}\\)`, 'g'), `(${replacement})`);
  }

  // Replace fullwidth parens with regular ones
  result = result.replace(/（/g, '(').replace(/）/g, ')');

  // Replace ・ between characters/words
  result = result.replace(/・/g, ' & ');

  // Replace ー only when used as a delimiter (not inside katakana words)
  // Pattern: ー preceded or followed by non-katakana, or at boundaries
  // Safe approach: replace ー that appears as -NAME- delimiters
  result = result.replace(/ー/g, '-');

  // Replace ～ with ~
  result = result.replace(/～/g, '~');
  result = result.replace(/〜/g, '~');

  // Handle の particle (possessive "of/'s") - only when between translated words
  // Replace の that is surrounded by non-Japanese characters
  result = result.replace(/の/g, ' ');

  // Handle と particle (and) between names
  result = result.replace(/と/g, ' & ');

  // Clean up spacing and punctuation
  result = result.replace(/  +/g, ' ');
  result = result.replace(/- ?$/g, '');
  result = result.replace(/^- ?/g, '');
  result = result.replace(/-~/g, '~');
  result = result.replace(/~-/g, '~');
  result = result.replace(/、/g, ', ');

  result = result.trim();
  return result;
}

function fixSpacing(name: string): string {
  // Ensure space after 】
  name = name.replace(/】([^\s\)])/g, '】 $1');
  // Ensure space between 】 letter and next word in English: 【AChrollo】 -> 【A Chrollo】
  name = name.replace(/【([A-Z])([A-Z][a-z])/g, '【$1 $2');
  // Ensure space before Vol.
  name = name.replace(/(\S)(Vol\.)/g, '$1 $2');
  // Ensure space between number and words
  name = name.replace(/(\d)(BIG|Plush|Figure|Mascot|Super|Wink|인형|피규어|마스콧|초초|윙크)/g, '$1 $2');
  // Ensure space between words and numbers
  name = name.replace(/(Grand Prix|캐릭터 대상|Movie|극장판|Carat)(\d)/g, '$1 $2');
  // Ensure space before Figure/Plush after product line names
  name = name.replace(/(Carat)(Figure|피규어)/g, '$1 $2');
  // Ensure space after closing paren before word
  name = name.replace(/\)([A-Za-z가-힣])/g, ') $1');
  // Ensure space before ver.
  name = name.replace(/([A-Za-z가-힣])(ver\.)/g, '$1 $2');
  // Ensure space after "mini"
  // Fix 「...」 spacing
  name = name.replace(/」(\S)/g, '」 $1');
  // Multiple spaces
  name = name.replace(/  +/g, ' ');
  return name.trim();
}

function hasJapanese(str: string): boolean {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(str);
}

// ============================================================
// MAIN
// ============================================================

const dataPath = path.resolve(__dirname, '../data/dmm-figures-final.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');
const items: FigureItem[] = JSON.parse(rawData);

// We need the ORIGINAL nameJa, but the file may have been modified.
// Re-read original? No - nameJa should be unchanged. Let's verify.
console.log(`Processing ${items.length} items...`);

let koStillJp = 0;
let enStillJp = 0;
const problemItems: { index: number; nameJa: string; field: string; value: string }[] = [];

for (let i = 0; i < items.length; i++) {
  const item = items[i];
  const nameJa = item.nameJa;

  const categoryKo = getCategoryKo(nameJa);
  const categoryEn = getCategoryEn(nameJa);

  let nameKo = translateName(nameJa, 'ko');
  let nameEn = translateName(nameJa, 'en');

  nameKo = fixSpacing(nameKo);
  nameEn = fixSpacing(nameEn);

  item.nameKo = `${categoryKo} ${nameKo}`;
  item.nameEn = `${categoryEn} ${nameEn}`;

  if (hasJapanese(item.nameKo)) {
    koStillJp++;
    problemItems.push({ index: i, nameJa, field: 'Ko', value: item.nameKo });
  }
  if (hasJapanese(item.nameEn)) {
    enStillJp++;
    problemItems.push({ index: i, nameJa, field: 'En', value: item.nameEn });
  }
}

fs.writeFileSync(dataPath, JSON.stringify(items, null, 2), 'utf-8');

console.log(`\nDone! Wrote ${items.length} items.`);
console.log(`Items with remaining JP in nameKo: ${koStillJp}`);
console.log(`Items with remaining JP in nameEn: ${enStillJp}`);

if (problemItems.length > 0) {
  console.log('\n=== PROBLEM ITEMS ===');
  const seen = new Set<string>();
  for (const p of problemItems) {
    const key = `${p.index}-${p.field}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`[${p.index}] ${p.field}: ${p.value}`);
    console.log(`    Ja: ${p.nameJa}`);
  }
}
