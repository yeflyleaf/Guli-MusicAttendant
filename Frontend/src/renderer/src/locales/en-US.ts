/**
 * English Language Pack
 */
export default {
  // Common
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    done: 'Done',
    add: 'Add',
    remove: 'Remove',
    search: 'Search',
    reset: 'Reset',
    refresh: 'Refresh',
    loading: 'Loading...',
    noData: 'No Data',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    selectAll: 'Select All',
    total: 'Total',
    songs: 'songs',
    playlists: 'playlists',
    favorites: 'favorites'
  },

  // Navigation
  nav: {
    home: 'Home',
    localMusic: 'Local Music',
    favorites: 'Favorites',
    recentlyPlayed: 'Recently Played',
    playlists: 'Playlists',
    settings: 'Settings'
  },

  // Settings Page
  settings: {
    title: 'Settings',
    // Appearance
    appearance: {
      title: 'Appearance',
      sectionTitle: 'Appearance Settings',
      theme: 'Theme',
      themeDesc: 'Choose the application appearance theme',
      themeDark: 'Dark Mode',
      themeLight: 'Light Mode',
      language: 'Language',
      languageDesc: 'Choose the application language',
      fontSize: 'Font Size',
      fontSizeDesc: 'Adjust the application font size',
      page: 'Page',
      localMusicHeaders: 'Local Music List Headers',
      localMusicHeadersDesc: 'Choose which columns to display in the local music list',
      headerTitle: 'Title',
      headerArtist: 'Artist',
      headerAlbum: 'Album',
      headerDuration: 'Duration',
      headerCreatedAt: 'Date Added',
      // Audio Visualization
      visualization: 'Audio Visualization',
      visualizerEnabled: 'Enable Visualization',
      visualizerEnabledDesc: 'Show audio spectrum visualization during playback',
      visualizerStyle: 'Style',
      visualizerStyleDesc: 'Choose visualization effect style',
      styleBars: 'Bars',
      styleWave: 'Wave',
      styleSpectrum: 'Spectrum Gradient',
      styleMirror: 'Mirror Bars',
      styleMountain: 'Mountain Curve',
      visualizerFrameRate: 'Frame Rate',
      visualizerFrameRateDesc: 'Adjust visualization animation frame rate'
    },
    // Behavior
    behavior: {
      title: 'Behavior',
      sectionTitle: 'Behavior Settings',
      rememberPlaybackStatus: 'Playback Status',
      rememberPlaybackStatusDesc: 'Remember playback status after restart (queue, progress, loop, shuffle)',
      gaplessPlayback: 'Gapless Playback',
      gaplessPlaybackDesc: 'Eliminate gaps when switching songs',
      autoScan: 'Auto Scan on Startup',
      autoScanDesc: 'Automatically scan music folders for new songs on each startup',
      disableSplashScreen: 'Disable splash screen on next startup',
      disableSplashScreenDesc: 'When enabled, the application will skip the opening animation on the next launch',
      showSplashScreen: 'Show splash screen immediately',
      showSplashScreenDesc: 'Play the opening animation once again',
      showSplashScreenBtn: 'Show Immediately',
      splashTheme: 'Splash Screen Theme',
      splashThemeDesc: 'Choose the visual style for the splash screen',
      splashThemeCosmic: 'Cosmic Voyage',
      splashThemeEmerald: 'Emerald Sanctuary',
      splashThemeMolten: 'Thermal Impact',
      splashThemeAbyss: 'Bioluminescent Abyss',
      splashThemeBrass: 'Brass Era',
      splashThemePrism: 'Sub-zero Prism',
      splashThemeSanctum: 'Sanctum of Truth',
      splashThemeSilicon: 'Silicon Order',
      splashThemeEthereal: 'Minimalist Geometry',
      splashThemeCyber: 'Cyber Cityscape',
      splashThemeSakura: 'Zen Cherry Blossom',
      splashThemeChronos: 'Chronos Rift'
    },
    // Library
    library: {
      title: 'Library',
      sectionTitle: 'Music Folders',
      addFolder: 'Add Folder',
      scanAll: 'Scan All Folders',
      emptyFolders: 'No music folders added yet',
      folderAdded: 'Folder added',
      folderRemoved: 'Folder removed',
      confirmRemoveFolder: 'Are you sure you want to remove folder "{folder}"?\n(This will not delete song data)',
      addFolderFirst: 'Please add a music folder first',
      scanning: 'Scanning music files...',
      scanComplete: 'Scan complete: {count} new songs added',
      scanFailed: 'Scan failed'
    },
    // About
    about: {
      title: 'About',
      sectionTitle: 'About',
      appName: 'Guli Music Assistant',
      version: 'Version',
      description: 'Local music management system, built with Electron + Vue 3 + TypeScript.',
      resetSettings: 'Reset Settings',
      resetSettingsDesc: 'Restore all settings to default values',
      confirmReset: 'Are you sure you want to restore all settings to default values?',
      resetTitle: 'Reset Settings',
      resetSuccess: 'Settings have been reset'
    }
  },

  // Home Page
  home: {
    welcome: 'Welcome Back',
    statistics: 'Music Statistics',
    recentlyPlayed: 'Recently Played',
    myFavorites: 'My Favorites',
    myPlaylists: 'My Playlists',
    viewAll: 'View All',
    noRecentlyPlayed: 'No playback history',
    noFavorites: 'No favorites yet',
    noPlaylists: 'No playlists yet'
  },

  // Local Music
  localMusic: {
    title: 'Local Music',
    playAll: 'Play All',
    addAll: 'Add All',
    searchPlaceholder: 'Search local music...',
    noMusic: 'No local music',
    noSearchResult: 'No matching songs found',
    confirmDelete: 'Are you sure you want to delete {count} selected song(s)?',
    deleteSuccess: 'Deleted {count} song(s)',
    removeSelected: 'Remove Selected',
    showInFolder: 'Show in Folder'
  },

  // Favorites
  favoriteMusic: {
    title: 'Favorites',
    searchPlaceholder: 'Search favorites...',
    noFavorites: 'No favorite songs yet',
    noSearchResult: 'No matching songs found',
    confirmUnfavorite: 'Are you sure you want to unfavorite {count} selected song(s)?',
    unfavoriteSuccess: 'Unfavorited {count} song(s)',
    unfavoriteSelected: 'Unfavorite Selected'
  },

  // Recently Played
  recentlyPlayed: {
    title: 'Recently Played',
    searchPlaceholder: 'Search recently played...',
    noHistory: 'No playback history',
    noSearchResult: 'No matching songs found',
    confirmRemove: 'Are you sure you want to remove {count} selected song(s) from history?',
    removeSuccess: 'Removed {count} song(s) from history',
    removeSelected: 'Remove Selected',
    clearAll: 'Clear History',
    confirmClearAll: 'Are you sure you want to clear all playback history?',
    clearSuccess: 'Playback history cleared'
  },

  // Playlist
  playlist: {
    title: 'My Playlists',
    searchPlaceholder: 'Search playlists...',
    createNew: 'Create Playlist',
    noPlaylists: 'No playlists yet',
    noSearchResult: 'No matching playlists found',
    playlistName: 'Playlist Name',
    confirmDelete: 'Are you sure you want to delete playlist "{name}"?',
    deleteSuccess: 'Playlist deleted',
    createSuccess: 'Playlist created',
    renameSuccess: 'Playlist renamed',
    addToPlaylist: 'Add to Playlist',
    addSuccess: 'Added to playlist',
    removeFromPlaylist: 'Remove from Playlist',
    removeSuccess: 'Removed from playlist',
    songCount: '{count} songs'
  },

  // Player
  player: {
    play: 'Play',
    pause: 'Pause',
    previous: 'Previous',
    next: 'Next',
    playQueue: 'Play Queue',
    clearQueue: 'Clear Queue',
    emptyQueue: 'Play queue is empty',
    addToQueue: 'Add to Queue',
    nowPlaying: 'Now Playing',
    noLyrics: 'No lyrics available',
    playModeSequence: 'Sequential',
    playModeLoop: 'Loop All',
    playModeSingle: 'Repeat One',
    playModeRandom: 'Shuffle',
    // Path validation
    pathValidationTitle: 'Cannot Play',
    pathValidationFailed: 'Cannot play song "{title}"',
    filePath: 'File path: {path}',
    notInMusicFolder: 'This song is not in the configured music folders.',
    currentMusicFolders: 'Current music folders:',
    fileExistsButNotInFolder: 'Note: The file is not in the specified music folders. You can add the corresponding folder in "Settings" → "Library".',
    fileNotFound: 'Note: This file does not exist locally, it may have been moved or deleted.',
    removeFromList: 'Remove from List'
  },

  // Language Names
  languages: {
    'zh-CN': '简体中文',
    'en-US': 'English',
    'ar-SA': 'العربية',
    'fr-FR': 'Français',
    'ru-RU': 'Русский',
    'es-ES': 'Español'
  }
}
