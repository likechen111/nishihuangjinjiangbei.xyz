// GSAP 开屏动画与静默预加载
window.addEventListener('load', async () => {
    // 隐藏初始资源加载动画
    const initialLoader = document.getElementById('initialLoader');
    if (initialLoader) {
        initialLoader.classList.add('hidden-state');
        // 等待淡出动画完成 (0.5s)
        await new Promise(resolve => setTimeout(resolve, 500));
        initialLoader.style.display = 'none';
    }

    // 开始初醒睁眼开屏动画
    playIntroAnimation();
    // 在后台静默预加载所有交互帧，根除图片更换时的肉眼延迟
    preloadCriticalAssets();

    function preloadCriticalAssets() {
        const assetsToPreload = [
            'assets/image/miku_blink_closed_full.png',
            'assets/image/miku_blink_closed_half.png',
            'assets/image/miku_blink_open_full.png',
            'assets/image/miku_blink_open_half.png',
            'assets/image/miku_cry_1.png',
            'assets/image/miku_cry_2.png',
            'assets/image/miku_cry_3.png',
            'assets/image/miku_walk_1.png',
            'assets/image/miku_walk_2.png'
        ];
        // 强制浏览器建立图片缓存
        assetsToPreload.forEach(src => {
            const img = new Image();
            img.src = src;
        });

        // 对第二个沉浸式大视频使用 fetch 主动装载入磁盘缓存区
        // preload removed
    }
});

// 延迟 Promise 工具函数
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function playIntroAnimation() {
    const eyeLoader = document.getElementById('eyeLoader');
    const eyelidTop = document.getElementById('eyelidTop');
    const eyelidBottom = document.getElementById('eyelidBottom');
    const contentWrapper = document.getElementById('contentWrapper');
    const vignetteOverlay = document.getElementById('vignetteOverlay');

    if (!eyeLoader || !eyelidTop || !eyelidBottom || !contentWrapper || !vignetteOverlay) return;

    // 初始设置
    gsap.set('.typing-topleft-container', { opacity: 0, y: -40 });
    gsap.set('.typing-container', { opacity: 0, y: 40 });
    gsap.set('.navbar-right', { opacity: 0, y: -40 });
    gsap.set('.navbar-left', { opacity: 0, x: -40 });
    gsap.set('.miku-mascot-container, .miku-item-container', { opacity: 0, y: 50 });

    // 1. 启动，等待 800ms 酝酿初醒感
    await delay(800);

    // 2. 第一次睁眼 (微张 1300ms 动作，我们在 450ms 时打断并合上，形成完美的 30% 睡眼微张感)
    eyelidTop.classList.add('open-state');
    eyelidBottom.classList.add('open-state');
    
    // 3. 450ms 后回弹闭合
    await delay(450);
    eyelidTop.classList.remove('open-state');
    eyelidBottom.classList.remove('open-state');

    // 4. 合眼沉睡等待 800ms
    await delay(800);

    // 5. 第二次彻底睁开
    eyelidTop.classList.add('open-state');
    eyelidBottom.classList.add('open-state');
    // 第二次彻底睁开时，中央过曝的强光和两侧暗化开始在眨眼睁开期间慢慢恢复正常
    vignetteOverlay.classList.remove('active-state');

    // 6. 等待 600ms (在动作完全展开的中途，开始视线对焦与UI淡入)
    await delay(600);
    contentWrapper.classList.remove('blur-state');

    // 7. 使用 GSAP 优雅滑入 UI 元素（导航栏、侧边按钮、打字机和看板娘）
    const tl = gsap.timeline();
    
    tl.to('.navbar-right', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out', force3D: true, force3D: true
    }, '+=0.3')
    .to('.navbar-left', {
        opacity: 1,
        x: 0,
        duration: 1.2,
        ease: 'power3.out', force3D: true, force3D: true
    }, '-=1.0')
    .to('.typing-topleft-container', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out', force3D: true, force3D: true,
        onStart: startTypedLeft
    }, '-=1.1')
    .to('.typing-container', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out', force3D: true, force3D: true,
        onStart: startTyped
    }, '-=1.1')
    .to('.miku-mascot-container, .miku-item-container', {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: 'back.out(1.7)', force3D: true,
        onComplete: () => {
            initMikuLogic();
            // 动画结束后，彻底隐藏 loader 节点以防影响页面点击
            eyeLoader.style.display = 'none';
        }
    }, '-=1.2');
}


// 将 Miku 逻辑封装成初始化函数
function initMikuLogic() {
    const mikuMascot = document.getElementById('mikuMascot');
    const mikuImg = document.getElementById('mikuImg');
    if (!mikuMascot || !mikuImg) return;

    // 优先使用低分辨素材（如果是网络环境差或大文件未加载）
    // 逻辑：先设置 src 为 lowres 版本，等高分辨版本加载完再替换
    const getAssetPath = (name) => {
        // 模拟逻辑：如果有本地压缩素材文件夹，先尝试加载
        return `assets/image/${name}`; // 暂时保持原路径，后续可加 .low 加密/压缩逻辑
    };

    const assets = {
        idleOpen: getAssetPath('miku_idle_open.png'),
        idleClosed: getAssetPath('miku_idle_closed.png'),
        blinkHalf: getAssetPath('miku_blink_open_half.png'),
        blinkFull: getAssetPath('miku_blink_open_full.png'),
        blinkClosedHalf: getAssetPath('miku_blink_closed_half.png'),
        blinkClosedFull: getAssetPath('miku_blink_closed_full.png'),
        cry1: getAssetPath('miku_cry_1.png'),
        cry2: getAssetPath('miku_cry_2.png'),
        cry3: getAssetPath('miku_cry_3.png'),
        walk1: getAssetPath('miku_walk_1.png'),
        walk2: getAssetPath('miku_walk_2.png')
    };

    let isDragging = false;
    let isEvolving = false; // 新增进化状态标记
    let mouthState = 'OPEN';
    let blinkCount = 0;
    let startX, startY, initialLeft, initialTop;
    let cryCycleInterval;

    let blinkTimer;
    const triggerBlink = () => {
        if (isDragging || isEvolving) return;
        const isClosed = (mouthState === 'CLOSED');
        const halfBlinkAsset = isClosed ? assets.blinkClosedHalf : assets.blinkHalf;
        const fullBlinkAsset = isClosed ? assets.blinkClosedFull : assets.blinkFull;
        const idleAsset = isClosed ? assets.idleClosed : assets.idleOpen;

        setTimeout(() => { mikuImg.src = halfBlinkAsset; }, 0);
        setTimeout(() => { mikuImg.src = fullBlinkAsset; }, 50);
        setTimeout(() => { mikuImg.src = halfBlinkAsset; }, 150);
        setTimeout(() => { 
            mikuImg.src = idleAsset; 
            if (mouthState === 'OPEN') {
                blinkCount++;
                if (blinkCount >= 2) mouthState = 'CLOSED';
            }
        }, 200);
    };

    const startBlinking = () => {
        const loop = () => {
            if (isEvolving) return; // 进化后永久停止
            if (!isDragging) triggerBlink();
            blinkTimer = setTimeout(loop, 5000); 
        };
        blinkTimer = setTimeout(loop, 5000);
    };
    startBlinking();

    mikuMascot.addEventListener('pointerdown', (e) => {
        isDragging = true;
        mouthState = 'OPEN';
        blinkCount = 0;
        mikuImg.src = assets.cry1;
        mikuMascot.style.animation = 'none';
        startX = e.clientX;
        startY = e.clientY;
        const rect = mikuMascot.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        mikuMascot.setPointerCapture(e.pointerId);
    });

    window.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        mikuMascot.style.left = `${initialLeft + dx}px`;
        mikuMascot.style.top = `${initialTop + dy}px`;
        mikuMascot.style.bottom = 'auto'; // 覆盖初始 bottom 固定定位
    });

    window.addEventListener('pointerup', () => {
        if (!isDragging) return;
        isDragging = false;
        
        // 恢复初始浮动动画
        mikuMascot.style.animation = 'miku-float 4s ease-in-out infinite';
        
        // 恢复为张嘴待机图
        mikuImg.src = assets.idleOpen;
        
        // 瞬间触发一次眨眼
        setTimeout(triggerBlink, 300);
    });

    // --- 物品交互 (Leek) ---
    const mikuLeek = document.getElementById('mikuLeek');
    if (mikuLeek) {
        let isLeekDragging = false;
        let lStartX, lStartY, lInitialLeft, lInitialTop;

        mikuLeek.addEventListener('pointerdown', (e) => {
            isLeekDragging = true;
            mikuLeek.style.animation = 'none';
            lStartX = e.clientX;
            lStartY = e.clientY;
            const rect = mikuLeek.getBoundingClientRect();
            lInitialLeft = rect.left;
            lInitialTop = rect.top;
            mikuLeek.setPointerCapture(e.pointerId);
        });

        window.addEventListener('pointermove', (e) => {
            if (!isLeekDragging) return;
            const dx = e.clientX - lStartX;
            const dy = e.clientY - lStartY;
            const newLeft = lInitialLeft + dx;
            const newTop = lInitialTop + dy;
            mikuLeek.style.left = `${newLeft}px`;
            mikuLeek.style.top = `${newTop}px`;
            mikuLeek.style.bottom = 'auto';

            // 碰撞检测
            if (checkCollision(mikuLeek, mikuMascot)) {
                triggerMikuEvolution();
            }
        });

        window.addEventListener('pointerup', () => {
            if (!isLeekDragging) return;
            isLeekDragging = false;
            mikuLeek.style.animation = 'leek-float 3s ease-in-out infinite';
        });
    }

    // 碰撞检测逻辑
    function checkCollision(el1, el2) {
        const r1 = el1.getBoundingClientRect();
        const r2 = el2.getBoundingClientRect();
        return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
    }

    // Miku 进化逻辑 (吃掉大葱)
    function triggerMikuEvolution() {
        if (mikuLeek.style.display === 'none' || isEvolving) return;
        
        isEvolving = true;
        clearTimeout(blinkTimer); // 强制停止眨眼定时器

        // 1. 物品静止并消失
        mikuLeek.style.display = 'none';

        // 2. Miku 变身 (切换图)
        mikuImg.src = 'assets/image/miku_leek.png';
        
        // 3. Miku 直接淡出 (消失)
        gsap.to(mikuMascot, {
            opacity: 0,
            y: 40,
            duration: 1.5,
            ease: 'power2.inOut', force3D: true,
            onComplete: () => {
                mikuMascot.style.visibility = 'hidden';
                mikuMascot.style.display = 'none'; // 彻底移除占位
            }
        });

        // 4. 背景视频切换
        if (window.switchBackground) {
            window.switchBackground();
        }
    }

    // 提供给外部的重置函数（切回 Miku 宇宙时调用）
    window.resetMikuState = function() {
        if (!mikuMascot || !mikuLeek) return;
        isEvolving = false;
        mikuImg.src = assets.idleOpen;
        
        // 恢复初始静靠的 UI 位置
        mikuMascot.style.visibility = 'visible';
        mikuMascot.style.display = 'flex';
        mikuMascot.style.opacity = '0';
        mikuMascot.style.transform = 'translateY(100px)';

        mikuLeek.style.display = 'block';
        mikuLeek.style.visibility = 'visible';
        mikuLeek.style.opacity = '0';
        mikuLeek.style.transform = 'translateY(100px)';
        
        // 这里必须用 inline styles 重置初始偏移量，因为拖动时直接改了 top/left
        mikuLeek.style.left = '220px'; 
        mikuLeek.style.top = '';
        mikuLeek.style.bottom = '30px';

        mikuMascot.style.left = '20px';
        mikuMascot.style.top = '';
        mikuMascot.style.bottom = '20px';

        // 带点缓冲重新跳入屏幕
        gsap.to([mikuMascot, mikuLeek], {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: 'back.out(1.7)', force3D: true,
            delay: 0.8
        });
        
        startBlinking(); // 重新开启眨眼守护线程
    };
}

let isSaberInit = false;
function initSaberLogic() {
    if (isSaberInit) return;
    isSaberInit = true;

    const saberMascot = document.getElementById('saberMascot');
    const saberImg = document.getElementById('saberImg');
    const saberSword = document.getElementById('saberSword');
    
    let isEvolvingSaber = false;
    let sStartX, sStartY, sInitialLeft, sInitialTop;
    let isDraggingSword = false;

    let sMascotStartX, sMascotStartY, sMascotInitialLeft, sMascotInitialTop;
    let isDraggingSaber = false;

    // Saber 入场重置函数
    window.resetSaberState = function() {
        if (!saberSword || !saberMascot) return;
        isEvolvingSaber = false;
        saberImg.src = 'assets/image/saber.png';
        
        saberSword.style.display = 'block';
        saberSword.style.visibility = 'visible';
        saberSword.style.opacity = '0';
        saberSword.style.transform = 'translateY(100px)';
        saberSword.style.left = '220px';
        saberSword.style.top = '';
        saberSword.style.bottom = '30px';

        saberMascot.style.display = 'flex';
        saberMascot.style.visibility = 'visible';
        saberMascot.style.opacity = '0';
        saberMascot.style.transform = 'translateY(100px)';
        saberMascot.style.left = '20px';
        saberMascot.style.top = '';
        saberMascot.style.bottom = '20px';

        gsap.to([saberMascot, saberSword], {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: 'back.out(1.7)', force3D: true,
            delay: 0.8
        });
    };

    // --- Saber Mover 交互 ---
    saberMascot.addEventListener('pointerdown', (e) => {
        if (isEvolvingSaber) return;
        isDraggingSaber = true;
        saberImg.src = 'assets/image/saber_lifted.png'; // "saber被提起来"
        saberImg.style.animation = 'none';

        sMascotStartX = e.clientX;
        sMascotStartY = e.clientY;
        const rect = saberMascot.getBoundingClientRect();
        sMascotInitialLeft = rect.left;
        sMascotInitialTop = rect.top;

        saberMascot.setPointerCapture(e.pointerId);
    });

    window.addEventListener('pointermove', (e) => {
        if (!isDraggingSaber) return;
        const dx = e.clientX - sMascotStartX;
        const dy = e.clientY - sMascotStartY;
        saberMascot.style.left = `${sMascotInitialLeft + dx}px`;
        saberMascot.style.top = `${sMascotInitialTop + dy}px`;
        saberMascot.style.bottom = 'auto'; // 解除底部约束
    });

    window.addEventListener('pointerup', () => {
        if (!isDraggingSaber) return;
        isDraggingSaber = false;
        if (!isEvolvingSaber) {
            saberImg.src = 'assets/image/saber.png';
        }
        saberImg.style.animation = 'miku-float 4s ease-in-out infinite';
    });

    // --- Excalibur 物品交互 ---
    saberSword.addEventListener('pointerdown', (e) => {
        if (isEvolvingSaber) return;
        isDraggingSword = true;
        saberSword.style.animation = 'none';
        sStartX = e.clientX;
        sStartY = e.clientY;
        const rect = saberSword.getBoundingClientRect();
        sInitialLeft = rect.left;
        sInitialTop = rect.top;
        saberSword.setPointerCapture(e.pointerId);
    });

    window.addEventListener('pointermove', (e) => {
        if (!isDraggingSword) return;
        const dx = e.clientX - sStartX;
        const dy = e.clientY - sStartY;
        saberSword.style.left = `${sInitialLeft + dx}px`;
        saberSword.style.top = `${sInitialTop + dy}px`;
        saberSword.style.bottom = 'auto';

        // 碰撞检测
        if (checkCollisionSaber(saberSword, saberMascot)) {
            triggerSaberEvolution();
        }
    });

    window.addEventListener('pointerup', () => {
        if (!isDraggingSword) return;
        isDraggingSword = false;
        saberSword.style.animation = 'leek-float 3s ease-in-out infinite';
    });
    
    function checkCollisionSaber(el1, el2) {
        const r1 = el1.getBoundingClientRect();
        const r2 = el2.getBoundingClientRect();
        return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
    }

    // 触发拔起圣剑回归主宇宙
    function triggerSaberEvolution() {
        if (saberSword.style.display === 'none' || isEvolvingSaber) return;
        isEvolvingSaber = true;

        saberSword.style.display = 'none';
        saberImg.src = 'assets/image/saber_excalibur.png'; // Saber + 大剑形态
        
        // 表现后撤退
        gsap.to(saberMascot, {
            opacity: 0,
            y: 40,
            duration: 1.5,
            ease: 'power2.inOut', force3D: true,
            onComplete: () => {
                saberMascot.style.visibility = 'hidden';
                saberMascot.style.display = 'none';
            }
        });

        // 斩断时空，返回 Miku 主世界
        if (window.switchBackground) {
            window.switchBackground();
        }
    }
}




// 启动打字机特效 - 显示当前时间（右下角）
function startTyped() {
    const typingElement = document.querySelector('.typing');
    
    // 格式化时间函数
    function formatTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return { hours, minutes, seconds, full: `${hours}:${minutes}:${seconds}` };
    }
    
    // 首次显示时间
    let currentTime = formatTime();
    typingElement.textContent = currentTime.full;
    
    // 每秒更新时间
    setInterval(() => {
        const newTime = formatTime();
        
        // 比较各部分，只更新变化的部分
        if (newTime.seconds !== currentTime.seconds) {
            // 秒变化 - 只更新秒部分
            const secondsPos = 6; // 秒在字符串中的位置
            typingElement.textContent = 
                typingElement.textContent.substring(0, secondsPos) + newTime.seconds;
        }
        
        if (newTime.minutes !== currentTime.minutes) {
            // 分变化 - 更新分和秒部分
            const minutesPos = 3; // 分在字符串中的位置
            typingElement.textContent = 
                typingElement.textContent.substring(0, minutesPos) + newTime.minutes + ':' + newTime.seconds;
        }
        
        if (newTime.hours !== currentTime.hours) {
            // 时变化 - 全部更新
            typingElement.textContent = newTime.full;
        }
        
        currentTime = newTime;
    }, 1000);
}

// 启动打字机特效 - 左上角（循环文字）
let topleftTyped = null;
function startTypedLeft() {
    if (topleftTyped) topleftTyped.destroy();
    
    // 根据背景切换文字
    const isBackground2 = videoSource.src.includes('background2.mp4');
    const strings = isBackground2 ? ["SABER", "ARTURIA"] : ["MIKU", "HATSUNE"];

    topleftTyped = new Typed('.typing-topleft', {
        strings: strings,
        loop: true,
        typeSpeed: 65,
        backSpeed: 65,
        showCursor: true,
        cursorChar: '|',
        typeCssClass: 'typed-text'
    });
}

// 简易 GPU 性能分级：核显/低端 → low，中端 → mid，独显 → high
const perfTier = (() => {
    try {
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2') || probe.getContext('webgl');
        if (!gl) return 'low';
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
        if (/geforce rtx|radeon rx|radeon (pro )?vega|arc/i.test(renderer)) return 'high';
        if (/intel|uhd|hd graphics|iris/i.test(renderer)) return 'low';
        return 'mid';
    } catch (e) {
        return 'low';
    }
})();

// 雨滴效果全局变量
let raindropFx = null;
let isRaindropActive = false;
let videoPausedForPanel = false;

// 液态玻璃兜底/低端 GPU 统一入口：使用硬件加速 CSS backdrop-filter 毛玻璃
function applyCssGlassFallback(panel) {
    panel.style.backdropFilter = 'blur(10px)';
    panel.style.webkitBackdropFilter = 'blur(10px)';
    panel.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    showProductsPanelAnim(panel);
}

// 切换雨滴效果（Products 面板开/关）
function toggleRaindrop() {
    const canvas = document.getElementById('raindropCanvas');
    const productsPanel = document.getElementById('productsPanel');
    const bgVideo = document.getElementById('bgVideo');
    isRaindropActive = !isRaindropActive;

    if (isRaindropActive) {
        // 清掉可能残留的毛玻璃内联样式，统一使用静态截图 + WebGL 玻璃
        productsPanel.style.backdropFilter = 'none';
        productsPanel.style.webkitBackdropFilter = 'none';
        productsPanel.style.backgroundColor = 'transparent';
        productsPanel.style.backgroundImage = 'none';

        // === 低端 GPU：完全跳过 WebGL RaindropFX，仅用 CSS 毛玻璃 ===
        if (perfTier === "low") {
            // 仍暂停视频以节省解码资源
            if (bgVideo && !bgVideo.paused) {
                bgVideo.pause();
                videoPausedForPanel = true;
            }
            applyCssGlassFallback(productsPanel);
            return;
        }

        // === 中/高端 GPU：WebGL 雨滴 + CSS 毛玻璃，但砍掉 WebGL 内部模糊步骤 ===
        captureFullScreen().then(backgroundImage => {
            if (!backgroundImage) {
                applyCssGlassFallback(productsPanel);
                return;
            }

            // 面板已用静态截图提供背景，暂停视频解码以大幅降低 GPU/CPU 占用
            if (bgVideo && !bgVideo.paused) {
                bgVideo.pause();
                videoPausedForPanel = true;
            }


            // 降低 WebGL 渲染分辨率以减轻 GPU 负担
            const resScale = perfTier === "mid" ? 0.65 : 0.85;
            canvas.width  = Math.round(window.innerWidth  * resScale);
            canvas.height = Math.round(window.innerHeight * resScale);

            if (raindropFx) raindropFx.stop();
            raindropFx = new RaindropFX({
                canvas: canvas,
                background: backgroundImage,
                gravity: perfTier === "mid" ? 650 : 800,
                dropletsPerSeconds: perfTier === "mid" ? 8 : 16,
                dropletSize: [8, 20],
                trailDropDensity: perfTier === "mid" ? 0.02 : 0.06,
                mist: false,                    // 全部关闭雾效，节省大量 GPU 着色
                backgroundBlurSteps: 0,          // 全部去掉 WebGL 内部模糊，用下面 CSS 替代
            });

            raindropFx.start();
            canvas.classList.add('active');

            // 用 CSS backdrop-filter 提供液态玻璃模糊效果（浏览器 GPU 合成器硬件加速，远轻于 WebGL 逐帧模糊）
            productsPanel.style.backdropFilter = 'blur(8px)';
            productsPanel.style.webkitBackdropFilter = 'blur(8px)';
            productsPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.18)';

            showProductsPanelAnim(productsPanel);
        }).catch(() => {
            applyCssGlassFallback(productsPanel);
        });
    } else {
        canvas.classList.remove('active');

        // 关闭面板后停止 WebGL 雨滴渲染，避免不可见时仍白跑 GPU
        if (raindropFx) {
            raindropFx.stop();
            raindropFx = null;
        }

        // 恢复被面板暂停的背景视频
        if (videoPausedForPanel && bgVideo) {
            bgVideo.play().catch(() => {});
            videoPausedForPanel = false;
        }

        productsPanel.style.backdropFilter = 'none';
        productsPanel.style.webkitBackdropFilter = 'none';
        productsPanel.style.backgroundColor = 'transparent';
        productsPanel.style.backgroundImage = 'none';

        // 隐藏产品面板
        productsPanel.classList.remove('active');
        // 清除尚未完成的入场动画，并重置所有的变换内联样式
        gsap.killTweensOf('.product-card');
        gsap.set('.product-card', { clearProps: 'all' });
    }
}

// 提取出的产品面板入场动画函数
function showProductsPanelAnim(panel) {
    panel.classList.add('active');
    
    // 使用 GSAP 平滑依次切入卡片
    gsap.fromTo('.product-card', 
        { y: 30, opacity: 0 }, 
        { 
            y: 0, 
            opacity: 1, 
            duration: 0.6, 
            stagger: 0.1, 
            ease: 'power3.out', force3D: true, force3D: true, 
            delay: 0.2,
            clearProps: 'transform' 
        }
    );
}


// 截取完整屏幕（包括所有元素）
function captureFullScreen() {
    return new Promise((resolve) => {
        try {
            // 临时隐藏雨滴 canvas
            const raindropCanvas = document.getElementById('raindropCanvas');
            const wasActive = raindropCanvas.classList.contains('active');
            raindropCanvas.classList.remove('active');

            // 截图尺寸封顶到 1.5x，降低纹理内存与编码耗时
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const captureCanvas = document.createElement('canvas');
            captureCanvas.width = window.innerWidth * dpr;
            captureCanvas.height = window.innerHeight * dpr;
            const ctx = captureCanvas.getContext('2d');
            ctx.scale(dpr, dpr);

            // 绘制视频帧（视频未就绪时跳过，避免 drawImage 抛异常导致面板无法打开）
            const video = document.querySelector('.video-background video');
            if (video && video.videoWidth && video.readyState >= 2) {
                const videoRatio = video.videoWidth / video.videoHeight;
                const screenRatio = window.innerWidth / window.innerHeight;
                let drawWidth, drawHeight, drawX, drawY;

                if (screenRatio > videoRatio) {
                    drawWidth = window.innerWidth;
                    drawHeight = window.innerWidth / videoRatio;
                    drawX = 0;
                    drawY = (window.innerHeight - drawHeight) / 2;
                } else {
                    drawHeight = window.innerHeight;
                    drawWidth = window.innerHeight * videoRatio;
                    drawX = (window.innerWidth - drawWidth) / 2;
                    drawY = 0;
                }

                ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);
            }

            // 绘制打字机文字 - 使用与实际 CSS 相同的位置
            drawTextToCanvas(ctx, '.typing-topleft', 50, 50);
            drawTextToCanvas(ctx, '.typing', window.innerWidth - 50, window.innerHeight - 50, 'right', 'bottom');

            // 恢复雨滴 canvas 状态
            if (wasActive) {
                raindropCanvas.classList.add('active');
            }

            const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.85);
            resolve(dataUrl);
        } catch (e) {
            console.warn('Canvas toDataURL failed (likely CORS or file:// protocol taint). Falling back to CSS blur.');
            resolve(null);
        }
    });
}

// 将文字绘制到 canvas
function drawTextToCanvas(ctx, selector, x, y, align = 'left', baseline = 'top') {
    const element = document.querySelector(selector);
    if (!element) {
        console.log('Element not found:', selector);
        return;
    }
    
    // 获取元素的实际显示文本
    let text = element.textContent || '';
    
    // 对于右下角时间，确保获取当前显示的时间
    if (selector === '.typing') {
        // 直接读取当前显示的时间文本
        text = element.innerText || element.textContent || '';
    }
    
    // 获取光标元素
    let cursorChar = '';
    const parent = element.parentElement;
    if (parent) {
        const cursor = parent.querySelector('.typed-cursor');
        if (cursor && cursor.style.display !== 'none') {
            cursorChar = '|';
        }
    }
    
    // 字体大小与 CSS 一致（56px）
    const fontSize = 56;
    
    ctx.font = `800 ${fontSize}px "General Sans", "Poppins", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    
    // 添加文字阴影效果（多层阴影模拟原 CSS 效果）
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.fillText(text + cursorChar, x, y);
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

// 导航栏交互
document.addEventListener('DOMContentLoaded', () => {
    const audioIndicator = document.getElementById('audioIndicator');
    const indicatorLines = audioIndicator.querySelectorAll('.indicator-line');
    const bgMusic = document.getElementById('bgMusic');
    let isAudioPlaying = false;

    // 默认音量调到 50%，比较柔和
    if (bgMusic) {
        bgMusic.volume = 0.5;
    }

    // 调试辅助：检查音频是否加载成功
    if (bgMusic) {
        bgMusic.addEventListener('error', (e) => {
            console.error('Audio element error:', bgMusic.error);
        });
        bgMusic.addEventListener('loadstart', () => console.log('Audio load start'));
        bgMusic.addEventListener('canplaythrough', () => console.log('Audio can play through'));
    }

    // 点击音频指示器切换状态（播放/暂停音乐）
    audioIndicator.addEventListener('click', () => {
        isAudioPlaying = !isAudioPlaying;
        
        console.log('Audio button clicked, isPlaying:', isAudioPlaying);
        
        if (isAudioPlaying) {
            indicatorLines.forEach((line, index) => {
                line.classList.add('active');
                line.style.animationDelay = `${index * 0.1}s`;
            });
            if (bgMusic) {
                const playPromise = bgMusic.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('Playback started successfully');
                    }).catch(error => {
                        console.error('Playback failed:', error);
                        // 如果因为浏览器策略拦截，则重置按钮状态
                        isAudioPlaying = false;
                        indicatorLines.forEach(line => line.classList.remove('active'));
                    });
                }
            }
        } else {
            indicatorLines.forEach(line => {
                line.classList.remove('active');
            });
            if (bgMusic) {
                bgMusic.pause();
                console.log('Playback paused');
            }
        }
    });

    // Products 按钮点击效果 - 切换雨滴
    const productsBtn = document.getElementById('productsBtn');
    const btnText1 = document.getElementById('btnText1');
    const btnText2 = document.getElementById('btnText2');
    
    productsBtn.addEventListener('click', () => {
        toggleRaindrop();
        
        // 添加切换动画类
        productsBtn.classList.add('switching');
        
        // 等待动画开始后再切换文字
        setTimeout(() => {
            if (isRaindropActive) {
                // 冻结界面显示 HOME
                btnText1.textContent = 'Home';
                btnText2.textContent = 'Home';
            } else {
                // 主界面显示 PRODUCTS
                btnText1.textContent = 'Products';
                btnText2.textContent = 'Products';
            }
        }, 200);
        
        // 动画结束后移除类
        setTimeout(() => {
            productsBtn.classList.remove('switching');
        }, 400);
    });

    // 背景视频切换逻辑
    const bgVideo = document.getElementById('bgVideo');
    const videoSource = document.getElementById('videoSource');
    let currentVideo = 'background.mp4';

    window.switchBackground = function() {
        if (!bgVideo) return;
        
        // 0. UI 退出画面动画 (向上滑出版)
        const uiElements = '.navbar-right, .navbar-left, .typing-topleft-container, .typing-container';
        gsap.to(uiElements, {
            opacity: 0,
            y: (i, el) => {
                // navbar-left 也向上滑出
                if (el.classList.contains('navbar-right') || el.classList.contains('typing-topleft-container') || el.classList.contains('navbar-left')) return -40;
                return 40; // 底部打字机向下滑出
            },
            // 取消原本 navbar-left 的左滑脱出
            duration: 0.8,
            ease: 'power2.in', force3D: true,
            stagger: 0.1
        });

        // 1. 背景淡出
        bgVideo.classList.add('video-fade-out');
        
        setTimeout(() => {
            // 切换路径
            currentVideo = (currentVideo === 'background.mp4') ? 'background2.mp4' : 'background.mp4';
            videoSource.src = `assets/video/${currentVideo}`;
            
            // 切换主题样式 (黑白)
            if (currentVideo === 'background2.mp4') {
                document.body.classList.add('dark-theme');
                // 加载并弹射 Saber 登场
                initSaberLogic();
                if (window.resetSaberState) window.resetSaberState();
            } else {
                document.body.classList.remove('dark-theme');
                // 重召 Miku 万象归流
                if (window.resetMikuState) window.resetMikuState();
            }

            // 重新刷新打字机文字
            startTypedLeft();

            // 重新加载并播放
            bgVideo.load();
            bgVideo.play();
            
            // 数据加载后再淡入
            bgVideo.oncanplay = () => {
                bgVideo.oncanplay = null; // 极度关键：防止视频 loop 时无限反复触发进场动画
                
                bgVideo.classList.remove('video-fade-out');

                // 若产品面板仍打开，切换背景后用新视频帧重建玻璃背景
                const productsPanel = document.getElementById('productsPanel');
                if (productsPanel && productsPanel.classList.contains('active')) {
                    captureFullScreen().then(backgroundImage => {
                        if (backgroundImage && raindropFx) {
                            raindropFx.setBackground(backgroundImage);
                        }
                    }).catch(() => {});
                }
                
                // 2. UI 重新流畅滑入
                // 确保 Products 按钮入场前重置到左侧，保持左进动作
                gsap.set('.navbar-left', { x: -40, y: 0 });
                
                gsap.to('.navbar-right', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', force3D: true, force3D: true, delay: 0.5 });
                gsap.to('.navbar-left', { opacity: 1, x: 0, duration: 1, ease: 'power3.out', force3D: true, force3D: true, delay: 0.6 });
                gsap.to('.typing-topleft-container, .typing-container', { 
                    opacity: 1, 
                    y: 0, 
                    duration: 1, 
            ease: 'power3.out', force3D: true,
                    delay: 0.7 
                });
            };
        }, 1000); 
    };




    // 导航链接点击效果
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            console.log(`Navigating to ${target}`);
            // 可以添加平滑滚动或其他交互
        });
    });
});
