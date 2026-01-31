import selamatAudio from '../assets/audio/selamat.mp3'
import berjuangAudio from '../assets/audio/berjuang.mp3'
import suksesAudio from '../assets/audio/sukses.mp3'
import hidupJokowi from '../assets/audio/hidup-jokowi.mp3'

const audioAssets = {
    selamat: new Audio(selamatAudio),
    berjuang: new Audio(berjuangAudio),
    sukses: new Audio(suksesAudio),
    hidupJokowi: new Audio(hidupJokowi)
}

// 1. Variabel untuk melacak status audio
let isPlaying = false; 
let lastPose = null;

const poseDetect = (hands) => {
    const wrist = hands[0];
    const thumbMcp = hands[2];
    const thumbIp = hands[3];
    const thumbTip = hands[4];
    const indexMcp = hands[5];
    const indexPip = hands[6];
    const indexDip = hands[7];
    const indexTip = hands[8];
    const middleMcp = hands[9];
    const middlePip = hands[10];
    const middleDip = hands[11];
    const middleTip = hands[12];
    const ringMcp = hands[13];
    const ringPip = hands[14];
    const ringDip = hands[15];
    const ringTip = hands[16];
    const pinkyMcp = hands[17];
    const pinkyPip = hands[18];
    const pinkyDip = hands[19];
    const pinkyTip = hands[20];

    let currentPose = null

    if (indexMcp.y > indexTip.y &&
        middleMcp.y < middleTip.y &&
        ringMcp.y < ringTip.y &&
        pinkyMcp.y > pinkyTip.y
    ) {
        currentPose = "selamat"
    }
    if (indexMcp.y < indexTip.y &&
        middleMcp.y < middleTip.y &&
        ringMcp.y < ringTip.y &&
        pinkyMcp.y < pinkyTip.y &&
        thumbIp.y > indexPip.y
    ) {
        currentPose = "berjuang"
    }
    if (thumbIp.y < indexPip.y &&
        thumbIp.y < middlePip.y &&
        thumbIp.y < ringPip.y &&
        thumbIp.y < pinkyPip.y
    ) {
        currentPose = "sukses"
    }
    if(indexMcp.y > indexTip.y &&
        middleMcp.y > middleTip.y &&
        ringMcp.y > ringTip.y &&
        pinkyMcp.y > pinkyTip.y &&
        thumbIp.y > indexPip.y
    ){
        currentPose = "hidupJokowi"
    }

    // Logika Trigger Audio
    if (currentPose != lastPose) {
        if (currentPose) {
            console.log(`Pose baru terdeteksi: ${currentPose}`);
            // Panggil fungsi playSound
            playSound(currentPose);
        } else {
            console.log("Pose reset (netral)");
        }
    }
    lastPose = currentPose
}

function playSound(poseName) {
    // 2. CEK STATUS: Jika sedang ada audio diputar, jangan lakukan apapun (return)
    if (isPlaying) {
        console.log("Audio sedang berjalan, mengabaikan pose baru.");
        return;
    }

    const audio = audioAssets[poseName]
    
    if (audio) {
        // 3. SET STATUS: Tandai bahwa audio sedang berjalan
        isPlaying = true;
        
        audio.currentTime = 0; // Reset ke awal
        audio.play().catch(err => {
            console.error("Error playing audio:", err);
            // Jika error (misal autoplay policy), kita harus reset flag agar tidak macet
            isPlaying = false; 
        });

        // 4. RESET STATUS: Ketika audio selesai, ubah isPlaying menjadi false
        audio.onended = () => {
            console.log(`Audio ${poseName} selesai.`);
            isPlaying = false;
        };
    }
}

export { poseDetect }