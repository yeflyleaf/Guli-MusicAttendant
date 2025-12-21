/**
 * French Language Pack
 * Pack de langue française
 */
export default {
  // Common
  common: {
    confirm: 'Confirmer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    done: 'Terminé',
    add: 'Ajouter',
    remove: 'Retirer',
    search: 'Rechercher',
    reset: 'Réinitialiser',
    refresh: 'Actualiser',
    loading: 'Chargement...',
    noData: 'Aucune donnée',
    success: 'Succès',
    error: 'Erreur',
    warning: 'Avertissement',
    info: 'Info',
    selectAll: 'Tout sélectionner',
    total: 'Total',
    songs: 'chansons',
    playlists: 'playlists',
    favorites: 'favoris'
  },

  // Navigation
  nav: {
    home: 'Accueil',
    localMusic: 'Musique locale',
    favorites: 'Favoris',
    recentlyPlayed: 'Écoutés récemment',
    playlists: 'Playlists',
    settings: 'Paramètres'
  },

  // Settings Page
  settings: {
    title: 'Paramètres',
    // Appearance
    appearance: {
      title: 'Apparence',
      sectionTitle: 'Paramètres d\'apparence',
      theme: 'Thème',
      themeDesc: 'Choisir le thème d\'apparence de l\'application',
      themeDark: 'Mode sombre',
      themeLight: 'Mode clair',
      language: 'Langue',
      languageDesc: 'Choisir la langue de l\'application',
      fontSize: 'Taille de police',
      fontSizeDesc: 'Ajuster la taille de police de l\'application',
      page: 'Page',
      localMusicHeaders: 'En-têtes de la liste de musique locale',
      localMusicHeadersDesc: 'Choisir les colonnes à afficher dans la liste de musique locale',
      headerTitle: 'Titre',
      headerArtist: 'Artiste',
      headerAlbum: 'Album',
      headerDuration: 'Durée',
      headerCreatedAt: 'Date d\'ajout',
      // Audio Visualization
      visualization: 'Visualisation audio',
      visualizerEnabled: 'Activer la visualisation',
      visualizerEnabledDesc: 'Afficher la visualisation du spectre audio pendant la lecture',
      visualizerStyle: 'Style',
      visualizerStyleDesc: 'Choisir le style de l\'effet de visualisation',
      styleBars: 'Barres',
      styleWave: 'Onde',
      styleSpectrum: 'Dégradé spectral',
      styleMirror: 'Barres miroir',
      styleMountain: 'Courbe montagne',
      visualizerFrameRate: 'Fréquence d\'images',
      visualizerFrameRateDesc: 'Ajuster la fréquence d\'images de l\'animation de visualisation'
    },
    // Behavior
    behavior: {
      title: 'Comportement',
      sectionTitle: 'Paramètres de comportement',
      rememberPlaybackStatus: 'État de lecture',
      rememberPlaybackStatusDesc: 'Mémoriser l\'état de lecture après redémarrage (file d\'attente, progression, boucle, aléatoire)',
      gaplessPlayback: 'Lecture sans interruption',
      gaplessPlaybackDesc: 'Éliminer les pauses lors du changement de chanson',
      autoScan: 'Analyse auto au démarrage',
      autoScanDesc: 'Analyser automatiquement les dossiers de musique pour les nouvelles chansons à chaque démarrage',
      disableSplashScreen: 'Désactiver l\'écran de démarrage au prochain lancement',
      disableSplashScreenDesc: 'Si activé, l\'application sautera l\'animation d\'ouverture au prochain lancement',
      showSplashScreen: 'Afficher l\'écran de démarrage immédiatement',
      showSplashScreenDesc: 'Rejouer l\'animation d\'ouverture une fois de plus',
      showSplashScreenBtn: 'Afficher immédiatement',
      splashTheme: 'Thème de l\'écran de démarrage',
      splashThemeDesc: 'Choisir le style visuel de l\'écran de démarrage',
      splashThemeCosmic: 'Voyage Cosmique',
      splashThemeEmerald: 'Sanctuaire d\'Émeraude',
      splashThemeMolten: 'Impact Thermique',
      splashThemeAbyss: 'Abysse Bioluminescente',
      splashThemeBrass: 'Ère du Laiton',
      splashThemePrism: 'Prisme Zéro Absolu',
      splashThemeSanctum: 'Sanctuaire de la Vérité',
      splashThemeSilicon: 'Ordre du Silicium',
      splashThemeEthereal: 'Géométrie Éthérée'
    },
    // Library
    library: {
      title: 'Bibliothèque',
      sectionTitle: 'Dossiers de musique',
      addFolder: 'Ajouter un dossier',
      scanAll: 'Analyser tous les dossiers',
      emptyFolders: 'Aucun dossier de musique ajouté',
      folderAdded: 'Dossier ajouté',
      folderRemoved: 'Dossier retiré',
      confirmRemoveFolder: 'Êtes-vous sûr de vouloir retirer le dossier "{folder}" ?\n(Les données des chansons ne seront pas supprimées)',
      addFolderFirst: 'Veuillez d\'abord ajouter un dossier de musique',
      scanning: 'Analyse des fichiers musicaux...',
      scanComplete: 'Analyse terminée : {count} nouvelles chansons ajoutées',
      scanFailed: 'Échec de l\'analyse'
    },
    // About
    about: {
      title: 'À propos',
      sectionTitle: 'À propos',
      appName: 'Assistant Musique Guli',
      version: 'Version',
      description: 'Système de gestion de musique locale, construit avec Electron + Vue 3 + TypeScript.',
      resetSettings: 'Réinitialiser les paramètres',
      resetSettingsDesc: 'Restaurer tous les paramètres aux valeurs par défaut',
      confirmReset: 'Êtes-vous sûr de vouloir restaurer tous les paramètres aux valeurs par défaut ?',
      resetTitle: 'Réinitialiser les paramètres',
      resetSuccess: 'Les paramètres ont été réinitialisés'
    }
  },

  // Home Page
  home: {
    welcome: 'Bon retour',
    statistics: 'Statistiques musicales',
    recentlyPlayed: 'Écoutés récemment',
    myFavorites: 'Mes favoris',
    myPlaylists: 'Mes playlists',
    viewAll: 'Voir tout',
    noRecentlyPlayed: 'Aucun historique de lecture',
    noFavorites: 'Aucun favori pour le moment',
    noPlaylists: 'Aucune playlist pour le moment'
  },

  // Local Music
  localMusic: {
    title: 'Musique locale',
    playAll: 'Tout lire',
    addAll: 'Tout ajouter',
    searchPlaceholder: 'Rechercher dans la musique locale...',
    noMusic: 'Aucune musique locale',
    noSearchResult: 'Aucune chanson correspondante trouvée',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer {count} chanson(s) sélectionnée(s) ?',
    deleteSuccess: '{count} chanson(s) supprimée(s)',
    removeSelected: 'Supprimer la sélection',
    showInFolder: 'Afficher dans le dossier'
  },

  // Favorites
  favoriteMusic: {
    title: 'Favoris',
    searchPlaceholder: 'Rechercher dans les favoris...',
    noFavorites: 'Aucune chanson favorite pour le moment',
    noSearchResult: 'Aucune chanson correspondante trouvée',
    confirmUnfavorite: 'Êtes-vous sûr de vouloir retirer {count} chanson(s) des favoris ?',
    unfavoriteSuccess: '{count} chanson(s) retirée(s) des favoris',
    unfavoriteSelected: 'Retirer des favoris'
  },

  // Recently Played
  recentlyPlayed: {
    title: 'Écoutés récemment',
    searchPlaceholder: 'Rechercher dans l\'historique...',
    noHistory: 'Aucun historique de lecture',
    noSearchResult: 'Aucune chanson correspondante trouvée',
    confirmRemove: 'Êtes-vous sûr de vouloir retirer {count} chanson(s) de l\'historique ?',
    removeSuccess: '{count} chanson(s) retirée(s) de l\'historique',
    removeSelected: 'Retirer la sélection',
    clearAll: 'Effacer l\'historique',
    confirmClearAll: 'Êtes-vous sûr de vouloir effacer tout l\'historique de lecture ?',
    clearSuccess: 'Historique de lecture effacé'
  },

  // Playlist
  playlist: {
    title: 'Mes playlists',
    searchPlaceholder: 'Rechercher des playlists...',
    createNew: 'Créer une playlist',
    noPlaylists: 'Aucune playlist pour le moment',
    noSearchResult: 'Aucune playlist correspondante trouvée',
    playlistName: 'Nom de la playlist',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer la playlist "{name}" ?',
    deleteSuccess: 'Playlist supprimée',
    createSuccess: 'Playlist créée',
    renameSuccess: 'Playlist renommée',
    addToPlaylist: 'Ajouter à la playlist',
    addSuccess: 'Ajouté à la playlist',
    removeFromPlaylist: 'Retirer de la playlist',
    removeSuccess: 'Retiré de la playlist',
    songCount: '{count} chansons'
  },

  // Player
  player: {
    play: 'Lire',
    pause: 'Pause',
    previous: 'Précédent',
    next: 'Suivant',
    playQueue: 'File d\'attente',
    clearQueue: 'Vider la file',
    emptyQueue: 'File d\'attente vide',
    addToQueue: 'Ajouter à la file',
    nowPlaying: 'En cours de lecture',
    noLyrics: 'Aucune parole disponible',
    playModeSequence: 'Séquentiel',
    playModeLoop: 'Boucle tout',
    playModeSingle: 'Répéter un',
    playModeRandom: 'Aléatoire'
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
