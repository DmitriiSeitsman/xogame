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
    seoHeading: "Играть в крестики-нолики онлайн",
    seoText:
      "Крестики-нолики — простая и знакомая игра для детей и взрослых. На сайте можно играть бесплатно без регистрации: против компьютера, с другом по ссылке или со случайным игроком онлайн. Выберите поле 3×3, 4×4, 5×5 или 6×6 и начните партию.",
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
    queueLabel: "Игроки в поиске соперника по размеру поля",
    queueCount: (count: number): string => {
      if (count === 0) return "0";
      const mod10 = count % 10;
      const mod100 = count % 100;
      if (mod100 >= 11 && mod100 <= 14) return `${count} ищут`;
      if (mod10 === 1) return `${count} ищет`;
      return `${count} ищут`;
    },
  },

  boardSize: {
    label: "Выберите размер поля",
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
