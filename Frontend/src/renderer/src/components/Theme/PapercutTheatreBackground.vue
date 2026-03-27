<template>
  <div class="papercut-background" :class="{ embedded: embedded }" ref="containerRef" @mousemove="handleMouseMove">
    <!-- 底层：透光宣纸天幕 -->
    <div class="rice-paper-sky">
      <div class="paper-texture"></div>
      <div class="moon-glow"></div>
      <div class="moon-core"></div>
    </div>

    <!-- 远景：层峦剪影 (3层山峦) -->
    <div class="mountain-layer" :style="mountainLayerStyle">
      <div class="mountain mountain-far"></div>
      <div class="mountain mountain-mid"></div>
      <div class="mountain mountain-near"></div>
      <!-- 云纹剪影 -->
      <div class="cloud-pattern cloud-1"></div>
      <div class="cloud-pattern cloud-2"></div>
      <div class="cloud-pattern cloud-3"></div>
    </div>

    <!-- 中层：园林与枯木 -->
    <div class="garden-layer" :style="gardenLayerStyle">
      <!-- 左侧亭台楼阁 -->
      <svg class="pavilion pavilion-left" viewBox="0 0 200 300">
        <!-- 屋顶 -->
        <path d="M10 100 L100 40 L190 100 L180 105 L100 50 L20 105 Z" fill="rgba(20, 15, 25, 0.85)"
          filter="url(#paperShadow)" />
        <!-- 飞檐 -->
        <path d="M5 100 Q30 90 10 100 M195 100 Q170 90 190 100" stroke="rgba(20, 15, 25, 0.9)" stroke-width="3"
          fill="none" />
        <!-- 屋檐下层 -->
        <path d="M25 105 L100 60 L175 105 L170 110 L100 70 L30 110 Z" fill="rgba(25, 20, 30, 0.7)" />
        <!-- 立柱 -->
        <rect x="40" y="110" width="6" height="120" fill="rgba(20, 15, 25, 0.85)" />
        <rect x="80" y="110" width="6" height="120" fill="rgba(20, 15, 25, 0.85)" />
        <rect x="114" y="110" width="6" height="120" fill="rgba(20, 15, 25, 0.85)" />
        <rect x="154" y="110" width="6" height="120" fill="rgba(20, 15, 25, 0.85)" />
        <!-- 窗棂镂空 -->
        <g class="window-lattice">
          <rect x="48" y="130" width="30" height="60" fill="none" stroke="rgba(20, 15, 25, 0.7)" stroke-width="2" />
          <line x1="48" y1="150" x2="78" y2="150" stroke="rgba(20, 15, 25, 0.6)" stroke-width="1" />
          <line x1="48" y1="170" x2="78" y2="170" stroke="rgba(20, 15, 25, 0.6)" stroke-width="1" />
          <line x1="63" y1="130" x2="63" y2="190" stroke="rgba(20, 15, 25, 0.6)" stroke-width="1" />

          <rect x="122" y="130" width="30" height="60" fill="none" stroke="rgba(20, 15, 25, 0.7)" stroke-width="2" />
          <line x1="122" y1="150" x2="152" y2="150" stroke="rgba(20, 15, 25, 0.6)" stroke-width="1" />
          <line x1="122" y1="170" x2="152" y2="170" stroke="rgba(20, 15, 25, 0.6)" stroke-width="1" />
          <line x1="137" y1="130" x2="137" y2="190" stroke="rgba(20, 15, 25, 0.6)" stroke-width="1" />
        </g>
        <!-- 底座 -->
        <rect x="30" y="230" width="140" height="10" fill="rgba(20, 15, 25, 0.8)" />
        <!-- 滤镜定义 -->
        <defs>
          <filter id="paperShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.5)" />
          </filter>
        </defs>
      </svg>

      <!-- 右侧盘曲松树 -->
      <svg class="pine-tree pine-right" viewBox="0 0 180 350">
        <!-- 主干 -->
        <path d="M90 350 Q85 300 95 250 Q80 200 100 150 Q90 100 95 50" stroke="rgba(20, 15, 25, 0.9)" stroke-width="8"
          fill="none" stroke-linecap="round" />
        <!-- 松枝 -->
        <g class="pine-branches">
          <!-- 左侧枝条 -->
          <path d="M95 250 Q60 240 30 260" stroke="rgba(20, 15, 25, 0.85)" stroke-width="3" fill="none" />
          <path d="M100 200 Q55 185 20 210" stroke="rgba(20, 15, 25, 0.85)" stroke-width="3" fill="none" />
          <path d="M95 150 Q50 130 25 160" stroke="rgba(20, 15, 25, 0.85)" stroke-width="2" fill="none" />
          <path d="M95 100 Q60 85 40 110" stroke="rgba(20, 15, 25, 0.8)" stroke-width="2" fill="none" />
          <!-- 右侧枝条 -->
          <path d="M95 280 Q130 270 160 290" stroke="rgba(20, 15, 25, 0.85)" stroke-width="3" fill="none" />
          <path d="M100 220 Q145 205 170 235" stroke="rgba(20, 15, 25, 0.85)" stroke-width="3" fill="none" />
          <path d="M95 170 Q140 155 165 180" stroke="rgba(20, 15, 25, 0.85)" stroke-width="2" fill="none" />
          <path d="M95 120 Q130 105 155 130" stroke="rgba(20, 15, 25, 0.8)" stroke-width="2" fill="none" />
          <!-- 松针簇 -->
          <ellipse cx="25" cy="260" rx="25" ry="15" fill="rgba(20, 15, 25, 0.7)" />
          <ellipse cx="15" cy="210" rx="30" ry="18" fill="rgba(20, 15, 25, 0.75)" />
          <ellipse cx="20" cy="160" rx="22" ry="12" fill="rgba(20, 15, 25, 0.65)" />
          <ellipse cx="35" cy="110" rx="20" ry="10" fill="rgba(20, 15, 25, 0.6)" />
          <ellipse cx="165" cy="290" rx="22" ry="13" fill="rgba(20, 15, 25, 0.7)" />
          <ellipse cx="175" cy="235" rx="28" ry="16" fill="rgba(20, 15, 25, 0.75)" />
          <ellipse cx="170" cy="180" rx="20" ry="11" fill="rgba(20, 15, 25, 0.65)" />
          <ellipse cx="160" cy="130" rx="18" ry="9" fill="rgba(20, 15, 25, 0.6)" />
          <!-- 顶部松针 -->
          <ellipse cx="95" cy="45" rx="30" ry="20" fill="rgba(20, 15, 25, 0.7)" />
        </g>
      </svg>

      <!-- 中间枯木枝条 -->
      <svg class="dead-branch branch-center" viewBox="0 0 300 200">
        <path d="M0 180 Q50 150 100 160 Q150 130 200 150 Q250 120 300 140" stroke="rgba(20, 15, 25, 0.8)"
          stroke-width="4" fill="none" />
        <path d="M80 165 Q70 120 60 80" stroke="rgba(20, 15, 25, 0.7)" stroke-width="2" fill="none" />
        <path d="M180 145 Q200 100 190 60" stroke="rgba(20, 15, 25, 0.7)" stroke-width="2" fill="none" />
      </svg>

      <!-- 大型拱桥 - 跨越整个屏幕 -->
      <svg class="grand-arch-bridge" viewBox="0 0 1200 200" preserveAspectRatio="none">
        <!-- 主桥身 - 增强线条 -->
        <path d="M-50 175 Q300 35 600 25 Q900 35 1250 175" stroke="rgba(20, 15, 25, 0.85)" stroke-width="8"
          fill="none" />
        <path d="M-50 185 Q300 50 600 40 Q900 50 1250 185" stroke="rgba(20, 15, 25, 0.75)" stroke-width="6"
          fill="none" />
        <path d="M-50 195 Q300 65 600 55 Q900 65 1250 195" stroke="rgba(20, 15, 25, 0.6)" stroke-width="4"
          fill="none" />

        <!-- 桥拱装饰线 - 更多层次 -->
        <path d="M-50 165 Q300 25 600 15 Q900 25 1250 165" stroke="rgba(20, 15, 25, 0.5)" stroke-width="3"
          fill="none" />
        <path d="M-50 158 Q300 18 600 8 Q900 18 1250 158" stroke="rgba(20, 15, 25, 0.35)" stroke-width="2"
          fill="none" />

        <!-- 桥底拱形结构线 -->
        <path d="M0 200 Q300 100 600 90 Q900 100 1200 200" stroke="rgba(20, 15, 25, 0.4)" stroke-width="3"
          fill="none" />

        <!-- 桥栏杆 - 更多密集的支柱 -->
        <g class="bridge-railings">
          <line x1="50" y1="138" x2="50" y2="170" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="100" y1="112" x2="100" y2="145" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="150" y1="90" x2="150" y2="122" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="200" y1="72" x2="200" y2="104" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="250" y1="58" x2="250" y2="90" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="300" y1="47" x2="300" y2="79" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="350" y1="38" x2="350" y2="70" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="400" y1="32" x2="400" y2="64" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="450" y1="28" x2="450" y2="60" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="500" y1="25" x2="500" y2="57" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="550" y1="23" x2="550" y2="55" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="600" y1="22" x2="600" y2="54" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="650" y1="23" x2="650" y2="55" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="700" y1="25" x2="700" y2="57" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="750" y1="28" x2="750" y2="60" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="800" y1="32" x2="800" y2="64" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="850" y1="38" x2="850" y2="70" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="900" y1="47" x2="900" y2="79" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="950" y1="58" x2="950" y2="90" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="1000" y1="72" x2="1000" y2="104" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="1050" y1="90" x2="1050" y2="122" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="1100" y1="112" x2="1100" y2="145" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
          <line x1="1150" y1="138" x2="1150" y2="170" stroke="rgba(20, 15, 25, 0.7)" stroke-width="4" />
        </g>

        <!-- 桥顶栏杆横梁 - 双层 -->
        <path d="M50 138 Q300 20 600 10 Q900 20 1150 138" stroke="rgba(20, 15, 25, 0.65)" stroke-width="4"
          fill="none" />
        <path d="M50 145 Q300 28 600 18 Q900 28 1150 145" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2" fill="none" />

        <!-- 斜撑结构 -->
        <g class="bridge-braces">
          <line x1="100" y1="145" x2="150" y2="122" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" />
          <line x1="200" y1="104" x2="250" y2="90" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" />
          <line x1="300" y1="79" x2="350" y2="70" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" />
          <line x1="400" y1="64" x2="450" y2="60" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" />
          <line x1="500" y1="57" x2="550" y2="55" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" />
          <line x1="650" y1="55" x2="700" y2="57" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" />
          <line x1="750" y1="60" x2="800" y2="64" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" />
          <line x1="850" y1="70" x2="900" y2="79" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" />
          <line x1="950" y1="90" x2="1000" y2="104" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" />
          <line x1="1050" y1="122" x2="1100" y2="145" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" />
        </g>

        <!-- 桥墩装饰 - 增强 -->
        <ellipse cx="80" cy="190" rx="50" ry="18" fill="rgba(20, 15, 25, 0.55)" />
        <ellipse cx="80" cy="185" rx="45" ry="15" stroke="rgba(20, 15, 25, 0.4)" stroke-width="2" fill="none" />
        <ellipse cx="1120" cy="190" rx="50" ry="18" fill="rgba(20, 15, 25, 0.55)" />
        <ellipse cx="1120" cy="185" rx="45" ry="15" stroke="rgba(20, 15, 25, 0.4)" stroke-width="2" fill="none" />

        <!-- 桥面装饰花纹 - 更多 -->
        <circle cx="600" cy="30" r="10" fill="none" stroke="rgba(20, 15, 25, 0.5)" stroke-width="3" />
        <circle cx="600" cy="30" r="5" fill="rgba(20, 15, 25, 0.3)" />
        <circle cx="400" cy="48" r="7" fill="none" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" />
        <circle cx="800" cy="48" r="7" fill="none" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" />
        <circle cx="300" cy="65" r="5" fill="none" stroke="rgba(20, 15, 25, 0.4)" stroke-width="1.5" />
        <circle cx="900" cy="65" r="5" fill="none" stroke="rgba(20, 15, 25, 0.4)" stroke-width="1.5" />
        <circle cx="200" cy="88" r="4" fill="none" stroke="rgba(20, 15, 25, 0.35)" stroke-width="1.5" />
        <circle cx="1000" cy="88" r="4" fill="none" stroke="rgba(20, 15, 25, 0.35)" stroke-width="1.5" />
      </svg>

      <!-- 中心区域装饰：圆形月门 -->
      <svg class="moon-gate" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r="60" stroke="rgba(20, 15, 25, 0.5)" stroke-width="6" fill="none" />
        <circle cx="75" cy="75" r="52" stroke="rgba(20, 15, 25, 0.35)" stroke-width="2" fill="none" />
        <!-- 内部装饰纹 -->
        <path d="M40 75 Q55 55 75 55 Q95 55 110 75" stroke="rgba(20, 15, 25, 0.3)" stroke-width="1.5" fill="none" />
        <path d="M40 75 Q55 95 75 95 Q95 95 110 75" stroke="rgba(20, 15, 25, 0.3)" stroke-width="1.5" fill="none" />
      </svg>

      <!-- 第二个月门 - 左侧 -->
      <svg class="moon-gate moon-gate-left" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r="50" stroke="rgba(20, 15, 25, 0.4)" stroke-width="5" fill="none" />
        <circle cx="75" cy="75" r="42" stroke="rgba(20, 15, 25, 0.28)" stroke-width="2" fill="none" />
      </svg>

      <!-- 中心八角窗棂 -->
      <svg class="octagon-window" viewBox="0 0 100 100">
        <polygon points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" stroke="rgba(20, 15, 25, 0.45)"
          stroke-width="3" fill="none" />
        <polygon points="38,20 62,20 78,38 78,62 62,78 38,78 22,62 22,38" stroke="rgba(20, 15, 25, 0.3)"
          stroke-width="1.5" fill="none" />
        <!-- 内部十字纹 -->
        <line x1="50" y1="20" x2="50" y2="78" stroke="rgba(20, 15, 25, 0.25)" stroke-width="1.5" />
        <line x1="22" y1="50" x2="78" y2="50" stroke="rgba(20, 15, 25, 0.25)" stroke-width="1.5" />
      </svg>

      <!-- 六边形窗棂 -->
      <svg class="hexagon-window" viewBox="0 0 100 100">
        <polygon points="50,5 93,27 93,73 50,95 7,73 7,27" stroke="rgba(20, 15, 25, 0.4)" stroke-width="3"
          fill="none" />
        <polygon points="50,18 80,34 80,66 50,82 20,66 20,34" stroke="rgba(20, 15, 25, 0.28)" stroke-width="1.5"
          fill="none" />
      </svg>

      <!-- 扇形装饰 -->
      <svg class="fan-decoration" viewBox="0 0 120 80">
        <path d="M60 75 L10 20 Q60 -10 110 20 Z" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" fill="none" />
        <path d="M60 75 L25 25" stroke="rgba(20, 15, 25, 0.3)" stroke-width="1" />
        <path d="M60 75 L40 18" stroke="rgba(20, 15, 25, 0.3)" stroke-width="1" />
        <path d="M60 75 L60 10" stroke="rgba(20, 15, 25, 0.3)" stroke-width="1" />
        <path d="M60 75 L80 18" stroke="rgba(20, 15, 25, 0.3)" stroke-width="1" />
        <path d="M60 75 L95 25" stroke="rgba(20, 15, 25, 0.3)" stroke-width="1" />
      </svg>

      <!-- 如意云纹装饰1 -->
      <svg class="ruyi-cloud ruyi-1" viewBox="0 0 100 60">
        <path d="M10 50 Q30 30 50 35 Q70 25 90 45" stroke="rgba(50, 60, 90, 0.35)" stroke-width="3" fill="none" />
        <circle cx="15" cy="45" r="8" stroke="rgba(50, 60, 90, 0.3)" stroke-width="2" fill="none" />
        <circle cx="50" cy="30" r="10" stroke="rgba(50, 60, 90, 0.3)" stroke-width="2" fill="none" />
        <circle cx="85" cy="40" r="8" stroke="rgba(50, 60, 90, 0.3)" stroke-width="2" fill="none" />
      </svg>

      <!-- 如意云纹装饰2 -->
      <svg class="ruyi-cloud ruyi-2" viewBox="0 0 80 50">
        <path d="M5 40 Q20 20 40 25 Q60 18 75 35" stroke="rgba(50, 60, 90, 0.3)" stroke-width="2.5" fill="none" />
        <circle cx="10" cy="35" r="6" stroke="rgba(50, 60, 90, 0.25)" stroke-width="1.5" fill="none" />
        <circle cx="40" cy="22" r="8" stroke="rgba(50, 60, 90, 0.25)" stroke-width="1.5" fill="none" />
      </svg>

      <!-- 悬挂宫灯装饰 -->
      <svg class="palace-lantern" viewBox="0 0 60 100">
        <!-- 顶部挂钩 -->
        <path d="M30 0 L30 10" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2" />
        <ellipse cx="30" cy="15" rx="8" ry="5" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2" fill="none" />
        <!-- 灯身 -->
        <path d="M15 20 L10 50 L15 80 L45 80 L50 50 L45 20 Z" stroke="rgba(180, 80, 70, 0.5)" stroke-width="2"
          fill="rgba(180, 80, 70, 0.15)" />
        <!-- 灯光 -->
        <ellipse cx="30" cy="50" rx="12" ry="20" fill="rgba(255, 200, 100, 0.15)" />
        <!-- 底部流苏 -->
        <line x1="20" y1="80" x2="18" y2="95" stroke="rgba(180, 80, 70, 0.4)" stroke-width="1.5" />
        <line x1="30" y1="80" x2="30" y2="98" stroke="rgba(180, 80, 70, 0.4)" stroke-width="1.5" />
        <line x1="40" y1="80" x2="42" y2="95" stroke="rgba(180, 80, 70, 0.4)" stroke-width="1.5" />
      </svg>

      <!-- 飞鹤群 -->
      <svg class="flying-cranes" viewBox="0 0 200 100">
        <!-- 鹤1 -->
        <g class="crane crane-1">
          <path d="M20 50 Q30 40 50 45 L55 42 L50 45 Q65 50 80 45" stroke="rgba(20, 15, 25, 0.55)" stroke-width="2"
            fill="none" />
          <path d="M35 45 Q40 35 45 45" stroke="rgba(20, 15, 25, 0.5)" stroke-width="1.5" fill="none" />
          <path d="M55 47 Q60 37 65 47" stroke="rgba(20, 15, 25, 0.5)" stroke-width="1.5" fill="none" />
        </g>
        <!-- 鹤2 -->
        <g class="crane crane-2">
          <path d="M100 30 Q110 22 125 25 L130 22 L125 25 Q140 28 155 24" stroke="rgba(20, 15, 25, 0.45)"
            stroke-width="1.8" fill="none" />
          <path d="M112 25 Q117 18 122 25" stroke="rgba(20, 15, 25, 0.4)" stroke-width="1.2" fill="none" />
          <path d="M132 26 Q137 19 142 26" stroke="rgba(20, 15, 25, 0.4)" stroke-width="1.2" fill="none" />
        </g>
        <!-- 鹤3 -->
        <g class="crane crane-3">
          <path d="M140 60 Q150 52 165 56 L170 53 L165 56 Q175 59 188 55" stroke="rgba(20, 15, 25, 0.4)"
            stroke-width="1.5" fill="none" />
          <path d="M152 55 Q156 48 160 55" stroke="rgba(20, 15, 25, 0.35)" stroke-width="1" fill="none" />
        </g>
      </svg>

      <!-- 梅花枝 -->
      <svg class="plum-branch plum-left" viewBox="0 0 180 250">
        <path d="M0 250 Q30 200 50 150 Q70 100 90 60 Q100 30 95 0" stroke="rgba(20, 15, 25, 0.6)" stroke-width="3"
          fill="none" />
        <path d="M50 150 Q80 140 100 160" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2" fill="none" />
        <path d="M70 110 Q40 90 30 60" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2" fill="none" />
        <!-- 梅花 -->
        <circle cx="100" cy="165" r="6" fill="rgba(180, 80, 70, 0.4)" />
        <circle cx="30" cy="55" r="5" fill="rgba(180, 80, 70, 0.35)" />
        <circle cx="95" cy="55" r="4" fill="rgba(180, 80, 70, 0.3)" />
        <circle cx="55" cy="145" r="4" fill="rgba(180, 80, 70, 0.35)" />
      </svg>

      <!-- 右侧梅花枝 -->
      <svg class="plum-branch plum-right" viewBox="0 0 180 250">
        <path d="M180 250 Q150 200 130 150 Q110 100 90 60 Q80 30 85 0" stroke="rgba(20, 15, 25, 0.55)" stroke-width="3"
          fill="none" />
        <path d="M130 150 Q100 135 85 155" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" fill="none" />
        <!-- 梅花 -->
        <circle cx="85" cy="160" r="5" fill="rgba(180, 80, 70, 0.35)" />
        <circle cx="88" cy="55" r="4" fill="rgba(180, 80, 70, 0.3)" />
        <circle cx="125" cy="145" r="5" fill="rgba(180, 80, 70, 0.35)" />
      </svg>

      <!-- 浮云装饰 -->
      <svg class="floating-cloud cloud-center-1" viewBox="0 0 120 50">
        <path d="M10 40 Q20 20 40 25 Q50 10 70 20 Q90 15 100 30 Q110 35 110 40" stroke="rgba(50, 60, 90, 0.25)"
          stroke-width="2" fill="none" />
      </svg>
      <svg class="floating-cloud cloud-center-2" viewBox="0 0 100 40">
        <path d="M5 35 Q15 15 35 20 Q50 8 70 18 Q85 12 95 30" stroke="rgba(50, 60, 90, 0.2)" stroke-width="1.5"
          fill="none" />
      </svg>

      <!-- 竹叶装饰 -->
      <svg class="bamboo-leaves bamboo-center" viewBox="0 0 100 200">
        <path d="M50 200 L50 0" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2" fill="none" />
        <path d="M50 40 Q30 30 20 50" stroke="rgba(20, 15, 25, 0.45)" stroke-width="1.5" fill="none" />
        <path d="M50 40 Q70 30 80 50" stroke="rgba(20, 15, 25, 0.45)" stroke-width="1.5" fill="none" />
        <path d="M50 80 Q25 70 15 90" stroke="rgba(20, 15, 25, 0.4)" stroke-width="1.5" fill="none" />
        <path d="M50 80 Q75 70 85 90" stroke="rgba(20, 15, 25, 0.4)" stroke-width="1.5" fill="none" />
        <path d="M50 120 Q30 110 22 130" stroke="rgba(20, 15, 25, 0.4)" stroke-width="1.5" fill="none" />
        <path d="M50 120 Q70 110 78 130" stroke="rgba(20, 15, 25, 0.4)" stroke-width="1.5" fill="none" />
        <path d="M50 160 Q35 150 28 170" stroke="rgba(20, 15, 25, 0.35)" stroke-width="1.5" fill="none" />
        <path d="M50 160 Q65 150 72 170" stroke="rgba(20, 15, 25, 0.35)" stroke-width="1.5" fill="none" />
      </svg>
    </div>

    <!-- 近景：摇曳边框 -->
    <div class="foreground-layer" :style="foregroundLayerStyle">
      <!-- 左上角垂柳 -->
      <div class="willow willow-left">
        <svg viewBox="0 0 200 400" class="willow-svg">
          <!-- 柳枝 -->
          <g class="willow-branch branch-1">
            <path d="M180 0 Q160 100 140 200 Q130 280 120 350" stroke="rgba(20, 15, 25, 0.6)" stroke-width="3"
              fill="none" />
            <path d="M120 200 Q100 250 90 320" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2" fill="none" />
          </g>
          <g class="willow-branch branch-2">
            <path d="M160 0 Q130 120 100 240 Q80 320 70 400" stroke="rgba(20, 15, 25, 0.55)" stroke-width="2.5"
              fill="none" />
          </g>
          <g class="willow-branch branch-3">
            <path d="M140 0 Q100 100 60 200 Q40 280 30 380" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2"
              fill="none" />
          </g>
        </svg>
      </div>

      <!-- 右上角垂柳 -->
      <div class="willow willow-right">
        <svg viewBox="0 0 200 400" class="willow-svg">
          <g class="willow-branch branch-4">
            <path d="M20 0 Q40 100 60 200 Q70 280 80 350" stroke="rgba(20, 15, 25, 0.55)" stroke-width="3"
              fill="none" />
            <path d="M80 200 Q100 250 110 320" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" fill="none" />
          </g>
          <g class="willow-branch branch-5">
            <path d="M40 0 Q70 120 100 240 Q120 320 130 400" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2.5"
              fill="none" />
          </g>
          <g class="willow-branch branch-6">
            <path d="M60 0 Q100 100 140 200 Q160 280 170 380" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2"
              fill="none" />
          </g>
        </svg>
      </div>

      <!-- 左下角垂柳 -->
      <div class="willow willow-bottom-left">
        <svg viewBox="0 0 180 300" class="willow-svg">
          <g class="willow-branch branch-7">
            <path d="M160 300 Q140 220 120 140 Q110 80 100 20" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2.5"
              fill="none" />
          </g>
          <g class="willow-branch branch-8">
            <path d="M140 300 Q100 200 70 100 Q50 40 40 0" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2"
              fill="none" />
          </g>
        </svg>
      </div>

      <!-- 中间顶部垂柳 -->
      <div class="willow willow-top-center">
        <svg viewBox="0 0 150 350" class="willow-svg">
          <g class="willow-branch branch-9">
            <path d="M75 0 Q60 80 50 160 Q40 240 35 320" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2" fill="none" />
          </g>
          <g class="willow-branch branch-10">
            <path d="M75 0 Q90 80 100 160 Q110 240 115 320" stroke="rgba(20, 15, 25, 0.4)" stroke-width="1.8"
              fill="none" />
          </g>
        </svg>
      </div>

      <!-- 顶部左侧垂柳组 -->
      <div class="willow willow-top-left-2">
        <svg viewBox="0 0 180 380" class="willow-svg">
          <g class="willow-branch branch-11">
            <path d="M160 0 Q140 90 120 180 Q105 270 95 360" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2.5"
              fill="none" />
          </g>
          <g class="willow-branch branch-12">
            <path d="M140 0 Q110 100 85 200 Q65 290 55 370" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2"
              fill="none" />
          </g>
          <g class="willow-branch branch-13">
            <path d="M120 0 Q80 80 50 160 Q30 240 20 340" stroke="rgba(20, 15, 25, 0.4)" stroke-width="1.8"
              fill="none" />
          </g>
        </svg>
      </div>

      <!-- 顶部右侧垂柳组 -->
      <div class="willow willow-top-right-2">
        <svg viewBox="0 0 180 380" class="willow-svg">
          <g class="willow-branch branch-14">
            <path d="M20 0 Q40 90 60 180 Q75 270 85 360" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2.5"
              fill="none" />
          </g>
          <g class="willow-branch branch-15">
            <path d="M40 0 Q70 100 95 200 Q115 290 125 370" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2"
              fill="none" />
          </g>
          <g class="willow-branch branch-16">
            <path d="M60 0 Q100 80 130 160 Q150 240 160 340" stroke="rgba(20, 15, 25, 0.4)" stroke-width="1.8"
              fill="none" />
          </g>
        </svg>
      </div>

      <!-- 右侧中部垂柳 -->
      <div class="willow willow-right-mid">
        <svg viewBox="0 0 160 320" class="willow-svg">
          <g class="willow-branch branch-17">
            <path d="M10 0 Q30 70 50 140 Q65 210 75 300" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2.2"
              fill="none" />
          </g>
          <g class="willow-branch branch-18">
            <path d="M30 0 Q55 80 75 160 Q90 240 100 310" stroke="rgba(20, 15, 25, 0.4)" stroke-width="1.8"
              fill="none" />
          </g>
        </svg>
      </div>

      <!-- 左侧中部垂柳 -->
      <div class="willow willow-left-mid">
        <svg viewBox="0 0 160 320" class="willow-svg">
          <g class="willow-branch branch-19">
            <path d="M150 0 Q130 70 110 140 Q95 210 85 300" stroke="rgba(20, 15, 25, 0.45)" stroke-width="2.2"
              fill="none" />
          </g>
          <g class="willow-branch branch-20">
            <path d="M130 0 Q105 80 85 160 Q70 240 60 310" stroke="rgba(20, 15, 25, 0.4)" stroke-width="1.8"
              fill="none" />
          </g>
        </svg>
      </div>

      <!-- 右下角垂柳 -->
      <div class="willow willow-bottom-right">
        <svg viewBox="0 0 180 280" class="willow-svg">
          <g class="willow-branch branch-21">
            <path d="M20 280 Q40 200 60 120 Q75 60 85 0" stroke="rgba(20, 15, 25, 0.48)" stroke-width="2.3"
              fill="none" />
          </g>
          <g class="willow-branch branch-22">
            <path d="M40 280 Q65 190 90 100 Q110 40 120 0" stroke="rgba(20, 15, 25, 0.42)" stroke-width="1.9"
              fill="none" />
          </g>
        </svg>
      </div>

      <!-- 顶部中左垂柳 -->
      <div class="willow willow-top-center-left">
        <svg viewBox="0 0 120 300" class="willow-svg">
          <g class="willow-branch branch-23">
            <path d="M100 0 Q85 70 70 140 Q55 210 45 280" stroke="rgba(20, 15, 25, 0.42)" stroke-width="1.8"
              fill="none" />
          </g>
          <g class="willow-branch branch-24">
            <path d="M80 0 Q60 80 45 160 Q30 230 25 290" stroke="rgba(20, 15, 25, 0.38)" stroke-width="1.5"
              fill="none" />
          </g>
        </svg>
      </div>

      <!-- 顶部中右垂柳 -->
      <div class="willow willow-top-center-right">
        <svg viewBox="0 0 120 300" class="willow-svg">
          <g class="willow-branch branch-25">
            <path d="M20 0 Q35 70 50 140 Q65 210 75 280" stroke="rgba(20, 15, 25, 0.42)" stroke-width="1.8"
              fill="none" />
          </g>
          <g class="willow-branch branch-26">
            <path d="M40 0 Q60 80 75 160 Q90 230 95 290" stroke="rgba(20, 15, 25, 0.38)" stroke-width="1.5"
              fill="none" />
          </g>
        </svg>
      </div>

      <!-- 底部中央垂柳 -->
      <div class="willow willow-bottom-center">
        <svg viewBox="0 0 200 250" class="willow-svg">
          <g class="willow-branch branch-27">
            <path d="M100 250 Q85 180 70 110 Q60 50 55 0" stroke="rgba(20, 15, 25, 0.4)" stroke-width="2" fill="none" />
          </g>
          <g class="willow-branch branch-28">
            <path d="M100 250 Q115 180 130 110 Q140 50 145 0" stroke="rgba(20, 15, 25, 0.4)" stroke-width="2"
              fill="none" />
          </g>
        </svg>
      </div>

      <!-- 左上角额外垂柳 -->
      <div class="willow willow-left-extra">
        <svg viewBox="0 0 150 350" class="willow-svg">
          <g class="willow-branch branch-29">
            <path d="M130 0 Q110 85 90 170 Q75 250 65 330" stroke="rgba(20, 15, 25, 0.43)" stroke-width="2"
              fill="none" />
          </g>
          <g class="willow-branch branch-30">
            <path d="M110 0 Q85 90 60 180 Q40 260 30 340" stroke="rgba(20, 15, 25, 0.38)" stroke-width="1.7"
              fill="none" />
          </g>
        </svg>
      </div>

      <!-- 右下角灯笼组 -->
      <div class="lantern-group lantern-group-right">
        <div class="lantern lantern-1">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-2">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-3">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
      </div>

      <!-- 左侧悬挂灯笼组 -->
      <div class="lantern-group lantern-group-left">
        <div class="lantern lantern-4">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-5">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
      </div>

      <!-- 顶部悬挂灯笼 -->
      <div class="lantern-group lantern-group-top">
        <div class="lantern lantern-6">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
      </div>

      <!-- 顶部中央灯笼组 -->
      <div class="lantern-group lantern-group-top-center">
        <div class="lantern lantern-7">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-8">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-9">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
      </div>

      <!-- 右侧中部灯笼组 -->
      <div class="lantern-group lantern-group-right-mid">
        <div class="lantern lantern-10">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-11">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
      </div>

      <!-- 左下角灯笼组 -->
      <div class="lantern-group lantern-group-bottom-left">
        <div class="lantern lantern-12">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-13">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
      </div>

      <!-- 底部中央灯笼组 -->
      <div class="lantern-group lantern-group-bottom-center">
        <div class="lantern lantern-14">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-15">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-16">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
      </div>

      <!-- 中偏左灯笼组 -->
      <div class="lantern-group lantern-group-center-left">
        <div class="lantern lantern-17">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-18">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern lantern-19">
          <div class="lantern-top"></div>
          <div class="lantern-body">
            <div class="lantern-glow"></div>
          </div>
          <div class="lantern-bottom"></div>
          <div class="lantern-tassel"></div>
        </div>
      </div>

      <!-- 右下角松针 -->
      <div class="pine-needle-cluster">
        <svg viewBox="0 0 150 200" class="pine-needle-svg">
          <g class="pine-needles">
            <path d="M75 200 Q60 150 50 100 Q45 50 55 0" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2" fill="none" />
            <path d="M75 200 Q80 140 90 80 Q100 30 95 0" stroke="rgba(20, 15, 25, 0.5)" stroke-width="2" fill="none" />
            <path d="M75 200 Q40 160 20 120 Q5 80 10 40" stroke="rgba(20, 15, 25, 0.45)" stroke-width="1.5"
              fill="none" />
            <path d="M75 200 Q110 150 130 100 Q145 50 140 0" stroke="rgba(20, 15, 25, 0.45)" stroke-width="1.5"
              fill="none" />
            <ellipse cx="50" cy="50" rx="35" ry="20" fill="rgba(20, 15, 25, 0.4)" />
            <ellipse cx="100" cy="40" rx="30" ry="18" fill="rgba(20, 15, 25, 0.35)" />
          </g>
        </svg>
      </div>
    </div>

    <!-- 装饰元素：远处灯笼点缀 -->
    <div class="distant-lanterns">
      <div class="distant-lantern dl-1"></div>
      <div class="distant-lantern dl-2"></div>
      <div class="distant-lantern dl-3"></div>
    </div>

    <!-- 粒子效果 Canvas (飘落花瓣/纸片) -->
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>

    <!-- 纸张纹理叠加层 -->
    <div class="paper-overlay"></div>

    <!-- 暗角遮罩 -->
    <div class="vignette-overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/settings.store';
import { computed, onMounted, onUnmounted, ref } from 'vue';

// Props
defineProps<{
  embedded?: boolean
}>()

const cleanupFunctions: Array<() => void> = []

const containerRef = ref<HTMLElement | null>(null)
const particleCanvas = ref<HTMLCanvasElement | null>(null)

// 获取全局帧率设置
const settingsStore = useSettingsStore()

// 鼠标位置用于视差效果
const mouseX = ref(0.5)
const mouseY = ref(0.5)

// 视差偏移量 - 三层不同速率
const mountainLayerStyle = computed(() => ({
  transform: `translate(${(mouseX.value - 0.5) * -4}px, ${(mouseY.value - 0.5) * -4}px)`
}))

const gardenLayerStyle = computed(() => ({
  transform: `translate(${(mouseX.value - 0.5) * -10}px, ${(mouseY.value - 0.5) * -10}px)`
}))

const foregroundLayerStyle = computed(() => ({
  transform: `translate(${(mouseX.value - 0.5) * -20}px, ${(mouseY.value - 0.5) * -20}px)`
}))

// 鼠标移动处理
const handleMouseMove = (e: MouseEvent) => {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  // 使用 lerp 平滑过渡
  const targetX = (e.clientX - rect.left) / rect.width
  const targetY = (e.clientY - rect.top) / rect.height
  mouseX.value += (targetX - mouseX.value) * 0.1
  mouseY.value += (targetY - mouseY.value) * 0.1
}

// 粒子系统 - 飘落纸片/花瓣
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  size: number
  opacity: number
  type: 'petal' | 'paper'
  swayPhase: number
  swaySpeed: number
}

let particles: Particle[] = []
let animationId: number | null = null
let lightBreathPhase = 0

const initParticleSystem = () => {
  const canvas = particleCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置画布尺寸
  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)
  cleanupFunctions.push(() => window.removeEventListener('resize', resize))

  // 创建粒子
  const createParticle = (): Particle => {
    const type = Math.random() > 0.7 ? 'paper' : 'petal'
    return {
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0.3 + Math.random() * 0.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      size: type === 'paper' ? 8 + Math.random() * 12 : 4 + Math.random() * 6,
      opacity: 0.3 + Math.random() * 0.4,
      type,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.02 + Math.random() * 0.02
    }
  }

  // 初始化粒子 - 优化数量
  for (let i = 0; i < 22; i++) {
    const p = createParticle()
    p.y = Math.random() * canvas.height
    particles.push(p)
  }

  // 动画循环 - 使用全局帧率设置
  let lastFrameTime = 0
  const getFrameInterval = () => {
    const globalFPS = settingsStore.visualizationFrameRate || 60
    return 1000 / globalFPS
  }

  const animate = (currentTime: number) => {
    animationId = requestAnimationFrame(animate)

    // 帧率限制：跳过不需要渲染的帧
    const frameInterval = getFrameInterval()
    const deltaTime = currentTime - lastFrameTime
    if (deltaTime < frameInterval) return
    lastFrameTime = currentTime - (deltaTime % frameInterval)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 光影呼吸效果 (8-10秒周期) - 根据帧率动态调整步进值
    const fps = settingsStore.visualizationFrameRate || 60
    lightBreathPhase += 0.5 / fps
    const breathFactor = 0.9 + Math.sin(lightBreathPhase) * 0.1

    // 更新月光强度 (通过 CSS 变量)
    document.documentElement.style.setProperty('--moon-breath', breathFactor.toString())

    particles.forEach((particle, index) => {
      // 摇摆效果 - 根据帧率动态调整
      const fps = settingsStore.visualizationFrameRate || 60
      const speedMultiplier = 60 / fps
      particle.swayPhase += particle.swaySpeed * speedMultiplier
      particle.x += particle.vx + Math.sin(particle.swayPhase) * 0.5
      particle.y += particle.vy * speedMultiplier
      particle.rotation += particle.rotationSpeed * speedMultiplier

      // 边界检查
      if (particle.y > canvas.height + 20 || particle.x < -50 || particle.x > canvas.width + 50) {
        particles[index] = createParticle()
      }

      // 绘制粒子
      ctx.save()
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rotation)
      ctx.globalAlpha = particle.opacity * breathFactor

      if (particle.type === 'paper') {
        // 纸片 - 矩形带圆角
        ctx.fillStyle = 'rgba(253, 246, 227, 0.6)'
        ctx.shadowColor = 'rgba(255, 236, 179, 0.3)'
        ctx.shadowBlur = 5
        ctx.beginPath()
        const w = particle.size
        const h = particle.size * 0.6
        ctx.roundRect(-w / 2, -h / 2, w, h, 2)
        ctx.fill()
      } else {
        // 花瓣 - 椭圆形
        ctx.fillStyle = 'rgba(255, 236, 200, 0.5)'
        ctx.beginPath()
        ctx.ellipse(0, 0, particle.size, particle.size * 0.5, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    })
  }

  animate(0)
}

onMounted(() => {
  initParticleSystem()
})

onUnmounted(() => {
  cleanupFunctions.forEach(fn => fn())
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "sass:math";

// 剪纸戏梦色板
$twilight-purple: #242038;
$deep-indigo: #1a1c29;
$moon-white: #fdf6e3;
$candle-yellow: #ffecb3;
$cinnabar-muted: rgba(180, 80, 70, 0.6);
$indigo-accent: rgba(75, 100, 140, 0.5);
$paper-dark: rgba(20, 15, 25, 0.85);
$paper-shadow: rgba(0, 0, 0, 0.5);

:root {
  --moon-breath: 1;
}

.papercut-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(180deg, $twilight-purple 0%, $deep-indigo 100%);

  &.embedded {
    position: absolute;
    z-index: 0;
  }
}

// 底层：透光宣纸天幕
.rice-paper-sky {
  position: absolute;
  inset: 0;
  overflow: hidden;

  .paper-texture {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 50% 25%, rgba($moon-white, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 30% 60%, rgba($moon-white, 0.03) 0%, transparent 40%),
      radial-gradient(ellipse at 70% 70%, rgba($moon-white, 0.03) 0%, transparent 40%);
    // 纸张纤维纹理通过 noise 模拟
    filter: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E#noise");
    opacity: 0.03;
    mix-blend-mode: overlay;
  }

  .moon-glow {
    position: absolute;
    top: 8%;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    height: 400px;
    background: radial-gradient(circle,
        rgba($moon-white, calc(0.15 * var(--moon-breath))) 0%,
        rgba($candle-yellow, calc(0.08 * var(--moon-breath))) 30%,
        transparent 70%);
    border-radius: 50%;
    filter: blur(40px);
    animation: moonPulse 10s ease-in-out infinite;
  }

  .moon-core {
    position: absolute;
    top: 12%;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 80px;
    background: radial-gradient(circle,
        rgba($moon-white, calc(0.9 * var(--moon-breath))) 0%,
        rgba($candle-yellow, calc(0.6 * var(--moon-breath))) 50%,
        transparent 100%);
    border-radius: 50%;
    filter: blur(8px);
    box-shadow:
      0 0 60px rgba($moon-white, 0.3),
      0 0 120px rgba($candle-yellow, 0.2);
  }
}

@keyframes moonPulse {

  0%,
  100% {
    opacity: 0.9;
    transform: translateX(-50%) scale(1);
  }

  50% {
    opacity: 1;
    transform: translateX(-50%) scale(1.05);
  }
}

// 远景：层峦剪影
.mountain-layer {
  position: absolute;
  inset: 0;
  transition: transform 0.3s ease-out;

  .mountain {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    filter: drop-shadow(0 4px 8px $paper-shadow);
  }

  .mountain-far {
    height: 40%;
    background: linear-gradient(to bottom,
        rgba(40, 50, 80, 0.3) 0%,
        rgba(30, 35, 55, 0.5) 100%);
    clip-path: polygon(0% 100%,
        0% 70%,
        10% 55%,
        20% 65%,
        35% 45%,
        50% 60%,
        65% 40%,
        80% 55%,
        90% 50%,
        100% 60%,
        100% 100%);
    opacity: 0.6;
  }

  .mountain-mid {
    height: 35%;
    background: linear-gradient(to bottom,
        rgba(35, 40, 65, 0.5) 0%,
        rgba(25, 28, 45, 0.7) 100%);
    clip-path: polygon(0% 100%,
        0% 65%,
        15% 50%,
        30% 60%,
        45% 40%,
        60% 55%,
        75% 35%,
        90% 50%,
        100% 45%,
        100% 100%);
    opacity: 0.75;
  }

  .mountain-near {
    height: 28%;
    background: linear-gradient(to bottom,
        rgba(28, 32, 50, 0.7) 0%,
        rgba(20, 22, 35, 0.9) 100%);
    clip-path: polygon(0% 100%,
        0% 55%,
        12% 45%,
        25% 55%,
        40% 35%,
        55% 50%,
        70% 30%,
        85% 45%,
        100% 40%,
        100% 100%);
    opacity: 0.9;
  }

  // 云纹剪影
  .cloud-pattern {
    position: absolute;
    background: rgba(50, 60, 90, 0.2);
    border-radius: 50%;
    filter: blur(20px);
  }

  .cloud-1 {
    top: 25%;
    left: 10%;
    width: 200px;
    height: 60px;
    animation: cloudDrift 30s ease-in-out infinite;
  }

  .cloud-2 {
    top: 30%;
    right: 15%;
    width: 150px;
    height: 45px;
    animation: cloudDrift 25s ease-in-out infinite reverse;
  }

  .cloud-3 {
    top: 35%;
    left: 40%;
    width: 180px;
    height: 50px;
    animation: cloudDrift 35s ease-in-out infinite;
    animation-delay: -10s;
  }
}

@keyframes cloudDrift {

  0%,
  100% {
    transform: translateX(0);
    opacity: 0.4;
  }

  50% {
    transform: translateX(30px);
    opacity: 0.6;
  }
}

// 中层：园林与枯木
.garden-layer {
  position: absolute;
  inset: 0;
  transition: transform 0.2s ease-out;

  .pavilion {
    position: absolute;
    filter: drop-shadow(0 6px 12px $paper-shadow);
  }

  .pavilion-left {
    left: 5%;
    bottom: 15%;
    width: 180px;
    height: auto;
    opacity: 0.9;
  }

  .pine-tree {
    position: absolute;
    filter: drop-shadow(0 6px 12px $paper-shadow);
  }

  .pine-right {
    right: 8%;
    bottom: 10%;
    width: 150px;
    height: auto;
    opacity: 0.85;
  }

  .dead-branch {
    position: absolute;
    filter: drop-shadow(0 4px 8px $paper-shadow);
  }

  .branch-center {
    left: 30%;
    bottom: 25%;
    width: 250px;
    height: auto;
    opacity: 0.7;
  }

  // 大型拱桥 - 跨越整个屏幕
  .grand-arch-bridge {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 20%;
    width: 100%;
    height: 180px;
    opacity: 0.8;
    filter: drop-shadow(0 4px 10px $paper-shadow);
    pointer-events: none;
  }

  // 月门
  .moon-gate {
    position: absolute;
    left: 55%;
    top: 25%;
    width: 120px;
    height: auto;
    opacity: 0.55;
    animation: moonGateFloat 8s ease-in-out infinite;
  }

  .moon-gate-left {
    left: 18%;
    top: 35%;
    width: 90px;
    opacity: 0.45;
    animation-delay: -3s;
  }

  // 八角窗棂
  .octagon-window {
    position: absolute;
    left: 42%;
    top: 40%;
    width: 80px;
    height: auto;
    opacity: 0.5;
    animation: moonGateFloat 10s ease-in-out infinite;
    animation-delay: -2s;
  }

  // 六边形窗棂
  .hexagon-window {
    position: absolute;
    right: 30%;
    top: 45%;
    width: 70px;
    height: auto;
    opacity: 0.45;
    animation: moonGateFloat 9s ease-in-out infinite;
    animation-delay: -4s;
  }

  // 扇形装饰
  .fan-decoration {
    position: absolute;
    left: 35%;
    top: 55%;
    width: 100px;
    height: auto;
    opacity: 0.5;
    animation: fanSway 12s ease-in-out infinite;
  }

  // 如意云纹
  .ruyi-cloud {
    position: absolute;
    opacity: 0.6;
  }

  .ruyi-1 {
    top: 35%;
    left: 25%;
    width: 120px;
    height: auto;
    animation: cloudFloat 18s ease-in-out infinite;
  }

  .ruyi-2 {
    top: 50%;
    right: 22%;
    width: 100px;
    height: auto;
    animation: cloudFloat 15s ease-in-out infinite reverse;
  }

  // 宫灯装饰
  .palace-lantern {
    position: absolute;
    top: 8%;
    left: 48%;
    width: 50px;
    height: auto;
    opacity: 0.6;
    animation: lanternSway 5s ease-in-out infinite;
    transform-origin: top center;
  }

  // 飞鹤群
  .flying-cranes {
    position: absolute;
    top: 20%;
    left: 30%;
    width: 180px;
    height: auto;
    opacity: 0.6;
    animation: cranesGlide 20s linear infinite;
  }

  .crane-1 {
    animation: craneFly 3s ease-in-out infinite;
  }

  .crane-2 {
    animation: craneFly 3.5s ease-in-out infinite;
    animation-delay: -1s;
  }

  .crane-3 {
    animation: craneFly 4s ease-in-out infinite;
    animation-delay: -2s;
  }

  // 梅花枝
  .plum-branch {
    position: absolute;
    filter: drop-shadow(0 3px 6px $paper-shadow);
  }

  .plum-left {
    left: 20%;
    bottom: 40%;
    width: 120px;
    height: auto;
    opacity: 0.6;
  }

  .plum-right {
    right: 25%;
    bottom: 45%;
    width: 110px;
    height: auto;
    opacity: 0.55;
  }

  // 浮云装饰
  .floating-cloud {
    position: absolute;
    opacity: 0.5;
  }

  .cloud-center-1 {
    top: 40%;
    left: 40%;
    width: 100px;
    height: auto;
    animation: cloudFloat 15s ease-in-out infinite;
  }

  .cloud-center-2 {
    top: 50%;
    right: 35%;
    width: 80px;
    height: auto;
    animation: cloudFloat 18s ease-in-out infinite reverse;
  }

  // 竹叶装饰
  .bamboo-leaves {
    position: absolute;
    filter: drop-shadow(0 2px 4px $paper-shadow);
  }

  .bamboo-center {
    right: 40%;
    bottom: 30%;
    width: 60px;
    height: auto;
    opacity: 0.55;
    animation: bambooSway 6s ease-in-out infinite;
  }
}

@keyframes moonGateFloat {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

@keyframes cranesGlide {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(50px);
  }
}

@keyframes craneFly {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

@keyframes cloudFloat {

  0%,
  100% {
    transform: translate(0, 0);
    opacity: 0.4;
  }

  50% {
    transform: translate(15px, -5px);
    opacity: 0.6;
  }
}

@keyframes bambooSway {

  0%,
  100% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(1deg);
  }

  75% {
    transform: rotate(-1deg);
  }
}

@keyframes fanSway {

  0%,
  100% {
    transform: rotate(0deg) translateY(0);
  }

  50% {
    transform: rotate(2deg) translateY(-3px);
  }
}

@keyframes lanternSway {

  0%,
  100% {
    transform: rotate(-2deg);
  }

  50% {
    transform: rotate(2deg);
  }
}

// 近景：摇曳边框
.foreground-layer {
  position: absolute;
  inset: 0;
  transition: transform 0.15s ease-out;
  filter: blur(0.8px); // 景深模糊 - 优化性能
}

// 垂柳
.willow {
  position: absolute;

  .willow-svg {
    width: 100%;
    height: 100%;
  }

  .willow-branch {
    transform-origin: top center;
  }

  .branch-1 {
    animation: willowSway 5s ease-in-out infinite;
  }

  .branch-2 {
    animation: willowSway 6s ease-in-out infinite;
    animation-delay: -1s;
  }

  .branch-3 {
    animation: willowSway 5.5s ease-in-out infinite;
    animation-delay: -2s;
  }

  .branch-4 {
    animation: willowSwayReverse 5.2s ease-in-out infinite;
  }

  .branch-5 {
    animation: willowSwayReverse 6.2s ease-in-out infinite;
    animation-delay: -0.5s;
  }

  .branch-6 {
    animation: willowSwayReverse 5.8s ease-in-out infinite;
    animation-delay: -1.5s;
  }

  .branch-7 {
    animation: willowSwayBottom 4.5s ease-in-out infinite;
    transform-origin: bottom center;
  }

  .branch-8 {
    animation: willowSwayBottom 5s ease-in-out infinite;
    animation-delay: -1s;
    transform-origin: bottom center;
  }

  .branch-9 {
    animation: willowSway 5.5s ease-in-out infinite;
    animation-delay: -0.8s;
  }

  .branch-10 {
    animation: willowSway 6s ease-in-out infinite;
    animation-delay: -2.5s;
  }

  // 新增柳枝动画 11-30
  .branch-11 {
    animation: willowSway 5.3s ease-in-out infinite;
    animation-delay: -0.3s;
  }

  .branch-12 {
    animation: willowSway 5.8s ease-in-out infinite;
    animation-delay: -1.2s;
  }

  .branch-13 {
    animation: willowSway 6.2s ease-in-out infinite;
    animation-delay: -2.1s;
  }

  .branch-14 {
    animation: willowSwayReverse 5.4s ease-in-out infinite;
    animation-delay: -0.6s;
  }

  .branch-15 {
    animation: willowSwayReverse 5.9s ease-in-out infinite;
    animation-delay: -1.5s;
  }

  .branch-16 {
    animation: willowSwayReverse 6.3s ease-in-out infinite;
    animation-delay: -2.4s;
  }

  .branch-17 {
    animation: willowSwayReverse 5.1s ease-in-out infinite;
    animation-delay: -0.4s;
  }

  .branch-18 {
    animation: willowSwayReverse 5.6s ease-in-out infinite;
    animation-delay: -1.3s;
  }

  .branch-19 {
    animation: willowSway 5.2s ease-in-out infinite;
    animation-delay: -0.7s;
  }

  .branch-20 {
    animation: willowSway 5.7s ease-in-out infinite;
    animation-delay: -1.6s;
  }

  .branch-21 {
    animation: willowSwayBottom 4.8s ease-in-out infinite;
    transform-origin: bottom center;
  }

  .branch-22 {
    animation: willowSwayBottom 5.3s ease-in-out infinite;
    animation-delay: -0.9s;
    transform-origin: bottom center;
  }

  .branch-23 {
    animation: willowSway 4.9s ease-in-out infinite;
    animation-delay: -0.5s;
  }

  .branch-24 {
    animation: willowSway 5.4s ease-in-out infinite;
    animation-delay: -1.4s;
  }

  .branch-25 {
    animation: willowSwayReverse 5s ease-in-out infinite;
    animation-delay: -0.8s;
  }

  .branch-26 {
    animation: willowSwayReverse 5.5s ease-in-out infinite;
    animation-delay: -1.7s;
  }

  .branch-27 {
    animation: willowSwayBottom 4.6s ease-in-out infinite;
    transform-origin: bottom center;
  }

  .branch-28 {
    animation: willowSwayBottom 5.1s ease-in-out infinite;
    animation-delay: -1.1s;
    transform-origin: bottom center;
  }

  .branch-29 {
    animation: willowSway 5.15s ease-in-out infinite;
    animation-delay: -0.6s;
  }

  .branch-30 {
    animation: willowSway 5.65s ease-in-out infinite;
    animation-delay: -1.8s;
  }
}

.willow-left {
  top: 0;
  left: 0;
  width: 200px;
  height: 400px;
}

.willow-right {
  top: 0;
  right: 0;
  width: 200px;
  height: 400px;
}

.willow-bottom-left {
  bottom: 0;
  left: 5%;
  width: 180px;
  height: 300px;
}

.willow-top-center {
  top: 0;
  left: 35%;
  width: 150px;
  height: 350px;
  opacity: 0.7;
}

// 新增垂柳位置
.willow-top-left-2 {
  top: 0;
  left: 15%;
  width: 180px;
  height: 380px;
  opacity: 0.65;
}

.willow-top-right-2 {
  top: 0;
  right: 15%;
  width: 180px;
  height: 380px;
  opacity: 0.65;
}

.willow-right-mid {
  top: 25%;
  right: 0;
  width: 160px;
  height: 320px;
  opacity: 0.6;
}

.willow-left-mid {
  top: 25%;
  left: 0;
  width: 160px;
  height: 320px;
  opacity: 0.6;
}

.willow-bottom-right {
  bottom: 0;
  right: 8%;
  width: 180px;
  height: 280px;
  opacity: 0.55;
}

.willow-top-center-left {
  top: 0;
  left: 25%;
  width: 120px;
  height: 300px;
  opacity: 0.55;
}

.willow-top-center-right {
  top: 0;
  right: 25%;
  width: 120px;
  height: 300px;
  opacity: 0.55;
}

.willow-bottom-center {
  bottom: 0;
  left: 45%;
  width: 200px;
  height: 250px;
  opacity: 0.5;
}

.willow-left-extra {
  top: 5%;
  left: 8%;
  width: 150px;
  height: 350px;
  opacity: 0.6;
}

@keyframes willowSway {

  0%,
  100% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(2deg);
  }

  75% {
    transform: rotate(-2deg);
  }
}

@keyframes willowSwayReverse {

  0%,
  100% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(-2deg);
  }

  75% {
    transform: rotate(2deg);
  }
}

@keyframes willowSwayBottom {

  0%,
  100% {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(1.5deg);
  }
}

// 灯笼组
.lantern-group {
  position: absolute;
  display: flex;
  gap: 30px;
}

.lantern-group-right {
  right: 10%;
  bottom: 20%;
}

.lantern-group-left {
  left: 8%;
  top: 35%;
  flex-direction: column;
  gap: 20px;
}

.lantern-group-top {
  top: 15%;
  right: 25%;
}

.lantern-group-top-center {
  top: 8%;
  left: 50%;
  transform: translateX(-50%);
  gap: 40px;
}

.lantern-group-right-mid {
  right: 5%;
  top: 45%;
  flex-direction: column;
  gap: 25px;
}

.lantern-group-bottom-left {
  left: 15%;
  bottom: 10%;
  gap: 25px;
}

.lantern-group-bottom-center {
  bottom: 8%;
  left: 40%;
  gap: 35px;
}

.lantern-group-center-left {
  top: 40%;
  left: 28%;
  gap: 28px;
}

.lantern {
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-origin: top center;
  filter: drop-shadow(0 4px 12px rgba(255, 100, 50, 0.3));

  .lantern-top {
    width: 20px;
    height: 8px;
    background: $paper-dark;
    border-radius: 2px 2px 0 0;
  }

  .lantern-body {
    width: 35px;
    height: 50px;
    background: linear-gradient(to bottom,
        rgba(180, 60, 50, 0.7) 0%,
        rgba(200, 80, 60, 0.8) 50%,
        rgba(180, 60, 50, 0.7) 100%);
    border-radius: 8px;
    position: relative;
    overflow: hidden;

    .lantern-glow {
      position: absolute;
      inset: 5px;
      background: radial-gradient(ellipse,
          rgba($candle-yellow, 0.6) 0%,
          rgba(255, 180, 100, 0.3) 50%,
          transparent 100%);
      border-radius: 6px;
      animation: lanternGlow 3s ease-in-out infinite;
    }
  }

  .lantern-bottom {
    width: 20px;
    height: 8px;
    background: $paper-dark;
    border-radius: 0 0 2px 2px;
  }

  .lantern-tassel {
    width: 2px;
    height: 25px;
    background: linear-gradient(to bottom, rgba(180, 60, 50, 0.8), rgba(180, 60, 50, 0.4));
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 12px;
      height: 15px;
      background: linear-gradient(to bottom, rgba(180, 60, 50, 0.7), transparent);
      border-radius: 0 0 6px 6px;
    }
  }
}

.lantern-1 {
  animation: lanternSwing 4s ease-in-out infinite;
}

.lantern-2 {
  animation: lanternSwing 4.5s ease-in-out infinite;
  animation-delay: -1s;
  transform: scale(0.85);
}

.lantern-3 {
  animation: lanternSwing 3.8s ease-in-out infinite;
  animation-delay: -2s;
  transform: scale(0.75);
}

.lantern-4 {
  animation: lanternSwing 4.2s ease-in-out infinite;
  animation-delay: -0.5s;
  transform: scale(0.9);
}

.lantern-5 {
  animation: lanternSwing 4.8s ease-in-out infinite;
  animation-delay: -1.5s;
  transform: scale(0.75);
}

.lantern-6 {
  animation: lanternSwing 5s ease-in-out infinite;
  animation-delay: -2.5s;
  transform: scale(0.8);
}

.lantern-7 {
  animation: lanternSwing 4.3s ease-in-out infinite;
  animation-delay: -0.8s;
  transform: scale(0.85);
}

.lantern-8 {
  animation: lanternSwing 4.7s ease-in-out infinite;
  animation-delay: -1.8s;
  transform: scale(0.7);
}

.lantern-9 {
  animation: lanternSwing 5.2s ease-in-out infinite;
  animation-delay: -3s;
  transform: scale(0.75);
}

.lantern-10 {
  animation: lanternSwing 4.1s ease-in-out infinite;
  animation-delay: -0.3s;
  transform: scale(0.82);
}

.lantern-11 {
  animation: lanternSwing 4.6s ease-in-out infinite;
  animation-delay: -2.2s;
  transform: scale(0.68);
}

.lantern-12 {
  animation: lanternSwing 3.9s ease-in-out infinite;
  animation-delay: -1.2s;
  transform: scale(0.78);
}

.lantern-13 {
  animation: lanternSwing 4.4s ease-in-out infinite;
  animation-delay: -2.8s;
  transform: scale(0.65);
}

.lantern-14 {
  animation: lanternSwing 4.9s ease-in-out infinite;
  animation-delay: -0.6s;
  transform: scale(0.88);
}

.lantern-15 {
  animation: lanternSwing 5.1s ease-in-out infinite;
  animation-delay: -1.4s;
  transform: scale(0.72);
}

.lantern-16 {
  animation: lanternSwing 4s ease-in-out infinite;
  animation-delay: -2s;
  transform: scale(0.8);
}

.lantern-17 {
  animation: lanternSwing 4.4s ease-in-out infinite;
  animation-delay: -0.7s;
  transform: scale(0.85);
}

.lantern-18 {
  animation: lanternSwing 4.8s ease-in-out infinite;
  animation-delay: -1.6s;
  transform: scale(0.75);
}

.lantern-19 {
  animation: lanternSwing 5.2s ease-in-out infinite;
  animation-delay: -2.4s;
  transform: scale(0.7);
}

@keyframes lanternSwing {

  0%,
  100% {
    transform: rotate(-3deg);
  }

  50% {
    transform: rotate(3deg);
  }
}

@keyframes lanternGlow {

  0%,
  100% {
    opacity: 0.7;
  }

  50% {
    opacity: 1;
  }
}

// 松针簇
.pine-needle-cluster {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 150px;
  height: 200px;
  opacity: 0.6;

  .pine-needle-svg {
    width: 100%;
    height: 100%;
  }

  .pine-needles {
    animation: pineNeedleSway 6s ease-in-out infinite;
    transform-origin: bottom center;
  }
}

@keyframes pineNeedleSway {

  0%,
  100% {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(1deg);
  }
}

// 远处灯笼点缀
.distant-lanterns {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .distant-lantern {
    position: absolute;
    width: 8px;
    height: 12px;
    background: radial-gradient(ellipse,
        rgba(255, 150, 80, 0.6) 0%,
        rgba(255, 100, 50, 0.3) 50%,
        transparent 100%);
    border-radius: 30%;
    filter: blur(2px);
    animation: distantLanternGlow 4s ease-in-out infinite;
  }

  .dl-1 {
    left: 25%;
    bottom: 35%;
    animation-delay: 0s;
  }

  .dl-2 {
    left: 45%;
    bottom: 40%;
    animation-delay: -1.5s;
    transform: scale(0.7);
  }

  .dl-3 {
    right: 30%;
    bottom: 38%;
    animation-delay: -3s;
    transform: scale(0.85);
  }
}

@keyframes distantLanternGlow {

  0%,
  100% {
    opacity: 0.4;
  }

  50% {
    opacity: 0.7;
  }
}

// 粒子画布
.particle-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

// 纸张纹理叠加层
.paper-overlay {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.08;
  mix-blend-mode: overlay;
  pointer-events: none;
}

// 暗角遮罩
.vignette-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center,
      transparent 40%,
      rgba(0, 0, 0, 0.3) 80%,
      rgba(0, 0, 0, 0.5) 100%);
  pointer-events: none;
}
</style>
