/**
 * 示例音乐源脚本
 *
 * 这是一个自定义音乐源的模板文件，用于说明如何编写一个源脚本。
 *
 * 源脚本必须满足以下条件：
 * 1. 定义 GULI_SOURCE_META 常量，包含源的元信息
 * 2. 定义 guliSource 对象，包含 search 和 getPlayUrl 方法
 *
 * 脚本可以使用的 API：
 * - window.guli_api.request(url, options)  - 发送 HTTP 请求（绕过 CORS）
 * - window.guli_api.crypto.md5(str)        - MD5 哈希
 * - window.guli_api.crypto.sha1(str)       - SHA1 哈希
 * - window.guli_api.crypto.sha256(str)     - SHA256 哈希
 * - window.guli_api.crypto.aesEncrypt()    - AES 加密
 * - window.guli_api.crypto.aesDecrypt()    - AES 解密
 * - window.guli_api.crypto.rsaEncrypt()    - RSA 加密
 * - window.guli_api.crypto.base64Encode()  - Base64 编码
 * - window.guli_api.crypto.base64Decode()  - Base64 解码
 * - window.guli_api.log()                  - 调试日志
 */

// ==================== 源元信息（必须）====================
const GULI_SOURCE_META = {
  // 源的唯一标识（建议使用域名或特征字符串）
  id: 'example-source',
  // 源的显示名称
  name: '示例音乐源',
  // 版本号
  version: '1.0.0',
  // 源的描述
  description: '这是一个示例音乐源，用于演示如何编写自定义源',
  // 源的图标（emoji 或图片 URL）
  icon: '🎵',
  // 作者
  author: 'Guli Team',
  // 支持的功能
  supports: {
    search: true,
    getPlayUrl: true,
    getLyrics: false
  }
};

// ==================== 源实现（必须）====================
const guliSource = {
  /**
   * 搜索音乐
   * @param {Object} params - 搜索参数
   * @param {string} params.keyword - 搜索关键词
   * @param {number} params.page - 页码（从1开始）
   * @param {number} params.pageSize - 每页数量
   * @returns {Promise<{list: Array, total: number}>} - 搜索结果
   */
  async search(params) {
    const { keyword, page = 1, pageSize = 30 } = params;

    window.guli_api.log(`[ExampleSource] Searching: ${keyword}, page: ${page}`);

    try {
      // 示例：发送 HTTP 请求到某个音乐 API
      // const response = await window.guli_api.request('https://api.example.com/search', {
      //   method: 'GET',
      //   headers: {
      //     'User-Agent': 'Mozilla/5.0',
      //     'Referer': 'https://example.com'
      //   }
      // });
      // const data = JSON.parse(response.body);

      // 这里返回模拟数据
      const mockResults = [
        {
          id: 'song_001',
          name: '示例歌曲1',
          artist: '示例歌手',
          album: '示例专辑',
          duration: 240,
          cover: '',
          quality: '320k',
          size: 10 * 1024 * 1024,
          // extra 字段用于存储获取播放链接时需要的额外信息
          extra: {
            hash: 'abc123',
            albumId: 'album_001'
          }
        },
        {
          id: 'song_002',
          name: '示例歌曲2',
          artist: '示例歌手',
          album: '示例专辑',
          duration: 180,
          cover: '',
          quality: '128k',
          size: 5 * 1024 * 1024,
          extra: {
            hash: 'def456',
            albumId: 'album_001'
          }
        }
      ];

      return {
        list: mockResults,
        total: 2
      };
    } catch (error) {
      window.guli_api.error('[ExampleSource] Search failed:', error);
      throw error;
    }
  },

  /**
   * 获取播放链接
   * @param {Object} params - 请求参数
   * @param {string} params.id - 歌曲ID
   * @param {string} params.quality - 期望的音质
   * @param {Object} params.extra - 来自搜索结果的额外数据
   * @returns {Promise<{url: string}>} - 播放链接
   */
  async getPlayUrl(params) {
    const { id, quality, extra } = params;

    window.guli_api.log(`[ExampleSource] Getting play URL for: ${id}, quality: ${quality}`);

    try {
      // 示例：使用 extra 中的信息获取播放链接
      // const hash = extra?.hash || '';
      // const response = await window.guli_api.request(`https://api.example.com/song/${id}/url`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ hash, quality })
      // });
      // const data = JSON.parse(response.body);
      // return { url: data.url };

      // 返回模拟的播放链接
      return {
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      };
    } catch (error) {
      window.guli_api.error('[ExampleSource] Get play URL failed:', error);
      throw error;
    }
  },

  /**
   * 获取歌词（可选实现）
   * @param {Object} params - 请求参数
   * @param {string} params.id - 歌曲ID
   * @param {Object} params.extra - 额外数据
   * @returns {Promise<{lrc: string, tlrc?: string}>} - 歌词内容
   */
  async getLyrics(params) {
    const { id } = params;

    window.guli_api.log(`[ExampleSource] Getting lyrics for: ${id}`);

    // 返回 LRC 格式的歌词
    return {
      lrc: '[00:00.00]示例歌词\n[00:05.00]这是一首示例歌曲',
      tlrc: '[00:00.00]Example Lyrics\n[00:05.00]This is an example song'
    };
  }
};

// 确保脚本被正确加载
window.guli_api.log('[ExampleSource] Source script loaded successfully');
