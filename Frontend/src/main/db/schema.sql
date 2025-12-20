-- 故里音乐助手 数据库表结构
-- 创建时间: 2025
-- 歌曲表
CREATE TABLE IF NOT EXISTS music (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    -- 歌曲标题
    artist TEXT DEFAULT '未知歌手',
    -- 艺术家
    album TEXT DEFAULT '未知专辑',
    -- 专辑名
    duration REAL DEFAULT 0,
    -- 时长（秒）
    file_path TEXT NOT NULL UNIQUE,
    -- 文件路径（唯一）
    file_size INTEGER DEFAULT 0,
    -- 文件大小（字节）
    format TEXT,
    -- 音频格式 (mp3/flac/wav)
    bitrate INTEGER,
    -- 比特率
    sample_rate INTEGER,
    -- 采样率
    cover_path TEXT,
    -- 封面图片路径
    lyrics_path TEXT,
    -- 歌词文件路径
    play_count INTEGER DEFAULT 0,
    -- 播放次数
    is_favorite INTEGER DEFAULT 0,
    -- 是否收藏 (0/1)
    last_played_at TEXT,
    -- 最后播放时间
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);
-- 歌单表
CREATE TABLE IF NOT EXISTS playlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    -- 歌单名称
    description TEXT,
    -- 歌单描述
    cover_path TEXT,
    -- 歌单封面
    song_count INTEGER DEFAULT 0,
    -- 歌曲数量
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);
-- 歌单-歌曲关联表
CREATE TABLE IF NOT EXISTS playlist_music (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER NOT NULL,
    music_id INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0,
    -- 排序顺序
    added_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (playlist_id) REFERENCES playlist(id) ON DELETE CASCADE,
    FOREIGN KEY (music_id) REFERENCES music(id) ON DELETE CASCADE,
    UNIQUE(playlist_id, music_id)
);
-- 用户设置表
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);
-- 播放历史表
CREATE TABLE IF NOT EXISTS play_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    music_id INTEGER NOT NULL,
    played_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (music_id) REFERENCES music(id) ON DELETE CASCADE
);
-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_music_title ON music(title);
CREATE INDEX IF NOT EXISTS idx_music_artist ON music(artist);
CREATE INDEX IF NOT EXISTS idx_music_album ON music(album);
CREATE INDEX IF NOT EXISTS idx_music_created_at ON music(created_at);
CREATE INDEX IF NOT EXISTS idx_playlist_music_playlist_id ON playlist_music(playlist_id);
CREATE INDEX IF NOT EXISTS idx_play_history_music_id ON play_history(music_id);
CREATE INDEX IF NOT EXISTS idx_play_history_played_at ON play_history(played_at);
-- 插入默认设置
INSERT
    OR IGNORE INTO settings (key, value)
VALUES ('theme', 'dark'),
    ('volume', '0.7'),
    ('playMode', 'sequence'),
    ('language', 'zh-CN'),
    ('fontSize', '14'),
    (
        'localMusicHeaders',
        -- 故里音乐助手 数据库表结构
        -- 创建时间: 2024
        -- 歌曲表
        CREATE TABLE IF NOT EXISTS music (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            -- 歌曲标题
            artist TEXT DEFAULT '未知歌手',
            -- 艺术家
            album TEXT DEFAULT '未知专辑',
            -- 专辑名
            duration REAL DEFAULT 0,
            -- 时长（秒）
            file_path TEXT NOT NULL UNIQUE,
            -- 文件路径（唯一）
            file_size INTEGER DEFAULT 0,
            -- 文件大小（字节）
            format TEXT,
            -- 音频格式 (mp3/flac/wav)
            bitrate INTEGER,
            -- 比特率
            sample_rate INTEGER,
            -- 采样率
            cover_path TEXT,
            -- 封面图片路径
            lyrics_path TEXT,
            -- 歌词文件路径
            play_count INTEGER DEFAULT 0,
            -- 播放次数
            is_favorite INTEGER DEFAULT 0,
            -- 是否收藏 (0/1)
            last_played_at TEXT,
            -- 最后播放时间
            created_at TEXT DEFAULT (datetime('now', 'localtime')),
            updated_at TEXT DEFAULT (datetime('now', 'localtime'))
        );
-- 歌单表
CREATE TABLE IF NOT EXISTS playlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    -- 歌单名称
    description TEXT,
    -- 歌单描述
    cover_path TEXT,
    -- 歌单封面
    song_count INTEGER DEFAULT 0,
    -- 歌曲数量
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);
-- 歌单-歌曲关联表
CREATE TABLE IF NOT EXISTS playlist_music (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER NOT NULL,
    music_id INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0,
    -- 排序顺序
    added_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (playlist_id) REFERENCES playlist(id) ON DELETE CASCADE,
    FOREIGN KEY (music_id) REFERENCES music(id) ON DELETE CASCADE,
    UNIQUE(playlist_id, music_id)
);
-- 用户设置表
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);
-- 播放历史表
CREATE TABLE IF NOT EXISTS play_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    music_id INTEGER NOT NULL,
    played_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (music_id) REFERENCES music(id) ON DELETE CASCADE
);
-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_music_title ON music(title);
CREATE INDEX IF NOT EXISTS idx_music_artist ON music(artist);
CREATE INDEX IF NOT EXISTS idx_music_album ON music(album);
CREATE INDEX IF NOT EXISTS idx_music_created_at ON music(created_at);
CREATE INDEX IF NOT EXISTS idx_playlist_music_playlist_id ON playlist_music(playlist_id);
CREATE INDEX IF NOT EXISTS idx_play_history_music_id ON play_history(music_id);
CREATE INDEX IF NOT EXISTS idx_play_history_played_at ON play_history(played_at);
-- 插入默认设置
INSERT
    OR IGNORE INTO settings (key, value)
VALUES ('theme', 'dark'),
    ('volume', '0.7'),
    ('playMode', 'sequence'),
    ('language', 'zh-CN'),
    ('fontSize', '14'),
    (
        'localMusicHeaders',
        '["title","artist","album","duration","created_at"]'
    ),
    ('visualizationStyle', 'bars'),
    ('visualizationFrameRate', '60'),
    ('rememberPlaybackStatus', 'true'),
    ('gaplessPlayback', 'false'),
    ('musicFolders', '[]'),
    ('autoScan', 'true'),
    ('visualizerEnabled', 'true'),
    ('disableSplashScreen', 'false');