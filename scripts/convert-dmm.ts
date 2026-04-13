import { readFileSync, writeFileSync } from "fs";

interface DmmPrize {
  prize_name: string;
  import_date: string;
  thumb_image: string;
  prize_id: number;
  detail_images: string[];
  category: "피규어" | "인형" | "기타";
}

interface SyncEntry {
  nameKo: string;
  nameEn: string;
  nameJa: string;
  imageUrl: string;
  date: string;
  time: string;
  sourceUrl: string;
}

// Category tags
const categoryTagKo: Record<string, string> = {
  "피규어": "[피규어]",
  "인형": "[인형]",
  "기타": "[기타]",
};
const categoryTagEn: Record<string, string> = {
  "피규어": "[Figure]",
  "인형": "[Plush]",
  "기타": "[Other]",
};

// Japanese -> Korean series name mapping
const jaToKo: [RegExp, string][] = [
  [/ワンピース/g, "원피스"],
  [/ドラゴンボール超/g, "드래곤볼 슈퍼"],
  [/ドラゴンボールZ/g, "드래곤볼Z"],
  [/ドラゴンボール/g, "드래곤볼"],
  [/HUNTER×HUNTER/g, "헌터×헌터"],
  [/ポケットモンスター/g, "포켓몬스터"],
  [/名探偵コナン/g, "명탐정 코난"],
  [/名探偵プリキュア！/g, "명탐정 프리큐어!"],
  [/呪術廻戦/g, "주술회전"],
  [/僕のヒーローアカデミア/g, "나의 히어로 아카데미아"],
  [/転生したらスライムだった件/g, "전생했더니 슬라임이었던 건에 대하여"],
  [/葬送のフリーレン/g, "장송의 프리렌"],
  [/チェンソーマン/g, "체인소맨"],
  [/ドラゴンクエスト/g, "드래곤 퀘스트"],
  [/サンリオキャラクターズ/g, "산리오 캐릭터즈"],
  [/ディズニーキャラクター/g, "디즈니 캐릭터"],
  [/ディズニープリンセス/g, "디즈니 프린세스"],
  [/すみっコぐらし/g, "스밋코구라시"],
  [/トムとジェリー/g, "톰과 제리"],
  [/ジョジョの奇妙な冒険/g, "죠죠의 기묘한 모험"],
  [/スターダストクルセイダース/g, "스타더스트 크루세이더즈"],
  [/黄金の風/g, "황금의 바람"],
  [/ドラえもん/g, "도라에몽"],
  [/スーパーマリオ/g, "슈퍼 마리오"],
  [/ハローキティ/g, "헬로키티"],
  [/マイメロディ/g, "마이멜로디"],
  [/クロミ/g, "쿠로미"],
  [/シナモロール/g, "시나모롤"],
  [/ポムポムプリン/g, "폼폼푸린"],
  [/リラックマ/g, "리락쿠마"],
  [/初音ミク/g, "하츠네 미쿠"],
  [/桜ミク/g, "사쿠라 미쿠"],
  [/星のカービィ/g, "별의 커비"],
  [/ムーミン/g, "무민"],
  [/ウマ娘 プリティーダービー/g, "우마무스메 프리티 더비"],
  [/学園アイドルマスター/g, "학원 아이돌마스터"],
  [/プロジェクトセカイ カラフルステージ！ feat\. 初音ミク/g, "프로젝트 세카이 컬러풀 스테이지! feat. 하츠네 미쿠"],
  [/ブルーアーカイブ/g, "블루 아카이브"],
  [/五等分の花嫁/g, "5등분의 신부"],
  [/お隣の天使様にいつの間にか駄目人間にされていた件/g, "옆자리 천사님이 어느새 나를 폐인으로 만든 건에 대하여"],
  [/その着せ替え人形は恋をする/g, "그 비스크 돌은 사랑을 한다"],
  [/無職転生II ～異世界行ったら本気だす～/g, "무직전생 II ~이세계에 갔으면 최선을 다한다~"],
  [/無職転生/g, "무직전생"],
  [/「青春ブタ野郎」シリーズ/g, "청춘 돼지 시리즈"],
  [/忍たま乱太郎/g, "닌타마 란타로"],
  [/夏目友人帳/g, "나츠메 우인장"],
  [/東方Project/g, "동방 프로젝트"],
  [/デジモンアドベンチャー/g, "디지몬 어드벤처"],
  [/アークナイツ/g, "명일방주"],
  [/SAKAMOTO DAYS/g, "사카모토 데이즈"],
  [/チップ＆デール/g, "칩&데일"],
  [/トイ・ストーリー/g, "토이 스토리"],
  [/塔の上のラプンツェル/g, "라푼젤"],
  [/ちいかわ/g, "치이카와"],
  [/セサミストリート/g, "세서미 스트리트"],
  [/ひつじのショーン/g, "숀 더 쉽"],
  [/テレタビーズ/g, "텔레토비"],
  [/パウ・パトロール/g, "파우 패트롤"],
  [/ズートピア/g, "주토피아"],
  [/おぱんちゅうさぎ/g, "오판츄우사기"],
  [/氷の城壁/g, "얼음의 성벽"],
  [/ベイマックス/g, "빅 히어로"],
  [/こびとづかん/g, "코비토즈칸"],
  [/パラッパラッパー/g, "파라파 더 래퍼"],
  [/コウペンちゃん/g, "코우펜짱"],
  [/おさるのジョージ/g, "호기심 많은 조지"],
  [/ミッフィー/g, "미피"],
  [/魔入りました！入間くん/g, "마입니다! 이루마군"],
  [/パディントン/g, "패딩턴"],
  [/パペットスンスン/g, "퍼펫 슨슨"],
  [/ダンバイン/g, "던바인"],
  [/ニョロニョロ/g, "니로니로"],
  // Product type translations
  [/ぬいぐるみ/g, "인형"],
  [/フィギュア/g, "피규어"],
  [/クッション/g, "쿠션"],
  [/マスコット/g, "마스코트"],
  [/キャラクター大賞/g, "캐릭터 대상"],
];

// Japanese -> English series name mapping
const jaToEn: [RegExp, string][] = [
  [/ワンピース/g, "One Piece"],
  [/ドラゴンボール超/g, "Dragon Ball Super"],
  [/ドラゴンボールZ/g, "Dragon Ball Z"],
  [/ドラゴンボール/g, "Dragon Ball"],
  [/HUNTER×HUNTER/g, "HUNTER×HUNTER"],
  [/ポケットモンスター/g, "Pokemon"],
  [/名探偵コナン/g, "Detective Conan"],
  [/名探偵プリキュア！/g, "Detective PreCure!"],
  [/呪術廻戦/g, "Jujutsu Kaisen"],
  [/僕のヒーローアカデミア/g, "My Hero Academia"],
  [/転生したらスライムだった件/g, "That Time I Got Reincarnated as a Slime"],
  [/葬送のフリーレン/g, "Frieren: Beyond Journey's End"],
  [/チェンソーマン/g, "Chainsaw Man"],
  [/ドラゴンクエスト/g, "Dragon Quest"],
  [/サンリオキャラクターズ/g, "Sanrio Characters"],
  [/ディズニーキャラクター/g, "Disney Characters"],
  [/ディズニープリンセス/g, "Disney Princess"],
  [/すみっコぐらし/g, "Sumikko Gurashi"],
  [/トムとジェリー/g, "Tom and Jerry"],
  [/ジョジョの奇妙な冒険/g, "JoJo's Bizarre Adventure"],
  [/スターダストクルセイダース/g, "Stardust Crusaders"],
  [/黄金の風/g, "Golden Wind"],
  [/ドラえもん/g, "Doraemon"],
  [/スーパーマリオ/g, "Super Mario"],
  [/ハローキティ/g, "Hello Kitty"],
  [/マイメロディ/g, "My Melody"],
  [/クロミ/g, "Kuromi"],
  [/シナモロール/g, "Cinnamoroll"],
  [/ポムポムプリン/g, "Pompompurin"],
  [/リラックマ/g, "Rilakkuma"],
  [/初音ミク/g, "Hatsune Miku"],
  [/桜ミク/g, "Sakura Miku"],
  [/星のカービィ/g, "Kirby"],
  [/ムーミン/g, "Moomin"],
  [/ウマ娘 プリティーダービー/g, "Uma Musume Pretty Derby"],
  [/学園アイドルマスター/g, "Gakuen Idolmaster"],
  [/プロジェクトセカイ カラフルステージ！ feat\. 初音ミク/g, "Project SEKAI Colorful Stage! feat. Hatsune Miku"],
  [/ブルーアーカイブ/g, "Blue Archive"],
  [/五等分の花嫁/g, "The Quintessential Quintuplets"],
  [/お隣の天使様にいつの間にか駄目人間にされていた件/g, "The Angel Next Door Spoils Me Rotten"],
  [/その着せ替え人形は恋をする/g, "My Dress-Up Darling"],
  [/無職転生II ～異世界行ったら本気だす～/g, "Mushoku Tensei II: Jobless Reincarnation"],
  [/無職転生/g, "Mushoku Tensei"],
  [/「青春ブタ野郎」シリーズ/g, "Rascal Does Not Dream Series"],
  [/忍たま乱太郎/g, "Nintama Rantaro"],
  [/夏目友人帳/g, "Natsume's Book of Friends"],
  [/東方Project/g, "Touhou Project"],
  [/デジモンアドベンチャー/g, "Digimon Adventure"],
  [/アークナイツ/g, "Arknights"],
  [/SAKAMOTO DAYS/g, "SAKAMOTO DAYS"],
  [/チップ＆デール/g, "Chip & Dale"],
  [/トイ・ストーリー/g, "Toy Story"],
  [/塔の上のラプンツェル/g, "Tangled"],
  [/ちいかわ/g, "Chiikawa"],
  [/セサミストリート/g, "Sesame Street"],
  [/ひつじのショーン/g, "Shaun the Sheep"],
  [/テレタビーズ/g, "Teletubbies"],
  [/パウ・パトロール/g, "PAW Patrol"],
  [/ズートピア/g, "Zootopia"],
  [/おぱんちゅうさぎ/g, "Opanchu Usagi"],
  [/氷の城壁/g, "The Ice Castle Wall"],
  [/ベイマックス/g, "Baymax"],
  [/こびとづかん/g, "Kobito Zukan"],
  [/パラッパラッパー/g, "PaRappa the Rapper"],
  [/コウペンちゃん/g, "Koupen-chan"],
  [/おさるのジョージ/g, "Curious George"],
  [/ミッフィー/g, "Miffy"],
  [/魔入りました！入間くん/g, "Welcome to Demon School! Iruma-kun"],
  [/パディントン/g, "Paddington"],
  [/パペットスンスン/g, "Puppet SunSun"],
  [/ダンバイン/g, "Dunbine"],
  [/ニョロニョロ/g, "Hattifatteners"],
  // Product type translations
  [/超超BIG/g, "Super Super BIG"],
  [/超BIG/g, "Super BIG"],
  [/ぬいぐるみ/g, "Plush"],
  [/フィギュア/g, "Figure"],
  [/クッション/g, "Cushion"],
  [/マスコット/g, "Mascot"],
  [/キャラクター大賞/g, "Character Grand Prix"],
  [/ちょぴぬいぷち/g, "Chopi Plush Petit"],
  [/めちゃもふぐっと/g, "Mecha Mofu Plush"],
  [/ちびぐるみ/g, "Chibi Plush"],
  [/寝そべり/g, "Lying Down"],
  [/もちぴこ/g, "Mochi Piko"],
  [/目覚まし時計/g, "Alarm Clock"],
  [/保冷保温バッグ/g, "Insulated Bag"],
  [/保冷バッグ/g, "Cooler Bag"],
  [/巾着保冷バッグ/g, "Drawstring Cooler Bag"],
  [/ハンディファン/g, "Handy Fan"],
  [/ステンレスタンブラー/g, "Stainless Tumbler"],
  [/ステンレスボトル/g, "Stainless Bottle"],
  [/折りたたみ傘/g, "Folding Umbrella"],
  [/晴雨兼用/g, "All-Weather"],
  [/空気砲/g, "Air Cannon"],
  [/大判タオルケット/g, "Large Towel Blanket"],
  [/大判ラバーマット/g, "Large Rubber Mat"],
  [/マグカップ/g, "Mug Cup"],
  [/エコバッグ/g, "Eco Bag"],
  [/トートバッグ/g, "Tote Bag"],
  [/ティーポット/g, "Teapot"],
  [/パスタ皿/g, "Pasta Plate"],
  [/スパイスボトル/g, "Spice Bottle"],
  [/アクリルキーチェーン/g, "Acrylic Keychain"],
  [/キーケース/g, "Key Case"],
  [/リュック/g, "Backpack"],
];

// Character name translations (common ones)
const charJaToKo: [RegExp, string][] = [
  // One Piece
  [/モンキー・D・ルフィ/g, "몽키 D. 루피"],
  [/サンジ/g, "상디"],
  [/ナミ/g, "나미"],
  [/ウソップ/g, "우솝"],
  [/ブルック/g, "브룩"],
  [/トニートニー・チョッパー/g, "토니토니 초파"],
  [/チョッパー/g, "초파"],
  [/シャーロット・カタクリ/g, "샬롯 카타쿠리"],
  [/エドワード・ニューゲート/g, "에드워드 뉴게이트"],
  [/グロリオーサ/g, "글로리오사"],
  [/シキ/g, "시키"],
  [/ミス・バッキンガム・ステューシー/g, "미스 버킹엄 스튜시"],
  // Dragon Ball
  [/孫悟空/g, "손오공"],
  [/ゴクウブラック/g, "고쿠 블랙"],
  [/超サイヤ人ロゼ/g, "초사이어인 로제"],
  [/超サイヤ人ベジット/g, "초사이어인 베지트"],
  [/ベジット/g, "베지트"],
  // Hunter x Hunter
  [/クロロ/g, "크로로"],
  [/ネオン/g, "네온"],
  [/パクノダ/g, "파쿠노다"],
  [/ウボォーギン/g, "우보긴"],
  // Detective Conan
  [/江戸川コナン/g, "에도가와 코난"],
  [/毛利蘭/g, "모리 란"],
  [/怪盗キッド/g, "괴도 키드"],
  [/松田陣平/g, "마츠다 진페이"],
  [/萩原研二/g, "하기와라 켄지"],
  [/萩原千速/g, "하기와라 치하야"],
  [/世良真純/g, "세라 마스미"],
  [/横溝重悟/g, "요코미조 주고"],
  // Pokemon
  [/ピカチュウ/g, "피카츄"],
  [/プリン/g, "푸린"],
  [/ピッピ/g, "삐삐"],
  [/ミュウ/g, "뮤"],
  [/ライチュウ/g, "라이츄"],
  [/マナフィ/g, "마나피"],
  [/ヒノアラシ/g, "브케인"],
  [/フォッコ/g, "푸호꼬"],
  // My Hero Academia
  [/トガヒミコ/g, "토가 히미코"],
  // Jojo
  [/イギー/g, "이기"],
  // Chainsaw Man
  [/ポチタ/g, "포치타"],
  // Mario
  [/テレサ/g, "부끄부끄"],
  // Dragon Quest
  [/はぐれメタル/g, "메탈슬라임"],
  [/バブルスライム/g, "버블슬라임"],
  [/スライム/g, "슬라임"],
  [/メタルスライム/g, "메탈슬라임"],
  [/ワドルディ/g, "웨이들디"],
];

const charJaToEn: [RegExp, string][] = [
  [/モンキー・D・ルフィ/g, "Monkey D. Luffy"],
  [/サンジ/g, "Sanji"],
  [/ナミ/g, "Nami"],
  [/ウソップ/g, "Usopp"],
  [/ブルック/g, "Brook"],
  [/トニートニー・チョッパー/g, "Tony Tony Chopper"],
  [/チョッパー/g, "Chopper"],
  [/シャーロット・カタクリ/g, "Charlotte Katakuri"],
  [/エドワード・ニューゲート/g, "Edward Newgate"],
  [/グロリオーサ/g, "Gloriosa"],
  [/シキ/g, "Shiki"],
  [/ミス・バッキンガム・ステューシー/g, "Miss Buckingham Stussy"],
  [/孫悟空/g, "Son Goku"],
  [/ゴクウブラック/g, "Goku Black"],
  [/超サイヤ人ロゼ/g, "Super Saiyan Rose"],
  [/超サイヤ人ベジット/g, "Super Saiyan Vegito"],
  [/ベジット/g, "Vegito"],
  [/クロロ/g, "Chrollo"],
  [/ネオン/g, "Neon"],
  [/パクノダ/g, "Pakunoda"],
  [/ウボォーギン/g, "Uvogin"],
  [/江戸川コナン/g, "Edogawa Conan"],
  [/毛利蘭/g, "Ran Mouri"],
  [/怪盗キッド/g, "Kaito Kid"],
  [/松田陣平/g, "Matsuda Jinpei"],
  [/萩原研二/g, "Hagiwara Kenji"],
  [/萩原千速/g, "Hagiwara Chihaya"],
  [/世良真純/g, "Sera Masumi"],
  [/横溝重悟/g, "Yokomizo Jugo"],
  [/ピカチュウ/g, "Pikachu"],
  [/プリン/g, "Jigglypuff"],
  [/ピッピ/g, "Clefairy"],
  [/ミュウ/g, "Mew"],
  [/ライチュウ/g, "Raichu"],
  [/マナフィ/g, "Manaphy"],
  [/ヒノアラシ/g, "Cyndaquil"],
  [/フォッコ/g, "Fennekin"],
  [/トガヒミコ/g, "Toga Himiko"],
  [/イギー/g, "Iggy"],
  [/ポチタ/g, "Pochita"],
  [/テレサ/g, "Boo"],
  [/はぐれメタル/g, "Metal Slime"],
  [/バブルスライム/g, "Bubble Slime"],
  [/メタルスライム/g, "Metal Slime"],
  [/スライム/g, "Slime"],
  [/ワドルディ/g, "Waddle Dee"],
];

function translateToKo(name: string): string {
  let result = name;
  for (const [pattern, replacement] of charJaToKo) {
    result = result.replace(pattern, replacement);
  }
  for (const [pattern, replacement] of jaToKo) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function translateToEn(name: string): string {
  let result = name;
  for (const [pattern, replacement] of charJaToEn) {
    result = result.replace(pattern, replacement);
  }
  for (const [pattern, replacement] of jaToEn) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function main() {
  const raw = readFileSync("data/dmm-all-arrival.json", "utf-8");
  const allPrizes: DmmPrize[] = JSON.parse(raw);

  // Deduplicate by prize_id
  const seen = new Set<number>();
  const unique: DmmPrize[] = [];
  for (const prize of allPrizes) {
    if (!seen.has(prize.prize_id)) {
      seen.add(prize.prize_id);
      unique.push(prize);
    }
  }

  // Filter out entries with null thumb_image
  const valid = unique.filter((p) => p.thumb_image != null);
  console.log(`Total: ${allPrizes.length}, Unique: ${unique.length}, Valid (with image): ${valid.length}`);

  const result: SyncEntry[] = valid.map((prize) => {
    const [datePart, timePart] = prize.import_date.split(" ");
    const time = timePart.substring(0, 5); // HH:mm

    const koTag = categoryTagKo[prize.category];
    const enTag = categoryTagEn[prize.category];

    const nameKo = `${koTag} ${translateToKo(prize.prize_name)}`;
    const nameEn = `${enTag} ${translateToEn(prize.prize_name)}`;

    return {
      nameJa: prize.prize_name,
      nameKo,
      nameEn,
      imageUrl: prize.thumb_image,
      date: datePart,
      time,
      sourceUrl: "https://onkure.dmm.com/arrival",
    };
  });

  writeFileSync("data/dmm-figures-final.json", JSON.stringify(result, null, 2), "utf-8");
  console.log(`Written ${result.length} entries to data/dmm-figures-final.json`);

  // Print a few samples
  console.log("\n--- Samples ---");
  for (let i = 0; i < 5; i++) {
    console.log(`\n[${i}]`);
    console.log(`  JA: ${result[i].nameJa}`);
    console.log(`  KO: ${result[i].nameKo}`);
    console.log(`  EN: ${result[i].nameEn}`);
    console.log(`  date: ${result[i].date} time: ${result[i].time}`);
  }
}

main();
