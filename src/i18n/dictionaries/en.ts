import type { BoardSize, PlayerSymbol } from "../../types/game";
import type { Dictionary } from "./ru";

/**
 * English copy. Typed as `Dictionary`, so TypeScript flags any key that
 * `ru.ts` has and this doesn't (and vice-versa for signatures).
 *
 * Wording targets the phrases English speakers actually search for
 * ("tic tac toe online", "play free", "with a friend") rather than being a
 * literal translation of the Russian.
 */
export const en: Dictionary = {
  nav: {
    home: "Home",
    rules: "Rules",
    strategy: "How to win",
    about: "About",
    contacts: "Contact",
    privacy: "Privacy",
    menu: "Menu",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    siteNavigation: "Site navigation",
    languageSwitcher: "Interface language",
  },

  theme: {
    label: "Colour theme",
    light: "Light",
    dark: "Dark",
  },

  common: {
    close: "Close",
    cancel: "Cancel",
    goHome: "Back to home",
    error: "Something went wrong",
    loading: "Loading…",
    advertisement: "Advertisement",
    player: "Player",
    player1: "Player 1",
    player2: "Player 2",
    opponent: "Opponent",
    rateLimited: "Too many attempts in a row. Wait a minute and try again.",
  },

  home: {
    heading: "Tic Tac Toe Online",
    subtitle:
      "Play for free against the computer, a friend by link, or a random opponent",
    settingsLabel: "Game settings",
    sectionTitle: "Play free, no sign-up needed",
    start: "Start game",
    createGame: "Create game",
    creatingGame: "Creating game…",
    joinSectionLabel: "Join with a code",
    joinLabel: "Got an invite code?",
    inviteCodeLabel: "Invite code",
    join: "Join",
    errorEnterInviteCode: "Enter an invite code",
    errorStartFailed: "Couldn't start the game",
    teaser:
      "Play tic tac toe online for free, with no sign-up, on a phone or a desktop: 3×3, 4×4, 5×5 and 6×6 boards, against the computer, with a friend over a link, or against a random opponent.",
    linksLabel: "Useful pages",
    linkStrategyTitle: "How to win",
    linkStrategyText: "Strategy, forks, and why 3×3 is always a draw",
    linkRulesTitle: "Rules of the game",
    linkRulesText: "Winning conditions on 3×3, 4×4, 5×5 and 6×6 boards",
    linkAboutTitle: "About the game",
    linkAboutText: "What the site does and which devices it runs on",
  },

  profileDialog: {
    titleForFriend: "How should we introduce you to your friend?",
    titleForOpponent: "How should we introduce you to your opponent?",
    descriptionDefault:
      "You can add a name — your friend will see it during the game. No need for a surname.",
    descriptionHost:
      "You can add a name — your friend will see it during the game. Leave it blank and you'll be \"Player 1\". No need for a surname.",
    descriptionJoin:
      "You can add a name — whoever created the game will see it on screen. Leave it blank and you'll be \"Player 2\". No need for a surname.",
    descriptionRandom:
      "You can add a name — your opponent will see it during the game. Leave it blank and you'll be \"Player 1\" or \"Player 2\". Best not to use your full real name.",
    nameLabel: "Name",
    optional: "(optional)",
    submit: "Continue",
    errorNameTooLong: "That name is too long (32 characters max)",
  },

  modeSelector: {
    label: "Choose a game mode",
    computer: "vs Computer",
    computerDescription: "Practise against the bot",
    friend: "With a friend",
    friendDescription: "Create a link and send an invite",
    random: "Random player",
    randomDescription: "Find an opponent online",
  },

  boardSize: {
    label: "Choose a board size",
    queueLabel: "Players searching for an opponent, by board size",
    playersWaiting: (count: number): string =>
      count === 1 ? "1 player" : `${count} players`,
  },

  difficulty: {
    label: "Bot difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  },

  symbolTheme: {
    sectionLabel: "Symbol theme selection",
    heading: "Symbol theme",
    hint: "Pick the classic marks or the magic theme",
    classic: "Classic",
    magic: "Magic",
  },

  board: {
    label: (size: BoardSize): string => `${size} by ${size} game board`,
    emptyCell: (cellNumber: number): string => `Empty cell ${cellNumber}`,
    occupiedCell: (cellNumber: number, value: string): string =>
      `Cell ${cellNumber} taken by ${value}`,
  },

  symbols: {
    cross: "X",
    nought: "O",
    heart: "Heart",
  },

  game: {
    loading: "Loading game…",
    notFound: "Game not found",
    heading: "Game",
    waitingFriendTitle: "Waiting for your friend…",
    waitingFriendSubtitle: "Share the link or the invite code",
    waitingRandomTitle: "Looking for an opponent…",
    cancelSearch: "Cancel",
    opponentPrefix: "Opponent:",
    botThinking: "Bot is thinking",
    botPreparing: "Getting ready to calculate…",
    botProgress: (percent: number): string => `Analysing moves: ${percent}%`,
    computerGame: "Game vs computer",
    boardSubtitle: (size: BoardSize): string => `${size}×${size} board`,
    boardWinSubtitle: (size: BoardSize, winLength: number): string =>
      `${size}×${size} board · win: ${winLength} in a row`,
    localSubtitle: (
      size: BoardSize,
      winLength: number,
      difficulty: string,
    ): string =>
      `${size}×${size} board · win: ${winLength} in a row · bot: ${difficulty}`,
    playAgain: "Play again",
    draw: "Draw",
    winnerIs: (symbol: PlayerSymbol): string => `Winner: ${symbol}`,
    errorMoveFailed: "Couldn't make that move",
    errorRematchOffer: "Couldn't offer a rematch",
    errorRematchStart: "Couldn't start a new match",
    errorCancelSearch: "Couldn't cancel the search",
    errorSearchInterrupted: "The opponent search was interrupted",
  },

  rematch: {
    hostTitle: "Fancy another game?",
    yes: "Yes",
    no: "No",
    guestTitle: (hostLabel: string): string =>
      `${hostLabel} wants a rematch`,
    play: "Play",
    waitingForFriend: "Waiting for your friend…",
    declinedByFriend: "Your friend turned down the rematch",
    declined: "Rematch cancelled",
  },

  winner: {
    draw: "It's a draw!",
    youWon: "You won!",
    youLost: "You lost",
    turnOf: (symbol: PlayerSymbol): string => `Turn: ${symbol}`,
    yourTurn: "Your turn",
    opponentTurn: "Opponent's turn",
  },

  chat: {
    title: "Chat",
    label: "Chat with your opponent",
    empty: "All quiet… say hi first! 👋",
    inputPlaceholder: "Message…",
    inputLabel: "Message text",
    send: "Send",
    open: "Open chat",
    close: "Close chat",
  },

  presence: {
    disconnectedTitle: (name: string): string => `${name} disconnected`,
    disconnectedDescription:
      "It might just be a connection hiccup — wait a moment and they may come back.",
    wait: "Wait",
    leaveGame: "Leave game",
    waitingFor: (name: string): string => `Waiting for ${name}…`,
    leave: "Leave",
  },

  connection: {
    title: "Reconnecting…",
    subtitle: "Check your internet connection — we'll reconnect automatically",
  },

  invite: {
    copyLink: "Copy link",
    share: "Share",
    copyCode: "Copy code",
    linkCopied: "Link copied",
    codeCopied: "Code copied",
    shareFailed: "Couldn't share",
    shareTitle: "Tic Tac Toe",
    shareText: "Come join my game!",
  },

  join: {
    dialogTitle: "How should we introduce you to your opponent?",
    dialogDescription:
      "Enter your name and, if you like, your age — whoever created the game will see it on screen.",
    errorNoCode: "No invite code given",
    errorJoinFailed: "Couldn't join the game",
    connecting: "Connecting…",
    connectingMessage: "Joining the game",
  },

  rules: {
    heading: "Tic Tac Toe Rules",
    intro:
      "Tic tac toe is a game where players take turns placing their mark on the board. The first to line up the required number of marks in a row — horizontally, vertically or diagonally — wins.",
    sizesHeading: "Board sizes",
    sizes: [
      "3×3 — the classic board of 9 cells",
      "4×4 — a board of 16 cells",
      "5×5 — a board of 25 cells",
      "6×6 — a board of 36 cells",
    ],
    winHeading: "How to win",
    winConditions: [
      "On a 3×3 board you need 3 marks in a row",
      "On a 4×4 board you need 4 marks in a row",
      "On a 5×5 board you need 4 marks in a row",
      "On a 6×6 board you need 4 marks in a row",
    ],
    modesHeading: "Game modes",
    modeComputer: "vs Computer",
    modeComputerText: "practise against the bot, no sign-up required",
    modeFriend: "With a friend",
    modeFriendText: "create an invite link and send it to the other player",
    modeRandom: "Random player",
    modeRandomText: "find an opponent online through matchmaking",
    startGame: "Start game",
  },

  strategy: {
    heading: "How to Win at Tic Tac Toe",
    intro:
      "The short answer: on a 3×3 board you cannot beat an attentive opponent — with perfect play from both sides the game always ends in a draw. Wins come from mistakes, and to avoid making them yourself you only need four things: the value of the first move, what a fork is (a move that leaves you two ways to complete a line at once — the opponent cannot block both), the order in which to claim squares, and how bigger boards differ.",
    firstMoveHeading: "The first move: centre, corner, edge",
    firstMoveText:
      "Four of the eight winning lines run through the centre, three through a corner and only two through an edge square. That makes the centre the strongest opening, a corner the runner-up, and an edge a move that usually hands over the initiative. If the opponent takes the centre first, reply in a corner — answering on an edge loses.",
    forkHeading: "The fork is the whole game",
    forkText:
      "A fork is a move that leaves you with two ways to complete a line at once. The opponent blocks one, you finish the other. Virtually every win looks like this, so the game comes down to building your own forks and denying theirs.",
    priorityHeading: "Move priority, in order",
    priority: [
      "You can complete a line — complete it and win",
      "The opponent is one move from a line — block it",
      "You can create a fork — create it",
      "The opponent can create a fork — take that square, or make a threat they must answer",
      "The centre is free — take the centre",
      "The opponent holds a corner — take the opposite corner",
      "Any corner is free — take a corner",
      "Only an edge square is left",
    ],
    priorityNote:
      "That list is the complete strategy for a 3×3 board: a player who works down it never loses a game.",
    bigBoardsHeading: "4×4, 5×5 and 6×6: four in a row",
    bigBoardsText:
      "Bigger boards go to whoever first lines up four marks — horizontally, vertically or diagonally. The key shape is the open three: three of your marks in a row with an empty square at each end. It cannot be blocked in a single move, so it is nearly always a win. Hence two rules: build your threes so both ends stay free, and cut the opponent's before they open up.",
    botHeading: "How to beat the computer",
    botText:
      "On easy the bot plays loosely and an ordinary fork punishes it. On hard it never errs on a 3×3 board, so a draw is the best result available; if you want to play for a win, pick a bigger board, where there is far more room for double threats.",
    faqHeading: "Frequently asked questions",
    rulesLink: "Rules of the game",
    startGame: "Try it in a game",
  },

  about: {
    heading: "Tic Tac Toe Online",
    intro:
      "Tic tac toe online is a free browser game you can play without signing up. Choose a game against the computer, create an invite for a friend, or find a random opponent online.",
    freeHeading: "Free, with no sign-up",
    freeText:
      "No account to create, no app to install. Open the site in your browser and start a match in seconds.",
    familyHeading: "For kids and grown-ups",
    familyText:
      "The game makes sense from the very first move — good for family time and quick online matches with friends.",
    devicesHeading: "On phone, tablet and desktop",
    devicesText:
      "The site adapts to mobile and desktop alike, so you can play at home, on the move, or on a break.",
    modesHeading: "Modes and board sizes",
    modes: [
      "Play against the computer",
      "Play with a friend over a link",
      "Play against a random player",
      "3×3, 4×4, 5×5 and 6×6 boards",
    ],
    startGame: "Start game",
  },

  contacts: {
    heading: "Contact",
    intro:
      "Got a question, an idea, or spotted a bug? Drop the developer a line and we'll reply when we can.",
    sectionHeading: "Get in touch with the developer",
    sectionText: "Pick whichever suits you: Telegram or email.",
    telegram: "Message on Telegram",
    email: "Send an email",
    emailSubject: "TIC TAC TOE",
  },

  cookieBanner: {
    label: "Cookie consent",
    text: "We use Yandex Metrika cookies to see visit statistics. Metrika only switches on if you agree.",
    more: "Learn more",
    accept: "Accept",
    decline: "Decline",
  },

  privacy: {
    heading: "Privacy Policy",
    intro:
      "In short: we know next to nothing about you and try to keep it that way. A name is optional, we never ask for your age or contact details, chat messages are not stored anywhere, and Yandex Metrika statistics only run with your consent.",
    updated: "Last updated 21 September 2026.",
    sections: [
      {
        heading: "Who is responsible",
        paragraphs: [
          "xo-game.online is made and run by a private individual, Dmitrii Seitsman. For any question about your data, write by email or on Telegram — the contacts are at the end of this page.",
        ],
        items: [],
        links: [],
      },
      {
        heading: "What we receive",
        paragraphs: [
          "We don't ask for a surname, age, email address or phone number, and there is no sign-up. Please don't put anything in your name or in the chat that could be used to find you.",
        ],
        items: [
          "A name — only if you enter one. It's optional: without it you're \"Player 1\" or \"Player 2\". Your opponent in that game sees it.",
          "A random player ID. Your browser creates it on your first visit and keeps it; it isn't linked to who you are and only tells the server whose moves are whose.",
          "Game data: board size, moves, result, invite code.",
          "Technical request data: IP address and time. The server uses them to limit overly frequent requests and to protect against abuse.",
          "Yandex Metrika cookies and data — only if you allow statistics.",
        ],
        links: [],
      },
      {
        heading: "Chat",
        paragraphs: [
          "Chat messages are never saved — not in the database, not in logs. The server only passes them from one player to the other in real time, and once the tab is closed they exist nowhere. We don't read your conversations.",
        ],
        items: [],
        links: [],
      },
      {
        heading: "How long we keep data",
        paragraphs: [],
        items: [
          "Names are erased 24 hours after the last move in the game.",
          "Game records are deleted 30 days after they were created.",
          "Chat messages are not kept at all.",
          "Web server logs with IP addresses are kept for no more than 14 days.",
          "The player ID, the name remembered for next time, and your chosen theme and language live only in your browser — clearing the site's data removes them.",
        ],
        links: [],
      },
      {
        heading: "What we use data for",
        paragraphs: [
          "We don't sell data, don't show personalised ads, and don't share data with anyone except Yandex — and only if you allow statistics.",
        ],
        items: [
          "To run the game and show your name and moves to your opponent.",
          "To protect the service from abuse and overload.",
          "With your consent, to count visits and make the site better.",
        ],
        links: [],
      },
      {
        heading: "Yandex Metrika",
        paragraphs: [
          "Metrika tells us how many people visit and which pages they use. It sets cookies and receives your IP address, device and browser type, and the addresses of pages you view. Session recording (Webvisor) is switched off.",
          "Metrika only loads after you press \"Accept\". You can change your mind at any time further down this page. Data collected by Metrika is processed by Yandex LLC under its own privacy policy.",
        ],
        items: [],
        links: [
          { label: "Yandex Privacy Policy", href: "https://yandex.com/legal/confidential/" },
        ],
      },
      {
        heading: "Children",
        paragraphs: [
          "The game is made for children and adults alike. We deliberately don't ask for age and don't require a name. If a child plays with a stranger, explain that it's best not to write anything about themselves in their name or in the chat.",
        ],
        items: [],
        links: [],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "You can ask what data we hold about you, ask us to delete it, or withdraw consent to statistics. Consent is withdrawn with the button below; for anything else, send an email. Include roughly when you played and the name you used, if any — otherwise we can't tell which records are yours. We reply within 10 working days.",
        ],
        items: [],
        links: [],
      },
    ],
    consentHeading: "Visit statistics",
    consentGranted: "Statistics are currently on.",
    consentDenied: "Statistics are currently off.",
    consentUnset: "You haven't chosen yet, so statistics are off.",
    allow: "Allow statistics",
    deny: "Turn statistics off",
    reloading: "Statistics are off. Reloading the page to stop the counter…",
    contactsHeading: "Contact",
    emailLabel: "Email",
    telegramLabel: "Telegram",
  },

  footer: {
    text: "This site was made for my beloved daughter Maria. By Dmitrii Seitsman. © 2026",
  },
};
