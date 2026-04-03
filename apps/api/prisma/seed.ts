import { PrismaClient, ProductType, Platform, Region, Currency, CodeStatus, UserRole, CategoryType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // ===== EXCHANGE RATES =====
  console.log('Seeding exchange rates...');
  await prisma.exchangeRate.upsert({
    where: { currency: Currency.TRY },
    update: {},
    create: { currency: Currency.TRY, rateToRub: 2.8, margin: 15 },
  });
  await prisma.exchangeRate.upsert({
    where: { currency: Currency.INR },
    update: {},
    create: { currency: Currency.INR, rateToRub: 1.1, margin: 18 },
  });
  await prisma.exchangeRate.upsert({
    where: { currency: Currency.UAH },
    update: {},
    create: { currency: Currency.UAH, rateToRub: 2.3, margin: 12 },
  });

  // ===== CATEGORIES =====
  console.log('Seeding categories...');
  const categories = [
    { slug: 'best-sellers', name: 'Бестселлеры', type: CategoryType.COLLECTION, sortOrder: 1 },
    { slug: 'ps-plus', name: 'PS Plus', type: CategoryType.FEATURE, sortOrder: 2 },
    { slug: 'preorders', name: 'Предзаказы', type: CategoryType.COLLECTION, sortOrder: 3 },
    { slug: 'donations', name: 'Пополнения', type: CategoryType.FEATURE, sortOrder: 4 },
    { slug: 'bundles', name: 'Комплекты', type: CategoryType.COLLECTION, sortOrder: 5 },
    { slug: 'for-two', name: 'На двоих', type: CategoryType.FEATURE, sortOrder: 6 },
    { slug: 'shooters', name: 'Шутеры', type: CategoryType.GENRE, sortOrder: 7 },
    { slug: 'sports', name: 'Спорт', type: CategoryType.GENRE, sortOrder: 8 },
    { slug: 'rpg', name: 'RPG', type: CategoryType.GENRE, sortOrder: 9 },
    { slug: 'horror', name: 'Хоррор', type: CategoryType.GENRE, sortOrder: 10 },
    { slug: 'open-world', name: 'Открытый мир', type: CategoryType.GENRE, sortOrder: 11 },
    { slug: 'souls-like', name: 'Souls-like', type: CategoryType.GENRE, sortOrder: 12 },
    { slug: 'superheroes', name: 'Супергерои', type: CategoryType.COLLECTION, sortOrder: 13 },
    { slug: 'multiplayer', name: 'Мультиплеер', type: CategoryType.FEATURE, sortOrder: 14 },
  ];

  const categoryMap: Record<string, number> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
  }

  // ===== PRODUCTS =====
  console.log('Seeding products...');

  interface ProductSeed {
    slug: string;
    title: string;
    description?: string;
    type: ProductType;
    platform?: Platform;
    edition?: string;
    region: Region;
    price: number;
    originalPrice?: number;
    discount?: number;
    imageUrl?: string;
    isPreorder?: boolean;
    sortOrder?: number;
    categories: string[];
  }

  const products: ProductSeed[] = [
    // ===== TURKEY GAMES =====
    {
      slug: 'god-of-war-ragnarok-tr',
      title: 'God of War Ragnarök',
      description: 'Кратос и Атрей отправляются в эпическое путешествие по девяти мирам Norse.',
      type: ProductType.GAME,
      platform: Platform.PS4_PS5,
      region: Region.TURKEY,
      price: 999,
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202206/1918/pzIPayPJHMBXBO9GGbPisLF6.png',
      sortOrder: 1,
      categories: ['best-sellers', 'rpg', 'open-world'],
    },
    {
      slug: 'spider-man-2-tr',
      title: 'Marvel\'s Spider-Man 2',
      description: 'Питер Паркер и Майлз Моралес против новых злодеев Нью-Йорка.',
      type: ProductType.GAME,
      platform: Platform.PS5,
      region: Region.TURKEY,
      price: 1279,
      originalPrice: 1599,
      discount: 20,
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/c5a5e0f5e75d3a3f8f3b7e1e2b4b5a6a.png',
      sortOrder: 2,
      categories: ['best-sellers', 'superheroes', 'open-world'],
    },
    {
      slug: 'gta-v-premium-tr',
      title: 'Grand Theft Auto V: Premium Edition',
      description: 'Легендарная GTA V с Криминальным Предприятием и бонусами GTA Online.',
      type: ProductType.GAME,
      platform: Platform.PS4_PS5,
      region: Region.TURKEY,
      price: 199,
      originalPrice: 499,
      discount: 60,
      imageUrl: 'https://image.api.playstation.com/cdn/UP1004/CUSA00419_00/S07BOCpPWYJFAJVGhK2rqnN5eFuBf15P.png',
      sortOrder: 3,
      categories: ['best-sellers', 'open-world', 'multiplayer'],
    },
    {
      slug: 'fifa-25-tr',
      title: 'EA Sports FC 25',
      description: 'Новая эра футбольных симуляторов с реальными лигами и командами.',
      type: ProductType.GAME,
      platform: Platform.PS4_PS5,
      region: Region.TURKEY,
      price: 799,
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202407/1116/7e9d1c8e5f3a2b1c0d9e8f7a.png',
      sortOrder: 4,
      categories: ['sports', 'multiplayer'],
    },
    {
      slug: 'elden-ring-tr',
      title: 'Elden Ring',
      description: 'Эпическое souls-like приключение от FromSoftware и Джорджа Мартина.',
      type: ProductType.GAME,
      platform: Platform.PS4_PS5,
      region: Region.TURKEY,
      price: 559,
      originalPrice: 799,
      discount: 30,
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/phvVT0qZfcRms5qDAk0SI3CM.png',
      sortOrder: 5,
      categories: ['best-sellers', 'souls-like', 'rpg', 'open-world'],
    },
    {
      slug: 'mortal-kombat-1-tr',
      title: 'Mortal Kombat 1',
      description: 'Новая глава легендарной файтинг-франшизы с новым таймлайном.',
      type: ProductType.GAME,
      platform: Platform.PS4_PS5,
      region: Region.TURKEY,
      price: 999,
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202305/0811/cb07f585c4a5c8e9f1d2e3c4a5b6c7d8.png',
      sortOrder: 6,
      categories: ['multiplayer', 'for-two'],
    },
    {
      slug: 'horizon-forbidden-west-tr',
      title: 'Horizon Forbidden West',
      description: 'Элой отправляется на запад, чтобы найти источник таинственной чумы.',
      type: ProductType.GAME,
      platform: Platform.PS4_PS5,
      region: Region.TURKEY,
      price: 399,
      originalPrice: 799,
      discount: 50,
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202107/3100/ki3E2k1ETanZqLSFE4rXBp4b.png',
      sortOrder: 7,
      categories: ['best-sellers', 'rpg', 'open-world'],
    },
    {
      slug: 'the-last-of-us-part-i-tr',
      title: 'The Last of Us Part I',
      description: 'Полностью переработанная версия культовой игры для PS5.',
      type: ProductType.GAME,
      platform: Platform.PS5,
      region: Region.TURKEY,
      price: 1299,
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202206/0720/GExBKZuAkrBZ8lEPW5Wt9P58.png',
      sortOrder: 8,
      categories: ['best-sellers', 'rpg'],
    },
    {
      slug: 'hogwarts-legacy-deluxe-tr',
      title: 'Hogwarts Legacy Deluxe Edition',
      description: 'Погрузитесь в магический мир Хогвартса в XIX веке.',
      type: ProductType.GAME,
      platform: Platform.PS4_PS5,
      edition: 'Deluxe',
      region: Region.TURKEY,
      price: 999,
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202212/0812/en4DEMhAqk3k00B7LEGtCMRg.png',
      sortOrder: 9,
      categories: ['best-sellers', 'rpg', 'open-world'],
    },
    {
      slug: 'cod-mw3-tr',
      title: 'Call of Duty: Modern Warfare III',
      description: 'Самая масштабная мультиплеерная карта и кампания серии.',
      type: ProductType.GAME,
      platform: Platform.PS4_PS5,
      region: Region.TURKEY,
      price: 999,
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202309/1418/a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8.png',
      sortOrder: 10,
      categories: ['shooters', 'multiplayer'],
    },
    {
      slug: 'ratchet-clank-rift-apart-tr',
      title: 'Ratchet & Clank: Rift Apart',
      description: 'Первое эксклюзивное приключение дуэта на PlayStation 5.',
      type: ProductType.GAME,
      platform: Platform.PS5,
      region: Region.TURKEY,
      price: 599,
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202101/2921/kO7tN5CcPc6AwSRN9c7cCiED.png',
      sortOrder: 11,
      categories: ['best-sellers'],
    },
    {
      slug: 'returnal-tr',
      title: 'Returnal',
      description: 'Roguelite action-shooter с уникальным нарративом и bullet hell механиками.',
      type: ProductType.GAME,
      platform: Platform.PS5,
      region: Region.TURKEY,
      price: 799,
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202101/2915/6pBPOZFT5bZ9o8MUEaUEtKBq.png',
      sortOrder: 12,
      categories: ['souls-like', 'shooters'],
    },
    {
      slug: 'demons-souls-tr',
      title: 'Demon\'s Souls',
      description: 'Легендарный родоначальник жанра souls-like, полностью переработанный для PS5.',
      type: ProductType.GAME,
      platform: Platform.PS5,
      region: Region.TURKEY,
      price: 699,
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202010/1600/2pDJMCZcU7ZMBSxrIVNRiSLE.png',
      sortOrder: 13,
      categories: ['souls-like', 'rpg'],
    },
    {
      slug: 'bloodborne-tr',
      title: 'Bloodborne',
      description: 'Готическое souls-like в мрачном викторианском городе Ярнам.',
      type: ProductType.GAME,
      platform: Platform.PS4,
      region: Region.TURKEY,
      price: 399,
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202010/0200/kRFCIECVSjsJNWFHl1pPFqDq.png',
      sortOrder: 14,
      categories: ['souls-like', 'horror', 'rpg'],
    },
    // ===== INDIA GAMES =====
    {
      slug: 'god-of-war-ragnarok-in',
      title: 'God of War Ragnarök (India)',
      description: 'Кратос и Атрей отправляются в эпическое путешествие по девяти мирам Norse.',
      type: ProductType.GAME,
      platform: Platform.PS4_PS5,
      region: Region.INDIA,
      price: 3999,
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202206/1918/pzIPayPJHMBXBO9GGbPisLF6.png',
      sortOrder: 1,
      categories: ['best-sellers', 'rpg', 'open-world'],
    },
    {
      slug: 'spider-man-2-in',
      title: 'Marvel\'s Spider-Man 2 (India)',
      description: 'Питер Паркер и Майлз Моралес против новых злодеев Нью-Йорка.',
      type: ProductType.GAME,
      platform: Platform.PS5,
      region: Region.INDIA,
      price: 4999,
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/c5a5e0f5e75d3a3f8f3b7e1e2b4b5a6a.png',
      sortOrder: 2,
      categories: ['best-sellers', 'superheroes', 'open-world'],
    },
    {
      slug: 'gta-v-in',
      title: 'Grand Theft Auto V (India)',
      description: 'Легендарная GTA V для PlayStation.',
      type: ProductType.GAME,
      platform: Platform.PS4_PS5,
      region: Region.INDIA,
      price: 999,
      imageUrl: 'https://image.api.playstation.com/cdn/UP1004/CUSA00419_00/S07BOCpPWYJFAJVGhK2rqnN5eFuBf15P.png',
      sortOrder: 3,
      categories: ['best-sellers', 'open-world', 'multiplayer'],
    },
    // ===== PS PLUS SUBSCRIPTIONS (INDIA) =====
    {
      slug: 'ps-plus-essential-3m-in',
      title: 'PS Plus Essential 3 месяца',
      description: 'Ежемесячные игры, онлайн-мультиплеер и эксклюзивные скидки на 3 месяца.',
      type: ProductType.SUBSCRIPTION,
      region: Region.INDIA,
      price: 1350,
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202209/0821/R6LGqDFlT9iCy1UfS2WfuEB9.png',
      sortOrder: 1,
      categories: ['ps-plus', 'multiplayer'],
    },
    {
      slug: 'ps-plus-extra-3m-in',
      title: 'PS Plus Extra 3 месяца',
      description: 'Всё от Essential плюс доступ к каталогу из 400+ игр на 3 месяца.',
      type: ProductType.SUBSCRIPTION,
      region: Region.INDIA,
      price: 2250,
      imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202209/0821/R6LGqDFlT9iCy1UfS2WfuEB9.png',
      sortOrder: 2,
      categories: ['ps-plus', 'multiplayer'],
    },
    // ===== TOP-UP CARDS =====
    {
      slug: 'psn-try-50',
      title: 'Карта пополнения PSN 50 TL (Турция)',
      description: 'Код пополнения кошелька PlayStation Network на 50 турецких лир.',
      type: ProductType.TOPUP_CARD,
      region: Region.TURKEY,
      price: 50,
      sortOrder: 1,
      categories: ['donations'],
    },
    {
      slug: 'psn-try-100',
      title: 'Карта пополнения PSN 100 TL (Турция)',
      description: 'Код пополнения кошелька PlayStation Network на 100 турецких лир.',
      type: ProductType.TOPUP_CARD,
      region: Region.TURKEY,
      price: 100,
      sortOrder: 2,
      categories: ['donations'],
    },
    {
      slug: 'psn-try-200',
      title: 'Карта пополнения PSN 200 TL (Турция)',
      description: 'Код пополнения кошелька PlayStation Network на 200 турецких лир.',
      type: ProductType.TOPUP_CARD,
      region: Region.TURKEY,
      price: 200,
      sortOrder: 3,
      categories: ['donations'],
    },
    {
      slug: 'psn-try-500',
      title: 'Карта пополнения PSN 500 TL (Турция)',
      description: 'Код пополнения кошелька PlayStation Network на 500 турецких лир.',
      type: ProductType.TOPUP_CARD,
      region: Region.TURKEY,
      price: 500,
      sortOrder: 4,
      categories: ['donations'],
    },
    {
      slug: 'psn-try-1000',
      title: 'Карта пополнения PSN 1000 TL (Турция)',
      description: 'Код пополнения кошелька PlayStation Network на 1000 турецких лир.',
      type: ProductType.TOPUP_CARD,
      region: Region.TURKEY,
      price: 1000,
      sortOrder: 5,
      categories: ['donations'],
    },
    {
      slug: 'psn-inr-500',
      title: 'Карта пополнения PSN 500 INR (Индия)',
      description: 'Код пополнения кошелька PlayStation Network на 500 индийских рупий.',
      type: ProductType.TOPUP_CARD,
      region: Region.INDIA,
      price: 500,
      sortOrder: 6,
      categories: ['donations'],
    },
    {
      slug: 'psn-inr-1000',
      title: 'Карта пополнения PSN 1000 INR (Индия)',
      description: 'Код пополнения кошелька PlayStation Network на 1000 индийских рупий.',
      type: ProductType.TOPUP_CARD,
      region: Region.INDIA,
      price: 1000,
      sortOrder: 7,
      categories: ['donations'],
    },
    {
      slug: 'psn-inr-2000',
      title: 'Карта пополнения PSN 2000 INR (Индия)',
      description: 'Код пополнения кошелька PlayStation Network на 2000 индийских рупий.',
      type: ProductType.TOPUP_CARD,
      region: Region.INDIA,
      price: 2000,
      sortOrder: 8,
      categories: ['donations'],
    },
  ];

  const productMap: Record<string, number> = {};
  for (const prod of products) {
    const { categories: prodCategories, ...prodData } = prod;
    const created = await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: {},
      create: {
        ...prodData,
        description: prodData.description ?? null,
        platform: prodData.platform ?? null,
        edition: prodData.edition ?? null,
        originalPrice: prodData.originalPrice ?? null,
        discount: prodData.discount ?? null,
        imageUrl: prodData.imageUrl ?? null,
        isPreorder: prodData.isPreorder ?? false,
        sortOrder: prodData.sortOrder ?? 0,
      },
    });
    productMap[prodData.slug] = created.id;

    for (const catSlug of prodCategories) {
      const catId = categoryMap[catSlug];
      if (catId) {
        await prisma.productCategory.upsert({
          where: { productId_categoryId: { productId: created.id, categoryId: catId } },
          update: {},
          create: { productId: created.id, categoryId: catId },
        });
      }
    }
  }

  // ===== TOP-UP CODES =====
  console.log('Seeding top-up codes...');

  const codeConfigs: Array<{ denomination: number; currency: Currency; count: number }> = [
    { denomination: 50, currency: Currency.TRY, count: 10 },
    { denomination: 100, currency: Currency.TRY, count: 10 },
    { denomination: 200, currency: Currency.TRY, count: 10 },
    { denomination: 500, currency: Currency.TRY, count: 10 },
    { denomination: 1000, currency: Currency.TRY, count: 10 },
    { denomination: 500, currency: Currency.INR, count: 10 },
    { denomination: 1000, currency: Currency.INR, count: 10 },
    { denomination: 2000, currency: Currency.INR, count: 10 },
  ];

  for (const config of codeConfigs) {
    for (let i = 1; i <= config.count; i++) {
      const code = `${config.currency}-${config.denomination}-${String(i).padStart(4, '0')}-TEST`;
      await prisma.topUpCode.upsert({
        where: { code },
        update: {},
        create: {
          code,
          denomination: config.denomination,
          currency: config.currency,
          status: CodeStatus.AVAILABLE,
        },
      });
    }
  }

  // ===== ADMIN USER =====
  console.log('Seeding admin user...');
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@reloc.ru' },
    update: {},
    create: {
      email: 'admin@reloc.ru',
      password: hashedPassword,
      name: 'Admin',
      role: UserRole.ADMIN,
    },
  });

  // ===== FAQ =====
  console.log('Seeding FAQ...');
  const faqs = [
    {
      question: 'Как купить игру на турецком аккаунте?',
      answer: 'Вам нужен турецкий аккаунт PSN. Вы можете создать его самостоятельно или заказать у нас. После покупки вы получите код пополнения кошелька и сможете приобрести игру на официальном PS Store.',
      sortOrder: 1,
    },
    {
      question: 'Когда я получу код после оплаты?',
      answer: 'Коды доставляются автоматически сразу после подтверждения оплаты. В среднем это занимает от 1 до 5 минут. В редких случаях доставка может занять до 15 минут.',
      sortOrder: 2,
    },
    {
      question: 'Что такое СБП и как оплатить?',
      answer: 'СБП (Система Быстрых Платежей) — это мгновенные переводы между банками по номеру телефона или QR-коду. Поддерживается большинством российских банков. Просто выберите СБП при оформлении заказа и следуйте инструкции.',
      sortOrder: 3,
    },
    {
      question: 'Можно ли вернуть деньги если код не работает?',
      answer: 'Да, если код неисправен, мы заменим его или вернём деньги. Для этого напишите в поддержку с номером заказа и описанием проблемы.',
      sortOrder: 4,
    },
    {
      question: 'Какой регион лучше выбрать?',
      answer: 'Турция — самые низкие цены на большинство игр. Индия — хороша для подписок PS Plus и некоторых игр. Украина — средние цены, некоторые эксклюзивные предложения.',
      sortOrder: 5,
    },
    {
      question: 'Нужен ли отдельный аккаунт для каждого региона?',
      answer: 'Да, для каждого региона нужен отдельный PSN аккаунт. Однако игры, купленные на дополнительном аккаунте, можно установить на основном через функцию основной консоли.',
      sortOrder: 6,
    },
    {
      question: 'Как работает умная корзина?',
      answer: 'Умная корзина автоматически рассчитывает, какие карты пополнения нужны для покупки выбранных вами игр. Просто добавьте игры в корзину и система подберёт оптимальный набор карт.',
      sortOrder: 7,
    },
    {
      question: 'Есть ли скидки для постоянных покупателей?',
      answer: 'Да! Мы регулярно проводим акции и выдаём промокоды. Подпишитесь на наш Telegram-канал, чтобы первыми узнавать о скидках.',
      sortOrder: 8,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.fAQ.findFirst({ where: { question: faq.question } });
    if (!existing) {
      await prisma.fAQ.create({ data: faq });
    }
  }

  // ===== STATIC PAGES =====
  console.log('Seeding static pages...');
  const pages = [
    {
      slug: 'about',
      title: 'О нас',
      content: '<h1>О Reloc Store</h1><p>Reloc Store — ведущий магазин цифровых кодов PlayStation в России. Мы помогаем геймерам покупать игры по выгодным ценам через зарубежные регионы PS Store.</p><p>Наша команда работает 24/7, чтобы обеспечить быструю доставку кодов и отличный сервис.</p>',
    },
    {
      slug: 'contacts',
      title: 'Контакты',
      content: '<h1>Контакты</h1><p>Email: support@reloc.ru</p><p>Telegram: @reloc_support</p><p>Время работы: 24/7</p>',
    },
    {
      slug: 'privacy',
      title: 'Политика конфиденциальности',
      content: '<h1>Политика конфиденциальности</h1><p>Мы уважаем вашу конфиденциальность и защищаем ваши персональные данные в соответствии с ФЗ-152 "О персональных данных".</p>',
    },
    {
      slug: 'terms',
      title: 'Условия использования',
      content: '<h1>Условия использования</h1><p>Используя сайт Reloc Store, вы соглашаетесь с настоящими условиями. Пожалуйста, ознакомьтесь с ними внимательно.</p>',
    },
    {
      slug: 'support',
      title: 'Поддержка',
      content: '<h1>Поддержка</h1><p>Если у вас возникли проблемы с заказом, обратитесь в нашу службу поддержки любым удобным способом.</p><p>Email: support@reloc.ru</p><p>Telegram: @reloc_support</p>',
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  // ===== BANNERS =====
  console.log('Seeding banners...');
  const banners = [
    {
      title: 'Лучшие игры по ценам Турции',
      imageUrl: 'https://cdn.reloc.ru/banners/turkey-banner.jpg',
      linkUrl: '/catalog?region=TURKEY',
      position: 'hero',
      isActive: true,
      sortOrder: 1,
    },
    {
      title: 'PS Plus — играй больше за меньше',
      imageUrl: 'https://cdn.reloc.ru/banners/psplus-banner.jpg',
      linkUrl: '/catalog?category=ps-plus',
      position: 'hero',
      isActive: true,
      sortOrder: 2,
    },
    {
      title: 'Пополни кошелёк PSN за минуту',
      imageUrl: 'https://cdn.reloc.ru/banners/topup-banner.jpg',
      linkUrl: '/catalog?type=TOPUP_CARD',
      position: 'promo',
      isActive: true,
      sortOrder: 1,
    },
  ];

  for (const banner of banners) {
    const existing = await prisma.banner.findFirst({ where: { title: banner.title } });
    if (!existing) {
      await prisma.banner.create({ data: banner });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
