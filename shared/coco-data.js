/* COCODRONE 데모 공통 시드 데이터
 * - 4개 언어(ko/en/ja/es) 문구와 초기 콘텐츠.
 * - Coco.save() 로 저장한 내용은 localStorage에 보관되어 이 시드를 덮어쓴다(관리 기능을 붙일 때 사용).
 * - 대회명·일정·장소는 데모용 가칭이며 실제 정보로 교체해야 한다.
 */
(function () {
  var L = function (ko, en, ja, es) { return { ko: ko, en: en, ja: ja, es: es }; };

  var ui = {
    'nav.about': L('브랜드', 'Brand', 'ブランド', 'Marca'),
    'nav.competition': L('대회 소개', 'Competition', '大会紹介', 'Competición'),
    'nav.video': L('홍보 영상', 'Film', 'プロモーション映像', 'Vídeo'),
    'nav.products': L('제품', 'Products', '製品', 'Productos'),
    'nav.notice': L('공지사항', 'Notices', 'お知らせ', 'Avisos'),
    'nav.apply': L('참가 신청', 'Apply', '参加申込', 'Inscripción'),
    'nav.store': L('스마트스토어', 'Online Store', 'オンラインストア', 'Tienda online'),
    'nav.menu': L('메뉴', 'Menu', 'メニュー', 'Menú'),

    'cta.apply': L('대회 참가 신청하기', 'Apply for the competition', '大会に参加申込する', 'Inscribirse en la competición'),
    'cta.applyShort': L('참가 신청', 'Apply now', '参加申込', 'Inscribirse'),
    'cta.store': L('스마트스토어 바로가기', 'Visit the online store', 'オンラインストアへ', 'Ir a la tienda online'),
    'cta.buy': L('구매하기', 'Buy now', '購入する', 'Comprar'),
    'cta.more': L('자세히 보기', 'View more', '詳しく見る', 'Ver más'),
    'cta.viewAll': L('전체 제품 보기', 'View all products', 'すべての製品を見る', 'Ver todos los productos'),
    'cta.watch': L('영상 보기', 'Watch the film', '映像を見る', 'Ver el vídeo'),
    'cta.close': L('닫기', 'Close', '閉じる', 'Cerrar'),
    'cta.explore': L('둘러보기', 'Explore', '見てみる', 'Explorar'),
    'cta.top': L('맨 위로', 'Back to top', 'トップへ', 'Volver arriba'),

    'label.scroll': L('Scroll Down', 'Scroll Down', 'Scroll Down', 'Scroll Down'),
    'label.soundOn': L('소리 켜기', 'Sound on', '音声オン', 'Activar sonido'),
    'label.soundOff': L('소리 끄기', 'Sound off', '音声オフ', 'Silenciar'),
    'label.sample': L('데모용 예시 정보', 'Sample information for this demo', 'デモ用のサンプル情報', 'Información de ejemplo para esta demo'),
    'label.new': L('NEW', 'NEW', 'NEW', 'NUEVO'),
    'label.pinned': L('중요', 'Pinned', '重要', 'Fijado'),

    'comp.eyebrow': L('Competition', 'Competition', 'Competition', 'Competition'),
    'comp.infoTitle': L('대회 개요', 'Overview', '大会概要', 'Datos generales'),
    'comp.divisionTitle': L('참가 부문', 'Divisions', '参加部門', 'Categorías'),
    'comp.scheduleTitle': L('진행 순서', 'Schedule', 'スケジュール', 'Programa'),
    'comp.videoTitle': L('대회 홍보 영상', 'Competition film', '大会プロモーション映像', 'Vídeo de la competición'),

    'products.eyebrow': L('Products', 'Products', 'Products', 'Products'),
    'products.title': L('곤충부터 문화재까지, 23종의 종이드론', 'From insects to heritage, 23 paper drones', '昆虫から文化財まで、23種類のペーパードローン', 'De insectos a patrimonio, 23 drones de papel'),
    'products.sub': L('접착제 없이 끼워 조립하는 친환경 DIY 종이드론. 이미지를 누르면 구매 페이지로 이동합니다.', 'Eco-friendly DIY paper drones you slot together without glue. Tap an image to open the store page.', '接着剤を使わず、はめ込んで組み立てるエコなDIYペーパードローン。画像を押すと購入ページへ移動します。', 'Drones de papel ecológicos que se montan encajando piezas, sin pegamento. Toca una imagen para ir a la tienda.'),
    'products.featured': L('대표 제품', 'Featured', 'おすすめ製品', 'Destacados'),
    'products.all': L('전체', 'All', 'すべて', 'Todos'),
    'products.priceNote': L('가격은 스마트스토어에서 확인', 'See price in the store', '価格はストアでご確認ください', 'Consulta el precio en la tienda'),

    'notice.eyebrow': L('Notice', 'Notice', 'Notice', 'Notice'),
    'notice.title': L('대회 공지사항', 'Competition notices', '大会のお知らせ', 'Avisos de la competición'),
    'notice.empty': L('등록된 공지가 없습니다.', 'No notices yet.', 'お知らせはまだありません。', 'Aún no hay avisos.'),
    'notice.back': L('목록으로', 'Back to list', '一覧へ戻る', 'Volver a la lista'),

    'form.eyebrow': L('Apply', 'Apply', 'Apply', 'Apply'),
    'form.title': L('대회 참가 신청', 'Competition entry form', '大会参加申込', 'Formulario de inscripción'),
    'form.desc': L('로그인 없이 바로 신청할 수 있습니다. 접수 후 담당자가 입력하신 연락처로 안내드립니다.', 'No login needed. After you submit, our team will contact you using the details below.', 'ログイン不要でお申し込みいただけます。受付後、担当者よりご連絡いたします。', 'No hace falta iniciar sesión. Tras el envío, nuestro equipo se pondrá en contacto contigo.'),
    'form.name': L('이름', 'Name', 'お名前', 'Nombre'),
    'form.org': L('소속 (학교·기관)', 'School / organization', '所属（学校・団体）', 'Centro / organización'),
    'form.phone': L('연락처', 'Phone', '電話番号', 'Teléfono'),
    'form.email': L('이메일', 'Email', 'メールアドレス', 'Correo electrónico'),
    'form.division': L('참가 부문', 'Division', '参加部門', 'Categoría'),
    'form.divisionPlaceholder': L('부문을 선택하세요', 'Choose a division', '部門を選択してください', 'Elige una categoría'),
    'form.members': L('참가 인원', 'Team size', '参加人数', 'Participantes'),
    'form.message': L('문의·요청 사항', 'Message', 'お問い合わせ・ご要望', 'Mensaje'),
    'form.optional': L('선택', 'optional', '任意', 'opcional'),
    'form.agree': L('개인정보 수집·이용에 동의합니다. (대회 접수와 안내 목적으로만 사용)', 'I agree to the collection and use of my personal data, only for handling this entry.', '個人情報の収集・利用に同意します。（大会受付とご案内のためだけに使用します）', 'Acepto la recogida y el uso de mis datos personales, solo para gestionar esta inscripción.'),
    'form.submit': L('신청서 보내기', 'Send entry', '申込を送信する', 'Enviar inscripción'),
    'form.sending': L('보내는 중…', 'Sending…', '送信中…', 'Enviando…'),
    'form.successTitle': L('신청이 접수되었습니다', 'Your entry was received', 'お申し込みを受け付けました', 'Hemos recibido tu inscripción'),
    'form.successDesc': L('접수 번호를 확인해 주세요. 곧 담당자가 연락드립니다.', 'Please keep your entry number. We will be in touch soon.', '受付番号をご確認ください。担当者より追ってご連絡いたします。', 'Guarda tu número de inscripción. Te contactaremos pronto.'),
    'form.entryNo': L('접수 번호', 'Entry number', '受付番号', 'Número de inscripción'),
    'form.again': L('다른 신청서 작성', 'Submit another entry', '別の申込を作成', 'Enviar otra inscripción'),
    'form.errRequired': L('필수 항목을 입력해 주세요.', 'Please fill in the required fields.', '必須項目を入力してください。', 'Rellena los campos obligatorios.'),
    'form.errEmail': L('이메일 형식을 확인해 주세요.', 'Please check the email address.', 'メールアドレスの形式をご確認ください。', 'Revisa la dirección de correo.'),
    'form.errAgree': L('개인정보 수집·이용에 동의해 주세요.', 'Please agree to the personal data notice.', '個人情報の取り扱いに同意してください。', 'Debes aceptar el aviso de datos personales.'),

    'footer.company': L('(주)코코드론', 'COCODRONE Inc.', '（株）ココドローン', 'COCODRONE Inc.'),
    'footer.bizNo': L('사업자등록번호', 'Business registration no.', '事業者登録番号', 'N.º de registro mercantil'),
    'footer.office': L('사무실', 'Office', 'オフィス', 'Oficina'),
    'footer.contact': L('문의', 'Contact', 'お問い合わせ', 'Contacto'),
    'footer.rights': L('Copyright © COCODRONE Inc. All rights reserved.', 'Copyright © COCODRONE Inc. All rights reserved.', 'Copyright © COCODRONE Inc. All rights reserved.', 'Copyright © COCODRONE Inc. Todos los derechos reservados.'),
    'footer.demo': L('시안 확인용 데모입니다. 이미지와 영상은 AI로 생성했으며 대회 정보는 예시입니다.', 'This is a design demo. Images and videos are AI-generated and the competition details are samples.', 'デザイン確認用のデモです。画像と映像はAI生成で、大会情報はサンプルです。', 'Esta es una demo de diseño. Las imágenes y los vídeos están generados con IA y los datos de la competición son de ejemplo.')
  };

  var seed = {
    __v: 4,
    ui: ui,

    site: {
      brand: 'COCODRONE',
      storeUrl: 'https://smartstore.naver.com/cocodroneshop',
      tel: '+82 55-311-0098',
      email: 'cocodrone@naver.com',
      bizNo: '578-87-00988',
      address: L('경남 김해시 관동로 14 콘텐츠기업지원센터 506호', '#506, Content and Business Support Center, 14 Gwandong-ro, Gimhae-si, Gyeongsangnam-do, Korea', '韓国 慶尚南道 金海市 冠洞路14 コンテンツ企業支援センター506号', 'N.º 506, Content and Business Support Center, 14 Gwandong-ro, Gimhae-si, Gyeongsangnam-do, Corea'),
      slogan: L('드론으로 안전하고 재미있는 세상을 만들어갑니다.', 'We make the world safer and more fun with drones.', 'ドローンで、安全で楽しい世界をつくります。', 'Hacemos un mundo más seguro y divertido con drones.'),
      tagline: L('생각하는 모든 것이 드론이 된다', 'Everything you imagine becomes a drone', '思い描くものすべてがドローンになる', 'Todo lo que imaginas se convierte en un dron'),
      taglineEn: 'Paper, Play and Flight. COCODRONE.'
    },

    /* 브랜드 선언 문장 (인트로 다음 장면 / About 영역) */
    statements: [
      { id: 's1', text: L('우리의 시작은 종이 한 장이었습니다.\n가장 가볍고 안전한 재료로 드론을 다시 만드는 일', 'We started with a single sheet of paper.\nRebuilding the drone from the lightest, safest material', '私たちの始まりは一枚の紙でした。\nいちばん軽くて安全な素材で、ドローンをつくり直すこと', 'Empezamos con una sola hoja de papel.\nRehacer el dron con el material más ligero y seguro') },
      { id: 's2', text: L('직접 만들고, 직접 날리고, 함께 겨루는\n코코드론의 종이드론 대회가 열립니다.', 'Build it, fly it, and compete together.\nThe COCODRONE paper drone competition is here.', '自分でつくり、自分で飛ばし、みんなで競う。\nココドローンのペーパードローン大会が始まります。', 'Constrúyelo, hazlo volar y compite en equipo.\nLlega la competición de drones de papel de COCODRONE.') }
    ],

    why: {
      title: 'Why COCODRONE',
      body: [
        L('코코드론은 접착제 없이 끼워 조립하는\n친환경 DIY 종이드론을 만듭니다.\n손으로 조립하며 드론의 원리를 배웁니다.', 'COCODRONE makes eco-friendly DIY paper drones\nthat slot together without glue.\nYou learn how a drone works by building it by hand.', 'ココドローンは、接着剤を使わずに組み立てる\nエコなDIYペーパードローンをつくっています。\n手で組み立てながら、ドローンの仕組みを学べます。', 'COCODRONE fabrica drones de papel ecológicos\nque se montan encajando piezas, sin pegamento.\nAprendes cómo funciona un dron montándolo con las manos.'),
        L('곤충, 문화재, 동물까지.\n지역의 이야기와 문화를 담은 23종의 종이드론이\n교실과 대회장에서 날고 있습니다.', 'Insects, heritage sites, animals.\n23 paper drone models carrying local stories and culture\nare flying in classrooms and arenas.', '昆虫、文化財、動物まで。\n地域の物語と文化をのせた23種類のペーパードローンが\n教室と大会会場を飛んでいます。', 'Insectos, patrimonio, animales.\n23 modelos de drones de papel con historias y cultura local\nvuelan en aulas y pistas de competición.')
      ]
    },

    stats: [
      { id: 'st1', value: 23, suffix: '', label: L('종이드론 모델', 'Paper drone models', 'ペーパードローンの種類', 'Modelos de drones de papel') },
      { id: 'st2', value: 2018, suffix: '', label: L('설립 연도', 'Founded', '設立', 'Año de fundación') },
      { id: 'st3', value: 2023, suffix: '', label: L('첫 종이드론 대회', 'First paper drone competition', '初のペーパードローン大会', 'Primera competición') },
      { id: 'st4', value: 4, suffix: '', label: L('지원 언어', 'Languages', '対応言語', 'Idiomas') }
    ],

    competition: {
      sample: true,
      name: L('2026 코코드론 종이드론 챌린지', '2026 COCODRONE Paper Drone Challenge', '2026 ココドローン ペーパードローン・チャレンジ', '2026 COCODRONE Paper Drone Challenge'),
      nameEn: 'PAPER DRONE CHALLENGE',
      tagline: L('만들고, 날리고, 함께 겨루다', 'Build it. Fly it. Compete together.', 'つくって、飛ばして、みんなで競う', 'Constrúyelo. Hazlo volar. Compite en equipo.'),
      summary: L('직접 조립한 종이드론으로 겨루는 대회입니다. 처음 드론을 잡는 참가자도 안전하게 즐길 수 있도록 조립, 비행, 게임, 코딩 네 부문으로 진행합니다.', 'A competition flown with paper drones you build yourself. Four divisions, building, flying, games and coding, keep it safe and fun even for first-time pilots.', '自分で組み立てたペーパードローンで競う大会です。初めての方も安全に楽しめるよう、組立・飛行・ゲーム・コーディングの4部門で行います。', 'Una competición con drones de papel montados por los propios participantes. Cuatro categorías, montaje, vuelo, juegos y programación, para que también disfruten con seguridad quienes pilotan por primera vez.'),
      info: [
        { id: 'i1', label: L('일시', 'Date', '日時', 'Fecha'), value: L('2026년 11월 28일 (토) 10:00', 'Saturday, 28 November 2026, 10:00', '2026年11月28日（土）10:00', 'Sábado 28 de noviembre de 2026, 10:00') },
        { id: 'i2', label: L('장소', 'Venue', '会場', 'Lugar'), value: L('경상남도 김해 (장소 추후 공지)', 'Gimhae, Gyeongsangnam-do (venue to be announced)', '慶尚南道 金海（会場は後日お知らせ）', 'Gimhae, Gyeongsangnam-do (sede por anunciar)') },
        { id: 'i3', label: L('참가 대상', 'Who can join', '参加対象', 'Participantes'), value: L('초·중·고 학생 및 일반 (개인·팀)', 'Elementary to high school students and adults (solo or team)', '小・中・高校生および一般（個人・チーム）', 'Estudiantes de primaria a bachillerato y adultos (individual o equipo)') },
        { id: 'i4', label: L('접수 기간', 'Entry period', '受付期間', 'Plazo de inscripción'), value: L('2026.10.12 ~ 2026.11.14', '12 Oct – 14 Nov 2026', '2026.10.12 〜 2026.11.14', '12 oct – 14 nov 2026') }
      ],
      divisions: [
        { id: 'build', name: L('조립·비행', 'Build & Fly', '組立・飛行', 'Montaje y vuelo'), desc: L('현장에서 종이드론을 조립하고 정해진 코스를 비행합니다.', 'Build a paper drone on site, then fly the set course.', '会場でペーパードローンを組み立て、決められたコースを飛行します。', 'Monta un dron de papel en la sede y vuela el circuito marcado.') },
        { id: 'race', name: L('게이트 레이싱', 'Gate Racing', 'ゲートレーシング', 'Carrera de aros'), desc: L('후프 게이트를 통과하며 기록을 겨룹니다.', 'Race through hoop gates against the clock.', 'フープゲートを通過し、タイムを競います。', 'Atraviesa los aros contra el reloj.') },
        { id: 'game', name: L('드론 게임', 'Drone Games', 'ドローンゲーム', 'Juegos con drones'), desc: L('드론빙고, 드론 서바이벌, 드론 보물섬으로 팀 대결을 펼칩니다.', 'Team matches in Drone Bingo, Drone Survival and Drone Treasure Island.', 'ドローンビンゴ、ドローンサバイバル、ドローン宝島でチーム対決。', 'Duelos por equipos en Drone Bingo, Drone Survival y Drone Treasure Island.') },
        { id: 'code', name: L('코딩 미션', 'Coding Mission', 'コーディングミッション', 'Misión de programación'), desc: L('블록코딩으로 드론을 움직여 미션을 수행합니다.', 'Complete missions by flying the drone with block coding.', 'ブロックコーディングでドローンを動かし、ミッションに挑戦します。', 'Completa misiones moviendo el dron con programación por bloques.') }
      ],
      schedule: [
        { id: 'sc1', time: '09:30', title: L('참가자 등록', 'Check-in', '受付', 'Registro') },
        { id: 'sc2', time: '10:00', title: L('개회식·안전 교육', 'Opening and safety briefing', '開会式・安全講習', 'Apertura y charla de seguridad') },
        { id: 'sc3', time: '10:30', title: L('부문별 예선', 'Qualifying rounds', '部門別予選', 'Rondas clasificatorias') },
        { id: 'sc4', time: '13:30', title: L('본선·결선', 'Finals', '本選・決勝', 'Finales') },
        { id: 'sc5', time: '16:00', title: L('시상식', 'Awards', '表彰式', 'Entrega de premios') }
      ],
      video: { src: 'assets/video/comp-promo.mp4', poster: 'assets/img/a-compete.jpg', youtubeId: '' }
    },

    /* 대회를 소개하는 3개의 이야기 (데모 A의 Our Story, 데모 B의 핀 섹션 등) */
    stories: [
      { id: 'y1', eyebrow: 'The Challenge', title: L('누구나, 안전하게', 'Safe for everyone', 'だれでも、安全に', 'Seguro para todos'), titleEn: 'Safe for Everyone', body: L('종이로 만든 가벼운 기체.\n처음 드론을 잡는 아이도\n안전하게 참가합니다.', 'A light airframe made of paper.\nEven a child flying for the first time\ncan take part safely.', '紙でできた軽い機体。\n初めてドローンを手にする子どもも\n安心して参加できます。', 'Una estructura ligera hecha de papel.\nIncluso quien vuela por primera vez\npuede participar con seguridad.'), image: 'assets/img/a-story1.jpg' },
      { id: 'y2', eyebrow: 'The Challenge', title: L('만들고, 날리고', 'Build it, fly it', 'つくって、飛ばす', 'Constrúyelo y vuela'), titleEn: 'Build It, Fly It', body: L('직접 조립한 드론으로 겨룹니다.\n조립부터 비행까지,\n그 전부가 경기입니다.', 'You compete with a drone you built.\nFrom the first slot to the last landing,\nall of it is the game.', '自分で組み立てたドローンで競います。\n組立から飛行まで、\nそのすべてが競技です。', 'Compites con un dron que has montado tú.\nDel primer encaje al último aterrizaje,\ntodo forma parte de la prueba.'), image: 'assets/img/a-story2.jpg' },
      { id: 'y3', eyebrow: 'The Challenge', title: L('함께 즐기는 드론스포츠', 'Drone sports, together', 'みんなで楽しむドローンスポーツ', 'Deporte con drones, en equipo'), titleEn: 'Drone Sports, Together', body: L('드론빙고, 드론 서바이벌, 드론 보물섬.\n게임으로 배우고\n팀으로 즐깁니다.', 'Drone Bingo, Drone Survival, Drone Treasure Island.\nLearn through games\nand enjoy it as a team.', 'ドローンビンゴ、ドローンサバイバル、ドローン宝島。\nゲームで学び、\nチームで楽しみます。', 'Drone Bingo, Drone Survival, Drone Treasure Island.\nSe aprende jugando\ny se disfruta en equipo.'), image: 'assets/img/a-story3.jpg' }
    ],

    /* 경험/프로그램 4종 (데모 A의 Experience, 데모 B의 패널) */
    experiences: [
      { id: 'e1', key: 'MAKE', title: L('손으로 조립하는\n종이드론', 'A paper drone\nbuilt by hand', '手で組み立てる\nペーパードローン', 'Un dron de papel\nmontado a mano'), detail: L('접착제 없이 모듈화된 키트를 끼워 조립합니다.\n\n조립하는 동안 **드론의 구조와 비행 원리**를 자연스럽게 익힙니다.\n\n친환경 종이 소재로 가볍고 안전합니다.', 'Modular kits slot together without glue.\n\nWhile building, you naturally pick up **how a drone is structured and why it flies**.\n\nEco-friendly paper keeps it light and safe.', '接着剤を使わず、モジュール化されたキットをはめ込んで組み立てます。\n\n組み立てながら **ドローンの構造と飛ぶ仕組み** を自然に学べます。\n\n環境にやさしい紙素材で、軽くて安全です。', 'Los kits modulares se montan encajando piezas, sin pegamento.\n\nMientras lo montas aprendes **cómo es un dron por dentro y por qué vuela**.\n\nEl papel ecológico lo hace ligero y seguro.'), image: 'assets/img/a-make.jpg', video: 'assets/video/make.mp4' },
      { id: 'e2', key: 'FLY', title: L('게이트를 통과하는\n드론스포츠', 'Drone sports\nthrough the gates', 'ゲートをくぐる\nドローンスポーツ', 'Deporte con drones\na través de los aros'), detail: L('종이드론과 함께 쉽고 안전한 드론스포츠를 경험합니다.\n\n**드론빙고, 드론 서바이벌, 드론 보물섬** 등 다양한 게임을 운영합니다.\n\n2023년부터 종이드론 대회를 열어 왔습니다.', 'Easy, safe drone sports with paper drones.\n\nWe run games such as **Drone Bingo, Drone Survival and Drone Treasure Island**.\n\nWe have hosted paper drone competitions since 2023.', 'ペーパードローンで、やさしく安全なドローンスポーツを体験。\n\n**ドローンビンゴ、ドローンサバイバル、ドローン宝島** など多彩なゲームを運営しています。\n\n2023年からペーパードローン大会を開催しています。', 'Deporte con drones fácil y seguro, con drones de papel.\n\nOrganizamos juegos como **Drone Bingo, Drone Survival y Drone Treasure Island**.\n\nCelebramos competiciones de drones de papel desde 2023.'), image: 'assets/img/a-compete.jpg', video: 'assets/video/comp-promo.mp4' },
      { id: 'e3', key: 'CODE', title: L('블록으로 움직이는\n코딩드론', 'A coding drone\nmoved by blocks', 'ブロックで動かす\nコーディングドローン', 'Un dron programable\ncon bloques'), detail: L('세계 최초의 종이 DIY 코딩드론.\n\n**블록코딩 앱**으로 조종 경험이 없어도 원하는 대로 드론을 움직입니다.\n\n와이파이로 간편하게 연결합니다.', 'The world’s first DIY paper coding drone.\n\nWith a **block-coding app**, you can move the drone the way you want even without piloting experience.\n\nIt connects simply over Wi-Fi.', '世界初のDIYペーパーコーディングドローン。\n\n**ブロックコーディングアプリ** で、操縦経験がなくても思いどおりに動かせます。\n\nWi-Fiでかんたんに接続できます。', 'El primer dron de papel programable del mundo.\n\nCon una **app de programación por bloques** lo mueves como quieras aunque nunca hayas pilotado.\n\nSe conecta fácilmente por wifi.'), image: 'assets/img/a-code.jpg', video: 'assets/video/code.mp4' },
      { id: 'e4', key: 'TOGETHER', title: L('함께 올려다보는\n하늘', 'A sky\nwe look up at together', 'みんなで見上げる\n空', 'Un cielo\nque miramos juntos'), detail: L('학교, 지역 축제, 체험 행사까지.\n\n코코드론은 **드론 교육과 체험 프로그램**으로 더 많은 사람이 드론을 만나도록 돕습니다.\n\n대회는 그 경험이 모이는 자리입니다.', 'Schools, local festivals, hands-on events.\n\nThrough **drone classes and experience programs**, COCODRONE helps more people meet drones.\n\nThe competition is where those experiences come together.', '学校、地域のお祭り、体験イベントまで。\n\nココドローンは **ドローン教育と体験プログラム** で、より多くの人がドローンに出会えるよう支えています。\n\n大会は、その体験が集まる場所です。', 'Colegios, fiestas locales, talleres.\n\nCon **clases y programas de experiencia con drones**, COCODRONE acerca los drones a más personas.\n\nLa competición es donde se reúnen esas experiencias.'), image: 'assets/img/a-promise.jpg', video: 'assets/video/together.mp4' }
    ],

    categories: [
      { id: 'insect', name: L('곤충', 'Insects', '昆虫', 'Insectos') },
      { id: 'heritage', name: L('문화재', 'Heritage', '文化財', 'Patrimonio') },
      { id: 'animal', name: L('동물', 'Animals', '動物', 'Animales') },
      { id: 'coding', name: L('코딩드론', 'Coding drone', 'コーディングドローン', 'Dron programable') },
      { id: 'kit', name: L('교육용 키트', 'Classroom kits', '教育用キット', 'Kits para el aula') }
    ],

    products: [
      { id: 'p1', order: 1, featured: true, category: 'insect', name: L('무당벌레 종이드론', 'Ladybug Paper Drone', 'てんとう虫 ペーパードローン', 'Dron de papel Mariquita'), tag: L('가장 사랑받는 입문 키트', 'The best-loved starter kit', 'いちばん人気の入門キット', 'El kit de iniciación favorito'), desc: L('접착제 없이 끼워 조립하는 DIY 키트. 빨간 무당벌레 덮개로 아이들이 가장 먼저 고르는 모델입니다.', 'A DIY kit that slots together without glue. With its red ladybug shell, it is the model children pick first.', '接着剤なしで組み立てるDIYキット。赤いてんとう虫のカバーで、子どもたちが最初に選ぶモデルです。', 'Kit DIY que se monta sin pegamento. Con su caparazón rojo de mariquita, es el modelo que los niños eligen primero.'), image: 'assets/img/p-ladybug.jpg', hoverImage: 'assets/img/c-big1.jpg', wideImage: 'assets/img/c-big1.jpg', link: 'https://smartstore.naver.com/cocodroneshop' },
      { id: 'p2', order: 2, featured: true, category: 'coding', name: L('벚꽃 코딩드론', 'Cherry Blossom Coding Drone', '桜 コーディングドローン', 'Dron programable Flor de Cerezo'), tag: L('세계 최초 종이 DIY 코딩드론', 'World’s first DIY paper coding drone', '世界初のDIYペーパーコーディングドローン', 'El primer dron de papel programable'), desc: L('360도 회전, 고도 유지, 호버링 기능을 갖춘 코딩 입문용 드론. 블록코딩 앱으로 움직입니다.', 'A beginner coding drone with 360° flips, altitude hold and hovering, moved with a block-coding app.', '360度回転、高度維持、ホバリング機能を備えたコーディング入門用ドローン。ブロックコーディングアプリで動かします。', 'Dron de iniciación a la programación con giros de 360°, altitud fija y vuelo estacionario. Se mueve con una app de bloques.'), image: 'assets/img/p-cherry.jpg', hoverImage: 'assets/img/c-big3.jpg', wideImage: 'assets/img/c-big3.jpg', link: 'https://smartstore.naver.com/cocodroneshop' },
      { id: 'p3', order: 3, featured: true, category: 'heritage', name: L('거북선 종이드론', 'Turtle Ship Paper Drone', '亀甲船 ペーパードローン', 'Dron de papel Barco Tortuga'), tag: L('역사를 날리는 문화재 시리즈', 'Heritage series, history in flight', '歴史を飛ばす文化財シリーズ', 'Serie Patrimonio, historia en vuelo'), desc: L('거북선을 모티브로 한 문화재 시리즈. 역사 수업과 지역 행사에서 인기가 많습니다.', 'From our heritage series, inspired by the Korean turtle ship. Popular in history classes and local events.', '亀甲船をモチーフにした文化財シリーズ。歴史の授業や地域イベントで人気です。', 'De la serie Patrimonio, inspirado en el barco tortuga coreano. Muy popular en clases de historia y eventos locales.'), image: 'assets/img/p-turtleship.jpg', hoverImage: 'assets/img/l-turtleship.jpg', wideImage: 'assets/img/l-turtleship.jpg', link: 'https://smartstore.naver.com/cocodroneshop' },
      { id: 'p4', order: 4, featured: true, category: 'kit', name: L('단체 교육용 키트', 'Classroom Kit Set', '団体教育用キット', 'Kit para el aula'), tag: L('학교·기관 단체 수업용', 'For schools and group classes', '学校・団体の授業用', 'Para colegios y grupos'), desc: L('학급 단위 수업과 대회 준비에 맞춘 단체 구성. 수량과 구성은 스마트스토어에서 확인하세요.', 'A group set for whole-class lessons and competition practice. See quantities and contents in the store.', 'クラス単位の授業や大会準備に合わせた団体セット。数量と内容はストアでご確認ください。', 'Un lote para clases completas y para preparar la competición. Consulta cantidades y contenido en la tienda.'), image: 'assets/img/c-big2.jpg', hoverImage: 'assets/img/c-big2.jpg', wideImage: 'assets/img/c-big2.jpg', link: 'https://smartstore.naver.com/cocodroneshop' },
      { id: 'p5', order: 5, featured: false, category: 'insect', name: L('꿀벌 종이드론', 'Honeybee Paper Drone', 'ミツバチ ペーパードローン', 'Dron de papel Abeja'), tag: L('', '', '', ''), desc: L('벌집 무늬 덮개와 날개가 특징인 곤충 시리즈.', 'Insect series with a honeycomb shell and wings.', 'ハチの巣模様のカバーと羽が特徴の昆虫シリーズ。', 'Serie Insectos, con caparazón de panal y alas.'), image: 'assets/img/p-bee.jpg', hoverImage: 'assets/img/l-bee.jpg', wideImage: '', link: 'https://smartstore.naver.com/cocodroneshop' },
      { id: 'p6', order: 6, featured: false, category: 'insect', name: L('반딧불 종이드론', 'Firefly Paper Drone', 'ホタル ペーパードローン', 'Dron de papel Luciérnaga'), tag: L('', '', '', ''), desc: L('연두색 덮개의 곤충 시리즈.', 'Insect series with a lime-green shell.', '黄緑色のカバーの昆虫シリーズ。', 'Serie Insectos, con caparazón verde lima.'), image: 'assets/img/p-firefly.jpg', hoverImage: 'assets/img/l-firefly.jpg', wideImage: '', link: 'https://smartstore.naver.com/cocodroneshop' },
      { id: 'p7', order: 7, featured: false, category: 'heritage', name: L('첨성대 종이드론', 'Cheomseongdae Paper Drone', '瞻星台 ペーパードローン', 'Dron de papel Cheomseongdae'), tag: L('', '', '', ''), desc: L('신라의 천문대 첨성대를 담은 문화재 시리즈.', 'Heritage series featuring Cheomseongdae, the Silla-era observatory.', '新羅の天文台・瞻星台をのせた文化財シリーズ。', 'Serie Patrimonio, con Cheomseongdae, el observatorio de Silla.'), image: 'assets/img/p-cheomseongdae.jpg', hoverImage: 'assets/img/l-cheomseongdae.jpg', wideImage: '', link: 'https://smartstore.naver.com/cocodroneshop' },
      { id: 'p8', order: 8, featured: false, category: 'animal', name: L('호랑이 종이드론', 'Tiger Paper Drone', 'トラ ペーパードローン', 'Dron de papel Tigre'), tag: L('', '', '', ''), desc: L('민화 속 호랑이를 닮은 동물 시리즈.', 'Animal series, inspired by the tiger of Korean folk painting.', '民画のトラをモチーフにした動物シリーズ。', 'Serie Animales, inspirado en el tigre de la pintura popular coreana.'), image: 'assets/img/p-tiger.jpg', hoverImage: 'assets/img/l-tiger.jpg', wideImage: '', link: 'https://smartstore.naver.com/cocodroneshop' },
      { id: 'p9', order: 9, featured: false, category: 'animal', name: L('고래 종이드론', 'Whale Paper Drone', 'クジラ ペーパードローン', 'Dron de papel Ballena'), tag: L('', '', '', ''), desc: L('푸른 고래 덮개의 동물 시리즈.', 'Animal series with a deep blue whale shell.', '青いクジラのカバーの動物シリーズ。', 'Serie Animales, con caparazón de ballena azul.'), image: 'assets/img/p-whale.jpg', hoverImage: 'assets/img/l-whale.jpg', wideImage: '', link: 'https://smartstore.naver.com/cocodroneshop' },
      { id: 'p10', order: 10, featured: false, category: 'insect', name: L('장수풍뎅이 종이드론', 'Rhinoceros Beetle Paper Drone', 'カブトムシ ペーパードローン', 'Dron de papel Escarabajo Rinoceronte'), tag: L('', '', '', ''), desc: L('긴 뿔 덮개가 특징인 곤충 시리즈.', 'Insect series with a long-horned shell.', '長い角のカバーが特徴の昆虫シリーズ。', 'Serie Insectos, con caparazón de cuerno largo.'), image: 'assets/img/p-beetle.jpg', hoverImage: 'assets/img/l-beetle.jpg', wideImage: '', link: 'https://smartstore.naver.com/cocodroneshop' },
      { id: 'p11', order: 11, featured: false, category: 'animal', name: L('용 종이드론', 'Dragon Paper Drone', '龍 ペーパードローン', 'Dron de papel Dragón'), tag: L('', '', '', ''), desc: L('전통 문양의 용을 담은 동물 시리즈.', 'Animal series featuring a dragon in traditional patterns.', '伝統文様の龍をのせた動物シリーズ。', 'Serie Animales, con un dragón de motivos tradicionales.'), image: 'assets/img/p-dragon.jpg', hoverImage: 'assets/img/l-dragon.jpg', wideImage: '', link: 'https://smartstore.naver.com/cocodroneshop' },
      { id: 'p12', order: 12, featured: false, category: 'heritage', name: L('다보탑 종이드론', 'Dabotap Paper Drone', '多宝塔 ペーパードローン', 'Dron de papel Dabotap'), tag: L('', '', '', ''), desc: L('불국사 다보탑을 담은 문화재 시리즈.', 'Heritage series featuring Dabotap, the pagoda of Bulguksa Temple.', '仏国寺の多宝塔をのせた文化財シリーズ。', 'Serie Patrimonio, con Dabotap, la pagoda del templo Bulguksa.'), image: 'assets/img/p-dabotap.jpg', hoverImage: 'assets/img/l-dabotap.jpg', wideImage: '', link: 'https://smartstore.naver.com/cocodroneshop' }
    ],

    notices: [
      { id: 'n1', date: '2026-10-01', pinned: true, title: L('2026 종이드론 챌린지 참가 접수 안내', 'Entries open for the 2026 Paper Drone Challenge', '2026 ペーパードローン・チャレンジ 参加受付のご案内', 'Abierta la inscripción para el Paper Drone Challenge 2026'), body: L('참가 접수는 이 페이지의 참가 신청 양식으로 받습니다. 로그인은 필요하지 않습니다.\n\n접수 기간: 2026.10.12 ~ 2026.11.14\n접수 후 3일 이내에 담당자가 연락드립니다.', 'Entries are taken through the form on this page. No login is needed.\n\nEntry period: 12 Oct – 14 Nov 2026\nOur team will contact you within three days.', '参加受付は、このページの参加申込フォームで行います。ログインは必要ありません。\n\n受付期間：2026.10.12 〜 2026.11.14\n受付後3日以内に担当者よりご連絡いたします。', 'La inscripción se hace con el formulario de esta página. No hace falta iniciar sesión.\n\nPlazo: 12 oct – 14 nov 2026\nNuestro equipo te contactará en un máximo de tres días.') },
      { id: 'n2', date: '2026-09-24', pinned: false, title: L('부문별 경기 규정 안내', 'Rules for each division', '部門別競技規定のご案内', 'Reglamento por categorías'), body: L('조립·비행, 게이트 레이싱, 드론 게임, 코딩 미션 네 부문의 규정을 공개합니다.\n\n모든 부문은 대회 공식 종이드론 기체로 진행합니다.', 'Rules for the four divisions, Build & Fly, Gate Racing, Drone Games and Coding Mission, are now available.\n\nAll divisions are flown with the official paper drone airframe.', '組立・飛行、ゲートレーシング、ドローンゲーム、コーディングミッションの4部門の規定を公開します。\n\nすべての部門は大会公式のペーパードローン機体で行います。', 'Ya está disponible el reglamento de las cuatro categorías: Montaje y vuelo, Carrera de aros, Juegos con drones y Misión de programación.\n\nTodas se disputan con el dron de papel oficial.') },
      { id: 'n3', date: '2026-09-15', pinned: false, title: L('연습용 키트 구매 안내', 'Where to buy practice kits', '練習用キットのご購入について', 'Dónde comprar kits de práctica'), body: L('대회 연습용 종이드론 키트는 스마트스토어에서 구매할 수 있습니다.\n\n단체 구매는 문의해 주세요.', 'Practice paper drone kits are available in our online store.\n\nPlease contact us for group orders.', '大会練習用のペーパードローンキットはオンラインストアでご購入いただけます。\n\n団体購入はお問い合わせください。', 'Los kits de práctica están disponibles en nuestra tienda online.\n\nPara pedidos de grupo, escríbenos.') },
      { id: 'n4', date: '2026-09-02', pinned: false, title: L('자주 묻는 질문', 'Frequently asked questions', 'よくあるご質問', 'Preguntas frecuentes'), body: L('Q. 드론을 처음 다뤄도 참가할 수 있나요?\nA. 네. 현장에서 조립과 조종 방법을 안내합니다.\n\nQ. 개인 기체를 가져와도 되나요?\nA. 부문별 규정을 확인해 주세요.', 'Q. Can I join if I have never flown a drone?\nA. Yes. We show you how to build and fly on site.\n\nQ. Can I bring my own drone?\nA. Please check the rules for your division.', 'Q. ドローンが初めてでも参加できますか？\nA. はい。会場で組立と操縦方法をご案内します。\n\nQ. 自分の機体を持ち込めますか？\nA. 部門別の規定をご確認ください。', 'P. ¿Puedo participar si nunca he pilotado un dron?\nR. Sí. En la sede te enseñamos a montarlo y a volarlo.\n\nP. ¿Puedo llevar mi propio dron?\nR. Consulta el reglamento de tu categoría.') }
    ]
  };

  window.COCO_SEED = seed;
})();
