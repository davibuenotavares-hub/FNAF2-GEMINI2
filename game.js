// --- Elementos HTML ---
const powerEl = document.getElementById('power');
const hourEl = document.getElementById('hour');
const musicBoxLevelEl = document.getElementById('music-box-level');
const officeDiv = document.getElementById('office');
const jumpscareDiv = document.getElementById('animatronic-jumpscare');

const maskBtn = document.getElementById('mask-btn');
const lightBtn = document.getElementById('light-btn');
const cameraBtn = document.getElementById('camera-btn');

const ductLeft = document.getElementById('duct-left');
const ductRight = document.getElementById('duct-right');
const hallwayDoor = document.getElementById('hallway-door');

const cameraFeed = document.getElementById('camera-feed');
const currentCameraView = document.getElementById('current-camera-view');
const cameraNameEl = document.getElementById('camera-name');
const animatronicPresenceCamEl = document.getElementById('animatronic-presence-cam');
const exitCameraBtn = document.getElementById('exit-camera-btn');
const camToggleBtns = document.querySelectorAll('.cam-toggle');

// --- Variáveis do Jogo ---
let power = 100;
let hour = 0;
let musicBoxLevel = 100;
let isMaskOn = false;
let isCameraUp = false;
let isLightOn = false; // Estado da lanterna

let gameInterval;
let powerDrainInterval;
let musicBoxDrainInterval;
let animatronicMoveInterval;

let currentCam = '1'; // Câmera inicial

// --- Configurações dos Animatrônicos ---
const animatronics = {
    'Toy Freddy': {
        location: 'CAM 1', // Posição inicial
        path: ['CAM 1', 'CAM 2', 'Corredor', 'Porta'], // Caminho até o escritório
        aggressiveness: 0.05, // Chance de se mover por ciclo
        jumpscareTrigger: 'Porta', // Onde ele ataca
        isInOffice: false // Se está no escritório para jumpscare
    },
    'Toy Bonnie': {
        location: 'CAM 3',
        path: ['CAM 3', 'Duto Direito', 'Duto D (Of.)'], // Duto D (Of.) significa Duto Direito no Escritório
        aggressiveness: 0.07,
        jumpscareTrigger: 'Duto D (Of.)',
        isInOffice: false
    },
    'Toy Chica': {
        location: 'CAM 2',
        path: ['CAM 2', 'Duto Esquerdo', 'Duto E (Of.)'], // Duto E (Of.) significa Duto Esquerdo no Escritório
        aggressiveness: 0.07,
        jumpscareTrigger: 'Duto E (Of.)',
        isInOffice: false
    },
    // Você pode adicionar Foxy, Mangle, Puppet aqui
};

// --- Mapeamento de Câmeras (para exibir as imagens) ---
const cameraImages = {
    'CAM 1': 'imgs/cam1.jpg',
    'CAM 2': 'imgs/cam2.jpg',
    'CAM 3': 'imgs/cam3.jpg',
    // ... adicione mais conforme tiver mais câmeras
};

// --- Sons (adicione arquivos .mp3 na pasta 'sounds') ---
const sounds = {
    'jumpscare': new Audio('sounds/jumpscare.mp3'),
    'mask_on': new Audio('sounds/mask_on.mp3'),
    'mask_off': new Audio('sounds/mask_off.mp3'),
    'camera_up': new Audio('sounds/camera_up.mp3'),
    'camera_down': new Audio('sounds/camera_down.mp3'),
    'wind_music_box': new Audio('sounds/wind_music_box.mp3'),
    'light_on': new Audio('sounds/light_on.mp3'),
    'light_off': new Audio('sounds/light_off.mp3')
};

// --- Funções de Inicialização e Fim de Jogo ---
function startGame() {
    updatePowerDisplay();
    updateMusicBoxDisplay();
    gameInterval = setInterval(gameLoop, 1000); // 1 segundo real
    powerDrainInterval = setInterval(drainPower, 2000); // Gasta energia a cada 2 segundos
    musicBoxDrainInterval = setInterval(drainMusicBox, 1500); // Gasta caixa de música
    animatronicMoveInterval = setInterval(moveAnimatronics, 7000); // Animatrônicos se movem a cada 7s
}

function endGame(reason) {
    clearInterval(gameInterval);
    clearInterval(powerDrainInterval);
    clearInterval(musicBoxDrainInterval);
    clearInterval(animatronicMoveInterval);

    officeDiv.classList.add('hidden');
    cameraFeed.classList.add('hidden');
    jumpscareDiv.classList.remove('hidden'); // Mostra a tela de jumpscare
    sounds.jumpscare.play();
    alert(reason); // Substitua por uma tela de Game Over mais elaborada
    setTimeout(() => location.reload(), 5000); // Reinicia o jogo após 5 segundos
}

// --- Funções de Atualização de UI ---
function updatePowerDisplay() {
    powerEl.innerText = power;
    if (power <= 0) {
        endGame("Sem energia! Fim de jogo.");
    }
}

function updateMusicBoxDisplay() {
    musicBoxLevelEl.innerText = Math.max(0, musicBoxLevel); // Não mostra negativo
    if (musicBoxLevel <= 0) {
        endGame("Puppet pegou você! Fim de jogo.");
    }
}

function updateCameraView() {
    currentCameraView.src = cameraImages[currentCam];
    cameraNameEl.innerText = `CAM ${currentCam}: ${getCameraRoomName(currentCam)}`;

    // Verifica se tem animatrônico na câmera atual
    const animsOnCam = Object.values(animatronics).filter(a => a.location === `CAM ${currentCam}`);
    if (animsOnCam.length > 0) {
        animatronicPresenceCamEl.classList.remove('hidden');
        animatronicPresenceCamEl.innerText = `${animsOnCam[0].name || 'Animatrônico'} detectado!`; // Exibe o primeiro encontrado
    } else {
        animatronicPresenceCamEl.classList.add('hidden');
    }
}

function getCameraRoomName(camNum) {
    switch(camNum) {
        case '1': return 'Corredor Principal';
        case '2': return 'Sala de Festas Esquerda';
        case '3': return 'Sala de Festas Direita';
        // Adicione mais nomes de câmeras
        default: return 'Desconhecido';
    }
}

// --- Lógica Principal do Jogo ---
function gameLoop() {
    // A cada 60s reais, avança 1h no jogo
    if (gameInterval % 60 === 0) {
        if (hour < 6) {
            hour++;
            hourEl.innerText = hour;
            if (hour === 6) {
                endGame("Você sobreviveu a noite!");
            }
        }
    }
}

function drainPower() {
    let drainRate = 1; // Dreno base
    if (isCameraUp) drainRate += 1;
    if (isLightOn) drainRate += 2; // Lanterna gasta mais
    if (isMaskOn) drainRate += 0.5; // Máscara também gasta um pouco

    power = Math.max(0, power - drainRate);
    updatePowerDisplay();
}

function drainMusicBox() {
    musicBoxLevel = Math.max(0, musicBoxLevel - 1); // Dreno constante se não for ativada
    updateMusicBoxDisplay();
}

// --- Lógica dos Animatrônicos ---
function moveAnimatronics() {
    for (const name in animatronics) {
        const anim = animatronics[name];

        // Se o animatrônico está no escritório (pronto para jumpscare)
        if (anim.isInOffice) {
            triggerJumpscare(name);
            return; // Um jumpscare por vez
        }

        // Se o animatrônico está no duto/corredor e pronto para entrar
        if (anim.jumpscareTrigger === 'Duto D (Of.)' && anim.location === 'Duto D (Of.)') {
            if (!isMaskOn) { // Se não está de máscara, jumpscare!
                anim.isInOffice = true;
                triggerJumpscare(name);
                return;
            } else {
                // Se está de máscara, ele recua ou espera
                // Por simplicidade, ele recua uma posição
                const currentPathIndex = anim.path.indexOf(anim.location);
                if (currentPathIndex > 0) {
                    anim.location = anim.path[currentPathIndex - 1];
                }
            }
        }
        if (anim.jumpscareTrigger === 'Duto E (Of.)' && anim.location === 'Duto E (Of.)') {
             if (!isMaskOn) {
                anim.isInOffice = true;
                triggerJumpscare(name);
                return;
            } else {
                const currentPathIndex = anim.path.indexOf(anim.location);
                if (currentPathIndex > 0) {
                    anim.location = anim.path[currentPathIndex - 1];
                }
            }
        }
        if (anim.jumpscareTrigger === 'Porta' && anim.location === 'Porta') {
            // No FNaF 2, Toy Freddy não é bloqueado por máscara na porta, você usa a lanterna
            // Para simplificar, se ele chegar na porta, jumpscare se a lanterna não for usada ativamente
            // Vamos fazer ele recuar por enquanto, como se fosse assustado pela lanterna (que ainda não tem lógica avançada)
            // Ou simplesmente pular para jumpscare se você não "checar"
            // Por enquanto, se ele chegou na porta e não tem mecânica de lanterna, ele te pega.
            anim.isInOffice = true;
            triggerJumpscare(name);
            return;
        }


        // Movimento geral dos animatrônicos
        if (Math.random() < anim.aggressiveness) {
            const currentPathIndex = anim.path.indexOf(anim.location);
            if (currentPathIndex !== -1 && currentPathIndex < anim.path.length - 1) {
                anim.location = anim.path[currentPathIndex + 1];
                console.log(`${name} se moveu para ${anim.location}`); // Debug
            }
        }
    }
}

function triggerJumpscare(animName) {
    if (isCameraUp) { // Baixa as câmeras automaticamente para o jumpscare
        toggleCameras();
    }
    // O jumpscare será handled pela função endGame
    endGame(`Jumpscare de ${animName}!`);
}


// --- Eventos de UI ---

// Máscara
maskBtn.addEventListener('touchstart', () => {
    isMaskOn = !isMaskOn;
    officeDiv.classList.toggle('mask-active', isMaskOn);
    maskBtn.innerText = isMaskOn ? "TIRAR MÁSCARA" : "MÁSCARA";
    if (isMaskOn) {
        sounds.mask_on.play();
        // Se a câmera estiver levantada, abaixa automaticamente
        if (isCameraUp) toggleCameras();
        // Desliga a lanterna
        if (isLightOn) toggleLight();
    } else {
        sounds.mask_off.play();
    }
});

// Lanterna
lightBtn.addEventListener('touchstart', () => {
    toggleLight();
});

function toggleLight() {
    isLightOn = !isLightOn;
    if (isLightOn) {
        officeDiv.style.filter = "brightness(1.5)"; // Simples efeito de lanterna
        sounds.light_on.play();
        // Se a máscara estiver ativa, tira ela
        if (isMaskOn) toggleMask();
        // Se a câmera estiver levantada, abaixa
        if (isCameraUp) toggleCameras();
    } else {
        officeDiv.style.filter = "none";
        sounds.light_off.play();
    }
}


// Câmeras
cameraBtn.addEventListener('touchstart', toggleCameras);
exitCameraBtn.addEventListener('touchstart', toggleCameras);

function toggleCameras() {
    isCameraUp = !isCameraUp;
    if (isCameraUp) {
        cameraFeed.classList.remove('hidden');
        officeDiv.classList.add('hidden');
        sounds.camera_up.play();
        updateCameraView();
        // Desativa máscara e lanterna ao levantar câmera
        if (isMaskOn) toggleMask();
        if (isLightOn) toggleLight();
    } else {
        cameraFeed.classList.add('hidden');
        officeDiv.classList.remove('hidden');
        sounds.camera_down.play();
    }
}

camToggleBtns.forEach(btn => {
    btn.addEventListener('touchstart', () => {
        currentCam = btn.dataset.cam;
        updateCameraView();
    });
});

// Dutos e Corredor (Verificação de Animatrônicos)
ductLeft.addEventListener('touchstart', () => {
    const anim = animatronics['Toy Chica']; // Exemplo, ajuste conforme a IA
    if (anim.location === 'Duto Esquerdo' || anim.location === 'Duto E (Of.)') {
        alert(`Duto Esquerdo: ${anim.location}`);
    } else {
        alert('Duto Esquerdo: Vazio.');
    }
});

ductRight.addEventListener('touchstart', () => {
    const anim = animatronics['Toy Bonnie']; // Exemplo
    if (anim.location === 'Duto Direito' || anim.location === 'Duto D (Of.)') {
        alert(`Duto Direito: ${anim.location}`);
    } else {
        alert('Duto Direito: Vazio.');
    }
});

hallwayDoor.addEventListener('touchstart', () => {
    const anim = animatronics['Toy Freddy']; // Exemplo
    if (anim.location === 'Corredor' || anim.location === 'Porta') {
        alert(`Corredor: ${anim.location}`);
    } else {
        alert('Corredor: Vazio.');
    }
    // Aqui você pode adicionar a lógica da lanterna para afastar Foxy, etc.
});

// Caixa de Música (Reiniciar/Dar corda)
musicBoxLevelEl.parentElement.addEventListener('touchstart', () => {
    if (isCameraUp) { // Só pode dar corda nas câmeras
        musicBoxLevel = 100;
        updateMusicBoxDisplay();
        sounds.wind_music_box.play();
        alert('Caixa de Música reiniciada!');
    } else {
        alert('Levante as câmeras para dar corda na caixa de música!');
    }
});


// --- Iniciar o Jogo ---
startGame();
