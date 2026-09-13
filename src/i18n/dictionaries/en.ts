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
    about: "About",
    contacts: "Contact",
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
    opponent: "Opponent",
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
    seoHeading: "Play tic tac toe online",
    seoText:
      "Tic tac toe (also known as noughts and crosses, or Xs and Os) is a simple classic for kids and grown-ups alike. Play it free in your browser with no sign-up: against the computer, with a friend over a shared link, or against a random player online. Pick a 3×3, 4×4, 5×5 or 6×6 board and start a match.",
  },

  profileDialog: {
    titleForFriend: "How should we introduce you to your friend?",
    titleForOpponent: "How should we introduce you to your opponent?",
    descriptionDefault:
      "Enter your name and, if you like, your age. Your friend will see this during the game.",
    descriptionHost:
      "Enter your name and, if you like, your age. We'll then create the game and show you a link to share.",
    descriptionJoin:
      "Enter your name and, if you like, your age — whoever created the game will see it on screen.",
    descriptionRandom:
      "Enter your name and, if you like, your age — your random opponent will see it during the game.",
    nameLabel: "Name",
    namePlaceholder: "Maria",
    ageLabel: "Age",
    ageOptional: "(optional)",
    agePlaceholder: "12",
    submit: "Continue",
    errorNameRequired: "Please enter a name",
    errorNameTooLong: "That name is too long (32 characters max)",
    errorAgeRange: "Age must be between 1 and 120",
  },

  modeSelector: {
    label: "Choose a game mode",
    computer: "vs Computer",
    computerDescription: "Practise against the bot",
    friend: "With a friend",
    friendDescription: "Create a link and send an invite",
    random: "Random player",
    randomDescription: "Find an opponent online",
    queueLabel: "Players searching for an opponent, by board size",
    queueCount: (count: number): string => {
      if (count === 0) return "0";
      return count === 1 ? "1 waiting" : `${count} waiting`;
    },
  },

  boardSize: {
    label: "Choose a board size",
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
    title: "Waiting for your friend",
    hint: "Send the link or the invite code to the other player",
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

  footer: {
    text: "This site was made for my beloved daughter Maria. By Dmitrii Seitsman. © 2026",
  },

  profile: {
    formatAge: (age: number): string =>
      age === 1 ? "1 year old" : `${age} years old`,
  },
};
