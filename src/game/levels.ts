/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelDefinition, PieceInfo, PieceType } from './types';

export const PIECE_CATALOG: Record<PieceType, PieceInfo> = {
  LONG_PLANK: {
    type: 'LONG_PLANK',
    name: 'Uzun Tahta',
    shortDesc: 'Geniş açıklıkları bağlar, rampa ve su oluğu yapar',
    width: 140,
    height: 16,
    color: '#d97706',
    iconType: 'long_plank',
  },
  SHORT_PLANK: {
    type: 'SHORT_PLANK',
    name: 'Kısa Tahta',
    shortDesc: 'Dar boşluklar ve su saptırma için ideal',
    width: 80,
    height: 16,
    color: '#b45309',
    iconType: 'short_plank',
  },
  VERTICAL_POST: {
    type: 'VERTICAL_POST',
    name: 'Dikey Direk',
    shortDesc: 'Yüksek destek sağlar, kütükleri durdurur',
    width: 20,
    height: 90,
    color: '#78350f',
    iconType: 'vertical_post',
  },
  ROUND_LOG: {
    type: 'ROUND_LOG',
    name: 'Yuvarlak Kütük',
    shortDesc: 'Eğimde yuvarlanır, kaldıraçları tetikler',
    width: 34,
    height: 34,
    radius: 17,
    color: '#92400e',
    iconType: 'round_log',
  },
  INCLINE_RAMP: {
    type: 'INCLINE_RAMP',
    name: 'Eğik Rampa',
    shortDesc: 'Suya ve nesnelere yüksek ivme kazandırır',
    width: 110,
    height: 22,
    color: '#ea580c',
    iconType: 'incline_ramp',
  },
  WATER_WHEEL: {
    type: 'WATER_WHEEL',
    name: 'Döner Çark',
    shortDesc: 'Su akışıyla döner, kinetik enerji üretir',
    width: 76,
    height: 76,
    radius: 38,
    color: '#ca8a04',
    iconType: 'water_wheel',
  },
  PLATFORM: {
    type: 'PLATFORM',
    name: 'Platform',
    shortDesc: 'Nesnelerin düz ve sabit durmasını sağlar',
    width: 110,
    height: 18,
    color: '#a16207',
    iconType: 'platform',
  },
  SEESAW: {
    type: 'SEESAW',
    name: 'Denge Kaldıracı',
    shortDesc: 'İki kefeli tahterevalli, ağırlıkla kapıları açar',
    width: 130,
    height: 14,
    color: '#854d0e',
    iconType: 'seesaw',
  },
  HINGED_GATE: {
    type: 'HINGED_GATE',
    name: 'Hareketli Kapı',
    shortDesc: 'Suyu veya kütüğü tutar, tetiklenince açılır',
    width: 16,
    height: 75,
    color: '#713f12',
    iconType: 'hinged_gate',
  },
  LOCK_PIN: {
    type: 'LOCK_PIN',
    name: 'Kilitleme Pimi',
    shortDesc: 'Mekanizmayı istenilen anda durdurur',
    width: 16,
    height: 40,
    color: '#65a30d',
    iconType: 'lock_pin',
  },
};

export const LEVELS: LevelDefinition[] = [
  // ==========================================
  // BÖLÜM 1: İLK ŞELALE
  // ==========================================
  {
    id: 1,
    title: 'İlk Şelale',
    subtitle: 'DEĞİRMENİ ÇALIŞTIR',
    description: 'Suyu sol üstteki şelaleden sağdaki ahşap su değirmenine ulaştır ve çarkı 8 tur döndür.',
    availablePieces: {
      LONG_PLANK: 2,
      SHORT_PLANK: 1,
    },
    waterSource: {
      x: 70,
      y: 110,
      vx: 45,
      vy: 10,
      rate: 32,
    },
    mills: [
      {
        id: 'mill_1',
        x: 385,
        y: 470,
        radius: 42,
        requiredTurns: 8,
        currentTurns: 0,
        angle: 0,
        angularVelocity: 0,
        paddles: 8,
      },
    ],
    bells: [],
    rocks: [
      { x: 0, y: 90, width: 85, height: 50, label: 'Kaynak Kayası' },
      { x: 190, y: 260, width: 75, height: 45, label: 'Orta Kaya' },
      { x: 340, y: 520, width: 140, height: 200, label: 'Değirmen Temeli' },
      { x: 0, y: 640, width: 340, height: 80, label: 'Nehir Yatağı' },
    ],
    guideSlots: [
      { x: 140, y: 195, angle: 26, type: 'LONG_PLANK', label: '1. Rampa' },
      { x: 285, y: 325, angle: 28, type: 'LONG_PLANK', label: '2. Oluk' },
    ],
    hints: [
      'Uzun tahtayı sol şelalenin hemen altına, hafif sağa eğik (yaklaşık 25°) yerleştir.',
      'İkinci tahtayı orta kayanın yanından değirmen çarkının üst kanatlarına su dökecek şekilde hizala.',
    ],
    goal: {
      type: 'SPIN_MILL',
      title: 'Değirmeni Çalıştır',
      description: 'Çarkı en az 8 tur döndür.',
      targetCount: 8,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 2,
  },

  // ==========================================
  // BÖLÜM 2: YUVARLANAN KÜTÜK
  // ==========================================
  {
    id: 2,
    title: 'Yuvarlanan Kütük',
    subtitle: 'PİRİNÇ ÇANA VUR',
    description: 'Kütüğü uçurumdan aşağı düşürmeden sağdaki altın çana yönlendiren bir rampa köprüsü inşa et.',
    availablePieces: {
      ROUND_LOG: 1,
      LONG_PLANK: 2,
      INCLINE_RAMP: 1,
      SHORT_PLANK: 1,
    },
    mills: [],
    bells: [
      {
        id: 'bell_1',
        x: 420,
        y: 430,
        radius: 20,
        hit: false,
        swingAngle: 0,
      },
    ],
    rocks: [
      { x: 0, y: 160, width: 120, height: 560, label: 'Başlangıç Tepesi' },
      { x: 370, y: 460, width: 110, height: 260, label: 'Çan Kulesi' },
      { x: 120, y: 680, width: 250, height: 40, label: 'Dip Uçurum' },
    ],
    guideSlots: [
      { x: 60, y: 138, angle: 0, type: 'ROUND_LOG', label: 'Kütük Başlangıç' },
      { x: 180, y: 240, angle: 32, type: 'LONG_PLANK', label: 'İniş Rampası' },
      { x: 310, y: 360, angle: 22, type: 'LONG_PLANK', label: 'Köprü' },
    ],
    hints: [
      'Önce kütüğü sol tepeye yerleştir.',
      'Uzun tahtaları birbirine ekleyerek kütüğün çukura düşmeden doğrudan altın çana yuvarlanmasını sağla.',
    ],
    goal: {
      type: 'RING_BELL',
      title: 'Pirinç Çanı Çal',
      description: 'Kütüğü çana çarptırarak sesi duy!',
      targetCount: 1,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 3,
  },

  // ==========================================
  // BÖLÜM 3: KALDIRAÇ VE SU KAPISI
  // ==========================================
  {
    id: 3,
    title: 'Kaldıraç & Su Kapısı',
    subtitle: 'KAPIYI AÇ VE DEĞİRMENİ DÖNDÜR',
    description: 'Kütük ile tahterevallinin sol ucuna basarak su kapısının mandalını kaldır; serbest kalan su değirmeni çalıştırsın!',
    availablePieces: {
      ROUND_LOG: 1,
      LONG_PLANK: 2,
      SHORT_PLANK: 1,
    },
    waterSource: {
      x: 75,
      y: 130,
      vx: 40,
      vy: 10,
      rate: 34,
    },
    mills: [
      {
        id: 'mill_3',
        x: 390,
        y: 490,
        radius: 40,
        requiredTurns: 8,
        currentTurns: 0,
        angle: 0,
        angularVelocity: 0,
        paddles: 8,
      },
    ],
    bells: [],
    seesaws: [
      {
        id: 'seesaw_1',
        pivotX: 200,
        pivotY: 340,
        length: 130,
        angle: -0.15,
        angularVelocity: 0,
        minAngle: -0.3,
        maxAngle: 0.35,
        leftWeight: 0,
        rightWeight: 0,
      },
    ],
    gates: [
      {
        id: 'gate_1',
        pivotX: 280,
        pivotY: 190,
        length: 80,
        angle: 0,
        isOpen: false,
        linkedTriggerId: 'seesaw_1',
      },
    ],
    rocks: [
      { x: 0, y: 110, width: 80, height: 60 },
      { x: 260, y: 170, width: 30, height: 25 },
      { x: 185, y: 340, width: 30, height: 70 },
      { x: 330, y: 540, width: 150, height: 180 },
    ],
    guideSlots: [
      { x: 100, y: 220, angle: 35, type: 'SHORT_PLANK', label: 'Kütük Yolu' },
      { x: 70, y: 180, angle: 0, type: 'ROUND_LOG', label: 'Kütük' },
      { x: 330, y: 330, angle: 30, type: 'LONG_PLANK', label: 'Su Kanalı' },
    ],
    hints: [
      'Kütüğü sol yukarıdan kaldıracın sol kolunun tam üstüne düşecek şekilde yönlendir.',
      'Kaldıraç sola yatınca su kapısının kilidi açılacak!',
      'Kapının arkasından akacak suyu değirmene taşımak için sağ tarafa bir uzun tahta yerleştir.',
    ],
    goal: {
      type: 'SPIN_MILL',
      title: 'Değirmeni Çalıştır',
      description: 'Kapıyı aç ve çarkı 8 tur döndür.',
      targetCount: 8,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 3,
  },

  // ==========================================
  // BÖLÜM 4: İKİZ DEĞİRMENLER
  // ==========================================
  {
    id: 4,
    title: 'İkiz Değirmenler',
    subtitle: 'HER İKİ ÇARKI DA DÖNDÜR',
    description: 'Merkezi şelale akışını ikiye ayırarak sol ve sağ vadideki değirmenleri aynı anda en az 6şar tur döndür.',
    availablePieces: {
      LONG_PLANK: 2,
      SHORT_PLANK: 2,
      INCLINE_RAMP: 1,
    },
    waterSource: {
      x: 240,
      y: 90,
      vx: 0,
      vy: 30,
      rate: 36,
    },
    mills: [
      {
        id: 'mill_left',
        x: 80,
        y: 460,
        radius: 38,
        requiredTurns: 6,
        currentTurns: 0,
        angle: 0,
        angularVelocity: 0,
        paddles: 8,
      },
      {
        id: 'mill_right',
        x: 400,
        y: 460,
        radius: 38,
        requiredTurns: 6,
        currentTurns: 0,
        angle: 0,
        angularVelocity: 0,
        paddles: 8,
      },
    ],
    bells: [],
    rocks: [
      { x: 210, y: 60, width: 60, height: 40 },
      { x: 0, y: 510, width: 140, height: 210 },
      { x: 340, y: 510, width: 140, height: 210 },
      { x: 190, y: 620, width: 100, height: 100 },
    ],
    guideSlots: [
      { x: 190, y: 220, angle: -25, type: 'SHORT_PLANK', label: 'Sol Kol' },
      { x: 290, y: 220, angle: 25, type: 'SHORT_PLANK', label: 'Sağ Kol' },
      { x: 120, y: 340, angle: -30, type: 'LONG_PLANK', label: 'Sol İletim' },
      { x: 360, y: 340, angle: 30, type: 'LONG_PLANK', label: 'Sağ İletim' },
    ],
    hints: [
      'Suyu tam ortadan ikiye bölmek için iki kısa tahtayı çatı (ters V) şeklinde suyun döküldüğü yere koy.',
      'Ardından sola ve sağa akan kolları uzun tahtalarla aşağıdaki değirmenlere ulaştır.',
    ],
    goal: {
      type: 'DUAL_MILLS',
      title: 'İkiz Değirmenleri Çalıştır',
      description: 'Her iki değirmeni en az 6şar tur döndür.',
      targetCount: 12,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 4,
  },

  // ==========================================
  // BÖLÜM 5: KAYA VADİSİ SU KEMERİ
  // ==========================================
  {
    id: 5,
    title: 'Kaya Vadisi',
    subtitle: 'YÜKSEK SU KEMERİ KUR',
    description: 'Sarp kayalıkların üzerinden tahta su kemeri kurarak suyu en alt sağ köşedeki değirmene aktar.',
    availablePieces: {
      LONG_PLANK: 3,
      VERTICAL_POST: 2,
      SHORT_PLANK: 1,
    },
    waterSource: {
      x: 60,
      y: 90,
      vx: 30,
      vy: 10,
      rate: 34,
    },
    mills: [
      {
        id: 'mill_5',
        x: 410,
        y: 530,
        radius: 40,
        requiredTurns: 8,
        currentTurns: 0,
        angle: 0,
        angularVelocity: 0,
        paddles: 8,
      },
    ],
    bells: [],
    rocks: [
      { x: 0, y: 70, width: 75, height: 50 },
      { x: 140, y: 280, width: 60, height: 350 },
      { x: 280, y: 320, width: 55, height: 320 },
      { x: 360, y: 580, width: 120, height: 140 },
    ],
    guideSlots: [
      { x: 125, y: 170, angle: 22, type: 'LONG_PLANK', label: '1. Kemer Parçası' },
      { x: 250, y: 260, angle: 24, type: 'LONG_PLANK', label: '2. Kemer Parçası' },
      { x: 360, y: 380, angle: 35, type: 'LONG_PLANK', label: '3. İniş Oluğu' },
    ],
    hints: [
      'Kayaların üzerinden geçecek şekilde 3 uzun tahtayı ardışık bir su kanalı oluşturacak gibi diz.',
      'Suyu doğrudan değirmenin üstüne akıtarak maksimum hızda dönmesini sağla.',
    ],
    goal: {
      type: 'SPIN_MILL',
      title: 'Değirmeni Çalıştır',
      description: 'Çarkı en az 8 tur döndür.',
      targetCount: 8,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 3,
  },

  // ==========================================
  // BÖLÜM 6: DENGE AĞIRLIĞI VE KÖPRÜ
  // ==========================================
  {
    id: 6,
    title: 'Denge Asma Köprüsü',
    subtitle: 'KÖPRÜYÜ DOLDUR, ÇANI ÇAL',
    description: 'Su kaldıracın sağ ucunu doldurarak dengeli bir köprü oluştursun, kütük köprüden kayıp çana çarpsın!',
    availablePieces: {
      ROUND_LOG: 1,
      LONG_PLANK: 2,
      SHORT_PLANK: 1,
      INCLINE_RAMP: 1,
    },
    waterSource: {
      x: 320,
      y: 90,
      vx: 10,
      vy: 10,
      rate: 30,
    },
    bells: [
      {
        id: 'bell_6',
        x: 420,
        y: 470,
        radius: 20,
        hit: false,
        swingAngle: 0,
      },
    ],
    mills: [],
    seesaws: [
      {
        id: 'seesaw_bridge',
        pivotX: 250,
        pivotY: 340,
        length: 140,
        angle: -0.25,
        angularVelocity: 0,
        minAngle: -0.28,
        maxAngle: 0.18,
        leftWeight: 0,
        rightWeight: 0,
      },
    ],
    rocks: [
      { x: 0, y: 200, width: 100, height: 520 },
      { x: 235, y: 340, width: 30, height: 60 },
      { x: 370, y: 500, width: 110, height: 220 },
    ],
    guideSlots: [
      { x: 50, y: 175, angle: 0, type: 'ROUND_LOG', label: 'Kütük Yuvası' },
      { x: 145, y: 275, angle: 30, type: 'LONG_PLANK', label: 'Giriş Rampası' },
      { x: 350, y: 410, angle: 25, type: 'LONG_PLANK', label: 'Çan Rampası' },
    ],
    hints: [
      'Su şelalesi doğrudan tahterevallinin sağ koluna dökülsün.',
      'Su ağırlığıyla tahterevalli düzleşince kütük köprü gibi üzerinden geçip çana ulaşacak!',
    ],
    goal: {
      type: 'RING_BELL',
      title: 'Çanı Çal',
      description: 'Kütüğü çana ulaştır.',
      targetCount: 1,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 3,
  },

  // ==========================================
  // BÖLÜM 7: ÇAN KULESİ RAMPASI
  // ==========================================
  {
    id: 7,
    title: 'Çan Kulesi Rampası',
    subtitle: 'YÜKSEK HIZ VE TRAMBOLİN',
    description: 'Kütüğü dik bir eğik rampadan fırlatarak aşağıdaki çukurdan yukarıdaki altın çana ulaştır.',
    availablePieces: {
      ROUND_LOG: 1,
      INCLINE_RAMP: 2,
      LONG_PLANK: 1,
      SHORT_PLANK: 1,
    },
    mills: [],
    bells: [
      {
        id: 'bell_7',
        x: 410,
        y: 280,
        radius: 20,
        hit: false,
        swingAngle: 0,
      },
    ],
    rocks: [
      { x: 0, y: 130, width: 90, height: 590 },
      { x: 360, y: 310, width: 120, height: 410 },
      { x: 90, y: 640, width: 270, height: 80 },
    ],
    guideSlots: [
      { x: 50, y: 105, angle: 0, type: 'ROUND_LOG', label: 'Kütük' },
      { x: 140, y: 220, angle: 45, type: 'INCLINE_RAMP', label: 'Hız İnişi' },
      { x: 260, y: 450, angle: -25, type: 'LONG_PLANK', label: 'Fırlatma Rampası' },
    ],
    hints: [
      'Kütüğü sol zirveden başlat.',
      'Eğik rampa ile kütüğe yüksek ivme kazandır, alt rampayı hafif yukarı dönük açıyla ayarla ki kütük yukarıdaki çana çarpsın!',
    ],
    goal: {
      type: 'RING_BELL',
      title: 'Çanı Çal',
      description: 'Kütüğü fırlatarak çana vurdur.',
      targetCount: 1,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 3,
  },

  // ==========================================
  // BÖLÜM 8: ZİKZAK SU YOLU
  // ==========================================
  {
    id: 8,
    title: 'Zikzak Su Yolu',
    subtitle: 'DAR KANYONDA DÖNÜŞLER',
    description: 'Suyu dar dağ yarığında zikzaklar çizdirerek sağ alttaki değirmene ulaştır ve çarkı 10 tur döndür.',
    availablePieces: {
      LONG_PLANK: 3,
      SHORT_PLANK: 2,
    },
    waterSource: {
      x: 90,
      y: 90,
      vx: 30,
      vy: 10,
      rate: 35,
    },
    mills: [
      {
        id: 'mill_8',
        x: 390,
        y: 530,
        radius: 40,
        requiredTurns: 10,
        currentTurns: 0,
        angle: 0,
        angularVelocity: 0,
        paddles: 8,
      },
    ],
    bells: [],
    rocks: [
      { x: 0, y: 70, width: 100, height: 40 },
      { x: 380, y: 180, width: 100, height: 120 },
      { x: 0, y: 320, width: 110, height: 130 },
      { x: 330, y: 580, width: 150, height: 140 },
    ],
    guideSlots: [
      { x: 190, y: 170, angle: 25, type: 'LONG_PLANK', label: '1. Kademe' },
      { x: 260, y: 290, angle: -24, type: 'LONG_PLANK', label: '2. Kademe' },
      { x: 220, y: 430, angle: 26, type: 'LONG_PLANK', label: '3. Kademe' },
    ],
    hints: [
      'Birinci tahtayı sağa eğimli, ikinci tahtayı sola eğimli, üçüncü tahtayı tekrar sağa eğimli yerleştir.',
      'Su dökülürken dışarı taşmaması için uçları hafifçe bindir.',
    ],
    goal: {
      type: 'SPIN_MILL',
      title: 'Değirmeni Çalıştır',
      description: 'Zikzak akışla çarkı 10 tur döndür.',
      targetCount: 10,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 3,
  },

  // ==========================================
  // BÖLÜM 9: ÇİFTE KÜTÜKLER
  // ==========================================
  {
    id: 9,
    title: 'Çifte Kütükler',
    subtitle: 'AYNI ANDA İKİ HEDEF',
    description: 'İki kütüğü ayrı yollara yönlendirerek biri soldaki, diğeri sağdaki çana aynı anda çarpsın.',
    availablePieces: {
      ROUND_LOG: 2,
      LONG_PLANK: 2,
      SHORT_PLANK: 2,
      INCLINE_RAMP: 1,
    },
    mills: [],
    bells: [
      {
        id: 'bell_9_left',
        x: 70,
        y: 490,
        radius: 20,
        hit: false,
        swingAngle: 0,
      },
      {
        id: 'bell_9_right',
        x: 410,
        y: 490,
        radius: 20,
        hit: false,
        swingAngle: 0,
      },
    ],
    rocks: [
      { x: 190, y: 110, width: 100, height: 50 },
      { x: 0, y: 530, width: 120, height: 190 },
      { x: 360, y: 530, width: 120, height: 190 },
      { x: 170, y: 640, width: 140, height: 80 },
    ],
    guideSlots: [
      { x: 220, y: 85, angle: 0, type: 'ROUND_LOG', label: 'Kütük 1' },
      { x: 260, y: 85, angle: 0, type: 'ROUND_LOG', label: 'Kütük 2' },
      { x: 140, y: 290, angle: -30, type: 'LONG_PLANK', label: 'Sol Kol' },
      { x: 340, y: 290, angle: 30, type: 'LONG_PLANK', label: 'Sağ Kol' },
    ],
    hints: [
      'Kütükleri tepedeki platformun soluna ve sağına koy.',
      'Sola yuvarlanan kütüğü sol rampayla sol çana, sağa yuvarlananı sağ çana gönder.',
    ],
    goal: {
      type: 'RING_BELL',
      title: 'İki Çanı da Çal',
      description: 'Her iki pirinç çana da vur.',
      targetCount: 2,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 4,
  },

  // ==========================================
  // BÖLÜM 10: BÜYÜK ORMAN FABRİKASI
  // ==========================================
  {
    id: 10,
    title: 'Büyük Orman Fabrikası',
    subtitle: 'ZİNCİRLEME REAKSİYON!',
    description: 'Muazzam zincirleme reaksiyon: Su değirmeni döndürsün (5 tur) VE kütük yuvarlanıp zafer çanını çalsın!',
    availablePieces: {
      LONG_PLANK: 2,
      SHORT_PLANK: 2,
      ROUND_LOG: 1,
      INCLINE_RAMP: 1,
      VERTICAL_POST: 1,
    },
    waterSource: {
      x: 75,
      y: 90,
      vx: 35,
      vy: 10,
      rate: 35,
    },
    mills: [
      {
        id: 'mill_10',
        x: 210,
        y: 350,
        radius: 40,
        requiredTurns: 5,
        currentTurns: 0,
        angle: 0,
        angularVelocity: 0,
        paddles: 8,
      },
    ],
    bells: [
      {
        id: 'bell_10',
        x: 420,
        y: 530,
        radius: 20,
        hit: false,
        swingAngle: 0,
      },
    ],
    rocks: [
      { x: 0, y: 70, width: 80, height: 50 },
      { x: 380, y: 150, width: 100, height: 40 },
      { x: 160, y: 400, width: 100, height: 60 },
      { x: 370, y: 560, width: 110, height: 160 },
      { x: 0, y: 650, width: 370, height: 70 },
    ],
    guideSlots: [
      { x: 130, y: 190, angle: 28, type: 'LONG_PLANK', label: 'Su Oluğu' },
      { x: 420, y: 125, angle: 0, type: 'ROUND_LOG', label: 'Kütük' },
      { x: 330, y: 250, angle: -32, type: 'LONG_PLANK', label: 'Kütük Yolu' },
      { x: 290, y: 460, angle: 24, type: 'INCLINE_RAMP', label: 'Hız Rampası' },
    ],
    hints: [
      'Sol tarafta suyu su değirmenine yönlendiren bir oluk kur.',
      'Sağ taraftaki kütüğü rampalarla hızlandırarak altın çana vurdur.',
      'İki mekanizma aynı anda başarıya ulaşmalıdır!',
    ],
    goal: {
      type: 'COMBO',
      title: 'Büyük Fabrikayı Çalıştır',
      description: 'Değirmeni 5 tur çevir ve çanı çal!',
      targetCount: 6,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 4,
  },

  // ==========================================
  // BÖLÜM 11: TERS EĞİMLİ HIZ SIÇRAMASI
  // ==========================================
  {
    id: 11,
    title: 'Hız Sıçraması',
    subtitle: 'VADİDEN YUKARI FIRLAT',
    description: 'Kütüğü dik rampadan vadi tabanına indir, karşı rampa ile yukarı fırlatarak yüksekteki çana vurdur.',
    availablePieces: {
      ROUND_LOG: 1,
      INCLINE_RAMP: 2,
      LONG_PLANK: 2,
    },
    mills: [],
    bells: [
      {
        id: 'bell_11',
        x: 430,
        y: 260,
        radius: 20,
        hit: false,
        swingAngle: 0,
      },
    ],
    rocks: [
      { x: 0, y: 120, width: 110, height: 600 },
      { x: 380, y: 300, width: 100, height: 420 },
      { x: 110, y: 660, width: 270, height: 60 },
    ],
    guideSlots: [
      { x: 50, y: 95, angle: 0, type: 'ROUND_LOG', label: 'Kütük' },
      { x: 170, y: 280, angle: 45, type: 'LONG_PLANK', label: 'Dik İniş' },
      { x: 300, y: 520, angle: -38, type: 'LONG_PLANK', label: 'Yukarı Fırlatma' },
    ],
    hints: [
      'İlk tahta ile kütüğü olabildiğince dik bir açıyla vadi tabanına yönlendir.',
      'Dipteki ikinci tahtayı yukarı dönük bir rampa gibi yerleştirerek kinetik enerjisiyle çana uçmasını sağla.',
    ],
    goal: {
      type: 'RING_BELL',
      title: 'Yüksek Çana Vur',
      description: 'Kütüğü sıçratarak çanı çal.',
      targetCount: 1,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 3,
  },

  // ==========================================
  // BÖLÜM 12: ÜÇ BASAMAKLI ŞELALE
  // ==========================================
  {
    id: 12,
    title: 'Üç Basamaklı Şelale',
    subtitle: 'KADEMELİ DEĞİRMENLER',
    description: 'Suyu üstten alta doğru akıtarak her iki kademedeki değirmenleri sırayla 5er tur döndür.',
    availablePieces: {
      LONG_PLANK: 3,
      SHORT_PLANK: 1,
      INCLINE_RAMP: 1,
    },
    waterSource: {
      x: 70,
      y: 80,
      vx: 35,
      vy: 10,
      rate: 36,
    },
    mills: [
      {
        id: 'mill_12_top',
        x: 240,
        y: 280,
        radius: 38,
        requiredTurns: 5,
        currentTurns: 0,
        angle: 0,
        angularVelocity: 0,
        paddles: 8,
      },
      {
        id: 'mill_12_bottom',
        x: 390,
        y: 520,
        radius: 38,
        requiredTurns: 5,
        currentTurns: 0,
        angle: 0,
        angularVelocity: 0,
        paddles: 8,
      },
    ],
    bells: [],
    rocks: [
      { x: 0, y: 60, width: 80, height: 40 },
      { x: 200, y: 330, width: 80, height: 50 },
      { x: 340, y: 570, width: 140, height: 150 },
      { x: 0, y: 660, width: 340, height: 60 },
    ],
    guideSlots: [
      { x: 140, y: 160, angle: 28, type: 'LONG_PLANK', label: '1. Kademe' },
      { x: 300, y: 380, angle: 32, type: 'LONG_PLANK', label: '2. Kademe' },
    ],
    hints: [
      'İlk uzun tahtayı şelaleden üst değirmene su akıtacak şekilde yerleştir.',
      'İkinci tahtayı üst değirmenin altından alıp alt değirmene yönlendirecek şekilde ayarla.',
    ],
    goal: {
      type: 'DUAL_MILLS',
      title: 'İki Kademeyi Çalıştır',
      description: 'Her iki değirmeni en az 5er tur döndür.',
      targetCount: 10,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 2,
  },

  // ==========================================
  // BÖLÜM 13: KAYA TÜNELİ
  // ==========================================
  {
    id: 13,
    title: 'Kaya Tüneli',
    subtitle: 'DAR GEÇİTTEN HASSAS AKIŞ',
    description: 'Dev kaya sütunlarının arasından suyu damlatmadan geçir ve vadi tabanındaki gizli çarkı 8 tur döndür.',
    availablePieces: {
      LONG_PLANK: 2,
      SHORT_PLANK: 2,
      VERTICAL_POST: 1,
    },
    waterSource: {
      x: 80,
      y: 90,
      vx: 40,
      vy: 10,
      rate: 34,
    },
    mills: [
      {
        id: 'mill_13',
        x: 380,
        y: 480,
        radius: 40,
        requiredTurns: 8,
        currentTurns: 0,
        angle: 0,
        angularVelocity: 0,
        paddles: 8,
      },
    ],
    bells: [],
    rocks: [
      { x: 0, y: 70, width: 90, height: 50 },
      { x: 160, y: 190, width: 50, height: 280, label: 'Kaya Kulesi A' },
      { x: 260, y: 260, width: 50, height: 350, label: 'Kaya Kulesi B' },
      { x: 330, y: 530, width: 150, height: 190 },
    ],
    guideSlots: [
      { x: 120, y: 150, angle: 35, type: 'SHORT_PLANK', label: 'Giriş Oluğu' },
      { x: 210, y: 220, angle: 22, type: 'SHORT_PLANK', label: 'Tünel Köprüsü' },
      { x: 330, y: 350, angle: 34, type: 'LONG_PLANK', label: 'İniş Oluğu' },
    ],
    hints: [
      'Kısa tahtaları kulelerin arasındaki boşluktan hassas geçiş sağlayacak şekilde açılı koy.',
      'Suyu doğrudan çarka dökmek için son uzun tahtayı dik açıya yakın tut.',
    ],
    goal: {
      type: 'SPIN_MILL',
      title: 'Tünel Değirmenini Çalıştır',
      description: 'Çarkı en az 8 tur döndür.',
      targetCount: 8,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 3,
  },

  // ==========================================
  // BÖLÜM 14: KARŞI AĞIRLIK BARAJI
  // ==========================================
  {
    id: 14,
    title: 'Karşı Ağırlık Barajı',
    subtitle: 'SU İLE KALDIRILAN KAPAK',
    description: 'Suyu kaldıraç kefesine doldur; ağırlaşan kefe yukarı kalkıp su kapağını açsın, ana değirmen çalışsın!',
    availablePieces: {
      LONG_PLANK: 2,
      SHORT_PLANK: 2,
      PLATFORM: 1,
    },
    waterSource: {
      x: 100,
      y: 90,
      vx: 30,
      vy: 10,
      rate: 35,
    },
    mills: [
      {
        id: 'mill_14',
        x: 400,
        y: 510,
        radius: 40,
        requiredTurns: 8,
        currentTurns: 0,
        angle: 0,
        angularVelocity: 0,
        paddles: 8,
      },
    ],
    bells: [],
    seesaws: [
      {
        id: 'seesaw_14',
        pivotX: 200,
        pivotY: 300,
        length: 130,
        angle: -0.2,
        angularVelocity: 0,
        minAngle: -0.3,
        maxAngle: 0.35,
        leftWeight: 0,
        rightWeight: 0,
      },
    ],
    gates: [
      {
        id: 'gate_14',
        pivotX: 300,
        pivotY: 200,
        length: 75,
        angle: 0,
        isOpen: false,
        linkedTriggerId: 'seesaw_14',
      },
    ],
    rocks: [
      { x: 0, y: 70, width: 110, height: 50 },
      { x: 280, y: 170, width: 40, height: 30 },
      { x: 185, y: 300, width: 30, height: 80 },
      { x: 350, y: 560, width: 130, height: 160 },
    ],
    guideSlots: [
      { x: 150, y: 170, angle: 30, type: 'SHORT_PLANK', label: 'Doldurma Oluğu' },
      { x: 350, y: 330, angle: 28, type: 'LONG_PLANK', label: 'Ana Kanal' },
    ],
    hints: [
      'Bir kısa tahta ile suyu tahterevallinin sol ucuna akıtarak ağırlık oluştur.',
      'Tahterevalli sol ucu batınca sağdaki kapak açılacak, açılan kapağın altına ana kanalı kur.',
    ],
    goal: {
      type: 'SPIN_MILL',
      title: 'Barajı Aç ve Çalıştır',
      description: 'Kapağı açıp çarkı 8 tur döndür.',
      targetCount: 8,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 3,
  },

  // ==========================================
  // BÖLÜM 15: ÇİFTE ÇAN SENFONİSİ
  // ==========================================
  {
    id: 15,
    title: 'Çifte Çan Senfonisi',
    subtitle: 'SEKTİREREK İKİ ÇANA VUR',
    description: 'Kütüğü öyle bir açıyla fırlat ki önce birinci çana çarpsın, ardından sekerek ikinci çana ulaşıp çalsın!',
    availablePieces: {
      ROUND_LOG: 1,
      LONG_PLANK: 2,
      INCLINE_RAMP: 1,
      SHORT_PLANK: 2,
    },
    mills: [],
    bells: [
      {
        id: 'bell_15_a',
        x: 230,
        y: 280,
        radius: 18,
        hit: false,
        swingAngle: 0,
      },
      {
        id: 'bell_15_b',
        x: 420,
        y: 470,
        radius: 18,
        hit: false,
        swingAngle: 0,
      },
    ],
    rocks: [
      { x: 0, y: 120, width: 100, height: 600 },
      { x: 210, y: 310, width: 40, height: 120 },
      { x: 370, y: 500, width: 110, height: 220 },
    ],
    guideSlots: [
      { x: 50, y: 95, angle: 0, type: 'ROUND_LOG', label: 'Kütük' },
      { x: 140, y: 190, angle: 35, type: 'LONG_PLANK', label: '1. Çan Yolu' },
      { x: 300, y: 390, angle: 25, type: 'LONG_PLANK', label: '2. Çan Yolu' },
    ],
    hints: [
      'Kütüğü sol tepeden bırakarak birinci çana hafif temas ettir.',
      'Birinci çanın altındaki rampayı ikinci çana doğru meyilli kur ki kütük yoluna devam etsin.',
    ],
    goal: {
      type: 'RING_BELL',
      title: 'İki Çanı da Çal',
      description: 'Tek kütükle iki çana birden vur.',
      targetCount: 2,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 3,
  },

  // ==========================================
  // BÖLÜM 16: YÜKSEK SU KULESİ
  // ==========================================
  {
    id: 16,
    title: 'Yüksek Su Kulesi',
    subtitle: 'DİREKLERLE GÖKYÜZÜ KANALI',
    description: 'Dikey ahşap direklerle yüksek bir iskele kur ve suyu uçurumun üzerinden karşı tepeye taşı.',
    availablePieces: {
      LONG_PLANK: 3,
      VERTICAL_POST: 2,
      SHORT_PLANK: 1,
    },
    waterSource: {
      x: 60,
      y: 90,
      vx: 30,
      vy: 10,
      rate: 34,
    },
    mills: [
      {
        id: 'mill_16',
        x: 420,
        y: 490,
        radius: 40,
        requiredTurns: 8,
        currentTurns: 0,
        angle: 0,
        angularVelocity: 0,
        paddles: 8,
      },
    ],
    bells: [],
    rocks: [
      { x: 0, y: 70, width: 80, height: 50 },
      { x: 370, y: 530, width: 110, height: 190 },
      { x: 0, y: 670, width: 370, height: 50 },
    ],
    guideSlots: [
      { x: 130, y: 160, angle: 20, type: 'LONG_PLANK', label: '1. Açıklık' },
      { x: 260, y: 240, angle: 22, type: 'LONG_PLANK', label: '2. Açıklık' },
      { x: 370, y: 350, angle: 32, type: 'LONG_PLANK', label: 'İniş Oluğu' },
    ],
    hints: [
      'Uçurumun ortasına destek tahtalarını birbirine bağlayarak uzun bir asma köprü oluğu oluştur.',
      'Suyu doğrudan değirmenin üzerine dökecek son parçanın açısını iyi ver.',
    ],
    goal: {
      type: 'SPIN_MILL',
      title: 'Değirmeni Çalıştır',
      description: 'Yüksek kanalla çarkı 8 tur döndür.',
      targetCount: 8,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 3,
  },

  // ==========================================
  // BÖLÜM 17: SU VE KÜTÜK KOALİSYONU
  // ==========================================
  {
    id: 17,
    title: 'Su & Kütük Koalisyonu',
    subtitle: 'ZAMANLAMA VE EŞGÜDÜM',
    description: 'Su kaldıraç köprüsünü dengelerken, tam o sırada yuvarlanan kütük köprüden geçip çanı çalsın!',
    availablePieces: {
      ROUND_LOG: 1,
      LONG_PLANK: 2,
      SHORT_PLANK: 2,
      INCLINE_RAMP: 1,
    },
    waterSource: {
      x: 350,
      y: 90,
      vx: -15,
      vy: 15,
      rate: 32,
    },
    bells: [
      {
        id: 'bell_17',
        x: 430,
        y: 490,
        radius: 20,
        hit: false,
        swingAngle: 0,
      },
    ],
    mills: [],
    seesaws: [
      {
        id: 'seesaw_17',
        pivotX: 250,
        pivotY: 340,
        length: 130,
        angle: -0.25,
        angularVelocity: 0,
        minAngle: -0.28,
        maxAngle: 0.18,
        leftWeight: 0,
        rightWeight: 0,
      },
    ],
    rocks: [
      { x: 0, y: 160, width: 100, height: 560 },
      { x: 235, y: 340, width: 30, height: 60 },
      { x: 380, y: 530, width: 100, height: 190 },
    ],
    guideSlots: [
      { x: 50, y: 135, angle: 0, type: 'ROUND_LOG', label: 'Kütük' },
      { x: 140, y: 240, angle: 32, type: 'LONG_PLANK', label: 'Giriş Yolu' },
      { x: 360, y: 410, angle: 25, type: 'LONG_PLANK', label: 'Çıkış Yolu' },
    ],
    hints: [
      'Su şelalesini doğrudan tahterevallinin sağ ucuna akıt.',
      'Tahterevalli ağırlıkla düz bir köprüye dönüştüğünde kütük üzerinden kayarak çana vuracaktır.',
    ],
    goal: {
      type: 'RING_BELL',
      title: 'Köprüden Geç ve Çal',
      description: 'Zamanlamayı yakalayarak çana ulaş.',
      targetCount: 1,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 3,
  },

  // ==========================================
  // BÖLÜM 18: KRALİYET DEĞİRMENLERİ
  // ==========================================
  {
    id: 18,
    title: 'Kraliyet Değirmenleri',
    subtitle: 'ÇİFTE ÇARK VE ÇAN',
    description: 'Hem iki su değirmenini (4er tur) çalıştır hem de kütüğü yönlendirerek zafer çanını çal!',
    availablePieces: {
      ROUND_LOG: 1,
      LONG_PLANK: 3,
      SHORT_PLANK: 2,
      INCLINE_RAMP: 1,
    },
    waterSource: {
      x: 180,
      y: 80,
      vx: 0,
      vy: 25,
      rate: 36,
    },
    mills: [
      {
        id: 'mill_18_a',
        x: 80,
        y: 440,
        radius: 36,
        requiredTurns: 4,
        currentTurns: 0,
        angle: 0,
        angularVelocity: 0,
        paddles: 8,
      },
      {
        id: 'mill_18_b',
        x: 280,
        y: 440,
        radius: 36,
        requiredTurns: 4,
        currentTurns: 0,
        angle: 0,
        angularVelocity: 0,
        paddles: 8,
      },
    ],
    bells: [
      {
        id: 'bell_18',
        x: 430,
        y: 440,
        radius: 18,
        hit: false,
        swingAngle: 0,
      },
    ],
    rocks: [
      { x: 150, y: 50, width: 60, height: 40 },
      { x: 380, y: 130, width: 100, height: 40 },
      { x: 0, y: 500, width: 140, height: 220 },
      { x: 220, y: 500, width: 120, height: 220 },
      { x: 380, y: 500, width: 100, height: 220 },
    ],
    guideSlots: [
      { x: 420, y: 105, angle: 0, type: 'ROUND_LOG', label: 'Kütük' },
      { x: 130, y: 230, angle: -30, type: 'LONG_PLANK', label: 'Sol Su Kolu' },
      { x: 240, y: 230, angle: 30, type: 'LONG_PLANK', label: 'Sağ Su Kolu' },
      { x: 400, y: 280, angle: 25, type: 'LONG_PLANK', label: 'Kütük Yolu' },
    ],
    hints: [
      'Merkezi suyu iki kola bölerek sol ve orta değirmenlere akıt.',
      'Sağ tepedeki kütüğü tek bir uzun tahtayla sağdaki altın çana yönlendir.',
    ],
    goal: {
      type: 'COMBO',
      title: 'Kraliyet Tesisini Çalıştır',
      description: 'İki değirmeni döndür ve çanı çal!',
      targetCount: 5,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 4,
  },

  // ==========================================
  // BÖLÜM 19: USTA MÜHENDİSİN LABİRENTİ
  // ==========================================
  {
    id: 19,
    title: 'Mühendis Labirenti',
    subtitle: 'NİHAİ USTALIK SINAVI',
    description: '4 ayrı kaya sütununu aşarak suyu ana değirmene ulaştır ve kütükle altın çanı aynı anda tetikle!',
    availablePieces: {
      ROUND_LOG: 1,
      LONG_PLANK: 3,
      SHORT_PLANK: 3,
      INCLINE_RAMP: 1,
      VERTICAL_POST: 1,
    },
    waterSource: {
      x: 70,
      y: 80,
      vx: 30,
      vy: 10,
      rate: 36,
    },
    mills: [
      {
        id: 'mill_19',
        x: 230,
        y: 500,
        radius: 40,
        requiredTurns: 6,
        currentTurns: 0,
        angle: 0,
        angularVelocity: 0,
        paddles: 8,
      },
    ],
    bells: [
      {
        id: 'bell_19',
        x: 430,
        y: 440,
        radius: 18,
        hit: false,
        swingAngle: 0,
      },
    ],
    rocks: [
      { x: 0, y: 60, width: 80, height: 40 },
      { x: 380, y: 110, width: 100, height: 40 },
      { x: 130, y: 220, width: 45, height: 260 },
      { x: 310, y: 220, width: 45, height: 260 },
      { x: 180, y: 550, width: 100, height: 170 },
      { x: 380, y: 500, width: 100, height: 220 },
    ],
    guideSlots: [
      { x: 420, y: 85, angle: 0, type: 'ROUND_LOG', label: 'Kütük' },
      { x: 110, y: 150, angle: 30, type: 'LONG_PLANK', label: '1. Su Oluğu' },
      { x: 230, y: 350, angle: 25, type: 'LONG_PLANK', label: '2. Su Oluğu' },
      { x: 390, y: 260, angle: 25, type: 'LONG_PLANK', label: 'Kütük Yolu' },
    ],
    hints: [
      'Sol tarafta suyu sütunların arasından orta değirmene taşı.',
      'Sağ tarafta kütüğü dik açılı rampayla hızlandırıp çana ulaştır.',
    ],
    goal: {
      type: 'COMBO',
      title: 'Labirenti Tamamla',
      description: 'Değirmeni 6 tur çevir ve çanı çal!',
      targetCount: 7,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 4,
  },

  // ==========================================
  // BÖLÜM 20: BÜYÜK SERBEST ATÖLYE (SANDBOX)
  // ==========================================
  {
    id: 20,
    title: 'Serbest Atölye',
    subtitle: 'SINIRSIZ KUM HAVUZU',
    description: 'Sınırsız tahtalar, kütükler, çarklar ve çift şelaleyle hayalindeki devasa mekanizmayı özgürce inşa et!',
    availablePieces: {
      LONG_PLANK: 99,
      SHORT_PLANK: 99,
      VERTICAL_POST: 99,
      ROUND_LOG: 99,
      INCLINE_RAMP: 99,
      PLATFORM: 99,
    },
    waterSource: {
      x: 100,
      y: 80,
      vx: 40,
      vy: 10,
      rate: 36,
    },
    secondaryWaterSource: {
      x: 380,
      y: 80,
      vx: -40,
      vy: 10,
      rate: 36,
    },
    mills: [
      {
        id: 'mill_sandbox_1',
        x: 140,
        y: 490,
        radius: 42,
        requiredTurns: 5,
        currentTurns: 0,
        angle: 0,
        angularVelocity: 0,
        paddles: 8,
      },
      {
        id: 'mill_sandbox_2',
        x: 340,
        y: 490,
        radius: 42,
        requiredTurns: 5,
        currentTurns: 0,
        angle: 0,
        angularVelocity: 0,
        paddles: 8,
      },
    ],
    bells: [
      {
        id: 'bell_sandbox',
        x: 240,
        y: 350,
        radius: 20,
        hit: false,
        swingAngle: 0,
      },
    ],
    rocks: [
      { x: 0, y: 60, width: 110, height: 50 },
      { x: 370, y: 60, width: 110, height: 50 },
      { x: 0, y: 650, width: 480, height: 70, label: 'Atölye Zemini' },
    ],
    guideSlots: [],
    hints: [
      'Bu serbest bir kum havuzudur! İstediğin kadar parça yerleştirebilir, karmaşık zincirleme reaksiyonlar kurabilirsin.',
      'Kütükleri fırlatmak, çifte değirmenleri hızlandırmak ve büyük su köprüleri yapmak tamamen senin elinde!',
    ],
    goal: {
      type: 'SPIN_MILL',
      title: 'Serbest Deneyim',
      description: 'İstediğin gibi inşa et ve dünyayı çalıştır!',
      targetCount: 1,
      currentCount: 0,
      isComplete: false,
    },
    maxPiecesFor3Stars: 999,
  },
];
