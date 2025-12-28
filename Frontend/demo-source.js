/**
 * 完整音乐源脚本示例
 *
 * 这个脚本展示了如何编写一个完整的音乐源
 * 包含搜索、获取播放链接、获取歌词等功能
 *
 * 注意：这只是技术演示，使用公开的测试 API
 */

// ==================== 源元信息 ====================
const GULI_SOURCE_META = {
  id: 'demo-full',
  name: '完整演示源',
  version: '1.0.0',
  description: '展示完整功能的演示源脚本',
  icon: '🎵',
  author: 'Guli Team',
  supports: {
    search: true,
    getPlayUrl: true,
    getLyrics: true
  }
};

// ==================== 工具函数 ====================

/**
 * 日志输出
 */
function log(...args) {
  window.guli_api.log('[DemoFull]', ...args);
}

/**
 * 错误输出
 */
function error(...args) {
  window.guli_api.error('[DemoFull]', ...args);
}

// ==================== 核心实现 ====================

const guliSource = {
  /**
   * 搜索音乐
   *
   * @param {Object} params
   * @param {string} params.keyword - 搜索关键词
   * @param {number} params.page - 页码（从1开始）
   * @param {number} params.pageSize - 每页数量
   * @returns {Promise<{list: Array, total: number}>}
   */
  async search(params) {
    const { keyword, page = 1, pageSize = 30 } = params;
    log(`搜索: "${keyword}", 页码: ${page}`);

    try {
      // ============ 方式1: 使用公开API ============
      // 这里使用 iTunes Search API 作为演示
      // 实际中可以替换为其他音乐平台的 API

      const offset = (page - 1) * pageSize;
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}&media=music&entity=song&limit=${pageSize}&offset=${offset}&country=US`;

      const response = await window.guli_api.request(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });

      if (response.status !== 200) {
        throw new Error(`HTTP 错误: ${response.status}`);
      }

      const data = JSON.parse(response.body);
      log(`找到 ${data.resultCount} 首歌曲`);

      // 转换为标准格式
      const list = (data.results || []).map(item => ({
        // 必填字段
        id: String(item.trackId),
        name: item.trackName || '未知歌曲',
        artist: item.artistName || '未知歌手',

        // 可选字段
        album: item.collectionName || '',
        duration: Math.floor((item.trackTimeMillis || 0) / 1000),
        cover: item.artworkUrl100 ? item.artworkUrl100.replace('100x100', '600x600') : '',
        quality: '128k',  // iTunes 预览是 128k AAC
        size: 0,

        // extra 字段用于存储平台特定数据
        // 这些数据会在 getPlayUrl 时传回
        extra: {
          previewUrl: item.previewUrl,
          trackViewUrl: item.trackViewUrl,
          collectionId: item.collectionId,
          artistId: item.artistId,
          // 可以存储任何获取播放链接时需要的信息
          platform: 'itunes'
        }
      }));

      return {
        list,
        total: data.resultCount || list.length
      };

    } catch (err) {
      error('搜索失败:', err.message);
      throw err;
    }
  },

  /**
   * 获取播放链接
   *
   * @param {Object} params
   * @param {string} params.id - 歌曲ID
   * @param {string} params.quality - 期望音质 (128k, 320k, flac 等)
   * @param {Object} params.extra - 搜索时返回的 extra 数据
   * @returns {Promise<{url: string}>}
   */
  async getPlayUrl(params) {
    const { id, quality, extra } = params;
    log(`获取播放链接: ID=${id}, 音质=${quality}`);

    try {
      // ============ 方式1: 直接使用已有URL ============
      // iTunes 在搜索时已经返回了预览 URL
      if (extra && extra.previewUrl) {
        log('使用预览链接');
        return { url: extra.previewUrl };
      }

      // ============ 方式2: 调用API获取 ============
      // 对于其他平台，可能需要额外请求获取真实URL
      // 示例代码（实际需要根据平台调整）:
      /*
      const response = await window.guli_api.request(`https://api.example.com/song/${id}/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quality: quality,
          hash: extra.hash,   // 使用 extra 中的数据
          token: extra.token
        })
      });

      const data = JSON.parse(response.body);

      // 如果返回的URL是加密的，可以解密
      // const decryptedUrl = window.guli_api.crypto.aesDecrypt(data.encryptedUrl, key, iv);

      return { url: data.url };
      */

      // ============ 方式3: 使用公开测试音频 ============
      // 如果没有预览链接，返回测试音频
      log('使用测试音频');
      return {
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      };

    } catch (err) {
      error('获取播放链接失败:', err.message);
      throw err;
    }
  },

  /**
   * 获取歌词（可选实现）
   *
   * @param {Object} params
   * @param {string} params.id - 歌曲ID
   * @param {Object} params.extra - 额外数据
   * @returns {Promise<{lrc: string, tlrc?: string}>}
   */
  async getLyrics(params) {
    const { id, extra } = params;
    log(`获取歌词: ID=${id}`);

    try {
      // iTunes 不提供歌词 API，这里返回示例
      // 实际中可以调用歌词平台的 API

      /*
      const response = await window.guli_api.request(`https://api.example.com/lyrics/${id}`, {
        method: 'GET'
      });

      const data = JSON.parse(response.body);
      return {
        lrc: data.lyrics,      // 原文歌词（LRC格式）
        tlrc: data.translation // 翻译歌词（可选）
      };
      */

      // 返回示例歌词
      return {
        lrc: `[00:00.00]示例歌词
[00:05.00]这是一首演示歌曲
[00:10.00]用于展示歌词功能
[00:15.00]...`,
        tlrc: `[00:00.00]Example Lyrics
[00:05.00]This is a demo song
[00:10.00]To demonstrate lyrics feature
[00:15.00]...`
      };

    } catch (err) {
      error('获取歌词失败:', err.message);
      throw err;
    }
  }
};

// ==================== 初始化 ====================

log('源脚本加载成功！');

// 可以在这里进行初始化操作
// 比如获取 token、检查版本等
(async () => {
  try {
    // 示例：检查网络连接
    const testResponse = await window.guli_api.request('https://itunes.apple.com/search?term=test&limit=1', {
      timeout: 5000
    });
    if (testResponse.status === 200) {
      log('网络连接正常');
    }
  } catch (err) {
    error('初始化警告: 网络检查失败');
  }
})();
