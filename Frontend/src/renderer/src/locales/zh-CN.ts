/**
 * 简体中文语言包
 */
export default {
  // 通用
  common: {
    confirm: '确定',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    done: '完成',
    add: '添加',
    remove: '移除',
    search: '搜索',
    reset: '重置',
    refresh: '刷新',
    loading: '加载中...',
    noData: '暂无数据',
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '提示',
    selectAll: '全选',
    total: '共',
    songs: '首歌曲',
    playlists: '个歌单',
    favorites: '首收藏'
  },

  // 导航菜单
  nav: {
    home: '首页',
    localMusic: '本地音乐',
    favorites: '我喜欢',
    recentlyPlayed: '最近播放',
    playlists: '我的歌单',
    settings: '设置'
  },

  // 标题栏
  header: {
    switchToMiniPlayer: '切换到迷你播放器'
  },

  // 迷你播放器
  miniPlayer: {
    switchToFull: '切换到完整播放器',
    noPlaying: '暂无播放'
  },

  // 设置页面
  settings: {
    title: '设置',
    // 外观设置
    appearance: {
      title: '外观',
      sectionTitle: '外观设置',
      theme: '主题',
      themeDesc: '选择应用程序的外观主题',
      themeDark: '深色模式',
      themeLight: '浅色模式',
      themeInterstellar: '星际巡航',
      themeGothic: '烛光曳影',
      themePapercut: '剪纸戏梦',
      themeQuantum: '虚空湮灭',
      themeSugarland: '糖果乐园',
      themeWasteland: '废土余晖',
      quickSwitchThemes: '快捷切换主题',
      quickSwitchThemesDesc: '选择标题栏快捷按钮切换的两个主题',
      language: '语言',
      languageDesc: '选择应用程序语言',
      fontSize: '文字大小',
      fontSizeDesc: '调整应用程序的字体大小',
      page: '页面',
      localMusicHeaders: '本地音乐列表表头',
      localMusicHeadersDesc: '选择在本地音乐列表中显示的列',
      headerTitle: '歌曲',
      headerArtist: '歌手',
      headerAlbum: '专辑',
      headerDuration: '时长',
      headerCreatedAt: '添加时间',
      // 音频可视化
      visualization: '音频可视化',
      visualizerEnabled: '启用可视化',
      visualizerEnabledDesc: '播放时显示音频频谱可视化效果',
      visualizerStyle: '样式',
      visualizerStyleDesc: '选择可视化效果样式',
      styleBars: '柱状图',
      styleWave: '波形图',
      styleSpectrum: '频谱渐变',
      styleMirror: '对称柱状',
      styleMountain: '山脉曲线',
      visualizerFrameRate: '帧率',
      visualizerFrameRateDesc: '调整动态背景帧率，较低的帧率可以减少 CPU/GPU 负载'
    },
    // 行为设置
    behavior: {
      title: '行为',
      sectionTitle: '行为设置',
      rememberPlaybackStatus: '播放状态',
      rememberPlaybackStatusDesc: '重启后记住上一次的播放状态（队列、进度、播放模式、音量）',
      gaplessPlayback: '无缝播放',
      gaplessPlaybackDesc: '歌曲切换时消除间隙',
      autoScan: '启动时自动扫描',
      autoScanDesc: '每次启动时自动扫描音乐文件夹的新增歌曲',
      disableSplashScreen: '下次启动时关闭过场动画',
      disableSplashScreenDesc: '开启后，下次启动应用将跳过开场动画',
      showSplashScreen: '立即显示过场动画',
      showSplashScreenDesc: '重新播放一次开场动画',
      showSplashScreenBtn: '立即显示',
      splashTheme: '过场动画主题',
      splashThemeDesc: '选择开屏动画的视觉风格',
      splashThemeCosmic: '星际穿梭',
      splashThemeEmerald: '翡翠圣域',
      splashThemeMolten: '热能冲击',
      splashThemeAbyss: '深蓝幽光',
      splashThemeBrass: '黄铜纪元',
      splashThemePrism: '零度棱镜',
      splashThemeSanctum: '真理殿堂',
      splashThemeSilicon: '硅基秩序',
      splashThemeEthereal: '极简几何',
      splashThemeCyber: '未来都市',
      splashThemeSakura: '和风落樱',
      splashThemeChronos: '时空裂隙',
      // 系统托盘
      systemTray: '系统托盘',
      showTrayIcon: '在系统托盘显示应用图标',
      showTrayIconDesc: '在系统托盘区域显示应用程序图标',
      minimizeToTray: '最小化到系统托盘',
      minimizeToTrayDesc: '点击最小化按钮时，将应用隐藏到系统托盘',
      closeToTray: '关闭到系统托盘',
      closeToTrayDesc: '点击关闭按钮时，将应用隐藏到系统托盘而不是退出'
    },
    // 音乐库设置
    library: {
      title: '音乐库',
      sectionTitle: '音乐文件夹',
      addFolder: '添加文件夹',
      scanAll: '扫描所有文件夹',
      emptyFolders: '暂未添加音乐文件夹',
      folderAdded: '文件夹已添加',
      folderRemoved: '文件夹已移除',
      confirmRemoveFolder: '确定要移除文件夹 "{folder}" 吗？\n（不会删除文件夹中的歌曲数据）',
      addFolderFirst: '请先添加音乐文件夹',
      scanning: '正在扫描音乐文件...',
      scanComplete: '扫描完成：新增 {count} 首歌曲',
      scanFailed: '扫描失败'
    },
    // 关于
    about: {
      title: '关于',
      sectionTitle: '关于',
      appName: '故里音乐助手',
      version: '版本',
      description: '本地音乐管理系统，基于 Electron + Vue 3 + TypeScript 构建',
      // 联系我们
      contactUs: '联系我们',
      author: '作者',
      authorDesc: '项目开发者',
      github: 'GitHub',
      githubDesc: '查看源代码和提交问题',
      visitGitHub: '访问 GitHub',
      license: '开源协议',
      licenseDesc: '项目采用的开源许可证',
      userDataPath: '用户数据存储路径',
      userDataPathDesc: '应用程序数据（数据库、封面缓存等）的存储位置',
      userDataPathValue: 'C:\\Users\\<用户名>\\AppData\\Roaming\\GL_Music',
      // 其他
      other: '其他',
      resetSettings: '重置设置',
      resetSettingsDesc: '将所有设置恢复为默认值',
      confirmReset: '确定要将所有设置恢复为默认值吗？',
      resetTitle: '重置设置',
      resetSuccess: '设置已重置'
    }
  },

  // 首页
  home: {
    welcome: '欢迎回来',
    statistics: '音乐统计',
    recentlyPlayed: '最近播放',
    myFavorites: '我喜欢的音乐',
    myPlaylists: '我的歌单',
    viewAll: '查看全部',
    noRecentlyPlayed: '暂无播放记录',
    noFavorites: '暂无收藏',
    noPlaylists: '暂无歌单'
  },

  // 本地音乐
  localMusic: {
    title: '本地音乐',
    playAll: '播放全部',
    addAll: '添加全部',
    searchPlaceholder: '搜索本地音乐...',
    noMusic: '暂无本地音乐',
    noSearchResult: '未找到匹配的歌曲',
    confirmDelete: '确定要从本地音乐列表移除选中的 {count} 首歌曲吗？',
    confirmDeleteSingle: '确定要从本地音乐列表移除这首歌曲吗？',
    deleteSuccess: '已删除 {count} 首歌曲',
    removeSuccess: '已从本地音乐列表移除',
    removeSelected: '移除选中',
    showInFolder: '在文件夹中显示',
    invalidPathTooltip: '此歌曲不在有效的音乐文件夹中',
    missingFileTooltip: '本地文件不存在'
  },

  // 我喜欢
  favoriteMusic: {
    title: '我喜欢',
    searchPlaceholder: '搜索收藏...',
    noFavorites: '暂无收藏的歌曲',
    noSearchResult: '未找到匹配的歌曲',
    confirmUnfavorite: '确定要取消收藏选中的 {count} 首歌曲吗？',
    unfavoriteSuccess: '已取消收藏 {count} 首歌曲',
    unfavoriteSelected: '取消收藏'
  },

  // 最近播放
  recentlyPlayed: {
    title: '最近播放',
    searchPlaceholder: '搜索最近播放...',
    noHistory: '暂无播放记录',
    noSearchResult: '未找到匹配的歌曲',
    confirmRemove: '确定要从播放历史中移除选中的 {count} 首歌曲吗？',
    removeSuccess: '已从播放历史中移除 {count} 首歌曲',
    removeSelected: '移除选中',
    clearAll: '清空播放记录',
    confirmClearAll: '确定要清空所有播放记录吗？',
    clearSuccess: '播放记录已清空'
  },

  // 歌单
  playlist: {
    title: '我的歌单',
    searchPlaceholder: '搜索歌单...',
    createNew: '新建歌单',
    noPlaylists: '暂无歌单',
    noSearchResult: '未找到匹配的歌单',
    playlistName: '歌单名称',
    confirmDelete: '确定要删除歌单 "{name}" 吗？',
    deleteSuccess: '歌单已删除',
    createSuccess: '歌单创建成功',
    renameSuccess: '歌单已重命名',
    addToPlaylist: '添加到歌单',
    addSuccess: '已添加到歌单',
    removeFromPlaylist: '从歌单中移除',
    removeSuccess: '已从歌单移除',
    confirmRemoveSongs: '确定要从歌单中移除选中的 {count} 首歌曲吗？',
    songCount: '{count} 首歌曲'
  },

  // 播放器
  player: {
    play: '播放',
    pause: '暂停',
    previous: '上一首',
    next: '下一首',
    playQueue: '播放队列',
    clearQueue: '清空队列',
    confirmClearQueue: '确定要清空播放队列吗？',
    emptyQueue: '播放队列为空',
    addToQueue: '添加到播放队列',
    nowPlaying: '正在播放',
    noPlaying: '暂无播放',
    noLyrics: '暂无歌词',
    playModeSequence: '顺序播放',
    playModeLoop: '列表循环',
    playModeSingle: '单曲循环',
    playModeRandom: '随机播放',
    // 路径验证相关
    pathValidationTitle: '无法播放',
    pathValidationFailed: '无法播放歌曲 "{title}"',
    filePath: '文件路径：{path}',
    notInMusicFolder: '该歌曲不在设置的音乐文件夹中。',
    currentMusicFolders: '当前设置的音乐文件夹：',
    noMusicFolders: '您还没有设置任何音乐文件夹，请在"设置"→"音乐库"中添加。',
    fileExistsButNotInFolder: '提示：文件不在指定音乐文件夹内。您可以在"设置"→"音乐库"中添加对应的文件夹。',
    fileNotFound: '提示：该文件在本地不存在，可能已被移动或删除。',
    removeFromList: '从列表中删除'
  },

  // 歌词
  lyrics: {
    noLyrics: '暂无歌词'
  },

  // 语言名称
  languages: {
    'zh-CN': '简体中文',
    'en-US': 'English',
    'ar-SA': 'العربية',
    'fr-FR': 'Français',
    'ru-RU': 'Русский',
    'es-ES': 'Español'
  }
}
