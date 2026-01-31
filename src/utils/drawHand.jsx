const drawHand = (predictions, ctx, canvasWidth, mirrored = false) => {
  // Clear canvas sebelum menggambar
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if (predictions.length > 0) {
    predictions.forEach((prediction) => {
      const landmarks = prediction.keypoints;

      // Gambar titik-titik (dots)
      for (let i = 0; i < landmarks.length; i++) {
        // Flip x coordinate jika mirrored
        const x = mirrored ? canvasWidth - landmarks[i].x : landmarks[i].x;
        const y = landmarks[i].y;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "aqua";
        ctx.fill();
      }

      // Gambar garis penghubung antar landmark
      const fingerJoints = [
        [0, 1, 2, 3, 4],       // Thumb
        [0, 5, 6, 7, 8],       // Index finger
        [0, 9, 10, 11, 12],    // Middle finger
        [0, 13, 14, 15, 16],   // Ring finger
        [0, 17, 18, 19, 20],   // Pinky
        [5, 9, 13, 17]         // Palm
      ];

      fingerJoints.forEach((finger) => {
        for (let j = 0; j < finger.length - 1; j++) {
          const firstJointIndex = finger[j];
          const secondJointIndex = finger[j + 1];

          const x1 = mirrored ? canvasWidth - landmarks[firstJointIndex].x : landmarks[firstJointIndex].x;
          const y1 = landmarks[firstJointIndex].y;
          const x2 = mirrored ? canvasWidth - landmarks[secondJointIndex].x : landmarks[secondJointIndex].x;
          const y2 = landmarks[secondJointIndex].y;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = "lime";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    });
  }
};

export { drawHand }