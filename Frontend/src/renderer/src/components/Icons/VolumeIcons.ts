import { h } from 'vue'

// 静音图标 (喇叭 + X)
export const VolumeMute = {
  name: 'VolumeMute',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      width: '1em',
      height: '1em'
    }, [
      h('path', {
        d: 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z'
      })
    ])
  }
}

// 低音量图标 (喇叭 + 1格音波)
export const VolumeLow = {
  name: 'VolumeLow',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      width: '1em',
      height: '1em'
    }, [
      // 喇叭主体
      h('path', {
        d: 'M3 9v6h4l5 5V4L7 9H3z'
      }),
      // 1格音波
      h('path', {
        d: 'M14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02 0-1.77-1.02-3.29-2.5-4.03z'
      })
    ])
  }
}

// 中音量图标 (喇叭 + 2格音波)
export const VolumeMedium = {
  name: 'VolumeMedium',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      width: '1em',
      height: '1em'
    }, [
      // 喇叭主体
      h('path', {
        d: 'M3 9v6h4l5 5V4L7 9H3z'
      }),
      // 1格音波
      h('path', {
        d: 'M14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02 0-1.77-1.02-3.29-2.5-4.03z'
      }),
      // 2格音波
      h('path', {
        d: 'M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z'
      })
    ])
  }
}

// 高音量图标 (喇叭 + 3格音波)
export const VolumeHigh = {
  name: 'VolumeHigh',
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      width: '1em',
      height: '1em'
    }, [
      // 喇叭主体
      h('path', {
        d: 'M3 9v6h4l5 5V4L7 9H3z'
      }),
      // 1格音波 (最小)
      h('path', {
        d: 'M14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02 0-1.77-1.02-3.29-2.5-4.03z'
      }),
      // 2格音波 (中等)
      h('path', {
        d: 'M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z'
      }),
      // 3格音波 (最大) - 额外的外圈
      h('path', {
        d: 'M14 0.23v2c4.73.95 8.27 5.19 8.27 10.22s-3.54 9.27-8.27 10.22v2c5.86-1 10.27-6.18 10.27-12.22S19.86 1.23 14 0.23z',
        opacity: '0.7'
      })
    ])
  }
}
