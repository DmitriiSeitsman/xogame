import type { BoardSize, PlayerSymbol } from "../../types/game";

/**
 * Russian is the source of truth for the dictionary shape: `en.ts` is typed
 * as `Dictionary`, so a missing or misspelled key is a compile error rather
 * than a string silently falling back to a key name at runtime.
 *
 * Parameterised entries are plain functions — that keeps interpolation
 * type-checked (no `t("key", { n })` bags of unknown props) and costs
 * nothing at runtime. Deliberately NOT `as const`: literal types would make
 * the English dictionary unassignable to this shape.
 */
export const ru = {
  nav: {
    home: "Главная",
    rules: "Правила",
    strategy: "Как выиграть",
    about: "Об игре",
    contacts: "Контакты",
    menu: "Меню",
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    siteNavigation: "Навигация по сайту",
    languageSwitcher: "Язык интерфейса",
  },

  theme: {
    label: "Тема оформления",
    light: "Светлая",
    dark: "Тёмная",
  },

  common: {
    close: "Закрыть",
    cancel: "Отмена",
    goHome: "На главную",
    error: "Ошибка",
    loading: "Загрузка...",
    advertisement: "Реклама",
    player: "Игрок",
    opponent: "Соперник",
  },

  home: {
    heading: "Крестики-нолики онлайн",
    subtitle:
      "Играй бесплатно с компьютером, другом по ссылке или случайным соперником",
    settingsLabel: "Настройки игры",
    sectionTitle: "Играть бесплатно без регистрации",
    start: "Начать игру",
    createGame: "Создать игру",
    creatingGame: "Создаём игру…",
    joinSectionLabel: "Присоединение по коду",
    joinLabel: "Есть код приглашения?",
    inviteCodeLabel: "Код приглашения",
    join: "Присоединиться",
    errorEnterInviteCode: "Введите код приглашения",
    errorStartFailed: "Не удалось начать игру",
    /* The tail of the home page. Two sentences carry the phrases people
       actually search for; everything longer lives on its own page, where
       it can rank for its own query instead of diluting this one. */
    teaser:
      "Играть в крестики-нолики онлайн можно бесплатно и без регистрации, на телефоне и на компьютере: поля 3×3, 4×4, 5×5 и 6×6, игра с компьютером, с другом по ссылке или со случайным соперником.",
    linksLabel: "Полезные страницы",
    linkStrategyTitle: "Как выиграть",
    linkStrategyText: "Стратегия, вилки и почему 3×3 — всегда ничья",
    linkRulesTitle: "Правила игры",
    linkRulesText: "Условия победы на полях 3×3, 4×4, 5×5 и 6×6",
    linkAboutTitle: "Об игре",
    linkAboutText: "Что умеет сайт и на каких устройствах работает",
  },

  profileDialog: {
    titleForFriend: "Как вас представить другу?",
    titleForOpponent: "Как вас представить сопернику?",
    descriptionDefault:
      "Укажите имя и, если хотите, возраст. Друг увидит эти данные во время игры.",
    descriptionHost:
      "Укажите имя и, если хотите, возраст. После этого мы создадим игру и покажем ссылку для друга.",
    descriptionJoin:
      "Укажите имя и, если хотите, возраст — создатель игры увидит их на экране.",
    descriptionRandom:
      "Укажите имя и, если хотите, возраст — случайный соперник увидит их во время игры.",
    nameLabel: "Имя",
    namePlaceholder: "Мария",
    ageLabel: "Возраст",
    ageOptional: "(необязательно)",
    agePlaceholder: "12",
    submit: "Продолжить",
    errorNameRequired: "Введите имя",
    errorNameTooLong: "Имя слишком длинное (максимум 32 символа)",
    errorAgeRange: "Возраст должен быть от 1 до 120",
  },

  modeSelector: {
    label: "Выберите режим игры",
    computer: "С компьютером",
    computerDescription: "Тренируйся против бота",
    friend: "С другом",
    friendDescription: "Создай ссылку и отправь приглашение",
    random: "Случайный игрок",
    randomDescription: "Найди соперника онлайн",
  },

  boardSize: {
    label: "Выберите размер поля",
    queueLabel: "Игроки в поиске соперника по размеру поля",
    /** "1 игрок", "2 игрока", "5 игроков" — обычные правила счётной формы,
     * с исключением для 11–14. */
    playersWaiting: (count: number): string => {
      const mod10 = count % 10;
      const mod100 = count % 100;
      if (mod100 >= 11 && mod100 <= 14) return `${count} игроков`;
      if (mod10 === 1) return `${count} игрок`;
      if (mod10 >= 2 && mod10 <= 4) return `${count} игрока`;
      return `${count} игроков`;
    },
  },

  difficulty: {
    label: "Сложность бота",
    easy: "Лёгкий",
    medium: "Средний",
    hard: "Сложный",
  },

  symbolTheme: {
    sectionLabel: "Выбор темы символов",
    heading: "Тема символов",
    hint: "Выберите классические значки или волшебную тему",
    classic: "Классика",
    magic: "Волшебная",
  },

  board: {
    label: (size: BoardSize): string => `Игровое поле ${size} на ${size}`,
    emptyCell: (cellNumber: number): string => `Пустая клетка ${cellNumber}`,
    occupiedCell: (cellNumber: number, value: string): string =>
      `Клетка ${cellNumber} занята ${value}`,
  },

  symbols: {
    cross: "Крестик",
    nought: "Нолик",
    heart: "Сердечко",
  },

  game: {
    loading: "Загрузка игры...",
    notFound: "Игра не найдена",
    heading: "Игра",
    waitingFriendTitle: "Ждём друга…",
    waitingFriendSubtitle: "Поделитесь ссылкой или кодом приглашения",
    waitingRandomTitle: "Ищем соперника…",
    cancelSearch: "Отменить",
    opponentPrefix: "Соперник:",
    botThinking: "Бот думает",
    botPreparing: "Подготовка к расчёту…",
    botProgress: (percent: number): string => `Анализ ходов: ${percent}%`,
    computerGame: "Игра с компьютером",
    boardSubtitle: (size: BoardSize): string => `Поле ${size}×${size}`,
    boardWinSubtitle: (size: BoardSize, winLength: number): string =>
      `Поле ${size}×${size} · победа: ${winLength} в ряд`,
    localSubtitle: (
      size: BoardSize,
      winLength: number,
      difficulty: string,
    ): string =>
      `Поле ${size}×${size} · победа: ${winLength} в ряд · бот: ${difficulty}`,
    playAgain: "Играть снова",
    draw: "Ничья",
    winnerIs: (symbol: PlayerSymbol): string => `Победитель: ${symbol}`,
    errorMoveFailed: "Не удалось сделать ход",
    errorRematchOffer: "Не удалось предложить реванш",
    errorRematchStart: "Не удалось начать новую партию",
    errorCancelSearch: "Не удалось отменить поиск",
    errorSearchInterrupted: "Поиск соперника прерван",
  },

  rematch: {
    hostTitle: "Хотите сыграть ещё раз?",
    yes: "Да",
    no: "Нет",
    guestTitle: (hostLabel: string): string =>
      `Игрок ${hostLabel} предлагает сыграть ещё раз`,
    play: "Играть",
    waitingForFriend: "Ждём ответа друга…",
    declinedByFriend: "Друг отказался от реванша",
    declined: "Реванш отменён",
  },

  winner: {
    draw: "Ничья!",
    youWon: "Вы победили!",
    youLost: "Вы проиграли",
    turnOf: (symbol: PlayerSymbol): string => `Ход: ${symbol}`,
    yourTurn: "Ваш ход",
    opponentTurn: "Ход соперника",
  },

  chat: {
    title: "Чат",
    label: "Чат с соперником",
    empty: "Пока тихо… напишите первым! 👋",
    inputPlaceholder: "Сообщение…",
    inputLabel: "Текст сообщения",
    send: "Отправить",
    open: "Открыть чат",
    close: "Закрыть чат",
  },

  presence: {
    disconnectedTitle: (name: string): string => `${name} отключился`,
    disconnectedDescription:
      "Возможно, дело в связи — можно подождать немного, соперник может вернуться в игру.",
    wait: "Подождать",
    leaveGame: "Выйти из игры",
    waitingFor: (name: string): string => `Ждём ${name}…`,
    leave: "Выйти",
  },

  connection: {
    title: "Восстанавливаем соединение…",
    subtitle:
      "Проверьте подключение к интернету — переподключимся автоматически",
  },

  invite: {
    title: "Ждём друга",
    hint: "Отправьте ссылку или код приглашения второму игроку",
    copyLink: "Копировать ссылку",
    share: "Поделиться",
    copyCode: "Копировать код",
    linkCopied: "Ссылка скопирована",
    codeCopied: "Код скопирован",
    shareFailed: "Не удалось поделиться",
    shareTitle: "Крестики-нолики",
    shareText: "Присоединяйся к игре!",
  },

  join: {
    dialogTitle: "Как вас представить сопернику?",
    dialogDescription:
      "Укажите имя и, если хотите, возраст — создатель игры увидит их на экране.",
    errorNoCode: "Код приглашения не указан",
    errorJoinFailed: "Не удалось подключиться к игре",
    connecting: "Подключение...",
    connectingMessage: "Присоединяемся к игре",
  },

  rules: {
    heading: "Правила игры в крестики-нолики",
    intro:
      "Крестики-нолики — игра, где игроки по очереди ставят свои символы на поле. Побеждает тот, кто первым соберёт нужное количество символов в ряд: по горизонтали, вертикали или диагонали.",
    sizesHeading: "Размеры поля",
    sizes: [
      "3×3 — классическое поле из 9 клеток",
      "4×4 — поле из 16 клеток",
      "5×5 — поле из 25 клеток",
      "6×6 — поле из 36 клеток",
    ],
    winHeading: "Условия победы",
    winConditions: [
      "На поле 3×3 нужно собрать 3 символа в ряд",
      "На поле 4×4 нужно собрать 4 символа в ряд",
      "На поле 5×5 нужно собрать 4 символа в ряд",
      "На поле 6×6 нужно собрать 4 символа в ряд",
    ],
    modesHeading: "Режимы игры",
    modeComputer: "С компьютером",
    modeComputerText: "тренируйтесь против бота без регистрации",
    modeFriend: "С другом",
    modeFriendText: "создайте ссылку-приглашение и отправьте её второму игроку",
    modeRandom: "Случайный игрок",
    modeRandomText: "найдите соперника онлайн через matchmaking",
    startGame: "Начать игру",
  },

  strategy: {
    heading: "Как выиграть в крестики-нолики",
    intro:
      "Короткий ответ: на поле 3×3 выиграть у внимательного соперника нельзя — при точной игре обеих сторон партия всегда заканчивается ничьей. Побеждают за счёт чужих ошибок, а чтобы не ошибаться самому, достаточно знать четыре вещи: силу первого хода, что такое вилка, в каком порядке выбирать клетки и чем отличаются большие поля.",
    firstMoveHeading: "Первый ход: центр, угол, сторона",
    firstMoveText:
      "Через центр проходят четыре линии из восьми, через угол — три, через боковую клетку — всего две. Поэтому центр сильнее всего, угол идёт вторым, а ход в сторону почти всегда отдаёт инициативу. Если центр уже занят соперником, отвечайте в угол: ответ в сторону проигрывает.",
    forkHeading: "Вилка — главный приём",
    forkText:
      "Вилка — это ход, после которого у вас появляются сразу две возможности закрыть ряд. Соперник закроет одну, вы соберёте вторую. Практически каждая победа выглядит именно так, поэтому вся игра сводится к тому, чтобы строить свои вилки и не давать построить чужую.",
    priorityHeading: "Порядок приоритетов на каждом ходу",
    priority: [
      "Можете закрыть свой ряд — закрывайте и выигрывайте",
      "Соперник собирает ряд — блокируйте",
      "Можете построить вилку — стройте",
      "Соперник может построить вилку — займите эту клетку или создайте угрозу, на которую он обязан ответить",
      "Свободен центр — занимайте центр",
      "Соперник стоит в углу — занимайте угол напротив",
      "Свободен любой угол — занимайте угол",
      "Остаётся только боковая клетка",
    ],
    priorityNote:
      "Этот список — полная стратегия для поля 3×3: игрок, который идёт по нему сверху вниз, не проигрывает ни одной партии.",
    bigBoardsHeading: "Поля 4×4, 5×5 и 6×6: четыре в ряд",
    bigBoardsText:
      "На больших полях побеждает тот, кто первым соберёт четыре знака подряд — по горизонтали, вертикали или диагонали. Ключевая фигура здесь — открытая тройка: три своих знака, у которых свободны обе стороны. Одним ходом её не закрыть, поэтому она почти всегда означает победу. Отсюда два правила: строить свои тройки так, чтобы оба конца оставались свободными, и рубить чужие раньше, чем они станут открытыми.",
    botHeading: "Как обыграть компьютер",
    botText:
      "На лёгком уровне бот ходит неточно, и его наказывает обычная вилка. На сложном уровне на поле 3×3 он не ошибается, так что лучший достижимый результат — ничья. Хотите играть на победу — берите поле побольше: там заметно больше пространства для двойных угроз.",
    faqHeading: "Частые вопросы",
    rulesLink: "Правила игры",
    startGame: "Проверить в игре",
  },

  about: {
    heading: "Крестики-нолики онлайн",
    intro:
      "Крестики-нолики онлайн — бесплатная браузерная игра, в которую можно играть без регистрации. Вы можете выбрать режим с компьютером, создать приглашение для друга или найти случайного соперника онлайн.",
    freeHeading: "Бесплатно и без регистрации",
    freeText:
      "Не нужно создавать аккаунт или устанавливать приложение. Откройте сайт в браузере и начните партию за несколько секунд.",
    familyHeading: "Для детей и взрослых",
    familyText:
      "Игра понятна с первого хода, подходит для семейного досуга и коротких онлайн-партий с друзьями.",
    devicesHeading: "На телефоне, планшете и компьютере",
    devicesText:
      "Сайт адаптирован под мобильные устройства и десктоп. Можно играть дома, в дороге или на перерыве.",
    modesHeading: "Режимы и размеры поля",
    modes: [
      "Игра с компьютером",
      "Игра с другом по ссылке",
      "Игра со случайным игроком",
      "Поля 3×3, 4×4, 5×5 и 6×6",
    ],
    startGame: "Начать игру",
  },

  contacts: {
    heading: "Контакты",
    intro:
      "Если у вас есть вопрос, предложение или вы нашли ошибку — напишите разработчику. Ответим, когда сможем.",
    sectionHeading: "Связаться с разработчиком",
    sectionText:
      "Выберите удобный способ связи: Telegram или электронная почта.",
    telegram: "Написать в Telegram",
    email: "Написать на почту",
    emailSubject: "КРЕСТИКИ-НОЛИКИ",
  },

  footer: {
    text: "Этот сайт разработан для моей любимой дочери Марии. Автор: Дмитрий Сейцман. © 2026",
  },

  profile: {
    formatAge: (age: number): string => {
      const mod10 = age % 10;
      const mod100 = age % 100;
      if (mod100 >= 11 && mod100 <= 14) return `${age} лет`;
      if (mod10 === 1) return `${age} год`;
      if (mod10 >= 2 && mod10 <= 4) return `${age} года`;
      return `${age} лет`;
    },
  },
};

export type Dictionary = typeof ru;
